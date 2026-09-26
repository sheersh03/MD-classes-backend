CREATE TABLE student_fees (
    id              BIGSERIAL PRIMARY KEY,
    student_id      BIGINT NOT NULL UNIQUE REFERENCES students (id) ON DELETE CASCADE,
    total_fee       INTEGER NOT NULL DEFAULT 0,
    paid_amount     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_student_fees_student_id ON student_fees (student_id);
