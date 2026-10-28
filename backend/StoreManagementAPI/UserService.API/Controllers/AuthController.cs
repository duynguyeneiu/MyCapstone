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
            var result = await _authService.RegisterAsync(request);

            return result.Error switch
            {
                RegisterError.None =>
                    Ok(result.Data),

                RegisterError.PhoneExists =>
                    Conflict(new { message = "Số điện thoại đã được đăng ký." }),

                RegisterError.InvalidPhone =>
                    BadRequest(new { message = "Số điện thoại không hợp lệ." }),

                RegisterError.InvalidVerification =>
                    BadRequest(new { message = "Phiên xác thực OTP không hợp lệ hoặc đã hết hạn. Vui lòng xác thực lại." }),

                _ =>
                    StatusCode(500, new { message = "Không thể tạo tài khoản." })
            };
        }



        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(
    [FromBody] ResetPasswordRequestDto request)
        {
            var error = await _authService.ResetPasswordAsync(request);

            return error switch
            {
                ResetPasswordError.None =>
                    Ok(new { message = "Đặt lại mật khẩu thành công." }),

                ResetPasswordError.InvalidPhone =>
                    BadRequest(new { message = "Số điện thoại không hợp lệ." }),

                ResetPasswordError.UserNotFound =>
                    NotFound(new { message = "Số điện thoại chưa được đăng ký." }),

                ResetPasswordError.InvalidVerification =>
                    BadRequest(new { message = "Phiên xác thực OTP không hợp lệ hoặc đã hết hạn. Vui lòng xác thực lại." }),

                _ =>
                    StatusCode(500, new { message = "Không thể đặt lại mật khẩu." })
            };
        }


        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(
    [FromBody] ChangePasswordRequestDto request)
        {
            var userIdValue =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

            if (!int.TryParse(
                    userIdValue,
                    out var userId))
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(
                    request.CurrentPassword) ||
                string.IsNullOrWhiteSpace(
                    request.NewPassword) ||
                string.IsNullOrWhiteSpace(
                    request.ConfirmNewPassword))
            {
                return BadRequest(new
                {
                    message =
                        "Please fill in all fields."
                });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new
                {
                    message =
                        "New password must be at least 6 characters."
                });
            }

            if (request.NewPassword !=
                request.ConfirmNewPassword)
            {
                return BadRequest(new
                {
                    message =
                        "Confirm password does not match."
                });
            }

            var success =
                await _authService.ChangePasswordAsync(
                    userId,
                    request);

            if (!success)
            {
                return BadRequest(new
                {
                    message =
                        "Current password is incorrect."
                });
            }

            return Ok(new
            {
                message =
                    "Password updated successfully."
            });
        }
    }
}
