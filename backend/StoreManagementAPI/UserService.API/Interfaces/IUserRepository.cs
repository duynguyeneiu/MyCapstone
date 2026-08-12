using UserService.API.Models;

namespace UserService.API.Interfaces
{
    public interface IUserRepository
    {
        Task<IEnumerable<User>> GetAllAsync();

        Task<User?> GetByIdAsync(int userId);

        Task<User?> GetByUsernameAsync(string username);

        Task<User?> GetByEmailAsync(string email);

        Task<User?> GetByPhoneAsync(string phone);

        Task<bool> ExistsAsync(int userId);

        Task<bool> UsernameExistsAsync(string username);

        Task<bool> EmailExistsAsync(string email);

        Task<bool> PhoneExistsAsync(string phone);

        Task AddAsync(User user);

        void Update(User user);

        void Delete(User user);

        Task SaveChangesAsync();
        Task<Role?> GetRoleByNameAsync(string roleName);
    }
}
