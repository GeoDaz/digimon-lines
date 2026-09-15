-- Page communauté : liste des lignes publiques, triables, cherchables, likables.
--
-- Trois ajouts, tous côté base pour que la page /community reste une simple
-- requête PostgREST paginée (le site est statique, aucune fonction serveur) :
--
--   * `like_count` dénormalisé sur user_lines : sans lui, trier par popularité
--     imposerait de ramener tous les likes au navigateur pour compter.
--   * `search_text` : le contenu d'une ligne est un jsonb de 256 Ko max, on ne
--     peut pas le télécharger pour chercher un Digimon côté client. La colonne
--     aplatit titre + noms des points en une chaîne de tokens normalisés.
--   * `line_likes` : un like par couple (ligne, visiteur), protégé par RLS.

-- ------------------------------------------------------------- recherche --

/*
 * Miroir SQL de stringToKey() (src/functions/index.ts) : minuscules, sans
 * accents ni séparateurs. « Greymon X », « greymon_x » et « greymonx » se
 * ramènent ainsi à la même clé, des deux côtés du réseau.
 *
 * translate() plutôt que unaccent() : l'extension n'est pas installée et sa
 * fonction est `stable`, donc inutilisable dans une colonne générée.
 */
create function public.search_key(value text)
returns text
language sql
immutable
set search_path = ''
as $$
	select regexp_replace(
		translate(
			lower(coalesce(value, '')),
			'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
			'aaaaaaceeeeiiiinooooouuuuyy'
		),
		'[^a-z0-9]+',
		'',
		'g'
	);
$$;

comment on function public.search_key(text) is
	'Clé de recherche normalisée, équivalente à stringToKey() côté client.';

/*
 * Tokens cherchables d'une ligne, séparés par des espaces : le titre entier, ses
 * mots un à un, le slug, et le nom de chaque point et de chaque skin.
 *
 * Un token par nom, et non une seule chaîne aplatie : une recherche ne contient
 * jamais d'espace (search_key les retire), elle ne peut donc pas déborder d'un
 * token sur le suivant — « roy » + « almon » ne fabrique pas « royalmon ».
 *
 * Le jsonpath est en mode lax : les trous d'une colonne (LinePoint | null) et
 * les lignes sans skins sont ignorés au lieu de lever une erreur.
 */
