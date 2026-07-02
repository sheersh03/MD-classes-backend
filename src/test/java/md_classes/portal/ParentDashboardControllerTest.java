package md_classes.portal;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@EnabledIf("md_classes.portal.ParentDashboardControllerTest#dockerAvailable")
class ParentDashboardControllerTest {

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
    void testParentDashboardAccessAndRestrictedLogin() throws Exception {
        // 1. Register an Admin
        String adminRegister = """
                {"name":"Sanjay ParentTest","email":"sanjay-parent-test@md.test","password":"password123","role":"ADMIN"}
                """;
        mvc.perform(post("/apiv1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(adminRegister))
                .andExpect(status().isCreated());

        // 2. Login Admin to general auth to get Admin Token
        MvcResult adminLoginResult = mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"sanjay-parent-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        String adminToken = json.readTree(adminLoginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 3. Create a Student record using Admin Token
        String createStudentBody = """
                {"name":"Rohit ParentTest","email":"rohit-parent-test@md.test","password":"password123","phone":"9876543210","course":"Java Full Stack","batchId":"B-2026"}
                """;
        mvc.perform(post("/apiv1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(createStudentBody))
                .andExpect(status().isCreated());

        // Login Student to general auth to get Student Token
        MvcResult studentGenLoginResult = mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"rohit-parent-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        String studentToken = json.readTree(studentGenLoginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 4. Register a Parent linked to Student "rohit-parent-test@md.test"
        String parentRegister = """
                {"name":"Mr. Sharma ParentTest","email":"parent-sharma-parent-test@md.test","password":"password123","role":"PARENT","studentEmail":"rohit-parent-test@md.test"}
                """;
        mvc.perform(post("/apiv1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(parentRegister))
                .andExpect(status().isCreated());

        // 5. Parent logs in to Parent Dashboard (Allowed)
        MvcResult parentLoginResult = mvc.perform(post("/apiv1/parent-dashboard/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"parent-sharma-parent-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.user.role").value("PARENT"))
                .andReturn();

        String parentToken = json.readTree(parentLoginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 6. Student logs in to Parent Dashboard (Denied)
        mvc.perform(post("/apiv1/parent-dashboard/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"rohit-parent-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.message").value("Only parents can login to the parent dashboard"));

        // 7. Admin logs in to Parent Dashboard (Denied)
        mvc.perform(post("/apiv1/parent-dashboard/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"sanjay-parent-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.message").value("Only parents can login to the parent dashboard"));

        // 8. Test /apiv1/parent-dashboard/overview: Without Token -> 401 Unauthorized
        mvc.perform(get("/apiv1/parent-dashboard/overview"))
                .andExpect(status().isUnauthorized());

        // 9. Test /apiv1/parent-dashboard/overview: With Parent Token -> 200 OK (verifying child details are loaded)
        mvc.perform(get("/apiv1/parent-dashboard/overview")
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gpa").value("3.85"))
                .andExpect(jsonPath("$.attendance").value("94.2%"))
                .andExpect(jsonPath("$.studentDetails.course").value("Java Full Stack"))
                .andExpect(jsonPath("$.studentDetails.studentName").value("Rohit ParentTest"))
                .andExpect(jsonPath("$.studentDetails.batchId").value("B-2026"));

        // 10. Test /apiv1/parent-dashboard/overview: With Student Token -> 403 Forbidden
        mvc.perform(get("/apiv1/parent-dashboard/overview")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // 11. Test /apiv1/parent-dashboard/overview: With Admin Token -> 403 Forbidden
        mvc.perform(get("/apiv1/parent-dashboard/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }
}
