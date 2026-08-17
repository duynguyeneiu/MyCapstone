using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.API.DTOs.User;
using UserService.API.Interfaces;

namespace UserService.API.Controllers { 

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllAsync();

        return Ok(users);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);

        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateUserDto dto)
    {
        var user = await _userService.CreateAsync(dto);

        if (user == null)
        {
            return Conflict(new
            {
                message = "Username, email hoặc số điện thoại đã tồn tại."
            });
        }

        return CreatedAtAction(
            nameof(GetById),
            new { id = user.UserId },
            user
        );
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateUserDto dto)
    {
        var result = await _userService.UpdateAsync(id, dto);

        if (!result)
            return NotFound();

        return NoContent();
    }

        [HttpPut("me/infor")]
        public async Task<IActionResult> UpdateUserInfor(
    [FromBody] UpdateUserInforDto dto)
        {
            var currentUserIdString =
                User.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier
                )?.Value;

            if (!int.TryParse(
                    currentUserIdString,
                    out var currentUserId))
            {
                return Unauthorized();
            }

            var result = await _userService.UpdateUserInforAsync(
                currentUserId,
                dto
            );

            if (!result)
            {
                return BadRequest(
                    "Email đã tồn tại hoặc user không tồn tại."
                );
            }

            return NoContent();
        }

        [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _userService.DeleteAsync(id);

        if (!result)
            return NotFound();

        return NoContent();
    }







    [HttpPut("{id:int}/password")]
    public async Task<IActionResult> ChangePassword(
     int id,
     [FromBody] ChangePasswordDto dto)
    {
        var currentUserIdString =
            User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

        if (!int.TryParse(
                currentUserIdString,
                out var currentUserId))
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole("Admin");

        if (!isAdmin && currentUserId != id)
        {
            return Forbid();
        }

        var result = await _userService.ChangePasswordAsync(
            id,
            dto
        );

        if (!result)
        {
            return BadRequest(
                "Mật khẩu hiện tại không đúng hoặc user không tồn tại."
            );
        }

        return NoContent();
    }





}
}