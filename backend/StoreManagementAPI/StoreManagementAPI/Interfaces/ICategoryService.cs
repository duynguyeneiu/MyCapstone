using CatalogService.API.Common;
using CatalogService.API.DTOs.Category;

namespace CatalogService.API.Interfaces
{
    public interface ICategoryService
    {
        Task<PagedResult<CategoryDto>> GetPagedAsync(
            int page,
            int pageSize,
            string? keyword);

        Task<CategoryDto?> GetByIdAsync(int id);

        Task<CategoryDto> CreateAsync(CreateCategoryDto dto);

        Task UpdateAsync(int id, UpdateCategoryDto dto);

        Task DeleteAsync(int id);
    }
}
