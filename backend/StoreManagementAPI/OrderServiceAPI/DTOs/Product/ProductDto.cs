namespace OrderServiceAPI.DTOs.Product
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public decimal Price { get; set; }

        public int StockQuantity { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
