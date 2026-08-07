namespace CatalogService.API.DTOs.Category
{
    public class CategoryDto
    {
        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = null!;

        public string? Description { get; set; }

        public int? ParentCategoryId { get; set; }

        public string Status { get; set; } = null!;
    }
}
