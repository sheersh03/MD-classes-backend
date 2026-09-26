package md_classes.portal.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subject_id")
    private Integer subjectId;

    @Column(name = "subject_name", nullable = false, length = 100)
    private String subjectName;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Unit> units = new ArrayList<>();

    public Subject() {}

    public Subject(String subjectName) {
        this.subjectName = subjectName;
    }

    public Subject(Integer subjectId, String subjectName) {
        this.subjectId = subjectId;
        this.subjectName = subjectName;
    }

    public void addUnit(Unit unit) {
        units.add(unit);
        unit.setSubject(this);
    }

    public void removeUnit(Unit unit) {
        units.remove(unit);
        unit.setSubject(null);
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    // Convenience alias for subjectId
    public Integer getId() {
        return subjectId;
    }

    public void setId(Integer id) {
        this.subjectId = id;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    // Convenience alias for subjectName
    public String getName() {
        return subjectName;
    }

    public void setName(String name) {
        this.subjectName = name;
    }

    public List<Unit> getUnits() {
        return units;
    }

    public void setUnits(List<Unit> units) {
        this.units = units;
    }

    // Static default subjects catalog to maintain backward compatibility with existing controllers
    private static final Map<String, Set<String>> DEFAULT_CLASS_SUBJECTS = Map.of(
            "Maths", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8", "class 9", "class 10"),
            "English", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8", "class 9", "class 10"),
            "Hindi", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8", "class 9", "class 10"),
            "Computer", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8", "class 9", "class 10"),
            "Environmental Studies (EVS)", Set.of("1", "2", "3", "4", "5", "class 1", "class 2", "class 3", "class 4", "class 5"),
            "Science", Set.of("6", "7", "8", "9", "10", "class 6", "class 7", "class 8", "class 9", "class 10"),
            "Social Science", Set.of("6", "7", "8", "9", "10", "class 6", "class 7", "class 8", "class 9", "class 10"),
            "Sanskrit", Set.of("6", "7", "8", "class 6", "class 7", "class 8"),
            "General Knowledge", Set.of("1", "2", "3", "4", "5", "6", "7", "8", "class 1", "class 2", "class 3", "class 4", "class 5", "class 6", "class 7", "class 8")
    );

    public static List<String> getSubjectsForClass(String className) {
        if (className == null) return List.of();
        String normalized = className.trim().toLowerCase();

        return DEFAULT_CLASS_SUBJECTS.entrySet().stream()
                .filter(entry -> entry.getValue().stream().anyMatch(c -> c.toLowerCase().equals(normalized)))
                .map(Map.Entry::getKey)
                .toList();
    }
}
