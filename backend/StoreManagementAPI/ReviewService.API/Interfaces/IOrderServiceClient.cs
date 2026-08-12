namespace ReviewService.API.Interfaces
{
    public interface IOrderServiceClient
    {
        Task<int?> GetPurchasedOrderIdAsync(
      int userId,
      int productId);
    }
}
