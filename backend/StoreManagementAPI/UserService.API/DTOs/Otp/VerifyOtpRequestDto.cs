using System.ComponentModel.DataAnnotations;
using UserService.API.Models.Otp;

namespace UserService.API.DTOs.Otp
{
    public class VerifyOtpRequestDto
    {
        [Required]
        public string Phone { get; set; } = null!;

        [Required]
        public OtpPurpose Purpose { get; set; }

        [Required]
        [StringLength(6, MinimumLength = 6)]
        public string Code { get; set; } = null!;
    }
}