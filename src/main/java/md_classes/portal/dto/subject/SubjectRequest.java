package md_classes.portal.dto.subject;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubjectRequest(
        @NotBlank(message = "Subject name is required")
        @Size(max = 100, message = "Subject name cannot exceed 100 characters")
        String subjectName
) {}
