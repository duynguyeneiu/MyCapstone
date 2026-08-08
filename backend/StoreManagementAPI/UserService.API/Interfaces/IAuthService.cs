using UserService.API.DTOs;

namespace UserService.API.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponse?> LoginAsync(LoginRequest dto);
    }
}