create function public.line_search_text(title text, slug text, data jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
	select coalesce(string_agg(distinct public.search_key(token), ' '), '')
	from (
		select unnest(
			string_to_array(coalesce(title, ''), ' ') || array[title, slug]
		)
		union all
		select jsonb_array_elements_text(
			jsonb_path_query_array(data, '$.columns[*][*].name')
			|| jsonb_path_query_array(data, '$.columns[*][*].skins[*].name')
			|| jsonb_path_query_array(
				data,
				'$.columns[*][*].skins[*] ? (@.type() == "string")'
			)
		)
	) as tokens (token)
	where public.search_key(token) <> '';
$$;

-- Les deux fonctions restent exécutables par tous : elles ne lisent aucune
-- table, ne renvoient que ce qu'on leur passe, et la colonne générée plus bas
-- est évaluée avec les droits de l'utilisateur qui enregistre sa ligne.

alter table public.user_lines
	add column search_text text
	generated always as (public.line_search_text(title, slug, data)) stored;

comment on column public.user_lines.search_text is
	'Tokens normalisés (titre, slug, Digimon de la ligne) pour /community.';

-- ------------------------------------------------------------------ likes --

alter table public.user_lines
	add column like_count int not null default 0 check (like_count >= 0);

comment on column public.user_lines.like_count is
	'Compteur dénormalisé, tenu par le trigger sur line_likes. Ne pas écrire.';

create table public.line_likes (
	line_id uuid not null references public.user_lines (id) on delete cascade,
	user_id uuid not null references public.profiles (id) on delete cascade,
	created_at timestamptz not null default now(),
	-- Un seul like par personne et par ligne, garanti par la clé primaire.
	primary key (line_id, user_id)
);

comment on table public.line_likes is
	'Likes des lignes publiques. Seul leur auteur peut relire les siens.';

create index line_likes_user_id_idx on public.line_likes (user_id);

-- Tri par défaut de /community : les plus likées, puis les plus récentes.
create index user_lines_community_idx
	on public.user_lines (like_count desc, created_at desc)
	where is_public;

/*
 * SECURITY DEFINER : le compteur vit sur la ligne d'un tiers, que la policy
 * « user_lines_update_own » interdit de modifier. Le propriétaire de la
 * fonction contourne la RLS, et l'incrément reste borné à +/- 1 par like.
 */
create function public.sync_line_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	if tg_op = 'INSERT' then
		update public.user_lines
		set like_count = like_count + 1
		where id = new.line_id;
		return new;
	end if;
	-- Suppression de la ligne elle-même : le UPDATE ne trouve rien, sans erreur.
	update public.user_lines
	set like_count = like_count - 1
	where id = old.line_id;
	return old;
end;
$$;

revoke execute on function public.sync_line_like_count()
	from public, anon, authenticated;

create trigger line_likes_sync_count
	after insert or delete on public.line_likes
	for each row execute function public.sync_line_like_count();

/*
 * Un like ne modifie pas la ligne : sans ce garde-fou, le UPDATE ci-dessus
 * déclencherait set_updated_at et ferait remonter la ligne dans le tri
 * « recently updated », alors que son auteur n'y a pas touché.
 *
 * Le test est imbriqué et non combiné par `and` : la fonction sert aussi à
 * profiles, qui n'a pas de colonne like_count, et plpgsql ne prépare
 * l'expression interne que lorsqu'il l'atteint.
 */
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	if tg_table_name = 'user_lines' then
		if new.like_count is distinct from old.like_count then
			new.updated_at := old.updated_at;
			return new;
		end if;
	end if;
	new.updated_at := now();
	return new;
end;
$$;

revoke execute on function public.set_updated_at()
	from public, anon, authenticated;

-- --------------------------------------------------------------------- RLS --

alter table public.line_likes enable row level security;

-- Lecture limitée à ses propres likes : la page n'a besoin que de savoir si le
-- visiteur a déjà liké. Le total, lui, est public via user_lines.like_count.
create policy "line_likes_select_own"
	on public.line_likes for select to authenticated
	using ((select auth.uid()) = user_id);

-- On ne like que les lignes publiées, et pas les siennes : le classement de la
-- page communauté ne doit pas pouvoir être gonflé par son propre auteur.
create policy "line_likes_insert_own"
	on public.line_likes for insert to authenticated
	with check (
		(select auth.uid()) = user_id
		and exists (
			select 1
			from public.user_lines l
			where l.id = line_id
				and l.is_public
				and l.user_id <> (select auth.uid())
		)
	);

create policy "line_likes_delete_own"
	on public.line_likes for delete to authenticated
	using ((select auth.uid()) = user_id);

grant select, insert, delete on public.line_likes to authenticated;

-- ------------------------------------------------- couverture rétroactive --

/*
 * La vignette de /community vient de `cover`, pour n'avoir à télécharger ni le
 * jsonb ni les 256 Ko qu'il peut peser. Les lignes enregistrées avant
 * l'ajout de la colonne n'en ont pas : on leur donne leur premier point, comme
 * le fait déjà l'affichage du profil.
 */
-- Trigger suspendu le temps du rattrapage : leur auteur n'a rien modifié, ces
-- lignes n'ont pas à remonter en tête d'un tri par date de mise à jour.
alter table public.user_lines disable trigger user_lines_set_updated_at;

update public.user_lines
set cover = lower(jsonb_path_query_first(data, '$.columns[*][*].name') #>> '{}')
where cover is null
	and lower(jsonb_path_query_first(data, '$.columns[*][*].name') #>> '{}')
		~ '^[a-z0-9_.-]{1,64}$';

alter table public.user_lines enable trigger user_lines_set_updated_at;
