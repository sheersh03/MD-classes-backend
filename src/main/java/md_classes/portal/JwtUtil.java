package md_classes.portal;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;

public class JwtUtil {
    // Secret key used to sign the token (must be secure and at least 256 bits)
    private static final String SECRET = "your-custom-very-long-and-secure-jwt-secret-key-123456789";
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET);

    /**
     * Generates a standard HS256 JWT for the given email using com.auth0:java-jwt.
     * The token is valid for 1 hour.
     */
    public static String generateToken(String email) {
        long nowMillis = System.currentTimeMillis();
        Date now = new Date(nowMillis);
        Date exp = new Date(nowMillis + 3600 * 1000); // Expires in 1 hour

        return JWT.create()
                .withSubject(email)
                .withIssuedAt(now)
                .withExpiresAt(exp)
                .sign(ALGORITHM);
    }
}
