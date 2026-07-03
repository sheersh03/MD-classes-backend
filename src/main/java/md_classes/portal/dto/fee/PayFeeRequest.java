package md_classes.portal.dto.fee;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PayFeeRequest(
    @NotNull(message = "Payment amount is required") @Min(1) Integer amount
) {}
