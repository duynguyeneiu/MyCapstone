using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace OrderServiceAPI.Models;

[Table("ORDER")]
[Index("OrderNumber", Name = "UQ__ORDER__CAC5E7436256103C", IsUnique = true)]
public partial class Order
{
    [Key]
    [Column("OrderID")]
    public int OrderId { get; set; }

    [StringLength(30)]
    [Unicode(false)]
    public string OrderNumber { get; set; } = null!;

    [Column("CustomerUserID")]
    public int? CustomerUserId { get; set; }

    [Column("StaffUserID")]
    public int? StaffUserId { get; set; }

    [StringLength(100)]
    public string ReceiverName { get; set; } = null!;

    [StringLength(20)]
    [Unicode(false)]
    public string ReceiverPhone { get; set; } = null!;

    [StringLength(255)]
    public string? ShippingAddress { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string OrderType { get; set; } = null!;

    [StringLength(20)]
    [Unicode(false)]
    public string PaymentMethod { get; set; } = null!;

    [StringLength(20)]
    [Unicode(false)]
    public string PaymentStatus { get; set; } = null!;

    [StringLength(20)]
    [Unicode(false)]
    public string OrderStatus { get; set; } = null!;

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalAmount { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Discount { get; set; }

    [Column("VAT", TypeName = "decimal(18, 2)")]
    public decimal Vat { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal ShippingFee { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal FinalAmount { get; set; }

    [Column("PromotionID")]
    public int? PromotionId { get; set; }

    [StringLength(500)]
    public string? Note { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime OrderDate { get; set; }

    [InverseProperty("Order")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
