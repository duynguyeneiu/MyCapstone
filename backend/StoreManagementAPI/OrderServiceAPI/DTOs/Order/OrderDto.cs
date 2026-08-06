namespace OrderServiceAPI.DTOs.Order
{
    public class OrderDto
    {
        public int OrderId { get; set; }

        public int UserId { get; set; }

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public string OrderStatus { get; set; } = string.Empty;

        public string ShippingAddress { get; set; } = string.Empty;

        public List<OrderItemDto> Items { get; set; } = [];
    }
}
