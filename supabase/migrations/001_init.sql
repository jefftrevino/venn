create extension if not exists "pgcrypto";

create table teams (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  participant_id uuid not null references participants(id) on delete cascade,
  text text not null,
  rx float8,
  ry float8,
  created_at timestamptz default now()
);

create table team_results (
  team_id uuid primary key references teams(id) on delete cascade,
  suggestions jsonb not null default '[]',
  loading boolean not null default false,
  updated_at timestamptz default now()
);

-- Row-level security (public access, team code is the key)
alter table teams enable row level security;
alter table participants enable row level security;
alter table items enable row level security;
alter table team_results enable row level security;

create policy "public" on teams for all using (true) with check (true);
create policy "public" on participants for all using (true) with check (true);
create policy "public" on items for all using (true) with check (true);
create policy "public" on team_results for all using (true) with check (true);

-- Enable realtime
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table items;
alter publication supabase_realtime add table team_results;
