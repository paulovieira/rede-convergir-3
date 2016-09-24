DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;

/*** BEGIN CODE FOR CHANGES  ***/

CREATE TABLE initiatives(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    type_id TEXT references definitions(id) ON DELETE SET NULL,  -- the possible types are defined with the prefix "type"
    type_other TEXT,  -- some specific type for this initiative; if this is not null, then type_id should be a reference to the dummy definition
    -- domains (comes from t_initiatives_definitions - 1 initiative can have many domains); the possible domains are defined with the prefix "domain"
    domains_other TEXT,  -- some specific domain for this initiative
    url TEXT,
    contact_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    contact_other TEXT,
    logo JSONB default '{"filename": "", "min": 100, "max": 130, "exclusive": false}',
    street TEXT,
    city TEXT,
    postal_code TEXT,
    country_code TEXT REFERENCES countries(code) ON DELETE SET NULL DEFAULT 'PT',   -- ISO 3166 code
    coordinates JSONB,  -- should be an array, see the constraint below
    promoter TEXT,
    start_date TIMESTAMPTZ,
    registry_date TIMESTAMPTZ,
    update_date TIMESTAMPTZ not null default now(),
	visitors_id TEXT references definitions(id)  ON DELETE SET NULL,  -- the possible visitor policy are defined with the prefix "visitors"
    group_size TEXT,   -- should be an integer (but the data in given in a free text field)
    scope_id TEXT references definitions(id)  ON DELETE SET NULL,  -- the possible scopes are defined with the prefix "scope"
	-- target  (comes from t_initiatives_definitions - 1 initiative can have many domains); the possible targets are defined with the prefix "target"
    target_other TEXT,
    influence JSONB,  -- should be an array, see the constraint below
    physical_area TEXT,
    video_url TEXT,
    doc_url TEXT,
    initiative_status_id TEXT references definitions(id) ON DELETE SET NULL default 'initiative_status_003_alive',  -- the possible status are defined with the prefix "initiative_status"
    moderation_status_id TEXT references definitions(id) ON DELETE SET NULL default 'moderation_status_001_pending',  -- the possible status are defined with the prefix "moderation_status"

    CONSTRAINT logo_must_be_object       CHECK (jsonb_typeof(logo)        = 'object'),
    CONSTRAINT coordinates_must_be_array CHECK (jsonb_typeof(coordinates) = 'array'),
    CONSTRAINT influence_must_be_array   CHECK (jsonb_typeof(influence)   = 'array')
);

/*** END CODE FOR CHANGES  ***/

END;
$$;


SELECT audit.audit_table('initiatives');

-- NOTE: the table contains a dummy initiative; it is used for events that don't below to any registered user/initiative;