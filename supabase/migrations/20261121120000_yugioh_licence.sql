alter table public.user_lines drop constraint user_lines_licence_check;

alter table public.user_lines
	add constraint user_lines_licence_check
	check (licence in ('digimon', 'pokemon', 'yugioh'));

create or replace function public.line_cover_key(name text, licence text)
returns text
language sql
immutable
set search_path = ''
as $$
	select case
		when licence = 'yugioh' then
			nullif(left(lower(btrim(coalesce(name, ''))), 100), '')
		else
			nullif(
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
			)
	end;
$$;
