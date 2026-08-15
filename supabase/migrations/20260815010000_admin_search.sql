-- Recherche par pseudo ou adresse email dans l'administration, et affichage des
-- providers liés à chaque compte.
--
-- L'email n'est visible que d'un administrateur : la clause `where
-- public.is_admin()` renvoie zéro ligne à quiconque d'autre, et le filtrage est
-- fait en base, pas dans l'interface. La politique de confidentialité indique
-- que l'email n'est jamais affiché publiquement, ce qui reste vrai.
--
-- Le contenu des lignes reste hors de portée : seuls des compteurs sortent
-- d'ici, conformément à l'engagement sur les lignes privées.

drop function if exists public.admin_list_profiles();

create function public.admin_list_profiles(search text default null)
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
	where public.is_admin()
		and (
			search is null
			or search = ''
			or p.pseudo ilike '%' || search || '%'
			or u.email ilike '%' || search || '%'
		)
	group by p.id, p.pseudo, u.email, p.line_quota, p.is_admin, p.created_at
	order by count(l.id) desc, p.created_at desc;
$$;

grant execute on function public.admin_list_profiles(text) to authenticated;
