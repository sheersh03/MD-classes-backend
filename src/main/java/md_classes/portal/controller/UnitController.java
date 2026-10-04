package md_classes.portal.controller;

import jakarta.validation.Valid;
import md_classes.portal.dto.unit.UnitRequest;
import md_classes.portal.dto.unit.UnitResponse;
import md_classes.portal.service.UnitService;
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
@RequestMapping({"/api/units", "/units"})
public class UnitController {

    private final UnitService unitService;

    public UnitController(UnitService unitService) {
        this.unitService = unitService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public UnitResponse create(@Valid @RequestBody UnitRequest req) {
        return unitService.create(req);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public List<UnitResponse> getUnits(@RequestParam(required = false) Integer subjectId) {
        if (subjectId != null) {
            return unitService.getBySubjectId(subjectId);
        }
        return unitService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT', 'PARENT') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER') or hasAuthority('ROLE_STUDENT') or hasAuthority('ROLE_PARENT')")
    public UnitResponse getById(@PathVariable Integer id) {
        return unitService.getById(id);
    }



    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public UnitResponse update(@PathVariable Integer id, @Valid @RequestBody UnitRequest req) {
        return unitService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_TEACHER')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        unitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
