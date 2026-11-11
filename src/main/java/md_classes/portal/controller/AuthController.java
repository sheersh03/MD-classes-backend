package md_classes.portal.controller;

import jakarta.validation.Valid;
import md_classes.portal.dto.auth.AuthResponse;
import md_classes.portal.dto.auth.ForgotPasswordRequest;
import md_classes.portal.dto.auth.ForgotPasswordResponse;
import md_classes.portal.dto.auth.LoginRequest;
import md_classes.portal.dto.auth.RefreshRequest;
import md_classes.portal.dto.auth.RegisterRequest;
import md_classes.portal.dto.auth.ResetPasswordRequest;
import md_classes.portal.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService auth;

    public AuthController(AuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/register")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return auth.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req, jakarta.servlet.http.HttpServletResponse httpResponse) {
        System.out.println("=== API REQUEST: POST /apiv1/auth/login ===");
        System.out.println("Request Body: " + req);
        AuthResponse response = auth.login(req);
        md_classes.portal.config.CookieUtils.setAuthCookie(httpResponse, response.accessToken());
        System.out.println("=== API RESPONSE: POST /apiv1/auth/login ===");
        System.out.println("Response Body: " + response);
        System.out.println("==========================================");
        return response;
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody RefreshRequest req, jakarta.servlet.http.HttpServletResponse httpResponse) {
        AuthResponse response = auth.refresh(req);
        md_classes.portal.config.CookieUtils.setAuthCookie(httpResponse, response.accessToken());
        return response;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(jakarta.servlet.http.HttpServletResponse httpResponse) {
        md_classes.portal.config.CookieUtils.clearAuthCookie(httpResponse);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ForgotPasswordResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        return auth.forgotPassword(req);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        auth.resetPassword(req);
        return ResponseEntity.ok().build();
    }
}
