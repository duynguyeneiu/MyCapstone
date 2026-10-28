using System.ComponentModel.DataAnnotations;
using UserService.API.Models.Otp;

namespace UserService.API.DTOs.Otp
{
    public class SendOtpRequestDto
    {
        [Required]
        public string Phone { get; set; } = null!;

        [Required]
        public OtpPurpose Purpose { get; set; }
    }
}