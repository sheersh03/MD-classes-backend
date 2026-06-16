package md_classes.portal.service;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import md_classes.portal.domain.User;
import md_classes.portal.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-unit-test-secret-32chars!";

    private JwtService jwt;
    private User user;

    @BeforeEach
    void setUp() {
        jwt = new JwtService(SECRET, Duration.ofMinutes(15), Duration.ofDays(7), "test-issuer");
        ReflectionTestUtils.invokeMethod(jwt, "init");
        user = newUser(42L, "alice@md.test", Role.ADMIN);
    }

    @Test
    void rejectsShortSecret() {
        assertThatThrownBy(() -> new JwtService("too-short", Duration.ofMinutes(15), Duration.ofDays(7), "i"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 chars");
    }

    @Test
    void accessTokenRoundTrip() {
        String token = jwt.generateAccessToken(user);
        DecodedJWT decoded = jwt.verifyAccessToken(token);
        assertThat(jwt.userId(decoded)).isEqualTo(42L);
        assertThat(jwt.email(decoded)).isEqualTo("alice@md.test");
        assertThat(jwt.role(decoded)).isEqualTo(Role.ADMIN);
    }

    @Test
    void refreshTokenRoundTrip() {
        String token = jwt.generateRefreshToken(user);
        DecodedJWT decoded = jwt.verifyRefreshToken(token);
        assertThat(jwt.userId(decoded)).isEqualTo(42L);
    }

    @Test
    void accessTokenRejectedAsRefresh() {
        String access = jwt.generateAccessToken(user);
        assertThatThrownBy(() -> jwt.verifyRefreshToken(access))
                .isInstanceOf(JWTVerificationException.class)
                .hasMessageContaining("not a refresh token");
    }

    @Test
    void refreshTokenRejectedAsAccess() {
        String refresh = jwt.generateRefreshToken(user);
        assertThatThrownBy(() -> jwt.verifyAccessToken(refresh))
                .isInstanceOf(JWTVerificationException.class)
                .hasMessageContaining("not an access token");
    }

    @Test
    void wrongSecretIsRejected() {
        String token = jwt.generateAccessToken(user);
        JwtService other = new JwtService("another-secret-another-secret-32-chars!!", Duration.ofMinutes(15), Duration.ofDays(7), "test-issuer");
        ReflectionTestUtils.invokeMethod(other, "init");
        assertThatThrownBy(() -> other.verifyAccessToken(token))
                .isInstanceOf(JWTVerificationException.class);
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService shortLived = new JwtService(SECRET, Duration.ofMillis(1), Duration.ofMillis(1), "test-issuer");
        ReflectionTestUtils.invokeMethod(shortLived, "init");
        String token = shortLived.generateAccessToken(user);
        try { Thread.sleep(10); } catch (InterruptedException ignored) {}
        assertThatThrownBy(() -> shortLived.verifyAccessToken(token))
                .isInstanceOf(JWTVerificationException.class);
    }

    private static User newUser(Long id, String email, Role role) {
        // User has a protected no-arg ctor for JPA; use reflection so tests don't need a Spring context.
        try {
            Constructor<User> ctor = User.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            User u = ctor.newInstance();
            setField(u, "id", id);
            setField(u, "name", "Alice");
            setField(u, "email", email);
            setField(u, "passwordHash", "x");
            setField(u, "role", role);
            return u;
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }

    private static void setField(Object target, String field, Object value) throws ReflectiveOperationException {
        Field f = target.getClass().getDeclaredField(field);
        f.setAccessible(true);
        f.set(target, value);
    }
}
