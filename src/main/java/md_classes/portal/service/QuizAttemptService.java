package md_classes.portal.service;

import md_classes.portal.domain.Question;
import md_classes.portal.domain.QuestionAttempt;
import md_classes.portal.domain.Quiz;
import md_classes.portal.domain.QuizAttempt;
import md_classes.portal.domain.Student;
import md_classes.portal.dto.QuestionAttemptRequest;
import md_classes.portal.dto.QuizAttemptRequest;
import md_classes.portal.dto.QuizAttemptResponse;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.QuestionRepository;
import md_classes.portal.repository.QuizAttemptRepository;
import md_classes.portal.repository.QuizRepository;
import md_classes.portal.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuizAttemptService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final StudentRepository studentRepository;

    public QuizAttemptService(
            QuizAttemptRepository quizAttemptRepository,
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            StudentRepository studentRepository
    ) {
        this.quizAttemptRepository = quizAttemptRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public QuizAttemptResponse submitAttempt(QuizAttemptRequest req, Long authenticatedUserId) {
        Quiz quiz = quizRepository.findById(req.quizId())
                .orElseThrow(() -> new NotFoundException("Quiz with ID " + req.quizId() + " not found"));

        Student student;
        if (req.studentId() != null) {
            student = studentRepository.findById(req.studentId())
                    .orElseThrow(() -> new NotFoundException("Student with ID " + req.studentId() + " not found"));
        } else if (authenticatedUserId != null) {
            student = studentRepository.findByUserId(authenticatedUserId)
                    .orElseThrow(() -> new NotFoundException("Student profile not found for authenticated user ID " + authenticatedUserId));
        } else {
            throw new IllegalArgumentException("Student ID is required or user must be authenticated");
        }

        List<Question> questions = questionRepository.findByQuizQuizIdOrderByQuestionIdAsc(quiz.getQuizId());

        QuizAttempt attempt = new QuizAttempt(quiz, student);
        if (req.status() != null && !req.status().isBlank()) {
            attempt.setStatus(req.status().trim());
        } else {
            attempt.setStatus("COMPLETED");
        }

        if (req.startedAt() != null) {
            attempt.setStartedAt(req.startedAt());
        } else {
            attempt.setStartedAt(OffsetDateTime.now());
        }

        attempt.setCompletedAt(req.completedAt() != null ? req.completedAt() : OffsetDateTime.now());

        Map<Integer, QuestionAttemptRequest> answerMap = new HashMap<>();
        if (req.answers() != null) {
            for (QuestionAttemptRequest a : req.answers()) {
                if (a.questionId() != null) {
                    answerMap.put(a.questionId(), a);
                }
            }
        }

        int totalScore = 0;
        int totalMarks = 0;

        for (Question q : questions) {
            QuestionAttemptRequest ansReq = answerMap.get(q.getQuestionId());
            String studentAnswer = ansReq != null ? ansReq.answer() : null;

            boolean isCorrect = isAnswerCorrect(q, studentAnswer);
            int qMarks = q.getMarks() != null ? q.getMarks() : 1;
            int marksAwarded = isCorrect ? qMarks : 0;

            QuestionAttempt qa = new QuestionAttempt(attempt, q, studentAnswer, isCorrect, marksAwarded);
            attempt.addQuestionAttempt(qa);

            totalScore += marksAwarded;
            totalMarks += qMarks;
        }

        double percentage = totalMarks > 0 ? ((double) totalScore / totalMarks) * 100.0 : 0.0;
        percentage = Math.round(percentage * 100.0) / 100.0;

        attempt.setScore(totalScore);
        attempt.setTotalMarks(totalMarks);
        attempt.setPercentage(percentage);

        QuizAttempt saved = quizAttemptRepository.save(attempt);
        return QuizAttemptResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getAll() {
        return quizAttemptRepository.findAll().stream()
                .map(QuizAttemptResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizAttemptResponse getById(Long id) {
        QuizAttempt attempt = quizAttemptRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Quiz attempt with ID " + id + " not found"));
        return QuizAttemptResponse.from(attempt);
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getByStudentId(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new NotFoundException("Student with ID " + studentId + " not found");
        }
        return quizAttemptRepository.findByStudentIdOrderByCreatedAtDesc(studentId).stream()
                .map(QuizAttemptResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getByUserId(Long userId) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentUserIdOrderByCreatedAtDesc(userId);
        if (attempts.isEmpty()) {
            attempts = quizAttemptRepository.findByStudentIdOrderByCreatedAtDesc(userId);
        }
        return attempts.stream()
                .map(QuizAttemptResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getByQuizId(Integer quizId) {
        if (!quizRepository.existsById(quizId)) {
            throw new NotFoundException("Quiz with ID " + quizId + " not found");
        }
        return quizAttemptRepository.findByQuizQuizIdOrderByCreatedAtDesc(quizId).stream()
                .map(QuizAttemptResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuizAttemptResponse> getByStudentAndQuiz(Long studentId, Integer quizId) {
        return quizAttemptRepository.findByStudentIdAndQuizQuizIdOrderByCreatedAtDesc(studentId, quizId).stream()
                .map(QuizAttemptResponse::from)
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        if (!quizAttemptRepository.existsById(id)) {
            throw new NotFoundException("Quiz attempt with ID " + id + " not found");
        }
        quizAttemptRepository.deleteById(id);
    }

    private boolean isAnswerCorrect(Question question, String studentAnswer) {
        if (studentAnswer == null || studentAnswer.isBlank()) {
            return false;
        }
        String ans = studentAnswer.trim();
        String correct = question.getCorrectAnswer() != null ? question.getCorrectAnswer().trim() : "";

        // 1. Direct match (case-insensitive)
        if (ans.equalsIgnoreCase(correct)) {
            return true;
        }

        // 2. Student answer matches option key ("A", "B", "C", "D") and correct matches that option text
        String studentOptionText = resolveOptionText(question, ans);
        if (studentOptionText != null && studentOptionText.equalsIgnoreCase(correct)) {
            return true;
        }

        // 3. Question correct answer is option key ("A", "B", "C", "D") and student answered with full text
        String correctOptionText = resolveOptionText(question, correct);
        if (correctOptionText != null && correctOptionText.equalsIgnoreCase(ans)) {
            return true;
        }

        return false;
    }

    private String resolveOptionText(Question question, String key) {
        if (key == null) return null;
        String normalized = key.trim().toLowerCase();
        return switch (normalized) {
            case "a", "option_a", "optiona" -> question.getOptionA();
            case "b", "option_b", "optionb" -> question.getOptionB();
            case "c", "option_c", "optionc" -> question.getOptionC();
            case "d", "option_d", "optiond" -> question.getOptionD();
            default -> null;
        };
    }
}
