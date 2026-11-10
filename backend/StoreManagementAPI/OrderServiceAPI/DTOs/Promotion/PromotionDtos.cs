using System.ComponentModel.DataAnnotations;

namespace OrderServiceAPI.DTOs.Promotion
{
    public class PromotionDto
    {
        public int PromotionId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        /// <summary>Stored value: Active | Inactive</summary>
        public string Status { get; set; } = string.Empty;

        /// <summary>Shown in UI: Active | Inactive | Expired | Scheduled</summary>
        public string DisplayStatus { get; set; } = string.Empty;

        public int UsageCount { get; set; }
        public decimal TotalDiscount { get; set; }
    }

    /// <summary>Body for POST and PUT</summary>
    public class SavePromotionRequest
    {
        [Required, StringLength(50, MinimumLength = 3)]
        public string Code { get; set; } = string.Empty;

        [StringLength(255)]
        public string? Description { get; set; }

        [Required]
        public string DiscountType { get; set; } = string.Empty;

        public decimal DiscountValue { get; set; }

        public decimal MinOrderValue { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string Status { get; set; } = "Active";
    }

    public class ValidatePromotionRequest
    {
        [Required]
        public string Code { get; set; } = string.Empty;

        /// <summary>Goods amount (before shipping)</summary>
        public decimal OrderAmount { get; set; }
    }

    public class PromotionApplyResult
    {
        public int PromotionId { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal Discount { get; set; }
    }

    public class PromotionUsage
    {
        public int PromotionId { get; set; }
        public int UsageCount { get; set; }
        public decimal TotalDiscount { get; set; }
    }
}
