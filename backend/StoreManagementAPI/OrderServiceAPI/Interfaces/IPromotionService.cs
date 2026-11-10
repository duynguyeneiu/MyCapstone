using OrderServiceAPI.DTOs.Promotion;

namespace OrderServiceAPI.Interfaces
{
    public interface IPromotionService
    {
        Task<List<PromotionDto>> GetAllAsync();
        Task<PromotionDto> GetByIdAsync(int id);
        Task<PromotionDto> CreateAsync(SavePromotionRequest request);
        Task UpdateAsync(int id, SavePromotionRequest request);
        Task DeleteAsync(int id);

        /// <summary>
        /// Checks the code against the goods amount and returns the discount.
        /// Throws ArgumentException (400) with the reason when the code cannot be used.
        /// </summary>
        Task<PromotionApplyResult> ValidateAsync(string code, decimal orderAmount);
    }
}
