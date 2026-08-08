using UserService.API.Models;

namespace UserService.API.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
