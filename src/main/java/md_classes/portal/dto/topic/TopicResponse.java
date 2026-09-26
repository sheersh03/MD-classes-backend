package md_classes.portal.dto.topic;

import md_classes.portal.domain.Topic;

public record TopicResponse(
        Integer topicId,
        Integer unitId,
        String topicName
) {
    public static TopicResponse from(Topic topic) {
        Integer uId = topic.getUnit() != null ? topic.getUnit().getUnitId() : null;
        return new TopicResponse(topic.getTopicId(), uId, topic.getTopicName());
    }
}
