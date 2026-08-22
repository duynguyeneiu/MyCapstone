namespace OrderServiceAPI.DTOs
{
    public class PosOrderItem
    {
        public int ProductId { get; set; }

        public int Quantity { get; set; }
    }

    public class PosCheckoutRequest
    {
        public int? StaffUserId { get; set; }

        public string? ReceiverName { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public List<PosOrderItem> Items { get; set; } = new();
    }
}
