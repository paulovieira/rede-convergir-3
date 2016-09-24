DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;


/*** BEGIN CODE FOR CHANGES  ***/

CREATE TABLE events(
	id serial primary key,
	user_id int REFERENCES users(id) ON DELETE SET NULL,  -- might be the dummy user 
	initiative_id int REFERENCES initiatives(id) ON DELETE SET NULL,  -- might be the dummy initive
	name text not null,
	description text not null,
	start_date timestamptz not null,
	end_date timestamptz not null,
	address text,
	postal_code text,
	city text not null,
	files jsonb, -- must be an array
	url text,
	coordinates jsonb, -- must be an array

	-- more fields
	price text,
	contact text,
	-- target  (comes from t_initiatives_definitions - 1 initiative can have many domains); the possible targets are defined with the prefix "target"
	target_other TEXT,
	facilitation TEXT,
	type_id TEXT references definitions(id) ON DELETE SET NULL,  -- the possible types are defined with the prefix "event_type"
	
	CONSTRAINT files_must_be_array         CHECK (jsonb_typeof(files) = 'array'),
	CONSTRAINT coordinates_must_be_array   CHECK (jsonb_typeof(coordinates) = 'array')
);

/*** END CODE FOR CHANGES  ***/

END;
$$;


SELECT audit.audit_table('events');
