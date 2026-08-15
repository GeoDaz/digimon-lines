-- Correctif : le garde-fou sur line_quota / is_admin bloquait aussi les
-- modifications faites hors requête utilisateur (SQL editor du dashboard, API
-- Management, scripts de maintenance), où auth.uid() est nul. Le propriétaire
-- du site se retrouvait sans aucun moyen de réparer les droits si le flag admin
-- venait à sauter.
--
-- On laisse donc passer les contextes administratifs. Ce n'est pas un trou :
-- la policy « profiles_update_own » est réservée au rôle `authenticated`, donc
-- un visiteur anonyme (uid nul lui aussi) n'atteint jamais ce trigger, la RLS
-- l'ayant déjà écarté. Et service_role contourne la RLS de toute façon.

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

	if not public.is_admin() then
		raise exception 'Only an administrator can change quotas or roles'
			using errcode = '42501';
	end if;

	return new;
end;
$$;
