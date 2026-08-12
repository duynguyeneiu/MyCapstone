namespace OrderServiceAPI.DTOs.Order
{
    public class OrderDto
    {
        public int OrderId { get; set; }

        public string OrderNumber { get; set; } = string.Empty;

        public int UserId { get; set; }

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string OrderType { get; set; } = string.Empty;

        public string ReceiverName { get; set; } = string.Empty;

        public string ReceiverPhone { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;

        public string OrderStatus { get; set; } = string.Empty;

        public string ShippingAddress { get; set; } = string.Empty;

        public decimal ShippingFee { get; set; }
        public decimal FinalAmount { get; set; }
        public List<OrderItemDto> Items { get; set; } = [];
    }
}
