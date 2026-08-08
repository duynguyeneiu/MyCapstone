using UserService.API.DTOs.User;
using UserService.API.Interfaces;
using UserService.API.Models;
using UserService.API.Helpers;

namespace UserService.API.Services
{
    public class UsersService : IUserService
    {
        private readonly IUserRepository _repository;

        public UsersService(IUserRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<UserDto>> GetAllAsync()
        {
            var users = await _repository.GetAllAsync();

            return users.Select(MapToDto);
        }

        public async Task<UserDto?> GetByIdAsync(int userId)
        {
            var user = await _repository.GetByIdAsync(userId);

            return user == null ? null : MapToDto(user);
        }

        public async Task<UserDto?> GetByUsernameAsync(string username)
        {
            var user = await _repository.GetByUsernameAsync(username);

            return user == null ? null : MapToDto(user);
        }

        public async Task<UserDto?> GetByEmailAsync(string email)
        {
            var user = await _repository.GetByEmailAsync(email);

            return user == null ? null : MapToDto(user);
        }

        public async Task<UserDto?> GetByPhoneAsync(string phone)
        {
            var user = await _repository.GetByPhoneAsync(phone);

            return user == null ? null : MapToDto(user);
        }

        public async Task<UserDto?> CreateAsync(CreateUserDto dto)
        {
            // Kiểm tra username
            if (await _repository.UsernameExistsAsync(dto.Username))
                return null;

            // Kiểm tra email
            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                await _repository.EmailExistsAsync(dto.Email))
            {
                return null;
            }

            // Kiểm tra phone
            if (!string.IsNullOrWhiteSpace(dto.Phone) &&
                await _repository.PhoneExistsAsync(dto.Phone))
            {
                return null;
            }

            var user = new User
            {
                FullName = dto.FullName,
                Gender = dto.Gender,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                Username = dto.Username,
                Password = PasswordHelper.HashPassword(dto.Password),
                RoleId = dto.RoleId,
                LoyaltyPoint = 0,
                RegisterDate = DateOnly.FromDateTime(DateTime.Now),
                Status = "Active",
                CreatedAt = DateTime.Now
            };

            await _repository.AddAsync(user);
            await _repository.SaveChangesAsync();

            var createdUser = await _repository.GetByIdAsync(user.UserId);

            return createdUser == null
                ? null
                : MapToDto(createdUser);
        }

        public async Task<bool> UpdateAsync(
            int userId,
            UpdateUserDto dto)
        {
            var user = await _repository.GetByIdAsync(userId);

            if (user == null)
                return false;

            // Phone mới đã thuộc user khác
            if (!string.IsNullOrWhiteSpace(dto.Phone) &&
                dto.Phone != user.Phone &&
                await _repository.PhoneExistsAsync(dto.Phone))
            {
                return false;
            }

            // Email mới đã thuộc user khác
            if (!string.IsNullOrWhiteSpace(dto.Email) &&
                dto.Email != user.Email &&
                await _repository.EmailExistsAsync(dto.Email))
            {
                return false;
            }

            user.FullName = dto.FullName;
            user.Gender = dto.Gender;
            user.Phone = dto.Phone;
            user.Email = dto.Email;
            user.Address = dto.Address;
            user.RoleId = dto.RoleId;

            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                user.Status = dto.Status;
            }

            user.UpdatedAt = DateTime.Now;

            _repository.Update(user);
            await _repository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int userId)
        {
            var user = await _repository.GetByIdAsync(userId);

            if (user == null)
                return false;

            _repository.Delete(user);
            await _repository.SaveChangesAsync();

            return true;
        }

        private static UserDto MapToDto(User user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                FullName = user.FullName,
                Gender = user.Gender,
                Phone = user.Phone,
                Email = user.Email,
                Address = user.Address,
                Username = user.Username,
                RoleId = user.RoleId,
                RoleName = user.Role?.RoleName,
                LoyaltyPoint = user.LoyaltyPoint,
                RegisterDate = user.RegisterDate,
                Status = user.Status,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }


        public async Task<bool> ChangePasswordAsync(
    int userId,
    ChangePasswordDto dto)
        {
            var user = await _repository.GetByIdAsync(userId);

            if (user == null)
                return false;

            var isCurrentPasswordValid =
                PasswordHelper.VerifyPassword(
                    dto.CurrentPassword,
                    user.Password
                );

            if (!isCurrentPasswordValid)
                return false;

            user.Password =
                PasswordHelper.HashPassword(
                    dto.NewPassword
                );

            user.UpdatedAt = DateTime.Now;

            _repository.Update(user);

            await _repository.SaveChangesAsync();

            return true;
        }











    }
}
