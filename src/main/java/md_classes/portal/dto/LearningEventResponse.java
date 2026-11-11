package md_classes.portal.dto;

import md_classes.portal.domain.LearningEvent;
import md_classes.portal.enums.LearningEventType;

import java.time.OffsetDateTime;

public record LearningEventResponse(
        Long eventId,
        Long studentId,
        String studentName,
        LearningEventType eventType,
        Integer topicId,
        String topicName,
        Integer quizId,
        String quizTitle,
        String notesId,
        String metadata,
        OffsetDateTime createdAt
) {
    public static LearningEventResponse from(LearningEvent e) {
        Long sId = e.getStudent() != null ? e.getStudent().getId() : null;
        String sName = (e.getStudent() != null && e.getStudent().getUser() != null)
                ? e.getStudent().getUser().getName()
                : null;
        Integer tId = e.getTopic() != null ? e.getTopic().getTopicId() : null;
        String tName = e.getTopic() != null ? e.getTopic().getTopicName() : null;
        Integer qId = e.getQuiz() != null ? e.getQuiz().getQuizId() : null;
        String qTitle = e.getQuiz() != null ? e.getQuiz().getTitle() : null;

        return new LearningEventResponse(
                e.getId(),
                sId,
                sName,
                e.getEventType(),
                tId,
                tName,
                qId,
                qTitle,
                e.getNotesId(),
                e.getMetadata(),
                e.getCreatedAt()
        );
    }
}
