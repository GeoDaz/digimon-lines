-- Répare les pseudos déjà créés avec le discriminant Discord collé au nom.
--
-- Le correctif précédent n'avait traité qu'un compte nommément ; d'autres
-- inscriptions ont eu lieu depuis la mise en ligne. On ne touche qu'aux profils
-- dont les métadonnées confirment l'origine du suffixe (`name` finissant par
-- `#<chiffres>`), et seulement si le pseudo nettoyé est libre — sans quoi on
-- risquerait de voler l'identité d'un autre compte.

update public.profiles p
set pseudo = cleaned.wanted
from (
	select
		p2.id,
		left(
			trim(both '_-' from regexp_replace(
				regexp_replace(lower(u.raw_user_meta_data ->> 'name'), '#[0-9]+$', ''),
				'[^a-z0-9_-]+', '_', 'g'
			)),
			18
		) as wanted
	from public.profiles p2
	join auth.users u on u.id = p2.id
	where u.raw_user_meta_data ->> 'name' ~ '#[0-9]+$'
) as cleaned
where p.id = cleaned.id
	and length(cleaned.wanted) >= 3
	and p.pseudo is distinct from cleaned.wanted
	and not exists (
		select 1 from public.profiles other where other.pseudo = cleaned.wanted
	);
