using UserService.API.DTOs;
using UserService.API.Helpers;
using UserService.API.Interfaces;

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
    }
}
