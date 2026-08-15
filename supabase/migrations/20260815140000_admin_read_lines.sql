-- Les administrateurs peuvent lire les lignes non publiées, pour la modération.
--
-- Ce choix élargit ce que voit l'exploitant du site : la page /privacy est mise
-- à jour dans le même changement, faute de quoi elle affirmerait à tort qu'une
-- ligne privée n'est lisible que par son auteur.
--
-- La lecture seulement : les policies d'écriture et de suppression restent
-- réservées au propriétaire de la ligne.

drop policy "user_lines_select_public_or_own" on public.user_lines;

create policy "user_lines_select_public_own_or_admin"
	on public.user_lines for select
	using (
		is_public
		or (select auth.uid()) = user_id
		or public.is_admin()
	);
