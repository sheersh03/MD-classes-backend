CREATE TABLE fee_transactions (
    id                     BIGSERIAL PRIMARY KEY,
    student_fee_id         BIGINT NOT NULL REFERENCES student_fees (id) ON DELETE CASCADE,
    amount                 INTEGER NOT NULL,
    payment_method         TEXT NOT NULL,
    transaction_reference  TEXT NOT NULL UNIQUE,
    created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_fee_transactions_fee_id ON fee_transactions (student_fee_id);
