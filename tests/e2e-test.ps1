# =====================================================================
#  HappyMart - End-to-End test
#  Dang ky -> Dang nhap -> San pham -> Gio hang -> Dat don (COD) -> Staff xu ly
#  -> Hoa don -> Review -> VNPay (gia lap IPN) -> Huy don -> POS -> Admin CRUD -> Khuyen mai
#
#  Chay:  powershell -ExecutionPolicy Bypass -File .\e2e-test.ps1
#  Yeu cau: 5 service dang chay. Script GHI DU LIEU THAT vao DB local.
# =====================================================================

# ----------------------------- CAU HINH ------------------------------
$Accounts = @{
    Admin = @{ Phone = "0901234567"; Password = "Admin@123" }
    Staff = @{ Phone = "0978123456"; Password = "Staff@123" }
    Other = @{ Phone = "0912345678"; Password = "Customer@123" }   # khach khac (test cheo quyen)
    Fallback = @{ Phone = "0987654321"; Password = "Customer@123" } # dung neu dang ky that bai
}

$Catalog = "http://localhost:5001/api"
$Order   = "http://localhost:5002/api"
$Payment = "http://localhost:5003/api"
$Review  = "http://localhost:5004/api"
$User    = "http://localhost:5005/api"

$Backend     = Join-Path $PSScriptRoot "..\backend\StoreManagementAPI"
$PaymentProj = Join-Path $Backend "PaymentService.API"
$OrderProj   = Join-Path $Backend "OrderServiceAPI"
# ---------------------------------------------------------------------

$ErrorActionPreference = "Continue"
$Results = New-Object System.Collections.Generic.List[object]
$Section = ""
$RunTag  = Get-Date -Format "MMddHHmmss"

# ============================ HELPERS =================================
function Parse-Json([string]$raw) {
    if ([string]::IsNullOrWhiteSpace($raw)) { return $null }
    try { return ($raw | ConvertFrom-Json) } catch { return $null }
}

function Api {
    param([string]$Method, [string]$Url, [string]$Token, $Body, [hashtable]$Headers = @{})
    $h = @{} + $Headers
    if ($Token) { $h["Authorization"] = "Bearer $Token" }
    $p = @{ Method = $Method; Uri = $Url; Headers = $h; UseBasicParsing = $true; ErrorAction = "Stop" }
    if ($null -ne $Body) {
        $p.Body = [System.Text.Encoding]::UTF8.GetBytes(($Body | ConvertTo-Json -Depth 6))
        $p.ContentType = "application/json; charset=utf-8"
    }
    try {
        $r = Invoke-WebRequest @p
        $raw = [System.Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray())
        return @{ Status = [int]$r.StatusCode; Json = (Parse-Json $raw); Raw = $raw }
    } catch {
        if ($_.Exception.Response) {
            $raw = if ($_.ErrorDetails) { $_.ErrorDetails.Message } else { "" }
            return @{ Status = [int]$_.Exception.Response.StatusCode.value__; Json = (Parse-Json $raw); Raw = $raw }
        }
        return @{ Status = 0; Json = $null; Raw = $_.Exception.Message }
    }
}

# Rate limit "auth": 5 request / phut / IP (login, otp/send, register, reset-password)
$AuthCalls = New-Object System.Collections.Generic.List[datetime]
function AuthApi {
    param([string]$Method, [string]$Url, $Body)
    $now = Get-Date
    $recent = @($AuthCalls | Where-Object { ($now - $_).TotalSeconds -lt 61 })
    if ($recent.Count -ge 5) {
        $wait = [math]::Ceiling(61 - ($now - $recent[0]).TotalSeconds) + 1
        Write-Host "   ... cho $wait giay (rate limit dang nhap/dang ky 5 lan/phut)" -ForegroundColor DarkGray
        Start-Sleep -Seconds $wait
    }
    $AuthCalls.Add((Get-Date))
    $r = Api $Method $Url $null $Body
    if ($r.Status -eq 429) {
        Write-Host "   ... bi 429, cho 62 giay roi thu lai" -ForegroundColor DarkGray
        Start-Sleep -Seconds 62
        $AuthCalls.Clear(); $AuthCalls.Add((Get-Date))
        $r = Api $Method $Url $null $Body
    }
    return $r
}

function Record([string]$Id, [string]$Name, [string]$Exp, [string]$Act, [string]$Result, [string]$Note = "") {
    $color = @{ PASS = "Green"; FAIL = "Red"; SKIP = "Yellow"; GAP = "Magenta" }[$Result]
    $line = "[{0}] {1,-5} {2,-58} expect {3,-10} got {4}" -f $Result, $Id, $Name, $Exp, $Act
    if ($Note) { $line += "  ($Note)" }
    Write-Host $line -ForegroundColor $color
    $Results.Add([pscustomobject]@{ Section = $Section; Id = $Id; Test = $Name; Expected = $Exp; Actual = $Act; Result = $Result; Note = $Note })
}

# Kiem tra HTTP status
function T([string]$Id, [string]$Name, [int[]]$Expect, [hashtable]$Res, [switch]$Gap) {
    $ok = $Expect -contains $Res.Status
    $note = ""
    if (-not $ok -and $Res.Json -and $Res.Json.message) { $note = [string]$Res.Json.message }
    elseif (-not $ok -and $Res.Status -eq 0) { $note = "service khong phan hoi" }
    $result = if ($ok) { "PASS" } elseif ($Gap) { "GAP" } else { "FAIL" }
    Record $Id $Name ($Expect -join "/") $Res.Status $result $note
    return $ok
}

# Kiem tra dieu kien nghiep vu
function A([string]$Id, [string]$Name, [bool]$Cond, [string]$Exp, [string]$Act) {
    Record $Id $Name $Exp $Act $(if ($Cond) { "PASS" } else { "FAIL" })
    return $Cond
}

function Skip([string]$Id, [string]$Name, [string]$Why) { Record $Id $Name "-" "-" "SKIP" $Why }

