-- ====================================================================
-- Algeria COD eCommerce Professional Product & Inventory Redesign Schema
-- ====================================================================

-- 1. BASE TABLE ENHANCEMENTS
-- Add supporting columns to public.products to handle Category & Image metadata safely
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images text[];
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;

-- Add supporting variants columns for granular tracking (colors, sizes, pack quantities)
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS size text;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS pack_quantity integer DEFAULT 1;


-- 2. SEED BRANDS (Fully customizable for future brands)
INSERT INTO public.brands (id, name, description)
VALUES 
  ('b1111111-1111-1111-1111-111111111111', 'RYO BAGS', 'Sacs à main féminins chics de haute couture'),
  ('b2222222-2222-2222-2222-222222222222', 'RYO RIDERS', 'Accessoires urbains authentiques et streetwear de performance')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;


-- 3. SEED PRODUCTS
-- A) Crystal Bag SR (Women Handbags)
INSERT INTO public.products (id, brand_id, sku, name, category, purchase_price, price, stock_quantity, min_stock_alert, is_active, weight_kg, description)
VALUES (
  'p1111111-1111-1111-1111-111111111111',
  'b1111111-1111-1111-1111-111111111111',
  'CRY-BAG-SR',
  'Crystal Bag SR',
  'Women Handbags',
  1200.00,
  3700.00,
  64, -- 55 (Silver) + 9 (Blue)
  5,
  true,
  0.60,
  'Exquis sac en cristal de luxe avec bandoulière détachable. Conçu par la marque de luxe RYO BAGS pour des apparitions élégantes.'
)
ON CONFLICT (sku) DO UPDATE SET 
  brand_id = EXCLUDED.brand_id,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  purchase_price = EXCLUDED.purchase_price,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  description = EXCLUDED.description;

-- B) Durag (Durags)
INSERT INTO public.products (id, brand_id, sku, name, category, purchase_price, price, stock_quantity, min_stock_alert, is_active, weight_kg, description)
VALUES (
  'p2222222-2222-2222-2222-222222222222',
  'b2222222-2222-2222-2222-222222222222',
  'RYO-DRG',
  'Durag Satin Silky',
  'Durags',
  700.00,
  1900.00,
  15, -- 11 (Black) + 4 (White)
  5,
  true,
  0.10,
  'Durag satiné de haute qualité par RYO RIDERS pour maintien idéal des waves et confort extrême.'
)
ON CONFLICT (sku) DO UPDATE SET 
  brand_id = EXCLUDED.brand_id,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  purchase_price = EXCLUDED.purchase_price,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  description = EXCLUDED.description;

-- C) Cooling Arm Sleeves (Arm Sleeves)
INSERT INTO public.products (id, brand_id, sku, name, category, purchase_price, price, stock_quantity, min_stock_alert, is_active, weight_kg, description)
VALUES (
  'p3333333-3333-3333-3333-333333333333',
  'b2222222-2222-2222-2222-222222222222',
  'RYO-ARM-SLV',
  'Cooling Arm Sleeves',
  'Arm Sleeves',
  200.00,
  1400.00,
  100, -- 73 (Black pairs) + 14 (Pink pairs) + 13 (White pairs)
  10,
  true,
  0.15,
  'Manchettes ultra-rafraîchissantes de protection UV. Vendu exclusivement par paire. Offres spéciales applicables : 1 paire = 1400 DA, 2 paires = 2600 DA, 3 paires = 3900 DA.'
)
ON CONFLICT (sku) DO UPDATE SET 
  brand_id = EXCLUDED.brand_id,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  purchase_price = EXCLUDED.purchase_price,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity,
  description = EXCLUDED.description;


-- 4. SEED PRODUCT VARIANTS
-- Crystal Bag SR Variants
INSERT INTO public.product_variants (id, product_id, sku, name, stock_quantity, color, size, pack_quantity)
VALUES 
  ('v1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'CRY-BAG-SR-SLV', 'Crystal Bag SR - Silver', 55, 'Silver', 'Unique', 1),
  ('v2222222-2222-2222-2222-222222222222', 'p1111111-1111-1111-1111-111111111111', 'CRY-BAG-SR-BLU', 'Crystal Bag SR - Blue', 9, 'Blue', 'Unique', 1)
ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

-- Durag Variants
INSERT INTO public.product_variants (id, product_id, sku, name, stock_quantity, color, size, pack_quantity)
VALUES 
  ('v3333333-3333-3333-3333-333333333333', 'p2222222-2222-2222-2222-222222222222', 'RYO-DRG-BLK', 'Durag Satin Silky - Black', 11, 'Black', 'Unique', 1),
  ('v4444444-4444-4444-4444-444444444444', 'p2222222-2222-2222-2222-222222222222', 'RYO-DRG-WHT', 'Durag Satin Silky - White', 4, 'White', 'Unique', 1)
ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;

-- Cooling Arm Sleeves Variants (Quantités gérées en paires réelles)
INSERT INTO public.product_variants (id, product_id, sku, name, stock_quantity, color, size, pack_quantity)
VALUES 
  ('v5555555-5555-5555-5555-555555555555', 'p3333333-3333-3333-3333-333333333333', 'RYO-SLV-BLK', 'Cooling Arm Sleeves - Black', 73, 'Black', 'Paire', 1),
  ('v6666666-6666-6666-6666-666666666666', 'p3333333-3333-3333-3333-333333333333', 'RYO-SLV-PNK', 'Cooling Arm Sleeves - Pink', 14, 'Pink', 'Paire', 1),
  ('v7777777-7777-7777-7777-777777777777', 'p3333333-3333-3333-3333-333333333333', 'RYO-SLV-WHT', 'Cooling Arm Sleeves - White', 13, 'White', 'Paire', 1)
ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity;


-- 5. INITIAL AUDITED STOCK INVENTORY HISTORY MOVEMENTS
INSERT INTO public.inventory_movements (id, product_id, variant_id, quantity, type, reason)
VALUES
  ('m1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'v1111111-1111-1111-1111-111111111111', 55, 'stock_in', 'Saisie de stock initial (Silver) - 55 unités'),
  ('m2222222-2222-2222-2222-222222222222', 'p1111111-1111-1111-1111-111111111111', 'v2222222-2222-2222-2222-222222222222', 9, 'stock_in', 'Saisie de stock initial (Blue) - 9 unités'),
  ('m3333333-3333-3333-3333-333333333333', 'p2222222-2222-2222-2222-222222222222', 'v3333333-3333-3333-3333-333333333333', 11, 'stock_in', 'Saisie de stock initial (Black) - 11 unités'),
  ('m4444444-4444-4444-4444-444444444444', 'p2222222-2222-2222-2222-222222222222', 'v4444444-4444-4444-4444-444444444444', 4, 'stock_in', 'Saisie de stock initial (White) - 4 unités'),
  ('m5555555-5555-5555-5555-555555555555', 'p3333333-3333-3333-3333-333333333333', 'v5555555-5555-5555-5555-555555555555', 73, 'stock_in', 'Saisie de stock initial (Black) - 73 paires'),
  ('m6666666-6666-6666-6666-666666666666', 'p3333333-3333-3333-3333-333333333333', 'v6666666-6666-6666-6666-666666666666', 14, 'stock_in', 'Saisie de stock initial (Pink) - 14 paires'),
  ('m7777777-7777-7777-7777-777777777777', 'p3333333-3333-3333-3333-333333333333', 'v7777777-7777-7777-7777-777777777777', 13, 'stock_in', 'Saisie de stock initial (White) - 13 paires')
ON CONFLICT DO NOTHING;
