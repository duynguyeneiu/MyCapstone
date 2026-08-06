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
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProduct()
    {
        return await _context.Products.ToListAsync();
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