function Head([string]$t) { $script:Section = $t; Write-Host "`n=== $t ===" -ForegroundColor Cyan }

function Stock([int]$productId) { $r = Api GET "$Catalog/products/$productId" $null; if ($r.Json) { return [int]$r.Json.quantityInStock } else { return -1 } }

function ToList($x) { if ($null -eq $x) { return @() }; return @($x) }

# ---- VNPay: ky giong VnPayHelper (Ordinal sort, bo rong, WebUtility.UrlEncode, HMACSHA512) ----
function VnpQuery([hashtable]$data) {
    $keys = [string[]]@($data.Keys | Where-Object { -not [string]::IsNullOrEmpty($data[$_]) })
    [Array]::Sort($keys, [StringComparer]::Ordinal)
    return ($keys | ForEach-Object { "{0}={1}" -f [System.Net.WebUtility]::UrlEncode($_), [System.Net.WebUtility]::UrlEncode([string]$data[$_]) }) -join "&"
}
function HmacSha512([string]$key, [string]$data) {
    $h = New-Object System.Security.Cryptography.HMACSHA512 (, [System.Text.Encoding]::UTF8.GetBytes($key))
    return -join ($h.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($data)) | ForEach-Object { $_.ToString("x2") })
}
function UrlParams([string]$url) {
    $d = @{}
    foreach ($pair in ($url.Split("?", 2)[1]).Split("&")) {
        $kv = $pair.Split("=", 2)
        $d[[System.Net.WebUtility]::UrlDecode($kv[0])] = [System.Net.WebUtility]::UrlDecode($kv[1])
    }
    return $d
}

# ============================ 0. KIEM TRA ==============================
Head "0. Chuan bi"
$svc = [ordered]@{ Catalog = "$Catalog/products?pageSize=1"; Order = "$Order/Order"; Payment = "$Payment/Payment"; Review = "$Review/Reviews"; User = "$User/Auth/me" }
$down = @()
foreach ($k in $svc.Keys) { if ((Api GET $svc[$k] $null).Status -eq 0) { $down += $k } }
if ($down.Count) { Write-Host "Service chua chay: $($down -join ', '). Bat len roi chay lai." -ForegroundColor Red; exit 1 }
Write-Host "  5 service dang chay."

# Doc InternalApi:Key tu user-secrets cua OrderService (fallback: appsettings.json)
$InternalKey = $null
$lines = & dotnet user-secrets list --project $OrderProj 2>$null
foreach ($l in $lines) { if ($l -match '^\s*InternalApi:Key\s*=\s*(.+?)\s*$') { $InternalKey = $Matches[1] } }
if (-not $InternalKey) { $InternalKey = (Get-Content (Join-Path $OrderProj "appsettings.json") -Raw -Encoding UTF8 | ConvertFrom-Json).InternalApi.Key }
if (-not $InternalKey) { $InternalKey = Read-Host "  Khong doc duoc InternalApi:Key. Dan key" }
$KeyHdr = @{ "X-Internal-Key" = $InternalKey }

$HashSecret = $null
try {
    $lines = & dotnet user-secrets list --project $PaymentProj 2>$null
    foreach ($l in $lines) { if ($l -match '^\s*VnPay:HashSecret\s*=\s*(.+?)\s*$') { $HashSecret = $Matches[1] } }
} catch { }
if (-not $HashSecret) { $HashSecret = Read-Host "  Khong doc duoc VnPay:HashSecret tu user-secrets. Dan HashSecret (Enter de bo qua VNPay)" }
Write-Host ("  VNPay HashSecret: {0}" -f $(if ($HashSecret) { "da co" } else { "khong co -> bo qua phan VNPay" }))

# ============================ 1. DANG NHAP =============================
Head "1. Dang nhap"
$S = @{}
foreach ($k in "Admin", "Staff", "Other") {
    $r = AuthApi POST "$User/Auth/login" @{ phone = $Accounts[$k].Phone; password = $Accounts[$k].Password }
    if (T "1.$($S.Count + 1)" "Login $k" @(200) $r) { $S[$k] = @{ Token = $r.Json.token; Id = [int]$r.Json.userId; Role = $r.Json.role } }
}
if ($S.Count -lt 3) { Write-Host "Khong dang nhap duoc tai khoan mau. Dung lai." -ForegroundColor Red; exit 1 }
A "1.4" "Role tra ve dung" ($S.Admin.Role -eq "Admin" -and $S.Staff.Role -eq "Staff" -and $S.Other.Role -eq "Customer") "Admin/Staff/Customer" "$($S.Admin.Role)/$($S.Staff.Role)/$($S.Other.Role)" | Out-Null
T "1.5" "Login sai mat khau" @(401) (AuthApi POST "$User/Auth/login" @{ phone = $Accounts.Other.Phone; password = "Wrong@999" }) | Out-Null
$me = Api GET "$User/Auth/me" $S.Other.Token
T "1.6" "GET /Auth/me co token" @(200) $me | Out-Null
T "1.7" "GET /Auth/me khong token" @(401) (Api GET "$User/Auth/me" $null) | Out-Null

# ============================ 2. DANG KY ===============================
Head "2. Dang ky (OTP)"
$NewPhone = "098" + (Get-Random -Minimum 1000000 -Maximum 9999999)
$NewPass  = "Test@123"
$Main = $null

