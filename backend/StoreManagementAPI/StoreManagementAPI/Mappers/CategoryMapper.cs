using CatalogService.API.DTOs.Category;
using StoreManagementAPI.Models;

namespace CatalogService.API.Mappers
{
    public static class CategoryMapper
    {
        public static CategoryDto ToDto(Category category)
        {
            return new CategoryDto
            {
                CategoryId = category.CategoryId,
                CategoryName = category.CategoryName,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId,
                Status = category.Status
            };
        }

        public static Category ToEntity(CreateCategoryDto dto)
        {
            return new Category
            {
                CategoryName = dto.CategoryName,
                Description = dto.Description,
                ParentCategoryId = dto.ParentCategoryId,
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow
            };
        }

        public static void UpdateEntity(Category category, UpdateCategoryDto dto)
        {
            category.CategoryName = dto.CategoryName;
            category.Description = dto.Description;
            category.ParentCategoryId = dto.ParentCategoryId;
            category.Status = dto.Status;
            category.UpdatedAt = DateTime.UtcNow;
        }
    }
}
