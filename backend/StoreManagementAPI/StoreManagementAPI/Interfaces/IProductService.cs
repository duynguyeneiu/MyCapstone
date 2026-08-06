namespace CatalogService.API.Interfaces
{
    public interface IProductService
    {
        Task UpdateStockAsync(int productId, int quantity);
    }
}
