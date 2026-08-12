using CatalogService.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using CatalogService.API.Data;
using CatalogService.API.Models;


namespace CatalogService.API.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly CatalogContext _context;

        public ProductRepository(CatalogContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products
                .Include(p => p.Category)
                .ToListAsync();
        }

        public async Task<Product?> GetByIdAsync(int productId)
        {
            return await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProductId == productId);
        }

        public async Task<Product?> GetByCodeAsync(string productCode)
        {
            return await _context.Products
                .FirstOrDefaultAsync(p => p.ProductCode == productCode);
        }

        public async Task<Product?> GetByBarcodeAsync(string barcode)
        {
            return await _context.Products
                .FirstOrDefaultAsync(p => p.Barcode == barcode);
        }

        public async Task<IEnumerable<Product>> GetByCategoryAsync(int categoryId)
        {
            return await _context.Products
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Product>> SearchAsync(string keyword)
        {
            keyword = keyword.ToLower();

            return await _context.Products
                .Where(p =>
                    p.ProductName.ToLower().Contains(keyword) ||
                    p.ProductCode.ToLower().Contains(keyword))
                .ToListAsync();
        }

        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
        }

        public void Update(Product product)
        {
            _context.Products.Update(product);
        }

        public void Delete(Product product)
        {
            _context.Products.Remove(product);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasProductsAsync(int categoryId)
        {
            return await _context.Products
                .AnyAsync(p => p.CategoryId == categoryId);
        }

      
        public async Task<(IEnumerable<Product>, int)> GetByCategoryPagedAsync(
    int categoryId,
    int page,
    int pageSize)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => p.CategoryId == categoryId);

            var totalItems = await query.CountAsync();

            var products = await query
                .OrderBy(p => p.ProductName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalItems);
        }

        public async Task<(IEnumerable<Product> Items, int TotalCount)> GetPagedAsync(
    int page,
    int pageSize,
    string? keyword = null,
    string? status = null,
    int? categoryId = null,
    decimal? minPrice = null,
    decimal? maxPrice = null,
    string? sortBy = null)
        {
            var query = _context.Products
                .AsNoTracking()
                .AsQueryable();

            // Filter status
            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim().ToLower();

                query = query.Where(p =>
                    p.Status != null &&
                    p.Status.ToLower() == normalizedStatus);
            }

            // Search keyword
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var normalizedKeyword = keyword.Trim().ToLower();

                query = query.Where(p =>
                    p.ProductName.ToLower().Contains(normalizedKeyword) ||
                    p.ProductCode.ToLower().Contains(normalizedKeyword) ||
                    (p.Barcode != null &&
                     p.Barcode.ToLower().Contains(normalizedKeyword)));
            }

            // Filter category
            if (categoryId.HasValue)
            {
                var selectedCategoryId = categoryId.Value;

                var categoryIds = await _context.Categories
                    .AsNoTracking()
                    .Where(c =>
                        c.CategoryId == selectedCategoryId ||
                        c.ParentCategoryId == selectedCategoryId)
                    .Select(c => c.CategoryId)
                    .ToListAsync();

                query = query.Where(p =>
                    categoryIds.Contains(p.CategoryId));
            }

            // Filter minimum price
            if (minPrice.HasValue)
            {
                query = query.Where(p =>
                    p.SalePrice >= minPrice.Value);
            }

            // Filter maximum price
            if (maxPrice.HasValue)
            {
                query = query.Where(p =>
                    p.SalePrice <= maxPrice.Value);
            }

            // Sort
            var normalizedSort = sortBy?.Trim().ToLower();

            query = normalizedSort switch
            {
                "pricelowhigh" =>
                    query.OrderBy(p => p.SalePrice),

                "pricehighlow" =>
                    query.OrderByDescending(p => p.SalePrice),

                "newest" =>
                    query.OrderByDescending(p => p.CreatedAt),

                _ =>
                    query.OrderBy(p => p.ProductName)
            };

            // Total records before pagination
            var totalCount = await query.CountAsync();

            // Pagination
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<IEnumerable<Product>> GetRelatedProductsAsync(
    int productId)
        {
            var currentProduct = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(p =>
                    p.ProductId == productId);

            if (currentProduct == null)
            {
                return Enumerable.Empty<Product>();
            }

            var relatedProducts = await _context.Products
                .AsNoTracking()
                .Where(p =>
                    p.CategoryId == currentProduct.CategoryId &&
                    p.ProductId != currentProduct.ProductId &&
                    p.Status == "Active")
                .OrderByDescending(p => p.CreatedAt)
                .Take(10)
                .ToListAsync();

            return relatedProducts;
        }

        public async Task<bool> UpdateRatingAsync(
    int productId,
    int rating)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p =>
                    p.ProductId == productId);

            if (product == null)
            {
                return false;
            }

            product.RatingCount += 1;
            product.RatingSum += rating;

            product.RatingAverage =
                (decimal)product.RatingSum / product.RatingCount;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateRatingAsync(
    int productId,
    int ratingDelta,
    int countDelta)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p =>
                    p.ProductId == productId);

            if (product == null)
            {
                return false;
            }

            product.RatingSum += ratingDelta;
            product.RatingCount += countDelta;

            if (product.RatingCount > 0)
            {
                product.RatingAverage =
                    (decimal)product.RatingSum /
                    product.RatingCount;
            }
            else
            {
                product.RatingAverage = 0;
            }

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
