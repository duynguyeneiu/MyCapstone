using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace OrderServiceAPI.Models;

[Table("CART_DETAIL")]
public partial class CartDetail
{
    [Key]
    [Column("CartDetailID")]
    public int CartDetailId { get; set; }

    [Column("CartID")]
    public int CartId { get; set; }

    [Column("ProductID")]
    public int ProductId { get; set; }

    public int Quantity { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime AddedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Subtotal { get; set; }

    [ForeignKey("CartId")]
    [InverseProperty("CartDetails")]
    public virtual Cart Cart { get; set; } = null!;
}
