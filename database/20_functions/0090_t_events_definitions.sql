CREATE TABLE IF NOT EXISTS events_definitions(
	id            serial unique not null,
	event_id      int references events(id)       on update cascade on delete cascade,
	definition_id text references definitions(id) on update cascade on delete cascade,

	primary key(event_id, definition_id)
);

SELECT audit.audit_table('events_definitions');
