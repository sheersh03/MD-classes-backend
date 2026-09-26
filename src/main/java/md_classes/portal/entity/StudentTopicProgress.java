package md_classes.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.UniqueConstraint;
import md_classes.portal.domain.Student;
import md_classes.portal.domain.Topic;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_topic_progress", uniqueConstraints = {
        @UniqueConstraint(name = "uq_student_topic", columnNames = {"student_id", "topic_id"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StudentTopicProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Integer progressId;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"user", "plainPassword", "hibernateLazyInitializer", "handler"})
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "topic_id", nullable = false)
    @JsonIgnoreProperties({"unit", "hibernateLazyInitializer", "handler"})
    private Topic topic;

    @Column(name = "progress_percentage", nullable = false)
    private Integer progressPercentage = 0;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "Not_Started";

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public StudentTopicProgress() {}

    public StudentTopicProgress(Student student, Topic topic, Integer progressPercentage, String status) {
        this.student = student;
        this.topic = topic;
        this.progressPercentage = progressPercentage != null ? progressPercentage : 0;
        this.status = (status != null && !status.isBlank()) ? status : "Not_Started";
        if (this.progressPercentage > 0 && this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
        if (this.progressPercentage >= 100 || "Completed".equalsIgnoreCase(this.status)) {
            this.completedAt = LocalDateTime.now();
            this.status = "Completed";
        }
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
        if (this.progressPercentage == null) {
            this.progressPercentage = 0;
        }
        if (this.status == null || this.status.isBlank()) {
            this.status = this.progressPercentage >= 100 ? "Completed" : (this.progressPercentage > 0 ? "In_Progress" : "Not_Started");
        }
        if (this.progressPercentage > 0 && this.startedAt == null) {
            this.startedAt = now;
        }
        if (this.progressPercentage >= 100 && this.completedAt == null) {
            this.completedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.progressPercentage != null && this.progressPercentage > 0 && this.startedAt == null) {
            this.startedAt = this.updatedAt;
        }
        if (this.progressPercentage != null && this.progressPercentage >= 100) {
            this.status = "Completed";
            if (this.completedAt == null) {
                this.completedAt = this.updatedAt;
            }
        } else if ("Completed".equalsIgnoreCase(this.status)) {
            this.progressPercentage = 100;
            if (this.completedAt == null) {
                this.completedAt = this.updatedAt;
            }
        } else {
            this.completedAt = null;
        }
    }

    public Integer getProgressId() {
        return progressId;
    }

    public void setProgressId(Integer progressId) {
        this.progressId = progressId;
    }

    // Convenience alias for progressId
    @Transient
    @JsonProperty("id")
    public Integer getId() {
        return progressId;
    }

    public void setId(Integer id) {
        this.progressId = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Topic getTopic() {
        return topic;
    }

    public void setTopic(Topic topic) {
        this.topic = topic;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage != null ? Math.max(0, Math.min(100, progressPercentage)) : 0;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Transient
    @JsonProperty("completed")
    public Boolean isCompleted() {
        return "Completed".equalsIgnoreCase(this.status) || (this.progressPercentage != null && this.progressPercentage >= 100);
    }

    public void setCompleted(Boolean completed) {
        if (Boolean.TRUE.equals(completed)) {
            this.status = "Completed";
            this.progressPercentage = 100;
            this.completedAt = LocalDateTime.now();
        } else if (Boolean.FALSE.equals(completed)) {
            if ("Completed".equalsIgnoreCase(this.status)) {
                this.status = "In_Progress";
            }
            if (this.progressPercentage != null && this.progressPercentage >= 100) {
                this.progressPercentage = 0;
            }
            this.completedAt = null;
        }
    }

    @Transient
    @JsonProperty("studentId")
    public Long getStudentId() {
        return student != null ? student.getId() : null;
    }

    @Transient
    @JsonProperty("topicId")
    public Integer getTopicId() {
        return topic != null ? topic.getTopicId() : null;
    }

    @Transient
    @JsonProperty("topicName")
    public String getTopicName() {
        return topic != null ? topic.getTopicName() : null;
    }

    @Transient
    @JsonProperty("unitId")
    public Integer getUnitId() {
        return (topic != null && topic.getUnit() != null) ? topic.getUnit().getUnitId() : null;
    }
}
