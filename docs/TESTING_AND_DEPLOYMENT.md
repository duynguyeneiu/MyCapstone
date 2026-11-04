# Testing & Deployment – HappyMart (Phase 2)

## 1. Unit test (xUnit + Moq)

```
backend/StoreManagementAPI/tests/
├── CatalogService.API.Tests   ProductService, CategoryService                   20 test
├── OrderServiceAPI.Tests      OrderService (online + POS), CartService          26 test
├── PaymentService.API.Tests   PaymentsService (Cash/VNPay/MoMo IPN), VnPayService 25 test
├── ReviewService.API.Tests    ReviewsService                                     13 test
└── UserService.API.Tests      AuthService, OtpService, PhoneHelper, BCrypt, JWT  36 test
                                                                          Tổng: 120 test
```

- Chỉ test **tầng Service**. Repository và các HTTP client tới service khác được mock bằng Moq, nên không cần SQL Server.
- `VnPayService`, `OtpService` (MemoryCache thật), `PasswordHelper` (BCrypt thật) và `JwtService` được test bằng code thật, không mock.
- Không sửa source code. Mỗi project test tham chiếu tới đúng project service của nó.

### Chạy test
```bash
cd backend/StoreManagementAPI
dotnet test StoreManagementAPI.slnx --logger "trx;LogFileName=results.trx" --collect:"XPlat Code Coverage"
```
Trong Visual Studio: **Test → Test Explorer → Run All**.

### Test đang FAIL có chủ đích (phát hiện bug)
| Test | Bug | Cách sửa |
|---|---|---|
| `ProductServiceTests.UpdateRatingAsync_ForwardsArgumentsToRepositoryInCorrectOrder` | `ProductService.UpdateRatingAsync` gọi repository với `(ratingDelta, productId, countDelta)`, nên điểm đánh giá bị ghi vào **sai sản phẩm** | Đổi thành `UpdateRatingAsync(productId, ratingDelta, countDelta)` |

## 2. API test (Postman / Newman)

File: `postman/HappyMart.postman_collection.json` + `postman/HappyMart.local.postman_environment.json`

54 request, chạy **theo thứ tự**:

| Folder | Nội dung chính |
|---|---|
| 1. Auth | Đăng nhập Admin/Staff/Customer → lưu JWT; sai mật khẩu → 401; không token → 401; Customer gọi API Admin → 403 |
| 2. Catalog | GET công khai; tạo sản phẩm: không token 401 / Customer 403 / dữ liệu sai 400 / Admin 201 / trùng mã 409; cập nhật kho thiếu `X-Internal-Key` → 401 |
| 3. Cart & Order | Giỏ hàng, vượt tồn kho 409, xem giỏ người khác 403, checkout (+30.000 phí ship), Staff duyệt đơn, huỷ đơn đã hoàn tất 409, huỷ đơn Pending 204, POS (Customer 403, Staff 200), tồn kho giảm 100 → 99 |
| 4. Payment | Tiền mặt 201, thanh toán lại 400, phương thức sai 400, đơn không tồn tại 404, tạo URL VNPay có chữ ký, IPN giả chữ ký → `RspCode 97` |
| 5. Review | Chưa mua → 403, rating 6 → 400, đánh giá sau khi mua → 201, đánh giá lần 2 → 409, người khác sửa → 403, chủ sở hữu sửa/xoá → 204 |
| 6. Cleanup | Xoá sản phẩm test |
| 7. Rate limiting | Đăng nhập lần thứ 6 trong 1 phút → 429 |

### Chuẩn bị
1. Chạy đủ 5 service (Visual Studio hoặc `docker compose`).
2. Trong environment, điền `adminPhone/adminPassword`, `staffPhone/staffPassword`, `customerPhone/customerPassword` (3 tài khoản có sẵn trong UserServiceDB).
3. **Sửa bug `UpdateRatingAsync` trước khi chạy folder 5.** Nếu chưa sửa, điểm đánh giá sẽ bị ghi vào một sản phẩm khác trong database thật.

### Chạy
- Postman: **Collection → Run** (giữ nguyên thứ tự).
- Newman (xuất báo cáo HTML để chèn vào báo cáo):
```bash
npm i -g newman newman-reporter-htmlextra
newman run postman/HappyMart.postman_collection.json \
  -e postman/HappyMart.local.postman_environment.json \
  -r cli,htmlextra --reporter-htmlextra-export newman/report.html
```
Đợi 1 phút giữa hai lần chạy, vì folder 1 và folder 7 dùng hết hạn mức đăng nhập 5 lần/phút.

## 3. Docker / Docker Compose

```
docker-compose.yml                          5 API + frontend
.env.example                                biến môi trường (copy thành .env)
docker/sql/create-login.sql                 tạo SQL login cho container
backend/StoreManagementAPI/<Service>/Dockerfile   multi-stage: sdk:10.0 → aspnet:10.0
fontend/storemanagement/Dockerfile          multi-stage: node:22-alpine
```

**Kiến trúc triển khai:** SQL Server vẫn chạy trên máy Windows (dùng 5 database hiện có). Các container kết nối qua `host.docker.internal:1433` bằng SQL login. Port trên host giữ nguyên như khi dev (5001–5005, 3000), nên frontend, Postman và các URL return của VNPay/MoMo không phải đổi.

| Container | Port host → container | Gọi tới (trong mạng Docker) |
|---|---|---|
| catalog-api | 5001 → 8080 | — |
| order-api | 5002 → 8080 | `http://catalog-api:8080` |
| payment-api | 5003 → 8080 | `http://order-api:8080` |
| review-api | 5004 → 8080 | order-api, catalog-api, user-api |
| user-api | 5005 → 8080 | — |
| frontend | 3000 → 3000 | gọi API qua `localhost:500x` (từ trình duyệt) |

### Các bước
1. Chạy `docker/sql/create-login.sql` trong SSMS (đọc phần comment đầu file: bật SQL Authentication, bật TCP 1433, mở firewall).
2. `copy .env.example .env`, rồi điền `DB_PASSWORD`, `JWT_KEY`, `INTERNAL_API_KEY` (giống giá trị trong appsettings) và key VNPay/MoMo.
3. `docker compose up -d --build`
4. `docker compose ps`: cả 6 container phải ở trạng thái `running`.

Mọi cấu hình đều đi qua biến môi trường (`ConnectionStrings__...`, `Services__...`, `Jwt__Key`, `VnPay__HashSecret`...). Secret không nằm trong image.

## 4. Kiểm tra sau triển khai (Post-deployment verification)

| # | Kiểm tra | Kết quả mong đợi |
|---|---|---|
| 1 | `docker compose ps` | 6 container `running` |
| 2 | `http://localhost:5001/swagger` … `5005/swagger` | Swagger UI của từng service |
| 3 | `docker compose logs user-api` | Không có lỗi kết nối SQL |
| 4 | `http://localhost:3000` | Trang chủ hiển thị sản phẩm và ảnh |
| 5 | Đăng ký với `SMS_PROVIDER=Console` | Mã OTP xuất hiện trong `docker compose logs user-api` |
| 6 | Chạy Newman với environment local | Tất cả test pass |
| 7 | Thanh toán VNPay sandbox (ngrok → 5003) | PAYMENT = Completed, ORDER.PaymentStatus = Paid |
