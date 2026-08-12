using System.ComponentModel.DataAnnotations;

namespace UserService.API.DTOs
{
    public class RegisterRequestDto
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = null!;

        [Required]
        [Phone]
        [MaxLength(15)]
        public string Phone { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = null!;
    }
}
