using Microsoft.AspNetCore.Mvc;
using UserService.API.DTOs.Otp;
using UserService.API.Interfaces;
using UserService.API.Models.Otp;

namespace UserService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OtpController : ControllerBase
    {
        private readonly IOtpService _otpService;
        private readonly IAuthService _authService;

        public OtpController(IOtpService otpService, IAuthService authService)
        {
            _otpService = otpService;
            _authService = authService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> Send([FromBody] SendOtpRequestDto request)
        {
            if (request.Purpose == OtpPurpose.Register &&
    await _authService.IsPhoneRegisteredAsync(request.Phone))
            {
                return Conflict(new { message = "Số điện thoại đã được đăng ký." });
            }
            if (request.Purpose == OtpPurpose.ForgotPassword &&
    !await _authService.IsPhoneRegisteredAsync(request.Phone))
            {
                return NotFound(new { message = "Số điện thoại chưa được đăng ký." });
            }
            var result = await _otpService.SendAsync(request.Phone, request.Purpose);

            if (!result.Success)
            {
                if (result.RetryAfterSeconds > 0)
                    return StatusCode(StatusCodes.Status429TooManyRequests, result);

                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] VerifyOtpRequestDto request)
        {
            var result = await _otpService.VerifyAsync(
                request.Phone, request.Purpose, request.Code);

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }
    }
}