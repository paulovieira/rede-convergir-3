CREATE TABLE IF NOT EXISTS initiatives(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    type_id INT references definitions(id),  -- the possible types are defined with the segment "type"
    type_other TEXT,  -- some specific type for this initiative; if this is not null, then type_id should be a reference to the dummy definition
    -- domains (comes from t_initiatives_definitions - 1 initiative can have many domains); the possible domains are defined with the segment "domain"
    domains_other TEXT,  -- some specific domain for this initiative
    url TEXT,
    contact_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    contact_other TEXT,
    logo TEXT,
    street TEXT,
    city TEXT,
    postal_code TEXT,
    coordinates JSONB,  -- should be an array, see the constraint below
    promoter TEXT,
    start_date TIMESTAMPTZ,
    registry_date TIMESTAMPTZ,
    update_date TIMESTAMPTZ,
	visitors_id INT references definitions(id),  -- the possible visitor policy are defined with the segment "visitors"
    group_size JSONB,  -- should be an array, see the constraint below
    scope_id INT references definitions(id),  -- the possible scopes are defined with the segment "scope"
	-- target  (comes from t_initiatives_definitions - 1 initiative can have many domains); the possible targets are defined with the segment "target"
    target_other TEXT,
    influence TEXT,
    physical_area TEXT,
    video_url TEXT,
    doc_url TEXT,
	updated_at timestamptz not null default now(),

    CONSTRAINT coordinates_must_be_array   CHECK (jsonb_typeof(coordinates) = 'array'),
    CONSTRAINT group_size_must_be_array   CHECK (jsonb_typeof(group_size) = 'array')
);

-- PERFORM audit.audit_table('initiatives');
SELECT audit.audit_table('initiatives');

-- NOTE: the table contains a dummy initiative; it is used for events that don't below to any registered user/initiative;