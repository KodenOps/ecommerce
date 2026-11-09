# QueenFizzie — Supabase backend setup

Everything (auth, database, files) runs on Supabase. There is **no service-role
key in the app**: the browser/server use the publishable key plus the signed-in
user's session, and Row Level Security decides what is allowed.

## 1. Create the project

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. **Project Settings → API** → copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / publishable key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Put them in `.env.local` (already git-ignored):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

These two values are public by design; they are the same ones shipped in the
browser bundle. Never add a `service_role` key to this project.

## 2. Create the schema

Supabase Dashboard → **SQL Editor** → paste and run, in order:

1. [`schema.sql`](./schema.sql) — tables, RLS policies, storage buckets,
   lifecycle functions (`place_order`, `admin_update_order`, `admin_overview`,
   `admin_finances`).
2. [`seed.sql`](./seed.sql) — the 12-product launch catalogue and two promos.

`schema.sql` is safe to run again: it adds any column a newer version of the
app needs (for example the variant columns on `order_items`) and replaces the
SQL functions. Run it whenever you pull an update that touches the backend —
skipping it leaves the database on an older shape and orders cannot be saved.

Or from a machine with `psql`:

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

## 3. Auth settings

**Authentication → Providers → Email**: enable Email. For a smooth local
experience turn **Confirm email** off; if you keep it on, a new account must
confirm by email before the first sign-in (the UI handles both).

**Authentication → URL Configuration**: set Site URL to your app origin and add
`http://localhost:3000` (and your preview origin) to the redirect list.

## 4. Create the first administrator

1. Start the app and register normally at `/Register` (phone is required).
2. In SQL Editor, promote that account and make sure it has a phone:

```sql
update public.profiles
set role = 'ADMIN'
where email = 'you@example.com';
```

Sign out and back in, then open `/Admin`. Every `/Admin/*` page checks
`profiles.role = 'ADMIN'` on the server and redirects everyone else.

## Roles and data

| Table | Read | Write |
| --- | --- | --- |
| `profiles` | own row, admins all | own columns only (role is not writable via API) |
| `addresses` | own, admins all | own |
| `products` | everyone (ACTIVE), admins all | admins |
| `promos` | active codes, admins all | admins |
| `orders` / items / events | own orders, admins all | only through `place_order` and `admin_update_order` |
| `notifications` | own inbox; admins share the ADMIN inbox | mark read; admins can broadcast |
| `favorites` | own | own |

Storage buckets created by `schema.sql`:

- `avatars` (public read) — uploads are forced into `<user-id>/…` by RLS.
- `receipts` (private) — readable by the owner and admins only; the app serves
  them through an authenticated API route.

## Order lifecycle

`PENDING_PAYMENT → PAYMENT_CONFIRMED → PROCESSING → SHIPPED → DELIVERED`,
with `CANCELLED` reachable until delivery. Admins can also record courier and
tracking details, confirm/refund payments, and every transition writes an
`order_events` row plus a buyer notification.

## Phone numbers

Registration requires a Nigerian mobile number, normalised to
`+234XXXXXXXXXX` and stored uniquely on `profiles.phone`. It is the contact
number for delivery and is visible to the buyer in the profile menu and to
admins in the customer list.
