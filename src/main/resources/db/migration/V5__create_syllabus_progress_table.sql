CREATE TABLE syllabus_progress (
    id                BIGSERIAL PRIMARY KEY,
    student_class     TEXT NOT NULL,
    subject           TEXT NOT NULL,
    week_number       INTEGER NOT NULL,
    topics_covered    TEXT,
    percent_completed INTEGER NOT NULL DEFAULT 0,
    is_milestone      BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_class_subject_week UNIQUE (student_class, subject, week_number)
);

CREATE INDEX idx_syllabus_progress_class_subject ON syllabus_progress (student_class, subject);
