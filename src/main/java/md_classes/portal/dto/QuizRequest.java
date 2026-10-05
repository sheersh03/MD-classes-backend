package md_classes.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QuizRequest(
        @NotBlank(message = "Quiz title is required")
        @Size(max = 200, message = "Quiz title cannot exceed 200 characters")
        String title,

        @Size(max = 1000, message = "Quiz description cannot exceed 1000 characters")
        String description,

        Integer topicId,

        Integer timeLimitMinutes
) {}
