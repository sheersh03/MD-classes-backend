package md_classes.portal.service;

import md_classes.portal.domain.Subject;
import md_classes.portal.domain.Unit;
import md_classes.portal.dto.unit.UnitRequest;
import md_classes.portal.dto.unit.UnitResponse;
import md_classes.portal.exception.domain.NotFoundException;
import md_classes.portal.repository.SubjectRepository;
import md_classes.portal.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UnitService {

    private final UnitRepository unitRepository;
    private final SubjectRepository subjectRepository;

    public UnitService(UnitRepository unitRepository, SubjectRepository subjectRepository) {
        this.unitRepository = unitRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional
    public UnitResponse create(UnitRequest req) {
        Subject subject = subjectRepository.findById(req.subjectId())
                .orElseThrow(() -> new NotFoundException("Subject with ID " + req.subjectId() + " not found"));
        Unit unit = new Unit(req.unitName().trim(), subject);
        unitRepository.save(unit);
        return UnitResponse.from(unit);
    }

    @Transactional(readOnly = true)
    public List<UnitResponse> getAll() {
        return unitRepository.findAll().stream()
                .map(UnitResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UnitResponse> getBySubjectId(Integer subjectId) {
        if (!subjectRepository.existsById(subjectId)) {
            throw new NotFoundException("Subject with ID " + subjectId + " not found");
        }
        return unitRepository.findBySubjectSubjectIdOrderByUnitIdAsc(subjectId).stream()
                .map(UnitResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UnitResponse getById(Integer id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Unit with ID " + id + " not found"));
        return UnitResponse.from(unit);
    }

    @Transactional
    public UnitResponse update(Integer id, UnitRequest req) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Unit with ID " + id + " not found"));

        if (req.subjectId() != null && !req.subjectId().equals(unit.getSubject().getSubjectId())) {
            Subject subject = subjectRepository.findById(req.subjectId())
                    .orElseThrow(() -> new NotFoundException("Subject with ID " + req.subjectId() + " not found"));
            unit.setSubject(subject);
        }
        unit.setUnitName(req.unitName().trim());
        unitRepository.save(unit);
        return UnitResponse.from(unit);
    }

    @Transactional
    public void delete(Integer id) {
        if (!unitRepository.existsById(id)) {
            throw new NotFoundException("Unit with ID " + id + " not found");
        }
        unitRepository.deleteById(id);
    }
}