T "2.1" "Gui OTP dang ky cho SDT da ton tai" @(409) (AuthApi POST "$User/Otp/send" @{ phone = $Accounts.Other.Phone; purpose = "Register" }) | Out-Null
$send = AuthApi POST "$User/Otp/send" @{ phone = $NewPhone; purpose = "Register" }
if (T "2.2" "Gui OTP dang ky ($NewPhone)" @(200) $send) {
    Write-Host "`n  >>> Mo cua so UserService, tim dong log chua SDT $NewPhone, copy ma 6 so." -ForegroundColor White
    $code = (Read-Host "  >>> Nhap OTP").Trim()
    T "2.3" "Verify OTP sai" @(400) (Api POST "$User/Otp/verify" $null @{ phone = $NewPhone; purpose = "Register"; code = "000000" }) | Out-Null
    $ver = Api POST "$User/Otp/verify" $null @{ phone = $NewPhone; purpose = "Register"; code = $code }
    if (T "2.4" "Verify OTP dung" @(200) $ver) {
        $vt = $ver.Json.verificationToken
        T "2.5" "Register voi verificationToken gia" @(400) (AuthApi POST "$User/Auth/register" @{ fullName = "E2E Test"; phone = $NewPhone; password = $NewPass; verificationToken = "fake-token" }) | Out-Null
        $reg = AuthApi POST "$User/Auth/register" @{ fullName = "E2E Test $RunTag"; phone = $NewPhone; password = $NewPass; verificationToken = $vt }
        if (T "2.6" "Register thanh cong" @(200) $reg) {
            T "2.7" "Register lai cung SDT" @(409) (AuthApi POST "$User/Auth/register" @{ fullName = "Dup"; phone = $NewPhone; password = $NewPass; verificationToken = $vt }) | Out-Null
            $lg = AuthApi POST "$User/Auth/login" @{ phone = $NewPhone; password = $NewPass }
            if (T "2.8" "Login tai khoan moi" @(200) $lg) {
                A "2.9" "Tai khoan moi co role Customer" ($lg.Json.role -eq "Customer") "Customer" $lg.Json.role | Out-Null
                $Main = @{ Token = $lg.Json.token; Id = [int]$lg.Json.userId; Phone = $NewPhone; Password = $NewPass }
                $NewPass2 = "Test@456"
                T "2.10" "Doi mat khau" @(200, 204) (Api PUT "$User/Auth/change-password" $Main.Token @{ currentPassword = $NewPass; newPassword = $NewPass2; confirmNewPassword = $NewPass2 }) | Out-Null
                $lg2 = AuthApi POST "$User/Auth/login" @{ phone = $NewPhone; password = $NewPass2 }
                if (T "2.11" "Login bang mat khau moi" @(200) $lg2) { $Main.Token = $lg2.Json.token; $Main.Password = $NewPass2 }
            }
        }
    }
}
if (-not $Main) {
    Write-Host "  Dang ky khong thanh cong -> dung tai khoan du phong $($Accounts.Fallback.Phone) cho cac buoc sau." -ForegroundColor Yellow
    $r = AuthApi POST "$User/Auth/login" @{ phone = $Accounts.Fallback.Phone; password = $Accounts.Fallback.Password }
    if ($r.Status -ne 200) { Write-Host "Khong login duoc tai khoan du phong. Dung lai." -ForegroundColor Red; exit 1 }
    $Main = @{ Token = $r.Json.token; Id = [int]$r.Json.userId; Phone = $Accounts.Fallback.Phone }
}
Write-Host "  Khach hang chinh: userId=$($Main.Id)"

# ============================ 3. SAN PHAM ==============================
Head "3. Xem san pham"
$pl = Api GET "$Catalog/products?page=1&pageSize=50" $null
T "3.1" "GET /products (phan trang)" @(200) $pl | Out-Null
$products = ToList $pl.Json.items
A "3.2" "Co san pham trong DB" ($products.Count -gt 0) ">0" $products.Count | Out-Null

# Chon san pham con hang >= 10 va khach chinh chua review
$P = $null
foreach ($pr in $products) {
    if ([int]$pr.quantityInStock -lt 10 -or $pr.status -ne "Active") { continue }
    $rv = Api GET "$Review/Reviews/product/$($pr.productId)" $null
    $mine = ToList $rv.Json | Where-Object { [int]$_.userId -eq $Main.Id }
    if (-not $mine) { $P = $pr; break }
}
if (-not $P) { Write-Host "Khong tim thay san pham Active con >= 10 cai. Dung lai." -ForegroundColor Red; exit 1 }
$ProdId = [int]$P.productId; $Price = [decimal]$P.salePrice
Write-Host "  San pham test: #$ProdId $($P.productName) | gia $Price | ton $($P.quantityInStock)"

T "3.3" "GET /products/{id}" @(200) (Api GET "$Catalog/products/$ProdId" $null) | Out-Null
T "3.4" "GET /products/{id} khong ton tai" @(404) (Api GET "$Catalog/products/99999999" $null) | Out-Null
$kw = [uri]::EscapeDataString(($P.productName -split " ")[0])
T "3.5" "Tim kiem theo keyword" @(200) (Api GET "$Catalog/products?keyword=$kw" $null) | Out-Null
T "3.6" "GET /categories" @(200) (Api GET "$Catalog/categories" $null) | Out-Null
T "3.7" "GET /products/category/{id}" @(200) (Api GET "$Catalog/products/category/$($P.categoryId)" $null) | Out-Null

# ============================ 4. GIO HANG ==============================
Head "4. Gio hang"
Api DELETE "$Order/Cart/$($Main.Id)" $Main.Token | Out-Null
T "4.1" "Them vuot ton kho" @(400, 409) (Api POST "$Order/Cart/items" $Main.Token @{ userId = $Main.Id; productId = $ProdId; quantity = 999999 }) | Out-Null
T "4.2" "Them san pham khong ton tai" @(404) (Api POST "$Order/Cart/items" $Main.Token @{ userId = $Main.Id; productId = 99999999; quantity = 1 }) | Out-Null
$add = Api POST "$Order/Cart/items" $Main.Token @{ userId = $Main.Id; productId = $ProdId; quantity = 1 }
T "4.3" "Them 1 san pham vao gio" @(200) $add | Out-Null
$item = (ToList $add.Json.items) | Where-Object { [int]$_.productId -eq $ProdId } | Select-Object -First 1
$upd = Api PUT "$Order/Cart/items/$($item.cartDetailId)" $Main.Token @{ quantity = 2 }
T "4.4" "Cap nhat so luong = 2" @(200) $upd | Out-Null
A "4.5" "Tong gio hang = gia x 2" ([decimal]$upd.Json.totalAmount -eq $Price * 2) ($Price * 2) $upd.Json.totalAmount | Out-Null
T "4.6" "Khach khac sua item nay" @(403) (Api PUT "$Order/Cart/items/$($item.cartDetailId)" $S.Other.Token @{ quantity = 5 }) | Out-Null

