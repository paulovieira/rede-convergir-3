/*
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT NOT NULL,
    type_id TEXT references definitions(id),  -- the possible types are defined with the prefix "type"
    type_other TEXT,  -- some specific type for this initiative; if this is not null, then type_id should be a reference to the dummy definition
    -- domains (comes from t_initiatives_definitions - 1 initiative can have many domains); the possible domains are defined with the prefix "domain"
    domains_other TEXT,  -- some specific domain for this initiative
    url TEXT,
    contact_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    contact_other TEXT,
    logo JSONB
    street TEXT,
    city TEXT,
    postal_code TEXT,
    country_code TEXT,
    coordinates JSONB,  -- should be an array, see the constraint below
    promoter TEXT,
    start_date TIMESTAMPTZ,
    registry_date TIMESTAMPTZ,
    update_date TIMESTAMPTZ not null default now(),
	visitors_id TEXT references definitions(id),  -- the possible visitor policy are defined with the prefix "visitors"
    group_size TEXT,   -- should be an integer (but the data in given in a free text field)
    scope_id TEXT references definitions(id),  -- the possible scopes are defined with the prefix "scope"
	-- target  (comes from t_initiatives_definitions - 1 initiative can have many domains); the possible targets are defined with the prefix "target"
    target_other TEXT,
    influence JSONB,  -- should be an array, see the constraint below
    physical_area TEXT,
    video_url TEXT,
    doc_url TEXT,
    initiative_status_id TEXT,
    moderation_status_id TEXT
*/


/*

	1. READ

*/


DROP FUNCTION IF EXISTS initiatives_read(json);

CREATE FUNCTION initiatives_read(input json DEFAULT '[{}]')

-- return table using the smae columns of the initiatives table
RETURNS TABLE(
    id INT,
    name TEXT,
    slug TEXT,
    description TEXT,
    type_id TEXT,
    type_other TEXT,
    domains_other TEXT,
    url TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    contact_other TEXT,
    logo JSONB,
    street TEXT,
    city TEXT,
    postal_code TEXT,
    country_code TEXT,
    coordinates JSONB,
    promoter TEXT,
    start_date TIMESTAMPTZ,
    registry_date TIMESTAMPTZ,
    update_date TIMESTAMPTZ,
	visitors_id TEXT,
    group_size TEXT,
    scope_id TEXT,
    target_other TEXT,
    influence JSONB,
    physical_area TEXT,
    video_url TEXT,
    doc_url TEXT,
    initiative_status_id TEXT,
    moderation_status_id TEXT,
    -------------------------------------------------
    domains JSON,  -- join with the domains CTE
    target JSON  -- join with the domains CTE
)
AS
$BODY$

DECLARE
	input_obj json;
	command text;

    domains_cte TEXT;
    target_cte TEXT;

BEGIN

-- if the json argument is an object, convert it to an array (of 1 object)
IF  json_typeof(input) = 'object' THEN
    input := json_build_array(input);
END IF;

-- for each initiative, get an array of the domains
domains_cte := '
    SELECT 
        i.id AS initiative_id, 
        (CASE 
            WHEN COUNT(idef) = 0 THEN ''[]''::json  
            ELSE json_agg(idef.definition_id) 
        END ) AS domains
    FROM initiatives i
    LEFT JOIN initiatives_definitions idef
    ON i.id = idef.initiative_id
    AND idef.definition_id LIKE ''domain%''
    GROUP BY i.id
';

-- NOTE: in the query above, the filter for LIKE should in the "ON" part, not in the "WHERE" part (because the where removes lines at the end, so we would loose stuff)

-- for each initiative, get an array of the target groups
target_cte := '
    SELECT 
        i.id AS initiative_id, 
        (CASE 
            WHEN COUNT(idef) = 0 THEN ''[]''::json  
            ELSE json_agg(idef.definition_id) 
        END ) AS target
    FROM initiatives i
    LEFT JOIN initiatives_definitions idef
    ON i.id = idef.initiative_id
    AND idef.definition_id LIKE ''target%''
    GROUP BY i.id
