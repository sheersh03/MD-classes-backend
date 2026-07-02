package md_classes.portal.service;

import md_classes.portal.domain.Student;
import md_classes.portal.domain.User;
import md_classes.portal.dto.student.CreateStudentRequest;
import md_classes.portal.dto.student.StudentResponse;
import md_classes.portal.dto.student.UpdateStudentRequest;
import md_classes.portal.enums.Role;
import md_classes.portal.exception.domain.DuplicateEmailException;
import md_classes.portal.exception.domain.ForbiddenException;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.StudentRepository;
import md_classes.portal.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentService {

    private final StudentRepository students;
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public StudentService(StudentRepository students, UserRepository users, PasswordEncoder encoder) {
        this.students = students;
        this.users = users;
        this.encoder = encoder;
    }

    @Transactional
    public StudentResponse create(CreateStudentRequest req) {
        if (users.existsByEmail(req.email())) {
            throw new DuplicateEmailException(req.email());
        }
        User user = new User(req.name(), req.email(), encoder.encode(req.password()), Role.STUDENT);
        users.save(user);
        Student student = new Student(user, req.course(), req.batchId(), req.phone());
        student.setPlainPassword(req.password());
        student.setStudentClass(req.studentClass());
        students.save(student);
        return StudentResponse.from(student);
    }

    @Transactional(readOnly = true)
    public Page<StudentResponse> list(Pageable pageable) {
        return students.findAll(pageable).map(StudentResponse::from);
    }

    @Transactional(readOnly = true)
    public StudentResponse get(Long id) {
        Student student = students.findById(id)
                .orElseThrow(() -> new NotFoundException("student " + id + " not found"));
        ensureCanRead(student);
        return StudentResponse.from(student);
    }

    @Transactional
    public StudentResponse update(Long id, UpdateStudentRequest req) {
        Student student = students.findById(id)
                .orElseThrow(() -> new NotFoundException("student " + id + " not found"));
        ensureCanWrite(student);

        if (req.name() != null) {
            student.getUser().setName(req.name());
        }
        if (req.phone() != null) student.setPhone(req.phone());
        if (req.course() != null) student.setCourse(req.course());
        if (req.batchId() != null) student.setBatchId(req.batchId());
        if (req.studentClass() != null) student.setStudentClass(req.studentClass());
        if (req.password() != null && !req.password().trim().isEmpty()) {
            student.getUser().setPasswordHash(encoder.encode(req.password()));
            student.setPlainPassword(req.password());
        }
        return StudentResponse.from(student);
    }

    @Transactional
    public void delete(Long id) {
        Student student = students.findById(id)
                .orElseThrow(() -> new NotFoundException("student " + id + " not found"));
        students.delete(student);
    }

    private void ensureCanRead(Student student) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new ForbiddenException("not authenticated");
        }
        if (hasRole(auth, "ROLE_ADMIN") || hasRole(auth, "ROLE_TEACHER")) {
            return;
        }
        if (hasRole(auth, "ROLE_STUDENT") && isOwner(auth, student)) {
            return;
        }
        throw new ForbiddenException("cannot view this student record");
    }

    private void ensureCanWrite(Student student) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new ForbiddenException("not authenticated");
        }
        if (hasRole(auth, "ROLE_ADMIN")) return;
        if (hasRole(auth, "ROLE_STUDENT") && isOwner(auth, student)) return;
        throw new ForbiddenException("cannot update this student record");
    }

    private boolean hasRole(Authentication auth, String role) {
        for (GrantedAuthority a : auth.getAuthorities()) {
            if (role.equals(a.getAuthority())) return true;
        }
        return false;
    }

    private boolean isOwner(Authentication auth, Student student) {
        // Principal is the user id (stored as String by JwtAuthFilter)
        Object principal = auth.getPrincipal();
        if (principal == null) return false;
        try {
            Long uid = Long.parseLong(principal.toString());
            return student.getUser().getId().equals(uid);
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
