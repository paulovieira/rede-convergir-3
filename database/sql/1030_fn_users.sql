
/*

	1. READ

*/


DROP FUNCTION IF EXISTS users_read(json);

CREATE FUNCTION users_read(options json DEFAULT '[{}]')

-- return table using the definition of the config table
RETURNS TABLE(
	id INT,
	email TEXT,
	first_name TEXT,
	last_name TEXT,
	bio TEXT,
	url TEXT,
	photo TEXT,
	session_history JSONB,
	pw_hash TEXT,
	created_at timestamptz,
	recover TEXT,
	recover_valid_until timestamptz
--	user_texts JSON,  -- join with the users_texts CTE
--	user_groups JSON   -- join with the users_groups CTE
)
AS
$BODY$

DECLARE
	input_obj json;
	command text;
	number_conditions INT;

	-- fields to be used in WHERE clause
	_id INT;
	_email TEXT;
BEGIN

-- convert the json argument from object to array of (one) objects
IF  json_typeof(options) = 'object'::text THEN
	options = ('[' || options::text ||  ']')::json;
END IF;

FOR input_obj IN ( select json_array_elements(options) ) LOOP

	command := 'SELECT u.* FROM users ';
			
	-- extract values to be (optionally) used in the WHERE clause
	SELECT input_obj->>'id' INTO _id;
	SELECT input_obj->>'email' INTO _email;
	
	number_conditions := 0;
	
	-- criteria: id
	IF _id IS NOT NULL THEN
		IF number_conditions = 0 THEN  command = command || ' WHERE';  
		ELSE                           command = command || ' AND';
		END IF;

		command = command || format(' id = %L', _id);
		number_conditions := number_conditions + 1;
	END IF;

	-- criteria: email
	IF _email IS NOT NULL THEN
		IF number_conditions = 0 THEN  command = command || ' WHERE';  
		ELSE                           command = command || ' AND';
		END IF;

		command = command || format(' email = %L', _email);
		number_conditions := number_conditions + 1;
	END IF;

	command := command || ' ORDER BY u.id;';

	raise notice 'command: %', command;

	--IF number_conditions > 0 THEN
		RETURN QUERY EXECUTE command;
	--END IF;


END LOOP;
		
RETURN;
END;
$BODY$
LANGUAGE plpgsql;

/*

EXAMPLES:

insert into users values
	(default, 'paulovieira@gmail.com', 'paulo', 'vieira', 'my bio', 'my url', 'my photo', default, 'pw hash', default),

	(default, 'dummy@gmail.com', 'dummy', 'last name', 'my dummy bio', 'my dummy url', 'my dummy photo', default, 'pw dummy hash', default)


select * from  users_read('{"id": 2}');
select * from  users_read('[{"id": 2}, {"id": 3}]');
select * from  users_read('[{"email": "paulovieira@gmail.com"}, {"id": 3}]');
select * from  users_read();

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
BEGIN

	
	SELECT (input_obj->>'id')::int INTO _id;

	-- if an id is not given, the intention is to create/insert a new row; 
	-- otherwise, the intention is always to update an existing row; in other words
	-- we can't insert a new row with a pre-defined id
	IF _id IS NOT NULL THEN
		SELECT * FROM users where id = _id INTO current_row;
		
		IF current_row.id IS NULL THEN
			RETURN;
		END IF;
	ELSE
		
		SELECT nextval(pg_get_serial_sequence('users', 'id')) INTO _id;
	END IF;

	--raise notice 'current: %s', current_row.email;
	--raise notice 'to be inserted or updated: %s', COALESCE(input_obj->>'email', current_row.email);
	
	--RETURN;
	-- QUESTION: if an id was given, is there any chance that the data in the current_row changes
	-- after the read and before the insert? or is the row "locked" in some sense?

	SELECT COALESCE(input_obj->>'email',      current_row.email)      INTO _email;
	SELECT COALESCE(input_obj->>'first_name', current_row.first_name) INTO _first_name;
	SELECT COALESCE(input_obj->>'last_name',  current_row.last_name)  INTO _last_name;
	SELECT COALESCE(input_obj->>'bio',        current_row.bio)        INTO _bio;
	SELECT COALESCE(input_obj->>'url',        current_row.url)        INTO _url;
	SELECT COALESCE(input_obj->>'photo',      current_row.photo)      INTO _photo;
	SELECT COALESCE(input_obj->>'pw_hash',    current_row.pw_hash)    INTO _pw_hash;

	INSERT INTO users(
		id,
		email,
		first_name,
		last_name,
		bio,
		url,
		photo,
		pw_hash
		)
	VALUES (
		_id,
		_email,
		_first_name,
		_last_name,
		_pw_hash
		)
	ON CONFLICT (id) DO UPDATE SET 
		email = EXCLUDED.email,
		first_name = EXCLUDED.first_name,
		last_name = EXCLUDED.last_name,
		bio = EXCLUDED.bio,
		url = EXCLUDED.url,
		photo = EXCLUDED.photo,
		pw_hash = EXCLUDED.pw_hash
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





DROP FUNCTION IF EXISTS config_delete(json);

CREATE FUNCTION config_delete(input_obj json)
RETURNS TABLE(deleted_key text) AS
$$
DECLARE
	deleted_row config%ROWTYPE;

	-- fields to be used in WHERE clause
	_key TEXT;
BEGIN

	-- extract values to be used in the WHERE clause
	SELECT input_obj->>'key' INTO _key;

	DELETE FROM config
	WHERE key = _key
	RETURNING *
	INTO deleted_row;

	deleted_key   := deleted_row.key;

	IF deleted_key IS NOT NULL THEN
		RETURN NEXT;
	END IF;

RETURN;
END;
$$
LANGUAGE plpgsql;


/*
select * from config

select * from config_delete('{"key": "key6"}');

*/
