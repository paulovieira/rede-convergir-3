CREATE TABLE IF NOT EXISTS countries (
    name TEXT NOT NULL,
    code TEXT PRIMARY KEY,
    id integer NOT NULL
);

SELECT audit.audit_table('countries');
