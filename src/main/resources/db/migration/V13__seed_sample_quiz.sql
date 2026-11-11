-- V13: Seed sample quiz and questions for topic 'Geometrical Meaning of Zeroes'
INSERT INTO quizzes (title, description, topic_id, time_limit_minutes)
SELECT 
    'Polynomials & Zeroes Concept Quiz',
    'Test your core understanding of zeroes, degrees, and geometrical representations of polynomials.',
    t.topic_id,
    10
FROM topics t
WHERE LOWER(t.topic_name) LIKE '%zeroes%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Seed Questions
INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, marks)
SELECT 
    q.quiz_id,
    'What is the maximum number of zeroes that a quadratic polynomial can have?',
    '1',
    '2',
    '3',
    'Infinitely many',
    '2',
    'A quadratic polynomial has degree 2, so it can intersect the x-axis at most twice, yielding at most 2 zeroes.',
    1
FROM quizzes q
WHERE q.title = 'Polynomials & Zeroes Concept Quiz'
  AND NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id = q.quiz_id AND question_text LIKE 'What is the maximum number of zeroes%')
LIMIT 1;

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, marks)
SELECT 
    q.quiz_id,
    'The graph of y = p(x) intersects the x-axis at 3 distinct points. How many zeroes does p(x) have?',
    '0',
    '1',
    '2',
    '3',
    '3',
    'The number of real zeroes of a polynomial y = p(x) is equal to the number of points where its graph intersects the x-axis.',
    1
FROM quizzes q
WHERE q.title = 'Polynomials & Zeroes Concept Quiz'
  AND NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id = q.quiz_id AND question_text LIKE 'The graph of y = p(x) intersects%')
LIMIT 1;

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, marks)
SELECT 
    q.quiz_id,
    'If one zero of the quadratic polynomial x² + 3x + k is 2, what is the value of k?',
    '-10',
    '-5',
    '10',
    '-2',
    '-10',
    'Substituting x = 2: (2)² + 3(2) + k = 0 => 4 + 6 + k = 0 => k = -10.',
    2
FROM quizzes q
WHERE q.title = 'Polynomials & Zeroes Concept Quiz'
  AND NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id = q.quiz_id AND question_text LIKE 'If one zero of the quadratic polynomial%')
LIMIT 1;
