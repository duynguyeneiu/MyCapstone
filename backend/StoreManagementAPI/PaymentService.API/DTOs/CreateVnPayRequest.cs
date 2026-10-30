using System.ComponentModel.DataAnnotations;

namespace PaymentService.API.DTOs
{
    public class CreateVnPayRequest
    {
        [Required]
        public int OrderId { get; set; }
    }
}