package md_classes.portal.dto.fee;

import java.time.OffsetDateTime;

public record FeeTransactionResponse(
    Long transactionId,
    Long studentId,
    String studentName,
    Integer amount,
    String paymentMethod,
    String transactionReference,
    OffsetDateTime createdAt
) {}
