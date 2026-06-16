package md_classes.portal.dto.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserSummary user
) {}
