-- Correctif : le pseudo dérivé d'un compte Discord héritait du discriminant.
--
-- Discord renvoie `name = "azeralt#0"` (le `#0` du nouveau système signifiant
-- « sans discriminant »), et le nettoyage des caractères transformait le `#` en
-- `_`, donnant `azeralt_0` alors que `azeralt` était libre. On retire donc le
-- discriminant avant d'assainir, pas après.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
	base text;
	candidate text;
	suffix int := 0;
begin
	base := lower(coalesce(
		new.raw_user_meta_data ->> 'preferred_username',
		new.raw_user_meta_data ->> 'user_name',
		new.raw_user_meta_data ->> 'name',
		new.raw_user_meta_data ->> 'full_name',
		nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
		'dresseur'
	));

	-- Discriminant Discord (`pseudo#1234`, `pseudo#0`) : il ne fait pas partie
	-- du nom affiché et deviendrait un suffixe parasite.
	base := regexp_replace(base, '#[0-9]+$', '');

	base := regexp_replace(base, '[^a-z0-9_-]+', '_', 'g');
	base := trim(both '_-' from base);
	if length(base) < 3 then
		base := 'dresseur';
	end if;
	base := left(base, 18);

	candidate := base;
	while exists (select 1 from public.profiles p where p.pseudo = candidate) loop
		suffix := suffix + 1;
		candidate := base || '_' || suffix::text;
	end loop;

	insert into public.profiles (id, pseudo, avatar_url)
	values (new.id, candidate, new.raw_user_meta_data ->> 'avatar_url');

	return new;
end;
$$;

-- Répare le compte déjà créé, si le pseudo nettoyé est libre.
update public.profiles
set pseudo = 'azeralt'
where pseudo = 'azeralt_0'
	and not exists (select 1 from public.profiles p where p.pseudo = 'azeralt');
