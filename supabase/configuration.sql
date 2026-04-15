-- Configuración adicional: usuarios internos + tipos de cambio

create table if not exists public.team_users (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null check (role in ('ADMIN', 'OPERADOR', 'LECTOR')),
  active boolean not null default true,
  created_at timestamptz default now() not null,
  unique (owner_user_id, email)
);

create index if not exists team_users_owner_user_id_idx
  on public.team_users (owner_user_id);

alter table public.team_users enable row level security;

drop policy if exists "team_users_all_own" on public.team_users;
create policy "team_users_all_own"
  on public.team_users for all
  using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null check (code ~ '^[A-Z]{3}$'),
  name text not null,
  rate_to_base numeric(14, 6) not null check (rate_to_base > 0),
  is_base boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, code)
);

create index if not exists exchange_rates_user_id_idx
  on public.exchange_rates (user_id);

alter table public.exchange_rates enable row level security;

drop policy if exists "exchange_rates_all_own" on public.exchange_rates;
create policy "exchange_rates_all_own"
  on public.exchange_rates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_exchange_rates_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_exchange_rates_updated_at on public.exchange_rates;
create trigger set_exchange_rates_updated_at
  before update on public.exchange_rates
  for each row execute function public.set_exchange_rates_updated_at();
