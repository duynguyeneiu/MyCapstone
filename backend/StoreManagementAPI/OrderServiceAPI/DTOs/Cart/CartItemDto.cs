namespace OrderServiceAPI.DTOs.Cart
{
  

    public class CartItemDto
    {
        public int CartDetailId { get; set; }

        public int ProductId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal Subtotal { get; set; }
    }
}
