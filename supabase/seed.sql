-- QueenFizzie starter catalogue + launch promos.
-- Run after supabase/schema.sql. Safe to re-run (matches on slug/code).

insert into public.products (slug, title, sku, description, category, price, old_price, image, stock, low_stock_at, status, featured, rating_rate, rating_count)
values
  ('zobo-dew-hydrating-serum', 'Zobo Dew Hydrating Serum', 'QF-001',
   'A weightless water-serum brewed with zobo, hyaluronic acid and cucumber extract. Sinks in fast, calms Lagos heat, and leaves skin looking freshly watered — no shine, no stickiness.',
   'Skincare', 19000, 38000, 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=768&q=80', 25, 5, 'ACTIVE', true, 4.90, 1288),
  ('hibiscus-petal-lip-glow', 'Hibiscus Petal Lip Glow', 'QF-002',
   'A tinted lip oil made for melanin-rich lips: hibiscus colour, shea softness, and a glossy finish that survives small chops and owambe photos. Comfortable, never sticky.',
   'Lips & Blush', 14500, 23000, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=768&q=80', 25, 5, 'ACTIVE', false, 4.70, 940),
  ('owambe-rose-body-mist', 'Owambe Rose Body Mist', 'QF-003',
   'A body mist with rose, vanilla and soft musk that holds up through the whole party. Spritz on skin, gele, or aso-oke for a warm trail that lasts the evening.',
   'Mists & Toners', 17000, 29000, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=768&q=80', 25, 5, 'ACTIVE', false, 4.60, 720),
  ('dudu-black-soap-cleansing-balm', 'Dudu Black Soap Cleansing Balm', 'QF-004',
   'Our traditional black soap, reimagined as a silky balm. Melts into a cloud, lifts the day (and the harmattan dust) and leaves skin clean, soft and never tight.',
   'Skincare', 21500, 33500, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=768&q=80', 25, 5, 'ACTIVE', true, 4.80, 1102),
  ('shea-baobab-glow-oil', 'Shea & Baobab Glow Oil', 'QF-005',
   'A shimmering dry body oil with unrefined shea, baobab and golden mica. Made for deep skin tones that want to catch the light at the next owambe.',
   'Body Glow', 25000, 42000, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=768&q=80', 25, 5, 'ACTIVE', false, 4.70, 864),
  ('lekki-nights-rose-candle', 'Lekki Nights Rose Candle', 'QF-006',
   'A quiet candle in notes of rose, cream and amber — the calm after a loud Lagos day. Burn it while you unwind, and let the whole room soften.',
   'Scented Candles', 20500, 32500, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=768&q=80', 25, 5, 'ACTIVE', false, 4.80, 1050),
  ('naija-nude-lip-oil-trio', 'Naija Nude Lip Oil Trio', 'QF-007',
   'Three nude tints made for Nigerian skin: berry, warm peach and deep rose. Stackable, swipeable, and the easiest way to find your everyday lip colour.',
   'Lips & Blush', 29000, 47000, 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=768&q=80', 25, 5, 'ACTIVE', true, 4.60, 680),
  ('gold-coast-eye-glow-stick', 'Gold Coast Eye Glow Stick', 'QF-008',
   'A creamy eye glow stick that brightens lids, softens creases and adds just enough sparkle for church, brunch or a last-minute date.',
   'Lips & Blush', 13000, 20500, 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=768&q=80', 4, 5, 'ACTIVE', false, 4.60, 520),
  ('zobo-mint-facial-mist', 'Zobo & Mint Facial Mist', 'QF-009',
   'A chilled mist of zobo, mint and glycerin. Refresh a hot afternoon, set makeup, or cool an annoyed mood. Very soft on the skin.',
   'Mists & Toners', 15500, 25000, 'https://images.unsplash.com/photo-1617897903246-719242758050?w=768&q=80', 25, 5, 'ACTIVE', false, 4.50, 432),
  ('sun-kissed-highlighter-drops', 'Sun-Kissed Highlighter Drops', 'QF-010',
   'Liquid highlighter with a pearlescent melt — champagne gold for lighter tones, rose gold for deeper tones. Dab it on cheekbones and let your face do the talking.',
   'Lips & Blush', 18000, 27500, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=768&q=80', 25, 5, 'ACTIVE', true, 4.80, 1340),
  ('harmattan-defence-moisture-cream', 'Harmattan Defence Moisture Cream', 'QF-011',
   'A rich moisture cream for harmattan mornings and air-conditioned offices. Shea, oat and squalane for skin that wants to stay calm, plump and glowy.',
   'Skincare', 24000, 37000, 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?w=768&q=80', 25, 5, 'ACTIVE', false, 4.70, 990),
  ('queens-owambe-gift-box', 'Queen''s Owambe Gift Box', 'QF-012',
   'A curated mini haul in a reusable box: lip oil, body mist, shea balm and a candle trinket. Perfect for a bridal train, a best friend, or a well-deserved self-treat.',
   'Gifts & Sets', 53000, 78000, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=768&q=80', 25, 5, 'ACTIVE', true, 4.90, 2100)
on conflict (sku) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  price = excluded.price,
  old_price = excluded.old_price,
  image = excluded.image,
  stock = excluded.stock,
  low_stock_at = excluded.low_stock_at,
  status = excluded.status,
  featured = excluded.featured,
  rating_rate = excluded.rating_rate,
  rating_count = excluded.rating_count;

insert into public.product_variants (product_id, value, label, price, stock, is_default)
select p.id, 'default', 'Standard', p.price, p.stock, true
from public.products p
on conflict (product_id, value) do update set
  label = excluded.label,
  price = excluded.price,
  stock = excluded.stock,
  is_default = excluded.is_default;

insert into public.promos (code, description, type, value, min_subtotal, max_uses, active)
values
  ('GLOW10', '10% off any bag over ₦20,000', 'PERCENT', 10, 20000, 500, true),
  ('OWAMBE5000', '₦5,000 off bags over ₦60,000', 'FIXED', 5000, 60000, 200, true)
on conflict (code) do nothing;

insert into public.notifications (id, audience, type, title, body, href)
values (
  '00000000-0000-4000-8000-000000000001',
  'ADMIN',
  'SYSTEM',
  'Admin workspace ready',
  'New orders, payment receipts and stock alerts will land in this inbox.',
  '/Admin/Orders'
)
on conflict (id) do nothing;
