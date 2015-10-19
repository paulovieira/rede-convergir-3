
CREATE TABLE IF NOT EXISTS config( 
	id SERIAL PRIMARY KEY,
	key TEXT NOT NULL UNIQUE,
	value JSONB NOT NULL

	--CONSTRAINT config_value_must_be_object CHECK (jsonb_typeof(value) = 'object')
);


DO $$
DECLARE
	_has_executed BOOLEAN;
	_table_exists BOOLEAN;
	_flag TEXT := 'create_table_config';
	_table_name TEXT := 'config';
BEGIN

	-- get the flag for this file
	SELECT EXISTS (
		SELECT 1 FROM code_has_executed WHERE code = _flag
	) INTO _has_executed;

	-- check if the table exists
	SELECT EXISTS (
	   SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = _table_name
	) INTO _table_exists;

	if _table_exists is true AND _has_executed is false then

		-- the following sql lines will be executed only the first time this file is run
		PERFORM setval(pg_get_serial_sequence('config', 'id'), 1000);
		PERFORM audit.audit_table('config');

		-- add the flag to the table
		INSERT INTO code_has_executed(code) VALUES(_flag);
	end if;
END
$$

