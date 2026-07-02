package md_classes.portal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.DockerClientFactory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@EnabledIf("md_classes.portal.AuthFlowIntegrationTest#dockerAvailable")
class AuthFlowIntegrationTest {

    static boolean dockerAvailable() {
        try {
            return DockerClientFactory.instance().isDockerAvailable();
        } catch (Throwable t) {
            return false;
        }
    }

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper json;

    @Test
    void registerLoginAndProtectedAccess() throws Exception {
        // 1. register admin
        String registerBody = """
                {"name":"Admin","email":"admin-it@md.test","password":"hunter22hunter22","role":"ADMIN"}
                """;
        MvcResult registerResult = mvc.perform(post("/apiv1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.refreshToken").isString())
                .andExpect(jsonPath("$.user.email").value("admin-it@md.test"))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andReturn();

        JsonNode authNode = json.readTree(registerResult.getResponse().getContentAsString());
        String accessToken = authNode.get("accessToken").asText();
        String refreshToken = authNode.get("refreshToken").asText();
        assertThat(accessToken).isNotBlank();

        // 2. duplicate register → 409
        mvc.perform(post("/apiv1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(registerBody))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_EMAIL"));

        // 3. login bad password → 401
        mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin-it@md.test","password":"wrong-password"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("BAD_CREDENTIALS"));

        // 4. login OK → tokens
        MvcResult loginResult = mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin-it@md.test","password":"hunter22hunter22"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        String loginAccess = json.readTree(loginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 5. protected endpoint without token → 401
        mvc.perform(get("/apiv1/students"))
                .andExpect(status().isUnauthorized());

        // 6. protected endpoint with bad token → 401
        mvc.perform(get("/apiv1/students").header("Authorization", "Bearer junk.token.value"))
                .andExpect(status().isUnauthorized());

        // 7. protected endpoint with good token → 200, empty list
        mvc.perform(get("/apiv1/students").header("Authorization", "Bearer " + loginAccess))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());

        // 8. admin creates a student
        String createBody = """
                {"name":"Yash","email":"yash-it@md.test","password":"yashpass1","phone":"9876543210","course":"Java Full Stack","batchId":"B001","studentClass":"Class 10"}
                """;
        MvcResult createResult = mvc.perform(post("/apiv1/students")
                        .header("Authorization", "Bearer " + loginAccess)
                        .contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("yash-it@md.test"))
                .andExpect(jsonPath("$.course").value("Java Full Stack"))
                .andExpect(jsonPath("$.password").value("yashpass1"))
                .andExpect(jsonPath("$.studentClass").value("Class 10"))
                .andReturn();
        Long studentId = json.readTree(createResult.getResponse().getContentAsString())
                .get("id").asLong();

        // 9. student logs in
        MvcResult studentLogin = mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"yash-it@md.test","password":"yashpass1"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        String studentAccess = json.readTree(studentLogin.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 10. student CANNOT delete (403)
        mvc.perform(delete("/apiv1/students/" + studentId)
                        .header("Authorization", "Bearer " + studentAccess))
                .andExpect(status().isForbidden());

        // 11. student CAN view own record
        mvc.perform(get("/apiv1/students/" + studentId)
                        .header("Authorization", "Bearer " + studentAccess))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("yash-it@md.test"));

        // 12. refresh issues new tokens
        String refreshBody = """
                {"refreshToken":"%s"}
                """.formatted(refreshToken);
        mvc.perform(post("/apiv1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON).content(refreshBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString());

        // 13. admin resets student's password
        String resetByAdminBody = """
                {"password":"newyashpass"}
                """;
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/apiv1/students/" + studentId)
                        .header("Authorization", "Bearer " + loginAccess)
                        .contentType(MediaType.APPLICATION_JSON).content(resetByAdminBody))
                .andExpect(status().isOk());

        // verify student can login with new password reset by admin
        mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"yash-it@md.test","password":"newyashpass"}
                                """))
                .andExpect(status().isOk());

        // 14. self-service forgot and reset password flow
        String forgotBody = """
                {"email":"yash-it@md.test"}
                """;
        MvcResult forgotResult = mvc.perform(post("/apiv1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON).content(forgotBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andReturn();

        String resetToken = json.readTree(forgotResult.getResponse().getContentAsString())
                .get("token").asText();

        String resetBody = """
                {"token":"%s","newPassword":"finalpassyash"}
                """.formatted(resetToken);
        mvc.perform(post("/apiv1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON).content(resetBody))
                .andExpect(status().isOk());

        // verify student can login with self-service reset password
        mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"yash-it@md.test","password":"finalpassyash"}
                                """))
                .andExpect(status().isOk());
    }
}
