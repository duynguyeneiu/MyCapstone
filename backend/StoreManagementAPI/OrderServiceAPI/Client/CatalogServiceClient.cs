using OrderServiceAPI.DTOs.Catalog;
using OrderServiceAPI.DTOs.Product;
using OrderServiceAPI.Interfaces;
using System.Net;

namespace OrderServiceAPI.Client
{
    public class CatalogServiceClient : ICatalogServiceClient
    {
        private readonly HttpClient _httpClient;

        public CatalogServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<ProductDto?> GetProductAsync(int productId)
        {
            var response = await _httpClient.GetAsync($"api/products/{productId}");

            // San pham khong ton tai -> null (service tra 404), khong nem 502
            if (response.StatusCode == HttpStatusCode.NotFound)
                return null;

            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<ProductDto>();
        }
        public async Task UpdateStockAsync(int productId, int quantity)
        {
            var request = new UpdateStockRequest
            {
                Quantity = quantity
            };

            var response = await _httpClient.PutAsJsonAsync(
                $"api/products/{productId}/stock",
                request);

            response.EnsureSuccessStatusCode();
        }
    }
}