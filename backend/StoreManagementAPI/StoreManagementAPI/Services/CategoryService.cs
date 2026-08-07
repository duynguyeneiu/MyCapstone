using CatalogService.API.Common;
using CatalogService.API.DTOs.Category;
using CatalogService.API.Exceptions;
using CatalogService.API.Interfaces;
using CatalogService.API.Mappers;

namespace CatalogService.API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;

        public CategoryService(ICategoryRepository categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<PagedResult<CategoryDto>> GetPagedAsync(
    int page,
    int pageSize,
    string? keyword)
        {
            var (categories, totalItems) =
                await _categoryRepository.GetPagedAsync(page, pageSize, keyword);

            return new PagedResult<CategoryDto>
            {
                Items = categories.Select(CategoryMapper.ToDto),
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);

            if (category == null)
                throw new NotFoundException("Category not found.");

            return CategoryMapper.ToDto(category);
        }




        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            if (await _categoryRepository.GetByNameAsync(dto.CategoryName) != null)
                throw new ConflictException("Category name already exists.");

            if (dto.ParentCategoryId.HasValue &&
                !await _categoryRepository.ExistsAsync(dto.ParentCategoryId.Value))
            {
                throw new BadRequestException("Parent category does not exist.");
            }

            var category = CategoryMapper.ToEntity(dto);

            await _categoryRepository.AddAsync(category);
            await _categoryRepository.SaveChangesAsync();

            return CategoryMapper.ToDto(category);
        }


        public async Task UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (dto.ParentCategoryId == id)
                throw new BadRequestException("Category cannot be its own parent.");

            if (category == null)
                throw new NotFoundException("Category not found.");

            var existed = await _categoryRepository.GetByNameAsync(dto.CategoryName);

            if (existed != null && existed.CategoryId != id)
                throw new ConflictException("Category name already exists.");

            if (dto.ParentCategoryId.HasValue &&
                !await _categoryRepository.ExistsAsync(dto.ParentCategoryId.Value))
            {
                throw new BadRequestException("Parent category does not exist.");
            }

            CategoryMapper.UpdateEntity(category, dto);

            _categoryRepository.Update(category);

            await _categoryRepository.SaveChangesAsync();
        }


        public async Task DeleteAsync(int id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);

            if (category == null)
                throw new NotFoundException("Category not found.");

            if (await _categoryRepository.HasProductsAsync(id))
                throw new BadRequestException("Category contains products and cannot be deleted.");

            _categoryRepository.Delete(category);

            await _categoryRepository.SaveChangesAsync();
        }






    }
}
