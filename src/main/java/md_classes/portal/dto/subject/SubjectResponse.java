package md_classes.portal.dto.subject;

import md_classes.portal.domain.Subject;
import md_classes.portal.dto.unit.UnitResponse;

import java.util.List;

public record SubjectResponse(
        Integer subjectId,
        String subjectName,
        List<UnitResponse> units
) {
    public static SubjectResponse from(Subject subject) {
        List<UnitResponse> unitList = subject.getUnits() != null
                ? subject.getUnits().stream().map(UnitResponse::from).toList()
                : List.of();
        return new SubjectResponse(subject.getSubjectId(), subject.getSubjectName(), unitList);
    }

    public static SubjectResponse fromSimple(Subject subject) {
        return new SubjectResponse(subject.getSubjectId(), subject.getSubjectName(), List.of());
    }
}