# ============================ 5. DAT HANG COD ==========================
Head "5. Dat hang COD"
$stock0 = Stock $ProdId
$co = Api POST "$Order/Order/checkout" $Main.Token @{ userId = 0; receiverName = "E2E Test"; receiverPhone = $Main.Phone; shippingAddress = "123 Test, Q1, HCM"; paymentMethod = "COD" }
$O1 = $null
if (T "5.1" "Checkout COD" @(200) $co) {
    $O1 = [int]$co.Json.orderId
    A "5.2" "Don thuoc ve khach chinh (userId tu token)" ([int]$co.Json.userId -eq $Main.Id) $Main.Id $co.Json.userId | Out-Null
    A "5.3" "Trang thai ban dau Pending/Pending" ($co.Json.orderStatus -eq "Pending" -and $co.Json.paymentStatus -eq "Pending") "Pending/Pending" "$($co.Json.orderStatus)/$($co.Json.paymentStatus)" | Out-Null
    A "5.4" "finalAmount = gia x 2 + 30000 ship" ([decimal]$co.Json.finalAmount -eq $Price * 2 + 30000) ($Price * 2 + 30000) $co.Json.finalAmount | Out-Null
    $cart = Api GET "$Order/Cart/$($Main.Id)" $Main.Token
    A "5.5" "Gio hang trong sau checkout" ((ToList $cart.Json.items).Count -eq 0) 0 (ToList $cart.Json.items).Count | Out-Null
    A "5.6" "Chua tru kho khi moi dat (Pending)" ((Stock $ProdId) -eq $stock0) $stock0 (Stock $ProdId) | Out-Null
    $pay = Api POST "$Payment/Payment" $Main.Token @{ orderId = $O1; paymentMethod = "COD" }
    T "5.7" "Tao payment COD" @(201) $pay | Out-Null
    A "5.8" "Payment COD o trang thai Pending" ($pay.Json.status -eq "Pending") "Pending" $pay.Json.status | Out-Null
    T "5.9" "Payment method khong hop le" @(400) (Api POST "$Payment/Payment" $Main.Token @{ orderId = $O1; paymentMethod = "Bitcoin" }) | Out-Null
    $hist = Api GET "$Order/Order/user/$($Main.Id)" $Main.Token
    $inHist = [bool](ToList $hist.Json | Where-Object { [int]$_.orderId -eq $O1 })
    A "5.10" "Don xuat hien trong lich su" $inHist "co" $(if ($inHist) { "co" } else { "khong" }) | Out-Null
}
T "5.11" "Checkout khi gio trong" @(400) (Api POST "$Order/Order/checkout" $Main.Token @{ receiverName = "x"; receiverPhone = "x"; shippingAddress = "x"; paymentMethod = "COD" }) | Out-Null

# ============================ 6. STAFF XU LY ===========================
Head "6. Staff xu ly don"
if ($O1) {
    T "6.1" "Khach tu doi trang thai don" @(403) (Api PUT "$Order/Order/$O1/status" $Main.Token @{ status = "Completed" }) | Out-Null
    T "6.2" "Staff xem tat ca don" @(200) (Api GET "$Order/Order" $S.Staff.Token) | Out-Null
    $s1 = Stock $ProdId
    T "6.3" "Staff xac nhan don (Confirmed)" @(204) (Api PUT "$Order/Order/$O1/status" $S.Staff.Token @{ status = "Confirmed" }) | Out-Null
    A "6.4" "Tru kho 2 khi Confirmed" ((Stock $ProdId) -eq $s1 - 2) ($s1 - 2) (Stock $ProdId) | Out-Null
    T "6.5" "Staff chuyen Shipping" @(204) (Api PUT "$Order/Order/$O1/status" $S.Staff.Token @{ status = "Shipping" }) | Out-Null
    T "6.6" "API Invoice da bi go bo" @(404) (Api POST "$Order/Invoice/from-order/$O1" $S.Staff.Token) | Out-Null
    T "6.7" "Staff chuyen Completed" @(204) (Api PUT "$Order/Order/$O1/status" $S.Staff.Token @{ status = "Completed" }) | Out-Null
    $o = Api GET "$Order/Order/$O1" $Main.Token
    A "6.8" "Don o trang thai Completed" ($o.Json.orderStatus -eq "Completed") "Completed" $o.Json.orderStatus | Out-Null
    T "6.9" "Huy don da Completed" @(409) (Api PUT "$Order/Order/$O1/cancel" $Main.Token) | Out-Null
    $s9 = Stock $ProdId
    T "6.10" "Confirmed lai don da Completed" @(409) (Api PUT "$Order/Order/$O1/status" $S.Staff.Token @{ status = "Confirmed" }) | Out-Null
    A "6.11" "Khong tru kho lan 2" ((Stock $ProdId) -eq $s9) $s9 (Stock $ProdId) | Out-Null
} else { Skip "6.x" "Staff xu ly don" "khong co don COD" }

