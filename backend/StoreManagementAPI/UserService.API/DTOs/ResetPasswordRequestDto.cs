using System.ComponentModel.DataAnnotations;

namespace UserService.API.DTOs
{
    public class ResetPasswordRequestDto
    {
        [Required]
        public string Phone { get; set; } = null!;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = null!;

        [Required]
        [Compare(nameof(NewPassword), ErrorMessage = "Confirm password does not match.")]
        public string ConfirmNewPassword { get; set; } = null!;

        [Required]
        public string VerificationToken { get; set; } = null!;
    }
}