namespace UserService.API.DTOs
{
    public enum ResetPasswordError
    {
        None,
        InvalidPhone,
        UserNotFound,
        InvalidVerification
    }
}