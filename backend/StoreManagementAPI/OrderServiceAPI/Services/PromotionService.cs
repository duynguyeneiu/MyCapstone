using OrderServiceAPI.DTOs.Promotion;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;

namespace OrderServiceAPI.Services
{
    public class PromotionService : IPromotionService
    {
        public const string Percentage = "Percentage";
        public const string Fixed = "Fixed";

        private static readonly HashSet<string> DiscountTypes = new() { Percentage, Fixed };
        private static readonly HashSet<string> Statuses = new() { "Active", "Inactive" };

        private readonly IPromotionRepository _repo;

        public PromotionService(IPromotionRepository repo)
        {
            _repo = repo;
        }

        // ---------------- CRUD ----------------

        public async Task<List<PromotionDto>> GetAllAsync()
        {
            var promotions = await _repo.GetAllAsync();
            var usage = (await _repo.GetUsageAsync()).ToDictionary(u => u.PromotionId);

            return promotions.Select(p => MapToDto(p, usage.GetValueOrDefault(p.PromotionId))).ToList();
        }

        public async Task<PromotionDto> GetByIdAsync(int id)
        {
            var promotion = await _repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Promotion not found.");

            var usage = (await _repo.GetUsageAsync()).FirstOrDefault(u => u.PromotionId == id);
            return MapToDto(promotion, usage);
        }

        public async Task<PromotionDto> CreateAsync(SavePromotionRequest request)
        {
            var code = NormalizeCode(request.Code);
            ValidateRequest(request);

            if (await _repo.CodeExistsAsync(code))
                throw new InvalidOperationException($"Promotion code '{code}' already exists.");

            var promotion = new Promotion { CreatedAt = DateTime.Now };
            Apply(promotion, request, code);

            await _repo.AddAsync(promotion);
            await _repo.SaveChangesAsync();

            return MapToDto(promotion, null);
        }

        public async Task UpdateAsync(int id, SavePromotionRequest request)
        {
            var promotion = await _repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Promotion not found.");

            var code = NormalizeCode(request.Code);
            ValidateRequest(request);

            if (await _repo.CodeExistsAsync(code, excludeId: id))
                throw new InvalidOperationException($"Promotion code '{code}' already exists.");

            Apply(promotion, request, code);
            promotion.UpdatedAt = DateTime.Now;

            await _repo.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var promotion = await _repo.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Promotion not found.");

            // Keep order history consistent: a used code can only be deactivated
            if (await _repo.IsUsedAsync(id))
                throw new InvalidOperationException(
                    "Promotion has been used by orders. Set it to Inactive instead of deleting.");

            _repo.Remove(promotion);
            await _repo.SaveChangesAsync();
        }

        // ---------------- Apply at checkout ----------------

        public async Task<PromotionApplyResult> ValidateAsync(string code, decimal orderAmount)
        {
            if (string.IsNullOrWhiteSpace(code))
                throw new ArgumentException("Promotion code is required.");

            var normalized = NormalizeCode(code);
            var promotion = await _repo.GetByCodeAsync(normalized)
                ?? throw new ArgumentException($"Promotion code '{normalized}' does not exist.");

            var today = DateTime.Today;

            if (promotion.Status != "Active")
                throw new ArgumentException($"Promotion code '{normalized}' is inactive.");

            if (today < promotion.StartDate.Date)
                throw new ArgumentException($"Promotion code '{normalized}' starts on {promotion.StartDate:dd/MM/yyyy}.");

            if (today > promotion.EndDate.Date)
                throw new ArgumentException($"Promotion code '{normalized}' has expired.");

            if (orderAmount < promotion.MinOrderValue)
                throw new ArgumentException(
                    $"Order must be at least {promotion.MinOrderValue:N0} VND to use '{normalized}'.");

            return new PromotionApplyResult
            {
                PromotionId = promotion.PromotionId,
                Code = promotion.Code,
                Discount = CalculateDiscount(promotion.DiscountType, promotion.DiscountValue, orderAmount)
            };
        }

        /// <summary>Discount on goods amount only (shipping is not discounted). Never exceeds the amount.</summary>
        public static decimal CalculateDiscount(string discountType, decimal discountValue, decimal orderAmount)
        {
            if (orderAmount <= 0) return 0;

            var discount = discountType == Percentage
                ? Math.Round(orderAmount * discountValue / 100m, 0, MidpointRounding.AwayFromZero)   // VND has no decimals
                : discountValue;

            return Math.Min(discount, orderAmount);
        }

        // ---------------- Helpers ----------------

        private static string NormalizeCode(string code) => (code ?? string.Empty).Trim().ToUpperInvariant();

        private static void ValidateRequest(SavePromotionRequest r)
        {
            if (!DiscountTypes.Contains(r.DiscountType))
                throw new ArgumentException("DiscountType must be 'Percentage' or 'Fixed'.");

            if (r.DiscountValue <= 0)
                throw new ArgumentException("DiscountValue must be greater than 0.");

            if (r.DiscountType == Percentage && r.DiscountValue > 100)
                throw new ArgumentException("Percentage discount cannot exceed 100.");

            if (r.MinOrderValue < 0)
                throw new ArgumentException("MinOrderValue cannot be negative.");

            if (r.EndDate.Date < r.StartDate.Date)
                throw new ArgumentException("EndDate must be on or after StartDate.");

            if (!Statuses.Contains(r.Status))
                throw new ArgumentException("Status must be 'Active' or 'Inactive'.");
        }

        private static void Apply(Promotion p, SavePromotionRequest r, string code)
        {
            p.Code = code;
            p.Description = string.IsNullOrWhiteSpace(r.Description) ? null : r.Description.Trim();
            p.DiscountType = r.DiscountType;
            p.DiscountValue = r.DiscountValue;
            p.MinOrderValue = r.MinOrderValue;
            p.StartDate = r.StartDate.Date;
            p.EndDate = r.EndDate.Date;
            p.Status = r.Status;
        }

        public static string GetDisplayStatus(Promotion p)
        {
            if (p.Status != "Active") return p.Status;
            if (DateTime.Today > p.EndDate.Date) return "Expired";
            if (DateTime.Today < p.StartDate.Date) return "Scheduled";
            return "Active";
        }

        private static PromotionDto MapToDto(Promotion p, PromotionUsage? usage) => new()
        {
            PromotionId = p.PromotionId,
            Code = p.Code,
            Description = p.Description,
            DiscountType = p.DiscountType,
            DiscountValue = p.DiscountValue,
            MinOrderValue = p.MinOrderValue,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            Status = p.Status,
            DisplayStatus = GetDisplayStatus(p),
            UsageCount = usage?.UsageCount ?? 0,
            TotalDiscount = usage?.TotalDiscount ?? 0
        };
    }
}
