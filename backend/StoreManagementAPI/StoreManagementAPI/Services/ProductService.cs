using CatalogService.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;

namespace CatalogService.API.Services
{
    public class ProductService : IProductService
    {
        private readonly CatalogContext _context;

        public ProductService(CatalogContext context)
        {
            _context = context;
        }

        public async Task UpdateStockAsync(int productId, int quantity)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(x => x.ProductId == productId);

            if (product == null)
                throw new Exception("Product not found.");

            if (product.QuantityInStock < quantity)
                throw new Exception("Out of stock.");

            product.QuantityInStock -= quantity;
            product.UpdatedAt = DateTime.Now;

            await _context.SaveChangesAsync();
        }
    }
}
