using ReviewService.API.Models;

namespace ReviewService.API.Interfaces
{
    public interface IReviewRepository
    {
        Task<IEnumerable<Review>> GetAllAsync();

        Task<IEnumerable<Review>> GetByProductIdAsync(int productId);

        Task<Review?> GetByIdAsync(int reviewId);

        Task<Review?> GetByUserAndProductAsync(int userId, int productId);

        Task<Review> AddAsync(Review review);

        Task UpdateAsync(Review review);

        Task DeleteAsync(Review review);
    }
}
