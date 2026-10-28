namespace UserService.API.DTOs
{
    public enum RegisterError
    {
        None,
        InvalidPhone,
        PhoneExists,
        RoleNotFound,
        InvalidVerification
    }

    public class RegisterResult
    {
        public RegisterError Error { get; init; }
        public RegisterResponseDto? Data { get; init; }

        public static RegisterResult Ok(RegisterResponseDto data) =>
            new() { Error = RegisterError.None, Data = data };

        public static RegisterResult Fail(RegisterError error) =>
            new() { Error = error };
    }
}