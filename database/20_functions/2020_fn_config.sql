
/*

	1. READ

*/


-- NOTE: we explicitely execute a DROP FUNCTION (instead of CREATE OR REPLACE) because the replacement will not work if the arguments changes; by calling DROP we make sure the function definition will really be updated

DROP FUNCTION IF EXISTS config_read(json);

CREATE FUNCTION config_read(input json DEFAULT '[{}]')

-- return table using the smae columns of the config table
RETURNS TABLE(
	key TEXT,
	value JSONB
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

	command := 'SELECT * 
				FROM config 
				WHERE true ';

	-- criteria: key
	IF input_obj->>'key' IS NOT NULL THEN
		command = command || format(' AND key = %L', input_obj->>'key');
	END IF;
	
	command := command || ' ORDER BY key;';

	RETURN QUERY EXECUTE command;

END LOOP;
		
RETURN;
END;
$BODY$
LANGUAGE plpgsql;

/*

EXAMPLES:

insert into config (key, value) values
	('key1',  '"paulovieira@gmail.com"'),
	('key2',  '{"name": "paulovieira@gmail.com"}'),
	('key3',  '[{ "x1": "a_paulovieira@gmail.com" },{ "x2": "b_paulovieira@gmail.com" }]'),
	('key4',  '[[{ "name": "xpaulovieira@gmail.com" },{ "name": "ypaulovieira@gmail.com" }], [{ "name": "zpaulovieira@gmail.com" }]]')


select * from config

select * from  config_read('{"key": "key2"}');
select * from  config_read('[{"key": "key1"}, {"key": "key5"}]');
select * from  config_read('{}');


*/




DROP FUNCTION IF EXISTS config_upsert(json);

CREATE FUNCTION config_upsert(input_obj json)
RETURNS SETOF config AS
$BODY$
DECLARE
	upserted_row config%ROWTYPE;
	current_row config%ROWTYPE;

	-- fields to be used in WHERE clause
	_key TEXT;

	-- fields to be inserted or updated	
	_value JSON;
BEGIN

	_key := input_obj->>'key';
	if _key IS NULL THEN
		RETURN;
	END IF;

	-- add an explicit row lock (if the row does not exist, it won't have effect)
	SELECT * FROM config where key = _key FOR UPDATE INTO current_row;

	_value := COALESCE((input_obj->>'value')::jsonb, current_row.value);

	INSERT INTO config(
		key,
		value
		)
	VALUES (
		_key,
		_value
		)
	ON CONFLICT (key) DO UPDATE SET 
		value = EXCLUDED.value
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

select * from config

select * from config_upsert('{
	"key": "key6",
	"value": {"name": "paulovieira@gmail.com" }
}');

select * from config_upsert('{
	"key": "key7",
	"value": [{ "x1": "paulovieira@gmail.com" },{ "x2": "paulovieira@gmail.com" }]
}');

select * from config_upsert('{
	"key": "key8",
	"value": [[{ "name": "paulovieira@gmail.com" },{ "name": "paulovieira@gmail.com" }], [{ "name": "paulovieira@gmail.com" }]]
}');

IMPORTANTE: if the value is a simple string, we have escape the commas (this is done by JSON.stringying 2 times)

select * from config_upsert('{
	"key": "key5",
	"value": "\"paulovieira@gmail.com\""
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
	_key := input_obj->>'key';

	DELETE FROM config
	WHERE key = _key
	RETURNING *
	INTO deleted_row;

	IF deleted_row.key IS NOT NULL THEN
		SELECT deleted_row.key INTO deleted_key;
		RETURN NEXT;
	END IF;

RETURN;
END;
$$
LANGUAGE plpgsql;


/*

EXAMPLES:

select * from config

select * from config_delete('{"key": "key6"}');

*/
