CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  price_paise INTEGER NOT NULL CHECK (price_paise >= 0),
  original_price_paise INTEGER,
  collection TEXT NOT NULL,
  description TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_url TEXT,
  badge TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'paid', 'cancelled', 'refunded')),
  total_paise INTEGER NOT NULL CHECK (total_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  items JSONB NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_status_created_at_idx
  ON orders (status, created_at DESC);

CREATE TABLE IF NOT EXISTS subscribers (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO products (
  id,
  name,
  price_paise,
  original_price_paise,
  collection,
  description,
  stock,
  sizes,
  colors,
  image_url,
  badge
) VALUES
(
  1,
  'PHANTOM OVERSIZED HOODIE',
  38000,
  52000,
  'Phantom Series',
  'Constructed from 600gsm brushed cotton fleece. French terry interior. Dropped shoulders, oversized silhouette. The streets deserve better.',
  47,
  '["XS","S","M","L","XL"]',
  '["#0a0a0a","#1a1a2e","#2c2c2c","#c0392b"]',
  '/assets/products/shadow_crew.jpg',
  'LIMITED DROP'
),
(
  2,
  'PHANTOM TEE',
  12000,
  16000,
  'Phantom Series',
  'Heavyweight 240gsm jersey cotton. Pre-washed for perfect drape. The foundation piece of the Phantom Series.',
  80,
  '["XS","S","M","L","XL"]',
  '["#0a0a0a","#2c2c2c"]',
  '/assets/products/phantom_tee.jpg',
  'LIMITED DROP'
),
(
  3,
  'NOIR CARGO PANTS',
  28000,
  38000,
  'Noir Division',
  'Technical ripstop cargo. Articulated knees, 8-pocket system. Built for the streets, refined for luxury.',
  35,
  '["XS","S","M","L","XL"]',
  '["#0a0a0a","#2c2c2c"]',
  '/assets/products/cargo_pants.jpg',
  'NEW ARRIVAL'
),
(
  4,
  'BLOOD JACKET',
  52000,
  72000,
  'Blood Lines',
  'Waxed cotton shell. Quilted lining. The statement piece from the collection that changed everything.',
  0,
  '["S","M","L","XL"]',
  '["#0a0a0a","#c0392b"]',
  '/assets/products/blood_jacket.jpg',
  'SOLD OUT'
),
(
  5,
  'NOIR CAP',
  9500,
  12000,
  'Noir Division',
  'Structured 6-panel cap. Embroidered INZZOUT wordmark. Adjustable leather strap.',
  60,
  '["ONE SIZE"]',
  '["#0a0a0a","#1a1a2e","#c0392b"]',
  '/assets/products/noir_cap.jpg',
  'NEW ARRIVAL'
),
(
  6,
  'MOVEMENT JOGGERS',
  19500,
  26000,
  'Phantom Series',
  'Ultra-soft 380gsm terry. Tapered fit. The kind of comfort you wear outside.',
  55,
  '["XS","S","M","L","XL"]',
  '["#0a0a0a","#2c2c2c"]',
  '/assets/products/movement_joggers.jpg',
  'LIMITED DROP'
),
(
  7,
  'PHANTOM VEST',
  22000,
  29500,
  'Phantom Series',
  'Heavyweight puffer vest. Water-resistant shell. Street utility meets luxury warmth.',
  25,
  '["XS","S","M","L","XL"]',
  '["#0a0a0a","#1a1a2e"]',
  '/assets/products/phantom_vest.jpg',
  'LIMITED DROP'
),
(
  8,
  'DARK SHORTS',
  14500,
  19000,
  'Noir Division',
  'Relaxed-fit shorts in technical nylon. 7-inch inseam. Side cargo pockets. Built for summer streets.',
  70,
  '["XS","S","M","L","XL"]',
  '["#0a0a0a","#2c2c2c","#c0392b"]',
  '/assets/products/dark_shorts.jpg',
  'NEW ARRIVAL'
)
ON CONFLICT (id) DO NOTHING;

