CREATE TABLE IF NOT EXISTS initiatives_users(
	id            serial unique not null,
	initiative_id int references initiatives(id) on update cascade on delete cascade,
	user_id       int references users(id)       on update cascade on delete cascade,

	primary key(initiative_id, user_id)
);

SELECT audit.audit_table('initiatives_users');
