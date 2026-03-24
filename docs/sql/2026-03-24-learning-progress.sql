create table if not exists public.learning_progress (
  user_id uuid not null,
  domain text not null,
  current_level integer not null default 1,
  total_levels integer not null default 10,
  levels jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, domain)
);

create index if not exists learning_progress_user_id_idx
  on public.learning_progress (user_id);

alter table public.learning_progress enable row level security;

drop policy if exists "Users can read their own learning progress"
  on public.learning_progress;

create policy "Users can read their own learning progress"
  on public.learning_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own learning progress"
  on public.learning_progress;

create policy "Users can insert their own learning progress"
  on public.learning_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own learning progress"
  on public.learning_progress;

create policy "Users can update their own learning progress"
  on public.learning_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_learning_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_learning_progress_updated_at on public.learning_progress;

create trigger set_learning_progress_updated_at
before update on public.learning_progress
for each row
execute function public.set_learning_progress_updated_at();
