-- Run this in your Supabase SQL editor to set up DisciplineX

-- Enable RLS
alter table auth.users enable row level security;

-- Profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  created_at timestamptz default now() not null
);
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  subject text not null default 'General',
  duration integer not null default 25,
  created_at date not null default current_date,
  completed_at date,
  done boolean not null default false,
  goal_id uuid,
  created_at_ts timestamptz default now() not null
);
alter table public.tasks enable row level security;
create policy "Users can manage own tasks" on public.tasks for all using (auth.uid() = user_id);

-- Goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  target integer not null default 1,
  deadline date,
  created_at date not null default current_date,
  created_at_ts timestamptz default now() not null
);
alter table public.goals enable row level security;
create policy "Users can manage own goals" on public.goals for all using (auth.uid() = user_id);

-- Daily Check-ins
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  date date not null default current_date,
  mood text,
  intent integer,
  created_at timestamptz default now() not null,
  unique(user_id, date)
);
alter table public.checkins enable row level security;
create policy "Users can manage own checkins" on public.checkins for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
