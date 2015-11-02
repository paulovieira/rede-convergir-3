
/*

	1. READ

*/


DROP FUNCTION IF EXISTS users_read(json);

CREATE FUNCTION users_read(input json DEFAULT '[{}]')

-- return table using the smae columns of the users table
RETURNS TABLE(
	id INT,
	email TEXT,
	first_name TEXT,
	last_name TEXT,
	country_code TEXT,
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

BEGIN

-- if the json argument is an object, convert it to an array (of 1 object)
IF  json_typeof(input) = 'object' THEN
    input := json_build_array(input);
END IF;


FOR input_obj IN ( select json_array_elements(input) ) LOOP

	command := 'SELECT u.* 
				FROM users u
				WHERE true ';
	
	-- criteria: id
	IF input_obj->>'id' IS NOT NULL THEN
		command = command || format(' AND id = %L ', input_obj->>'id');
	END IF;

	-- criteria: email
	IF input_obj->>'email' IS NOT NULL THEN
		command = command || format(' AND email = %L ', input_obj->>'email');
	END IF;

	command := command || ' ORDER BY u.id;';

	--raise notice 'command: %', command;

	RETURN QUERY EXECUTE command;

END LOOP;
		
RETURN;
END;
$BODY$
LANGUAGE plpgsql;

/*

EXAMPLES:

insert into users values
	(default, 'paulovieira@gmail.com', 'paulo', 'vieira', default, 'my bio', 'my url', 'my photo', default, 'pw hash', default),

	(default, 'dummy@gmail.com', 'dummy', 'last name', default, 'my dummy bio', 'my dummy url', 'my dummy photo', default, 'pw dummy hash', default)


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
	_country_code TEXT;
	_pw_hash TEXT;
	_bio TEXT;
	_url TEXT;
	_photo TEXT;
	_recover_code TEXT;
	_recover_code_expiration TIMESTAMPTZ;
BEGIN

	
	SELECT (input_obj->>'id')::int INTO _id;

	-- for tables with surrogate primary key (serial),
	-- if an id is not given, the intention is to create/insert a new row; 
	-- otherwise, the intention is always to update an existing row; in other words
	-- we can't insert a new row with a pre-defined id
	IF _id IS NULL THEN
		SELECT nextval(pg_get_serial_sequence('users', 'id')) INTO _id;		
	ELSE
		-- add an explicit row lock
		SELECT * FROM users where id = _id FOR UPDATE INTO current_row;

		IF current_row.id IS NULL THEN
			RETURN;
		END IF;
	END IF;

	--raise notice 'current: %s', current_row.email;
	--raise notice 'to be inserted or updated: %s', COALESCE(input_obj->>'email', current_row.email);

	SELECT COALESCE(input_obj->>'email',      current_row.email)      INTO _email;
	SELECT COALESCE(input_obj->>'first_name', current_row.first_name) INTO _first_name;
	SELECT COALESCE(input_obj->>'last_name',  current_row.last_name)  INTO _last_name;
	SELECT COALESCE(input_obj->>'country_code',current_row.country_code, 'PT')  INTO _country_code;
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
		country_code,
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
		_country_code,
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
		country_code = EXCLUDED.country_code,
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
