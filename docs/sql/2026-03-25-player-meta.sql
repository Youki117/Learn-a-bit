create table if not exists public.player_meta (
  user_id uuid primary key,
  coins integer not null default 0,
  completed_articles integer not null default 0,
  perfect_quiz_runs integer not null default 0,
  prediction_wins integer not null default 0,
  prediction_losses integer not null default 0,
  notes jsonb not null default '[]'::jsonb,
  favorites jsonb not null default '[]'::jsonb,
  wrong_items jsonb not null default '[]'::jsonb,
  processed_events jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.player_meta enable row level security;

drop policy if exists "Users can read their own player meta" on public.player_meta;
create policy "Users can read their own player meta"
  on public.player_meta
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own player meta" on public.player_meta;
create policy "Users can insert their own player meta"
  on public.player_meta
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own player meta" on public.player_meta;
create policy "Users can update their own player meta"
  on public.player_meta
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_player_meta_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_player_meta_updated_at on public.player_meta;
create trigger set_player_meta_updated_at
before update on public.player_meta
for each row
execute function public.set_player_meta_updated_at();
