CREATE TABLE IF NOT EXISTS config( 
	--id SERIAL PRIMARY KEY,
	key TEXT PRIMARY KEY,
	value JSONB NOT NULL
);

SELECT audit.audit_table('config');
