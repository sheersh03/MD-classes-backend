package md_classes.portal.dto.unit;

import md_classes.portal.domain.Unit;
import md_classes.portal.dto.topic.TopicResponse;

import java.util.List;

public record UnitResponse(
        Integer unitId,
        Integer subjectId,
        String unitName,
        List<TopicResponse> topics
) {
    public static UnitResponse from(Unit unit) {
        List<TopicResponse> topicList = unit.getTopics() != null
                ? unit.getTopics().stream().map(TopicResponse::from).toList()
                : List.of();
        Integer subId = unit.getSubject() != null ? unit.getSubject().getSubjectId() : null;
        return new UnitResponse(unit.getUnitId(), subId, unit.getUnitName(), topicList);
    }
}
