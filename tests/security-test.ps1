# =====================================================================
#  HappyMart - Security test (Phan quyen / Internal key / IDOR / Rate limit)
#  Chay:  powershell -ExecutionPolicy Bypass -File .\security-test.ps1
#  Yeu cau: 5 service dang chay (Catalog 5001, Order 5002, Payment 5003,
#           Review 5004, User 5005)
# =====================================================================

# ----------------------- 1. DIEN THONG TIN O DAY ----------------------
$Accounts = @{
    A     = @{ Phone = "0912345678"; Password = "Customer@123" }   # Customer A
    B     = @{ Phone = "0987654321";           Password = "Customer@123" }               # Customer B: TU DIEN (co don hang + gio hang)
    Staff = @{ Phone = "0978123456"; Password = "Staff@123" }
    Admin = @{ Phone = "0901234567"; Password = "Admin@123" }
}

# Doc tu appsettings.json cua Order, khong can go tay
$OrderSettings = Join-Path $PSScriptRoot "..\backend\StoreManagementAPI\OrderServiceAPI\appsettings.json"
$InternalKey   = (Get-Content $OrderSettings -Raw -Encoding UTF8 | ConvertFrom-Json).InternalApi.Key

# (Tuy chon) ProductId ma A DA MUA nhung CHUA review -> test Review goi Order co key.
# De 0 neu muon bo qua.
$ReviewProductId = 0

$Catalog = "http://localhost:5001/api"
$Order   = "http://localhost:5002/api"
$Review  = "http://localhost:5004/api"
$User    = "http://localhost:5005/api"
# ---------------------------------------------------------------------

$Results = New-Object System.Collections.Generic.List[object]

function Call {
    param([string]$Method, [string]$Url, [string]$Token, $Body, [hashtable]$Headers = @{})
    $h = @{} + $Headers
    if ($Token) { $h["Authorization"] = "Bearer $Token" }
    $p = @{ Method = $Method; Uri = $Url; Headers = $h; UseBasicParsing = $true; ErrorAction = "Stop" }
    if ($null -ne $Body) { $p.Body = ($Body | ConvertTo-Json -Depth 5); $p.ContentType = "application/json" }
    try {
        $r = Invoke-WebRequest @p
        return @{ Status = [int]$r.StatusCode; Content = $r.Content }
    } catch {
        if ($_.Exception.Response) {
            return @{ Status = [int]$_.Exception.Response.StatusCode.value__; Content = "" }
        }
        return @{ Status = 0; Content = $_.Exception.Message }   # service khong chay
    }
}

function Test {
    param([string]$Id, [string]$Name, [int[]]$Expect, [hashtable]$Res)
    $ok = $Expect -contains $Res.Status
    $tag = if ($ok) { "PASS" } else { "FAIL" }
    $color = if ($ok) { "Green" } else { "Red" }
    Write-Host ("[{0}] {1,-4} {2,-62} expect {3,-9} got {4}" -f $tag, $Id, $Name, ($Expect -join "/"), $Res.Status) -ForegroundColor $color
    $Results.Add([pscustomobject]@{ Id = $Id; Test = $Name; Expected = ($Expect -join "/"); Actual = $Res.Status; Result = $tag })
}

function Skip([string]$Id, [string]$Name, [string]$Why) {
    Write-Host ("[SKIP] {0,-4} {1,-62} ({2})" -f $Id, $Name, $Why) -ForegroundColor Yellow
    $Results.Add([pscustomobject]@{ Id = $Id; Test = $Name; Expected = "-"; Actual = "-"; Result = "SKIP" })
}

