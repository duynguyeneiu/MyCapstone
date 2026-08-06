namespace OrderServiceAPI.DTOs.Cart
{
    public class AddCartItemRequest
    {
        public int UserId { get; set; }

        public int ProductId { get; set; }

        public int Quantity { get; set; }
    }
}
