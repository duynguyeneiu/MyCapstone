using System.ComponentModel.DataAnnotations;

namespace UserService.API.DTOs.User
{
    public class CreateUserDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = null!;

        [MaxLength(10)]
        public string? Gender { get; set; }

        [MaxLength(15)]
        public string? Phone { get; set; }

        [EmailAddress]
        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

        [Required]
        public int RoleId { get; set; }
    }
}
