CREATE TABLE IF NOT EXISTS users(
	id serial primary key,
	email text unique not null,
	first_name text,
	last_name text,
	bio text,
	url text,
	photo text,
	session_history jsonb, -- should be an array, see the constraint below
	pw_hash text not null,
	created_at timestamptz not null default now(),
	recover_code text,
	recover_code_expiration timestamptz,

    CONSTRAINT session_history_must_be_array   CHECK (jsonb_typeof(session_history) = 'array')
);

--PERFORM audit.audit_table('users');
SELECT audit.audit_table('users');

-- NOTE: the table contains a dummy user; it is used for events that don't below to any registered user/initiative;
