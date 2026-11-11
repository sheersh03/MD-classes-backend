package md_classes.portal.repository;

import md_classes.portal.domain.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    @Query("SELECT DISTINCT qa FROM QuizAttempt qa " +
           "LEFT JOIN FETCH qa.quiz q " +
           "LEFT JOIN FETCH q.topic " +
           "LEFT JOIN FETCH qa.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH qa.questionAttempts qatt " +
           "LEFT JOIN FETCH qatt.question " +
           "WHERE s.id = :studentId " +
           "ORDER BY qa.createdAt DESC")
    List<QuizAttempt> findByStudentIdOrderByCreatedAtDesc(@Param("studentId") Long studentId);

    @Query("SELECT DISTINCT qa FROM QuizAttempt qa " +
           "LEFT JOIN FETCH qa.quiz q " +
           "LEFT JOIN FETCH q.topic " +
           "LEFT JOIN FETCH qa.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH qa.questionAttempts qatt " +
           "LEFT JOIN FETCH qatt.question " +
           "WHERE s.user.id = :userId " +
           "ORDER BY qa.createdAt DESC")
    List<QuizAttempt> findByStudentUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT DISTINCT qa FROM QuizAttempt qa " +
           "LEFT JOIN FETCH qa.quiz q " +
           "LEFT JOIN FETCH q.topic " +
           "LEFT JOIN FETCH qa.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH qa.questionAttempts qatt " +
           "LEFT JOIN FETCH qatt.question " +
           "WHERE q.quizId = :quizId " +
           "ORDER BY qa.createdAt DESC")
    List<QuizAttempt> findByQuizQuizIdOrderByCreatedAtDesc(@Param("quizId") Integer quizId);

    @Query("SELECT DISTINCT qa FROM QuizAttempt qa " +
           "LEFT JOIN FETCH qa.quiz q " +
           "LEFT JOIN FETCH q.topic " +
           "LEFT JOIN FETCH qa.student s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH qa.questionAttempts qatt " +
           "LEFT JOIN FETCH qatt.question " +
           "WHERE s.id = :studentId AND q.quizId = :quizId " +
           "ORDER BY qa.createdAt DESC")
    List<QuizAttempt> findByStudentIdAndQuizQuizIdOrderByCreatedAtDesc(@Param("studentId") Long studentId, @Param("quizId") Integer quizId);
}
