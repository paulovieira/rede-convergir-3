
/*

	1. READ

*/


DROP FUNCTION IF EXISTS definitions_read(json);

CREATE FUNCTION definitions_read(input json DEFAULT '[{}]')

-- return table using the smae columns of the definitions table
RETURNS TABLE(
	id TEXT,
	title JSONB,
	description JSONB
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

	command := 'SELECT d.* 
				FROM definitions d
				WHERE true ';
	
	-- criteria: id
	IF input_obj->>'id' IS NOT NULL THEN
		command = command || format(' AND d.id = %L ', input_obj->>'id');
	END IF;

	-- criteria: id_starts_with
	IF input_obj->>'id_starts_with' IS NOT NULL THEN
		-- we are using the position utility function instead of " id LIKE %...'"
		-- (much easier to read)
		command = command || format(' AND position(%L in d.id) = 1 ', input_obj->>'id_starts_with');
	END IF;

	-- the id field is a text code which should have a number with the correct order (to be adjusted manually)
	command := command || ' ORDER BY d.id asc;';

	--raise notice 'command: %', command;

	RETURN QUERY EXECUTE command;

END LOOP;
		
RETURN;
END;
$BODY$
LANGUAGE plpgsql;

/*

EXAMPLES:

        
        
        
        

insert into definitions values
	('type_permaculture', '{"pt": "Permacultura"}', '{"pt": "Projectos integrais que visem a cultura permanente."}'),
	('type_transicao', '{"pt": "Transição"}', '{"pt": "Iniciativas sociais que facilitem a transição da comunidade para uma visão positiva."}'),
	('domain_agriculture', '{"pt": "Agricultura"}', '{"pt": "Agricultura - biológica ou natural; "}')


        


select * from definitions;

select * from  definitions_read('{"id": "type_transition"}');

select * from  definitions_read('[{"id": "type_transition"}, {"id": "type_permaculture"}]');

select * from  definitions_read('{"id_starts_with": "type"}');



*/



DROP FUNCTION IF EXISTS definitions_upsert(json);

CREATE FUNCTION definitions_upsert(input_obj json)
RETURNS SETOF definitions AS
$BODY$
DECLARE
	upserted_row definitions%ROWTYPE;
	current_row definitions%ROWTYPE;

	-- fields to be used in WHERE clause
	_id TEXT;

	-- fields to be inserted or updated	
	_title JSONB;
	_description JSONB;
BEGIN

	
	SELECT input_obj->>'id' INTO _id;

	if _id IS NULL THEN
		RETURN;
	END IF;

	-- add an explicit row lock (if the row does not exist, it won't have effect)
	SELECT * FROM definitions where id = _id FOR UPDATE INTO current_row;
		

	--raise notice 'current: %s', current_row.email;
	--raise notice 'to be inserted or updated: %s', COALESCE(input_obj->>'email', current_row.email);

	SELECT COALESCE((input_obj->>'title')::jsonb,       current_row.title)       INTO _title;
	SELECT COALESCE((input_obj->>'description')::jsonb, current_row.description) INTO _description;

	INSERT INTO definitions(
		id,
		title,
		description
		)
	VALUES (
		_id,
		_title,
		_description
		)
	ON CONFLICT (id) DO UPDATE SET 
		title = EXCLUDED.title,
		description = EXCLUDED.description
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

select * from definitions


in this case the id property should always be present, either for creating a new row or updating
(because the id is not of type "serial", it is a simple "text", which must be unique)


create a new definition:

select * from definitions_upsert('{
	"id": "type_xyz",
	"title": {"pt": "xxx"},
	"description": {"pt": "yyy"}
}');


update only the title:

select * from definitions_upsert('{
	"id": "type_xyz",
	"title": {"pt": "zzz"}
}');



*/





DROP FUNCTION IF EXISTS definitions_delete(json);

CREATE FUNCTION definitions_delete(input_obj json)
RETURNS TABLE(deleted_id TEXT) AS
$$
DECLARE
	deleted_row definitions%ROWTYPE;

	-- fields to be used in WHERE clause
	_id TEXT;
BEGIN

	-- extract values to be used in the WHERE clause
	SELECT input_obj->>'id' INTO _id;

	DELETE FROM definitions
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
select * from definitions

select * from definitions_delete('{"id": "type_xyz"}');

*/
