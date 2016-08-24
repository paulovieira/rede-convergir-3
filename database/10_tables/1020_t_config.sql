DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;

/* the actual code to change to the database starts here */

CREATE TABLE config( 
	--id SERIAL PRIMARY KEY,
	key TEXT PRIMARY KEY,
	value JSONB NOT NULL
);

END;
$$;

SELECT audit.audit_table('config');
