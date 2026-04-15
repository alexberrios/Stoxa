-- Inventario PYMES — ejecutar en el SQL Editor de Supabase (proyecto nuevo)
-- Tras ejecutar: Storage > crear bucket "product-images" (privado) y aplicar políticas de storage abajo.

-- Extensiones
create extension if not exists "pgcrypto";

-- Perfiles (1:1 con auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Categorías
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz default now() not null
);

create index categories_user_id_idx on public.categories (user_id);

alter table public.categories enable row level security;

create policy "categories_all_own"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Productos
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  sku text not null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  quantity integer not null default 0 check (quantity >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  image_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique (user_id, sku)
);

create index products_user_id_idx on public.products (user_id);
create index products_category_id_idx on public.products (category_id);

alter table public.products enable row level security;

create policy "products_all_own"
  on public.products for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Movimientos de stock
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  type text not null check (type in ('IN', 'OUT')),
  quantity integer not null check (quantity > 0),
  reason text not null default '',
  occurred_at timestamptz not null default now()
);

create index stock_movements_user_id_idx on public.stock_movements (user_id);
create index stock_movements_product_id_idx on public.stock_movements (product_id);
create index stock_movements_occurred_at_idx on public.stock_movements (occurred_at desc);

alter table public.stock_movements enable row level security;

create policy "stock_movements_all_own"
  on public.stock_movements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Perfil al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Movimiento atómico de stock
create or replace function public.apply_stock_movement(
  p_product_id uuid,
  p_type text,
  p_quantity int,
  p_reason text,
  p_occurred_at timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  current_qty int;
  delta int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor que cero';
  end if;
  if p_type not in ('IN', 'OUT') then
    raise exception 'Tipo inválido';
  end if;

  select quantity into current_qty
  from public.products
  where id = p_product_id and user_id = uid
  for update;

  if not found then
    raise exception 'Producto no encontrado';
  end if;

  if p_type = 'IN' then
    delta := p_quantity;
  else
    delta := -p_quantity;
  end if;

  if current_qty + delta < 0 then
    raise exception 'Stock insuficiente';
  end if;

  insert into public.stock_movements (user_id, product_id, type, quantity, reason, occurred_at)
  values (uid, p_product_id, p_type, p_quantity, coalesce(p_reason, ''), coalesce(p_occurred_at, now()));

  update public.products
  set quantity = quantity + delta, updated_at = now()
  where id = p_product_id and user_id = uid;
end;
$$;

grant execute on function public.apply_stock_movement(uuid, text, int, text, timestamptz) to authenticated;

-- Conteo productos con bajo stock (sidebar / alertas)
create or replace function public.count_low_stock()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from public.products p
  where p.user_id = auth.uid()
    and p.quantity <= p.min_stock;
$$;

grant execute on function public.count_low_stock() to authenticated;

-- Storage: bucket "product-images" (crear en UI como privado)
-- Políticas (ejecutar tras crear el bucket):
/*
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', false);

create policy "Users upload own folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users read own files"
on storage.objects for select to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users update own files"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users delete own files"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
*/
