-- Comptes utilisateurs + lignes personnelles partageables.
--
-- Modèle : une Line (cf. src/types/Line.ts) est un objet JSON autonome, on la
-- stocke telle quelle en jsonb plutôt que de normaliser colonnes/points.
--
-- Sécurité : le navigateur tape Supabase en direct avec la clé publishable,
-- donc TOUT passe par les policies RLS ci-dessous. Aucune clé secrète n'est
-- utilisée côté app.

-- ---------------------------------------------------------------- profiles --

create table public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	pseudo text not null unique check (pseudo ~ '^[a-z0-9_-]{3,24}$'),
	avatar_url text,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

comment on table public.profiles is
	'Profil public d''un utilisateur. Le pseudo sert d''URL : /u/<pseudo>.';

-- ------------------------------------------------------------- user_lines --

create table public.user_lines (
	id uuid primary key default gen_random_uuid(),
	-- FK vers profiles (et non auth.users) pour que PostgREST puisse embarquer
	-- le pseudo dans une seule requête. La cascade depuis auth.users reste
	-- assurée de façon transitive via profiles.id.
	user_id uuid not null references public.profiles (id) on delete cascade,
	slug text not null check (slug ~ '^[a-z0-9_-]{1,64}$'),
	title text check (title is null or length(title) <= 120),
	data jsonb not null check (octet_length(data::text) <= 262144),
	is_public boolean not null default false,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (user_id, slug)
);

comment on column public.user_lines.data is
	'Objet Line complet (columns, related, notes, anchor...), 256 Ko max.';

create index user_lines_user_id_idx on public.user_lines (user_id);
create index user_lines_public_idx on public.user_lines (created_at desc)
	where is_public;

-- ---------------------------------------------------------------- triggers --

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	new.updated_at := now();
	return new;
end;
$$;

create trigger profiles_set_updated_at
	before update on public.profiles
	for each row execute function public.set_updated_at();

create trigger user_lines_set_updated_at
	before update on public.user_lines
	for each row execute function public.set_updated_at();

-- Crée le profil à l'inscription, avec un pseudo dérivé du provider
-- (Discord : preferred_username, Google : name, sinon la partie locale du mail)
-- et suffixé si déjà pris.
create function public.handle_new_user()
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

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

-- Garde-fou anti-abus : le site est ouvert à l'inscription libre.
create function public.enforce_line_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	if (
		select count(*) from public.user_lines l where l.user_id = new.user_id
	) >= 200 then
		raise exception 'Quota atteint : 200 lignes maximum par compte'
			using errcode = 'check_violation';
	end if;
	return new;
end;
$$;

create trigger user_lines_enforce_quota
	before insert on public.user_lines
	for each row execute function public.enforce_line_quota();

-- --------------------------------------------------------------------- RLS --

alter table public.profiles enable row level security;
alter table public.user_lines enable row level security;

-- Les profils sont publics : il faut pouvoir résoudre /u/<pseudo> sans compte.
create policy "profiles_select_all"
	on public.profiles for select
	using (true);

create policy "profiles_insert_own"
	on public.profiles for insert to authenticated
	with check ((select auth.uid()) = id);

create policy "profiles_update_own"
	on public.profiles for update to authenticated
	using ((select auth.uid()) = id)
	with check ((select auth.uid()) = id);

-- Une ligne est lisible par tous si elle est publique, sinon par son seul auteur.
create policy "user_lines_select_public_or_own"
	on public.user_lines for select
	using (is_public or (select auth.uid()) = user_id);

create policy "user_lines_insert_own"
	on public.user_lines for insert to authenticated
	with check ((select auth.uid()) = user_id);

create policy "user_lines_update_own"
	on public.user_lines for update to authenticated
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);

create policy "user_lines_delete_own"
	on public.user_lines for delete to authenticated
	using ((select auth.uid()) = user_id);

-- ------------------------------------------------------------------ grants --

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;

grant select on public.user_lines to anon, authenticated;
grant insert, update, delete on public.user_lines to authenticated;
