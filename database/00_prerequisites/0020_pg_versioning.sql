BEGIN;

-- This file adds versioning support to database it will be loaded to.
-- It requires that PL/pgSQL is already loaded - will raise exception otherwise.
-- All versioning "stuff" (tables, functions) is in "_v" schema.

-- All functions are defined as 'RETURNS SETOF INT4' to be able to make them to RETURN literaly nothing (0 rows).
-- >> RETURNS VOID<< IS similar, but it still outputs "empty line" in psql when calling.
CREATE SCHEMA IF NOT EXISTS _v;
COMMENT ON SCHEMA _v IS 'Schema for versioning data and functionality.';

CREATE TABLE IF NOT EXISTS _v.patches (
    patch_name  TEXT        PRIMARY KEY,
    applied_tsz TIMESTAMPTZ NOT NULL DEFAULT now(),
    applied_by  TEXT        NOT NULL,
    requires    TEXT[],
    conflicts   TEXT[],
    description TEXT
);
COMMENT ON TABLE _v.patches              IS 'Contains information about what patches are currently applied on database.';
COMMENT ON COLUMN _v.patches.patch_name  IS 'Name of patch, has to be unique for every patch.';
COMMENT ON COLUMN _v.patches.applied_tsz IS 'When the patch was applied.';
COMMENT ON COLUMN _v.patches.applied_by  IS 'Who applied this patch (PostgreSQL username)';
COMMENT ON COLUMN _v.patches.requires    IS 'List of patches that are required for given patch.';
COMMENT ON COLUMN _v.patches.conflicts   IS 'List of patches that conflict with given patch.';
COMMENT ON COLUMN _v.patches.description IS 'Description of the patch.';

CREATE OR REPLACE FUNCTION _v.register_patch( IN in_patch_name TEXT, IN in_requirements TEXT[], in_conflicts TEXT[], in_description TEXT ) 
RETURNS INT4 
AS $$
DECLARE
    t_text   TEXT;
    t_text_a TEXT[];
    i        INT4;
    length   INT4;
BEGIN
    -- Thanks to this we know only one patch will be applied at a time
    LOCK TABLE _v.patches IN EXCLUSIVE MODE;

    SELECT patch_name FROM _v.patches WHERE patch_name = in_patch_name INTO t_text;
    IF t_text IS NOT NULL THEN
        RAISE NOTICE 'Patch "%" is already applied. Skipping.', in_patch_name;
        return 1;
    END IF;

    t_text_a := ARRAY( SELECT patch_name FROM _v.patches WHERE patch_name = any( in_conflicts ) );
    length := coalesce(array_length( t_text_a, 1 ), 0);

    IF length > 0 THEN
        RAISE EXCEPTION 'Versioning patches conflict. Conflicting patche(s) installed: %.', array_to_string( t_text_a, ', ' );
    END IF;

    length := coalesce(array_length( in_requirements, 1 ), 0);

    IF length > 0 THEN
        t_text_a := '{}';

        FOR i IN 1 .. length LOOP
            SELECT patch_name INTO t_text FROM _v.patches WHERE patch_name = in_requirements[i];
            IF NOT FOUND THEN
                t_text_a := t_text_a || in_requirements[i];
            END IF;
        END LOOP;

        length := coalesce(array_length( t_text_a, 1 ), 0);
        IF length > 0 THEN
            RAISE EXCEPTION 'Missing prerequisite(s): %.', array_to_string( t_text_a, ', ' );
        END IF;
    END IF;

    INSERT INTO _v.patches (
        patch_name,
        applied_tsz,
        applied_by,
        requires,
        conflicts,
        description )
    VALUES (
        in_patch_name,
        now(),
        current_user,
        coalesce( in_requirements, '{}' ),
        coalesce( in_conflicts, '{}' ),
        in_description);

    RETURN 0;

END;
$$ language plpgsql;
COMMENT ON FUNCTION _v.register_patch( TEXT, TEXT[], TEXT[], TEXT ) IS 'Function to register patches in database. If the patch is already registered returns early with the value 1. Raises exception if there are conflicts or prerequisites are not installed. ';

CREATE OR REPLACE FUNCTION _v.register_patch( TEXT, TEXT[], TEXT ) 
RETURNS INT4 
AS $$
    SELECT _v.register_patch( $1, $2, NULL, $3 );
$$ language sql;
COMMENT ON FUNCTION _v.register_patch( TEXT, TEXT[], TEXT ) IS 'Wrapper to allow registration of patches without conflicts.';

CREATE OR REPLACE FUNCTION _v.register_patch( TEXT, TEXT ) 
RETURNS INT4 
AS $$
    SELECT _v.register_patch( $1, NULL, NULL, $2 );
$$ language sql;
COMMENT ON FUNCTION _v.register_patch( TEXT, TEXT ) IS 'Wrapper to allow registration of patches without requirements and conflicts.';

CREATE OR REPLACE FUNCTION _v.unregister_patch( in_patch_name TEXT) 
RETURNS INT4 
AS $$
DECLARE
    i        INT4;
    length   INT4;
    t_text_a TEXT[];
BEGIN
    -- Thanks to this we know only one patch will be applied at a time
    LOCK TABLE _v.patches IN EXCLUSIVE MODE;

    t_text_a := ARRAY( SELECT patch_name FROM _v.patches WHERE in_patch_name = ANY( requires ) );
    length := coalesce(array_length( t_text_a, 1 ), 0);

    IF length > 0 THEN
        RAISE EXCEPTION 'Cannot uninstall %, as it is required by: %.', in_patch_name, array_to_string( t_text_a, ', ' );
    END IF;

    DELETE FROM _v.patches WHERE patch_name = in_patch_name;
    GET DIAGNOSTICS i = ROW_COUNT;
    IF i < 1 THEN
        RAISE EXCEPTION 'Patch % is not installed.', in_patch_name;
    END IF;

    RETURN 0;
END;
$$ language plpgsql;
COMMENT ON FUNCTION _v.unregister_patch( TEXT ) IS 'Function to unregister patches in database. Raises exception if the patch is not registered or if unregistering it would break dependencies.';

COMMIT;
