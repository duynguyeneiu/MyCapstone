using System.ComponentModel.DataAnnotations;

namespace UserService.API.DTOs.User
{
    public class UpdateUserInforDto
    {
        [MaxLength(100)]
        public string? FullName { get; set; }

        [MaxLength(20)]
        public string? Gender { get; set; }

        [EmailAddress]
        [MaxLength(150)]
        public string? Email { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }
    }
}
