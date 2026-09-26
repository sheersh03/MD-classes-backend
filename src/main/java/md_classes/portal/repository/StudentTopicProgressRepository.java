package md_classes.portal.repository;

import md_classes.portal.entity.StudentTopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentTopicProgressRepository extends JpaRepository<StudentTopicProgress, Integer> {

    @Query("SELECT p FROM StudentTopicProgress p WHERE p.student.id = :studentId AND p.topic.topicId = :topicId")
    Optional<StudentTopicProgress> findByStudentIdAndTopicTopicId(@Param("studentId") Long studentId, @Param("topicId") Integer topicId);

    @Query("SELECT p FROM StudentTopicProgress p WHERE p.student.id = :studentId")
    List<StudentTopicProgress> findByStudentId(@Param("studentId") Long studentId);

    @Query("SELECT p FROM StudentTopicProgress p WHERE p.topic.topicId = :topicId")
    List<StudentTopicProgress> findByTopicTopicId(@Param("topicId") Integer topicId);

    @Query("SELECT p FROM StudentTopicProgress p WHERE p.student.id = :studentId AND p.status = :status")
    List<StudentTopicProgress> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") String status);

    @Query("SELECT p FROM StudentTopicProgress p WHERE p.student.id = :studentId AND p.topic.unit.unitId = :unitId")
    List<StudentTopicProgress> findByStudentIdAndUnitId(@Param("studentId") Long studentId, @Param("unitId") Integer unitId);

    @Query("SELECT p FROM StudentTopicProgress p WHERE p.student.id = :studentId AND p.topic.unit.subject.subjectId = :subjectId")
    List<StudentTopicProgress> findByStudentIdAndSubjectId(@Param("studentId") Long studentId, @Param("subjectId") Integer subjectId);

    @Query("SELECT p FROM StudentTopicProgress p WHERE p.topic.unit.unitId = :unitId")
    List<StudentTopicProgress> findByUnitId(@Param("unitId") Integer unitId);

    @Query("SELECT p FROM StudentTopicProgress p WHERE p.topic.unit.subject.subjectId = :subjectId")
    List<StudentTopicProgress> findBySubjectId(@Param("subjectId") Integer subjectId);

    @Modifying
    @Transactional
    @Query("DELETE FROM StudentTopicProgress p WHERE p.student.id = :studentId AND p.topic.topicId = :topicId")
    void deleteByStudentIdAndTopicTopicId(@Param("studentId") Long studentId, @Param("topicId") Integer topicId);
}

