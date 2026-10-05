package md_classes.portal.dto;

import md_classes.portal.domain.QuizAttempt;

import java.time.OffsetDateTime;
import java.util.List;

public record QuizAttemptResponse(
        Long attemptId,
        Integer quizId,
        String quizTitle,
        Integer topicId,
        Long studentId,
        String studentName,
        Integer score,
        Integer totalMarks,
        Double percentage,
        String status,
        OffsetDateTime startedAt,
        OffsetDateTime completedAt,
        Integer totalQuestions,
        Integer correctAnswersCount,
        List<QuestionAttemptResponse> questionAttempts
) {
    public static QuizAttemptResponse from(QuizAttempt attempt) {
        Integer qId = attempt.getQuiz() != null ? attempt.getQuiz().getQuizId() : null;
        String qTitle = attempt.getQuiz() != null ? attempt.getQuiz().getTitle() : null;
        Integer tId = (attempt.getQuiz() != null && attempt.getQuiz().getTopic() != null)
                ? attempt.getQuiz().getTopic().getTopicId()
                : (attempt.getQuiz() != null ? attempt.getQuiz().getTopicId() : null);
        Long sId = attempt.getStudent() != null ? attempt.getStudent().getId() : null;
        String sName = (attempt.getStudent() != null && attempt.getStudent().getUser() != null)
                ? attempt.getStudent().getUser().getName()
                : null;

        List<QuestionAttemptResponse> qaList = attempt.getQuestionAttempts() != null
                ? attempt.getQuestionAttempts().stream().map(QuestionAttemptResponse::from).toList()
                : List.of();

        long correctCount = qaList.stream().filter(qa -> Boolean.TRUE.equals(qa.isCorrect())).count();

        return new QuizAttemptResponse(
                attempt.getAttemptId(),
                qId,
                qTitle,
                tId,
                sId,
                sName,
                attempt.getScore(),
                attempt.getTotalMarks(),
                attempt.getPercentage(),
                attempt.getStatus(),
                attempt.getStartedAt(),
                attempt.getCompletedAt(),
                qaList.size(),
                (int) correctCount,
                qaList
        );
    }
}
