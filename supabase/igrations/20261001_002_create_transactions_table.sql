create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  id_str text not null unique,
  timestamp bigint not null,
  date text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null default 0,
  discount_percent integer not null default 0,
  discount_amount integer not null default 0,
  grand_total integer not null default 0,
  cash integer not null default 0,
  change integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create trigger handle_transactions_updated_at()
  after update on transactions
  for each row
  execute function handle_updated_at();

grant all on transactions to authenticated;
grant all on transactions to anon;