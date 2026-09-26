package md_classes.portal.dto.student;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateStudentRequest(
        @Size(max = 120) String name,
        @Pattern(regexp = "^$|^[+0-9 \\-]{7,20}$", message = "Phone must be 7-20 characters of digits, spaces, + or -") String phone,
        @Size(max = 120) String course,
        @Size(max = 40) String batchId,
        @Size(min = 8, max = 100, message = "Password must be at least 8 characters") String password,
        @Size(max = 80) String studentClass
) {}

