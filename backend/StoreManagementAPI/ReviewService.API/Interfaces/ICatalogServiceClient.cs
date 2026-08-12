namespace ReviewService.API.Interfaces
{
    public interface ICatalogServiceClient
    {
        Task<bool> UpdateProductRatingAsync(
        int productId,
        int ratingDelta,
        int countDelta);

    }
}
