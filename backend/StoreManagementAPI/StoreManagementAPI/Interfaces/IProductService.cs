using CatalogService.API.Common;
using CatalogService.API.DTOs.Product;

namespace CatalogService.API.Interfaces
{
    public interface IProductService
    {



        Task<ProductDto> GetByIdAsync(int productId);

        Task<PagedResult<ProductDto>> GetByCategoryAsync(
            int categoryId,
            int page,
            int pageSize);

        Task<ProductDto> CreateAsync(CreateProductDto dto);

        Task UpdateAsync(int productId, UpdateProductDto dto);

        Task DeleteAsync(int productId);

        Task UpdateStockAsync(int productId, int quantity);
        Task<object> GetPagedAsync(
    int page,
    int pageSize,
    string? keyword = null,
    string? status = null,
    int? categoryId = null,
    decimal? minPrice = null,
    decimal? maxPrice = null,
    string? sortBy = null);


        Task<IEnumerable<ProductDto>> GetRelatedProductsAsync(
    int productId);



    }
}
