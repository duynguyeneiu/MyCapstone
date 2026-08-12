using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using PaymentService.API.Models;

namespace PaymentService.API.Data;

public partial class PaymentDbContext : DbContext
{
    public PaymentDbContext()
    {
    }

    public PaymentDbContext(DbContextOptions<PaymentDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Payment> Payments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasIndex(e => e.TransactionCode, "UX_PAYMENT_TransactionCode")
                .IsUnique()
                .HasFilter("([TransactionCode] IS NOT NULL)");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())", "DF_PAYMENT_CreatedAt");
            entity.Property(e => e.Status).HasDefaultValue("Pending", "DF_PAYMENT_Status");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
