DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;


/* the actual code to change to the database starts here */


CREATE TABLE log(
	id    serial unique not null,
	data  jsonb not null
);

END;
$$;


SELECT audit.audit_table('log');
