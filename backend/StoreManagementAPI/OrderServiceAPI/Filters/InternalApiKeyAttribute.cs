using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace OrderServiceAPI.Filters
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class InternalApiKeyAttribute : Attribute, IAuthorizationFilter
    {
        public const string HeaderName = "X-Internal-Key";

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var expected = context.HttpContext.RequestServices
                .GetRequiredService<IConfiguration>()["InternalApi:Key"];

            var provided = context.HttpContext.Request.Headers[HeaderName].ToString();

            if (string.IsNullOrEmpty(expected) || provided != expected)
                context.Result = new UnauthorizedObjectResult(
                    new { statusCode = 401, message = "Invalid internal key." });
        }
    }
}
