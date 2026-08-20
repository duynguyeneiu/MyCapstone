using CatalogService.API.Common;
using CatalogService.API.DTOs.Product;
using CatalogService.API.Exceptions;
using CatalogService.API.Interfaces;
using CatalogService.API.Mappers;


namespace CatalogService.API.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IConfiguration _configuration;

        public ProductService(
            IProductRepository productRepository,
            ICategoryRepository categoryRepository,
            IConfiguration configuration)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _configuration = configuration;
        }
        private string? GetImageUrl(string? image)
        {
            if (string.IsNullOrWhiteSpace(image))
                return null;

            var baseUrl = _configuration["AppSettings:BaseUrl"];

            return $"{baseUrl}/images/{image}";
        }

        public async Task UpdateStockAsync(int productId, int quantity)
        {
            var product = await _productRepository.GetByIdAsync(productId);

            if (product == null)
                throw new NotFoundException("Product not found.");

            if (product.QuantityInStock < quantity)
                throw new BadRequestException("Out of stock.");

            product.QuantityInStock -= quantity;
            product.UpdatedAt = DateTime.Now;

            _productRepository.Update(product);

            await _productRepository.SaveChangesAsync();
        }

        public async Task<ProductDto> GetByIdAsync(int productId)
        {
            var product = await _productRepository.GetByIdAsync(productId);

            if (product == null)
                throw new NotFoundException("Product not found.");

            var dto = ProductMapper.ToDto(product);

            dto.Image = GetImageUrl(product.Image);

            return dto;
        }





        public async Task<ProductDto> CreateAsync(CreateProductDto dto)
        {
            if (await _productRepository.GetByCodeAsync(dto.ProductCode) != null)
                throw new ConflictException("Product code already exists.");

            if (!string.IsNullOrWhiteSpace(dto.Barcode) &&
                await _productRepository.GetByBarcodeAsync(dto.Barcode) != null)
            {
                throw new ConflictException("Barcode already exists.");
            }

            if (!await _categoryRepository.ExistsAsync(dto.CategoryId))
                throw new BadRequestException("Category does not exist.");

            var product = ProductMapper.ToEntity(dto);

            await _productRepository.AddAsync(product);
            await _productRepository.SaveChangesAsync();

            var result = ProductMapper.ToDto(product);

            result.Image = GetImageUrl(product.Image);

            return result;
        }

        public async Task UpdateAsync(int productId, UpdateProductDto dto)
        {
            var product = await _productRepository.GetByIdAsync(productId);

            if (product == null)
                throw new NotFoundException("Product not found.");

            if (!await _categoryRepository.ExistsAsync(dto.CategoryId))
                throw new BadRequestException("Category does not exist.");

            if (!string.IsNullOrWhiteSpace(dto.Barcode) &&
                dto.Barcode != product.Barcode)
            {
                var existedBarcode = await _productRepository.GetByBarcodeAsync(dto.Barcode);

                if (existedBarcode != null)
                    throw new ConflictException("Barcode already exists.");
            }

            ProductMapper.UpdateEntity(product, dto);

            _productRepository.Update(product);

            await _productRepository.SaveChangesAsync();
        }
        public async Task DeleteAsync(int productId)
        {
            var product = await _productRepository.GetByIdAsync(productId);

            if (product == null)
                throw new NotFoundException("Product not found.");

            _productRepository.Delete(product);

            await _productRepository.SaveChangesAsync();
        }
      

            public async Task<PagedResult<ProductDto>> GetByCategoryAsync(
        int categoryId,
        int page,
        int pageSize)
        {
            var (products, totalItems) =
                await _productRepository.GetByCategoryPagedAsync(
                    categoryId,
                    page,
                    pageSize);

            return new PagedResult<ProductDto>
            {
                Items = products.Select(ProductMapper.ToDto),
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<object> GetPagedAsync(
    int page,
    int pageSize,
    string? keyword = null,
    string? status = null,
    int? categoryId = null,
    decimal? minPrice = null,
    decimal? maxPrice = null,
    string? sortBy = null)
        {
            var result = await _productRepository.GetPagedAsync(
                page,
                pageSize,
                keyword,
                status,
                categoryId,
                minPrice,
                maxPrice,
                sortBy);

            var products = result.Items.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                ProductCode = p.ProductCode,
                ProductName = p.ProductName,
                Barcode = p.Barcode,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                Unit = p.Unit,
                ImportPrice = p.ImportPrice,
                SalePrice = p.SalePrice,
                QuantityInStock = p.QuantityInStock,
                Status = p.Status,
                Image = GetImageUrl(p.Image),
                
            });

            return new
            {
                items = products,
                totalCount = result.TotalCount,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(
                    result.TotalCount / (double)pageSize)
            };
        }
        public async Task<IEnumerable<ProductDto>> GetRelatedProductsAsync(
    int productId)
        {
            var products =
                await _productRepository.GetRelatedProductsAsync(productId);

            return products.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                ProductCode = p.ProductCode,
                ProductName = p.ProductName,
                Barcode = p.Barcode,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                Unit = p.Unit,
                SalePrice = p.SalePrice,
                QuantityInStock = p.QuantityInStock,
                Status = p.Status,
                Image = GetImageUrl(p.Image),

            });
        }

        public async Task<bool> UpdateRatingAsync(
     int productId,
     int ratingDelta,
     int countDelta)
        {
            return await _productRepository
                .UpdateRatingAsync(
                    ratingDelta,
                    productId,
                    countDelta);
        }



    }
}
