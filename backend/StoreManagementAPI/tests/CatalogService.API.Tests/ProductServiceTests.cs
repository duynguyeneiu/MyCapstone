using CatalogService.API.DTOs.Product;
using CatalogService.API.Exceptions;
using CatalogService.API.Interfaces;
using CatalogService.API.Models;
using CatalogService.API.Services;
using Microsoft.Extensions.Configuration;
using Moq;

namespace CatalogService.API.Tests;

public class ProductServiceTests
{
    private readonly Mock<IProductRepository> _productRepo = new();
    private readonly Mock<ICategoryRepository> _categoryRepo = new();
    private readonly ProductService _sut;

    public ProductServiceTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["AppSettings:BaseUrl"] = "http://localhost:5001"
            })
            .Build();

        _sut = new ProductService(_productRepo.Object, _categoryRepo.Object, config);
    }

    private static Product NewProduct(int id = 1, int stock = 10) => new()
    {
        ProductId = id,
        ProductCode = "P001",
        Barcode = "8930001",
        ProductName = "Milk",
        Unit = "box",
        ImportPrice = 15000,
        SalePrice = 20000,
        QuantityInStock = stock,
        Image = "milk.png",
        CategoryId = 1,
        Status = "Active",
        Category = new Category { CategoryId = 1, CategoryName = "Drinks", Status = "Active" }
    };

    private static CreateProductDto NewCreateDto() => new()
    {
        ProductCode = "P001",
        Barcode = "8930001",
        ProductName = "Milk",
        Unit = "box",
        ImportPrice = 15000,
        SalePrice = 20000,
        QuantityInStock = 10,
        CategoryId = 1
    };

    // ---------- GetById ----------

    [Fact]
    public async Task GetByIdAsync_ProductDoesNotExist_ThrowsNotFoundException()
    {
        _productRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.GetByIdAsync(99));
    }

    [Fact]
    public async Task GetByIdAsync_ProductExists_ReturnsDtoWithFullImageUrl()
    {
        _productRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(NewProduct());

        var dto = await _sut.GetByIdAsync(1);

        Assert.Equal("Milk", dto.ProductName);
        Assert.Equal("Drinks", dto.CategoryName);
        Assert.Equal("http://localhost:5001/images/milk.png", dto.Image);
    }

    // ---------- Create ----------

    [Fact]
    public async Task CreateAsync_DuplicateProductCode_ThrowsConflictException()
    {
        _productRepo.Setup(r => r.GetByCodeAsync("P001")).ReturnsAsync(NewProduct());

        await Assert.ThrowsAsync<ConflictException>(() => _sut.CreateAsync(NewCreateDto()));
        _productRepo.Verify(r => r.AddAsync(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_DuplicateBarcode_ThrowsConflictException()
    {
        _productRepo.Setup(r => r.GetByCodeAsync("P001")).ReturnsAsync((Product?)null);
        _productRepo.Setup(r => r.GetByBarcodeAsync("8930001")).ReturnsAsync(NewProduct(id: 2));

        await Assert.ThrowsAsync<ConflictException>(() => _sut.CreateAsync(NewCreateDto()));
        _productRepo.Verify(r => r.AddAsync(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_CategoryDoesNotExist_ThrowsBadRequestException()
    {
        _productRepo.Setup(r => r.GetByCodeAsync("P001")).ReturnsAsync((Product?)null);
        _productRepo.Setup(r => r.GetByBarcodeAsync("8930001")).ReturnsAsync((Product?)null);
        _categoryRepo.Setup(r => r.ExistsAsync(1)).ReturnsAsync(false);

        await Assert.ThrowsAsync<BadRequestException>(() => _sut.CreateAsync(NewCreateDto()));
        _productRepo.Verify(r => r.AddAsync(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_ValidData_SavesProduct()
    {
        _productRepo.Setup(r => r.GetByCodeAsync("P001")).ReturnsAsync((Product?)null);
        _productRepo.Setup(r => r.GetByBarcodeAsync("8930001")).ReturnsAsync((Product?)null);
        _categoryRepo.Setup(r => r.ExistsAsync(1)).ReturnsAsync(true);

        var result = await _sut.CreateAsync(NewCreateDto());

        Assert.Equal("P001", result.ProductCode);
        Assert.Equal(20000m, result.SalePrice);
        _productRepo.Verify(r => r.AddAsync(It.Is<Product>(p =>
            p.ProductCode == "P001" && p.SalePrice == 20000m && p.CategoryId == 1)), Times.Once);
        _productRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    // ---------- Stock ----------

    [Fact]
    public async Task UpdateStockAsync_NotEnoughStock_ThrowsBadRequestException()
    {
        _productRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(NewProduct(stock: 2));

        await Assert.ThrowsAsync<BadRequestException>(() => _sut.UpdateStockAsync(1, 5));
        _productRepo.Verify(r => r.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task UpdateStockAsync_EnoughStock_DecreasesQuantity()
    {
        var product = NewProduct(stock: 10);
        _productRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(product);

        await _sut.UpdateStockAsync(1, 3);

        Assert.Equal(7, product.QuantityInStock);
        _productRepo.Verify(r => r.Update(product), Times.Once);
        _productRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateStockAsync_ProductDoesNotExist_ThrowsNotFoundException()
    {
        _productRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.UpdateStockAsync(99, 1));
    }

    // ---------- Delete ----------

    [Fact]
    public async Task DeleteAsync_ProductDoesNotExist_ThrowsNotFoundException()
    {
        _productRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Product?)null);

        await Assert.ThrowsAsync<NotFoundException>(() => _sut.DeleteAsync(99));
        _productRepo.Verify(r => r.Delete(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_ProductExists_DeletesAndSaves()
    {
        var product = NewProduct();
        _productRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(product);

        await _sut.DeleteAsync(1);

        _productRepo.Verify(r => r.Delete(product), Times.Once);
        _productRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    // ---------- Rating ----------

    // Expected to FAIL with the current code: ProductService passes
    // (ratingDelta, productId, countDelta) to the repository instead of
    // (productId, ratingDelta, countDelta), so ratings are written to the wrong product.
    [Fact]
    public async Task UpdateRatingAsync_ForwardsArgumentsToRepositoryInCorrectOrder()
    {
        _productRepo.Setup(r => r.UpdateRatingAsync(5, 4, 1)).ReturnsAsync(true);

        var result = await _sut.UpdateRatingAsync(productId: 5, ratingDelta: 4, countDelta: 1);

        Assert.True(result,
            "ProductService.UpdateRatingAsync must call the repository with (productId, ratingDelta, countDelta).");
        _productRepo.Verify(r => r.UpdateRatingAsync(5, 4, 1), Times.Once);
    }
}
