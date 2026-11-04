# ---------- build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first so the NuGet layer is cached between builds
COPY CatalogService.API.csproj ./
RUN dotnet restore CatalogService.API.csproj

COPY . .
RUN dotnet publish CatalogService.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---------- runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# ASP.NET Core 8+ images listen on port 8080 by default
EXPOSE 8080
ENTRYPOINT ["dotnet", "CatalogService.API.dll"]
