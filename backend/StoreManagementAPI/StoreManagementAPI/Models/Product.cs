using System;
using System.Collections.Generic;

namespace CatalogService.API.Models;

public partial class Product
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

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int RatingSum { get; set; }

    public int RatingCount { get; set; }

    public decimal RatingAverage { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
}
