using UserService.API.DTOs;
using UserService.API.Helpers;
using UserService.API.Interfaces;
using UserService.API.Models;
using UserService.API.Models.Otp;

namespace UserService.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly IOtpService _otpService;

        public AuthService(
            IUserRepository userRepository,
            IJwtService jwtService,
            IOtpService otpService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _otpService = otpService;
        }

        public async Task<LoginResponse?> LoginAsync(
            LoginRequest dto)
        {
            var user = await _userRepository.GetByPhoneAsync(
     PhoneHelper.Normalize(dto.Phone) ?? dto.Phone);

            if (user == null)
                return null;

            if (!PasswordHelper.VerifyPassword(
                    dto.Password,
                    user.Password))
            {
                return null;
            }

            var token = _jwtService.GenerateToken(user);

            return new LoginResponse
            {
                Token = token,
                UserId = user.UserId,
                FullName = user.FullName,
                Role = user.Role.RoleName
            };
        }

        public async Task<RegisterResult> RegisterAsync(RegisterRequestDto request)
        {
            // 1. Chuẩn hóa SĐT
            var phone = PhoneHelper.Normalize(request.Phone);
            if (phone == null)
                return RegisterResult.Fail(RegisterError.InvalidPhone);

            // 2. SĐT đã tồn tại?
            if (await _userRepository.PhoneExistsAsync(phone))
                return RegisterResult.Fail(RegisterError.PhoneExists);

            // 3. Role Customer
            var customerRole = await _userRepository.GetRoleByNameAsync("Customer");
            if (customerRole == null)
                return RegisterResult.Fail(RegisterError.RoleNotFound);

            // 4. Xác thực OTP token (đặt CUỐI - xem WHY)
            if (!_otpService.ConsumeVerificationToken(
                    phone, OtpPurpose.Register, request.VerificationToken))
                return RegisterResult.Fail(RegisterError.InvalidVerification);

            // 5. Tạo User
            var user = new User
            {
                FullName = request.FullName,
                Phone = phone,
                Password = PasswordHelper.HashPassword(request.Password),
                RoleId = customerRole.RoleId,
                LoyaltyPoint = 0,
                RegisterDate = DateOnly.FromDateTime(DateTime.Now),
                Status = "Active",
                CreatedAt = DateTime.Now
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            return RegisterResult.Ok(new RegisterResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName!,
                Phone = user.Phone!,
                Role = customerRole.RoleName,
                Status = user.Status
            });
        }
        public async Task<bool> IsPhoneRegisteredAsync(string phone)
        {
            var normalized = PhoneHelper.Normalize(phone);
            return normalized != null
                && await _userRepository.PhoneExistsAsync(normalized);
        }

        public async Task<ResetPasswordError> ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            
            var phone = PhoneHelper.Normalize(request.Phone);
            if (phone == null)
                return ResetPasswordError.InvalidPhone;

            var user = await _userRepository.GetByPhoneAsync(phone);
            if (user == null)
                return ResetPasswordError.UserNotFound;

            
            if (!_otpService.ConsumeVerificationToken(
                    phone, OtpPurpose.ForgotPassword, request.VerificationToken))
                return ResetPasswordError.InvalidVerification;

          
            user.Password = PasswordHelper.HashPassword(request.NewPassword);
            user.UpdatedAt = DateTime.Now;

            _userRepository.Update(user);
            await _userRepository.SaveChangesAsync();

            return ResetPasswordError.None;
        }


        public async Task<bool> ChangePasswordAsync(
    int userId,
    ChangePasswordRequestDto request)
        {
            var user =
                await _userRepository.GetByIdAsync(userId);

            if (user == null)
                return false;

            if (!PasswordHelper.VerifyPassword(
                    request.CurrentPassword,
                    user.Password))
            {
                return false;
            }

            if (string.IsNullOrWhiteSpace(
                    request.NewPassword) ||
                request.NewPassword.Length < 6)
            {
                return false;
            }

            if (request.NewPassword !=
                request.ConfirmNewPassword)
            {
                return false;
            }

            user.Password =
                PasswordHelper.HashPassword(
                    request.NewPassword);

            user.UpdatedAt = DateTime.Now;

            _userRepository.Update(user);

            await _userRepository.SaveChangesAsync();

            return true;
        }
    }
}
