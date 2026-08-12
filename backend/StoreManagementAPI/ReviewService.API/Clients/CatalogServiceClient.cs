using ReviewService.API.Interfaces;
using System.Net;

namespace ReviewService.API.Clients
{
    public class CatalogServiceClient : ICatalogServiceClient
    {
        private readonly HttpClient _httpClient;

        public CatalogServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<bool> UpdateProductRatingAsync(
     int productId,
     int ratingDelta,
     int countDelta)
        {
            var request = new
            {
                RatingDelta = ratingDelta,
                CountDelta = countDelta
            };

            var response = await _httpClient.PostAsJsonAsync(
                $"api/Products/{productId}/rating",
                request);

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return false;
            }

            response.EnsureSuccessStatusCode();

            return true;
        }
    }
}
