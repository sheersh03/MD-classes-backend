CREATE TABLE IF NOT EXISTS learning_events (
    event_id   BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students (student_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    topic_id   INTEGER REFERENCES topics (topic_id) ON DELETE SET NULL,
    quiz_id    INTEGER REFERENCES quizzes (quiz_id) ON DELETE SET NULL,
    notes_id   VARCHAR(100),
    metadata   TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_learning_events_student_id ON learning_events (student_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_event_type ON learning_events (event_type);
CREATE INDEX IF NOT EXISTS idx_learning_events_topic_id ON learning_events (topic_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_quiz_id ON learning_events (quiz_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_created_at ON learning_events (created_at);
