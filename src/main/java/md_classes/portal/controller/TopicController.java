package md_classes.portal.controller;

import jakarta.validation.Valid;
import md_classes.portal.dto.topic.TopicRequest;
import md_classes.portal.dto.topic.TopicResponse;
import md_classes.portal.service.TopicService;
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
@RequestMapping({"/api/topics", "/topics"})
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public TopicResponse create(@Valid @RequestBody TopicRequest req) {
        return topicService.create(req);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public List<TopicResponse> getTopics(@RequestParam(required = false) Integer unitId) {
        if (unitId != null) {
            return topicService.getByUnitId(unitId);
        }
        return topicService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public TopicResponse getById(@PathVariable Integer id) {
        return topicService.getById(id);
    }



    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public TopicResponse update(@PathVariable Integer id, @Valid @RequestBody TopicRequest req) {
        return topicService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        topicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
