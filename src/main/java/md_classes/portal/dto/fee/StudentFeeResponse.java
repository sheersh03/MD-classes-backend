package md_classes.portal.dto.fee;

public record StudentFeeResponse(
    Long studentId,
    String studentName,
    Integer totalFee,
    Integer paidAmount,
    Integer remainingFee
) {}
