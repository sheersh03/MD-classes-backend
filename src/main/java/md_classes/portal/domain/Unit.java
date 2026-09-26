package md_classes.portal.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "units")
public class Unit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_id")
    private Integer unitId;

    @Column(name = "unit_name", nullable = false, length = 100)
    private String unitName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    @JsonIgnore
    private Subject subject;

    @OneToMany(mappedBy = "unit", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Topic> topics = new ArrayList<>();

    public Unit() {}

    public Unit(String unitName, Subject subject) {
        this.unitName = unitName;
        this.subject = subject;
    }

    public Unit(Integer unitId, String unitName, Subject subject) {
        this.unitId = unitId;
        this.unitName = unitName;
        this.subject = subject;
    }

    public void addTopic(Topic topic) {
        topics.add(topic);
        topic.setUnit(this);
    }

    public void removeTopic(Topic topic) {
        topics.remove(topic);
        topic.setUnit(null);
    }

    public Integer getUnitId() {
        return unitId;
    }

    public void setUnitId(Integer unitId) {
        this.unitId = unitId;
    }

    // Convenience alias for unitId
    public Integer getId() {
        return unitId;
    }

    public void setId(Integer id) {
        this.unitId = id;
    }

    public String getUnitName() {
        return unitName;
    }

    public void setUnitName(String unitName) {
        this.unitName = unitName;
    }

    // Convenience alias for unitName
    public String getName() {
        return unitName;
    }

    public void setName(String name) {
        this.unitName = name;
    }

    // Convenience alias for unitName
    public String getTitle() {
        return unitName;
    }

    public void setTitle(String title) {
        this.unitName = title;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public List<Topic> getTopics() {
        return topics;
    }

    public void setTopics(List<Topic> topics) {
        this.topics = topics;
    }
}