# ============================ 7. REVIEW ================================
Head "7. Danh gia san pham"
if ($O1) {
    T "7.1" "Review rating = 6" @(400) (Api POST "$Review/Reviews" $Main.Token @{ productId = $ProdId; rating = 6; comment = "x" }) | Out-Null
    T "7.2" "Review khong token" @(401) (Api POST "$Review/Reviews" $null @{ productId = $ProdId; rating = 5 }) | Out-Null
    $rv = Api POST "$Review/Reviews" $Main.Token @{ productId = $ProdId; rating = 5; comment = "E2E test $RunTag" }
    if (T "7.3" "Review san pham da mua (Review -> Order co key)" @(201) $rv) {
        $RvId = [int]$rv.Json.reviewId
        A "7.4" "Review gan dung don hang" ([int]$rv.Json.orderId -eq $O1) $O1 $rv.Json.orderId | Out-Null
        T "7.5" "Review lan 2 cung san pham" @(409) (Api POST "$Review/Reviews" $Main.Token @{ productId = $ProdId; rating = 4 }) | Out-Null
        T "7.6" "Sua review cua minh" @(204) (Api PUT "$Review/Reviews/$RvId" $Main.Token @{ rating = 4; comment = "E2E updated" }) | Out-Null
        T "7.7" "Khach khac sua review nay" @(403, 404) (Api PUT "$Review/Reviews/$RvId" $S.Other.Token @{ rating = 1; comment = "hack" }) | Out-Null
        $list = Api GET "$Review/Reviews/product/$ProdId" $null
        $found = ToList $list.Json | Where-Object { [int]$_.reviewId -eq $RvId }
        A "7.8" "Review hien thi, rating da sua = 4" ($found -and [int]$found.rating -eq 4) 4 $(if ($found) { $found.rating } else { "khong thay" }) | Out-Null
    }
    $bought = Api GET "$Order/Order/user/$($S.Other.Id)/product/$ProdId/purchased" $null $null $KeyHdr
    if ($bought.Status -eq 404) {
        T "7.9" "Review san pham chua mua" @(403) (Api POST "$Review/Reviews" $S.Other.Token @{ productId = $ProdId; rating = 5 }) | Out-Null
    } else { Skip "7.9" "Review san pham chua mua" "khach Other da tung mua san pham nay" }
} else { Skip "7.x" "Review" "khong co don Completed" }

# ============================ 8. VNPAY =================================
Head "8. Thanh toan VNPay (gia lap IPN)"
if ($HashSecret) {
    Api POST "$Order/Cart/items" $Main.Token @{ userId = $Main.Id; productId = $ProdId; quantity = 1 } | Out-Null
    $co2 = Api POST "$Order/Order/checkout" $Main.Token @{ receiverName = "E2E VNPay"; receiverPhone = $Main.Phone; shippingAddress = "456 Test"; paymentMethod = "VNPay" }
    if (T "8.1" "Checkout VNPay" @(200) $co2) {
        $O2 = [int]$co2.Json.orderId
        $vn = Api POST "$Payment/Payment/vnpay/create" $Main.Token @{ orderId = $O2 }
        if (T "8.2" "Tao link thanh toan VNPay" @(200) $vn) {
            $txn = $vn.Json.txnRef
            $u = UrlParams $vn.Json.paymentUrl
            A "8.3" "vnp_Amount = finalAmount x 100" ([int64]$u["vnp_Amount"] -eq [int64]([decimal]$co2.Json.finalAmount * 100)) ([int64]([decimal]$co2.Json.finalAmount * 100)) $u["vnp_Amount"] | Out-Null
            $signed = $u.Clone(); $signed.Remove("vnp_SecureHash")
            A "8.4" "Chu ky paymentUrl hop le" ((HmacSha512 $HashSecret (VnpQuery $signed)) -eq $u["vnp_SecureHash"]) "khop" $(if ((HmacSha512 $HashSecret (VnpQuery $signed)) -eq $u["vnp_SecureHash"]) { "khop" } else { "lech" }) | Out-Null

            $ipn = @{
                vnp_Amount = $u["vnp_Amount"]; vnp_BankCode = "NCB"; vnp_CardType = "ATM"; vnp_OrderInfo = $u["vnp_OrderInfo"]
                vnp_PayDate = (Get-Date -Format "yyyyMMddHHmmss"); vnp_ResponseCode = "00"; vnp_TmnCode = $u["vnp_TmnCode"]
                vnp_TransactionNo = "14" + (Get-Random -Minimum 100000 -Maximum 999999); vnp_TransactionStatus = "00"; vnp_TxnRef = $txn
            }
            $q = VnpQuery $ipn
            $r = Api GET "$Payment/Payment/vnpay-ipn?$q&vnp_SecureHash=deadbeef" $null
            A "8.5" "IPN chu ky sai -> RspCode 97" ($r.Json.RspCode -eq "97") "97" $r.Json.RspCode | Out-Null

            $bad = $ipn.Clone(); $bad.vnp_Amount = "100"
            $qb = VnpQuery $bad
            $r = Api GET "$Payment/Payment/vnpay-ipn?$qb&vnp_SecureHash=$(HmacSha512 $HashSecret $qb)" $null
            A "8.6" "IPN sai so tien -> RspCode 04" ($r.Json.RspCode -eq "04") "04" $r.Json.RspCode | Out-Null

            $r = Api GET "$Payment/Payment/vnpay-ipn?$q&vnp_SecureHash=$(HmacSha512 $HashSecret $q)" $null
            A "8.7" "IPN hop le -> RspCode 00" ($r.Json.RspCode -eq "00") "00" $r.Json.RspCode | Out-Null

            $pt = Api GET "$Payment/Payment/txn/$txn" $Main.Token
            A "8.8" "Payment chuyen Completed" ($pt.Json.status -eq "Completed") "Completed" $pt.Json.status | Out-Null
            $ord2 = Api GET "$Order/Order/$O2" $Main.Token
            A "8.9" "Order paymentStatus = Paid (Payment -> Order co key)" ($ord2.Json.paymentStatus -eq "Paid") "Paid" $ord2.Json.paymentStatus | Out-Null

            $r = Api GET "$Payment/Payment/vnpay-ipn?$q&vnp_SecureHash=$(HmacSha512 $HashSecret $q)" $null
            A "8.10" "IPN gui lai lan 2 -> RspCode 02" ($r.Json.RspCode -eq "02") "02" $r.Json.RspCode | Out-Null
            T "8.11" "Tao them payment cho don da thanh toan" @(400) (Api POST "$Payment/Payment/vnpay/create" $Main.Token @{ orderId = $O2 }) | Out-Null

            T "8.12" "Khach khac xem payment cua don nay" @(403) (Api GET "$Payment/Payment/order/$O2" $S.Other.Token) | Out-Null
            T "8.13" "Khach khac xem payment theo txnRef" @(403) (Api GET "$Payment/Payment/txn/$txn" $S.Other.Token) | Out-Null
            T "8.14" "Khach khac tao link VNPay cho don nay" @(403) (Api POST "$Payment/Payment/vnpay/create" $S.Other.Token @{ orderId = $O2 }) | Out-Null
            T "8.15" "Staff xem payment cua don" @(200) (Api GET "$Payment/Payment/order/$O2" $S.Staff.Token) | Out-Null
            T "8.16" "Chu don xem payment cua minh" @(200) (Api GET "$Payment/Payment/order/$O2" $Main.Token) | Out-Null
        }
    }
} else { Skip "8.x" "VNPay" "khong co HashSecret" }

