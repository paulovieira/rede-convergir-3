DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;

/*** BEGIN CODE FOR CHANGES  ***/


CREATE TABLE users(
	id serial primary key,
	email text unique not null,
			first_name text,
			last_name text,
			country_code text references countries(code) ON DELETE SET NULL DEFAULT 'PT',
			bio text,
			url text,
			photo text,
	--session_history jsonb default '[]', -- should be an array, see the constraint below
	pw_hash text not null,

	-- permissions;
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	recover_code text,
			recover_code_expiration timestamptz not null default now()

    --CONSTRAINT session_history_must_be_array   CHECK (jsonb_typeof(session_history) = 'array')
);


-- NOTE: the table contains a dummy user; it is used for events that don't below to any registered user/initiative;

/*** END CODE FOR CHANGES  ***/

END;
$$;

SELECT audit.audit_table('users');
