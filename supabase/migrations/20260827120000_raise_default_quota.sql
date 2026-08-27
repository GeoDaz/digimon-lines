-- Quota par défaut relevé de 10 à 30 lignes.
--
-- Le pire cas de stockage reste borné (256 Ko par ligne, cf. la contrainte sur
-- user_lines.data), mais 10 lignes se révélaient trop serré à l'usage.

alter table public.profiles alter column line_quota set default 30;

-- Relève tous les comptes en dessous du nouveau défaut. Le `< 30` plutôt qu'un
-- `= 10` couvre aussi les comptes restés sur un ancien défaut (20), et n'abaisse
-- jamais un quota déjà relevé à la main par un administrateur.
update public.profiles set line_quota = 30 where line_quota < 30;

-- Aligne le repli utilisé quand aucun profil ne correspond (resté à 20).
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
	quota := coalesce(quota, 30);

	select count(*) into used from public.user_lines l where l.user_id = new.user_id;

	if used >= quota then
		-- Message en anglais : il remonte tel quel jusqu'à l'utilisateur.
		raise exception 'Line quota reached: % lines maximum for this account', quota
			using errcode = 'check_violation';
	end if;
	return new;
end;
$$;
