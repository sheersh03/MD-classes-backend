package md_classes.portal.service;

import md_classes.portal.domain.Topic;
import md_classes.portal.domain.Unit;
import md_classes.portal.dto.topic.TopicRequest;
import md_classes.portal.dto.topic.TopicResponse;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.TopicRepository;
import md_classes.portal.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final UnitRepository unitRepository;

    public TopicService(TopicRepository topicRepository, UnitRepository unitRepository) {
        this.topicRepository = topicRepository;
        this.unitRepository = unitRepository;
    }

    @Transactional
    public TopicResponse create(TopicRequest req) {
        Unit unit = unitRepository.findById(req.unitId())
                .orElseThrow(() -> new NotFoundException("Unit with ID " + req.unitId() + " not found"));
        Topic topic = new Topic(req.topicName().trim(), unit);
        topicRepository.save(topic);
        return TopicResponse.from(topic);
    }

    @Transactional(readOnly = true)
    public List<TopicResponse> getAll() {
        return topicRepository.findAll().stream()
                .map(TopicResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TopicResponse> getByUnitId(Integer unitId) {
        if (!unitRepository.existsById(unitId)) {
            throw new NotFoundException("Unit with ID " + unitId + " not found");
        }
        return topicRepository.findByUnitUnitIdOrderByTopicIdAsc(unitId).stream()
                .map(TopicResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TopicResponse getById(Integer id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Topic with ID " + id + " not found"));
        return TopicResponse.from(topic);
    }

    @Transactional
    public TopicResponse update(Integer id, TopicRequest req) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Topic with ID " + id + " not found"));

        if (req.unitId() != null && !req.unitId().equals(topic.getUnit().getUnitId())) {
            Unit unit = unitRepository.findById(req.unitId())
                    .orElseThrow(() -> new NotFoundException("Unit with ID " + req.unitId() + " not found"));
            topic.setUnit(unit);
        }
        topic.setTopicName(req.topicName().trim());
        topicRepository.save(topic);
        return TopicResponse.from(topic);
    }

    @Transactional
    public void delete(Integer id) {
        if (!topicRepository.existsById(id)) {
            throw new NotFoundException("Topic with ID " + id + " not found");
        }
        topicRepository.deleteById(id);
    }
}
