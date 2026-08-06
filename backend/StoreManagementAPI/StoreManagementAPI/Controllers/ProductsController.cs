using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Models;
using StoreManagementAPI.Data;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly CatalogContext _context;
    public ProductsController(CatalogContext context)
    {
        _context = context;
    }

    //// GET: api/Product
    //[HttpGet]
    //public async Task<ActionResult<IEnumerable<Product>>> GetProduct()
    //{
    //    return await _context.Products.ToListAsync();
    //}

    // GET: api/Products
    // GET: api/Products?keyword=coca&status=active

    //[HttpGet]
    //public async Task<ActionResult<IEnumerable<Product>>> GetProduct(
    //    [FromQuery] string? keyword,
    //    [FromQuery] string? status)
    //{
    //    var query = _context.Products.AsQueryable();

    //    if (!string.IsNullOrWhiteSpace(status))
    //    {
    //        var s = status.Trim().ToLower();
    //        query = query.Where(p =>
    //            p.Status != null &&
    //            p.Status.ToLower() == s);
    //    }

    //    if (!string.IsNullOrWhiteSpace(keyword))
    //    {
    //        var k = keyword.Trim().ToLower();
    //        query = query.Where(p =>
    //            (p.ProductName != null &&
    //                p.ProductName.ToLower().Contains(k)) ||
    //            (p.ProductCode != null &&
    //                p.ProductCode.ToLower().Contains(k)) ||
    //            (p.Barcode != null &&
    //                p.Barcode.ToLower().Contains(k)));
    //    }

    //    var products = await query
    //        .OrderBy(p => p.ProductName)
    //        .Take(100)
    //        .ToListAsync();

    //    return Ok(products);
    //}

    // GET: api/Products?keyword=coca&status=active&categoryId=2&minPrice=0&maxPrice=500000
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProduct(
        [FromQuery] string? keyword,
        [FromQuery] string? status,
        [FromQuery] int? categoryId,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice)
    {
        var query = _context.Products.AsQueryable();

        // Lọc theo status
        if (!string.IsNullOrWhiteSpace(status))
        {
            var s = status.Trim().ToLower();
            query = query.Where(p =>
                p.Status != null &&
                p.Status.ToLower() == s);
        }

        // Lọc theo keyword: tên / mã / barcode
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var k = keyword.Trim().ToLower();
            query = query.Where(p =>
                (p.ProductName != null &&
                    p.ProductName.ToLower().Contains(k)) ||
                (p.ProductCode != null &&
                    p.ProductCode.ToLower().Contains(k)) ||
                (p.Barcode != null &&
                    p.Barcode.ToLower().Contains(k)));
        }

        // Lọc theo category
        if (categoryId.HasValue)
        {
            query = query.Where(p =>
                p.CategoryId == categoryId.Value);
        }

        // Lọc theo khoảng giá
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

        var products = await query
            .OrderBy(p => p.ProductName)
            .Take(100)
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




}
