create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  id_str text not null unique,
  name text not null,
  category text not null default 'Makanan',
  price integer not null default 0,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create trigger handle_products_updated_at()
  after update on products
  for each row
  execute function handle_updated_at();

grant all on products to authenticated;
grant all on products to anon;