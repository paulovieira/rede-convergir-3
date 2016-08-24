DO $$

DECLARE
patch_exists int := _v.register_patch('premiere', 'initial database design');

BEGIN

IF patch_exists THEN
    RETURN;
END IF;


/* the actual code to change to the database starts here */


CREATE TABLE initiatives_users(
	id            serial unique not null,
	initiative_id int references initiatives(id) on update cascade on delete cascade,
	user_id       int references users(id)       on update cascade on delete cascade,

	primary key(initiative_id, user_id)
);

END;
$$;

SELECT audit.audit_table('initiatives_users');
