using CatalogService.API.DTOs.Product;
using CatalogService.API.Models;

namespace CatalogService.API.Mappers
{
    public static class ProductMapper
    {
        public static ProductDto ToDto(Product product)
        {
            return new ProductDto
            {
                ProductId = product.ProductId,
                ProductCode = product.ProductCode,
                Barcode = product.Barcode,
                ProductName = product.ProductName,
                Unit = product.Unit,
                ImportPrice = product.ImportPrice,
                SalePrice = product.SalePrice,
                QuantityInStock = product.QuantityInStock,
                Image = product.Image,
                Description = product.Description,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.CategoryName ?? string.Empty,
                Status = product.Status
            };
        }

        public static Product ToEntity(CreateProductDto dto)
        {
            return new Product
            {
                ProductCode = dto.ProductCode,
                Barcode = dto.Barcode,
                ProductName = dto.ProductName,
                Unit = dto.Unit,
                ImportPrice = dto.ImportPrice,
                SalePrice = dto.SalePrice,
                QuantityInStock = dto.QuantityInStock,
                Image = dto.Image,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow
            };
        }

        public static void UpdateEntity(Product product, UpdateProductDto dto)
        {
            product.Barcode = dto.Barcode;
            product.ProductName = dto.ProductName;
            product.Unit = dto.Unit;
            product.ImportPrice = dto.ImportPrice;
            product.SalePrice = dto.SalePrice;
            product.QuantityInStock = dto.QuantityInStock;
            product.Image = dto.Image;
            product.Description = dto.Description;
            product.CategoryId = dto.CategoryId;
            product.Status = dto.Status;
            product.UpdatedAt = DateTime.UtcNow;
        }
    }
}
