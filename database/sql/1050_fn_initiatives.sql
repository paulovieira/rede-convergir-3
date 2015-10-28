/*
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
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
    logo TEXT,
    street TEXT,
    city TEXT,
    postal_code TEXT,
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
    description TEXT,
    type_id TEXT,
    type_other TEXT,
    domains_other TEXT,
    url TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    contact_other TEXT,
    logo TEXT,
    street TEXT,
    city TEXT,
    postal_code TEXT,
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
    doc_url TEXT
)
AS
$BODY$

DECLARE
	input_obj json;
	command text;
	number_conditions INT;

	-- fields to be used in WHERE clause
	_id INT;
BEGIN

-- if the json argument is an object, convert it to an array (of 1 object)
IF  json_typeof(input) = 'object' THEN
    SELECT json_build_array(input) INTO input;
END IF;


FOR input_obj IN ( select json_array_elements(input) ) LOOP

	command := 'SELECT i.* FROM initiatives i';
			
	-- extract values to be (optionally) used in the WHERE clause
	SELECT input_obj->>'id' INTO _id;
	
	number_conditions := 0;
	
	-- criteria: id
	IF _id IS NOT NULL THEN
		IF number_conditions = 0 THEN  command = command || ' WHERE';  
		ELSE                           command = command || ' AND';
		END IF;

		command = command || format(' i.id = %L', _id);
		number_conditions := number_conditions + 1;
	END IF;

	command := command || ' ORDER BY i.id;';

	--raise notice 'command: %', command;

	IF number_conditions > 0 THEN
		RETURN QUERY EXECUTE command;
	END IF;


END LOOP;
		
RETURN;
END;
$BODY$
LANGUAGE plpgsql;

/*

EXAMPLES:


insert into initiatives values
	(default, 'name', 'desc', NULL, 'type other', 'domain other', 'url', 'contact', 'email', 'phone', 'contact other', 'logo', 'street', 'city', 'postal code', '[1.1, 2.2]', 'promoter', '1980-01-01', '1981-01-01', default, NULL, '5', NULL, 'taret_other', '[1, 5]', '10ha', 'url', 'doc url'),

	(default, 'name2', 'desc2', NULL, 'type other2', 'domain other2', 'url2', 'contact2', 'email2', 'phone2', 'contact other2', 'logo2', 'street2', 'city2', 'postal code2', '[1.1, 2.2]', 'promoter2', '1980-01-012', '1981-01-012', default, NULL, '52', NULL, 'taret_other2', '[1, 5]', '10ha2', 'url2', 'doc url2')


select * from  initiatives_read('{"id": 1}');
select * from  initiatives_read('[{"id": 3}, {"id": 4}]');

*/



DROP FUNCTION IF EXISTS initiatives_upsert(json);

