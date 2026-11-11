package md_classes.portal.service;

import md_classes.portal.domain.QuestionAttempt;
import md_classes.portal.dto.QuestionAttemptResponse;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.QuestionAttemptRepository;
import md_classes.portal.repository.QuizAttemptRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionAttemptService {

    private final QuestionAttemptRepository questionAttemptRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public QuestionAttemptService(
            QuestionAttemptRepository questionAttemptRepository,
            QuizAttemptRepository quizAttemptRepository
    ) {
        this.questionAttemptRepository = questionAttemptRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    @Transactional(readOnly = true)
    public List<QuestionAttemptResponse> getByAttemptId(Long attemptId) {
        if (!quizAttemptRepository.existsById(attemptId)) {
            throw new NotFoundException("Quiz attempt with ID " + attemptId + " not found");
        }
        return questionAttemptRepository.findByQuizAttemptAttemptIdOrderByQuestionAttemptIdAsc(attemptId).stream()
                .map(QuestionAttemptResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuestionAttemptResponse getById(Long id) {
        QuestionAttempt qa = questionAttemptRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question attempt with ID " + id + " not found"));
        return QuestionAttemptResponse.from(qa);
    }

    @Transactional(readOnly = true)
    public List<QuestionAttemptResponse> getByQuestionId(Integer questionId) {
        return questionAttemptRepository.findByQuestionQuestionIdOrderByQuestionAttemptIdAsc(questionId).stream()
                .map(QuestionAttemptResponse::from)
                .toList();
    }
}
