using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace PaymentService.API.Models;

[Table("PAYMENT")]
public partial class Payment
{
    [Key]
    [Column("PaymentID")]
    public int PaymentId { get; set; }

    [Column("OrderID")]
    public int OrderId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? PaymentDate { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string PaymentMethod { get; set; } = null!;

    [StringLength(100)]
    [Unicode(false)]
    public string? TransactionCode { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string Status { get; set; } = null!;

    [Column(TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [StringLength(50)]
    [Unicode(false)]
    public string TxnRef { get; set; } = null!;

    [StringLength(10)]
    [Unicode(false)]
    public string? ResponseCode { get; set; }

    [StringLength(20)]
    [Unicode(false)]
    public string? BankCode { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ExpiredAt { get; set; }
}
