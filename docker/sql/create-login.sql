/*
  Run once in SSMS on the Windows host (as an administrator) so the Docker
  containers can log in with SQL authentication.

  Before running:
    1. SSMS > right-click the server > Properties > Security >
       "SQL Server and Windows Authentication mode" > OK, then restart SQL Server.
    2. SQL Server Configuration Manager > SQL Server Network Configuration >
       Protocols for MSSQLSERVER > TCP/IP = Enabled; IPAll > TCP Port = 1433.
       Restart the SQL Server service.
    3. Allow inbound TCP 1433 in Windows Firewall (Docker Desktop traffic).

  Replace the password below with the value you put in DB_PASSWORD (.env).
*/
USE master;
GO
IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'happymart')
    CREATE LOGIN happymart WITH PASSWORD = N'Change_Me_123!', CHECK_POLICY = OFF;
GO

DECLARE @db sysname, @sql nvarchar(max);
DECLARE dbs CURSOR FOR
    SELECT name FROM sys.databases
    WHERE name IN (N'CatalogServiceDB', N'UserServiceDB', N'OrderServiceDB',
                   N'PaymentServiceDB', N'ReviewServiceDB');
OPEN dbs;
FETCH NEXT FROM dbs INTO @db;
WHILE @@FETCH_STATUS = 0
BEGIN
    -- EXEC(...) khong cho goi ham ben trong -> ghep chuoi vao bien truoc
    SET @sql = N'USE ' + QUOTENAME(@db) + N';
          IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N''happymart'')
              CREATE USER happymart FOR LOGIN happymart;
          ALTER ROLE db_owner ADD MEMBER happymart;';
    EXEC sp_executesql @sql;
    PRINT N'Granted db_owner on ' + @db;
    FETCH NEXT FROM dbs INTO @db;
END
CLOSE dbs;
DEALLOCATE dbs;
GO
