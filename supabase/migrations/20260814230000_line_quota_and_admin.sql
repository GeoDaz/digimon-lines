-- Quota de lignes par compte, ajustable au cas par cas par un administrateur.
--
-- Le stockage Supabase gratuit est de 500 Mo et chaque ligne peut peser jusqu'à
-- 256 Ko (contrainte sur user_lines.data). Le quota par défaut passe de 200 à 20
-- pour borner le pire cas, avec un déblocage individuel possible.

-- ------------------------------------------------------------------ colonnes --

alter table public.profiles
	add column line_quota int not null default 20 check (line_quota between 0 and 10000),
	add column is_admin boolean not null default false;

comment on column public.profiles.line_quota is
	'Nombre maximum de lignes enregistrables. Modifiable par un administrateur.';

-- --------------------------------------------------------------------- admin --

-- SECURITY DEFINER : s'exécute avec les droits du propriétaire, donc sans RLS.
-- Indispensable, sinon la lecture de profiles depuis une policy sur profiles
-- boucherait sur elle-même.
create function public.is_admin()
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

grant execute on function public.is_admin() to authenticated;

-- Amorçage : le compte propriétaire du site.
update public.profiles p
set is_admin = true
from auth.users u
where u.id = p.id and u.email = 'gfrydz2@gmail.com';

-- ------------------------------------------------------------------ garde-fou --

/*
 * Sans ça, n'importe qui pourrait relever son propre quota (ou se sacrer
 * administrateur) via la policy « profiles_update_own », car la RLS filtre les
 * lignes mais pas les colonnes. Le contrôle est mis dans un trigger plutôt que
 * dans une policy, pour qu'il tienne quelles que soient les policies futures.
 */
create function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	if (
		new.line_quota is distinct from old.line_quota
		or new.is_admin is distinct from old.is_admin
	) and not public.is_admin() then
		raise exception 'Only an administrator can change quotas or roles'
			using errcode = '42501';
	end if;
	return new;
end;
$$;

create trigger profiles_protect_privileges
	before update on public.profiles
	for each row execute function public.protect_profile_privileges();

create policy "profiles_update_by_admin"
	on public.profiles for update to authenticated
	using (public.is_admin())
	with check (public.is_admin());

-- --------------------------------------------------------------------- quota --

create or replace function public.enforce_line_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
	quota int;
	used int;
begin
	select p.line_quota into quota from public.profiles p where p.id = new.user_id;
	quota := coalesce(quota, 20);

	select count(*) into used from public.user_lines l where l.user_id = new.user_id;

	if used >= quota then
		-- Message en anglais : il remonte tel quel jusqu'à l'utilisateur.
		raise exception 'Line quota reached: % lines maximum for this account', quota
			using errcode = 'check_violation';
	end if;
	return new;
end;
$$;

-- ---------------------------------------------------------- liste pour l'admin --

/*
 * Renvoie des COMPTEURS uniquement, jamais le contenu des lignes : la politique
 * de confidentialité du site garantit qu'une ligne privée n'est lisible que par
 * son auteur, et un accès admin en lecture la contredirait. La clause
 * `where public.is_admin()` renvoie zéro ligne à quiconque n'est pas admin.
 */
create function public.admin_list_profiles()
returns table (
	id uuid,
	pseudo text,
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
		p.line_quota,
		p.is_admin,
		count(l.id),
		count(l.id) filter (where l.is_public),
		p.created_at
	from public.profiles p
	left join public.user_lines l on l.user_id = p.id
	where public.is_admin()
	group by p.id, p.pseudo, p.line_quota, p.is_admin, p.created_at
	order by count(l.id) desc, p.created_at desc;
$$;

grant execute on function public.admin_list_profiles() to authenticated;
