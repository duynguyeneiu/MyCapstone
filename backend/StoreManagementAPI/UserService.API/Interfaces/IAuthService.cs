using UserService.API.DTOs;

namespace UserService.API.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest dto);

        Task<RegisterResponseDto?> RegisterAsync(
       RegisterRequestDto request);

        Task<bool> ChangePasswordAsync(
    int userId,
    ChangePasswordRequestDto request);
    }
}
