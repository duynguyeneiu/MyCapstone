using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.API.Data;
using UserService.API.Helpers;
using UserService.API.Services;
using LoginRequest = UserService.API.Models.DTOs.LoginRequest;

namespace UserService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserServiceDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly JwtService _jwtService;

        public AuthController(UserServiceDbContext context, IConfiguration configuration, JwtService jwtService)
        {
            _context = context;
            _configuration = configuration;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _context.Users
     .Include(u => u.Role)
     .FirstOrDefaultAsync(u => u.Phone == request.Phone);

            if (user == null)
            {
                return Unauthorized("Sai số điện thoại hoặc mật khẩu.");
            }

            if (!PasswordHelper.VerifyPassword(request.Password, user.Password))
            {
                return Unauthorized("Sai số điện thoại hoặc mật khẩu.");
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new
            {
                token,
                userId = user.UserId,
                fullName = user.FullName,
                role = user.Role.RoleName
            });
        }

        //[HttpPost("register")]
        //public async Task<IActionResult> Register(RegisterRequest request)
        //{
        //    // Kiểm tra Email/SĐT

        //    // Hash Password

        //    // Lưu User

        //    // Trả kết quả
        //}

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new
            {
                UserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
                FullName = User.Identity?.Name,
                Role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value
            });
        }
    }
}
