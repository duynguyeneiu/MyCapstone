using CatalogService.API.DTOs.Product;
using CatalogService.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly CatalogContext _context;
    private readonly IProductService _productService;
    public ProductsController(CatalogContext context, IProductService productService)
    {
        _context = context;
        _productService = productService;
    }

    // GET: api/Product
    //[HttpGet]
    //public async Task<ActionResult<IEnumerable<Product>>> GetProduct()
    //{
    //    return await _context.Products.ToListAsync();
    //}
    [HttpGet]
    public async Task<IActionResult> GetProduct(
    [FromQuery] string? keyword,
    [FromQuery] string? status,
    [FromQuery] int? categoryId,
    [FromQuery] decimal? minPrice,
    [FromQuery] decimal? maxPrice,
    [FromQuery] string? sortBy)
    {
        var query = _context.Products
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            var s = status.Trim().ToLower();

            query = query.Where(p =>
                p.Status != null &&
                p.Status.ToLower() == s);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var k = keyword.Trim().ToLower();

            query = query.Where(p =>
                p.ProductName.ToLower().Contains(k) ||
                p.ProductCode.ToLower().Contains(k) ||
                (p.Barcode != null &&
                 p.Barcode.ToLower().Contains(k)));
        }

        if (categoryId.HasValue)
        {
            var selectedCategoryId =
                categoryId.Value;

            var categoryIds =
                await _context.Categories
                    .AsNoTracking()
                    .Where(c =>
                        c.CategoryId ==
                            selectedCategoryId ||
                        c.ParentCategoryId ==
                            selectedCategoryId)
                    .Select(c => c.CategoryId)
                    .ToListAsync();

            query = query.Where(p =>
                categoryIds.Contains(
                    p.CategoryId));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p =>
                p.SalePrice >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p =>
                p.SalePrice <= maxPrice.Value);
        }

        var normalizedSort =
            sortBy?.Trim().ToLower();

        query = normalizedSort switch
        {
            "pricelowhigh" =>
                query.OrderBy(p =>
                    p.SalePrice),

            "pricehighlow" =>
                query.OrderByDescending(p =>
                    p.SalePrice),

            "newest" =>
                query.OrderByDescending(p =>
                    p.CreatedAt),

            _ =>
                query.OrderBy(p =>
                    p.ProductName)
        };

        var products = await query
            .Take(100)
            .Select(p => new
            {
                p.ProductId,
                p.ProductCode,
                p.ProductName,
                p.Barcode,
                p.CategoryId,

                CategoryName =
                    p.Category.CategoryName,

                p.Unit,
                p.SalePrice,
                p.QuantityInStock,
                p.Status,
                p.Image,
                p.CreatedAt,
                p.UpdatedAt
            })
            .ToListAsync();

        return Ok(products);
    }

    // GET: api/Product/5
    [HttpGet("{productid}")]
    public async Task<ActionResult<Product>> GetProduct(int productid)
    {
        var product = await _context.Products.FindAsync(productid);

        if (product == null)
        {
            return NotFound();
        }

        return product;
    }

    // PUT: api/Product/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{productid}")]
    public async Task<IActionResult> PutProduct(int? productid, Product product)
    {
        if (productid != product.ProductId)
        {
            return BadRequest();
        }

        _context.Entry(product).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProductExists(productid))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // POST: api/Product
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Product>> PostProduct(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetProduct", new { productid = product.ProductId }, product);
    }

    // DELETE: api/Product/5
    [HttpDelete("{productid}")]
    public async Task<IActionResult> DeleteProduct(int? productid)
    {
        var product = await _context.Products.FindAsync(productid);
        if (product == null)
        {
            return NotFound();
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    //mobile you may like

    [HttpGet("{id:int}/related")]
    public async Task<ActionResult<IEnumerable<Product>>>
    GetRelatedProducts(int id)
    {
        var currentProduct =
            await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(product =>
                    product.ProductId == id);

        if (currentProduct == null)
        {
            return NotFound(new
            {
                message =
                    $"Product with ID {id} was not found."
            });
        }

        var relatedProducts =
            await _context.Products
                .AsNoTracking()
                .Where(product =>
                    product.CategoryId ==
                        currentProduct.CategoryId &&
                    product.ProductId !=
                        currentProduct.ProductId &&
                    product.Status == "Active")
                .OrderByDescending(product =>
                    product.CreatedAt)
                .Take(10)
                .ToListAsync();

        return Ok(relatedProducts);
    }


    private bool ProductExists(int? productid)
    {
        return _context.Products.Any(e => e.ProductId == productid);
    }


    [HttpPut("{productId:int}/stock")]
    public async Task<IActionResult> UpdateStock(
    int productId,
    UpdateStockRequest request)
    {
        await _productService.UpdateStockAsync(productId, request.Quantity);

        return NoContent();
    }
}
