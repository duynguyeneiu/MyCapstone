namespace PaymentService.API.DTOs.Order
{
    public class OrderDto
    {
        public int OrderId { get; set; }

        public string? OrderNumber { get; set; }

        public decimal FinalAmount { get; set; }

        public string? PaymentMethod { get; set; }

        public string? PaymentStatus { get; set; }
    }
}
