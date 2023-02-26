\echo 'Delete and recreate jobly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly;
CREATE DATABASE jobly;
\connect jobly

\i jobly-schema.sql
\i jobly-seed.sql

\echo 'Delete and recreate jobly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly_test;
CREATE DATABASE jobly_test;
\connect jobly_test

\i jobly-schema.sql

-- SELECT c.id, 
--   c.first_name AS "firstName",  
--   c.last_name AS "lastName", 
--   c.phone, 
--   c.notes
--   FROM customers AS c
--   WHERE LOWER(c.first_name) LIKE LOWER($1)
--     OR LOWER(c.last_name) LIKE LOWER($1)

-- ##########THIS WORKS:
-- SELECT c.handle, c.name, c.num_employees AS "numEmployees", c.description
-- FROM companies AS c WHERE LOWER(c.name) LIKE LOWER('%wat%');

-- regular user Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY3NzEwNDQxNX0.vR9fXQhuw1dh5FWitbWYRiHqB7FX99lsD9xWHktaG2w
-- admin user  Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RhZG1pbiIsImlzQWRtaW4iOnRydWUsImlhdCI6MTY3NzI2ODIxM30.bH5Q79w9YlYgKTX52az_rGbgziOewaW9-wcRPALVhr8

SELECT u.username,
u.first_name AS firstName,
u.last_name AS lastName,
u.email,
u.is_admin AS is_admin,
j.jobs
FROM users AS u
JOIN applications AS a
ON a.username = u.username
JOIN jobs AS j
ON a.job_id = j.id

SELECT u.username,
u.first_name AS firstName,
u.last_name AS lastName,
u.email,
u.is_admin AS is_admin,
a.job_id
FROM users AS u
LEFT JOIN applications AS a
ON u.username = a.username
WHERE u.username = 'testuse'