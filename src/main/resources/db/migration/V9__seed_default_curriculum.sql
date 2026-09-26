-- Seed Standard Subjects if they don't already exist
INSERT INTO subjects (subject_name)
SELECT 'Science' WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE LOWER(subject_name) = 'science');

INSERT INTO subjects (subject_name)
SELECT 'Social Science' WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE LOWER(subject_name) = 'social science');

INSERT INTO subjects (subject_name)
SELECT 'English' WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE LOWER(subject_name) = 'english');

INSERT INTO subjects (subject_name)
SELECT 'Computer' WHERE NOT EXISTS (SELECT 1 FROM subjects WHERE LOWER(subject_name) = 'computer');

-- Seed Units for Maths
INSERT INTO units (subject_id, unit_name)
SELECT s.subject_id, 'Polynomials'
FROM subjects s
WHERE LOWER(s.subject_name) = 'maths'
  AND NOT EXISTS (SELECT 1 FROM units u WHERE u.subject_id = s.subject_id AND LOWER(u.unit_name) = 'polynomials')
LIMIT 1;

INSERT INTO units (subject_id, unit_name)
SELECT s.subject_id, 'Linear Equations in Two Variables'
FROM subjects s
WHERE LOWER(s.subject_name) = 'maths'
  AND NOT EXISTS (SELECT 1 FROM units u WHERE u.subject_id = s.subject_id AND LOWER(u.unit_name) = 'linear equations in two variables')
LIMIT 1;

-- Seed Topics for Maths Polynomials
INSERT INTO topics (unit_id, topic_name)
SELECT u.unit_id, 'Geometrical Meaning of Zeroes'
FROM units u
JOIN subjects s ON u.subject_id = s.subject_id
WHERE LOWER(s.subject_name) = 'maths' AND LOWER(u.unit_name) = 'polynomials'
  AND NOT EXISTS (SELECT 1 FROM topics t WHERE t.unit_id = u.unit_id AND LOWER(t.topic_name) = 'geometrical meaning of zeroes')
LIMIT 1;

INSERT INTO topics (unit_id, topic_name)
SELECT u.unit_id, 'Relationship Between Zeroes & Coefficients'
FROM units u
JOIN subjects s ON u.subject_id = s.subject_id
WHERE LOWER(s.subject_name) = 'maths' AND LOWER(u.unit_name) = 'polynomials'
  AND NOT EXISTS (SELECT 1 FROM topics t WHERE t.unit_id = u.unit_id AND LOWER(t.topic_name) = 'relationship between zeroes & coefficients')
LIMIT 1;

-- Seed Units for Science
INSERT INTO units (subject_id, unit_name)
SELECT s.subject_id, 'Chemical Reactions and Equations'
FROM subjects s
WHERE LOWER(s.subject_name) = 'science'
  AND NOT EXISTS (SELECT 1 FROM units u WHERE u.subject_id = s.subject_id AND LOWER(u.unit_name) = 'chemical reactions and equations')
LIMIT 1;

INSERT INTO units (subject_id, unit_name)
SELECT s.subject_id, 'Life Processes'
FROM subjects s
WHERE LOWER(s.subject_name) = 'science'
  AND NOT EXISTS (SELECT 1 FROM units u WHERE u.subject_id = s.subject_id AND LOWER(u.unit_name) = 'life processes')
LIMIT 1;

-- Seed Topics for Chemical Reactions
INSERT INTO topics (unit_id, topic_name)
SELECT u.unit_id, 'Balancing Chemical Equations'
FROM units u
WHERE LOWER(u.unit_name) = 'chemical reactions and equations'
  AND NOT EXISTS (SELECT 1 FROM topics t WHERE t.unit_id = u.unit_id AND LOWER(t.topic_name) = 'balancing chemical equations')
LIMIT 1;

INSERT INTO topics (unit_id, topic_name)
SELECT u.unit_id, 'Types of Chemical Reactions'
FROM units u
WHERE LOWER(u.unit_name) = 'chemical reactions and equations'
  AND NOT EXISTS (SELECT 1 FROM topics t WHERE t.unit_id = u.unit_id AND LOWER(t.topic_name) = 'types of chemical reactions')
LIMIT 1;

-- Seed Topics for Life Processes
INSERT INTO topics (unit_id, topic_name)
SELECT u.unit_id, 'Autotrophic & Heterotrophic Nutrition'
FROM units u
WHERE LOWER(u.unit_name) = 'life processes'
  AND NOT EXISTS (SELECT 1 FROM topics t WHERE t.unit_id = u.unit_id AND LOWER(t.topic_name) = 'autotrophic & heterotrophic nutrition')
LIMIT 1;

INSERT INTO topics (unit_id, topic_name)
SELECT u.unit_id, 'Human Respiration and Circulatory System'
FROM units u
WHERE LOWER(u.unit_name) = 'life processes'
  AND NOT EXISTS (SELECT 1 FROM topics t WHERE t.unit_id = u.unit_id AND LOWER(t.topic_name) = 'human respiration and circulatory system')
LIMIT 1;

-- Seed Units for Computer
INSERT INTO units (subject_id, unit_name)
SELECT s.subject_id, 'Cyber Ethics and Security'
FROM subjects s
WHERE LOWER(s.subject_name) = 'computer'
  AND NOT EXISTS (SELECT 1 FROM units u WHERE u.subject_id = s.subject_id AND LOWER(u.unit_name) = 'cyber ethics and security')
LIMIT 1;

-- Seed Topics for Computer
INSERT INTO topics (unit_id, topic_name)
SELECT u.unit_id, 'Netiquettes and Digital Footprint'
FROM units u
WHERE LOWER(u.unit_name) = 'cyber ethics and security'
  AND NOT EXISTS (SELECT 1 FROM topics t WHERE t.unit_id = u.unit_id AND LOWER(t.topic_name) = 'netiquettes and digital footprint')
LIMIT 1;

INSERT INTO topics (unit_id, topic_name)
SELECT u.unit_id, 'Secure Browsing & Cyber Safety Measures'
FROM units u
WHERE LOWER(u.unit_name) = 'cyber ethics and security'
  AND NOT EXISTS (SELECT 1 FROM topics t WHERE t.unit_id = u.unit_id AND LOWER(t.topic_name) = 'secure browsing & cyber safety measures')
LIMIT 1;
