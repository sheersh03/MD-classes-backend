CREATE TABLE IF NOT EXISTS quiz_attempts (
    attempt_id   BIGSERIAL PRIMARY KEY,
    quiz_id      INTEGER NOT NULL REFERENCES quizzes (quiz_id) ON DELETE CASCADE,
    student_id   BIGINT NOT NULL REFERENCES students (student_id) ON DELETE CASCADE,
    score        INTEGER NOT NULL DEFAULT 0,
    total_marks  INTEGER NOT NULL DEFAULT 0,
    percentage   DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status       VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    started_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_id ON quiz_attempts (student_id);

CREATE TABLE IF NOT EXISTS question_attempts (
    question_attempt_id BIGSERIAL PRIMARY KEY,
    attempt_id          BIGINT NOT NULL REFERENCES quiz_attempts (attempt_id) ON DELETE CASCADE,
    question_id         INTEGER NOT NULL REFERENCES questions (question_id) ON DELETE CASCADE,
    selected_answer     VARCHAR(500),
    is_correct          BOOLEAN NOT NULL DEFAULT FALSE,
    marks_awarded       INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_question_attempts_attempt_id ON question_attempts (attempt_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question_id ON question_attempts (question_id);
