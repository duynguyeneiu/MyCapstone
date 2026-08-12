using System.ComponentModel.DataAnnotations;

namespace PaymentService.API.DTOs
{
    public class UpdatePaymentStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;

        public string? TransactionCode { get; set; }
    }
}
