namespace CatalogService.API.Common.Paging
{
    public class PagingRequest
    {
        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;

        public string? Keyword { get; set; }
    }
}