CREATE FUNCTION initiatives_upsert(input_obj json)
RETURNS SETOF initiatives AS
$BODY$
DECLARE
	upserted_row initiatives%ROWTYPE;
	current_row initiatives%ROWTYPE;

	-- fields to be used in WHERE clause
	_id INT;

	-- fields to be inserted or updated	
    _name TEXT;
    _description TEXT;
    _type_id TEXT;
    _type_other TEXT;
    _domains_other TEXT;
    _url TEXT;
    _contact_name TEXT;
    _email TEXT;
    _phone TEXT;
    _contact_other TEXT;
    _logo TEXT;
    _street TEXT;
    _city TEXT;
    _postal_code TEXT;
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
BEGIN

	
	SELECT (input_obj->>'id')::int INTO _id;

    IF _id IS NULL THEN
        SELECT nextval(pg_get_serial_sequence('initiatives', 'id')) INTO _id;     
    ELSE
        -- add an explicit row lock
        SELECT * FROM initiatives where id = _id FOR UPDATE INTO current_row;

        IF current_row.id IS NULL THEN
            RETURN;
        END IF;
    END IF;


	--raise notice 'current: %s', current_row.email;
	--raise notice 'to be inserted or updated: %s', COALESCE(input_obj->>'email', current_row.email);

	SELECT COALESCE(input_obj->>'name',      current_row.name)      INTO _name;
	SELECT COALESCE(input_obj->>'description', current_row.description) INTO _description;
	SELECT COALESCE(input_obj->>'type_id',  current_row.type_id)  INTO _type_id;
	SELECT COALESCE(input_obj->>'type_other',  current_row.type_other)        INTO _type_other;
	SELECT COALESCE(input_obj->>'domains_other',        current_row.domains_other)        INTO _domains_other;
	SELECT COALESCE(input_obj->>'url',      current_row.url)      INTO _url;
	SELECT COALESCE(input_obj->>'contact_name',    current_row.contact_name)    INTO _contact_name;
	SELECT COALESCE(input_obj->>'email',        current_row.email)    INTO _email;
    SELECT COALESCE(input_obj->>'phone',            current_row.phone)    INTO _phone;
    SELECT COALESCE(input_obj->>'contact_other',            current_row.contact_other)    INTO _contact_other;
    SELECT COALESCE(input_obj->>'logo',            current_row.logo)    INTO _logo;
    SELECT COALESCE(input_obj->>'street',            current_row.street)    INTO _street;
    SELECT COALESCE(input_obj->>'city',            current_row.city)    INTO _city;
    SELECT COALESCE(input_obj->>'postal_code',            current_row.postal_code)    INTO _postal_code;
    SELECT COALESCE((input_obj->>'coordinates')::jsonb,            current_row.coordinates)    INTO _coordinates;
    SELECT COALESCE(input_obj->>'promoter',            current_row.promoter)    INTO _promoter;
    SELECT COALESCE((input_obj->>'start_date')::timestamptz, current_row.start_date)    INTO _start_date;
    SELECT COALESCE((input_obj->>'registry_date')::timestamptz, current_row.registry_date, now())    INTO _registry_date;
    SELECT COALESCE((input_obj->>'update_date')::timestamptz,   now())    INTO _update_date;
    SELECT COALESCE(input_obj->>'visitors_id',            current_row.visitors_id)    INTO _visitors_id;
    SELECT COALESCE(input_obj->>'group_size',            current_row.group_size)    INTO _group_size;
    SELECT COALESCE(input_obj->>'scope_id',            current_row.scope_id)    INTO _scope_id;
    SELECT COALESCE(input_obj->>'target_other',            current_row.target_other)    INTO _target_other;
    SELECT COALESCE((input_obj->>'influence')::jsonb,            current_row.influence)    INTO _influence;
    SELECT COALESCE(input_obj->>'physical_area',            current_row.physical_area)    INTO _physical_area;
    SELECT COALESCE(input_obj->>'video_url',            current_row.video_url)    INTO _video_url;
    SELECT COALESCE(input_obj->>'doc_url',            current_row.doc_url)    INTO _doc_url;

	-- todo: add entry to the session history

	INSERT INTO initiatives(
        id,
        name,
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
        doc_url
		)
	VALUES (
        _id,
        _name,
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
        _doc_url
		)
	ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
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
        doc_url = EXCLUDED.doc_url
	RETURNING 
		*
	INTO STRICT 
		upserted_row;

	RETURN NEXT upserted_row;

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
    "description": "description",
    "type_id": "type_permaculture",
    "type_other": "type other",
    "domains_other": "domains other",
    "url": "url",
    "contact_name": "contact name",
    "email": "email",
    "phone": "phone",
    "contact_other": "contact other",
    "logo": "logo",
    "street": "street",
    "city": "city",
    "postal_code": "postal code",
    "coordinates": [4.4, 5.5],
    "promoter": "promoter",
    "start_date": "1985-04-05",
    "registry_date": "2015-10-27",
    "visitors_id": "type_permaculture",
    "group_size": "9",
    "scope_id": "type_permaculture",
    "target_other": "target_other",
    "influence": [4,8],
    "physical_area": "physical_area",
    "video_url": "video_url",
    "doc_url": "doc_url"
}');


to update one or more fields of an existing row, the id property should be given;
note that only the given properties will be updated; 

select * from initiatives_upsert('{
    "id": 7,
    "name": "name changed",
    "type_id": "type_transicao",
}');




*/





DROP FUNCTION IF EXISTS initiatives_delete(json);

CREATE FUNCTION initiatives_delete(input_obj json)
RETURNS TABLE(deleted_id int) AS
$$
DECLARE
	deleted_row initiatives%ROWTYPE;

	-- fields to be used in WHERE clause
	_id INT;
BEGIN

	-- extract values to be used in the WHERE clause
	SELECT (input_obj->>'id')::int INTO _id;

	DELETE FROM initiatives
	WHERE id = _id
	RETURNING *
	INTO deleted_row;

	deleted_id   := deleted_row.id;

	IF deleted_row.id IS NOT NULL THEN
		SELECT deleted_row.id INTO deleted_id;
		RETURN NEXT;
	END IF;

RETURN;
END;
$$
LANGUAGE plpgsql;


/*
select * from initiatives

select * from initiatives_delete('{"id": 2}');

*/
