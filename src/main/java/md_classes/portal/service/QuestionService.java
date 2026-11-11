package md_classes.portal.service;

import md_classes.portal.domain.Question;
import md_classes.portal.domain.Quiz;
import md_classes.portal.dto.QuestionRequest;
import md_classes.portal.dto.QuestionResponse;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.QuestionRepository;
import md_classes.portal.repository.QuizRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizRepository quizRepository;

    public QuestionService(QuestionRepository questionRepository, QuizRepository quizRepository) {
        this.questionRepository = questionRepository;
        this.quizRepository = quizRepository;
    }

    @Transactional
    public QuestionResponse create(QuestionRequest req) {
        Quiz quiz = quizRepository.findById(req.quizId())
                .orElseThrow(() -> new NotFoundException("Quiz with ID " + req.quizId() + " not found"));

        Question question = new Question(
                quiz,
                req.questionText().trim(),
                req.optionA() != null ? req.optionA().trim() : null,
                req.optionB() != null ? req.optionB().trim() : null,
                req.optionC() != null ? req.optionC().trim() : null,
                req.optionD() != null ? req.optionD().trim() : null,
                req.correctAnswer().trim(),
                req.explanation(),
                req.marks() != null ? req.marks() : 1
        );

        questionRepository.save(question);
        return QuestionResponse.from(question);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getAll() {
        return questionRepository.findAll().stream()
                .map(QuestionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getByQuizId(Integer quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new NotFoundException("Quiz with ID " + quizId + " not found");
        }
        return questionRepository.findByQuizQuizIdOrderByQuestionIdAsc(quizId).stream()
                .map(QuestionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuestionResponse getById(Integer id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question with ID " + id + " not found"));
        return QuestionResponse.from(question);
    }

    @Transactional
    public QuestionResponse update(Integer id, QuestionRequest req) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Question with ID " + id + " not found"));

        if (req.quizId() != null && !req.quizId().equals(question.getQuiz().getQuizId())) {
            Quiz quiz = quizRepository.findById(req.quizId())
                    .orElseThrow(() -> new NotFoundException("Quiz with ID " + req.quizId() + " not found"));
            question.setQuiz(quiz);
        }

        question.setQuestionText(req.questionText().trim());
        question.setOptionA(req.optionA() != null ? req.optionA().trim() : null);
        question.setOptionB(req.optionB() != null ? req.optionB().trim() : null);
        question.setOptionC(req.optionC() != null ? req.optionC().trim() : null);
        question.setOptionD(req.optionD() != null ? req.optionD().trim() : null);
        question.setCorrectAnswer(req.correctAnswer().trim());
        question.setExplanation(req.explanation());
        if (req.marks() != null) {
            question.setMarks(req.marks());
        }

        questionRepository.save(question);
        return QuestionResponse.from(question);
    }

    @Transactional
    public void delete(Integer id) {
        if (!questionRepository.existsById(id)) {
            throw new NotFoundException("Question with ID " + id + " not found");
        }
        questionRepository.deleteById(id);
    }
}