# ============================ 9. HUY DON ===============================
Head "9. Huy don"
Api POST "$Order/Cart/items" $Main.Token @{ userId = $Main.Id; productId = $ProdId; quantity = 1 } | Out-Null
$co3 = Api POST "$Order/Order/checkout" $Main.Token @{ receiverName = "E2E Cancel"; receiverPhone = $Main.Phone; shippingAddress = "789 Test"; paymentMethod = "COD" }
if (T "9.1" "Checkout don de huy" @(200) $co3) {
    $O3 = [int]$co3.Json.orderId
    T "9.2" "Khach khac huy don nay" @(403) (Api PUT "$Order/Order/$O3/cancel" $S.Other.Token) | Out-Null
    $s3 = Stock $ProdId
    T "9.3" "Chu don huy don Pending" @(204) (Api PUT "$Order/Order/$O3/cancel" $Main.Token) | Out-Null
    $ord3 = Api GET "$Order/Order/$O3" $Main.Token
    A "9.4" "Trang thai = Cancelled" ($ord3.Json.orderStatus -eq "Cancelled") "Cancelled" $ord3.Json.orderStatus | Out-Null
    A "9.5" "Ton kho khong doi" ((Stock $ProdId) -eq $s3) $s3 (Stock $ProdId) | Out-Null
    T "9.6" "Huy lai don da huy" @(409) (Api PUT "$Order/Order/$O3/cancel" $Main.Token) | Out-Null
    T "9.7" "Staff dat trang thai khong hop le" @(400) (Api PUT "$Order/Order/$O3/status" $S.Staff.Token @{ status = "Abc123" }) | Out-Null
    T "9.8" "Staff mo lai don da huy (Cancelled -> Confirmed)" @(409) (Api PUT "$Order/Order/$O3/status" $S.Staff.Token @{ status = "Confirmed" }) | Out-Null
}

# ============================ 10. POS ==================================
Head "10. Ban hang tai quay (POS)"
$posBody = @{ paymentMethod = "Cash"; receiverName = "Khach le E2E"; items = @(@{ productId = $ProdId; quantity = 1 }) }
T "10.1" "Khach hang goi POS checkout" @(403) (Api POST "$Order/Order/pos-checkout" $Main.Token $posBody) | Out-Null
$s4 = Stock $ProdId
$pos = Api POST "$Order/Order/pos-checkout" $S.Staff.Token $posBody
if (T "10.2" "Staff POS checkout (Cash)" @(200) $pos) {
    A "10.3" "Don POS: Completed/Paid, type POS" ($pos.Json.orderType -eq "POS" -and $pos.Json.orderStatus -eq "Completed" -and $pos.Json.paymentStatus -eq "Paid") "POS/Completed/Paid" "$($pos.Json.orderType)/$($pos.Json.orderStatus)/$($pos.Json.paymentStatus)" | Out-Null
    A "10.4" "Tru kho ngay 1" ((Stock $ProdId) -eq $s4 - 1) ($s4 - 1) (Stock $ProdId) | Out-Null
    A "10.5" "finalAmount = gia (khong ship)" ([decimal]$pos.Json.finalAmount -eq $Price) $Price $pos.Json.finalAmount | Out-Null
    T "10.6" "Khach xem don POS" @(403) (Api GET "$Order/Order/$($pos.Json.orderId)" $Main.Token) | Out-Null
}
T "10.7" "POS khong co san pham" @(400) (Api POST "$Order/Order/pos-checkout" $S.Staff.Token @{ paymentMethod = "Cash"; items = @() }) | Out-Null

# ============================ 11. ADMIN ================================
Head "11. Admin quan ly"
$catBody = @{ categoryName = "TEST-CAT-$RunTag"; description = "E2E" }
T "11.1" "Staff tao danh muc" @(403) (Api POST "$Catalog/categories" $S.Staff.Token $catBody) | Out-Null
$cat = Api POST "$Catalog/categories" $S.Admin.Token $catBody
$CatId = $null; $NewPid = $null
if (T "11.2" "Admin tao danh muc" @(201) $cat) {
    $CatId = [int]$cat.Json.categoryId
    $prodBody = @{ productCode = "TEST-$RunTag"; productName = "TEST San pham $RunTag"; unit = "cai"; importPrice = 1000; salePrice = 2000; quantityInStock = 5; categoryId = $CatId; status = "Active" }
    $zero = $prodBody.Clone(); $zero.salePrice = 0
    T "11.3" "Admin tao SP gia ban = 0" @(400) (Api POST "$Catalog/products" $S.Admin.Token $zero) | Out-Null
    $np = Api POST "$Catalog/products" $S.Admin.Token $prodBody
    if (T "11.4" "Admin tao san pham" @(201) $np) {
        $NewPid = [int]$np.Json.productId
        $prodBody.productName = "TEST San pham (da sua)"; $prodBody.salePrice = 2500
        T "11.5" "Admin sua san pham" @(204) (Api PUT "$Catalog/products/$NewPid" $S.Admin.Token $prodBody) | Out-Null
        $g = Api GET "$Catalog/products/$NewPid" $null
        A "11.6" "Gia da cap nhat 2500" ([decimal]$g.Json.salePrice -eq 2500) 2500 $g.Json.salePrice | Out-Null
        T "11.7" "Staff xoa san pham" @(403) (Api DELETE "$Catalog/products/$NewPid" $S.Staff.Token) | Out-Null
    }
}
T "11.8" "Admin xem danh sach user" @(200) (Api GET "$User/User" $S.Admin.Token) | Out-Null
T "11.9" "Admin xem tat ca payment" @(200) (Api GET "$Payment/Payment" $S.Admin.Token) | Out-Null
T "11.10" "Staff xem tat ca payment" @(403) (Api GET "$Payment/Payment" $S.Staff.Token) | Out-Null

