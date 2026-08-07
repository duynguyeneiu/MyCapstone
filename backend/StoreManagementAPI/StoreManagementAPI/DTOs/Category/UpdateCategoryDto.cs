using System.ComponentModel.DataAnnotations;

namespace CatalogService.API.DTOs.Category
{
    public class UpdateCategoryDto
    {
        [Required]
        [MaxLength(100)]
        public string CategoryName { get; set; } = null!;

        public string? Description { get; set; }

        public int? ParentCategoryId { get; set; }

        [Required]
        public string Status { get; set; } = "Active";
    }
}
