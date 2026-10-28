using UserService.API.DTOs;

namespace UserService.API.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest dto);

        Task<RegisterResult> RegisterAsync(RegisterRequestDto request);
        Task<bool> IsPhoneRegisteredAsync(string phone);
        Task<bool> ChangePasswordAsync(
    int userId,
    ChangePasswordRequestDto request);

        Task<ResetPasswordError> ResetPasswordAsync(ResetPasswordRequestDto request);
    }
}
