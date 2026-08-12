using ReviewService.API.DTOs;
using ReviewService.API.Models;

namespace ReviewService.API.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewResponseDto>> GetAllAsync();

        Task<IEnumerable<ReviewResponseDto>> GetByProductIdAsync(
            int productId);

        Task<ReviewResponseDto?> GetByIdAsync(int reviewId);

        Task<ReviewResponseDto> CreateAsync(
            CreateReviewDto dto,
            int userId);

        Task<bool> UpdateAsync(
            int reviewId,
            UpdateReviewDto dto,
            int userId);

        Task<bool> DeleteAsync(
            int reviewId,
            int userId);
    }
}
