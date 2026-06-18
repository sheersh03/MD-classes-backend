package md_classes.portal;

import md_classes.portal.dto.auth.LoginRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboardPage() {
        return "dashboard";
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> loginJson(@RequestBody LoginRequest loginRequest) {
        System.out.println("====== [JSON LOGIN ATTEMPT] ======");
        System.out.println("Email: " + loginRequest.email());
        System.out.println("Password: " + loginRequest.password());
        System.out.println("==================================");

        String token = JwtUtil.generateToken(loginRequest.email());

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Login details captured successfully (no authentication performed)",
                "email", loginRequest.email(),
                "password", loginRequest.password(),
                "token", token
        ));
    }

    @PostMapping(value = "/login", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> loginForm(
            @RequestParam("email") String email,
            @RequestParam("password") String password) {
        System.out.println("====== [FORM LOGIN ATTEMPT] ======");
        System.out.println("Email: " + email);
        System.out.println("Password: " + password);
        System.out.println("==================================");

        String token = JwtUtil.generateToken(email);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Login details captured successfully (no authentication performed)",
                "email", email,
                "password", password,
                "token", token
        ));
    }
}
