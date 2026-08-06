using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace OrderServiceAPI.Models;

[Table("ORDER_DETAIL")]
public partial class OrderDetail
{
    [Key]
    [Column("OrderDetailID")]
    public int OrderDetailId { get; set; }

    [Column("OrderID")]
    public int OrderId { get; set; }

    [Column("ProductID")]
    public int ProductId { get; set; }

    [StringLength(255)]
    public string ProductName { get; set; } = null!;

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Discount { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("OrderDetails")]
    public virtual Order Order { get; set; } = null!;
}
