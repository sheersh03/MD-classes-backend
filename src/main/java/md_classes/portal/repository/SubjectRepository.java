package md_classes.portal.repository;

import md_classes.portal.domain.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    Optional<Subject> findBySubjectNameIgnoreCase(String subjectName);
}
