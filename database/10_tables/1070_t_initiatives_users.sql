DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;


/*** BEGIN CODE FOR CHANGES  ***/

CREATE TABLE initiatives_users(
	id            serial unique not null,
	initiative_id int references initiatives(id) on update cascade on delete cascade,
	user_id       int references users(id)       on update cascade on delete cascade,

	primary key(initiative_id, user_id)
);

/*** END CODE FOR CHANGES  ***/

END;
$$;

SELECT audit.audit_table('initiatives_users');
