alter table public.user_lines
	add column licence text not null default 'digimon'
	check (licence in ('digimon', 'pokemon'));

alter table public.user_lines disable trigger user_lines_set_updated_at;

update public.user_lines l
set licence = 'pokemon'
from public.profiles p
where p.id = l.user_id
	and (p.pseudo, l.slug) in (
		('viny_calacina', 'snivy'),
		('midnight_bacon', 'bulbasaur')
	);

alter table public.user_lines enable trigger user_lines_set_updated_at;
