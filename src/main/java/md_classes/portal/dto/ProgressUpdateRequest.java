package md_classes.portal.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ProgressUpdateRequest(
        Long studentId,

        @NotNull(message = "Topic ID is required")
        Integer topicId,

        @Min(0) @Max(100)
        Integer progressPercentage,

        Boolean completed,

        String status
) {
    public ProgressUpdateRequest(Integer topicId, Boolean completed) {
        this(null, topicId, (completed != null && completed) ? 100 : 0, completed, (completed != null && completed) ? "Completed" : "Not_Started");
    }
}
