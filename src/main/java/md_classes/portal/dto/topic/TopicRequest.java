package md_classes.portal.dto.topic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TopicRequest(
        @NotNull(message = "Unit ID is required")
        Integer unitId,

        @NotBlank(message = "Topic name is required")
        @Size(max = 500, message = "Topic name cannot exceed 500 characters")
        String topicName
) {}
