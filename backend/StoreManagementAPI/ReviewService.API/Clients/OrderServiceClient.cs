using ReviewService.API.Interfaces;

namespace ReviewService.API.Clients
{
    public class OrderServiceClient : IOrderServiceClient
    {
        private readonly HttpClient _httpClient;

        public OrderServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<int?> GetPurchasedOrderIdAsync(
     int userId,
     int productId)
        {
            var response = await _httpClient.GetAsync(
                $"api/Order/user/{userId}/product/{productId}/purchased");

            var content = await response.Content.ReadAsStringAsync();

            if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"OrderService returned {(int)response.StatusCode}: {content}");
            }

            var result =
                System.Text.Json.JsonSerializer
                    .Deserialize<PurchasedOrderResponse>(
                        content,
                        new System.Text.Json.JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

            return result?.OrderId;
        }

        private class PurchasedOrderResponse
        {
            public int OrderId { get; set; }
        }
    }
}
