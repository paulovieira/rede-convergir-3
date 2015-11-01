
/*

	1. READ

*/


DROP FUNCTION IF EXISTS initiatives_users_read(json);

CREATE FUNCTION initiatives_users_read(input json DEFAULT '[{}]')

-- return table using the smae columns of the initiatives_users table
RETURNS TABLE(
	id INT,
	initiative_id INT,
	user_id INT
)
AS
$BODY$

DECLARE
	input_obj json;
	command text;

BEGIN

-- if the json argument is an object, convert it to an array (of 1 object)
IF  json_typeof(input) = 'object' THEN
	input := json_build_array(input);
END IF;


FOR input_obj IN ( select json_array_elements(input) ) LOOP

	command := 'SELECT i.* 
				FROM initiatives_users i
				WHERE true ';

	-- criteria: id
	IF input_obj->>'id' IS NOT NULL THEN
		command = command || format(' AND i.id = %L ', input_obj->>'id');
	END IF;

	-- criteria: initiative_id
	IF input_obj->>'initiative_id' IS NOT NULL THEN
		command = command || format(' AND initiative_id = %L ', input_obj->>'initiative_id');
	END IF;

	-- criteria: user_id 
	IF input_obj->>'user_id' IS NOT NULL THEN
		command = command || format(' AND user_id = %L ', input_obj->>'user_id');
	END IF;

	command := command || ' ORDER BY i.id;';

	--raise notice 'command: %', command;

	RETURN QUERY EXECUTE command;

END LOOP;
		
RETURN;
END;
$BODY$
LANGUAGE plpgsql;

/*

EXAMPLES:

select * from initiatives
select * from users
select * from initiatives_users

insert into initiatives_users values
	(default, 388, 1),
	(default, 400, 1)


select * from  initiatives_users_read('{"initiative_id": 6}');

select * from  initiatives_users_read('{"user_id": 1}');

select * from  initiatives_users_read('[
    {"initiative_id": 1},
    {"initiative_id": 6}
]');


select * from  initiatives_users_read('{"initiative_id": 6, "user_id": 1}');



*/



DROP FUNCTION IF EXISTS initiatives_users_upsert(json);


