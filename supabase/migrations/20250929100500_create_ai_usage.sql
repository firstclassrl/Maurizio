-- Create ai_usage table to track AI assistant usage
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  model_used text not null default 'llama-3.1-8b-instant',
  tokens_in integer not null default 0,
  tokens_out integer not null default 0,
  question_preview text,
  metadata jsonb default '{}'::jsonb
);

-- Helpful indexes
create index if not exists ai_usage_user_created_idx on public.ai_usage(user_id, created_at desc);
create index if not exists ai_usage_created_idx on public.ai_usage(created_at desc);

-- Enable RLS and allow only owner read
alter table public.ai_usage enable row level security;

drop policy if exists "own rows" on public.ai_usage;
create policy "own rows" on public.ai_usage
  for select using (auth.uid() = user_id);

drop policy if exists "insert own rows" on public.ai_usage;
create policy "insert own rows" on public.ai_usage
  for insert with check (auth.uid() = user_id);

-- A function to count today's usage for a user
create or replace function public.ai_usage_count_today(p_user uuid)
returns integer
language sql
stable
as $$
  select count(*)::int
  from public.ai_usage
  where user_id = p_user
    and created_at >= date_trunc('day', now())
    and created_at < date_trunc('day', now()) + interval '1 day';
$$;

