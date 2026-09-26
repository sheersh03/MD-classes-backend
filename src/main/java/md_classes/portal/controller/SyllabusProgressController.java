package md_classes.portal.controller;

import jakarta.validation.Valid;
import md_classes.portal.domain.Parent;
import md_classes.portal.domain.Student;
import md_classes.portal.domain.SyllabusProgress;
import md_classes.portal.dto.syllabus.UpdateSyllabusProgressRequest;
import md_classes.portal.exception.domain.ForbiddenException;
import md_classes.portal.repository.ParentRepository;
import md_classes.portal.repository.StudentRepository;
import md_classes.portal.repository.SyllabusProgressRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/syllabus-progress")
public class SyllabusProgressController {

    private final SyllabusProgressRepository syllabusProgressRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;

    public SyllabusProgressController(
            SyllabusProgressRepository syllabusProgressRepository,
            StudentRepository studentRepository,
            ParentRepository parentRepository) {
        this.syllabusProgressRepository = syllabusProgressRepository;
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<SyllabusProgress> updateProgress(@Valid @RequestBody UpdateSyllabusProgressRequest req) {
        String normalizedClass = normalizeClassName(req.studentClass());
        
        // Find existing progress or create a new one
        SyllabusProgress progress = syllabusProgressRepository
                .findByStudentClassAndSubjectAndWeekNumber(normalizedClass, req.subject(), req.weekNumber())
                .orElseGet(() -> new SyllabusProgress(normalizedClass, req.subject(), req.weekNumber(), "", 0, false));

        progress.setTopicsCovered(req.topicsCovered());
        progress.setPercentCompleted(req.percentCompleted());
        
        // "after completion of every week the compilted syllabus should be saved in milstone flag"
        // If percentCompleted is 100, automatically mark as milestone. Otherwise, respect the input flag.
        boolean isMilestone = req.isMilestone() || req.percentCompleted() == 100;
        progress.setIsMilestone(isMilestone);

        SyllabusProgress saved = syllabusProgressRepository.save(progress);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT','PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public ResponseEntity<List<SyllabusProgress>> getProgress(
            @RequestParam(required = false) String studentClass,
            @RequestParam(required = false) String subject) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new ForbiddenException("Not authenticated");
        }
        Long userId = Long.parseLong(auth.getPrincipal().toString());

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isTeacher = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));

        String targetClass = studentClass;
        if (!isAdmin && !isTeacher) {
            // If the user is student or parent, restrict their query to their own class
            Optional<Student> studentOpt = studentRepository.findByUserId(userId);
            if (studentOpt.isPresent()) {
                targetClass = studentOpt.get().getStudentClass();
            } else {
                Optional<Parent> parentOpt = parentRepository.findByUserId(userId);
                if (parentOpt.isPresent()) {
                    targetClass = parentOpt.get().getStudent().getStudentClass();
                }
            }
        }

        if (targetClass == null) {
            return ResponseEntity.ok(List.of());
        }

        String normalizedClass = normalizeClassName(targetClass);
        List<SyllabusProgress> progressList;
        if (subject != null && !subject.trim().isEmpty()) {
            progressList = syllabusProgressRepository
                    .findByStudentClassAndSubjectOrderByWeekNumberAsc(normalizedClass, subject.trim());
        } else {
            progressList = syllabusProgressRepository
                    .findByStudentClassOrderByWeekNumberAsc(normalizedClass);
        }

        return ResponseEntity.ok(progressList);
    }

    private String normalizeClassName(String className) {
        if (className == null) return "";
        String normalized = className.trim().toLowerCase().replace("class", "").trim();
        if (normalized.isEmpty()) return className;
        // e.g. "Class 10" or "Class 9"
        return "Class " + normalized.substring(0, 1).toUpperCase() + normalized.substring(1);
    }
}
