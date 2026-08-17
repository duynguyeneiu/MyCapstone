using ReviewService.API.DTOs;
using ReviewService.API.DTOs.User;
using ReviewService.API.Interfaces;
using System.Net.Http.Json;

namespace ReviewService.API.Clients
{
    public class UserServiceClient : IUserServiceClient
    {
        private readonly HttpClient _httpClient;

        public UserServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<string?> GetUserFullNameAsync(int userId)
        {
            var response =
                await _httpClient.GetAsync(
                    $"api/User/public/{userId}");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var user =
                await response.Content
                    .ReadFromJsonAsync<UserDto>();

            return user?.FullName;
        }
    }
}