package md_classes.portal.repository;

import md_classes.portal.domain.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Integer> {
    List<Quiz> findByTopicTopicIdOrderByQuizIdAsc(Integer topicId);
}
