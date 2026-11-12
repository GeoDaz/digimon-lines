create function public.line_is_empty(data jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
	select not exists (
		select 1
		from jsonb_path_query(data, '$.columns[*][*] ? (@.type() == "object")') as point
		where (
			jsonb_typeof(point -> 'image') = 'string'
			and btrim(point ->> 'image') <> ''
			and lower(btrim(point ->> 'image')) not like 'data:%'
		) or (
			jsonb_typeof(point -> 'name') = 'string'
			and btrim(point ->> 'name') <> ''
			and lower(btrim(point ->> 'name')) not in ('upload', 'url', 'unknown')
		)
	);
$$;

delete from public.user_lines
where is_public
	and not exists (
		select 1
		from jsonb_path_query(data, '$.columns[*][*] ? (@.type() == "object")') as point
	);

alter table public.user_lines disable trigger user_lines_set_updated_at;

update public.user_lines
set is_public = false
where is_public and public.line_is_empty(data);

alter table public.user_lines enable trigger user_lines_set_updated_at;

alter table public.user_lines
	add constraint user_lines_public_not_empty
	check (not is_public or not public.line_is_empty(data));
