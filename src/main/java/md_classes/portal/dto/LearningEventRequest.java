package md_classes.portal.dto;

import jakarta.validation.constraints.NotNull;
import md_classes.portal.enums.LearningEventType;

public record LearningEventRequest(
        Long studentId,
        @NotNull(message = "eventType is required")
        LearningEventType eventType,
        Integer topicId,
        Integer quizId,
        String notesId,
        String metadata
) {}
