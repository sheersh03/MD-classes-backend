package md_classes.portal.repository;

import md_classes.portal.domain.StudentFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StudentFeeRepository extends JpaRepository<StudentFee, Long> {
    Optional<StudentFee> findByStudentId(Long studentId);
    Optional<StudentFee> findByStudentUserId(Long userId);
}