';

FOR input_obj IN ( select json_array_elements(input) ) LOOP

    command := 'WITH '
        || 'domains_cte AS ( ' || domains_cte ||  ' ), '
        || 'target_cte  AS ( ' || target_cte  ||  ' ) '
        || 'SELECT 
                i.* ,
                domains_cte.domains,
                target_cte.target
            FROM initiatives i
            INNER JOIN domains_cte
            ON i.id = domains_cte.initiative_id
            INNER JOIN target_cte
            ON i.id = target_cte.initiative_id
            WHERE true ';

    -- input_obj must have the 'id', 'slug', 'type_id' or 'moderation_status_id' keys to be used in the where clause;
    -- if not all the rows will be returned

	-- criteria: id
	IF input_obj->>'id' IS NOT NULL THEN
		command := command || format(' AND i.id = %L', input_obj->>'id');
	END IF;

    -- criteria: slug
    IF input_obj->>'slug' IS NOT NULL THEN
        command := command || format(' AND i.slug = %L', input_obj->>'slug');
    END IF;

    -- criteria: type_id
    IF input_obj->>'type_id' IS NOT NULL THEN
        command := command || format(' AND i.type_id = %L', input_obj->>'type_id');
    END IF;

    -- criteria: moderation_status_id
    IF input_obj->>'moderation_status_id' IS NOT NULL THEN
        IF input_obj->>'moderation_status_id' != 'all'::text THEN
            command := command || format(' AND i.moderation_status_id = %L', input_obj->>'moderation_status_id');
        END IF;
    END IF;

	command := command || ' ORDER BY i.id;';

--	raise notice 'command: %', command;

	RETURN QUERY EXECUTE command;


END LOOP;
		
RETURN;
END;
$BODY$
LANGUAGE plpgsql;

/*

EXAMPLES:


insert into initiatives values
	(default, 'name', 'slug', 'desc', NULL, 'type other', 'domain other', 'url', 'contact', 'email', 'phone', 'contact other', 'logo', 'street', 'city', 'postal code', '[1.1, 2.2]', 'promoter', '1980-01-01', '1981-01-01', default, NULL, '5', NULL, 'taret_other', '[1, 5]', '10ha', 'url', 'doc url', NULL),

	(default, 'name2', 'slug2', 'desc2', NULL, 'type other2', 'domain other2', 'url2', 'contact2', 'email2', 'phone2', 'contact other2', '{"filename": "xyz.jpg"}', 'street2', 'city2', 'postal code2', '[1.1, 2.2]', 'promoter2', '1980-01-012', '1981-01-012', default, NULL, '52', NULL, 'taret_other2', '[1, 5]', '10ha2', 'url2', 'doc url2', NULL)


select * from  initiatives_read('{"id": 1}');

select * from  initiatives_read('[{"moderation_status_id": "moderation_status_002_approved"}]');

select * from  initiatives_read('[{"moderation_status_id": "all"}]');

select * from  initiatives_read('[{"slug": "biovilla"}, {"id": 2778}]');
*/



DROP FUNCTION IF EXISTS initiatives_upsert(json);

CREATE FUNCTION initiatives_upsert(input_obj json)
RETURNS SETOF initiatives AS
$BODY$
DECLARE
	upserted_row initiatives%ROWTYPE;
	current_row initiatives%ROWTYPE;
    n INT;  

	-- fields to be used in WHERE clause
	_id INT;

	-- fields to be inserted or updated	
    _name TEXT;
    _slug TEXT;
    _description TEXT;
    _type_id TEXT;
    _type_other TEXT;
    _domains_other TEXT;
    _url TEXT;
    _contact_name TEXT;
    _email TEXT;
    _phone TEXT;
    _contact_other TEXT;
    _logo JSONB;
    _street TEXT;
    _city TEXT;
    _postal_code TEXT;
    _country_code TEXT;
    _coordinates JSONB;
    _promoter TEXT;
    _start_date TIMESTAMPTZ;
    _registry_date TIMESTAMPTZ;
    _update_date TIMESTAMPTZ;
    _visitors_id TEXT;
    _group_size TEXT;
    _scope_id TEXT;
    _target_other TEXT;
    _influence JSONB;
    _physical_area TEXT;
    _video_url TEXT;
    _doc_url TEXT;
    _initiative_status_id TEXT;
    _moderation_status_id TEXT;
    -- temp variables used to update the initiatives_definitions table
    _array_definitions_ids JSON;
    _definition_id TEXT;
