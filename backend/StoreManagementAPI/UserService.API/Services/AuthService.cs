using UserService.API.DTOs;
using UserService.API.Helpers;
using UserService.API.Interfaces;
using UserService.API.Models;

namespace UserService.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;

        public AuthService(
            IUserRepository userRepository,
            IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<LoginResponse?> LoginAsync(
            LoginRequest dto)
        {
            var user = await _userRepository
                .GetByPhoneAsync(dto.Phone);

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

        public async Task<RegisterResponseDto?> RegisterAsync(
     RegisterRequestDto request)
        {
            // Kiểm tra số điện thoại
            if (await _userRepository.PhoneExistsAsync(request.Phone))
            {
                return null;
            }

            // Lấy Role Customer
            var customerRole =
                await _userRepository.GetRoleByNameAsync("Customer");

            if (customerRole == null)
            {
                return null;
            }

            // Tạo User
            var user = new User
            {
                FullName = request.FullName,

                Phone = request.Phone,

                Password = PasswordHelper.HashPassword(
                    request.Password),

                RoleId = customerRole.RoleId,

                LoyaltyPoint = 0,

                RegisterDate =
                    DateOnly.FromDateTime(DateTime.Now),

                Status = "Active",

                CreatedAt = DateTime.Now
            };

            await _userRepository.AddAsync(user);

            await _userRepository.SaveChangesAsync();

            return new RegisterResponseDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Phone = user.Phone!,
                Role = customerRole.RoleName,
                Status = user.Status
            };
        }
    }
}
