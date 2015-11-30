
/*

	1. READ

*/


DROP FUNCTION IF EXISTS initiatives_definitions_read(json);

CREATE FUNCTION initiatives_definitions_read(input json DEFAULT '[{}]')

-- return table using the smae columns of the initiatives_definitions table
RETURNS TABLE(
	id INT,
	initiative_id INT,
	definition_id TEXT
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
				FROM initiatives_definitions i
				WHERE true ';

	-- criteria: id
	IF input_obj->>'id' IS NOT NULL THEN
		command = command || format(' AND i.id = %L ', input_obj->>'id');
	END IF;

	-- criteria: initiative_id
	IF input_obj->>'initiative_id' IS NOT NULL THEN
		command = command || format(' AND initiative_id = %L ', input_obj->>'initiative_id');
	END IF;

	-- criteria: definition_id 
	IF input_obj->>'definition_id' IS NOT NULL THEN
		command = command || format(' AND definition_id = %L ', input_obj->>'definition_id');
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

insert into initiatives_definitions values
	(default, 1, 'type_permaculture'),
	(default, 1, 'type_transicao')


select * from  initiatives_definitions_read('{"initiative_id": 1, "definition_id": "type_permaculture"}');

select * from  initiatives_definitions_read('{"definition_id": "type_permaculture"}');

select * from  initiatives_definitions_read('[{"definition_id": "type_permaculture"}, {"definition_id": "type_transicao"}]');


*/



DROP FUNCTION IF EXISTS initiatives_definitions_upsert(json);


-- NOTE: in practice we use this upsert function only for insert (that is, we don't give the id property); if the initiative has a new definition, we add it; if it had and now it doesn't, we delete it (instead of updating, which would make much sense)

-- NOTE: here we actually want to be able to do batch insert/update, so the input can be an array of json objects
CREATE FUNCTION initiatives_definitions_upsert(input json)
RETURNS SETOF initiatives_definitions AS
$BODY$
DECLARE
	upserted_row initiatives_definitions%ROWTYPE;
	current_row initiatives_definitions%ROWTYPE;
	input_obj json;

	-- fields to be used in WHERE clause
	_id INT;
	--_initiative_id INT;
	--_definition_id TEXT;

	-- fields to be inserted or updated	
	_initiative_id INT;
	_definition_id TEXT;
BEGIN

	-- if the json argument is an object, convert it to an array (of 1 object)
	IF  json_typeof(input) = 'object' THEN
	    input := json_build_array(input);
	END IF;

	FOR input_obj IN ( select json_array_elements(input) ) LOOP

		_id            := (input_obj->>'id')::int;
		_initiative_id := (input_obj->>'initiative_id')::int;
		_definition_id := input_obj->>'definition_id';

		-- for tables with surrogate primary key (serial),
		-- if an id is not given, the intention is to create/insert a new row; 
		-- otherwise, the intention is always to update an existing row; in other words
		-- we can't insert a new row with a pre-defined id
		IF _id IS NULL THEN
			_id := nextval(pg_get_serial_sequence('initiatives_definitions', 'id'));
		ELSE

			-- add an explicit row lock
			SELECT * FROM initiatives_definitions where id = _id FOR UPDATE INTO current_row;

			IF current_row.id IS NULL THEN
				RETURN;
			END IF;
		END IF;

		--raise notice 'current: %s', current_row.email;
		--raise notice 'to be inserted or updated: %s', COALESCE(input_obj->>'email', current_row.email);
		_initiative_id := COALESCE((input_obj->>'initiative_id')::int, current_row.initiative_id);
		_definition_id := COALESCE(input_obj->>'definition_id',  current_row.definition_id);

		-- todo: add entry to the session history

		INSERT INTO initiatives_definitions(
			id,
			initiative_id,
			definition_id
			)
		VALUES (
			_id,
			_initiative_id,
			_definition_id
			)
		ON CONFLICT (id) DO UPDATE SET 
			initiative_id = EXCLUDED.initiative_id,
			definition_id = EXCLUDED.definition_id
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

select * from initiatives_definitions


to create a new row, the id property should be missing


select * from initiatives_definitions_upsert('{
	"initiative_id": 6,
	"definition_id": "type_permaculture"
}');


for this function we can also do batch-processing (array of objects)

select * from initiatives_definitions_upsert('[
{
	"initiative_id": 1,
	"definition_id": "type_permaculture"
},
{
	"initiative_id": 1,
	"definition_id": "type_transicao"
}
]');


to update one or more fields of an existing row, the id property should be given;
note that only the given properties will be updated; 
in practice this is not used

select * from initiatives_definitions_upsert('{
    "id": 10,
    "initiative_id": 6
}');


*/



-- delete by id; in practice we use the delete2 function below (delete by initiative_id and definition_id)

DROP FUNCTION IF EXISTS initiatives_definitions_delete(json);

CREATE FUNCTION initiatives_definitions_delete(input json)
RETURNS TABLE(deleted_id int) AS
$$
DECLARE
	deleted_row initiatives_definitions%ROWTYPE;
	input_obj json;

	-- fields to be used in WHERE clause
	_id INT;
BEGIN

	-- if the json argument is an object, convert it to an array (of 1 object)
	IF  json_typeof(input) = 'object' THEN
		input := json_build_array(input);
	END IF;

	FOR input_obj IN ( select json_array_elements(input) ) LOOP

		-- extract values to be used in the WHERE clause
		_id := (input_obj->>'id')::int;

		DELETE FROM initiatives_definitions
		WHERE id = _id
		RETURNING *
		INTO deleted_row;

		deleted_id   := deleted_row.id;

		IF deleted_row.id IS NOT NULL THEN
			-- can we change here to the "deleted_id := deleted_row.id" syntax?
			SELECT deleted_row.id INTO deleted_id;
			RETURN NEXT;
		END IF;

	END LOOP;

RETURN;
END;
$$
LANGUAGE plpgsql;

/*
select * from initiatives_definitions




select * from initiatives_definitions_delete('{"id": 4}');

select * from initiatives_definitions_delete('[
    {"id": 10}, 
    {"id": 11}
]');

*/



-- this is a second versino of the delete function; it is meant to be delete
-- rows by giving the compound key (initiative_id, definition_id)
DROP FUNCTION IF EXISTS initiatives_definitions_delete2(json);

CREATE FUNCTION initiatives_definitions_delete2(input json)
RETURNS TABLE(deleted_id int) AS
$$
DECLARE
	deleted_row initiatives_definitions%ROWTYPE;
	input_obj json;

	-- fields to be used in WHERE clause
	_initiative_id INT;
	_definition_id TEXT;
BEGIN

	-- if the json argument is an object, convert it to an array (of 1 object)
	IF  json_typeof(input) = 'object' THEN
		input := json_build_array(input);
	END IF;

	FOR input_obj IN ( select json_array_elements(input) ) LOOP

		-- extract values to be used in the WHERE clause
		_initiative_id := (input_obj->>'initiative_id')::int;
		_definition_id := input_obj->>'definition_id';
		
		DELETE FROM initiatives_definitions
		WHERE initiative_id = _initiative_id AND definition_id = _definition_id
		RETURNING *
		INTO deleted_row;

		deleted_id   := deleted_row.id;

		IF deleted_row.id IS NOT NULL THEN
			-- can we change here to the "deleted_id := deleted_row.id" syntax?
			SELECT deleted_row.id INTO deleted_id;
			RETURN NEXT;
		END IF;

	END LOOP;

RETURN;
END;
$$
LANGUAGE plpgsql;

/*
select * from initiatives_definitions

select * from initiatives_definitions_delete2('{"initiative_id": 6, "definition_id": "type_permaculture"}');

select * from initiatives_definitions_delete2('[
    {"initiative_id": 1, "definition_id": "type_permaculture"},
    {"initiative_id": 1, "definition_id": "type_transicao"}
]');


*/
