-- Durcissement des droits d'exécution sur les fonctions « security definer ».
--
-- Le linter Supabase (0028 / 0029) signale toute fonction `security definer`
-- joignable via /rest/v1/rpc/<nom>. Postgres accorde `execute` à PUBLIC par
-- défaut : des fonctions purement internes — les triggers, le helper de policy
-- — étaient donc exposées à n'importe quel visiteur, sans qu'on l'ait jamais
-- voulu.
--
-- Trois traitements, selon l'usage réel de chaque fonction :
--
--   * fonctions de trigger : `execute` révoqué. Un trigger n'a pas besoin du
--     droit pour se déclencher — Postgres ne le vérifie qu'à la création du
--     trigger, pas à chaque ligne.
--
--   * `is_admin()` : déplacé dans un schéma `private`, hors des schémas exposés
--     par PostgREST (`public`, `graphql_public`, cf. supabase/config.toml). Il
--     doit rester exécutable par `anon` et `authenticated`, ce n'est pas
--     négociable : une policy RLS évalue les fonctions qu'elle appelle avec les
--     droits de l'appelant, et la policy de lecture de user_lines s'applique
--     aussi aux visiteurs non connectés.
--
--   * `admin_list_profiles()` : reste appelable par `authenticated`, la page
--     /admin l'appelle depuis le navigateur — c'est tout l'intérêt d'un
--     `security definer`. Elle n'est en revanche plus offerte à `anon`. Le
--     garde-fou reste le `where private.is_admin()` interne, qui renvoie zéro
--     ligne à tout autre appelant. Le linter continuera donc de signaler cette
--     fonction en 0029 : c'est intentionnel.

-- --------------------------------------------------------------- triggers --

revoke execute on function public.handle_new_user()
	from public, anon, authenticated;
revoke execute on function public.enforce_line_quota()
	from public, anon, authenticated;
revoke execute on function public.set_updated_at()
	from public, anon, authenticated;

-- ------------------------------------------------------- schéma privé --

create schema if not exists private;

comment on schema private is
	'Fonctions internes, hors des schémas exposés par l''API PostgREST.';

grant usage on schema private to anon, authenticated;

-- Les deux policies dépendent de la fonction : il faut les retirer avant de
-- pouvoir la supprimer. Le corps des fonctions plpgsql/sql qui l'appellent, lui,
-- ne crée pas de dépendance (corps stocké en texte), d'où le simple
-- `create or replace` plus bas.
drop policy "profiles_update_by_admin" on public.profiles;
drop policy "user_lines_select_public_own_or_admin" on public.user_lines;

drop function public.is_admin();

-- SECURITY DEFINER : s'exécute avec les droits du propriétaire, donc sans RLS.
-- Indispensable, sinon la lecture de profiles depuis une policy sur profiles
-- boucherait sur elle-même.
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
	select coalesce(
		(select p.is_admin from public.profiles p where p.id = auth.uid()),
		false
	);
$$;

revoke execute on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

create policy "profiles_update_by_admin"
	on public.profiles for update to authenticated
	using (private.is_admin())
	with check (private.is_admin());

create policy "user_lines_select_public_own_or_admin"
	on public.user_lines for select
	using (
		is_public
		or (select auth.uid()) = user_id
		or private.is_admin()
	);

-- ------------------------------------------- appelants de l'ancien helper --

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	if new.line_quota is not distinct from old.line_quota
		and new.is_admin is not distinct from old.is_admin then
		return new;
	end if;

	-- Hors requête d'un utilisateur connecté : contexte administratif.
	if auth.uid() is null then
		return new;
	end if;

	if not private.is_admin() then
		raise exception 'Only an administrator can change quotas or roles'
			using errcode = '42501';
	end if;

	return new;
end;
$$;

-- Après le `create or replace`, qui conserve les droits existants.
revoke execute on function public.protect_profile_privileges()
	from public, anon, authenticated;

create or replace function public.admin_list_profiles(search text default null)
returns table (
	id uuid,
	pseudo text,
	email text,
	providers text,
	line_quota int,
	is_admin boolean,
	line_count bigint,
	public_count bigint,
	created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
	select
		p.id,
		p.pseudo,
		u.email::text,
		(
			select string_agg(distinct i.provider, ', ')
			from auth.identities i
			where i.user_id = p.id
		),
		p.line_quota,
		p.is_admin,
		count(l.id),
		count(l.id) filter (where l.is_public),
		p.created_at
	from public.profiles p
	join auth.users u on u.id = p.id
	left join public.user_lines l on l.user_id = p.id
	where private.is_admin()
		and (
			search is null
			or search = ''
			or p.pseudo ilike '%' || search || '%'
			or u.email ilike '%' || search || '%'
		)
	group by p.id, p.pseudo, u.email, p.line_quota, p.is_admin, p.created_at
	order by count(l.id) desc, p.created_at desc;
$$;

revoke execute on function public.admin_list_profiles(text) from public, anon;
grant execute on function public.admin_list_profiles(text) to authenticated;
