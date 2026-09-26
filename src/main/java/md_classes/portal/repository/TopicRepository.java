package md_classes.portal.repository;

import md_classes.portal.domain.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Integer> {
    List<Topic> findByUnitUnitIdOrderByTopicIdAsc(Integer unitId);
}
