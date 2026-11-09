-- ============================================================================
-- QueenFizzie — Supabase schema
-- Run this once in Supabase → SQL Editor (or `psql "$DATABASE_URL" -f ...`).
-- It is idempotent: re-running is safe.
--
-- Everything lives in Supabase: auth.users for credentials, public.profiles
-- for the full customer record (phone included), Postgres for catalogue,
-- orders, promos, notifications, and Storage for avatars/receipts.
-- ============================================================================

-- ---------------------------------------------------------------- helpers ---
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------- tables ---
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  email           text not null unique,
  phone           text not null unique,
  first_name      text not null default '',
  last_name       text not null default '',
  role            text not null default 'CUSTOMER' check (role in ('CUSTOMER', 'ADMIN')),
  avatar_path     text,
  marketing_opt_in boolean not null default true,
  push_opt_in      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint profiles_phone_format check (phone ~ '^\+234[789][01][0-9]{8}$')
);

create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  label      text not null default 'Home',
  full_name  text not null,
  phone      text not null,
  line1      text not null,
  line2      text,
  city       text not null,
  state      text not null,
  country    text not null default 'Nigeria',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  sku          text not null unique,
  description  text not null default '',
  category     text not null default 'Skincare',
  price        integer not null check (price >= 0),
  old_price    integer check (old_price is null or old_price >= 0),
  image        text not null default '',
  images       text[] not null default '{}',
  stock        integer not null default 0 check (stock >= 0),
  low_stock_at integer not null default 5,
  status       text not null default 'ACTIVE' check (status in ('ACTIVE', 'DRAFT', 'ARCHIVED')),
  featured     boolean not null default false,
  rating_rate  numeric(3, 2) not null default 4.80,
  rating_count integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint products_images_limit check (cardinality(images) <= 3)
);

create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  value       text not null default 'default',
  label       text not null default 'Standard',
  price       integer not null default 0 check (price >= 0),
  stock       integer not null default 0 check (stock >= 0),
  is_default  boolean not null default false,
  meta        jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, value)
);

