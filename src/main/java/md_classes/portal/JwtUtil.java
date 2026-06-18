package md_classes.portal;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import java.util.Date;

public class JwtUtil {
    
    private static final String SECRET = System.getenv("MD_JWT_SECRET") != null 
            ? System.getenv("MD_JWT_SECRET") 
            : "mysecretkeymustbeatleast32characterslongforsecurity";
            
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET);

    public static String generateToken(String email) {
        long now = System.currentTimeMillis();
        return JWT.create()
                .withIssuer("md-classes-portal")
                .withSubject(email)
                .withClaim("email", email)
                .withClaim("role", "STUDENT")
                .withClaim("type", "access")
                .withIssuedAt(new Date(now))
                .withExpiresAt(new Date(now + 900_000)) // 15 minutes TTL
                .sign(ALGORITHM);
    }
}
