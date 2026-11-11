package md_classes.portal.dto;

import md_classes.portal.domain.Question;
import md_classes.portal.domain.QuestionAttempt;

public record QuestionAttemptResponse(
        Long questionAttemptId,
        Long attemptId,
        Integer questionId,
        String questionText,
        String optionA,
        String optionB,
        String optionC,
        String optionD,
        String selectedAnswer,
        String correctAnswer,
        String explanation,
        Boolean isCorrect,
        Integer marksAwarded,
        Integer questionMarks
) {
    public static QuestionAttemptResponse from(QuestionAttempt qa) {
        Question q = qa.getQuestion();
        Long attId = qa.getQuizAttempt() != null ? qa.getQuizAttempt().getAttemptId() : null;
        Integer qId = q != null ? q.getQuestionId() : null;
        String qText = q != null ? q.getQuestionText() : null;
        String optA = q != null ? q.getOptionA() : null;
        String optB = q != null ? q.getOptionB() : null;
        String optC = q != null ? q.getOptionC() : null;
        String optD = q != null ? q.getOptionD() : null;
        String correct = q != null ? q.getCorrectAnswer() : null;
        String expl = q != null ? q.getExplanation() : null;
        Integer qMarks = q != null ? q.getMarks() : null;

        return new QuestionAttemptResponse(
                qa.getQuestionAttemptId(),
                attId,
                qId,
                qText,
                optA,
                optB,
                optC,
                optD,
                qa.getSelectedAnswer(),
                correct,
                expl,
                qa.getIsCorrect(),
                qa.getMarksAwarded(),
                qMarks
        );
    }
}
