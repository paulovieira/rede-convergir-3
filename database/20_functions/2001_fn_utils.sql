DROP FUNCTION IF EXISTS get_random_string(INT);

CREATE FUNCTION get_random_string(length INT DEFAULT 5)
RETURNS TEXT AS
$BODY$
BEGIN

    RETURN left(left(md5(random()::text), 5), length);

END;
$BODY$
LANGUAGE plpgsql;

-- select get_random_string(5);



DROP FUNCTION IF EXISTS get_default(text, text);

create or replace function get_default(_table_name text, _column_name text) 
returns text
as
$$
declare r record;
s text;
begin

    s = 'SELECT (' || coalesce(

    (select column_default 
    from information_schema.columns 
    where table_schema = 'public' 
    and table_name = _table_name 
    and column_name = _column_name)

    , 'NULL') || ')::text as default';

	raise notice '%', s;
    EXECUTE s into r;
    return r.default;
end;
$$
language 'plpgsql';
