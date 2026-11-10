using OrderServiceAPI.DTOs.Promotion;
using OrderServiceAPI.Models;

namespace OrderServiceAPI.Interfaces
{
    public interface IPromotionRepository
    {
        Task<List<Promotion>> GetAllAsync();
        Task<Promotion?> GetByIdAsync(int id);
        Task<Promotion?> GetByCodeAsync(string code);
        Task<bool> CodeExistsAsync(string code, int? excludeId = null);
        Task<bool> IsUsedAsync(int id);
        Task<List<PromotionUsage>> GetUsageAsync();
        Task AddAsync(Promotion promotion);
        void Remove(Promotion promotion);
        Task SaveChangesAsync();
    }
}
