package md_classes.portal.controller;

import jakarta.validation.Valid;
import md_classes.portal.domain.Parent;
import md_classes.portal.domain.Student;
import md_classes.portal.domain.Topic;
import md_classes.portal.dto.ProgressUpdateRequest;
import md_classes.portal.entity.StudentTopicProgress;
import md_classes.portal.exception.domain.ForbiddenException;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.ParentRepository;
import md_classes.portal.repository.StudentRepository;
import md_classes.portal.repository.StudentTopicProgressRepository;
import md_classes.portal.repository.TopicRepository;
import md_classes.portal.service.StudentTopicProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping({"/apiv1/student-topic-progress", "/api/student-topic-progress", "/student-topic-progress"})
public class StudentTopicProgressController {

    private final StudentTopicProgressService studentTopicProgressService;
    private final StudentTopicProgressRepository studentTopicProgressRepository;
    private final StudentRepository studentRepository;
    private final TopicRepository topicRepository;
    private final ParentRepository parentRepository;

    public StudentTopicProgressController(
            StudentTopicProgressService studentTopicProgressService,
            StudentTopicProgressRepository studentTopicProgressRepository,
            StudentRepository studentRepository,
            TopicRepository topicRepository,
            ParentRepository parentRepository
    ) {
        this.studentTopicProgressService = studentTopicProgressService;
        this.studentTopicProgressRepository = studentTopicProgressRepository;
        this.studentRepository = studentRepository;
        this.topicRepository = topicRepository;
        this.parentRepository = parentRepository;
    }

    @PutMapping
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<StudentTopicProgress> updateProgress(
            @Valid @RequestBody ProgressUpdateRequest req,
            @RequestParam(required = false) String studentClass
    ) {
        Topic topic = topicRepository.findById(req.topicId())
                .orElseThrow(() -> new NotFoundException("Topic with ID " + req.topicId() + " not found"));

        int percentage = 0;
        if (req.progressPercentage() != null) {
            percentage = req.progressPercentage();
        } else if (Boolean.TRUE.equals(req.completed())) {
            percentage = 100;
        } else if (Boolean.FALSE.equals(req.completed())) {
            percentage = 0;
        }

        if (req.studentId() != null) {
            Long targetStudentId = resolveTargetStudentIdForWrite(req.studentId());
            Student student = studentRepository.findById(targetStudentId)
                    .orElseThrow(() -> new NotFoundException("Student with ID " + targetStudentId + " not found"));

            StudentTopicProgress saved = studentTopicProgressService.updateProgress(student, topic, percentage);
            if (req.status() != null && !req.status().isBlank()) {
                saved.setStatus(req.status().trim());
                saved = studentTopicProgressRepository.save(saved);
            }
            return ResponseEntity.ok(saved);
        }

        // For Teacher/Admin updating a topic without a specific studentId: update for all students (or students of given class)
        List<Student> targetStudents;
        if (studentClass != null && !studentClass.isBlank()) {
            targetStudents = studentRepository.findByStudentClass(studentClass.trim());
            if (targetStudents.isEmpty()) {
                targetStudents = studentRepository.findAll();
            }
        } else {
            targetStudents = studentRepository.findAll();
        }

        if (targetStudents.isEmpty()) {
            throw new NotFoundException("No enrolled students found to update topic progress for");
        }

        StudentTopicProgress lastSaved = null;
        for (Student s : targetStudents) {
            lastSaved = studentTopicProgressService.updateProgress(s, topic, percentage);
            if (req.status() != null && !req.status().isBlank()) {
                lastSaved.setStatus(req.status().trim());
                lastSaved = studentTopicProgressRepository.save(lastSaved);
            }
        }
        return ResponseEntity.ok(lastSaved);
    }

