package md_classes.portal.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.annotation.PostConstruct;
import md_classes.portal.domain.User;
import md_classes.portal.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Date;

@Service
public class JwtService {

    private static final String CLAIM_ROLE = "role";
    private static final String CLAIM_TYPE = "type";
    private static final String CLAIM_EMAIL = "email";
    private static final String TYPE_ACCESS = "access";
    private static final String TYPE_REFRESH = "refresh";
    private static final String TYPE_RESET = "reset-password";

    private final String secret;
    private final Duration accessTtl;
    private final Duration refreshTtl;
    private final String issuer;

    private Algorithm algorithm;
    private JWTVerifier verifier;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-ttl:PT15M}") Duration accessTtl,
            @Value("${app.jwt.refresh-ttl:P7D}") Duration refreshTtl,
            @Value("${app.jwt.issuer:md-classes-portal}") String issuer
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret must be at least 32 chars (set env MD_JWT_SECRET)"
            );
        }
        this.secret = secret;
        this.accessTtl = accessTtl;
        this.refreshTtl = refreshTtl;
        this.issuer = issuer;
    }

    @PostConstruct
    void init() {
        this.algorithm = Algorithm.HMAC256(secret);
        this.verifier = JWT.require(algorithm).withIssuer(issuer).build();
    }

    public String generateAccessToken(User user) {
        return buildToken(user, TYPE_ACCESS, accessTtl);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, TYPE_REFRESH, refreshTtl);
    }

    private String buildToken(User user, String type, Duration ttl) {
        long now = System.currentTimeMillis();
        return JWT.create()
                .withIssuer(issuer)
                .withSubject(String.valueOf(user.getId()))
                .withClaim(CLAIM_EMAIL, user.getEmail())
                .withClaim(CLAIM_ROLE, user.getRole().name())
                .withClaim(CLAIM_TYPE, type)
                .withIssuedAt(new Date(now))
                .withExpiresAt(new Date(now + ttl.toMillis()))
                .sign(algorithm);
    }

    public DecodedJWT verifyAccessToken(String token) {
        DecodedJWT decoded = verifier.verify(token);
        String type = decoded.getClaim(CLAIM_TYPE).asString();
        if (!TYPE_ACCESS.equals(type)) {
            throw new com.auth0.jwt.exceptions.JWTVerificationException("not an access token");
        }
        return decoded;
    }

    public DecodedJWT verifyRefreshToken(String token) {
        DecodedJWT decoded = verifier.verify(token);
        String type = decoded.getClaim(CLAIM_TYPE).asString();
        if (!TYPE_REFRESH.equals(type)) {
            throw new com.auth0.jwt.exceptions.JWTVerificationException("not a refresh token");
        }
        return decoded;
    }

    public String generateResetToken(User user) {
        long now = System.currentTimeMillis();
        return JWT.create()
                .withIssuer(issuer)
                .withSubject(String.valueOf(user.getId()))
                .withClaim(CLAIM_EMAIL, user.getEmail())
                .withClaim(CLAIM_TYPE, TYPE_RESET)
                .withIssuedAt(new Date(now))
                .withExpiresAt(new Date(now + Duration.ofMinutes(15).toMillis()))
                .sign(algorithm);
    }

    public DecodedJWT verifyResetToken(String token) {
        DecodedJWT decoded = verifier.verify(token);
        String type = decoded.getClaim(CLAIM_TYPE).asString();
        if (!TYPE_RESET.equals(type)) {
            throw new com.auth0.jwt.exceptions.JWTVerificationException("not a reset token");
        }
        return decoded;
    }

    public Long userId(DecodedJWT decoded) {
        return Long.valueOf(decoded.getSubject());
    }

    public String email(DecodedJWT decoded) {
        return decoded.getClaim(CLAIM_EMAIL).asString();
    }

    public Role role(DecodedJWT decoded) {
        return Role.valueOf(decoded.getClaim(CLAIM_ROLE).asString());
    }
}