BEGIN


    _id   := (input_obj->>'id')::int;
    _slug := COALESCE(input_obj->>'slug',  current_row.slug);

    IF _id IS NULL THEN
        _id := nextval(pg_get_serial_sequence('initiatives', 'id'));

        -- check if there is some existing row with the given slug; if so, change the slug by adding a
        -- random suffix (TODO: we should have a more robust solution)

        -- note: FOR UPDATE prevents the row from being locked, modified or deleted by other 
        -- transactions until the current transaction ends. See:
        -- http://www.postgresql.org/docs/9.4/static/explicit-locking.html

        SELECT * FROM initiatives where slug = _slug FOR UPDATE INTO current_row;
        GET DIAGNOSTICS n := ROW_COUNT;

        IF n != 0 THEN
            _slug := _slug || '-' || get_random_string();
        END IF;
    ELSE
        -- check if the row actually exists; if not the special variable FOUND is set to  false;
        -- see http://www.postgresql.org/docs/9.5/static/plpgsql-statements.html
        -- section "40.5.5. Obtaining the Result Status"
        -- in that case, we throw an exception with error code P0002 (query returned no rows); 

        SELECT * FROM initiatives where id = _id FOR UPDATE INTO current_row;
        GET DIAGNOSTICS n := ROW_COUNT;

        IF n = 0 THEN
            RAISE EXCEPTION USING 
                    ERRCODE = 'no_data_found',
                    MESSAGE = 'row with id ' || _id ||' does not exist';
        END IF;

    END IF;




	--raise notice 'current: %s', current_row.email;
	--raise notice 'to be inserted or updated: %s', COALESCE(input_obj->>'email', current_row.email);

	_name          := COALESCE(input_obj->>'name',      current_row.name);
	_description   := COALESCE(input_obj->>'description', current_row.description);
	_type_id       := COALESCE(input_obj->>'type_id',  current_row.type_id);
	_type_other    := COALESCE(input_obj->>'type_other',  current_row.type_other);
	_domains_other := COALESCE(input_obj->>'domains_other',        current_row.domains_other);
	_url           := COALESCE(input_obj->>'url',      current_row.url);
	_contact_name  := COALESCE(input_obj->>'contact_name',    current_row.contact_name);
	_email         := COALESCE(input_obj->>'email',        current_row.email);
    _phone         := COALESCE(input_obj->>'phone',            current_row.phone);
    _contact_other := COALESCE(input_obj->>'contact_other',            current_row.contact_other);
    _logo          := COALESCE((input_obj->>'logo')::jsonb,      current_row.logo);
    _street        := COALESCE(input_obj->>'street',            current_row.street);
    _city          := COALESCE(input_obj->>'city',            current_row.city);
    _postal_code   := COALESCE(input_obj->>'postal_code',            current_row.postal_code);
    _country_code  := COALESCE(input_obj->>'country_code',            current_row.country_code, 'PT');
    _coordinates   := COALESCE((input_obj->>'coordinates')::jsonb,            current_row.coordinates);
    _promoter      := COALESCE(input_obj->>'promoter',            current_row.promoter);
    _start_date    := COALESCE((input_obj->>'start_date')::timestamptz, current_row.start_date);
    _registry_date := COALESCE((input_obj->>'registry_date')::timestamptz, current_row.registry_date, now());
    _update_date   := COALESCE((input_obj->>'update_date')::timestamptz,   now());
    _visitors_id   := COALESCE(input_obj->>'visitors_id',            current_row.visitors_id);
    _group_size    := COALESCE(input_obj->>'group_size',            current_row.group_size);
    _scope_id      := COALESCE(input_obj->>'scope_id',            current_row.scope_id);
    _target_other  := COALESCE(input_obj->>'target_other',            current_row.target_other);
    _influence     := COALESCE((input_obj->>'influence')::jsonb,            current_row.influence);
    _physical_area := COALESCE(input_obj->>'physical_area',            current_row.physical_area);
    _video_url     := COALESCE(input_obj->>'video_url',            current_row.video_url);
    _doc_url       := COALESCE(input_obj->>'doc_url',            current_row.doc_url);
    _initiative_status_id := COALESCE(input_obj->>'initiative_status_id', current_row.initiative_status_id, 'initiative_status_003_alive');
    _moderation_status_id := COALESCE(input_obj->>'moderation_status_id', current_row.moderation_status_id, 'moderation_status_001_pending');

	-- todo: add entry to the session history

	INSERT INTO initiatives(
        id,
        name,
        slug,
        description,
        type_id,
        type_other,
        domains_other,
        url,
        contact_name,
        email,
        phone,
        contact_other,
        logo,
        street,
        city,
        postal_code,
        country_code,
        coordinates,
        promoter,
        start_date,
        registry_date,
        update_date,
        visitors_id,
        group_size,
        scope_id,
        target_other,
        influence,
        physical_area,
        video_url,
        doc_url,
        initiative_status_id,
        moderation_status_id
		)
	VALUES (
        _id,
        _name,
        _slug,
        _description,
        _type_id,
        _type_other,
        _domains_other,
        _url,
        _contact_name,
        _email,
        _phone,
        _contact_other,
        _logo,
        _street,
        _city,
        _postal_code,
        _country_code,
        _coordinates,
        _promoter,
        _start_date,
        _registry_date,
        _update_date,
        _visitors_id,
        _group_size,
        _scope_id,
        _target_other,
        _influence,
        _physical_area,
        _video_url,
        _doc_url,
        _initiative_status_id,
        _moderation_status_id
		)
	ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        slug = EXCLUDED.slug,
        description = EXCLUDED.description,
        type_id = EXCLUDED.type_id,
        type_other = EXCLUDED.type_other,
        domains_other = EXCLUDED.domains_other,
        url = EXCLUDED.url,
        contact_name = EXCLUDED.contact_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        contact_other = EXCLUDED.contact_other,
        logo = EXCLUDED.logo,
        street = EXCLUDED.street,
        city = EXCLUDED.city,
        postal_code = EXCLUDED.postal_code,
        country_code = EXCLUDED.country_code,
        coordinates = EXCLUDED.coordinates,
        promoter = EXCLUDED.promoter,
        start_date = EXCLUDED.start_date,
        registry_date = EXCLUDED.registry_date,
        update_date = EXCLUDED.update_date,
        visitors_id = EXCLUDED.visitors_id,
        group_size = EXCLUDED.group_size,
        scope_id = EXCLUDED.scope_id,
        target_other = EXCLUDED.target_other,
        influence = EXCLUDED.influence,
        physical_area = EXCLUDED.physical_area,
        video_url = EXCLUDED.video_url,
        doc_url = EXCLUDED.doc_url,
        initiative_status_id = EXCLUDED.initiative_status_id,
        moderation_status_id = EXCLUDED.moderation_status_id
	RETURNING 
		*
	INTO STRICT 
		upserted_row;

	RETURN NEXT upserted_row;

    -- update the initiative_definitions table (if the array of definitions for "domains" or "target" is defined, which is given in the form of an array of foreign keys)

    -- domains
    _array_definitions_ids := (input_obj->>'domains')::json;
    IF json_typeof(_array_definitions_ids) = 'array' THEN

        DELETE FROM initiatives_definitions WHERE initiative_id = upserted_row.id AND definition_id LIKE 'domain%';

        FOR _definition_id IN ( select json_array_elements_text(_array_definitions_ids) ) LOOP
            INSERT INTO initiatives_definitions VALUES(default, upserted_row.id, _definition_id);
        END LOOP;

    END IF;

    -- target
    _array_definitions_ids := (input_obj->>'target')::json;
    IF json_typeof(_array_definitions_ids) = 'array' THEN

        DELETE FROM initiatives_definitions WHERE initiative_id = upserted_row.id AND definition_id LIKE 'target%';

        FOR _definition_id IN ( select json_array_elements_text(_array_definitions_ids) ) LOOP
            INSERT INTO initiatives_definitions VALUES(default, upserted_row.id, _definition_id);
        END LOOP;

    END IF;

