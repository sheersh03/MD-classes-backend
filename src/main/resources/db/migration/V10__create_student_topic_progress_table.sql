CREATE TABLE IF NOT EXISTS student_topic_progress (
    id           BIGSERIAL PRIMARY KEY,
    student_id   BIGINT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    topic_id     INTEGER NOT NULL REFERENCES topics (topic_id) ON DELETE CASCADE,
    completed    BOOLEAN NOT NULL DEFAULT false,
    status       VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    notes        TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_topic UNIQUE (student_id, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_student_topic_progress_student ON student_topic_progress (student_id);
CREATE INDEX IF NOT EXISTS idx_student_topic_progress_topic ON student_topic_progress (topic_id);
