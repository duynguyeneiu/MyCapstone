using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Models;
using StoreManagementAPI.Data;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly CatalogContext _context;
    public CategoriesController(CatalogContext context)
    {
        _context = context;
    }

    // GET: api/Category
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategory()
    {
        return await _context.Categories.ToListAsync();
    }

    // GET: api/Category/5
    [HttpGet("{categoryid}")]
    public async Task<ActionResult<Category>> GetCategory(int categoryid)
    {
        var category = await _context.Categories.FindAsync(categoryid);

        if (category == null)
        {
            return NotFound();
        }

        return category;
    }

    // PUT: api/Category/5
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPut("{categoryid}")]
    public async Task<IActionResult> PutCategory(int? categoryid, Category category)
    {
        if (categoryid != category.CategoryId)
        {
            return BadRequest();
        }

        _context.Entry(category).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!CategoryExists(categoryid))
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

    // POST: api/Category
    // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
    [HttpPost]
    public async Task<ActionResult<Category>> PostCategory(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction("GetCategory", new { categoryid = category.CategoryId }, category);
    }

    // DELETE: api/Category/5
    [HttpDelete("{categoryid}")]
    public async Task<IActionResult> DeleteCategory(int? categoryid)
    {
        var category = await _context.Categories.FindAsync(categoryid);
        if (category == null)
        {
            return NotFound();
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool CategoryExists(int? categoryid)
    {
        return _context.Categories.Any(e => e.CategoryId == categoryid);
    }
}
