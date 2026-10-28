using UserService.API.Interfaces;

namespace UserService.API.Services
{
    public class ConsoleSmsSender : ISmsSender
    {
        private readonly ILogger<ConsoleSmsSender> _logger;

        public ConsoleSmsSender(ILogger<ConsoleSmsSender> logger)
        {
            _logger = logger;
        }

        public Task SendAsync(string phone, string message)
        {
            _logger.LogInformation(
                "[MOCK SMS] To: {Phone} | Message: {Message}",
                phone, message);

            return Task.CompletedTask;
        }
    }
}