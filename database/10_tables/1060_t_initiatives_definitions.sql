CREATE TABLE IF NOT EXISTS initiatives_definitions(
	id            serial unique not null,
	initiative_id int references initiatives(id)  on update cascade on delete cascade,
	definition_id text references definitions(id) on update cascade on delete cascade,

	primary key(initiative_id, definition_id)
);

SELECT audit.audit_table('initiatives_definitions');
