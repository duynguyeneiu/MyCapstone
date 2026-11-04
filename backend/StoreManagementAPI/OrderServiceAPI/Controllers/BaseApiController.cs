using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace OrderServiceAPI.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    protected bool IsStaff =>
        User.IsInRole("Admin") || User.IsInRole("Staff");

    protected bool CanAccess(int userId) =>
        IsStaff || CurrentUserId == userId;
}