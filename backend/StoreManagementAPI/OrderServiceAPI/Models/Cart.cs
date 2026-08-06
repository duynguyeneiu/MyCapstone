using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace OrderServiceAPI.Models;

[Table("CART")]
[Index("UserId", Name = "UQ_CART_USER", IsUnique = true)]
public partial class Cart
{
    [Key]
    [Column("CartID")]
    public int CartId { get; set; }

    [Column("UserID")]
    public int UserId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime UpdatedAt { get; set; }

    [InverseProperty("Cart")]
    public virtual ICollection<CartDetail> CartDetails { get; set; } = new List<CartDetail>();
}
