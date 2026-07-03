package md_classes.portal.controller;

import jakarta.validation.Valid;
import md_classes.portal.domain.Student;
import md_classes.portal.domain.StudentFee;
import md_classes.portal.domain.FeeTransaction;
import md_classes.portal.dto.fee.StudentFeeResponse;
import md_classes.portal.dto.fee.UpdateStudentFeeRequest;
import md_classes.portal.dto.fee.FeeTransactionResponse;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.StudentFeeRepository;
import md_classes.portal.repository.StudentRepository;
import md_classes.portal.repository.ParentRepository;
import md_classes.portal.repository.FeeTransactionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fees")
public class StudentFeeController {

    private final StudentFeeRepository studentFeeRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final FeeTransactionRepository feeTransactionRepository;

    public StudentFeeController(
            StudentFeeRepository studentFeeRepository,
            StudentRepository studentRepository,
            ParentRepository parentRepository,
            FeeTransactionRepository feeTransactionRepository) {
        this.studentFeeRepository = studentFeeRepository;
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.feeTransactionRepository = feeTransactionRepository;
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<StudentFeeResponse> updateFee(@Valid @RequestBody UpdateStudentFeeRequest req) {
        Student student = studentRepository.findById(req.studentId())
                .orElseThrow(() -> new NotFoundException("Student not found"));

        StudentFee fee = studentFeeRepository.findByStudentId(req.studentId())
                .orElseGet(() -> new StudentFee(student, 0, 0));

        int oldPaid = fee.getPaidAmount();
        fee.setTotalFee(req.totalFee());
        fee.setPaidAmount(req.paidAmount());

        StudentFee saved = studentFeeRepository.save(fee);

        if (req.paidAmount() > oldPaid) {
            String reference = "TXN-MANUAL-" + System.currentTimeMillis();
            FeeTransaction tx = new FeeTransaction(saved, req.paidAmount() - oldPaid, "MANUAL_RECORD", reference);
            feeTransactionRepository.save(tx);
        }
        
        return ResponseEntity.ok(new StudentFeeResponse(
                saved.getStudent().getId(),
                saved.getStudent().getUser().getName(),
                saved.getTotalFee(),
                saved.getPaidAmount(),
                saved.getRemainingFee()
        ));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT','PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public ResponseEntity<StudentFeeResponse> getStudentFee(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found"));

        StudentFee fee = studentFeeRepository.findByStudentId(studentId)
                .orElseGet(() -> new StudentFee(student, 0, 0));

        return ResponseEntity.ok(new StudentFeeResponse(
                fee.getStudent().getId(),
                fee.getStudent().getUser().getName(),
                fee.getTotalFee(),
                fee.getPaidAmount(),
                fee.getRemainingFee()
        ));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<List<StudentFeeResponse>> getAllFees() {
        List<Student> allStudents = studentRepository.findAll();
        List<StudentFeeResponse> responses = allStudents.stream().map(student -> {
            StudentFee fee = studentFeeRepository.findByStudentId(student.getId())
                    .orElseGet(() -> new StudentFee(student, 0, 0));
            return new StudentFeeResponse(
                    student.getId(),
                    student.getUser().getName(),
                    fee.getTotalFee(),
                    fee.getPaidAmount(),
                    fee.getRemainingFee()
            );
        }).toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/pay")
    @PreAuthorize("hasAnyRole('STUDENT','PARENT') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public ResponseEntity<FeeTransactionResponse> payFee(@Valid @RequestBody md_classes.portal.dto.fee.PayFeeRequest req) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new md_classes.portal.exception.domain.ForbiddenException("Not authenticated");
        }

        Long userId = Long.parseLong(auth.getPrincipal().toString());
        
        Student student = null;
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PARENT"))) {
            md_classes.portal.domain.Parent parent = parentRepository.findByUserId(userId)
                    .orElseThrow(() -> new NotFoundException("Parent record not found"));
            student = parent.getStudent();
        } else {
            student = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new NotFoundException("Student record not found"));
        }

        if (student == null) {
            throw new NotFoundException("Linked student not found");
        }

        StudentFee fee = studentFeeRepository.findByStudentId(student.getId())
                .orElseGet(() -> {
                    throw new IllegalArgumentException("No outstanding fees have been assigned to you by the admin yet");
                });

        if (req.amount() <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        int remaining = fee.getRemainingFee();
        if (req.amount() > remaining) {
            throw new IllegalArgumentException("Payment amount cannot exceed the remaining balance of ₹" + remaining);
        }

        fee.setPaidAmount(fee.getPaidAmount() + req.amount());
        StudentFee savedFee = studentFeeRepository.save(fee);

        String reference = "TXN-CARD-" + System.currentTimeMillis();
        FeeTransaction transaction = new FeeTransaction(savedFee, req.amount(), "CARD_ONLINE", reference);
        FeeTransaction savedTx = feeTransactionRepository.save(transaction);

        return ResponseEntity.ok(new FeeTransactionResponse(
                savedTx.getId(),
                student.getId(),
                student.getUser().getName(),
                savedTx.getAmount(),
                savedTx.getPaymentMethod(),
                savedTx.getTransactionReference(),
                savedTx.getCreatedAt()
        ));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<List<FeeTransactionResponse>> getAllTransactions() {
        List<FeeTransaction> txList = feeTransactionRepository.findAllByOrderByCreatedAtDesc();
        List<FeeTransactionResponse> responses = txList.stream().map(tx -> new FeeTransactionResponse(
                tx.getId(),
                tx.getStudentFee().getStudent().getId(),
                tx.getStudentFee().getStudent().getUser().getName(),
                tx.getAmount(),
                tx.getPaymentMethod(),
                tx.getTransactionReference(),
                tx.getCreatedAt()
        )).toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{studentId}/transactions")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT','PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public ResponseEntity<List<FeeTransactionResponse>> getStudentTransactions(@PathVariable Long studentId) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            boolean isStudentOrParent = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT") || a.getAuthority().equals("ROLE_PARENT"));
            if (isStudentOrParent) {
                Long userId = Long.parseLong(auth.getPrincipal().toString());
                Student currentStudent = null;
                if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PARENT"))) {
                    md_classes.portal.domain.Parent parent = parentRepository.findByUserId(userId).orElse(null);
                    if (parent != null) currentStudent = parent.getStudent();
                } else {
                    currentStudent = studentRepository.findByUserId(userId).orElse(null);
                }
                if (currentStudent == null || !currentStudent.getId().equals(studentId)) {
                    throw new md_classes.portal.exception.domain.ForbiddenException("You do not have permission to view this student's transaction history");
                }
            }
        }

        List<FeeTransaction> txList = feeTransactionRepository.findByStudentFeeStudentIdOrderByCreatedAtDesc(studentId);
        List<FeeTransactionResponse> responses = txList.stream().map(tx -> new FeeTransactionResponse(
                tx.getId(),
                tx.getStudentFee().getStudent().getId(),
                tx.getStudentFee().getStudent().getUser().getName(),
                tx.getAmount(),
                tx.getPaymentMethod(),
                tx.getTransactionReference(),
                tx.getCreatedAt()
        )).toList();
        return ResponseEntity.ok(responses);
    }
}
