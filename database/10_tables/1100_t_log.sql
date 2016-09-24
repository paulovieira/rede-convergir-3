DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;


/*** BEGIN CODE FOR CHANGES  ***/

CREATE TABLE log(
	id    serial unique not null,
	data  jsonb not null
);

/*** END CODE FOR CHANGES  ***/

END;
$$;


SELECT audit.audit_table('log');
