using CatalogService.API.Common.Paging;
using CatalogService.API.DTOs.Product;
using CatalogService.API.Filters;
using CatalogService.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CatalogService.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IWebHostEnvironment _env;

    private static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long MaxImageSize = 5 * 1024 * 1024; // 5 MB

    public ProductsController(IProductService productService, IWebHostEnvironment env)
    {
        _productService = productService;
        _env = env;
    }

    // POST: api/products/upload-image  (multipart/form-data, field "file")
    // Lưu ảnh vào wwwroot/images, trả về tên file để lưu vào Product.Image
    [Authorize(Roles = "Admin")]
    [HttpPost("upload-image")]
    [RequestSizeLimit(MaxImageSize + 1024 * 1024)] // + phần overhead của multipart
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (file.Length > MaxImageSize)
            return BadRequest(new { message = "Image must be 5 MB or smaller." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageExtensions.Contains(ext) || !file.ContentType.StartsWith("image/"))
            return BadRequest(new { message = "Only JPG, PNG, WEBP or GIF images are allowed." });

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var folder = Path.Combine(webRoot, "images");
        Directory.CreateDirectory(folder);

        // Tên ngẫu nhiên: tránh trùng và tránh ghi đè/đường dẫn độc hại từ tên file gốc
        var fileName = $"{Guid.NewGuid():N}{ext}";
        await using (var stream = System.IO.File.Create(Path.Combine(folder, fileName)))
        {
            await file.CopyToAsync(stream);
        }

        return Ok(new { fileName, url = $"/images/{fileName}" });
    }

   
   
    [HttpGet]
    public async Task<IActionResult> GetAll(
       [FromQuery] PagingRequest request)
    {
        var result = await _productService.GetPagedAsync(
            request.Page,
            request.PageSize,
            request.Keyword,
            request.Status,
            request.CategoryId,
            request.MinPrice,
            request.MaxPrice,
            request.SortBy);

        return Ok(result);
    }

    // GET: api/products/1
    [HttpGet("{productId:int}")]
    public async Task<IActionResult> GetById(int productId)
    {
        return Ok(await _productService.GetByIdAsync(productId));
    }

    // GET: api/products/category/2?page=1&pageSize=10
    [HttpGet("category/{categoryId:int}")]
    public async Task<IActionResult> GetByCategory(
        int categoryId,
        [FromQuery] PagingRequest request)
    {
        var result = await _productService.GetByCategoryAsync(
            categoryId,
            request.Page,
            request.PageSize);

        return Ok(result);
    }

    // POST: api/products
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        var product = await _productService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { productId = product.ProductId },
            product);
    }

    // PUT: api/products/1
    [Authorize(Roles = "Admin")]
    [HttpPut("{productId:int}")]
    public async Task<IActionResult> Update(
        int productId,
        UpdateProductDto dto)
    {
        await _productService.UpdateAsync(productId, dto);

        return NoContent();
    }

    // DELETE: api/products/1
    [Authorize(Roles = "Admin")]
    [HttpDelete("{productId:int}")]
    public async Task<IActionResult> Delete(int productId)
    {
        await _productService.DeleteAsync(productId);

        return NoContent();
    }

    // PUT: api/products/1/stock
    // Internal: OrderService gọi khi đặt hàng
    [AllowAnonymous]
    [InternalApiKey]
    [HttpPut("{productId:int}/stock")]
    public async Task<IActionResult> UpdateStock(
        int productId,
        UpdateStockRequest request)
    {
        await _productService.UpdateStockAsync(
            productId,
            request.Quantity);

        return NoContent();
    }


    // GET: api/products/1/related
    [HttpGet("{productId:int}/related")]
    public async Task<IActionResult> GetRelatedProducts(
        int productId)
    {
        var product =
            await _productService.GetByIdAsync(productId);

        if (product == null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {productId} was not found."
            });
        }

        var products =
            await _productService.GetRelatedProductsAsync(productId);

        return Ok(products);
    }

    // Internal: ReviewService gọi khi đánh giá
    [AllowAnonymous]
    [InternalApiKey]
    [HttpPost("{id:int}/rating")]
    public async Task<IActionResult> UpdateRating(
    int id,
    [FromBody] RatingUpdateRequest request)
    {
        try
        {
            var updated =
                await _productService.UpdateRatingAsync(
                    id,
                    request.RatingDelta,
                    request.CountDelta);

            if (!updated)
            {
                return NotFound(new
                {
                    message = $"Product with ID {id} not found."
                });
            }

            return Ok(new
            {
                message = "Product rating updated successfully."
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}
