package md_classes.portal.dto.unit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UnitRequest(
        @NotNull(message = "Subject ID is required")
        Integer subjectId,

        @NotBlank(message = "Unit name is required")
        @Size(max = 100, message = "Unit name cannot exceed 100 characters")
        String unitName
) {}
