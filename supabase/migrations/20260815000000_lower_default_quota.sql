-- Quota par défaut abaissé de 20 à 10 lignes.
--
-- L'interface affiche désormais ce compteur au propriétaire de la page, donc la
-- limite n'est plus découverte au moment où elle bloque.

alter table public.profiles alter column line_quota set default 10;

-- Aligne les comptes existants restés sur l'ancien défaut, sans écraser les
-- quotas déjà relevés à la main par un administrateur.
update public.profiles set line_quota = 10 where line_quota = 20;
