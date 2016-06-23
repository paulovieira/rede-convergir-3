
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
	--session_history JSONB,
	pw_hash TEXT,
	created_at timestamptz,
	updated_at timestamptz,
	recover_code TEXT,
	recover_code_expiration timestamptz
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
	
	-- input_obj must have the 'id' or 'email' keys to be used in the where clause;
	-- if not all the rows will be returned

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
	(default, 'paulovieira@gmail.com', default, default, default, default, default, default, 'pw_hash', default, default, 'recover_code', default)
	(default, 'dummy@gmail.com', default, default, default, default, default, default, 'pw_hash_2', default, default, 'recover_code_2', default)


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
    n INT;  

	-- fields to be used in WHERE clause
	_id INT;

	-- fields to be inserted or updated	
	_email TEXT;
	_first_name TEXT;
	_last_name TEXT;
	_country_code TEXT;
	_bio TEXT;
	_url TEXT;
	_photo TEXT;
	_pw_hash TEXT;
	_recover_code TEXT;
	_recover_code_expiration TIMESTAMPTZ;
BEGIN

	
	_id   := (input_obj->>'id')::int;

	-- for tables with surrogate primary key (serial),
	-- if an id is not given, the intention is to create/insert a new row; 
	-- otherwise, the intention is always to update an existing row; in other words
	-- we can't insert a new row with a pre-defined id
	IF _id IS NULL THEN
		_id := nextval(pg_get_serial_sequence('users', 'id'));
	ELSE
		-- add an explicit row lock
		SELECT * FROM users where id = _id FOR UPDATE INTO current_row;
        GET DIAGNOSTICS n := ROW_COUNT;

        IF n = 0 THEN
            RAISE EXCEPTION USING 
                    ERRCODE = 'no_data_found',
                    MESSAGE = 'row with id ' || _id ||' does not exist';
        END IF;

	END IF;

	--raise notice 'current: %s', current_row.email;
	--raise notice 'to be inserted or updated: %s', COALESCE(input_obj->>'email', current_row.email);

	_email        :=  COALESCE(input_obj->>'email',         current_row.email);
	_first_name   :=  COALESCE(input_obj->>'first_name',    current_row.first_name);
	_last_name    :=  COALESCE(input_obj->>'last_name',     current_row.last_name);
	_country_code :=  COALESCE(input_obj->>'country_code',  current_row.country_code,  get_default('users', 'country_code'));
	_bio          :=  COALESCE(input_obj->>'bio',           current_row.bio);
	_url          :=  COALESCE(input_obj->>'url',           current_row.url);
	_photo        :=  COALESCE(input_obj->>'photo',         current_row.photo);
	_pw_hash      :=  COALESCE(input_obj->>'pw_hash',       current_row.pw_hash);
	_recover_code :=  COALESCE(input_obj->>'recover_code',  current_row.recover_code);
	_recover_code_expiration :=  COALESCE(
									(input_obj->>'recover_code_expiration')::TIMESTAMPTZ,  
									current_row.recover_code_expiration, 
									get_default('users', 'recover_code_expiration')::timestamptz
								);

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
		updated_at,
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
		NOW(),
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
		updated_at = NOW(),
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
RETURNS SETOF users AS
$$
DECLARE
	deleted_row users%ROWTYPE;

BEGIN

    -- if the row does not exist an exception will be thrown with error code P0002
    -- (query returned no rows); this happens automatically because we are
    -- using STRICT INTO ("the query must return exactly one row or a run-time error will
    -- be reported" - http://www.postgresql.org/docs/9.5/static/plpgsql-statements.html)

	DELETE FROM users
	WHERE id = (input_obj->>'id')::int
	RETURNING *
	INTO STRICT deleted_row;

	RETURN NEXT deleted_row;

RETURN;
END;
$$
LANGUAGE plpgsql;


/*
select * from users

select * from users_delete('{"id": 4}');

*/
