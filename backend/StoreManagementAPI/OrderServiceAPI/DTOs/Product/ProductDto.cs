using System.Text.Json.Serialization;

namespace OrderServiceAPI.DTOs.Product
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        [JsonPropertyName("salePrice")]
        public decimal Price { get; set; }

        [JsonPropertyName("quantityInStock")]
        public int StockQuantity { get; set; }

        [JsonPropertyName("image")]
        public string? ImageUrl { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}
