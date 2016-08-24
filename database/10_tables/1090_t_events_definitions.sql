DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;


/* the actual code to change to the database starts here */


CREATE TABLE events_definitions(
	id            serial unique not null,
	event_id      int references events(id)       on update cascade on delete cascade,
	definition_id text references definitions(id) on update cascade on delete cascade,

	primary key(event_id, definition_id)
);

END;
$$;


SELECT audit.audit_table('events_definitions');
