namespace CatalogService.API.DTOs.Product
{
    public class RatingUpdateRequest
    {
        public int RatingDelta { get; set; }

        public int CountDelta { get; set; }
    }
}
