create function public.line_cover_key(name text, licence text)
returns text
language sql
immutable
set search_path = ''
as $$
	select nullif(
		left(
			regexp_replace(
				translate(
					case
						when licence = 'pokemon' then
							regexp_replace(
								regexp_replace(lower(coalesce(name, '')), '\s+', '-', 'g'),
								'[.''’:?%]|-totem|-antique',
								'',
								'g'
							)
						else lower(coalesce(name, ''))
					end,
					'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
					'aaaaaaceeeeiiiinooooouuuuyy'
				),
				'[^a-z0-9_.-]',
				'',
				'g'
			),
			64
		),
		''
	);
$$;

create function public.line_default_cover(data jsonb, licence text)
returns text
language sql
immutable
set search_path = ''
as $$
	with levels as (
		select
			i as level_index,
			lower(coalesce(
				data -> 'levels' ->> i,
				(array['baby I', 'baby II', 'rookie', 'champion', 'ultimate', 'mega', 'mega+', 'ultra'])[i + 1],
				''
			)) as level
		from generate_series(
			0,
			greatest(
				case
					when jsonb_typeof(data -> 'levels') = 'array' then jsonb_array_length(data -> 'levels')
					else 0
				end,
				8
			) - 1
		) as i
	),
	rookie as (
		select min(level_index) as level_index
		from levels
		where level = 'rookie' and licence = 'digimon'
	),
	points as (
		select
			c.column_index,
			p.level_index - 1 as level_index,
			public.line_cover_key(p.point ->> 'name', licence) as cover
		from jsonb_array_elements(
			case when jsonb_typeof(data -> 'columns') = 'array' then data -> 'columns' else '[]' end
		) with ordinality as c (col, column_index)
		cross join lateral jsonb_array_elements(
			case when jsonb_typeof(c.col) = 'array' then c.col else '[]' end
		) with ordinality as p (point, level_index)
		where jsonb_typeof(p.point) = 'object'
			and not (p.point ? 'image')
			and lower(p.point ->> 'name') not in ('upload', 'url', 'unknown')
	)
	select pt.cover
	from points pt
	left join rookie r on true
	where pt.cover is not null
	order by
		(pt.level_index is distinct from r.level_index),
		pt.level_index,
		pt.column_index
	limit 1;
$$;

create function public.set_default_line_cover()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	if new.cover is null or new.cover in ('upload', 'url', 'unknown') then
		new.cover := public.line_default_cover(new.data, new.licence);
	end if;
	return new;
end;
$$;

revoke execute on function public.set_default_line_cover()
	from public, anon, authenticated;

create trigger user_lines_default_cover
	before insert or update on public.user_lines
	for each row execute function public.set_default_line_cover();

alter table public.user_lines disable trigger user_lines_set_updated_at;

update public.user_lines
set cover = public.line_default_cover(data, licence)
where cover is null or cover in ('upload', 'url', 'unknown');

alter table public.user_lines enable trigger user_lines_set_updated_at;
