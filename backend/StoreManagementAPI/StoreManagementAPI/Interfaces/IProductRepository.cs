using StoreManagementAPI.Models;

namespace CatalogService.API.Interfaces
{
    public interface IProductRepository
    {

        Task<(IEnumerable<Product>, int)> GetPagedAsync(
    int page,
    int pageSize,
    string? keyword);
        Task<Product?> GetByIdAsync(int productId);

        Task<Product?> GetByCodeAsync(string productCode);

        Task<Product?> GetByBarcodeAsync(string barcode);


        Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId);

      

        Task AddAsync(Product product);

        void Update(Product product);

        void Delete(Product product);

        Task SaveChangesAsync();

        Task<(IEnumerable<Product>, int)> GetByCategoryPagedAsync(
    int categoryId,
    int page,
    int pageSize);
    }
}
