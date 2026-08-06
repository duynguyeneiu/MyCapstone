namespace OrderServiceAPI.DTOs
{
    public class CheckoutRequest
    {
        public int UserId { get; set; }

        public string ReceiverName { get; set; } = string.Empty;

        public string ReceiverPhone { get; set; } = string.Empty;

        public string ShippingAddress { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = string.Empty;
    }
}
