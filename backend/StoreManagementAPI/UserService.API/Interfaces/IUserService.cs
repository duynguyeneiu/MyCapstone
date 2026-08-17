using UserService.API.DTOs.User;

namespace UserService.API.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllAsync();

        Task<UserDto?> GetByIdAsync(int userId);

        Task<UserDto?> GetByUsernameAsync(string username);

        Task<UserDto?> GetByEmailAsync(string email);

        Task<UserDto?> GetByPhoneAsync(string phone);

        Task<UserDto?> CreateAsync(CreateUserDto dto);

        Task<bool> UpdateAsync(int userId, UpdateUserDto dto);

        Task<bool> DeleteAsync(int userId);

        Task<bool> ChangePasswordAsync(
    int userId,
    ChangePasswordDto dto);

        Task<bool> UpdateUserInforAsync(
    int userId,
    UpdateUserInforDto dto);
    }
}
