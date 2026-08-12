using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using ReviewService.API.Models;

namespace ReviewService.API.Data;

public partial class ReviewContext : DbContext
{
    public ReviewContext()
    {
    }

    public ReviewContext(DbContextOptions<ReviewContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Review> Reviews { get; set; }

  
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Review>(entity =>
        {
            entity.ToTable("REVIEW");

            entity.HasIndex(e => new { e.UserId, e.ProductId }, "UQ_REVIEW_User_Product").IsUnique();

            entity.Property(e => e.ReviewId).HasColumnName("ReviewID");
            entity.Property(e => e.Comment).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())", "DF_REVIEW_CreatedAt")
                .HasColumnType("datetime");
            entity.Property(e => e.OrderId).HasColumnName("OrderID");
            entity.Property(e => e.ProductId).HasColumnName("ProductID");
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            entity.Property(e => e.UserId).HasColumnName("UserID");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
