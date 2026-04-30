-- ============================================================
-- 001_schema.sql
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Products table (authoritative price source)
create table if not exists public.products (
  id             text          primary key default gen_random_uuid()::text,
  name           text          not null,
  price          numeric(10,2) not null check (price > 0),
  original_price numeric(10,2),
  image          text          not null default '',
  images         text[]        not null default '{}',
  category       text          not null,
  rating         numeric(3,1)  not null default 0 check (rating between 0 and 5),
  reviews_count  integer       not null default 0,
  sold_count     integer       not null default 0,
  description    text          not null default '',
  variants       jsonb         not null default '[]',
  is_flash_sale  boolean       not null default false,
  stock          integer       not null default 0 check (stock >= 0),
  active         boolean       not null default true,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

-- Orders table
create table if not exists public.orders (
  id              uuid          primary key default gen_random_uuid(),
  customer_name   text          not null,
  phone           text          not null,
  email           text          not null,
  city            text          not null,
  address         text          not null,
  country         text          not null default 'PH',
  cart_items      jsonb         not null,
  payment_method  text          not null default 'COD',
  delivery_method text          not null,
  subtotal        numeric(10,2) not null,
  shipping_fee    numeric(10,2) not null default 0,
  total_price     numeric(10,2) not null,
  notes           text,
  status          text          not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

-- Admin users (linked to Supabase Auth)
create table if not exists public.admin_users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- ── Auto-update timestamps ───────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- ── Row Level Security ───────────────────────────────────────
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.admin_users enable row level security;

-- Admin check (security definer so it can read admin_users bypassing RLS)
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

-- Products: anyone can read active ones; only admins can write
drop policy if exists "Public can read active products"  on public.products;
drop policy if exists "Admin full access on products"    on public.products;

create policy "Public can read active products"
  on public.products for select
  to anon, authenticated
  using (active = true);

create policy "Admin full access on products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Orders: anyone can INSERT (via edge function); only admins can read/manage
drop policy if exists "Anyone can insert orders"  on public.orders;
drop policy if exists "Admin can read orders"     on public.orders;
drop policy if exists "Admin can update orders"   on public.orders;
drop policy if exists "Admin can delete orders"   on public.orders;

create policy "Anyone can insert orders"
  on public.orders for insert
  to anon, authenticated
  with check (true);

create policy "Admin can read orders"
  on public.orders for select
  to authenticated
  using (public.is_admin());

create policy "Admin can update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin can delete orders"
  on public.orders for delete
  to authenticated
  using (public.is_admin());

-- Admin users: only admins can view the list
drop policy if exists "Admins can view admin list" on public.admin_users;

create policy "Admins can view admin list"
  on public.admin_users for select
  to authenticated
  using (public.is_admin());

-- ── Promote a user to admin ──────────────────────────────────
-- After creating a user via Supabase Auth (Dashboard → Authentication → Users),
-- replace the UUID and email below and run this block:
--
-- insert into public.admin_users (id, email)
-- values ('YOUR-AUTH-USER-UUID-HERE', 'admin@yourdomain.com');
