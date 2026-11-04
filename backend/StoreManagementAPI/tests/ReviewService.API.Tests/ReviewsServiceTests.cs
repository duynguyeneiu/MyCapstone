using Moq;
using ReviewService.API.DTOs;
using ReviewService.API.Interfaces;
using ReviewService.API.Models;
using ReviewService.API.Services;

namespace ReviewService.API.Tests;

public class ReviewsServiceTests
{
    private readonly Mock<IReviewRepository> _repo = new();
    private readonly Mock<IOrderServiceClient> _orders = new();
    private readonly Mock<ICatalogServiceClient> _catalog = new();
    private readonly Mock<IUserServiceClient> _users = new();
    private readonly ReviewsService _sut;

    public ReviewsServiceTests()
    {
        _sut = new ReviewsService(_repo.Object, _orders.Object, _catalog.Object, _users.Object);
    }

    private static Review ExistingReview(int userId = 1, int rating = 3) => new()
    {
        ReviewId = 100,
        ProductId = 10,
        UserId = userId,
        OrderId = 20,
        Rating = rating,
        Comment = "Good"
    };

    // ---------- Create ----------

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    [InlineData(-1)]
    public async Task CreateAsync_RatingOutsideOneToFive_ThrowsArgumentException(int rating)
    {
        var dto = new CreateReviewDto { ProductId = 10, Rating = rating };

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CreateAsync(dto, userId: 1));
        _repo.Verify(r => r.AddAsync(It.IsAny<Review>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_UserAlreadyReviewedProduct_ThrowsInvalidOperationException()
    {
        _repo.Setup(r => r.GetByUserAndProductAsync(1, 10)).ReturnsAsync(ExistingReview());

        var dto = new CreateReviewDto { ProductId = 10, Rating = 5 };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(dto, userId: 1));
    }

    [Fact]
    public async Task CreateAsync_UserHasNotPurchasedProduct_ThrowsUnauthorizedAccessException()
    {
        _repo.Setup(r => r.GetByUserAndProductAsync(1, 10)).ReturnsAsync((Review?)null);
        _orders.Setup(o => o.GetPurchasedOrderIdAsync(1, 10)).ReturnsAsync((int?)null);

        var dto = new CreateReviewDto { ProductId = 10, Rating = 5 };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.CreateAsync(dto, userId: 1));
        _repo.Verify(r => r.AddAsync(It.IsAny<Review>()), Times.Never);
        _catalog.Verify(c => c.UpdateProductRatingAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ValidPurchase_SavesReviewAndAddsRatingToProduct()
    {
        _repo.Setup(r => r.GetByUserAndProductAsync(1, 10)).ReturnsAsync((Review?)null);
        _orders.Setup(o => o.GetPurchasedOrderIdAsync(1, 10)).ReturnsAsync(20);
        _repo.Setup(r => r.AddAsync(It.IsAny<Review>()))
            .ReturnsAsync((Review r) => { r.ReviewId = 100; return r; });

        var result = await _sut.CreateAsync(
            new CreateReviewDto { ProductId = 10, Rating = 5, Comment = "Great" }, userId: 1);

        Assert.Equal(100, result.ReviewId);
        Assert.Equal(20, result.OrderId);
        Assert.Equal(5, result.Rating);
        _catalog.Verify(c => c.UpdateProductRatingAsync(10, 5, 1), Times.Once);
    }

    // ---------- Update ----------

    [Fact]
    public async Task UpdateAsync_ReviewDoesNotExist_ReturnsFalse()
    {
        _repo.Setup(r => r.GetByIdAsync(100)).ReturnsAsync((Review?)null);

        var updated = await _sut.UpdateAsync(100, new UpdateReviewDto { Rating = 4 }, userId: 1);

        Assert.False(updated);
    }

    [Fact]
    public async Task UpdateAsync_ReviewOfAnotherUser_ThrowsUnauthorizedAccessException()
    {
        _repo.Setup(r => r.GetByIdAsync(100)).ReturnsAsync(ExistingReview(userId: 2));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _sut.UpdateAsync(100, new UpdateReviewDto { Rating = 4 }, userId: 1));
        _repo.Verify(r => r.UpdateAsync(It.IsAny<Review>()), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_RatingChanged_SendsOnlyTheDifferenceToCatalog()
    {
        var review = ExistingReview(userId: 1, rating: 3);
        _repo.Setup(r => r.GetByIdAsync(100)).ReturnsAsync(review);

        var updated = await _sut.UpdateAsync(100, new UpdateReviewDto { Rating = 5, Comment = "Better" }, userId: 1);

        Assert.True(updated);
        Assert.Equal(5, review.Rating);
        _catalog.Verify(c => c.UpdateProductRatingAsync(10, 2, 0), Times.Once); // +2, review count unchanged
    }

    [Fact]
    public async Task UpdateAsync_OnlyCommentChanged_DoesNotCallCatalog()
    {
        _repo.Setup(r => r.GetByIdAsync(100)).ReturnsAsync(ExistingReview(userId: 1, rating: 4));

        await _sut.UpdateAsync(100, new UpdateReviewDto { Rating = 4, Comment = "Edited" }, userId: 1);

        _catalog.Verify(c => c.UpdateProductRatingAsync(It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    // ---------- Delete ----------

    [Fact]
    public async Task DeleteAsync_ReviewOfAnotherUser_ThrowsUnauthorizedAccessException()
    {
        _repo.Setup(r => r.GetByIdAsync(100)).ReturnsAsync(ExistingReview(userId: 2));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.DeleteAsync(100, userId: 1));
        _repo.Verify(r => r.DeleteAsync(It.IsAny<Review>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_OwnReview_RemovesRatingAndCountFromProduct()
    {
        var review = ExistingReview(userId: 1, rating: 4);
        _repo.Setup(r => r.GetByIdAsync(100)).ReturnsAsync(review);

        var deleted = await _sut.DeleteAsync(100, userId: 1);

        Assert.True(deleted);
        _repo.Verify(r => r.DeleteAsync(review), Times.Once);
        _catalog.Verify(c => c.UpdateProductRatingAsync(10, -4, -1), Times.Once);
    }

    // ---------- Read ----------

    [Fact]
    public async Task GetByProductIdAsync_FillsReviewerNameFromUserService()
    {
        _repo.Setup(r => r.GetByProductIdAsync(10)).ReturnsAsync(new[] { ExistingReview(userId: 1) });
        _users.Setup(u => u.GetUserFullNameAsync(1)).ReturnsAsync("Nguyen Duy");

        var reviews = (await _sut.GetByProductIdAsync(10)).ToList();

        Assert.Single(reviews);
        Assert.Equal("Nguyen Duy", reviews[0].UserName);
    }
}