RETURN;
END;
$BODY$
LANGUAGE plpgsql;

/*

EXAMPLES:

select * from initiatives


to create a new row, the id property should be missing

select * from initiatives_upsert('{
    "name": "name",
    "slug": "slug",
    "description": "description",
    "type_id": null,
    "type_other": "type other",
    "domains_other": "domains other",
    "url": "url",
    "contact_name": "contact name",
    "email": "email",
    "phone": "phone",
    "contact_other": "contact other",
    "logo": {"filename": "xyzw.jpg"},
    "street": "street",
    "city": "city",
    "postal_code": "postal code",
    "coordinates": [4.4, 5.5],
    "promoter": "promoter",
    "start_date": "1985-04-05",
    "registry_date": "2015-10-27",
    "visitors_id": null,
    "group_size": "9",
    "scope_id": null,
    "target_other": "target_other",
    "influence": [4,8],
    "physical_area": "physical_area",
    "video_url": "video_url",
    "doc_url": "doc_url",
    "initiative_status_id": null
}');


select * from initiatives_upsert('{
    "name": "name 2",
    "slug": "slug 2",
    "description": "description 2",
    "type_id": null,
    "type_other": "type other 2",
    "domains_other": "domains other 2",
    "url": "url 2",
    "contact_name": "contact name 2",
    "email": "email 2",
    "phone": "phone 2",
    "contact_other": "contact other 2",
    "logo": {"filename": "xyzw.jpg"},
    "street": "street 2",
    "city": "city 2",
    "postal_code": "postal code 2",
    "coordinates": [4.4, 5.5],
    "promoter": "promoter 2",
    "start_date": "1985-04-05",
    "registry_date": "2015-10-27",
    "visitors_id": null,
    "group_size": "9",
    "scope_id": null,
    "target_other": "target_other 2",
    "influence": [4,8],
    "physical_area": "physical_area 2",
    "video_url": "video_url 2",
    "doc_url": "doc_url 2",
    "initiative_status_id": null
}');

to update one or more fields of an existing row, the id property should be given;
note that only the given properties will be updated; 

select * from initiatives_upsert('{
    "id": 328,
    "name": "name changed",
    "slug": "slug changed",
    "type_id": "type_transition"
}');




*/





DROP FUNCTION IF EXISTS initiatives_delete(json);

CREATE FUNCTION initiatives_delete(input_obj json)
RETURNS SETOF initiatives AS
$$
DECLARE
	deleted_row initiatives%ROWTYPE;

BEGIN

    -- if the row does not exist an exception will be thrown with error code P0002
    -- (query returned no rows); this happens automatically because we are
    -- using STRICT INTO ("the query must return exactly one row or a run-time error will
    -- be reported" - http://www.postgresql.org/docs/9.5/static/plpgsql-statements.html)

	DELETE FROM initiatives
	WHERE id = (input_obj->>'id')::int
	RETURNING *
	INTO STRICT deleted_row;

    RETURN NEXT deleted_row;

RETURN;
END;
$$
LANGUAGE plpgsql;


/*
select * from initiatives

select * from initiatives_delete('{"id": 2}');

*/
