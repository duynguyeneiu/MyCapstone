using System.ComponentModel.DataAnnotations;

namespace UserService.API.DTOs.User
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = null!;

        [Required]
        public string NewPassword { get; set; } = null!;
    }
}
