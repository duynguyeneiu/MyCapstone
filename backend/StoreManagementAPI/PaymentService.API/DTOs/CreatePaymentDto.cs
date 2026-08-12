using System.ComponentModel.DataAnnotations;

namespace PaymentService.API.DTOs
{
    public class CreatePaymentDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public string PaymentMethod { get; set; } = string.Empty;
    }
}
