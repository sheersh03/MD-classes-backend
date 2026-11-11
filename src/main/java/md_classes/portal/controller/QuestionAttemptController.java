package md_classes.portal.controller;

import md_classes.portal.dto.QuestionAttemptResponse;
import md_classes.portal.service.QuestionAttemptService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/question-attempts", "/question-attempts"})
public class QuestionAttemptController {

    private final QuestionAttemptService questionAttemptService;

    public QuestionAttemptController(QuestionAttemptService questionAttemptService) {
        this.questionAttemptService = questionAttemptService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public List<QuestionAttemptResponse> getQuestionAttempts(
            @RequestParam(required = false) Long attemptId,
            @RequestParam(required = false) Integer questionId
    ) {
        if (attemptId != null) {
            return questionAttemptService.getByAttemptId(attemptId);
        }
        if (questionId != null) {
            return questionAttemptService.getByQuestionId(questionId);
        }
        return List.of();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public QuestionAttemptResponse getById(@PathVariable Long id) {
        return questionAttemptService.getById(id);
    }
}
