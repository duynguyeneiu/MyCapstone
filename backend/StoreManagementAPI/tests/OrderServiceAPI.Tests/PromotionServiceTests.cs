using Moq;
using OrderServiceAPI.DTOs.Promotion;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;
using OrderServiceAPI.Services;

namespace OrderServiceAPI.Tests;

public class PromotionServiceTests
{
    private readonly Mock<IPromotionRepository> _repo = new();
    private readonly PromotionService _sut;

    public PromotionServiceTests()
    {
        _sut = new PromotionService(_repo.Object);
        _repo.Setup(r => r.GetUsageAsync()).ReturnsAsync(new List<PromotionUsage>());
    }

    // ---------- helpers ----------

    private static Promotion Promo(
        string code = "WELCOME10", string type = "Percentage", decimal value = 10,
        decimal minOrder = 0, int startOffset = -1, int endOffset = 30, string status = "Active") => new()
    {
        PromotionId = 1,
        Code = code,
        DiscountType = type,
        DiscountValue = value,
        MinOrderValue = minOrder,
        StartDate = DateTime.Today.AddDays(startOffset),
        EndDate = DateTime.Today.AddDays(endOffset),
        Status = status
    };

    private void CodeExists(Promotion p) =>
        _repo.Setup(r => r.GetByCodeAsync(p.Code)).ReturnsAsync(p);

    private static SavePromotionRequest NewRequest(
        string code = "NEW10", string type = "Percentage", decimal value = 10) => new()
    {
        Code = code,
        DiscountType = type,
        DiscountValue = value,
        MinOrderValue = 0,
        StartDate = DateTime.Today,
        EndDate = DateTime.Today.AddDays(10),
        Status = "Active"
    };

    // ---------- CalculateDiscount ----------

    [Theory]
    [InlineData("Percentage", 10, 200000, 20000)]
    [InlineData("Percentage", 15, 33333, 5000)]      // rounded to whole VND
    [InlineData("Percentage", 100, 50000, 50000)]
    [InlineData("Fixed", 50000, 300000, 50000)]
    [InlineData("Fixed", 50000, 20000, 20000)]       // never more than the order amount
    [InlineData("Fixed", 50000, 0, 0)]
    public void CalculateDiscount_ReturnsExpectedAmount(string type, decimal value, decimal amount, decimal expected)
    {
        Assert.Equal(expected, PromotionService.CalculateDiscount(type, value, amount));
    }

    // ---------- ValidateAsync ----------

    [Fact]
    public async Task ValidateAsync_ValidCode_ReturnsDiscount_AndIgnoresCaseAndSpaces()
    {
        CodeExists(Promo(value: 10, minOrder: 100000));

        var result = await _sut.ValidateAsync("  welcome10 ", 200000);

        Assert.Equal(1, result.PromotionId);
        Assert.Equal("WELCOME10", result.Code);
        Assert.Equal(20000m, result.Discount);
    }

    [Fact]
    public async Task ValidateAsync_UnknownCode_ThrowsArgumentException()
    {
        _repo.Setup(r => r.GetByCodeAsync(It.IsAny<string>())).ReturnsAsync((Promotion?)null);

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.ValidateAsync("NOPE", 100000));
    }

    [Fact]
    public async Task ValidateAsync_InactiveCode_ThrowsArgumentException()
    {
        CodeExists(Promo(status: "Inactive"));

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => _sut.ValidateAsync("WELCOME10", 100000));
        Assert.Contains("inactive", ex.Message);
    }

    [Fact]
    public async Task ValidateAsync_ExpiredCode_ThrowsArgumentException()
    {
        CodeExists(Promo(startOffset: -30, endOffset: -1));

        var ex = await Assert.ThrowsAsync<ArgumentException>(() => _sut.ValidateAsync("WELCOME10", 100000));
        Assert.Contains("expired", ex.Message);
    }

    [Fact]
    public async Task ValidateAsync_NotStartedYet_ThrowsArgumentException()
    {
        CodeExists(Promo(startOffset: 2, endOffset: 10));

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.ValidateAsync("WELCOME10", 100000));
    }

    [Fact]
    public async Task ValidateAsync_LastDayOfPromotion_IsStillValid()
    {
        CodeExists(Promo(startOffset: -5, endOffset: 0));

        var result = await _sut.ValidateAsync("WELCOME10", 100000);

        Assert.Equal(10000m, result.Discount);
    }

    [Fact]
    public async Task ValidateAsync_BelowMinOrderValue_ThrowsArgumentException()
    {
        CodeExists(Promo(minOrder: 300000));

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.ValidateAsync("WELCOME10", 299999));
    }

    // ---------- Create / Update / Delete ----------

    [Fact]
    public async Task CreateAsync_DuplicateCode_ThrowsInvalidOperationException()
    {
        _repo.Setup(r => r.CodeExistsAsync("NEW10", null)).ReturnsAsync(true);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(NewRequest(code: "new10")));
        _repo.Verify(r => r.AddAsync(It.IsAny<Promotion>()), Times.Never);
    }

    [Theory]
    [InlineData("Percentage", 101)]
    [InlineData("Percentage", 0)]
    [InlineData("Fixed", -1000)]
    [InlineData("Free", 10)]
    public async Task CreateAsync_InvalidDiscount_ThrowsArgumentException(string type, decimal value)
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CreateAsync(NewRequest(type: type, value: value)));
    }

    [Fact]
    public async Task CreateAsync_EndBeforeStart_ThrowsArgumentException()
    {
        var request = NewRequest();
        request.EndDate = request.StartDate.AddDays(-1);

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CreateAsync(request));
    }

    [Fact]
    public async Task CreateAsync_Valid_SavesUppercaseCode()
    {
        var result = await _sut.CreateAsync(NewRequest(code: " summer25 "));

        Assert.Equal("SUMMER25", result.Code);
        _repo.Verify(r => r.AddAsync(It.Is<Promotion>(p => p.Code == "SUMMER25")), Times.Once);
        _repo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_CodeUsedByAnotherPromotion_ThrowsInvalidOperationException()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(Promo());
        _repo.Setup(r => r.CodeExistsAsync("SALE50K", 1)).ReturnsAsync(true);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.UpdateAsync(1, NewRequest(code: "SALE50K")));
    }

    [Fact]
    public async Task UpdateAsync_NotFound_ThrowsKeyNotFoundException()
    {
        _repo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Promotion?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.UpdateAsync(99, NewRequest()));
    }

    [Fact]
    public async Task DeleteAsync_UsedByOrders_ThrowsInvalidOperationException()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(Promo());
        _repo.Setup(r => r.IsUsedAsync(1)).ReturnsAsync(true);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.DeleteAsync(1));
        _repo.Verify(r => r.Remove(It.IsAny<Promotion>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_NotUsed_RemovesPromotion()
    {
        var promo = Promo();
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(promo);
        _repo.Setup(r => r.IsUsedAsync(1)).ReturnsAsync(false);

        await _sut.DeleteAsync(1);

        _repo.Verify(r => r.Remove(promo), Times.Once);
    }

    // ---------- Display status ----------

    [Theory]
    [InlineData("Active", -5, 5, "Active")]
    [InlineData("Active", -10, -1, "Expired")]
    [InlineData("Active", 3, 10, "Scheduled")]
    [InlineData("Inactive", -10, -1, "Inactive")]
    public void GetDisplayStatus_ReturnsExpected(string status, int start, int end, string expected)
    {
        Assert.Equal(expected, PromotionService.GetDisplayStatus(Promo(status: status, startOffset: start, endOffset: end)));
    }
}
