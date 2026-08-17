using ReviewService.API.Clients;
using ReviewService.API.DTOs;
using ReviewService.API.Interfaces;
using ReviewService.API.Models;

namespace ReviewService.API.Services
{
    public class ReviewsService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IOrderServiceClient _orderServiceClient;
        private readonly ICatalogServiceClient _catalogServiceClient;
        private readonly IUserServiceClient _userServiceClient;
        public ReviewsService(
    IReviewRepository reviewRepository,
    IOrderServiceClient orderServiceClient,
    ICatalogServiceClient catalogServiceClient,
    IUserServiceClient userServiceClient)
        {
            _reviewRepository = reviewRepository;
            _orderServiceClient = orderServiceClient;
            _catalogServiceClient = catalogServiceClient;
            _userServiceClient = userServiceClient;
        }
        public async Task<IEnumerable<ReviewResponseDto>> GetAllAsync()
        {
            var reviews = await _reviewRepository.GetAllAsync();

            return reviews.Select(MapToDto);
        }

        public async Task<IEnumerable<ReviewResponseDto>>
    GetByProductIdAsync(int productId)
        {
            var reviews =
                await _reviewRepository
                    .GetByProductIdAsync(productId);

            var result = new List<ReviewResponseDto>();

            foreach (var review in reviews)
            {
                var fullName =
                    await _userServiceClient
                        .GetUserFullNameAsync(review.UserId);

                result.Add(new ReviewResponseDto
                {
                    ReviewId = review.ReviewId,
                    ProductId = review.ProductId,
                    UserId = review.UserId,
                    UserName = fullName,
                    OrderId = review.OrderId,
                    Rating = review.Rating,
                    Comment = review.Comment,
                    CreatedAt = review.CreatedAt,
                    UpdatedAt = review.UpdatedAt
                });
            }

            return result;
        }

        public async Task<ReviewResponseDto?> GetByIdAsync(
            int reviewId)
        {
            var review =
                await _reviewRepository.GetByIdAsync(reviewId);

            return review == null
                ? null
                : MapToDto(review);
        }

        public async Task<ReviewResponseDto> CreateAsync(
     CreateReviewDto dto,
     int userId)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                throw new ArgumentException(
                    "Rating must be between 1 and 5.");
            }

            var existingReview =
                await _reviewRepository
                    .GetByUserAndProductAsync(
                        userId,
                        dto.ProductId);

            if (existingReview != null)
            {
                throw new InvalidOperationException(
                    "User has already reviewed this product.");
            }

            // Kiểm tra user đã mua sản phẩm chưa
            var orderId =
                await _orderServiceClient
                    .GetPurchasedOrderIdAsync(
                        userId,
                        dto.ProductId);

            if (orderId == null)
            {
                throw new UnauthorizedAccessException(
                    "User has not purchased this product.");
            }

            var review = new Review
            {
                ProductId = dto.ProductId,
                UserId = userId,
                OrderId = orderId.Value,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.Now
            };

            var createdReview =
                await _reviewRepository.AddAsync(review);
            await _catalogServiceClient.UpdateProductRatingAsync(
      review.ProductId,
      review.Rating,
      1);
            return MapToDto(createdReview);
        }

        public async Task<bool> UpdateAsync(
     int reviewId,
     UpdateReviewDto dto,
     int userId)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                throw new ArgumentException(
                    "Rating must be between 1 and 5.");
            }

            var review =
                await _reviewRepository
                    .GetByIdAsync(reviewId);

            if (review == null)
            {
                return false;
            }

            if (review.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only update your own review.");
            }

            var oldRating = review.Rating;

            review.Rating = dto.Rating;
            review.Comment = dto.Comment;
            review.UpdatedAt = DateTime.Now;

            await _reviewRepository.UpdateAsync(review);

            var ratingDelta =
                dto.Rating - oldRating;

            if (ratingDelta != 0)
            {
                await _catalogServiceClient
                    .UpdateProductRatingAsync(
                        review.ProductId,
                        ratingDelta,
                        0);
            }

            return true;
        }

        public async Task<bool> DeleteAsync(
     int reviewId,
     int userId)
        {
            var review =
                await _reviewRepository
                    .GetByIdAsync(reviewId);

            if (review == null)
            {
                return false;
            }

            if (review.UserId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only delete your own review.");
            }

            var rating = review.Rating;
            var productId = review.ProductId;

            await _reviewRepository.DeleteAsync(review);

            await _catalogServiceClient
                .UpdateProductRatingAsync(
                    productId,
                    -rating,
                    -1);

            return true;
        }

        private static ReviewResponseDto MapToDto(
            Review review)
        {
            return new ReviewResponseDto
            {
                ReviewId = review.ReviewId,
                ProductId = review.ProductId,
                UserId = review.UserId,
                OrderId = review.OrderId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt
            };
        }
    }
}
