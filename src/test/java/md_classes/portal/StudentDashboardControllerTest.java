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
@EnabledIf("md_classes.portal.StudentDashboardControllerTest#dockerAvailable")
class StudentDashboardControllerTest {

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
    void testStudentDashboardAccessAndRestrictedLogin() throws Exception {
        // 1. Register an Admin
        String adminRegister = """
                {"name":"Sanjay StudentTest","email":"sanjay-student-test@md.test","password":"password123","role":"ADMIN"}
                """;
        mvc.perform(post("/apiv1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(adminRegister))
                .andExpect(status().isCreated());

        // 2. Login Admin to general auth to get Admin Token
        MvcResult adminLoginResult = mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"sanjay-student-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        String adminToken = json.readTree(adminLoginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 3. Create a Student record using Admin Token
        String createStudentBody = """
                {"name":"Rohit StudentTest","email":"rohit-student-test@md.test","password":"password123","phone":"9876543210","course":"Java Full Stack","batchId":"B-2026"}
                """;
        mvc.perform(post("/apiv1/students")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON).content(createStudentBody))
                .andExpect(status().isCreated());

        // 4. Register a Parent linked to Student "rohit-student-test@md.test"
        String parentRegister = """
                {"name":"Mr. Sharma StudentTest","email":"parent-sharma-student-test@md.test","password":"password123","role":"PARENT","studentEmail":"rohit-student-test@md.test"}
                """;
        mvc.perform(post("/apiv1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(parentRegister))
                .andExpect(status().isCreated());

        // Login Parent to general auth to get Parent Token
        MvcResult parentGenLoginResult = mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"parent-sharma-student-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        String parentToken = json.readTree(parentGenLoginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 5. Student logs in to Student Dashboard (Allowed)
        MvcResult studentLoginResult = mvc.perform(post("/apiv1/student-dashboard/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"rohit-student-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isString())
                .andExpect(jsonPath("$.user.role").value("STUDENT"))
                .andReturn();

        String studentToken = json.readTree(studentLoginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 6. Parent logs in to Student Dashboard (Denied)
        mvc.perform(post("/apiv1/student-dashboard/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"parent-sharma-student-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.message").value("Only students can login to the student dashboard"));

        // 7. Admin logs in to Student Dashboard (Denied)
        mvc.perform(post("/apiv1/student-dashboard/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"sanjay-student-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"))
                .andExpect(jsonPath("$.message").value("Only students can login to the student dashboard"));

        // 8. Test /apiv1/student-dashboard/overview: Without Token -> 401 Unauthorized
        mvc.perform(get("/apiv1/student-dashboard/overview"))
                .andExpect(status().isUnauthorized());

        // 9. Test /apiv1/student-dashboard/overview: With Student Token -> 200 OK
        mvc.perform(get("/apiv1/student-dashboard/overview")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.gpa").value("3.85"))
                .andExpect(jsonPath("$.attendance").value("94.2%"))
                .andExpect(jsonPath("$.studentDetails.course").value("Java Full Stack"))
                .andExpect(jsonPath("$.studentDetails.studentName").value("Rohit StudentTest"))
                .andExpect(jsonPath("$.upcomingClasses").isArray())
                .andExpect(jsonPath("$.announcements").isArray());

        // 10. Test /apiv1/student-dashboard/overview: With Parent Token -> 403 Forbidden
        mvc.perform(get("/apiv1/student-dashboard/overview")
                        .header("Authorization", "Bearer " + parentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // 11. Test /apiv1/student-dashboard/overview: With Admin Token -> 403 Forbidden
        mvc.perform(get("/apiv1/student-dashboard/overview")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void testSyllabusProgressTracker() throws Exception {
        // Register an Admin
        String adminRegister = """
                {"name":"Admin SyllabusTest","email":"admin-syllabus-test@md.test","password":"password123","role":"ADMIN"}
                """;
        mvc.perform(post("/apiv1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(adminRegister))
                .andExpect(status().isCreated());

        // Login Admin
        MvcResult adminLoginResult = mvc.perform(post("/apiv1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"admin-syllabus-test@md.test","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        String adminToken = json.readTree(adminLoginResult.getResponse().getContentAsString())
                .get("accessToken").asText();

        // 1. PUT request with syllabus progress payload
        String payload = """
                {
                    "studentClass": "Class 10",
                    "subject": "Maths",
                    "weekNumber": 1,
                    "topicsCovered": "Real Numbers, Polynomials",
                    "percentCompleted": 80,
                    "isMilestone": false
                }
                """;

        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put("/apiv1/syllabus-progress")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.studentClass").value("Class 10"))
                .andExpect(jsonPath("$.subject").value("Maths"))
                .andExpect(jsonPath("$.weekNumber").value(1))
                .andExpect(jsonPath("$.percentCompleted").value(80))
                .andExpect(jsonPath("$.isMilestone").value(false));
    }
}
