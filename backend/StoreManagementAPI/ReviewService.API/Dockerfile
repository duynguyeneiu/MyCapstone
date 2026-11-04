# ---------- build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first so the NuGet layer is cached between builds
COPY ReviewService.API.csproj ./
RUN dotnet restore ReviewService.API.csproj

COPY . .
RUN dotnet publish ReviewService.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---------- runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# ASP.NET Core 8+ images listen on port 8080 by default
EXPOSE 8080
ENTRYPOINT ["dotnet", "ReviewService.API.dll"]