create table if not exists public.promos (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  description  text not null default '',
  type         text not null default 'PERCENT' check (type in ('PERCENT', 'FIXED')),
  value        integer not null check (value > 0),
  min_subtotal integer not null default 0,
  max_uses     integer,
  uses         integer not null default 0,
  active       boolean not null default true,
  starts_at    timestamptz not null default now(),
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.orders (
  id                  uuid primary key default gen_random_uuid(),
  reference           text not null unique,
  user_id             uuid not null references public.profiles (id),
  status              text not null default 'PENDING_PAYMENT'
                        check (status in ('PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  payment_status      text not null default 'AWAITING_CONFIRMATION'
                        check (payment_status in ('AWAITING_CONFIRMATION', 'PAID', 'REFUNDED', 'FAILED')),
  subtotal            integer not null check (subtotal >= 0),
  discount            integer not null default 0 check (discount >= 0),
  delivery            integer not null default 0 check (delivery >= 0),
  total               integer not null check (total >= 0),
  promo_code          text,
  customer_name       text not null,
  customer_email      text not null,
  customer_phone      text not null,
  address_line        text not null,
  city                text not null,
  state               text not null,
  notes               text,
  courier             text,
  tracking_number     text,
  receipt_path        text,
  receipt_name        text,
  receipt_mime        text,
  receipt_size        integer,
  receipt_uploaded_at timestamptz,
  placed_at           timestamptz not null default now(),
  payment_confirmed_at timestamptz,
  packed_at           timestamptz,
  shipped_at          timestamptz,
  delivered_at        timestamptz,
  cancelled_at        timestamptz,
  updated_at          timestamptz not null default now()
);

create table if not exists public.order_items (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references public.orders (id) on delete cascade,
  product_id     uuid references public.products (id) on delete set null,
  variant_value  text,
  variant_label  text,
  title          text not null,
  sku            text not null,
  unit_price     integer not null,
  qty            integer not null check (qty > 0),
  line_total     integer not null,
  image          text not null default ''
);

create table if not exists public.order_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders (id) on delete cascade,
  type       text not null,
  message    text not null,
  actor_name text,
  actor_role text not null default 'SYSTEM',
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete cascade,
  audience   text not null default 'USER' check (audience in ('USER', 'ADMIN')),
  type       text not null default 'SYSTEM',
  title      text not null,
  body       text not null default '',
  href       text,
  read_at    timestamptz,
  order_id   uuid references public.orders (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.promo_redemptions (
  id         uuid primary key default gen_random_uuid(),
  promo_id   uuid not null references public.promos (id) on delete cascade,
  order_id   uuid not null unique references public.orders (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  code       text not null,
  amount     integer not null,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists images text[] not null default '{}';

-- Extra attributes per product option (e.g. flavour = mint, amount = 4000).
alter table public.product_variants add column if not exists meta jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_images_limit'
  ) then
    alter table public.products add constraint products_images_limit check (cardinality(images) <= 3);
  end if;
end $$;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists addresses_user_idx on public.addresses (user_id);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category);
create index if not exists product_variants_product_idx on public.product_variants (product_id);
create index if not exists product_variants_default_idx on public.product_variants (product_id, is_default);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists order_items_order_idx on public.order_items (order_id);
create index if not exists order_events_order_idx on public.order_events (order_id);
create index if not exists notifications_user_idx on public.notifications (user_id, read_at);
create index if not exists notifications_audience_idx on public.notifications (audience, read_at);
create index if not exists favorites_user_idx on public.favorites (user_id);

-- ------------------------------------------------------- updated_at wiring ---
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists addresses_touch on public.addresses;
create trigger addresses_touch before update on public.addresses
  for each row execute function public.touch_updated_at();

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists product_variants_touch on public.product_variants;
create trigger product_variants_touch before update on public.product_variants
  for each row execute function public.touch_updated_at();

drop trigger if exists promos_touch on public.promos;
create trigger promos_touch before update on public.promos
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------ auth wiring ---
-- Creates the full customer profile (phone is mandatory) at sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, first_name, last_name)
  values (
    new.id,
    lower(new.email),
    coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), ''),
    coalesce(nullif(new.raw_user_meta_data ->> 'last_name', ''), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- True when the caller's profile is an administrator.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Used by the sign-up form to fail fast on a duplicate phone number.
create or replace function public.phone_available(p_phone text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (select 1 from public.profiles where phone = p_phone);
$$;

grant execute on function public.phone_available(text) to anon, authenticated;

-- -------------------------------------------------------------- row security ---
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.promos enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.notifications enable row level security;
alter table public.favorites enable row level security;
alter table public.promo_redemptions enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Role is never writable through the API: only these columns are granted,
-- and a trigger blocks role changes from any session that carries a user JWT.
revoke update on public.profiles from anon, authenticated;
grant update (first_name, last_name, phone, avatar_path, marketing_opt_in, updated_at)
  on public.profiles to authenticated;

create or replace function public.guard_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'ROLE_IMMUTABLE';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- addresses
drop policy if exists addresses_select on public.addresses;
create policy addresses_select on public.addresses
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists addresses_write on public.addresses;
create policy addresses_write on public.addresses
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists addresses_update on public.addresses;
create policy addresses_update on public.addresses
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists addresses_delete on public.addresses;
create policy addresses_delete on public.addresses
  for delete to authenticated
  using (user_id = auth.uid());

-- products: everyone reads the live catalogue, only admins write
drop policy if exists products_select on public.products;
create policy products_select on public.products
  for select to anon, authenticated
  using (status = 'ACTIVE' or public.is_admin());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- product variants: storefront reads all options, admins manage the variant list
drop policy if exists product_variants_select on public.product_variants;
create policy product_variants_select on public.product_variants
  for select to anon, authenticated
  using (true);

drop policy if exists product_variants_admin_write on public.product_variants;
create policy product_variants_admin_write on public.product_variants
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- promos
drop policy if exists promos_select on public.promos;
create policy promos_select on public.promos
  for select to anon, authenticated
  using (active = true or public.is_admin());

drop policy if exists promos_admin_write on public.promos;
create policy promos_admin_write on public.promos
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- orders: owners read their own, admins read everything; writes go through RPCs
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists order_events_select on public.order_events;
create policy order_events_select on public.order_events
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_events.order_id
        and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- notifications: buyers see their inbox, admins share one admin inbox
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated
  using (
    (audience = 'USER' and user_id = auth.uid())
    or (audience = 'ADMIN' and public.is_admin())
  );

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated
  using (
    (audience = 'USER' and user_id = auth.uid())
    or (audience = 'ADMIN' and public.is_admin())
  )
  with check (
    (audience = 'USER' and user_id = auth.uid())
    or (audience = 'ADMIN' and public.is_admin())
  );

drop policy if exists notifications_admin_insert on public.notifications;
create policy notifications_admin_insert on public.notifications
  for insert to authenticated
  with check (public.is_admin() and audience = 'USER');

-- push subscriptions: the browser registers its endpoint and keys so the
-- stored announcements can fan out as native push notifications to the PWA.
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  endpoint   text not null,
  p256dh    text not null,
  auth      text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;

drop policy if exists push_subscriptions_select on public.push_subscriptions;
create policy push_subscriptions_select on public.push_subscriptions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists push_subscriptions_insert on public.push_subscriptions;
create policy push_subscriptions_insert on public.push_subscriptions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists push_subscriptions_update on public.push_subscriptions;
create policy push_subscriptions_update on public.push_subscriptions
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists push_subscriptions_delete on public.push_subscriptions;
create policy push_subscriptions_delete on public.push_subscriptions
  for delete to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- favorites
drop policy if exists favorites_all on public.favorites;
create policy favorites_all on public.favorites
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- promo redemptions are written by place_order only
drop policy if exists promo_redemptions_select on public.promo_redemptions;
create policy promo_redemptions_select on public.promo_redemptions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- --------------------------------------------------------- promo validation ---
create or replace function public.validate_promo(p_code text, p_subtotal integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_promo public.promos;
  v_discount integer;
begin
  if p_code is null or length(trim(p_code)) = 0 then
    return jsonb_build_object('valid', false, 'reason', 'Enter a promo code.');
  end if;

  select * into v_promo from public.promos
  where upper(code) = upper(trim(p_code)) and active = true;

  if not found then
    return jsonb_build_object('valid', false, 'reason', 'That code is not valid.');
  end if;
  if v_promo.starts_at > now() then
    return jsonb_build_object('valid', false, 'reason', 'That code is not active yet.');
  end if;
  if v_promo.expires_at is not null and v_promo.expires_at < now() then
    return jsonb_build_object('valid', false, 'reason', 'That code has expired.');
  end if;
  if v_promo.max_uses is not null and v_promo.uses >= v_promo.max_uses then
    return jsonb_build_object('valid', false, 'reason', 'That code has been fully redeemed.');
  end if;
  if coalesce(p_subtotal, 0) < v_promo.min_subtotal then
    return jsonb_build_object('valid', false, 'reason', 'Your bag has not reached the minimum spend for this code.');
  end if;

  v_discount := case
    when v_promo.type = 'PERCENT' then round(coalesce(p_subtotal, 0) * v_promo.value / 100.0)::integer
    else v_promo.value
  end;
  v_discount := greatest(0, least(coalesce(p_subtotal, 0), v_discount));

  return jsonb_build_object(
    'valid', true,
    'code', v_promo.code,
    'description', v_promo.description,
    'type', v_promo.type,
    'value', v_promo.value,
    'discount', v_discount
  );
end;
$$;

grant execute on function public.validate_promo(text, integer) to authenticated, anon;

-- ------------------------------------------------------------- place order ---
-- Atomic checkout: re-prices from the database, locks stock, applies the promo,
-- writes the order, items, timeline, buyer receipt notification and admin alert.
create or replace function public.place_order(
  p_customer jsonb,
  p_items jsonb,
  p_promo text default null,
  p_receipt jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles;
  v_product public.products;
  v_order public.orders;
  v_item jsonb;
  v_lines jsonb := '[]'::jsonb;
  v_qty integer;
  v_subtotal integer := 0;
  v_discount integer := 0;
  v_delivery integer := 0;
  v_promo public.promos;
  v_promo_id uuid;
  v_ref text;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if not found then
    raise exception 'AUTH_REQUIRED';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  if coalesce(trim(p_customer ->> 'name'), '') = ''
     or coalesce(trim(p_customer ->> 'phone'), '') = ''
     or coalesce(trim(p_customer ->> 'address'), '') = ''
     or coalesce(trim(p_customer ->> 'city'), '') = ''
     or coalesce(trim(p_customer ->> 'state'), '') = '' then
    raise exception 'INCOMPLETE_DELIVERY';
  end if;

  if p_receipt is null or coalesce(p_receipt ->> 'path', '') = '' then
    raise exception 'RECEIPT_REQUIRED';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, least(20, coalesce((v_item ->> 'qty')::integer, 1)));

    select * into v_product from public.products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    if not found then
      raise exception 'PRODUCT_NOT_FOUND';
    end if;
    if v_product.status <> 'ACTIVE' then
      raise exception 'PRODUCT_UNAVAILABLE: % is no longer available', v_product.title;
    end if;
    if v_product.stock < v_qty then
      raise exception 'OUT_OF_STOCK: only % left of %', v_product.stock, v_product.title;
    end if;

    update public.products set stock = stock - v_qty where id = v_product.id;

    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product.id,
      'title', v_product.title,
      'sku', v_product.sku,
      'unit_price', v_product.price,
      'qty', v_qty,
      'line_total', v_product.price * v_qty,
      'image', v_product.image
    );
    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  if p_promo is not null and length(trim(p_promo)) > 0 then
    select * into v_promo from public.promos
    where upper(code) = upper(trim(p_promo)) and active = true;

    if not found then
      raise exception 'PROMO_INVALID';
    end if;
    if v_promo.starts_at > now() then
      raise exception 'PROMO_INVALID';
    end if;
    if v_promo.expires_at is not null and v_promo.expires_at < now() then
      raise exception 'PROMO_EXPIRED';
    end if;
    if v_promo.max_uses is not null and v_promo.uses >= v_promo.max_uses then
      raise exception 'PROMO_EXHAUSTED';
    end if;
    if v_subtotal < v_promo.min_subtotal then
      raise exception 'PROMO_MINIMUM';
    end if;

    v_discount := case
      when v_promo.type = 'PERCENT' then round(v_subtotal * v_promo.value / 100.0)::integer
      else v_promo.value
    end;
    v_discount := greatest(0, least(v_subtotal, v_discount));
    v_promo_id := v_promo.id;
  end if;

  v_delivery := case when (v_subtotal - v_discount) >= 150000 then 0 else 3500 end;
  v_ref := 'QF-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.orders (
    reference, user_id, subtotal, discount, delivery, total, promo_code,
    customer_name, customer_email, customer_phone, address_line, city, state, notes,
    receipt_path, receipt_name, receipt_mime, receipt_size, receipt_uploaded_at
  ) values (
    v_ref, v_uid, v_subtotal, v_discount, v_delivery, v_subtotal - v_discount + v_delivery,
    case when v_promo_id is null then null else upper(trim(p_promo)) end,
    trim(p_customer ->> 'name'),
    coalesce(nullif(trim(p_customer ->> 'email'), ''), v_profile.email),
    trim(p_customer ->> 'phone'),
    trim(p_customer ->> 'address'),
    trim(p_customer ->> 'city'),
    trim(p_customer ->> 'state'),
    nullif(trim(coalesce(p_customer ->> 'notes', '')), ''),
    p_receipt ->> 'path',
    nullif(p_receipt ->> 'name', ''),
    nullif(p_receipt ->> 'mime', ''),
    nullif(p_receipt ->> 'size', '')::integer,
    now()
  ) returning * into v_order;

  insert into public.order_items (order_id, product_id, variant_value, variant_label, title, sku, unit_price, qty, line_total, image)
  select
    v_order.id,
    (line ->> 'product_id')::uuid,
    nullif(line ->> 'variant_value', ''),
    nullif(line ->> 'variant_label', ''),
    coalesce(nullif(line ->> 'variant_label', ''), line ->> 'title'),
    line ->> 'sku',
    (line ->> 'unit_price')::integer,
    (line ->> 'qty')::integer,
    (line ->> 'line_total')::integer,
    line ->> 'image'
  from jsonb_array_elements(v_lines) as line;

  insert into public.order_events (order_id, type, message, actor_role)
  values (v_order.id, 'ORDER_PLACED', 'Order placed — waiting for payment confirmation.', 'SYSTEM');

  insert into public.notifications (user_id, audience, type, title, body, href, order_id)
  values (
    v_uid, 'USER', 'ORDER',
    'Order ' || v_order.reference || ' received',
    'We are verifying your transfer now. Your status will update as soon as it clears.',
    '/Orders?order=' || v_order.id,
    v_order.id
  );

  insert into public.notifications (user_id, audience, type, title, body, href, order_id)
  values (
    null, 'ADMIN', 'ORDER',
    'New order ' || v_order.reference,
    coalesce(v_order.customer_name, 'A customer') || ' placed an order worth ₦' ||
      to_char(v_order.total, 'FM999,999,999') || ' — receipt attached for confirmation.',
    '/Admin/Orders?order=' || v_order.id,
    v_order.id
  );

  if v_promo_id is not null then
    update public.promos set uses = uses + 1 where id = v_promo_id;
    insert into public.promo_redemptions (promo_id, order_id, user_id, code, amount)
    values (v_promo_id, v_order.id, v_uid, upper(trim(p_promo)), v_discount);
  end if;

  return jsonb_build_object(
    'order', to_jsonb(v_order),
    'items', (
      select coalesce(jsonb_agg(to_jsonb(i) order by i.title), '[]'::jsonb)
      from public.order_items i where i.order_id = v_order.id
    )
  );
end;
$$;

grant execute on function public.place_order(jsonb, jsonb, text, jsonb) to authenticated;

-- -------------------------------------------------- admin order lifecycle ---
create or replace function public.admin_update_order(
  p_order_id uuid,
  p_status text default null,
  p_payment_status text default null,
  p_courier text default null,
  p_tracking text default null,
  p_note text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_actor public.profiles;
  v_status text;
  v_payment text;
  v_message text;
  v_rank constant text[] := array['PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  select * into v_actor from public.profiles where id = auth.uid();
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  v_status := coalesce(nullif(trim(p_status), ''), v_order.status);
  v_payment := coalesce(nullif(trim(p_payment_status), ''), v_order.payment_status);

  if v_status = 'PAYMENT_CONFIRMED' then
    v_payment := 'PAID';
  end if;
  if v_payment = 'PAID' and v_order.status = 'PENDING_PAYMENT' and v_status = v_order.status then
    v_status := 'PAYMENT_CONFIRMED';
  end if;
  if v_payment = 'PAID' and v_order.status = 'PENDING_PAYMENT' and v_status <> 'CANCELLED' then
    v_status := 'PAYMENT_CONFIRMED';
  end if;

  if v_order.status in ('DELIVERED', 'CANCELLED') and v_status <> v_order.status then
    raise exception 'INVALID_TRANSITION: this order is already closed';
  end if;

  if v_status <> v_order.status and v_status <> 'CANCELLED' then
    if coalesce(array_position(v_rank, v_status), 0) <= coalesce(array_position(v_rank, v_order.status), 0) then
      raise exception 'INVALID_TRANSITION: orders only move forward';
    end if;
  end if;

  if v_status = 'CANCELLED' and v_order.status <> 'CANCELLED' then
    update public.products p
    set stock = p.stock + i.qty
    from public.order_items i
    where i.order_id = v_order.id and p.id = i.product_id;
  end if;

  update public.orders set
    status = v_status,
    payment_status = v_payment,
    payment_confirmed_at = case when v_payment = 'PAID' then coalesce(payment_confirmed_at, now()) else payment_confirmed_at end,
    packed_at = case when v_status in ('PROCESSING', 'SHIPPED', 'DELIVERED') then coalesce(packed_at, now()) else packed_at end,
    shipped_at = case when v_status in ('SHIPPED', 'DELIVERED') then coalesce(shipped_at, now()) else shipped_at end,
    delivered_at = case when v_status = 'DELIVERED' then coalesce(delivered_at, now()) else delivered_at end,
    cancelled_at = case when v_status = 'CANCELLED' then coalesce(cancelled_at, now()) else cancelled_at end,
    courier = coalesce(nullif(trim(p_courier), ''), courier),
    tracking_number = coalesce(nullif(trim(p_tracking), ''), tracking_number),
    updated_at = now()
  where id = v_order.id
  returning * into v_order;

  v_message := case v_status
    when 'PAYMENT_CONFIRMED' then 'Payment confirmed — your order is queued for packing.'
    when 'PROCESSING' then 'Your order is being packed in Shomolu.'
    when 'SHIPPED' then 'Your order has been shipped' || coalesce(' via ' || nullif(trim(p_courier), ''), '') ||
      coalesce(' (tracking ' || nullif(trim(p_tracking), '') || ')', '') || '.'
    when 'DELIVERED' then 'Delivered — we hope you love your glow.'
    when 'CANCELLED' then coalesce(nullif(trim(p_note), ''), 'Your order was cancelled. Reach out if this is unexpected.')
    else 'Your order was updated.'
  end;

  insert into public.order_events (order_id, type, message, actor_name, actor_role)
  values (
    v_order.id,
    'STATUS_' || v_status,
    v_message,
    coalesce(nullif(trim(concat_ws(' ', v_actor.first_name, v_actor.last_name)), ''), 'Admin'),
    'ADMIN'
  );

  insert into public.notifications (user_id, audience, type, title, body, href, order_id)
  values (
    v_order.user_id, 'USER', 'ORDER',
    'Order ' || v_order.reference || ' · ' || initcap(replace(v_status, '_', ' ')),
    v_message,
    '/Orders?order=' || v_order.id,
    v_order.id
  );

  update public.notifications
  set read_at = now()
  where order_id = v_order.id and audience = 'ADMIN' and read_at is null;

  return jsonb_build_object('order', to_jsonb(v_order));
end;
$$;

grant execute on function public.admin_update_order(uuid, text, text, text, text, text) to authenticated;

-- ------------------------------------------------------------- admin stats ---
create or replace function public.admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  return jsonb_build_object(
    'orders', (select count(*) from public.orders),
    'pendingPayments', (select count(*) from public.orders where status = 'PENDING_PAYMENT'),
    'processing', (select count(*) from public.orders where status in ('PAYMENT_CONFIRMED', 'PROCESSING')),
    'shipped', (select count(*) from public.orders where status = 'SHIPPED'),
    'delivered', (select count(*) from public.orders where status = 'DELIVERED'),
    'cancelled', (select count(*) from public.orders where status = 'CANCELLED'),
    'customers', (select count(*) from public.profiles where role = 'CUSTOMER'),
    'products', (select count(*) from public.products where status = 'ACTIVE'),
    'lowStock', (select count(*) from public.products where status = 'ACTIVE' and stock <= low_stock_at),
    'revenue', (select coalesce(sum(total), 0) from public.orders where payment_status = 'PAID'),
    'pendingRevenue', (select coalesce(sum(total), 0) from public.orders where status = 'PENDING_PAYMENT'),
    'refunds', (select coalesce(sum(total), 0) from public.orders where payment_status = 'REFUNDED'),
    'discounts', (select coalesce(sum(discount), 0) from public.orders),
    'unitsSold', (
      select coalesce(sum(i.qty), 0) from public.order_items i
      join public.orders o on o.id = i.order_id
      where o.payment_status = 'PAID'
    ),
    'averageOrder', (
      select coalesce(round(avg(total))::integer, 0) from public.orders where payment_status = 'PAID'
    )
  );
end;
$$;

grant execute on function public.admin_overview() to authenticated;

create or replace function public.admin_finances()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  return jsonb_build_object(
    'monthly', (
      select coalesce(jsonb_agg(row_to_json(m) order by m.month), '[]'::jsonb)
      from (
        select
          to_char(months.month, 'YYYY-MM') as month,
          to_char(months.month, 'Mon') as label,
          coalesce(sum(o.total) filter (where o.payment_status = 'PAID'), 0)::integer as revenue,
          count(o.id) filter (where o.payment_status = 'PAID')::integer as orders
        from generate_series(
          date_trunc('month', now()) - interval '5 months',
          date_trunc('month', now()),
          interval '1 month'
        ) as months(month)
        left join public.orders o on date_trunc('month', o.placed_at) = months.month
        group by months.month
      ) m
    ),
    'topProducts', (
      select coalesce(jsonb_agg(row_to_json(t) order by t.revenue desc), '[]'::jsonb)
      from (
        select i.title, sum(i.qty)::integer as units, sum(i.line_total)::integer as revenue
        from public.order_items i
        join public.orders o on o.id = i.order_id
        where o.payment_status = 'PAID'
        group by i.title
        order by revenue desc
        limit 5
      ) t
    ),
    'promos', (
      select coalesce(jsonb_agg(row_to_json(p) order by p.amount desc), '[]'::jsonb)
      from (
        select r.code, count(*)::integer as redemptions, sum(r.amount)::integer as amount
        from public.promo_redemptions r
        group by r.code
      ) p
    ),
    'payments', (
      select jsonb_build_object(
        'paid', coalesce(sum(total) filter (where payment_status = 'PAID'), 0)::integer,
        'awaiting', coalesce(sum(total) filter (where payment_status = 'AWAITING_CONFIRMATION'), 0)::integer,
        'refunded', coalesce(sum(total) filter (where payment_status = 'REFUNDED'), 0)::integer
      )
      from public.orders
    )
  );
end;
$$;

grant execute on function public.admin_finances() to authenticated;

-- ------------------------------------------------------- storefront demand ---
-- Public, aggregate-only view of which categories are actually selling this
-- month. Revenue and customer details never leave the database.
create or replace function public.category_demand(p_limit integer default 6)
returns table (category text, units bigint, products integer, image text)
language sql
stable
security definer
set search_path = public
as $$
  with sold as (
    select p.category, sum(i.qty)::bigint as units
    from public.order_items i
    join public.orders o on o.id = i.order_id
    join public.products p on p.id = i.product_id
    where o.payment_status = 'PAID'
      and o.status <> 'CANCELLED'
      and o.placed_at >= date_trunc('month', now())
      and p.status = 'ACTIVE'
    group by p.category
  )
  select
    sold.category,
    sold.units,
    (
      select count(*)::integer from public.products p
      where p.category = sold.category and p.status = 'ACTIVE'
    ) as products,
    (
      select p.image from public.products p
      where p.category = sold.category and p.status = 'ACTIVE'
      order by p.featured desc, p.rating_count desc, p.created_at asc
      limit 1
    ) as image
  from sold
  order by sold.units desc, sold.category asc
  limit greatest(1, least(coalesce(p_limit, 6), 12));
$$;

grant execute on function public.category_demand(integer) to anon, authenticated;

-- ------------------------------------------------------------------ storage ---
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'products', 'products', true, 5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'receipts', 'receipts', false, 8388608,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update set public = false;

drop policy if exists products_public_read on storage.objects;
create policy products_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'products');

drop policy if exists products_admin_write on storage.objects;
create policy products_admin_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists products_admin_update on storage.objects;
create policy products_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists products_admin_delete on storage.objects;
create policy products_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

drop policy if exists avatars_owner_write on storage.objects;
create policy avatars_owner_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_owner_update on storage.objects;
create policy avatars_owner_update on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists avatars_owner_delete on storage.objects;
create policy avatars_owner_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists receipts_owner_read on storage.objects;
create policy receipts_owner_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists receipts_owner_write on storage.objects;
create policy receipts_owner_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists receipts_owner_delete on storage.objects;
create policy receipts_owner_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'receipts'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- -------------------------------------------------------------------- done ---
-- Next: run supabase/seed.sql, then supabase/README.md for the admin bootstrap.
