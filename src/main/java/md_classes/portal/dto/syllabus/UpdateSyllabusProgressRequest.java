package md_classes.portal.dto.syllabus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateSyllabusProgressRequest(
    @NotBlank(message = "Class is required") String studentClass,
    @NotBlank(message = "Subject is required") String subject,
    @NotNull(message = "Week number is required") @Min(1) Integer weekNumber,
    String topicsCovered,
    @NotNull(message = "Percent completed is required") @Min(0) @Max(100) Integer percentCompleted,
    @NotNull(message = "Milestone flag is required") Boolean isMilestone
) {}
