package md_classes.portal.dto.fee;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateStudentFeeRequest(
    @NotNull(message = "Student ID is required") Long studentId,
    @NotNull(message = "Total fee is required") @Min(0) Integer totalFee,
    @NotNull(message = "Paid amount is required") @Min(0) Integer paidAmount
) {}
