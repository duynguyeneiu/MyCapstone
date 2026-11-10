using Microsoft.EntityFrameworkCore;
using OrderServiceAPI.Data;
using OrderServiceAPI.DTOs.Promotion;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;

namespace OrderServiceAPI.Repositories
{
    public class PromotionRepository : IPromotionRepository
    {
        private readonly OrderDbContext _context;

        public PromotionRepository(OrderDbContext context)
        {
            _context = context;
        }

        public async Task<List<Promotion>> GetAllAsync() =>
            await _context.Promotions.OrderByDescending(p => p.CreatedAt).ToListAsync();

        public async Task<Promotion?> GetByIdAsync(int id) =>
            await _context.Promotions.FindAsync(id);

        public async Task<Promotion?> GetByCodeAsync(string code) =>
            await _context.Promotions.FirstOrDefaultAsync(p => p.Code == code);

        public async Task<bool> CodeExistsAsync(string code, int? excludeId = null) =>
            await _context.Promotions.AnyAsync(p =>
                p.Code == code && (excludeId == null || p.PromotionId != excludeId));

        public async Task<bool> IsUsedAsync(int id) =>
            await _context.Orders.AnyAsync(o => o.PromotionId == id);

        // Cancelled orders do not count as "used"
        public async Task<List<PromotionUsage>> GetUsageAsync() =>
            await _context.Orders
                .Where(o => o.PromotionId != null && o.OrderStatus != "Cancelled")
                .GroupBy(o => o.PromotionId!.Value)
                .Select(g => new PromotionUsage
                {
                    PromotionId = g.Key,
                    UsageCount = g.Count(),
                    TotalDiscount = g.Sum(o => o.Discount)
                })
                .ToListAsync();

        public async Task AddAsync(Promotion promotion) =>
            await _context.Promotions.AddAsync(promotion);

        public void Remove(Promotion promotion) =>
            _context.Promotions.Remove(promotion);

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
