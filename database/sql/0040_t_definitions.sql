CREATE TABLE IF NOT EXISTS definitions(
	id serial primary key,
	segment text not null,
	name jsonb not null,
	description jsonb not null
);

--PERFORM audit.audit_table('definitions');
SELECT audit.audit_table('definitions');

/*
NOTE: the table contains a dummy definition; 
*/