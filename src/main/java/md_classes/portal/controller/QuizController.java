package md_classes.portal.controller;

import jakarta.validation.Valid;
import md_classes.portal.dto.QuizRequest;
import md_classes.portal.dto.QuizResponse;
import md_classes.portal.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/quizzes", "/quizzes"})
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public QuizResponse create(@Valid @RequestBody QuizRequest req) {
        return quizService.create(req);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public List<QuizResponse> getQuizzes(@RequestParam(required = false) Integer topicId) {
        if (topicId != null) {
            return quizService.getByTopicId(topicId);
        }
        return quizService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public QuizResponse getById(@PathVariable Integer id) {
        return quizService.getById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public QuizResponse update(@PathVariable Integer id, @Valid @RequestBody QuizRequest req) {
        return quizService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        quizService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
