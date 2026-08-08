using StoreManagementAPI.Models;

namespace CatalogService.API.Interfaces
{
    public interface IProductRepository
    {

    
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

        Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
    int page,
    int pageSize,
    string? keyword = null,
    string? status = null,
    int? categoryId = null,
    decimal? minPrice = null,
    decimal? maxPrice = null,
    string? sortBy = null);


        Task<IEnumerable<Product>> GetRelatedProductsAsync(int productId);

    }
}
