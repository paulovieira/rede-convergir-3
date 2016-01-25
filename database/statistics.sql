-- nº iniciativas / tipo

select 
    (select title->'pt' from definitions where id = type_id) as type_title,
    --type_id, 
    count(id) as n
from initiatives 
where moderation_status_id = 'moderation_status_002_approved'
group by type_id
order by n desc


-- nº iniciativas e nº pessoas / ano

select 
    date_part('year', start_date) as initiative_start_date,
    count(id) as n,
    sum(group_size::int) as n_pessoas
from initiatives 
where moderation_status_id = 'moderation_status_002_approved'
group by initiative_start_date
order by initiative_start_date


-- nº iniciativas / domínio

select 
    id.definition_id, 
    (select title->'pt' from definitions where id = id.definition_id) as domain_title,
    count(i.name) as n
from initiatives i
inner join initiatives_definitions id
on i.id = id.initiative_id
where id.definition_id like 'domain%' and i.moderation_status_id = 'moderation_status_002_approved'
group by id.definition_id
order by n desc


-- nº iniciativas / público-alvo

select 
    id.definition_id, 
    (select title->'pt' from definitions where id = id.definition_id) as domain_title,
    count(i.name) as n
from initiatives i
inner join initiatives_definitions id
on i.id = id.initiative_id
where id.definition_id like 'target%' and i.moderation_status_id = 'moderation_status_002_approved'
group by id.definition_id
order by n desc


-- nº iniciativas / código postal (considerando apenas o 1º dígito do cp)
-- see: https://en.wikipedia.org/wiki/Postal_codes_in_Portugal

select 
    substr(postal_code, 0, 2)::int as pc,
    count(id) as n
from initiatives
where moderation_status_id = 'moderation_status_002_approved'
group by pc
order by pc

