DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;


/*** BEGIN CODE FOR CHANGES  ***/

CREATE TABLE definitions(
	--id serial primary key,
	id text primary key,
	title jsonb not null,
	description jsonb not null
);

/*** END CODE FOR CHANGES  ***/

END;
$$;

SELECT audit.audit_table('definitions');


/*
NOTES: 
the table contains a dummy definition; 
the id should be human-readable text in the form "prefix_name"; for instance: "type_permaculture", "type_transition", etc

*/

