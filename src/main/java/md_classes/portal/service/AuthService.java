package md_classes.portal.service;

import com.auth0.jwt.interfaces.DecodedJWT;
import md_classes.portal.domain.User;
import md_classes.portal.dto.auth.AuthResponse;
import md_classes.portal.dto.auth.ForgotPasswordRequest;
import md_classes.portal.dto.auth.LoginRequest;
import md_classes.portal.dto.auth.RefreshRequest;
import md_classes.portal.dto.auth.RegisterRequest;
import md_classes.portal.dto.auth.ResetPasswordRequest;
import md_classes.portal.dto.auth.UserSummary;
import md_classes.portal.enums.Role;
import md_classes.portal.exception.domain.DuplicateEmailException;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (users.existsByEmail(req.email())) {
            throw new DuplicateEmailException(req.email());
        }
        Role role = req.role() != null ? req.role() : Role.STUDENT;
        User user = new User(req.name(), req.email(), encoder.encode(req.password()), role);
        users.save(user);
        return tokensFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("invalid credentials"));
        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("invalid credentials");
        }
        return tokensFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshRequest req) {
        DecodedJWT decoded;
        try {
            decoded = jwt.verifyRefreshToken(req.refreshToken());
        } catch (Exception e) {
            throw new BadCredentialsException("invalid refresh token");
        }
        Long userId = jwt.userId(decoded);
        User user = users.findById(userId)
                .orElseThrow(() -> new NotFoundException("user not found"));
        return tokensFor(user);
    }

    public void forgotPassword(ForgotPasswordRequest req) {
        // Stub: real implementation sends an email with a single-use reset token.
        // We deliberately do NOT reveal whether the email exists.
        log.info("password reset requested for {}", req.email());
    }

    public void resetPassword(ResetPasswordRequest req) {
        // Stub: real implementation verifies the reset token and updates the password.
        log.info("password reset token redemption attempted");
    }

    private AuthResponse tokensFor(User user) {
        return new AuthResponse(
                jwt.generateAccessToken(user),
                jwt.generateRefreshToken(user),
                UserSummary.from(user)
        );
    }
}
