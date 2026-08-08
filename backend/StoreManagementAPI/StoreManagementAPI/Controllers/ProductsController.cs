using CatalogService.API.Common.Paging;
using CatalogService.API.DTOs.Product;
using CatalogService.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CatalogService.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
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
    [HttpPut("{productId:int}")]
    public async Task<IActionResult> Update(
        int productId,
        UpdateProductDto dto)
    {
        await _productService.UpdateAsync(productId, dto);

        return NoContent();
    }

    // DELETE: api/products/1
    [HttpDelete("{productId:int}")]
    public async Task<IActionResult> Delete(int productId)
    {
        await _productService.DeleteAsync(productId);

        return NoContent();
    }

    // PUT: api/products/1/stock
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
}