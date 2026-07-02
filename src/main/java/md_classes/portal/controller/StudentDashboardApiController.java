package md_classes.portal.controller;

import md_classes.portal.domain.Student;
import md_classes.portal.dto.auth.AuthResponse;
import md_classes.portal.dto.auth.LoginRequest;
import md_classes.portal.enums.Role;
import md_classes.portal.exception.domain.ForbiddenException;
import md_classes.portal.repository.StudentRepository;
import md_classes.portal.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/student-dashboard")
public class StudentDashboardApiController {

    private final AuthService authService;
    private final StudentRepository studentRepository;

    public StudentDashboardApiController(AuthService authService, StudentRepository studentRepository) {
        this.authService = authService;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req) {
        AuthResponse response = authService.login(req);
        Role role = response.user().role();
        if (role != Role.STUDENT) {
            throw new ForbiddenException("Only students can login to the student dashboard");
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/overview")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('STUDENT') or hasAuthority('ROLE_STUDENT')")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getOverview() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            throw new ForbiddenException("Not authenticated");
        }

        Long userId = Long.parseLong(auth.getPrincipal().toString());
        Optional<Student> studentOpt = studentRepository.findByUserId(userId);

        String course;
        String batchId;
        String phone;
        String studentName;
        String studentClass = null;

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            course = student.getCourse();
            batchId = student.getBatchId();
            phone = student.getPhone();
            studentName = student.getUser().getName();
            studentClass = student.getStudentClass();
        } else {
            // Fallback if no student record exists yet (e.g. fresh test account)
            List<Student> allStudents = studentRepository.findAll();
            if (!allStudents.isEmpty()) {
                Student first = allStudents.get(0);
                course = first.getCourse();
                batchId = first.getBatchId();
                phone = first.getPhone();
                studentName = first.getUser().getName();
                studentClass = first.getStudentClass();
            } else {
                course = "Intro to Full Stack (Demo)";
                batchId = "B-2026-DEMO";
                phone = "+91 99999 99999";
                studentName = "Rahul Sharma (Demo)";
                studentClass = "10";
            }
        }

        Map<String, Object> studentDetails = new java.util.HashMap<>();
        studentDetails.put("course", course != null ? course : "Not Assigned");
        studentDetails.put("batchId", batchId != null ? batchId : "Not Assigned");
        studentDetails.put("phone", phone != null ? phone : "Not Assigned");
        studentDetails.put("studentName", studentName != null ? studentName : "Student");
        studentDetails.put("studentClass", studentClass != null ? studentClass : "Not Assigned");

        List<String> subjects = md_classes.portal.domain.Subject.getSubjectsForClass(studentClass);

        List<Map<String, String>> upcomingClasses = List.of(
                Map.of("day", "Monday", "time", "10:00 AM - 12:30 PM", "title", "Advanced Java & Spring Boot", "room", "Room 402", "instructor", "Prof. Sharma"),
                Map.of("day", "Wednesday", "time", "02:00 PM - 04:30 PM", "title", "Database Systems & PostgreSQL", "room", "Lab 2", "instructor", "Dr. Gupta"),
                Map.of("day", "Friday", "time", "11:30 AM - 01:00 PM", "title", "Software Architecture & Design Patterns", "room", "Room 101", "instructor", "Prof. Mehta")
        );

        List<Map<String, String>> announcements = List.of(
                Map.of("date", "Today", "title", "Midterm Exams Schedule Released", "content", "Midterm examinations are scheduled to commence from July 1st. Please review the detailed calendar under batched posts.", "type", "academic"),
                Map.of("date", "Yesterday", "title", "Java Multithreading Assignment Uploaded", "content", "The new assignment on Concurrency and Executor Frameworks has been posted. Due date is next Monday.", "type", "assignment"),
                Map.of("date", "3 days ago", "title", "Guest Lecture: System Design at Google", "content", "Join us this Saturday at 5:00 PM for an interactive webinar on scaling applications with a Staff Engineer from Google.", "type", "event")
        );

        Map<String, Object> data = new java.util.HashMap<>();
        data.put("studentDetails", studentDetails);
        data.put("gpa", "3.85");
        data.put("attendance", "94.2%");
        data.put("pendingFees", "Nil");
        data.put("assignmentsCount", "2 Pending");
        data.put("upcomingClasses", upcomingClasses);
        data.put("announcements", announcements);
        data.put("subjects", subjects);

        return ResponseEntity.ok(data);
    }
}
