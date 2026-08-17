namespace ReviewService.API.Interfaces
{
    public interface IUserServiceClient
    {
        Task<string?> GetUserFullNameAsync(int userId);
    }
}
