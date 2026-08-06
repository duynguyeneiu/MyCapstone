namespace OrderServiceAPI.DTOs.Invoice
{
    public class InvoiceDto
    {
        public int InvoiceId { get; set; }

        public int OrderId { get; set; }

        public decimal FinalAmount { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public string OrderStatus { get; set; } = string.Empty;
    }
}
