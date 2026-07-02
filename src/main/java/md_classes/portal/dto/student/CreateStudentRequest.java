package md_classes.portal.dto.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateStudentRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Pattern(regexp = "^[+0-9 \\-]{7,20}$", message = "phone must be 7-20 chars of digits/space/+/-") String phone,
        @Size(max = 120) String course,
        @Size(max = 40) String batchId,
        @Size(max = 80) String studentClass
) {}