-- NOTE: in practice we use this upsert function only for insert (that is, we don't give the id property); if the initiative has a new user, we add it; if it had and now it doesn't, we delete it (instead of updating, which would make much sense)

-- NOTE: here we actually want to be able to do batch insert/update, so the input can be an array of json objects
CREATE FUNCTION initiatives_users_upsert(input json)
RETURNS SETOF initiatives_users AS
$BODY$
DECLARE
	upserted_row initiatives_users%ROWTYPE;
	current_row initiatives_users%ROWTYPE;
	input_obj json;

	-- fields to be used in WHERE clause
	_id INT;
	--_initiative_id INT;
	--_user_id INT;

	-- fields to be inserted or updated	
	_initiative_id INT;
	_user_id INT;
BEGIN

	-- if the json argument is an object, convert it to an array (of 1 object)
	IF  json_typeof(input) = 'object' THEN
		SELECT json_build_array(input) INTO input;
	END IF;

	FOR input_obj IN ( select json_array_elements(input) ) LOOP

		SELECT input_obj->>'id' INTO _id;
		SELECT input_obj->>'initiative_id' INTO _initiative_id;
		SELECT input_obj->>'user_id' INTO _user_id;

		-- for tables with surrogate primary key (serial),
		-- if an id is not given, the intention is to create/insert a new row; 
		-- otherwise, the intention is always to update an existing row; in other words
		-- we can't insert a new row with a pre-defined id
		IF _id IS NULL THEN
			SELECT nextval(pg_get_serial_sequence('initiatives_users', 'id')) INTO _id;		
		ELSE

			-- add an explicit row lock
			SELECT * FROM initiatives_users where id = _id FOR UPDATE INTO current_row;

			IF current_row.id IS NULL THEN
				RETURN;
			END IF;
		END IF;

		--raise notice 'current: %s', current_row.email;
		--raise notice 'to be inserted or updated: %s', COALESCE(input_obj->>'email', current_row.email);
		SELECT COALESCE((input_obj->>'initiative_id')::int, current_row.initiative_id) INTO _initiative_id;
		SELECT COALESCE((input_obj->>'user_id')::int,  current_row.user_id)  INTO _user_id;

		-- todo: add entry to the session history

		INSERT INTO initiatives_users(
			id,
			initiative_id,
			user_id
			)
		VALUES (
			_id,
			_initiative_id,
			_user_id
			)
		ON CONFLICT (id) DO UPDATE SET 
			initiative_id = EXCLUDED.initiative_id,
			user_id = EXCLUDED.user_id
		RETURNING 
			*
		INTO STRICT 
			upserted_row;

		RETURN NEXT upserted_row;

	END LOOP;



RETURN;
END;
$BODY$
LANGUAGE plpgsql;

/*

EXAMPLES:

select * from initiatives_users


to create a new row, the id property should be missing


select * from initiatives_users_upsert('{
	"initiative_id": 6,
	"user_id": 2
}');


for this function we can also do batch-processing (array of objects)

select * from initiatives_users_upsert('[
{
	"initiative_id": 1,
	"user_id": 1
},
{
	"initiative_id": 6,
	"user_id": 2
}
]');



to update one or more fields of an existing row, the id property should be given;
note that only the given properties will be updated; 
in practice this is not used

select * from initiatives_users_upsert('{
    "id": 4,
    "user_id": 2
}');


*/



-- delete by id; in practice we use the delete2 function below (delete by initiative_id and user_id)

DROP FUNCTION IF EXISTS initiatives_users_delete(json);

CREATE FUNCTION initiatives_users_delete(input json)
RETURNS TABLE(deleted_id int) AS
$$
DECLARE
	deleted_row initiatives_users%ROWTYPE;
	input_obj json;

	-- fields to be used in WHERE clause
	_id INT;
BEGIN

	-- if the json argument is an object, convert it to an array (of 1 object)
	IF  json_typeof(input) = 'object' THEN
	    SELECT json_build_array(input) INTO input;
	END IF;

	FOR input_obj IN ( select json_array_elements(input) ) LOOP

		-- extract values to be used in the WHERE clause
		SELECT (input_obj->>'id')::int INTO _id;

		DELETE FROM initiatives_users
		WHERE id = _id
		RETURNING *
		INTO deleted_row;

		deleted_id   := deleted_row.id;

		IF deleted_row.id IS NOT NULL THEN
			SELECT deleted_row.id INTO deleted_id;
			RETURN NEXT;
		END IF;

	END LOOP;

RETURN;
END;
$$
LANGUAGE plpgsql;

/*
select * from initiatives_users




select * from initiatives_users_delete('{"id": 4}');

select * from initiatives_users_delete('[
    {"id": 10}, 
    {"id": 11}
]');

*/



-- this is a second version of the delete function; it is meant to be delete
-- rows by giving the compound key (initiative_id, user_id)
DROP FUNCTION IF EXISTS initiatives_users_delete2(json);

CREATE FUNCTION initiatives_users_delete2(input json)
RETURNS TABLE(deleted_id int) AS
$$
DECLARE
	deleted_row initiatives_users%ROWTYPE;
	input_obj json;

	-- fields to be used in WHERE clause
	_initiative_id INT;
	_user_id INT;
BEGIN

	-- if the json argument is an object, convert it to an array (of 1 object)
	IF  json_typeof(input) = 'object' THEN
	    SELECT json_build_array(input) INTO input;
	END IF;

	FOR input_obj IN ( select json_array_elements(input) ) LOOP

		-- extract values to be used in the WHERE clause
		SELECT input_obj->>'initiative_id' INTO _initiative_id;
		SELECT input_obj->>'user_id' INTO _user_id;
		
		DELETE FROM initiatives_users
		WHERE initiative_id = _initiative_id AND user_id = _user_id
		RETURNING *
		INTO deleted_row;

		deleted_id   := deleted_row.id;

		IF deleted_row.id IS NOT NULL THEN
			SELECT deleted_row.id INTO deleted_id;
			RETURN NEXT;
		END IF;

	END LOOP;

RETURN;
END;
$$
LANGUAGE plpgsql;

/*
select * from initiatives_users

select * from initiatives_users_delete2('{"initiative_id": 6, "user_id": 2}');

select * from initiatives_users_delete2('[
    {"initiative_id": 1, "user_id": 1},
    {"initiative_id": 2, "user_id": 2}
]');


*/
