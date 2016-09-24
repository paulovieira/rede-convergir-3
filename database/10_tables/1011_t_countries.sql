DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;


/*** BEGIN CODE FOR CHANGES  ***/

CREATE TABLE countries (
    name TEXT NOT NULL,
    code TEXT PRIMARY KEY,
    id integer NOT NULL
);

/*** END CODE FOR CHANGES  ***/

END;
$$;

SELECT audit.audit_table('countries');
