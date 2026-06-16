package md_classes.portal.dto.student;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateStudentRequest(
        @Size(max = 120) String name,
        @Pattern(regexp = "^[+0-9 \\-]{7,20}$", message = "phone must be 7-20 chars of digits/space/+/-") String phone,
        @Size(max = 120) String course,
        @Size(max = 40) String batchId
) {}
