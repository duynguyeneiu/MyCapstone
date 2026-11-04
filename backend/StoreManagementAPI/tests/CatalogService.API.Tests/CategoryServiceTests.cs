using CatalogService.API.DTOs.Category;
using CatalogService.API.Exceptions;
using CatalogService.API.Interfaces;
using CatalogService.API.Models;
using CatalogService.API.Services;
using Moq;

namespace CatalogService.API.Tests;

public class CategoryServiceTests
{
    private readonly Mock<ICategoryRepository> _repo = new();
    private readonly CategoryService _sut;

    public CategoryServiceTests()
    {
        _sut = new CategoryService(_repo.Object);
    }

    private static Category NewCategory(int id = 3, string name = "Drinks") => new()
    {
        CategoryId = id,
        CategoryName = name,
        Status = "Active"
    };

    [Fact]
    public async Task GetByIdAsync_CategoryDoesNotExist_ThrowsNotFoundException()
    {
        _repo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Category?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.GetByIdAsync(99));
    }

    [Fact]
    public async Task CreateAsync_DuplicateName_ThrowsConflictException()
    {
        _repo.Setup(r => r.GetByNameAsync("Drinks")).ReturnsAsync(NewCategory());

        var dto = new CreateCategoryDto { CategoryName = "Drinks" };

        await Assert.ThrowsAsync<ConflictException>(() => _sut.CreateAsync(dto));
        _repo.Verify(r => r.AddAsync(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ParentCategoryDoesNotExist_ThrowsBadRequestException()
    {
        _repo.Setup(r => r.GetByNameAsync("Juice")).ReturnsAsync((Category?)null);
        _repo.Setup(r => r.ExistsAsync(99)).ReturnsAsync(false);

        var dto = new CreateCategoryDto { CategoryName = "Juice", ParentCategoryId = 99 };

        await Assert.ThrowsAsync<BadRequestException>(() => _sut.CreateAsync(dto));
    }

    [Fact]
    public async Task CreateAsync_ValidData_SavesCategory()
    {
        _repo.Setup(r => r.GetByNameAsync("Juice")).ReturnsAsync((Category?)null);
        _repo.Setup(r => r.ExistsAsync(3)).ReturnsAsync(true);

        var result = await _sut.CreateAsync(
            new CreateCategoryDto { CategoryName = "Juice", ParentCategoryId = 3 });

        Assert.Equal("Juice", result.CategoryName);
        Assert.Equal(3, result.ParentCategoryId);
        _repo.Verify(r => r.AddAsync(It.Is<Category>(c => c.CategoryName == "Juice")), Times.Once);
        _repo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_CategoryAsItsOwnParent_ThrowsBadRequestException()
    {
        _repo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(NewCategory(3));

        var dto = new UpdateCategoryDto { CategoryName = "Drinks", ParentCategoryId = 3 };

        await Assert.ThrowsAsync<BadRequestException>(() => _sut.UpdateAsync(3, dto));
        _repo.Verify(r => r.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_NameUsedByAnotherCategory_ThrowsConflictException()
    {
        _repo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(NewCategory(3, "Drinks"));
        _repo.Setup(r => r.GetByNameAsync("Snacks")).ReturnsAsync(NewCategory(4, "Snacks"));

        var dto = new UpdateCategoryDto { CategoryName = "Snacks" };

        await Assert.ThrowsAsync<ConflictException>(() => _sut.UpdateAsync(3, dto));
    }

    [Fact]
    public async Task DeleteAsync_CategoryHasProducts_ThrowsBadRequestException()
    {
        _repo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(NewCategory(3));
        _repo.Setup(r => r.HasProductsAsync(3)).ReturnsAsync(true);

        await Assert.ThrowsAsync<BadRequestException>(() => _sut.DeleteAsync(3));
        _repo.Verify(r => r.Delete(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_EmptyCategory_DeletesAndSaves()
    {
        var category = NewCategory(3);
        _repo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(category);
        _repo.Setup(r => r.HasProductsAsync(3)).ReturnsAsync(false);

        await _sut.DeleteAsync(3);

        _repo.Verify(r => r.Delete(category), Times.Once);
        _repo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }
}
