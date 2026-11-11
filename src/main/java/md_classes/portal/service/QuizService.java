package md_classes.portal.service;

import md_classes.portal.domain.Quiz;
import md_classes.portal.domain.Topic;
import md_classes.portal.dto.QuizRequest;
import md_classes.portal.dto.QuizResponse;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.QuizRepository;
import md_classes.portal.repository.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final TopicRepository topicRepository;

    public QuizService(QuizRepository quizRepository, TopicRepository topicRepository) {
        this.quizRepository = quizRepository;
        this.topicRepository = topicRepository;
    }

    @Transactional
    public QuizResponse create(QuizRequest req) {
        Topic topic = null;
        if (req.topicId() != null) {
            topic = topicRepository.findById(req.topicId())
                    .orElseThrow(() -> new NotFoundException("Topic with ID " + req.topicId() + " not found"));
        }
        Quiz quiz = new Quiz(req.title().trim(), req.description(), topic, req.timeLimitMinutes());
        quizRepository.save(quiz);
        return QuizResponse.from(quiz);
    }

    @Transactional(readOnly = true)
    public List<QuizResponse> getAll() {
        return quizRepository.findAll().stream()
                .map(QuizResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<QuizResponse> getByTopicId(Integer topicId) {
        if (!topicRepository.existsById(topicId)) {
            throw new NotFoundException("Topic with ID " + topicId + " not found");
        }
        return quizRepository.findByTopicTopicIdOrderByQuizIdAsc(topicId).stream()
                .map(QuizResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizResponse getById(Integer id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Quiz with ID " + id + " not found"));
        return QuizResponse.from(quiz);
    }

    @Transactional
    public QuizResponse update(Integer id, QuizRequest req) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Quiz with ID " + id + " not found"));

        if (req.topicId() != null) {
            Topic topic = topicRepository.findById(req.topicId())
                    .orElseThrow(() -> new NotFoundException("Topic with ID " + req.topicId() + " not found"));
            quiz.setTopic(topic);
        } else {
            quiz.setTopic(null);
        }

        quiz.setTitle(req.title().trim());
        quiz.setDescription(req.description());
        quiz.setTimeLimitMinutes(req.timeLimitMinutes());
        quizRepository.save(quiz);
        return QuizResponse.from(quiz);
    }

    @Transactional
    public void delete(Integer id) {
        if (!quizRepository.existsById(id)) {
            throw new NotFoundException("Quiz with ID " + id + " not found");
        }
        quizRepository.deleteById(id);
    }
}
