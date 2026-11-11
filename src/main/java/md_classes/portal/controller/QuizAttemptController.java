package md_classes.portal.controller;

import jakarta.validation.Valid;
import md_classes.portal.dto.QuizAttemptRequest;
import md_classes.portal.dto.QuizAttemptResponse;
import md_classes.portal.service.QuizAttemptService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/quiz-attempts", "/quiz-attempts"})
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    public QuizAttemptController(QuizAttemptService quizAttemptService) {
        this.quizAttemptService = quizAttemptService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public QuizAttemptResponse submitAttempt(@Valid @RequestBody QuizAttemptRequest req, Authentication auth) {
        Long authenticatedUserId = extractUserId(auth);
        return quizAttemptService.submitAttempt(req, authenticatedUserId);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public List<QuizAttemptResponse> getAttempts(
            @RequestParam(required = false) Integer quizId,
            @RequestParam(required = false) Long studentId
    ) {
        if (studentId != null && quizId != null) {
            return quizAttemptService.getByStudentAndQuiz(studentId, quizId);
        }
        if (quizId != null) {
            return quizAttemptService.getByQuizId(quizId);
        }
        if (studentId != null) {
            return quizAttemptService.getByStudentId(studentId);
        }
        return quizAttemptService.getAll();
    }

    @GetMapping("/my-attempts")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN', 'TEACHER', 'PARENT') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_PARENT')")
    public List<QuizAttemptResponse> getMyAttempts(
            @RequestParam(required = false) Long studentId,
            Authentication auth
    ) {
        if (studentId != null) {
            return quizAttemptService.getByStudentId(studentId);
        }
        Long userId = extractUserId(auth);
        if (userId == null) {
            throw new IllegalArgumentException("User not authenticated");
        }
        return quizAttemptService.getByUserId(userId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public QuizAttemptResponse getById(@PathVariable Long id) {
        return quizAttemptService.getById(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        quizAttemptService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return null;
        }
        try {
            return Long.parseLong(auth.getPrincipal().toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
