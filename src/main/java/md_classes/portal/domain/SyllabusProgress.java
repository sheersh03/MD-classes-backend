package md_classes.portal.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "syllabus_progress",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_class", "subject", "week_number"})
)
public class SyllabusProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_class", nullable = false)
    private String studentClass;

    @Column(nullable = false)
    private String subject;

    @Column(name = "week_number", nullable = false)
    private Integer weekNumber;

    @Column(name = "topics_covered")
    private String topicsCovered;

    @Column(name = "percent_completed", nullable = false)
    private Integer percentCompleted = 0;

    @Column(name = "is_milestone", nullable = false)
    private Boolean isMilestone = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected SyllabusProgress() {}

    public SyllabusProgress(String studentClass, String subject, Integer weekNumber, String topicsCovered, Integer percentCompleted, Boolean isMilestone) {
        this.studentClass = studentClass;
        this.subject = subject;
        this.weekNumber = weekNumber;
        this.topicsCovered = topicsCovered;
        this.percentCompleted = percentCompleted;
        this.isMilestone = isMilestone;
    }

    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public String getStudentClass() { return studentClass; }
    public void setStudentClass(String studentClass) { this.studentClass = studentClass; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public Integer getWeekNumber() { return weekNumber; }
    public void setWeekNumber(Integer weekNumber) { this.weekNumber = weekNumber; }
    public String getTopicsCovered() { return topicsCovered; }
    public void setTopicsCovered(String topicsCovered) { this.topicsCovered = topicsCovered; }
    public Integer getPercentCompleted() { return percentCompleted; }
    public void setPercentCompleted(Integer percentCompleted) { this.percentCompleted = percentCompleted; }
    public Boolean getIsMilestone() { return isMilestone; }
    public void setIsMilestone(Boolean isMilestone) { this.isMilestone = isMilestone; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
