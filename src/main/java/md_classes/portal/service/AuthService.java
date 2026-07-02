package md_classes.portal.service;

import com.auth0.jwt.interfaces.DecodedJWT;
import md_classes.portal.domain.User;
import md_classes.portal.domain.Student;
import md_classes.portal.domain.Parent;
import md_classes.portal.dto.auth.AuthResponse;
import md_classes.portal.dto.auth.ForgotPasswordRequest;
import md_classes.portal.dto.auth.ForgotPasswordResponse;
import md_classes.portal.dto.auth.LoginRequest;
import md_classes.portal.dto.auth.RefreshRequest;
import md_classes.portal.dto.auth.RegisterRequest;
import md_classes.portal.dto.auth.ResetPasswordRequest;
import md_classes.portal.dto.auth.UserSummary;
import md_classes.portal.enums.Role;
import md_classes.portal.exception.domain.DuplicateEmailException;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.UserRepository;
import md_classes.portal.repository.StudentRepository;
import md_classes.portal.repository.ParentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final StudentRepository students;
    private final ParentRepository parentRepository;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt, StudentRepository students, ParentRepository parentRepository) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.students = students;
        this.parentRepository = parentRepository;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (users.existsByEmail(req.email())) {
            throw new DuplicateEmailException(req.email());
        }
        Role role = req.role() != null ? req.role() : Role.STUDENT;

        Student linkedStudent = null;
        if (role == Role.PARENT) {
            if (req.studentEmail() == null || req.studentEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Child's email is required for Parent registration");
            }
            User studentUser = users.findByEmail(req.studentEmail())
                    .orElseThrow(() -> new NotFoundException("Student user not found with email: " + req.studentEmail()));
            
            if (studentUser.getRole() != Role.STUDENT) {
                throw new IllegalArgumentException("The email provided does not belong to a student account");
            }
            
            // Look up student record; if missing (e.g. registered before this fix), dynamically create it
            linkedStudent = students.findByUserId(studentUser.getId())
                    .orElseGet(() -> {
                        Student s = new Student(studentUser, "Not Assigned", "Not Assigned", "Not Assigned");
                        return students.save(s);
                    });
        }

        User user = new User(req.name(), req.email(), encoder.encode(req.password()), role);
        users.save(user);

        if (role == Role.STUDENT) {
            // Automatically populate student profile table when registering as student
            Student student = new Student(user, "Not Assigned", "Not Assigned", "Not Assigned");
            student.setPlainPassword(req.password());
            student.setStudentClass(req.studentClass());
            students.save(student);
        }

        if (role == Role.PARENT && linkedStudent != null) {
            Parent parent = new Parent(user, linkedStudent);
            parentRepository.save(parent);
        }

        return tokensFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("invalid credentials"));
        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("invalid credentials");
        }
        return tokensFor(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshRequest req) {
        DecodedJWT decoded;
        try {
            decoded = jwt.verifyRefreshToken(req.refreshToken());
        } catch (Exception e) {
            throw new BadCredentialsException("invalid refresh token");
        }
        Long userId = jwt.userId(decoded);
        User user = users.findById(userId)
                .orElseThrow(() -> new NotFoundException("user not found"));
        return tokensFor(user);
    }

    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest req) {
        User user = users.findByEmail(req.email())
                .orElseThrow(() -> new NotFoundException("User not found with email: " + req.email()));
        String token = jwt.generateResetToken(user);
        log.info("password reset requested for {}, token: {}", req.email(), token);
        return new ForgotPasswordResponse(
                token,
                "Password reset token generated successfully. In production, this would be sent to your email."
        );
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        DecodedJWT decoded;
        try {
            decoded = jwt.verifyResetToken(req.token());
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid or expired reset token");
        }
        Long userId = jwt.userId(decoded);
        User user = users.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setPasswordHash(encoder.encode(req.newPassword()));
        users.save(user);
        if (user.getRole() == Role.STUDENT) {
            students.findByUserId(userId).ifPresent(s -> {
                s.setPlainPassword(req.newPassword());
                students.save(s);
            });
        }
        log.info("password reset token redeemed and password updated successfully for user: {}", user.getEmail());
    }

    private AuthResponse tokensFor(User user) {
        return new AuthResponse(
                jwt.generateAccessToken(user),
                jwt.generateRefreshToken(user),
                UserSummary.from(user)
        );
    }
}
