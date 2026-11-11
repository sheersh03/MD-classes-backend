package md_classes.portal.dto;

import md_classes.portal.domain.Question;

public record QuestionResponse(
        Integer questionId,
        Integer quizId,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        String correctAnswer,
        String explanation,
        Integer marks
) {
    public static QuestionResponse from(Question question) {
        Integer qId = question.getQuiz() != null ? question.getQuiz().getQuizId() : null;
        return new QuestionResponse(
                question.getQuestionId(),
                qId,
                question.getQuestionText(),
                question.getOptionA(),
                question.getOptionB(),
                question.getOptionC(),
                question.getOptionD(),
                question.getCorrectAnswer(),
                question.getExplanation(),
                question.getMarks()
        );
    }
}
