using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace OrderServiceAPI.Models;

[Table("INVOICE")]
public partial class Invoice
{
    [Key]
    [Column("InvoiceID")]
    public int InvoiceId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime InvoiceDate { get; set; }

    [Column("UserID")]
    public int? UserId { get; set; }

    [Column("StaffUserID")]
    public int StaffUserId { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal TotalAmount { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Discount { get; set; }

    [Column("VAT", TypeName = "decimal(18, 2)")]
    public decimal Vat { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal FinalAmount { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string PaymentMethod { get; set; } = null!;

    [Column("PromotionID")]
    public int? PromotionId { get; set; }

    [StringLength(10)]
    [Unicode(false)]
    public string OrderType { get; set; } = null!;

    [StringLength(255)]
    [Unicode(false)]
    public string? ShippingAddress { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string OrderStatus { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [InverseProperty("Invoice")]
    public virtual ICollection<InvoiceDetail> InvoiceDetails { get; set; } = new List<InvoiceDetail>();
}
