CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id            SERIAL PRIMARY KEY,
    title              VARCHAR(200) NOT NULL,
    description        VARCHAR(1000),
    topic_id           INTEGER REFERENCES topics (topic_id) ON DELETE SET NULL,
    time_limit_minutes INTEGER,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON quizzes (topic_id);

CREATE TABLE IF NOT EXISTS questions (
    question_id    SERIAL PRIMARY KEY,
    quiz_id        INTEGER NOT NULL REFERENCES quizzes (quiz_id) ON DELETE CASCADE,
    question_text  VARCHAR(1000) NOT NULL,
    option_a       VARCHAR(500),
    option_b       VARCHAR(500),
    option_c       VARCHAR(500),
    option_d       VARCHAR(500),
    correct_answer VARCHAR(500) NOT NULL,
    explanation    VARCHAR(1000),
    marks          INTEGER NOT NULL DEFAULT 1,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions (quiz_id);
