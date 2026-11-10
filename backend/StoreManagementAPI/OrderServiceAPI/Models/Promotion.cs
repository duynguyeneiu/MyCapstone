using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace OrderServiceAPI.Models;

[Table("PROMOTION")]
[Index("Code", Name = "UQ_PROMOTION_Code", IsUnique = true)]
public partial class Promotion
{
    [Key]
    [Column("PromotionID")]
    public int PromotionId { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string Code { get; set; } = null!;

    [StringLength(255)]
    public string? Description { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string DiscountType { get; set; } = null!;   // Percentage | Fixed

    [Column(TypeName = "decimal(18, 2)")]
    public decimal DiscountValue { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal MinOrderValue { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime StartDate { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime EndDate { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string Status { get; set; } = null!;          // Active | Inactive (Expired = computed)

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }
}
