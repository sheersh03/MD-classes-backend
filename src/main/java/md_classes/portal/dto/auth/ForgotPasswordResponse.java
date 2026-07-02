package md_classes.portal.dto.auth;

public record ForgotPasswordResponse(
        String token,
        String message
) {}
