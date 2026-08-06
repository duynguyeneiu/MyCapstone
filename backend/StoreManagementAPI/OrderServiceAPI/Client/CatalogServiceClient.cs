using OrderServiceAPI.DTOs.Catalog;
using OrderServiceAPI.DTOs.Product;
using OrderServiceAPI.Interfaces;

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
            return await _httpClient.GetFromJsonAsync<ProductDto>(
                $"api/products/{productId}");
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