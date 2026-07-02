CREATE TABLE parents (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT      NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    student_id BIGINT      NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_parents_user_id ON parents (user_id);
CREATE INDEX idx_parents_student_id ON parents (student_id);