# ----------------------- 2. LOGIN (1 lan / tai khoan) -----------------
Write-Host "`n=== Login ===" -ForegroundColor Cyan
$S = @{}
foreach ($k in "A", "B", "Staff", "Admin") {
    $acc = $Accounts[$k]
    if (-not $acc.Phone) { Write-Host "Chua dien tai khoan $k o dau file." -ForegroundColor Red; exit 1 }
    try {
        $r = Invoke-RestMethod -Method Post -Uri "$User/Auth/login" -ContentType "application/json" `
             -Body (@{ phone = $acc.Phone; password = $acc.Password } | ConvertTo-Json)
        $S[$k] = @{ Token = $r.token; Id = [int]$r.userId; Role = $r.role }
        Write-Host ("  {0,-6} userId={1,-4} role={2}" -f $k, $r.userId, $r.role)
    } catch {
        $code = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode.value__ } else { 0 }
        if ($code -eq 429) { Write-Host "Login bi rate limit (429). Doi 60 giay roi chay lai." -ForegroundColor Red }
        else { Write-Host "Login $k that bai (status $code). Kiem tra SDT/mat khau va UserService." -ForegroundColor Red }
        exit 1
    }
}
$A = $S.A; $B = $S.B; $St = $S.Staff; $Ad = $S.Admin

# ----------------------- 3. LAY DU LIEU CUA B -------------------------
$bCart = Call GET "$Order/Cart/$($B.Id)" $B.Token
$bItemId = $null
if ($bCart.Status -eq 200) { $items = ($bCart.Content | ConvertFrom-Json).items; if ($items) { $bItemId = $items[0].cartDetailId } }

$bOrders = Call GET "$Order/Order/user/$($B.Id)" $B.Token
$bOrderId = $null
if ($bOrders.Status -eq 200) { $list = @($bOrders.Content | ConvertFrom-Json); if ($list.Count -gt 0) { $bOrderId = $list[0].orderId } }

Write-Host ("  Du lieu B: cartDetailId={0}  orderId={1}" -f $bItemId, $bOrderId)

$probe = @{ ProductId = 1; OrderId = $(if ($bOrderId) { $bOrderId } else { 1 }) }

# ----------------------- BUOC 1: CATALOG JWT --------------------------
Write-Host "`n=== Buoc 1 - Catalog co JWT ===" -ForegroundColor Cyan
$newProduct = @{ productName = "SEC-TEST"; price = 1000; stockQuantity = 1; categoryId = 1 }
Test "1.1" "POST /products khong token"               @(401) (Call POST "$Catalog/products" $null $newProduct)
Test "1.2" "POST /products token Customer"            @(403) (Call POST "$Catalog/products" $A.Token $newProduct)
Test "1.3" "GET  /products (public)"                  @(200) (Call GET  "$Catalog/products" $null)

# ----------------------- BUOC 2: INTERNAL KEY -------------------------
Write-Host "`n=== Buoc 2 - Endpoint noi bo ===" -ForegroundColor Cyan
$bad = @{ "X-Internal-Key" = "wrong-key" }
$good = @{ "X-Internal-Key" = $InternalKey }
Test "2.1" "PUT  /products/{id}/stock khong key"      @(401) (Call PUT  "$Catalog/products/$($probe.ProductId)/stock" $null @{ quantity = 1 })
Test "2.2" "PUT  /products/{id}/stock sai key"        @(401) (Call PUT  "$Catalog/products/$($probe.ProductId)/stock" $null @{ quantity = 1 } $bad)
Test "2.3" "POST /products/{id}/rating khong key"     @(401) (Call POST "$Catalog/products/$($probe.ProductId)/rating" $null @{ rating = 5 })
Test "2.4" "PUT  /Order/{id}/payment-status khong key" @(401) (Call PUT "$Order/Order/$($probe.OrderId)/payment-status" $null @{ paymentStatus = "Paid" })
Test "2.5" "GET  /Order/.../purchased khong key"      @(401) (Call GET  "$Order/Order/user/$($A.Id)/product/$($probe.ProductId)/purchased" $null)
Test "2.6" "GET  /Order/.../purchased dung key"       @(200, 404) (Call GET "$Order/Order/user/$($A.Id)/product/$($probe.ProductId)/purchased" $null $null $good)

# ----------------------- BUOC 3: IDOR ---------------------------------
Write-Host "`n=== Buoc 3 - IDOR / quyen so huu ===" -ForegroundColor Cyan
Test "3.1" "GET  /Cart/{B} bang token A"              @(403) (Call GET "$Order/Cart/$($B.Id)" $A.Token)
Test "3.2" "GET  /Cart/{A} bang token A"              @(200) (Call GET "$Order/Cart/$($A.Id)" $A.Token)
if ($bItemId) {
    Test "3.3" "PUT  /Cart/items/{itemB} bang token A"    @(403) (Call PUT    "$Order/Cart/items/$bItemId" $A.Token @{ quantity = 1 })
    Test "3.4" "DEL  /Cart/items/{itemB} bang token A"    @(403) (Call DELETE "$Order/Cart/items/$bItemId" $A.Token)
} else {
    Skip "3.3" "PUT  /Cart/items/{itemB} bang token A" "gio hang B trong"
    Skip "3.4" "DEL  /Cart/items/{itemB} bang token A" "gio hang B trong"
}
Test "3.5" "DEL  /Cart/{B} bang token A"              @(403) (Call DELETE "$Order/Cart/$($B.Id)" $A.Token)
Test "3.6" "GET  /Order/user/{B} bang token A"        @(403) (Call GET "$Order/Order/user/$($B.Id)" $A.Token)
Test "3.7" "GET  /Order (tat ca) bang token A"        @(403) (Call GET "$Order/Order" $A.Token)
Test "3.8" "GET  /Order (tat ca) bang token Staff"    @(200) (Call GET "$Order/Order" $St.Token)
if ($bOrderId) {
    Test "3.9"  "GET  /Order/{donB} bang token A"         @(403) (Call GET "$Order/Order/$bOrderId" $A.Token)
    Test "3.10" "GET  /Order/{donB} bang token B"         @(200) (Call GET "$Order/Order/$bOrderId" $B.Token)
    Test "3.11" "GET  /Order/{donB} bang token Staff"     @(200) (Call GET "$Order/Order/$bOrderId" $St.Token)
    Test "3.12" "GET  /Order/{donB} khong token"          @(401) (Call GET "$Order/Order/$bOrderId" $null)
    Test "3.13" "GET  /Order/{donB} key noi bo"           @(200) (Call GET "$Order/Order/$bOrderId" $null $null $good)
    Test "3.14" "PUT  /Order/{donB}/cancel bang token A"  @(403) (Call PUT "$Order/Order/$bOrderId/cancel" $A.Token)
} else {
    foreach ($i in "3.9", "3.10", "3.11", "3.12", "3.13", "3.14") { Skip $i "Test don hang cua B" "B chua co don" }
}
Test "3.15" "GET  /User (danh sach) bang token A"     @(403) (Call GET "$User/User" $A.Token)
Test "3.16" "GET  /User (danh sach) bang token Admin" @(200) (Call GET "$User/User" $Ad.Token)
Test "3.17" "GET  /User/{B} bang token A"             @(403) (Call GET "$User/User/$($B.Id)" $A.Token)

# ----------------------- REVIEW -> ORDER (tuy chon) -------------------
if ($ReviewProductId -gt 0) {
    Write-Host "`n=== Review goi Order bang key ===" -ForegroundColor Cyan
    Test "R.1" "POST /Reviews (A da mua san pham)"        @(200, 201) (Call POST "$Review/Reviews" $A.Token @{ productId = $ReviewProductId; rating = 5; comment = "security test" })
} else {
    Skip "R.1" "POST /Reviews (A da mua san pham)" "chua dat ReviewProductId"
}

# ----------------------- BUOC 4: RATE LIMIT (chay cuoi) ---------------
Write-Host "`n=== Buoc 4 - Rate limit register ===" -ForegroundColor Cyan
$codes = @()
1..6 | ForEach-Object {
    $codes += (Call POST "$User/Auth/register" $null @{ phone = "0900000000"; password = "x"; fullName = "rl" }).Status
}
$hit = @{ Status = $(if ($codes -contains 429) { 429 } else { $codes[-1] }) }
Write-Host "  Status 6 lan goi: $($codes -join ', ')"
Test "4.1" "POST /Auth/register 6 lan lien tiep"      @(429) $hit

# ----------------------- TONG KET -------------------------------------
$pass = ($Results | Where-Object Result -eq "PASS").Count
$fail = ($Results | Where-Object Result -eq "FAIL").Count
$skip = ($Results | Where-Object Result -eq "SKIP").Count
Write-Host "`n=== KET QUA: $pass PASS / $fail FAIL / $skip SKIP ===" -ForegroundColor $(if ($fail) { "Red" } else { "Green" })

$csv = Join-Path $PSScriptRoot ("security-test-result_{0:yyyyMMdd_HHmm}.csv" -f (Get-Date))
$Results | Export-Csv $csv -NoTypeInformation -Encoding UTF8
Write-Host "Da luu: $csv"
Write-Host "Luu y: login va register dung chung rate limit 5 lan/phut. Chay lai script sau it nhat 60 giay." -ForegroundColor Yellow
