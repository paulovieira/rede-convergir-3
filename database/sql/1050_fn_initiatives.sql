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



/*

	1. READ

*/


DROP FUNCTION IF EXISTS initiatives_read(json);

CREATE FUNCTION initiatives_read(options json DEFAULT '[{}]')

-- return table using the definition of the config table
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

-- convert the json argument from object to array of (one) objects
IF  json_typeof(options) = 'object'::text THEN
	options = ('[' || options::text ||  ']')::json;
END IF;

FOR input_obj IN ( select json_array_elements(options) ) LOOP

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
	(default, 'name', 'desc', 'type_permaculture', 'type other', 'domain other', 'url', 'contact', 'email', 'phone', 'contact other', 'logo', 'street', 'city', 'postal code', '[1.1, 2.2]', 'promoter', '1980-01-01', '1981-01-01', default, 'type_permaculture', '5', 'type_permaculture', 'taret_other', '[1, 5]', '10ha', 'url', 'doc url'),

	(default, 'name2', 'desc2', 'type_permaculture', 'type other2', 'domain other2', 'url2', 'contact2', 'email2', 'phone2', 'contact other2', 'logo2', 'street2', 'city2', 'postal code2', '[1.1, 2.2]', 'promoter2', '1980-01-012', '1981-01-012', default, 'type_permaculture', '52', 'type_permaculture', 'taret_other2', '[1, 5]', '10ha2', 'url2', 'doc url2')


select * from  initiatives_read('{"id": 1}');
select * from  initiatives_read('[{"id": 3}, {"id": 4}]');

*/



DROP FUNCTION IF EXISTS users_upsert(json);

CREATE FUNCTION users_upsert(input_obj json)
RETURNS SETOF users AS
$BODY$
DECLARE
	upserted_row users%ROWTYPE;
	current_row users%ROWTYPE;

	-- fields to be used in WHERE clause
	_id INT;

	-- fields to be inserted or updated	
	_email TEXT;
	_first_name TEXT;
	_last_name TEXT;
	_pw_hash TEXT;
	_bio TEXT;
	_url TEXT;
	_photo TEXT;
	_recover_code TEXT;
	_recover_code_expiration TIMESTAMPTZ;
BEGIN

	
	SELECT (input_obj->>'id')::int INTO _id;

	-- if an id is not given, the intention is to create/insert a new row; 
	-- otherwise, the intention is always to update an existing row; in other words
	-- we can't insert a new row with a pre-defined id
	IF _id IS NOT NULL THEN

		-- add an explicit row lock
		SELECT * FROM users where id = _id FOR UPDATE INTO current_row;
		
		IF current_row.id IS NULL THEN
			RETURN;
		END IF;
	ELSE
		
		SELECT nextval(pg_get_serial_sequence('users', 'id')) INTO _id;
	END IF;

	--raise notice 'current: %s', current_row.email;
	--raise notice 'to be inserted or updated: %s', COALESCE(input_obj->>'email', current_row.email);

	SELECT COALESCE(input_obj->>'email',      current_row.email)      INTO _email;
	SELECT COALESCE(input_obj->>'first_name', current_row.first_name) INTO _first_name;
	SELECT COALESCE(input_obj->>'last_name',  current_row.last_name)  INTO _last_name;
	SELECT COALESCE(input_obj->>'bio',        current_row.bio)        INTO _bio;
	SELECT COALESCE(input_obj->>'url',        current_row.url)        INTO _url;
	SELECT COALESCE(input_obj->>'photo',      current_row.photo)      INTO _photo;
	SELECT COALESCE(input_obj->>'pw_hash',    current_row.pw_hash)    INTO _pw_hash;
	SELECT COALESCE(input_obj->>'recover_code',            current_row.recover_code)    INTO _recover_code;
	SELECT COALESCE( (input_obj->>'recover_code_expiration')::timestamptz, current_row.recover_code_expiration)    INTO _recover_code_expiration;

	-- todo: add entry to the session history

	INSERT INTO users(
		id,
		email,
		first_name,
		last_name,
		bio,
		url,
		photo,
		pw_hash,
		recover_code,
		recover_code_expiration
		)
	VALUES (
		_id,
		_email,
		_first_name,
		_last_name,
		_bio,
		_url,
		_photo,
		_pw_hash,
		_recover_code,
		_recover_code_expiration
		)
	ON CONFLICT (id) DO UPDATE SET 
		email = EXCLUDED.email,
		first_name = EXCLUDED.first_name,
		last_name = EXCLUDED.last_name,
		bio = EXCLUDED.bio,
		url = EXCLUDED.url,
		photo = EXCLUDED.photo,
		pw_hash = EXCLUDED.pw_hash,
		recover_code = EXCLUDED.recover_code,
		recover_code_expiration = EXCLUDED.recover_code_expiration
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

select * from users


to create a new row, the id property should be missing

select * from users_upsert('{
	"email": "abc@abc.com",
	"first_name": "paulo",
	"last_name": "vieira",
	"pw_hash": "xyz"
}');


to update one or more fields of an existing row, the id property should be given;
note that only the given properties will be updated; 

select * from users_upsert('{
    "id": 22,
	"first_name": "pauloxx",
}');


*/





DROP FUNCTION IF EXISTS users_delete(json);

CREATE FUNCTION users_delete(input_obj json)
RETURNS TABLE(deleted_id int) AS
$$
DECLARE
	deleted_row users%ROWTYPE;

	-- fields to be used in WHERE clause
	_id INT;
BEGIN

	-- extract values to be used in the WHERE clause
	SELECT (input_obj->>'id')::int INTO _id;

	DELETE FROM users
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
select * from users

select * from users_delete('{"id": 4}');

*/
