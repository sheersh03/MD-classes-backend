package md_classes.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuestionRequest(
        @NotNull(message = "Quiz ID is required")
        Integer quizId,

        @NotBlank(message = "Question text is required")
        @Size(max = 1000, message = "Question text cannot exceed 1000 characters")
        String questionText,

        @NotBlank(message = "Option A is required")
        @Size(max = 500, message = "Option A cannot exceed 500 characters")
        String optionA,

        @NotBlank(message = "Option B is required")
        @Size(max = 500, message = "Option B cannot exceed 500 characters")
        String optionB,

        @Size(max = 500, message = "Option C cannot exceed 500 characters")
        String optionC,

        @Size(max = 500, message = "Option D cannot exceed 500 characters")
        String optionD,

        @NotBlank(message = "Correct answer is required")
        @Size(max = 500, message = "Correct answer cannot exceed 500 characters")
        String correctAnswer,

        @Size(max = 1000, message = "Explanation cannot exceed 1000 characters")
        String explanation,

        Integer marks
) {}
