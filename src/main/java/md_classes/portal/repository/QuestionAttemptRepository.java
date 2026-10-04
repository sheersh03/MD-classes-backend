package md_classes.portal.repository;

import md_classes.portal.domain.QuestionAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionAttemptRepository extends JpaRepository<QuestionAttempt, Long> {
    List<QuestionAttempt> findByQuizAttemptAttemptIdOrderByQuestionAttemptIdAsc(Long attemptId);
    List<QuestionAttempt> findByQuestionQuestionIdOrderByQuestionAttemptIdAsc(Integer questionId);
}
