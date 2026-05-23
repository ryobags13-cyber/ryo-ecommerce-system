-- ====================================================================
-- SECTION 3: test_queries.sql
-- ====================================================================
-- Description: Integration tests and audits to verify security,
-- user auto-creation, and idempotent stock reduction.
-- Run these scripts inside the Supabase SQL Editor to verify everything is 100% correct!
-- ====================================================================

-- --------------------------------------------------------------------
-- TEST 1: VERIFY FIRST ADMIN REGISTRATION
-- --------------------------------------------------------------------
-- Expected result: You should see 1 user returned with:
-- email: 'admin@algerian-cod.com'
-- role: 'admin'

SELECT 
  p.id, 
  p.email, 
  p.full_name, 
  p.role, 
  p.created_at
FROM public.profiles p
WHERE p.email = 'admin@algerian-cod.com';


-- --------------------------------------------------------------------
-- TEST 2: TEST IDEMPOTENT STOCK REDUCTION & IDEMPOTENCY
-- --------------------------------------------------------------------
-- This runs a complete mock flow:
-- 1. Create a dummy product with 100 items.
-- 2. Create an order with 'pending' status (should NOT reduce stock).
-- 3. Add an item of quantity 10 of that product to the order.
-- 4. Transition order status to 'confirmed' (stock must update to 90).
-- 5. Update order details without changing status (stock must STAY at 90 – no duplicate reduction!).
-- 6. Transition status to 'cancelled' (stock must restore to 100).
-- 7. Transition status back to 'confirmed' (stock must go back to 90).

-- Step A: Set up test product with 100 stock
INSERT INTO public.products (id, sku, name, stock_quantity, price)
VALUES (
  '99999999-9999-9999-9999-000000000001', 
  'TEST-ALGERIA-COD-SKU', 
  'Deluxe Algerian Date Syrup', 
  100, 
  2500
) 
ON CONFLICT (sku) DO UPDATE SET stock_quantity = 100;

-- Step B: Setup pending order 
INSERT INTO public.orders (id, tracking_number, customer_name, customer_phone, status, total_price)
VALUES (
  '99999999-9999-9999-9999-000000000002', 
  'ALG-TRK-TEST-001', 
  'Yacine Benmansour', 
  '0550112233', 
  'pending', 
  2500
) 
ON CONFLICT (tracking_number) DO NOTHING;

-- Step C: Add order item (quantity 10)
INSERT INTO public.order_items (order_id, product_id, quantity, price)
VALUES (
  '99999999-9999-9999-9999-000000000002', 
  '99999999-9999-9999-9999-000000000001', 
  10, 
  2500
)
ON CONFLICT DO NOTHING;

-- Verification Step C.1: Check that creating a pending order has NOT changed stock (should still be 100)
SELECT name, stock_quantity AS initial_stock_should_be_100 FROM public.products WHERE sku = 'TEST-ALGERIA-COD-SKU';


-- Step D: CONFIRM THE ORDER (Triggers reduction)
UPDATE public.orders 
SET status = 'confirmed' 
WHERE id = '99999999-9999-9999-9999-000000000002';

-- Verification Step D.1: Check that stock is now 90
SELECT name, stock_quantity AS confirmed_stock_should_be_90 FROM public.products WHERE sku = 'TEST-ALGERIA-COD-SKU';


-- Step E: RUN A STALE UPDATE (e.g. operator updates phone or address, same status)
-- This proves stock is not deducted multiple times!
UPDATE public.orders 
SET customer_name = 'Yacine Benmansour Updated' 
WHERE id = '99999999-9999-9999-9999-000000000002';

-- Verification Step E.1: Check that stock is STILL 90 (proving double-reduction bug is FIXED!)
SELECT name, stock_quantity AS stale_update_stock_should_still_be_90 FROM public.products WHERE sku = 'TEST-ALGERIA-COD-SKU';


-- Step F: CANCEL THE ORDER (Triggers restoration)
UPDATE public.orders 
SET status = 'cancelled' 
WHERE id = '99999999-9999-9999-9999-000000000002';

-- Verification Step F.1: Check that stock is restored to 100
SELECT name, stock_quantity AS cancelled_restored_stock_should_be_100 FROM public.products WHERE sku = 'TEST-ALGERIA-COD-SKU';


-- Step G: RE-CONFIRM ORDER FROM CANCELLED
UPDATE public.orders 
SET status = 'confirmed' 
WHERE id = '99999999-9999-9999-9999-000000000002';

-- Verification Step G.1: Check that stock updates to 90 again cleanly
SELECT name, stock_quantity AS reconfirmed_stock_should_be_90_again FROM public.products WHERE sku = 'TEST-ALGERIA-COD-SKU';


-- --------------------------------------------------------------------
-- TEST 3: GOOGLE SHEETS IMPORT IDEMPOTENCY TEST
-- --------------------------------------------------------------------
-- Expected Result: Running these two inserts consecutively should not 
-- result in two row records, thereby preventing double imports.

-- Insert 1: Google Sheet import of Row 42
INSERT INTO public.orders (id, tracking_number, customer_name, customer_phone, status, external_id)
VALUES (
  '99999999-9999-9999-9999-000000000100', 
  'SHEETS-ALG-TRACK-42', 
  'Sofiane Benaissa', 
  '0661998877', 
  'pending', 
  'google_sheet_1_row_42' -- external unique ID matching the spreadsheet source
)
ON CONFLICT (external_id) DO NOTHING;

-- Insert 2: Run identical duplicate sheet import of Row 42 (e.g. operator re-clicks import)
INSERT INTO public.orders (id, tracking_number, customer_name, customer_phone, status, external_id)
VALUES (
  '99999999-9999-9999-9999-000000000101', -- Different UUID but same sheets record
  'SHEETS-ALG-TRACK-42', 
  'Sofiane Benaissa', 
  '0661998877', 
  'pending', 
  'google_sheet_1_row_42' 
)
ON CONFLICT (external_id) DO NOTHING;

-- Verification: You should see exactly 1 row matching track 'SHEETS-ALG-TRACK-42'
SELECT id, customer_name, external_id FROM public.orders WHERE external_id = 'google_sheet_1_row_42';


-- --------------------------------------------------------------------
-- CLEANUP SCRIPT (Optional)
-- Run this if you want to reset the test logs from your active system:
-- --------------------------------------------------------------------
/*
DELETE FROM public.order_items WHERE order_id IN ('99999999-9999-9999-9999-000000000002');
DELETE FROM public.orders WHERE id IN ('99999999-9999-9999-9999-000000000002', '99999999-9999-9999-9999-000000000100', '99999999-9999-9999-9999-000000000101');
DELETE FROM public.products WHERE id = '99999999-9999-9999-9999-000000000001';
*/
