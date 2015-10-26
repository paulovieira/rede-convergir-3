CREATE TABLE IF NOT EXISTS config( 
	id SERIAL PRIMARY KEY,
	key TEXT NOT NULL UNIQUE,
	value JSONB NOT NULL
);

--PERFORM audit.audit_table('config');
SELECT audit.audit_table('config');
