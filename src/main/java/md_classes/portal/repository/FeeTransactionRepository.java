package md_classes.portal.repository;

import md_classes.portal.domain.FeeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeeTransactionRepository extends JpaRepository<FeeTransaction, Long> {
    List<FeeTransaction> findByStudentFeeStudentIdOrderByCreatedAtDesc(Long studentId);
    List<FeeTransaction> findAllByOrderByCreatedAtDesc();
}
