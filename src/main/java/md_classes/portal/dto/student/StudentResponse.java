package md_classes.portal.dto.student;

import md_classes.portal.domain.Student;

import java.time.OffsetDateTime;

public record StudentResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String phone,
        String course,
        String batchId,
        String studentClass,
        String password,
        OffsetDateTime createdAt
) {
    public static StudentResponse from(Student s) {
        return new StudentResponse(
                s.getId(),
                s.getUser().getId(),
                s.getUser().getName(),
                s.getUser().getEmail(),
                s.getPhone(),
                s.getCourse(),
                s.getBatchId(),
                s.getStudentClass(),
                s.getPlainPassword(),
                s.getCreatedAt()
        );
    }
}
