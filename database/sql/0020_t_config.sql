CREATE TABLE IF NOT EXISTS config( 
	--id SERIAL PRIMARY KEY,
	key TEXT PRIMARY KEY,
	value JSONB NOT NULL
);

--PERFORM audit.audit_table('config');
SELECT audit.audit_table('config');