    @PutMapping("/unit/{unitId}")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<List<StudentTopicProgress>> updateUnitProgress(
            @PathVariable Integer unitId,
            @RequestParam(defaultValue = "100") Integer percentage,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String studentClass
    ) {
        List<Topic> topics = topicRepository.findByUnitUnitIdOrderByTopicIdAsc(unitId);
        if (topics.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Student> targetStudents;
        if (studentId != null) {
            Student s = studentRepository.findById(studentId)
                    .orElseThrow(() -> new NotFoundException("Student with ID " + studentId + " not found"));
            targetStudents = List.of(s);
        } else if (studentClass != null && !studentClass.isBlank()) {
            targetStudents = studentRepository.findByStudentClass(studentClass.trim());
            if (targetStudents.isEmpty()) {
                targetStudents = studentRepository.findAll();
            }
        } else {
            targetStudents = studentRepository.findAll();
        }

        if (targetStudents.isEmpty()) {
            throw new NotFoundException("No enrolled students found to update unit progress for");
        }

        int targetPct = Math.max(0, Math.min(100, percentage));
        List<StudentTopicProgress> results = new ArrayList<>();
        for (Student student : targetStudents) {
            for (Topic topic : topics) {
                StudentTopicProgress saved = studentTopicProgressService.updateProgress(student, topic, targetPct);
                results.add(saved);
            }
        }
        return ResponseEntity.ok(results);
    }

    @PutMapping("/unit/{unitId}/reset")
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<List<StudentTopicProgress>> resetUnitProgress(
            @PathVariable Integer unitId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) String studentClass
    ) {
        return updateUnitProgress(unitId, 0, studentId, studentClass);
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT')")
    public ResponseEntity<StudentTopicProgress> saveProgressPost(
            @Valid @RequestBody ProgressUpdateRequest req,
            @RequestParam(required = false) String studentClass
    ) {
        return updateProgress(req, studentClass);
    }

    @GetMapping
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT','PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public ResponseEntity<List<StudentTopicProgress>> getProgress(
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Integer topicId,
            @RequestParam(required = false) Integer unitId,
            @RequestParam(required = false) Integer subjectId
    ) {
        Long effectiveStudentId = resolveTargetStudentIdForRead(studentId);

        if (effectiveStudentId != null && topicId != null) {
            return ResponseEntity.ok(
                    studentTopicProgressRepository.findByStudentIdAndTopicTopicId(effectiveStudentId, topicId)
                            .map(List::of)
                            .orElseGet(Collections::emptyList)
            );
        }

        if (effectiveStudentId != null && unitId != null) {
            return ResponseEntity.ok(studentTopicProgressRepository.findByStudentIdAndUnitId(effectiveStudentId, unitId));
        }

        if (effectiveStudentId != null && subjectId != null) {
            return ResponseEntity.ok(studentTopicProgressRepository.findByStudentIdAndSubjectId(effectiveStudentId, subjectId));
        }

        if (effectiveStudentId != null) {
            return ResponseEntity.ok(studentTopicProgressRepository.findByStudentId(effectiveStudentId));
        }

        if (topicId != null) {
            return ResponseEntity.ok(studentTopicProgressRepository.findByTopicTopicId(topicId));
        }

        if (unitId != null) {
            return ResponseEntity.ok(studentTopicProgressRepository.findByUnitId(unitId));
        }

        if (subjectId != null) {
            return ResponseEntity.ok(studentTopicProgressRepository.findBySubjectId(subjectId));
        }

        return ResponseEntity.ok(studentTopicProgressRepository.findAll());
    }

    @GetMapping("/{studentId}")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT','PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public ResponseEntity<List<StudentTopicProgress>> getByStudentId(@PathVariable Long studentId) {
        Long effectiveStudentId = resolveTargetStudentIdForRead(studentId);
        return ResponseEntity.ok(studentTopicProgressRepository.findByStudentId(effectiveStudentId));
    }

    @DeleteMapping
    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<Void> deleteProgress(
            @RequestParam Long studentId,
            @RequestParam Integer topicId
    ) {
        studentTopicProgressRepository.deleteByStudentIdAndTopicTopicId(studentId, topicId);
        return ResponseEntity.noContent().build();
    }

    private Long resolveTargetStudentIdForWrite(Long requestedStudentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new ForbiddenException("Authentication is required");
        }

        boolean isStudent = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_STUDENT") || a.getAuthority().equals("STUDENT"));

        if (isStudent) {
            Long userId = Long.parseLong(auth.getPrincipal().toString());
            Student currentStudent = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new NotFoundException("Student profile not found for user ID " + userId));

            if (requestedStudentId != null && !requestedStudentId.equals(currentStudent.getId())) {
                throw new ForbiddenException("Students may only update their own topic progress");
            }
            return currentStudent.getId();
        }

        if (requestedStudentId == null) {
            throw new IllegalArgumentException("studentId is required");
        }
        return requestedStudentId;
    }

    private Long resolveTargetStudentIdForRead(Long requestedStudentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            throw new ForbiddenException("Authentication is required");
        }

        boolean isStudent = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_STUDENT") || a.getAuthority().equals("STUDENT"));
        boolean isParent = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_PARENT") || a.getAuthority().equals("PARENT"));

        if (isStudent) {
            Long userId = Long.parseLong(auth.getPrincipal().toString());
            Student currentStudent = studentRepository.findByUserId(userId)
                    .orElseThrow(() -> new NotFoundException("Student profile not found for user ID " + userId));

            if (requestedStudentId != null && !requestedStudentId.equals(currentStudent.getId())) {
                throw new ForbiddenException("Students may only view their own topic progress");
            }
            return currentStudent.getId();
        }

        if (isParent) {
            Long userId = Long.parseLong(auth.getPrincipal().toString());
            Parent parent = parentRepository.findByUserId(userId)
                    .orElseThrow(() -> new NotFoundException("Parent profile not found for user ID " + userId));

            Student child = parent.getStudent();
            if (child == null) {
                throw new NotFoundException("No linked student record found for parent user ID " + userId);
            }

            if (requestedStudentId != null && !requestedStudentId.equals(child.getId())) {
                throw new ForbiddenException("Parents may only view their linked child's topic progress");
            }
            return child.getId();
        }

        return requestedStudentId;
    }
}
