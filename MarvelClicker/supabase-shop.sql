-- Run once in Supabase Dashboard > SQL Editor before testing the Shop.
alter table public.leaderboard
  add column if not exists click_power integer not null default 1,
  add column if not exists owns_power_2 boolean not null default false,
  add column if not exists owns_power_4 boolean not null default false,
  add column if not exists owns_power_8 boolean not null default false,
  add column if not exists boost_used_at timestamptz,
  add column if not exists boost_until timestamptz;

alter table public.leaderboard
  drop constraint if exists leaderboard_click_power_check;

alter table public.leaderboard
  add constraint leaderboard_click_power_check
  check (click_power in (1, 2, 4, 8));
