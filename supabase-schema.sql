-- FlipTrack — Schema Supabase
-- Executar no Editor SQL do Supabase Dashboard

-- 1. Criar tabela products
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null check (category in ('baby', 'board-game', 'other')),
  condition   text not null check (condition in ('new', 'used-like-new', 'used-good', 'used-fair')),
  buy_price   numeric(10,2) not null,
  sell_price  numeric(10,2),
  buy_date    date not null,
  sell_date   date,
  platform    text not null default 'OLX',
  status      text not null default 'in-stock' check (status in ('in-stock', 'sold', 'returned')),
  notes       text,
  created_at  timestamptz not null default now()
);

-- 2. Desativar Row Level Security (sem autenticação)
alter table public.products disable row level security;

-- 3. Permitir todas as operações via anon key
grant all on public.products to anon;
grant usage on schema public to anon;

-- 4. Activar Realtime para sincronização entre dispositivos
alter publication supabase_realtime add table public.products;

-- Índices para melhor desempenho
create index if not exists products_status_idx on public.products (status);
create index if not exists products_buy_date_idx on public.products (buy_date desc);
create index if not exists products_category_idx on public.products (category);
