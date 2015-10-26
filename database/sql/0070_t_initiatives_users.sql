CREATE TABLE IF NOT EXISTS initiatives_users(
	id         serial,
	initiative_id int references initiatives(id) on update cascade on delete cascade,
	user_id       int references users(id)       on update cascade on delete cascade,

	primary key(initiative_id, user_id)
);

-- PERFORM audit.audit_table('initiatives_users');
SELECT audit.audit_table('initiatives_users');
