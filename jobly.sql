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