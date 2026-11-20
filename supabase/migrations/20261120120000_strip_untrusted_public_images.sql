create function private.is_untrusted_image(image jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
	select case
		when jsonb_typeof(image) <> 'string' then false
		when btrim(image #>> '{}') = '' then false
		when lower(btrim(image #>> '{}')) like 'data:%' then false
		else coalesce((
			select host = any (array[
				'fandom.com', 'wikia.com', 'wikia.nocookie.net', 'bulbagarden.net',
				'masterduelmeta.com', 'duellinksmeta.com', 'ygoprodeck.com',
				'yugioh-card.com', 'ygorganization.com', 'digimoncard.com',
				'digimoncard.io', 'digimoncard.app', 'digimoncard.dev', 'takaotaku.de',
				'orangeswim.dev', 'cardlist.dev', 'digimon.net'
			])
			or exists (
				select 1
				from unnest(array[
					'fandom.com', 'wikia.com', 'wikia.nocookie.net', 'bulbagarden.net',
					'masterduelmeta.com', 'duellinksmeta.com', 'ygoprodeck.com',
					'yugioh-card.com', 'ygorganization.com', 'digimoncard.com',
					'digimoncard.io', 'digimoncard.app', 'digimoncard.dev', 'takaotaku.de',
					'orangeswim.dev', 'cardlist.dev', 'digimon.net'
				]) as trusted
				where host like '%.' || trusted
			)
			or host ~ '(wiki|pedia)'
			from (
				select lower(substring(
					btrim(image #>> '{}')
					from '^[hH][tT][tT][pP][sS]://([^/?#@\\:]+)(?::[0-9]+)?(?:[/?#]|$)'
				)) as host
			) as parsed
			where host is not null
		), false) is false
	end;
$$;

create function private.strip_untrusted_point(point jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
	select case
		when jsonb_typeof(point) <> 'object' then point
		else (
			case
				when private.is_untrusted_image(point -> 'image') then point - 'image'
				else point
			end
		) || (
			case
				when jsonb_typeof(point -> 'skins') = 'array' then jsonb_build_object(
					'skins',
					(
						select coalesce(jsonb_agg(
							case
								when jsonb_typeof(skin) = 'object'
									and private.is_untrusted_image(skin -> 'image')
								then skin - 'image'
								else skin
							end
							order by position
						), '[]'::jsonb)
						from jsonb_array_elements(point -> 'skins')
							with ordinality as skins(skin, position)
					)
				)
				else '{}'::jsonb
			end
		)
	end;
$$;

create function private.strip_untrusted_images(data jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
	select case
		when jsonb_typeof(data -> 'columns') <> 'array' then data
		else jsonb_set(data, '{columns}', (
			select coalesce(jsonb_agg(
				case
					when jsonb_typeof(col) = 'array' then (
						select coalesce(jsonb_agg(
							private.strip_untrusted_point(point) order by row_position
						), '[]'::jsonb)
						from jsonb_array_elements(col)
							with ordinality as points(point, row_position)
					)
					else col
				end
				order by col_position
			), '[]'::jsonb)
			from jsonb_array_elements(data -> 'columns')
				with ordinality as cols(col, col_position)
		))
	end;
$$;

create function public.strip_public_line_untrusted_images()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	if new.is_public then
		new.data := private.strip_untrusted_images(new.data);
	end if;
	return new;
end;
$$;

revoke execute on function public.strip_public_line_untrusted_images()
	from public, anon, authenticated;

alter table public.user_lines disable trigger user_lines_set_updated_at;

update public.user_lines
set is_public = false
where is_public
	and public.line_is_empty(private.strip_untrusted_images(data));

update public.user_lines
set data = private.strip_untrusted_images(data)
where is_public
	and data is distinct from private.strip_untrusted_images(data);

alter table public.user_lines enable trigger user_lines_set_updated_at;

create trigger user_lines_strip_untrusted_images
	before insert or update of data, is_public on public.user_lines
	for each row execute function public.strip_public_line_untrusted_images();
