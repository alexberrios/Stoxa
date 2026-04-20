-- Migración: añadir trigger BEFORE UPDATE para mantener products.updated_at.
-- Idempotente: puede ejecutarse varias veces sin efectos adversos.

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_products_updated_at();
