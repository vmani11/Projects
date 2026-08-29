-- Task Tracker schema
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query).
--
-- Note: the PRD's tables don't include a user column since this is a
-- single-user app, but Supabase's Postgres is shared infrastructure, so every
-- table still needs a `user_id` + RLS policy scoped to `auth.uid()`. That
-- keeps the schema safe by default without changing anything about how the
-- app behaves for you as the sole user.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  label text not null,
  done boolean not null default false,
  planned_date date,
  carried_from date,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_category_id_idx on tasks(category_id);
create index if not exists tasks_planned_date_idx on tasks(planned_date);
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists categories_user_id_idx on categories(user_id);

alter table categories enable row level security;
alter table tasks enable row level security;

create policy "own categories" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tasks" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- RLS narrows access, but Postgres still requires the role itself to hold
-- table privileges in the first place. Most Supabase projects pre-grant
-- these by default, but some don't — without this, every authenticated
-- write fails with "permission denied for table" regardless of RLS.
grant usage on schema public to authenticated;
grant select, insert, update, delete on categories, tasks to authenticated;
