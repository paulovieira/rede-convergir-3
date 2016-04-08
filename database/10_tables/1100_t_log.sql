CREATE TABLE IF NOT EXISTS log(
	id    serial unique not null,
	data  jsonb not null
);

SELECT audit.audit_table('log');