# ============================ 12. KHUYEN MAI ===========================
Head "12. Khuyen mai (Promotion)"
$today    = (Get-Date).ToString("yyyy-MM-dd")
$PmCode   = "E2E$RunTag"              # ma rieng cho moi lan chay -> khong phu thuoc du lieu mau
$PmMin    = $Price * 2                # don toi thieu = 2 san pham
$PmPct = $null; $PmExp = $null; $PmOff = $null; $O4 = $null
$pmBody = @{ code = $PmCode.ToLower(); description = "E2E 10%"; discountType = "Percentage"; discountValue = 10; minOrderValue = $PmMin
             startDate = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd"); endDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd"); status = "Active" }

T "12.1" "Staff tao khuyen mai" @(403) (Api POST "$Order/Promotion" $S.Staff.Token $pmBody) | Out-Null
T "12.2" "Khach xem danh sach khuyen mai" @(403) (Api GET "$Order/Promotion" $Main.Token) | Out-Null
$pc = Api POST "$Order/Promotion" $S.Admin.Token $pmBody
if (T "12.3" "Admin tao khuyen mai 10%" @(201) $pc) {
    $PmPct = [int]$pc.Json.promotionId
    A "12.4" "Ma duoc luu chu in hoa" ($pc.Json.code -eq $PmCode) $PmCode $pc.Json.code | Out-Null
    T "12.5" "Tao trung ma" @(409) (Api POST "$Order/Promotion" $S.Admin.Token $pmBody) | Out-Null
    $bad = $pmBody.Clone(); $bad.code = "X$PmCode"; $bad.discountValue = 150
    T "12.6" "Tao khuyen mai 150%" @(400) (Api POST "$Order/Promotion" $S.Admin.Token $bad) | Out-Null

    $exp = $pmBody.Clone(); $exp.code = "EXP$RunTag"; $exp.discountType = "Fixed"; $exp.discountValue = 5000; $exp.minOrderValue = 0
    $exp.startDate = (Get-Date).AddDays(-10).ToString("yyyy-MM-dd"); $exp.endDate = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
    $r = Api POST "$Order/Promotion" $S.Admin.Token $exp
    if ($r.Status -eq 201) { $PmExp = [int]$r.Json.promotionId }
    $off = $exp.Clone(); $off.code = "OFF$RunTag"; $off.startDate = $today; $off.endDate = (Get-Date).AddDays(30).ToString("yyyy-MM-dd"); $off.status = "Inactive"
    $r = Api POST "$Order/Promotion" $S.Admin.Token $off
    if ($r.Status -eq 201) { $PmOff = [int]$r.Json.promotionId }
    A "12.7" "Tao ma het han + ma Inactive" ($PmExp -and $PmOff) "2 ma" "$PmExp/$PmOff" | Out-Null

    # ---- Kiem tra ma (validate) ----
    $ExpDisc = [math]::Round([decimal]$PmMin * 10 / 100, 0, [MidpointRounding]::AwayFromZero)
    $v = Api POST "$Order/Promotion/validate" $Main.Token @{ code = $PmCode.ToLower(); orderAmount = $PmMin }
    if (T "12.8" "Validate ma hop le (chu thuong)" @(200) $v) {
        A "12.9" "Tien giam = 10% don hang" ([decimal]$v.Json.discount -eq $ExpDisc) $ExpDisc $v.Json.discount | Out-Null
    }
    T "12.10" "Validate don duoi muc toi thieu" @(400) (Api POST "$Order/Promotion/validate" $Main.Token @{ code = $PmCode; orderAmount = $PmMin - 1 }) | Out-Null
    T "12.11" "Validate ma het han" @(400) (Api POST "$Order/Promotion/validate" $Main.Token @{ code = "EXP$RunTag"; orderAmount = $PmMin }) | Out-Null
    T "12.12" "Validate ma Inactive" @(400) (Api POST "$Order/Promotion/validate" $Main.Token @{ code = "OFF$RunTag"; orderAmount = $PmMin }) | Out-Null
    T "12.13" "Validate ma khong ton tai" @(400) (Api POST "$Order/Promotion/validate" $Main.Token @{ code = "NOPE$RunTag"; orderAmount = $PmMin }) | Out-Null
    T "12.14" "Validate khong token" @(401) (Api POST "$Order/Promotion/validate" $null @{ code = $PmCode; orderAmount = $PmMin }) | Out-Null

    # ---- Checkout online co ma ----
    Api DELETE "$Order/Cart/$($Main.Id)" $Main.Token | Out-Null
    Api POST "$Order/Cart/items" $Main.Token @{ userId = $Main.Id; productId = $ProdId; quantity = 1 } | Out-Null
    T "12.15" "Checkout voi ma het han" @(400) (Api POST "$Order/Order/checkout" $Main.Token @{ receiverName = "E2E Promo"; receiverPhone = $Main.Phone; shippingAddress = "1 Promo"; paymentMethod = "COD"; promotionCode = "EXP$RunTag" }) | Out-Null
    $cart = Api GET "$Order/Cart/$($Main.Id)" $Main.Token
    A "12.16" "Gio hang giu nguyen khi ma loi" (@(ToList $cart.Json.items).Count -gt 0) ">0 item" @(ToList $cart.Json.items).Count | Out-Null

    Api DELETE "$Order/Cart/$($Main.Id)" $Main.Token | Out-Null
    Api POST "$Order/Cart/items" $Main.Token @{ userId = $Main.Id; productId = $ProdId; quantity = 2 } | Out-Null
    $co4 = Api POST "$Order/Order/checkout" $Main.Token @{ receiverName = "E2E Promo"; receiverPhone = $Main.Phone; shippingAddress = "1 Promo"; paymentMethod = "COD"; promotionCode = $PmCode }
    if (T "12.17" "Checkout online co ma" @(200) $co4) {
        $O4 = [int]$co4.Json.orderId
        $expFinal = $PmMin - $ExpDisc + 30000
        A "12.18" "discount + promotionId luu vao don" ([decimal]$co4.Json.discount -eq $ExpDisc -and [int]$co4.Json.promotionId -eq $PmPct) "$ExpDisc/#$PmPct" "$($co4.Json.discount)/#$($co4.Json.promotionId)" | Out-Null
        A "12.19" "finalAmount = tien hang - giam + ship" ([decimal]$co4.Json.finalAmount -eq $expFinal) $expFinal $co4.Json.finalAmount | Out-Null
    }

    # ---- POS co ma ----
    $posPm = Api POST "$Order/Order/pos-checkout" $S.Staff.Token @{ paymentMethod = "Cash"; receiverName = "Khach le KM"; promotionCode = $PmCode; items = @(@{ productId = $ProdId; quantity = 2 }) }
    if (T "12.20" "POS checkout co ma" @(200) $posPm) {
        A "12.21" "POS finalAmount = tien hang - giam (khong ship)" ([decimal]$posPm.Json.finalAmount -eq $PmMin - $ExpDisc) ($PmMin - $ExpDisc) $posPm.Json.finalAmount | Out-Null
    }

    # ---- Thong ke + rang buoc xoa ----
    $g = Api GET "$Order/Promotion/$PmPct" $S.Admin.Token
    A "12.22" "Thong ke: dung 2 lan, tong giam = 2 x giam" ([int]$g.Json.usageCount -eq 2 -and [decimal]$g.Json.totalDiscount -eq $ExpDisc * 2) "2/$($ExpDisc * 2)" "$($g.Json.usageCount)/$($g.Json.totalDiscount)" | Out-Null
    T "12.23" "Xoa ma da duoc dung" @(409) (Api DELETE "$Order/Promotion/$PmPct" $S.Admin.Token) | Out-Null
    $inact = $pmBody.Clone(); $inact.code = $PmCode; $inact.status = "Inactive"
    T "12.24" "Chuyen ma sang Inactive" @(204) (Api PUT "$Order/Promotion/$PmPct" $S.Admin.Token $inact) | Out-Null
    T "12.25" "Ma Inactive khong dung duoc nua" @(400) (Api POST "$Order/Promotion/validate" $Main.Token @{ code = $PmCode; orderAmount = $PmMin }) | Out-Null
}

