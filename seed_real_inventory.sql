-- ====================================================================
-- SEED REAL INVENTORY
-- ====================================================================
-- Description: Seeding script to populate the Supabase DB tables with
-- real inventory data. Bypasses client RLS by executing as postgres role.
-- Paste and execute this in your Supabase SQL Editor.
-- ====================================================================

-- 1. Clean up existing catalog data in correct relational order
DELETE FROM public.inventory_movements;
DELETE FROM public.product_variants;
DELETE FROM public.products;
DELETE FROM public.brands;

-- 2. Seed Brands
INSERT INTO public.brands (id, name, description, logo_url, website)
VALUES 
  (
    'b1111111-1111-1111-1111-111111111111', 
    'RYO BAGS', 
    'Sacs à main féminins chics de haute couture', 
    NULL, 
    NULL
  ),
  (
    'b2222222-2222-2222-2222-222222222222', 
    'RYO RIDERS', 
    'Accessoires urbains authentiques et streetwear de performance', 
    NULL, 
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Products
INSERT INTO public.products (
  id, 
  brand_id, 
  sku, 
  name, 
  description, 
  purchase_price, 
  price, 
  stock_quantity, 
  min_stock_alert, 
  is_active, 
  weight_kg
)
VALUES 
  (
    'p1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'CRY-BAG-SR',
    'Crystal Bag SR',
    'Exquis sac en cristal de luxe avec bandoulière détachable. Style chic et moderne de la collection RYO BAGS, idéal pour les occasions uniques.',
    1200.00,
    3700.00,
    64,
    5,
    TRUE,
    0.60
  ),
  (
    'p2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'RYO-DRG',
    'Durag Satin Silky',
    'Durag satiné de haute qualité par RYO RIDERS pour maintien idéal des waves et confort extrême.',
    700.00,
    1900.00,
    15,
    5,
    TRUE,
    0.10
  ),
  (
    'p3333333-3333-3333-3333-333333333333',
    'b2222222-2222-2222-2222-222222222222',
    'RYO-ARM-SLV',
    'Cooling Arm Sleeves',
    'Manchettes ultra-rafraîchissantes de protection UV. Vendu exclusivement par paire. Offres : 1 paire = 1400 DA, 2 paires = 2600 DA, 3 paires = 3900 DA.',
    200.00,
    1400.00,
    100,
    10,
    TRUE,
    0.15
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Product Variants
INSERT INTO public.product_variants (
  id, 
  product_id, 
  sku, 
  name, 
  stock_quantity, 
  price_override
)
VALUES 
  (
    'v1111111-1111-1111-1111-111111111111', 
    'p1111111-1111-1111-1111-111111111111', 
    'CRY-BAG-SR-SLV', 
    'Silver', 
    55, 
    NULL
  ),
  (
    'v2222222-2222-2222-2222-222222222222', 
    'p1111111-1111-1111-1111-111111111111', 
    'CRY-BAG-SR-BLU', 
    'Blue', 
    9, 
    NULL
  ),
  (
    'v3333333-3333-3333-3333-333333333333', 
    'p2222222-2222-2222-2222-222222222222', 
    'RYO-DRG-BLK', 
    'Black', 
    11, 
    NULL
  ),
  (
    'v4444444-4444-4444-4444-444444444444', 
    'p2222222-2222-2222-2222-222222222222', 
    'RYO-DRG-WHT', 
    'White', 
    4, 
    NULL
  ),
  (
    'v5555555-5555-5555-5555-555555555555', 
    'p3333333-3333-3333-3333-333333333333', 
    'RYO-SLV-BLK', 
    'Black', 
    73, 
    NULL
  ),
  (
    'v6666666-6666-6666-6666-666666666666', 
    'p3333333-3333-3333-3333-333333333333', 
    'RYO-SLV-PNK', 
    'Pink', 
    14, 
    NULL
  ),
  (
    'v7777777-7777-7777-7777-777777777777', 
    'p3333333-3333-3333-3333-333333333333', 
    'RYO-SLV-WHT', 
    'White', 
    13, 
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Inventory Movements
INSERT INTO public.inventory_movements (
  product_id, 
  variant_id, 
  quantity, 
  type, 
  reason
)
VALUES 
  ('p1111111-1111-1111-1111-111111111111', 'v1111111-1111-1111-1111-111111111111', 55, 'stock_in', 'Stock initial - Silver'),
  ('p1111111-1111-1111-1111-111111111111', 'v2222222-2222-2222-2222-222222222222', 9, 'stock_in', 'Stock initial - Blue'),
  ('p2222222-2222-2222-2222-222222222222', 'v3333333-3333-3333-3333-333333333333', 11, 'stock_in', 'Stock initial - Black'),
  ('p2222222-2222-2222-2222-222222222222', 'v4444444-4444-4444-4444-444444444444', 4, 'stock_in', 'Stock initial - White'),
  ('p3333333-3333-3333-3333-333333333333', 'v5555555-5555-5555-5555-555555555555', 73, 'stock_in', 'Stock initial - Black pairs'),
  ('p3333333-3333-3333-3333-333333333333', 'v6666666-6666-6666-6666-666666666666', 14, 'stock_in', 'Stock initial - Pink pairs'),
  ('p3333333-3333-3333-3333-333333333333', 'v7777777-7777-7777-7777-777777777777', 13, 'stock_in', 'Stock initial - White pairs');

-- Verification Queries
SELECT COUNT(*) AS total_products FROM public.products;
SELECT COUNT(*) AS total_variants FROM public.product_variants;
SELECT name, stock_quantity FROM public.products;
