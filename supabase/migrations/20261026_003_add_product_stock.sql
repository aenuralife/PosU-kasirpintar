-- Add stock tracking to the existing products table.
-- Existing products start with zero stock; adjust their quantities after applying this migration.
alter table public.products
  add column if not exists stock integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_stock_nonnegative'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_stock_nonnegative check (stock >= 0);
  end if;
end $$;

comment on column public.products.stock is 'Available stock quantity for this product.';
