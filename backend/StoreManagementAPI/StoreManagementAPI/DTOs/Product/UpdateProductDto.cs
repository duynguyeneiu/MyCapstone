using System.ComponentModel.DataAnnotations;

namespace CatalogService.API.DTOs.Product
{
    public class UpdateProductDto
    {
        [MaxLength(50)]
        public string? Barcode { get; set; }

        [Required]
        [MaxLength(200)]
        public string ProductName { get; set; } = null!;

        [Required]
        [MaxLength(30)]
        public string Unit { get; set; } = null!;

        [Range(0, double.MaxValue)]
        public decimal ImportPrice { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal SalePrice { get; set; }

        [Range(0, int.MaxValue)]
        public int QuantityInStock { get; set; }

        public string? Image { get; set; }

        public string? Description { get; set; }

        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }

        [Required]
        public string Status { get; set; } = "Active";
    }
}
