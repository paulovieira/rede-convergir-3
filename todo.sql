
INSERT INTO _v.patches (
    patch_name,
    applied_tsz,
    applied_by,
    requires,
    conflicts,
    description )
VALUES (
    'premiere',
    now(),
    current_user,
    coalesce( NULL, '{}'::text[] ),
    coalesce( NULL, '{}'::text[] ),
    'initial database design');
