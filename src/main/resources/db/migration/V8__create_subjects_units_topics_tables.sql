CREATE TABLE IF NOT EXISTS subjects (
    subject_id   SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS units (
    unit_id    SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL REFERENCES subjects (subject_id) ON DELETE CASCADE,
    unit_name  VARCHAR(100) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_units_subject_id ON units (subject_id);

CREATE TABLE IF NOT EXISTS topics (
    topic_id   SERIAL PRIMARY KEY,
    unit_id    INTEGER NOT NULL REFERENCES units (unit_id) ON DELETE CASCADE,
    topic_name VARCHAR(500) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_topics_unit_id ON topics (unit_id);
