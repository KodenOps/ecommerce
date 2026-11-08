# QueenFizzie

A full-stack beauty storefront for Nigerian skin — original skincare, body
routines, candles and gift sets, delivered nationwide from Shomolu, Lagos.

The app is a Next.js 13 project (Pages Router for the shop, App Router entry for
`/`) with **Supabase** as the entire backend: Auth, Postgres, Row Level Security
and Storage. There is no ORM and no custom server — business rules live in SQL
functions so the database stays the source of truth.

## What is included

**Storefront**

- Home, shop with category/search filters, product pages, promos, cart and
  favourites that work for guests.
- Cart and favourites persist on the device; favourites sync to the account once
  signed in.
- Installable PWA (manifest, service worker, offline page).

**Buyer account** (`/Login`, `/Register`, `/Account`)

- Email + password auth. **Phone number is required at registration** and stored
  on the profile; duplicates are rejected case-by-case through `phone_available`.
- Profile menu in the nav: avatar upload, delivery address book, phone update,
  password change, order history.
- Checkout is blocked for guests — they can browse and fill a bag, but must sign
  in before placing an order.
- Checkout validates stock and promo codes server-side, accepts a payment
  receipt (image or PDF), and creates the order atomically via `place_order`.
- Order tracking timeline driven by `order_events`, plus an in-app notification
  bell.

**Admin panel** (`/Admin` → `/Admin/Dashboard`)

Every page is server-guarded on `profiles.role = 'ADMIN'`; the role is never read
from client-supplied data.

| Page | What it does |
| --- | --- |
| Dashboard | Revenue, pending payments, order queue, customers, low stock |
| Orders | Filter/search, view receipts, confirm payments, move status, courier + tracking, cancel with restock |
| Products | Create/edit/archive products, quick stock adjustments |
| Promos | Create percent/fixed codes, minimum spend, usage caps, expiry, pause/delete |
| Finances | Confirmed/awaiting/refunded revenue, six-month chart, top products, promo cost |
| Customers | Searchable contact records with phone, default address, orders and spend |
| Inbox | Admin order alerts, mark read, broadcast announcements to all customers |

## Stack

- Next.js 13.4 (React 18), Tailwind CSS
- Supabase: `@supabase/supabase-js`, `@supabase/ssr` (cookie-based sessions)
- Redux Toolkit + `next-redux-wrapper` for cart/favourites state
- react-icons, Playwright (dev)

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then copy the project
URL and **anon** public key.

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Only the public anon key is used. The `service_role` key must never be placed in
the app: all privileged work runs inside `SECURITY DEFINER` SQL functions that
check `profiles.role`.

### 3. Create the schema and seed data

In the Supabase **SQL Editor**, run in order:

1. [`supabase/schema.sql`](./supabase/schema.sql) — tables, triggers, RLS,
   storage buckets and lifecycle functions (`place_order`, `admin_update_order`,
   `admin_overview`, `admin_finances`, `validate_promo`, `phone_available`).
2. [`supabase/seed.sql`](./supabase/seed.sql) — 12-product launch catalogue and
   two promos (`GLOW10`, `OWAMBE5000`).

Or with `psql`:

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

### 4. Configure auth

**Authentication → Providers → Email**: enable Email. Turn **Confirm email** off
for a frictionless local flow; if you keep it on, new accounts confirm by email
before their first sign-in (the UI handles both).

**Authentication → URL Configuration**: set the Site URL to your app origin and
add `http://localhost:3000` to the redirect allow list.

### 5. Create the first administrator

1. Register normally at `/Register` (phone is required).
2. Promote the account in the SQL Editor:

```sql
update public.profiles set role = 'ADMIN' where email = 'you@example.com';
```

Sign out and back in, then open `/Admin`. See
[`supabase/README.md`](./supabase/README.md) for the full setup and role matrix.

### 6. Run

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint    # eslint
```

## Project layout

```
src/
  app/                 App Router entry, global styles, metadata
  pages/               Pages Router routes (storefront, account, admin, API)
    api/               Route handlers: auth, profile, cart-free orders, admin
    Admin/             Dashboard, Orders, Products, Promos, Finances, Users, Inbox
  components/          Layout, nav, profile menu, notification bell, admin shell
  lib/
    supabase/          Cookie-bound server client + storage helpers
    productMapper.js   Postgres rows → client shapes
    routeGuards.js     SSR auth/admin guards
    apiHelpers.js      Method/origin guards, session + admin checks, error mapping
    status.js          Order/payment lifecycle labels and transitions
  store/               Redux store: catalogue, cart, favourites
supabase/
  schema.sql           Source of truth for the database
  seed.sql             Launch catalogue and promos
  README.md            Setup, admin bootstrap, role matrix
public/
  manifest.webmanifest PWA manifest
  sw.js                App-shell service worker + offline fallback
  icons/               Install icons (regular, maskable, apple-touch)
```

## Security model

- Sessions are HTTP-only Supabase cookies; API routes resolve the user
  server-side and never trust IDs from the request body.
- Row Level Security is enabled on every table. Customers see only their own
  orders, addresses, favourites and notifications; admins read everything.
- Profile `role` is protected by a trigger and column grants — users can update
  their name, phone, avatar and preferences but never their role.
- Orders are written only through `place_order` (server-computed prices, promo
  validation, stock decrement) and `admin_update_order` (validated transitions,
  restock on cancel, timeline + buyer notification).
- Receipts live in a private bucket and are streamed through an authenticated
  API route; avatars live in a public bucket scoped to `<user-id>/`.

## Order lifecycle

```
PENDING_PAYMENT → PAYMENT_CONFIRMED → PROCESSING → SHIPPED → DELIVERED
```

`CANCELLED` is reachable until delivery and returns stock. Payment status is
tracked separately (`AWAITING_CONFIRMATION`, `PAID`, `REFUNDED`, `FAILED`).

## Deployment

Deploy the Next.js app anywhere that runs Node 18+ (Vercel, Fly, a VPS). Set the
two `NEXT_PUBLIC_SUPABASE_*` variables in the host, add the production origin to
Supabase's Site URL and redirect allow list, and keep the PWA served from the
same origin so the service worker scope covers `/`.
