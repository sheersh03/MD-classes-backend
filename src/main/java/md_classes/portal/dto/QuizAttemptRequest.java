package md_classes.portal.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;
import java.util.List;

public record QuizAttemptRequest(
        @NotNull(message = "Quiz ID is required")
        Integer quizId,

        Long studentId,

        @Size(max = 50, message = "Status cannot exceed 50 characters")
        String status,

        OffsetDateTime startedAt,

        OffsetDateTime completedAt,

        @Valid
        List<QuestionAttemptRequest> answers
) {}