# ============================ 13. DON DEP ==============================
Head "13. Don dep du lieu test"
if ($NewPid) { T "13.1" "Xoa san pham test" @(204) (Api DELETE "$Catalog/products/$NewPid" $S.Admin.Token) | Out-Null }
if ($CatId)  { T "13.2" "Xoa danh muc test" @(204) (Api DELETE "$Catalog/categories/$CatId" $S.Admin.Token) | Out-Null }
if ($PmExp)  { T "13.3" "Xoa ma khuyen mai chua dung" @(204) (Api DELETE "$Order/Promotion/$PmExp" $S.Admin.Token) | Out-Null }
if ($PmOff)  { Api DELETE "$Order/Promotion/$PmOff" $S.Admin.Token | Out-Null }
if ($O4)     { Api PUT "$Order/Order/$O4/cancel" $Main.Token | Out-Null }   # huy don online co ma (van giu lai lich su)
Api DELETE "$Order/Cart/$($Main.Id)" $Main.Token | Out-Null

# ============================ TONG KET =================================
$cnt = { param($r) @($Results | Where-Object Result -eq $r).Count }
$pass = & $cnt "PASS"; $fail = & $cnt "FAIL"; $gap = & $cnt "GAP"; $skip = & $cnt "SKIP"
Write-Host "`n================================================================"
Write-Host (" KET QUA: {0} PASS / {1} FAIL / {2} GAP / {3} SKIP" -f $pass, $fail, $gap, $skip) -ForegroundColor $(if ($fail) { "Red" } else { "Green" })
Write-Host "  GAP = lo hong da biet, chua sua (khong tinh la loi moi)." -ForegroundColor Magenta
if ($fail) {
    Write-Host "`n Cac test FAIL:" -ForegroundColor Red
    $Results | Where-Object Result -eq "FAIL" | ForEach-Object { Write-Host ("  {0,-5} {1} (expect {2}, got {3}) {4}" -f $_.Id, $_.Test, $_.Expected, $_.Actual, $_.Note) -ForegroundColor Red }
}
Write-Host "`n Du lieu da tao: user $($Main.Phone), don #$O1 (COD, Completed), #$O2 (VNPay), #$O3 (Cancelled), #$O4 (KM, Cancelled), 2 don POS, 1 review, ma KM $PmCode (Inactive)."
$csv = Join-Path $PSScriptRoot ("e2e-result_{0:yyyyMMdd_HHmm}.csv" -f (Get-Date))
$Results | Export-Csv $csv -NoTypeInformation -Encoding UTF8
Write-Host " Da luu: $csv"
