package md_classes.portal.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuestionAttemptRequest(
        @NotNull(message = "Question ID is required")
        Integer questionId,

        @Size(max = 500, message = "Selected answer cannot exceed 500 characters")
        String selectedAnswer,

        @Size(max = 500, message = "Selected option cannot exceed 500 characters")
        String selectedOption
) {
    public String answer() {
        if (selectedAnswer != null && !selectedAnswer.isBlank()) {
            return selectedAnswer.trim();
        }
        if (selectedOption != null && !selectedOption.isBlank()) {
            return selectedOption.trim();
        }
        return null;
    }
}
