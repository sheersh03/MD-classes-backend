package md_classes.portal.repository;

import md_classes.portal.domain.SyllabusProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusProgressRepository extends JpaRepository<SyllabusProgress, Long> {
    List<SyllabusProgress> findByStudentClassAndSubjectOrderByWeekNumberAsc(String studentClass, String subject);
    List<SyllabusProgress> findByStudentClassOrderByWeekNumberAsc(String studentClass);
    Optional<SyllabusProgress> findByStudentClassAndSubjectAndWeekNumber(String studentClass, String subject, Integer weekNumber);
}
