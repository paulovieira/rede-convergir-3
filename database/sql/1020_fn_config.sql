
/*

	1. READ

*/


-- NOTE: we explicitely execute a DROP FUNCTION (instead of CREATE OR REPLACE) because the replacement will not work if the arguments changes; by calling DROP we make sure the function definition will really be updated

DROP FUNCTION IF EXISTS config_read(json);

CREATE FUNCTION config_read(options json DEFAULT '[{}]')

-- return table using the definition of the config table
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

	-- fields to be used in WHERE clause
	_key TEXT;
BEGIN

-- convert the json argument from object to array of (one) objects
IF  json_typeof(options) = 'object'::text THEN
	options = ('[' || options::text ||  ']')::json;
END IF;

FOR input_obj IN ( select json_array_elements(options) ) LOOP

	command := 'SELECT key, value FROM config ';
			
	-- extract values to be (optionally) used in the WHERE clause
	SELECT input_obj->>'key' INTO _key;
	
	number_conditions := 0;
	
	-- criteria: key
	IF _key IS NOT NULL THEN
		IF number_conditions = 0 THEN  command = command || ' WHERE';  
		ELSE                           command = command || ' AND';
		END IF;

		command = command || format(' key = %L', _key);
		number_conditions := number_conditions + 1;
	END IF;

	
	command := command || ' ORDER BY key;';

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

	-- fields to be used in WHERE clause
	_key TEXT;

	-- fields to be inserted or updated	
	_value JSON;
BEGIN

	SELECT input_obj->>'key'   INTO _key;
	SELECT input_obj->>'value' INTO _value;

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

EXAMPLES:

select * from config

select * from config_delete('{"key": "key6"}');

*/
