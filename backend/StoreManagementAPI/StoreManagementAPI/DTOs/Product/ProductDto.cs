namespace CatalogService.API.DTOs.Product
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string ProductCode { get; set; } = null!;

        public string? Barcode { get; set; }

        public string ProductName { get; set; } = null!;

        public string Unit { get; set; } = null!;

        public decimal ImportPrice { get; set; }

        public decimal SalePrice { get; set; }

        public int QuantityInStock { get; set; }

        public string? Image { get; set; }

        public string? Description { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = null!;

        public string Status { get; set; } = null!;
    }
}
