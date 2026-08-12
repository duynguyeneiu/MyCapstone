using CatalogService.API.Models;


namespace CatalogService.API.Interfaces
{
    public interface ICategoryRepository
    {
        Task<Category?> GetByIdAsync(int categoryId);
        Task<Category?> GetByNameAsync(string categoryName);
        Task<bool> ExistsAsync(int categoryId);
        Task<bool> HasProductsAsync(int categoryId);

        Task<(IEnumerable<Category>, int)> GetPagedAsync(
            int page,
            int pageSize,
            string? keyword);

        Task AddAsync(Category category);
        void Update(Category category);
        void Delete(Category category);
        Task SaveChangesAsync();
    }


}
