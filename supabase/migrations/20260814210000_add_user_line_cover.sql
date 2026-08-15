-- Digimon de couverture d'une ligne : sert de vignette dans « My lines » et
-- d'image Open Graph sur la page de partage.
--
-- On stocke le nom du Digimon, pas une URL : l'image se résout en
-- /images/digimon/<cover>.jpg, comme partout ailleurs dans le site. Le motif
-- correspond aux 1946 fichiers de public/images/digimon.

alter table public.user_lines
	add column cover text check (cover is null or cover ~ '^[a-z0-9_.-]{1,64}$');

comment on column public.user_lines.cover is
	'Nom du Digimon de couverture, résolu en /images/digimon/<cover>.jpg.';
