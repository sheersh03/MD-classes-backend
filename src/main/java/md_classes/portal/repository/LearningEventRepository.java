package md_classes.portal.repository;

import md_classes.portal.domain.LearningEvent;
import md_classes.portal.enums.LearningEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningEventRepository extends JpaRepository<LearningEvent, Long> {

    @Query("SELECT le FROM LearningEvent le " +
           "LEFT JOIN FETCH le.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH le.topic t " +
           "LEFT JOIN FETCH le.quiz q " +
           "WHERE s.id = :studentId " +
           "ORDER BY le.createdAt DESC")
    List<LearningEvent> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId);

    @Query("SELECT le FROM LearningEvent le " +
           "LEFT JOIN FETCH le.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH le.topic t " +
           "LEFT JOIN FETCH le.quiz q " +
           "WHERE s.user.id = :userId " +
           "ORDER BY le.createdAt DESC")
    List<LearningEvent> findByStudentUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT le FROM LearningEvent le " +
           "LEFT JOIN FETCH le.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH le.topic t " +
           "LEFT JOIN FETCH le.quiz q " +
           "WHERE s.id = :studentId AND le.eventType = :eventType " +
           "ORDER BY le.createdAt DESC")
    List<LearningEvent> findByStudentIdAndEventTypeOrderByCreatedAtDesc(@Param("studentId") Long studentId, @Param("eventType") LearningEventType eventType);

    @Query("SELECT le FROM LearningEvent le " +
           "LEFT JOIN FETCH le.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH le.topic t " +
           "LEFT JOIN FETCH le.quiz q " +
           "WHERE t.topicId = :topicId " +
           "ORDER BY le.createdAt DESC")
    List<LearningEvent> findByTopicTopicIdOrderByCreatedAtDesc(@Param("topicId") Integer topicId);

    @Query("SELECT le FROM LearningEvent le " +
           "LEFT JOIN FETCH le.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH le.topic t " +
           "LEFT JOIN FETCH le.quiz q " +
           "WHERE q.quizId = :quizId " +
           "ORDER BY le.createdAt DESC")
    List<LearningEvent> findByQuizQuizIdOrderByCreatedAtDesc(@Param("quizId") Integer quizId);

    @Query("SELECT le FROM LearningEvent le " +
           "LEFT JOIN FETCH le.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH le.topic t " +
           "LEFT JOIN FETCH le.quiz q " +
           "WHERE s.id = :studentId AND t.topicId = :topicId " +
           "ORDER BY le.createdAt DESC")
    List<LearningEvent> findByStudentIdAndTopicTopicIdOrderByCreatedAtDesc(@Param("studentId") Long studentId, @Param("topicId") Integer topicId);
}
