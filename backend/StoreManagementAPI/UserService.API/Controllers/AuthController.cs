using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UserService.API.Data;
using UserService.API.DTOs;
using UserService.API.Helpers;
using UserService.API.Interfaces;
using UserService.API.Services;
using LoginRequest = UserService.API.DTOs.LoginRequest;

namespace UserService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);

            if (result == null)
            {
                return Unauthorized(
                    "Sai số điện thoại hoặc mật khẩu."
                );
            }

            return Ok(result);
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new
            {
                UserId = User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value,

                FullName = User.Identity?.Name,

                Role = User.FindFirst(
                    ClaimTypes.Role
                )?.Value
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(
    [FromBody] RegisterRequestDto request)
        {
            var result =
                await _authService.RegisterAsync(request);

            if (result == null)
            {
                return Conflict(new
                {
                    message = "Số điện thoại đã được đăng ký."
                });
            }

            return Ok(result);
        }
    }
}
