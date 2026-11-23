-- Plataforma ENEM — schema do Supabase
-- Cole este arquivo inteiro em: Supabase > SQL Editor > New query > Run

-- Uma linha por (usuário, chave). Cada chave guarda um JSON:
--   profile, trails, answers, simulados, essays, essayDraft,
--   weeklyPlan, studyDays, achievements, counters
create table if not exists public.user_data (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  key        text        not null,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create index if not exists user_data_user_idx on public.user_data (user_id);

-- Segurança: cada pessoa só enxerga e altera os próprios dados
alter table public.user_data enable row level security;

drop policy if exists "user_data_select_own" on public.user_data;
drop policy if exists "user_data_insert_own" on public.user_data;
drop policy if exists "user_data_update_own" on public.user_data;
drop policy if exists "user_data_delete_own" on public.user_data;

create policy "user_data_select_own" on public.user_data
  for select using (auth.uid() = user_id);
create policy "user_data_insert_own" on public.user_data
  for insert with check (auth.uid() = user_id);
create policy "user_data_update_own" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_data_delete_own" on public.user_data
  for delete using (auth.uid() = user_id);

-- Sincronização em tempo real entre dispositivos
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_data'
  ) then
    alter publication supabase_realtime add table public.user_data;
  end if;
end $$;
