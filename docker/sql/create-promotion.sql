/*
  Promotion table for OrderServiceDB.
  Run once in SSMS (safe to re-run: every step checks before creating).
*/
USE OrderServiceDB;
GO

IF OBJECT_ID(N'dbo.PROMOTION', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.PROMOTION (
        PromotionID    INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PROMOTION PRIMARY KEY,
        Code           VARCHAR(50)    NOT NULL CONSTRAINT UQ_PROMOTION_Code UNIQUE,
        Description    NVARCHAR(255)  NULL,
        DiscountType   VARCHAR(20)    NOT NULL,
        DiscountValue  DECIMAL(18,2)  NOT NULL,
        MinOrderValue  DECIMAL(18,2)  NOT NULL CONSTRAINT DF_PROMOTION_MinOrderValue DEFAULT (0),
        StartDate      DATETIME       NOT NULL,
        EndDate        DATETIME       NOT NULL,
        Status         VARCHAR(20)    NOT NULL CONSTRAINT DF_PROMOTION_Status DEFAULT ('Active'),
        CreatedAt      DATETIME       NOT NULL CONSTRAINT DF_PROMOTION_CreatedAt DEFAULT (GETDATE()),
        UpdatedAt      DATETIME       NULL,

        CONSTRAINT CK_PROMOTION_DiscountType  CHECK (DiscountType IN ('Percentage', 'Fixed')),
        CONSTRAINT CK_PROMOTION_DiscountValue CHECK (DiscountValue > 0 AND (DiscountType <> 'Percentage' OR DiscountValue <= 100)),
        CONSTRAINT CK_PROMOTION_MinOrderValue CHECK (MinOrderValue >= 0),
        CONSTRAINT CK_PROMOTION_Dates         CHECK (EndDate >= StartDate),
        CONSTRAINT CK_PROMOTION_Status        CHECK (Status IN ('Active', 'Inactive'))
    );
END
GO

-- ORDER.PromotionID already exists -> link it to PROMOTION
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_ORDER_PROMOTION')
    ALTER TABLE dbo.[ORDER] WITH CHECK
        ADD CONSTRAINT FK_ORDER_PROMOTION FOREIGN KEY (PromotionID) REFERENCES dbo.PROMOTION (PromotionID);
GO

-- Sample data (dates relative to today so they stay valid for demo / E2E)
IF NOT EXISTS (SELECT 1 FROM dbo.PROMOTION)
BEGIN
    DECLARE @today DATE = CAST(GETDATE() AS DATE);
    INSERT INTO dbo.PROMOTION (Code, Description, DiscountType, DiscountValue, MinOrderValue, StartDate, EndDate, Status)
    VALUES
      ('WELCOME10', N'Giảm 10% cho đơn từ 100.000đ',    'Percentage', 10,    100000, DATEADD(DAY, -30, @today), DATEADD(DAY, 90, @today), 'Active'),
      ('SALE50K',   N'Giảm 50.000đ cho đơn từ 300.000đ', 'Fixed',      50000, 300000, DATEADD(DAY, -7,  @today), DATEADD(DAY, 30, @today), 'Active'),
      ('SUMMER20',  N'Giảm 20% mùa hè (đã hết hạn)',     'Percentage', 20,    0,      DATEADD(DAY, -90, @today), DATEADD(DAY, -1, @today), 'Active'),
      ('PAUSED15',  N'Giảm 15% (tạm ngưng)',             'Percentage', 15,    0,      DATEADD(DAY, -10, @today), DATEADD(DAY, 30, @today), 'Inactive');
END
GO
