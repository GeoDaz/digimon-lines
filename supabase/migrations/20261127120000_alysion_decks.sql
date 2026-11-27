create table public.alysion_decks (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles (id) on delete cascade,
	slug text not null check (slug ~ '^[a-z0-9-]{1,64}$'),
	title text not null check (length(btrim(title)) between 1 and 80),
	description text check (description is null or length(description) <= 2000),
	colors text[] not null default '{}' check (
		cardinality(colors) <= 3
		and colors <@ array['Red', 'Blue', 'Yellow', 'Green', 'Black', 'Purple', 'White']
	),
	cover text check (cover is null or cover ~ '^[A-Z0-9]{1,6}-[0-9]{1,3}$'),
	cards jsonb not null check (
		jsonb_typeof(cards) = 'array'
		and jsonb_array_length(cards) between 1 and 60
		and octet_length(cards::text) <= 4096
	),
	wins int not null default 0 check (wins between 0 and 9999),
	losses int not null default 0 check (losses between 0 and 9999),
	best_rank text check (best_rank is null or length(best_rank) <= 32),
	is_public boolean not null default false,
	like_count int not null default 0 check (like_count >= 0),
	title_key text generated always as (public.search_key(title)) stored,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (user_id, slug)
);

create index alysion_decks_user_id_idx on public.alysion_decks (user_id);
create index alysion_decks_community_idx
	on public.alysion_decks (like_count desc, created_at desc)
	where is_public;

create table public.alysion_deck_likes (
	deck_id uuid not null references public.alysion_decks (id) on delete cascade,
	user_id uuid not null references public.profiles (id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (deck_id, user_id)
);

create index alysion_deck_likes_user_id_idx on public.alysion_deck_likes (user_id);

create function public.set_alysion_deck_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	if new.like_count is distinct from old.like_count then
		new.updated_at := old.updated_at;
	else
		new.updated_at := now();
	end if;
	return new;
end;
$$;

revoke execute on function public.set_alysion_deck_updated_at()
	from public, anon, authenticated;

create trigger alysion_decks_set_updated_at
	before update on public.alysion_decks
	for each row execute function public.set_alysion_deck_updated_at();

create function public.enforce_alysion_deck_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	if (
		select count(*) from public.alysion_decks d where d.user_id = new.user_id
	) >= 50 then
		raise exception 'Deck quota reached: 50 decks maximum for this account'
			using errcode = 'check_violation';
	end if;
	return new;
end;
$$;

revoke execute on function public.enforce_alysion_deck_quota()
	from public, anon, authenticated;

create trigger alysion_decks_enforce_quota
	before insert on public.alysion_decks
	for each row execute function public.enforce_alysion_deck_quota();

create function public.sync_alysion_deck_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	if tg_op = 'INSERT' then
		update public.alysion_decks
		set like_count = like_count + 1
		where id = new.deck_id;
		return new;
	end if;
	update public.alysion_decks
	set like_count = greatest(like_count - 1, 0)
	where id = old.deck_id;
	return old;
end;
$$;

revoke execute on function public.sync_alysion_deck_like_count()
	from public, anon, authenticated;

create trigger alysion_deck_likes_sync_count
	after insert or delete on public.alysion_deck_likes
	for each row execute function public.sync_alysion_deck_like_count();

alter table public.alysion_decks enable row level security;
alter table public.alysion_deck_likes enable row level security;

create policy "alysion_decks_select_public_or_own"
	on public.alysion_decks for select
	using (is_public or (select auth.uid()) = user_id);

create policy "alysion_decks_insert_own"
	on public.alysion_decks for insert to authenticated
	with check ((select auth.uid()) = user_id);

create policy "alysion_decks_update_own"
	on public.alysion_decks for update to authenticated
	using ((select auth.uid()) = user_id)
	with check ((select auth.uid()) = user_id);

create policy "alysion_decks_delete_own"
	on public.alysion_decks for delete to authenticated
	using ((select auth.uid()) = user_id);

create policy "alysion_deck_likes_select_own"
	on public.alysion_deck_likes for select to authenticated
	using ((select auth.uid()) = user_id);

create policy "alysion_deck_likes_insert_own"
	on public.alysion_deck_likes for insert to authenticated
	with check (
		(select auth.uid()) = user_id
		and exists (
			select 1
			from public.alysion_decks d
			where d.id = deck_id
				and d.is_public
				and d.user_id <> (select auth.uid())
		)
	);

create policy "alysion_deck_likes_delete_own"
	on public.alysion_deck_likes for delete to authenticated
	using ((select auth.uid()) = user_id);

grant select on public.alysion_decks to anon, authenticated;
grant insert (
	user_id, slug, title, description, colors, cover, cards, wins, losses, best_rank, is_public
) on public.alysion_decks to authenticated;
grant update (
	slug, title, description, colors, cover, cards, wins, losses, best_rank, is_public
) on public.alysion_decks to authenticated;
grant delete on public.alysion_decks to authenticated;

grant select, insert, delete on public.alysion_deck_likes to authenticated;
