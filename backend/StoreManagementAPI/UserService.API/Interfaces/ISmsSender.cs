namespace UserService.API.Interfaces
{
    public interface ISmsSender
    {
        Task SendAsync(string phone, string message);
    }
}