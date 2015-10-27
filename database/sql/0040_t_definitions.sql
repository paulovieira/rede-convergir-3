CREATE TABLE IF NOT EXISTS definitions(
	--id serial primary key,
	id text primary key,
	title jsonb not null,
	description jsonb not null
);

--PERFORM audit.audit_table('definitions');
SELECT audit.audit_table('definitions');

/*
NOTES: 
the table contains a dummy definition; 
the id should be human-readable text in the form "prefix_name"; for instance: "type_permaculture", "type_transition", etc

*/