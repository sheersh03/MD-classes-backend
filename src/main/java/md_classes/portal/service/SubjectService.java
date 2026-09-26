package md_classes.portal.service;

import md_classes.portal.domain.Subject;
import md_classes.portal.dto.subject.SubjectRequest;
import md_classes.portal.dto.subject.SubjectResponse;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @Transactional
    public SubjectResponse create(SubjectRequest req) {
        Subject subject = new Subject(req.subjectName().trim());
        subjectRepository.save(subject);
        return SubjectResponse.from(subject);
    }

    @Transactional(readOnly = true)
    public List<SubjectResponse> getAll() {
        return subjectRepository.findAll().stream()
                .map(SubjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SubjectResponse getById(Integer id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Subject with ID " + id + " not found"));
        return SubjectResponse.from(subject);
    }

    @Transactional
    public SubjectResponse update(Integer id, SubjectRequest req) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Subject with ID " + id + " not found"));
        subject.setSubjectName(req.subjectName().trim());
        subjectRepository.save(subject);
        return SubjectResponse.from(subject);
    }

    @Transactional
    public void delete(Integer id) {
        if (!subjectRepository.existsById(id)) {
            throw new NotFoundException("Subject with ID " + id + " not found");
        }
        subjectRepository.deleteById(id);
    }
}
