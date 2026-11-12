package md_classes.portal.service;

import md_classes.portal.domain.Student;
import md_classes.portal.domain.Topic;
import md_classes.portal.entity.StudentTopicProgress;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.StudentRepository;
import md_classes.portal.repository.StudentTopicProgressRepository;
import md_classes.portal.repository.TopicRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StudentTopicProgressService {

    private final StudentTopicProgressRepository studentTopicProgressRepository;
    private final StudentRepository studentRepository;
    private final TopicRepository topicRepository;

    public StudentTopicProgressService(
            StudentTopicProgressRepository studentTopicProgressRepository,
            StudentRepository studentRepository,
            TopicRepository topicRepository
    ) {
        this.studentTopicProgressRepository = studentTopicProgressRepository;
        this.studentRepository = studentRepository;
        this.topicRepository = topicRepository;
    }

    /**
     * Receives Student and Topic, finds existing progress (or creates it if not found),
     * updates the percentage, calculates status, and saves it.
     */
    @Transactional
    public StudentTopicProgress updateProgress(Student student, Topic topic, Integer percentage) {
        if (student == null) {
            throw new IllegalArgumentException("Student cannot be null");
        }
        if (topic == null) {
            throw new IllegalArgumentException("Topic cannot be null");
        }

        int targetPercentage = percentage != null ? Math.max(0, Math.min(100, percentage)) : 0;

        StudentTopicProgress progress = studentTopicProgressRepository
                .findByStudentIdAndTopicTopicId(student.getId(), topic.getTopicId())
                .orElseGet(() -> new StudentTopicProgress(student, topic, 0, "Not_Started"));

        progress.setProgressPercentage(targetPercentage);
        String calculatedStatus = calculateStatus(targetPercentage);
        progress.setStatus(calculatedStatus);

        LocalDateTime now = LocalDateTime.now();
        if (targetPercentage > 0 && progress.getStartedAt() == null) {
            progress.setStartedAt(now);
        }
        if (targetPercentage >= 100) {
            if (progress.getCompletedAt() == null) {
                progress.setCompletedAt(now);
            }
        } else {
            progress.setCompletedAt(null);
        }
        progress.setUpdatedAt(now);

        return studentTopicProgressRepository.save(progress);
    }

    @Transactional
    public StudentTopicProgress updateProgress(Long studentId, Integer topicId, Integer percentage) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student with ID " + studentId + " not found"));
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new NotFoundException("Topic with ID " + topicId + " not found"));
        return updateProgress(student, topic, percentage);
    }

    public String calculateStatus(int percentage) {
        if (percentage >= 100) {
            return "Completed";
        } else if (percentage > 0) {
            return "In_Progress";
        } else {
            return "Not_Started";
        }
    }

    @Transactional(readOnly = true)
    public Optional<StudentTopicProgress> getProgress(Long studentId, Integer topicId) {
        return studentTopicProgressRepository.findByStudentIdAndTopicTopicId(studentId, topicId);
    }

    @Transactional(readOnly = true)
    public List<StudentTopicProgress> getProgressByStudent(Long studentId) {
        return studentTopicProgressRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public List<StudentTopicProgress> getProgressByTopic(Integer topicId) {
        return studentTopicProgressRepository.findByTopicTopicId(topicId);
    }

    @Transactional
    public void deleteProgress(Long studentId, Integer topicId) {
        studentTopicProgressRepository.deleteByStudentIdAndTopicTopicId(studentId, topicId);
    }
}
