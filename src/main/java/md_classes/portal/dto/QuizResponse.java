package md_classes.portal.dto;

import md_classes.portal.domain.Quiz;

import java.util.List;

public record QuizResponse(
        Integer quizId,
        String title,
        String description,
        Integer topicId,
        Integer timeLimitMinutes,
        Integer totalQuestions,
        List<QuestionResponse> questions
) {
    public static QuizResponse from(Quiz quiz) {
        Integer topId = quiz.getTopic() != null ? quiz.getTopic().getTopicId() : null;
        List<QuestionResponse> questionList = quiz.getQuestions() != null
                ? quiz.getQuestions().stream().map(QuestionResponse::from).toList()
                : List.of();
        return new QuizResponse(
                quiz.getQuizId(),
                quiz.getTitle(),
                quiz.getDescription(),
                topId,
                quiz.getTimeLimitMinutes(),
                questionList.size(),
                questionList
        );
    }
}
