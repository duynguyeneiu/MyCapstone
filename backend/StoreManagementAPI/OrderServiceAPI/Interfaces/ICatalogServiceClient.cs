using OrderServiceAPI.DTOs.Product;

namespace OrderServiceAPI.Interfaces
{
    public interface ICatalogServiceClient
    {
        Task<ProductDto?> GetProductAsync(int productId);
        Task UpdateStockAsync(int productId, int quantity);
    }
}
