-- ====================================================================
-- SECTION 1: fixed_schema_patch.sql
-- ====================================================================
-- Description: These are SQL fixes, schema enhancements, and security rules
-- designed to fix RLS recursion, prevent first admin lockout, enforce 
-- stock idempotency, prevent Google Sheets duplication, and apply order_items RLS.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. ENHANCE BASE TABLES & CONSTRAINTS
-- --------------------------------------------------------------------

-- Ensure the orders table has a unique external_id column for Google Sheets imports
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS external_id text UNIQUE;

-- Ensure the orders table has a tracking column to prevent stock double-reduction
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS stock_deducted boolean DEFAULT false;

-- Add CASCADE delete safety to order_items to prevent orphaned rows or errors
-- To prevent duplicate constraint errors, we first drop any existing constraint and re-add it with ON DELETE CASCADE
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_order_id_fkey' AND table_name = 'order_items'
    ) THEN
        ALTER TABLE public.order_items DROP CONSTRAINT order_items_order_id_fkey;
    END IF;
END $$;

ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


-- --------------------------------------------------------------------
-- 2. FIX RLS INFINITE RECURSION BY CREATING A SECURITY DEFINER HELPER
-- --------------------------------------------------------------------

-- This function runs with the privileges of the database owner (SECURITY DEFINER)
-- and bypasses the RLS on the profiles table so we do not get recursive loops.
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_id LIMIT 1;
  RETURN COALESCE(user_role, 'operator'); -- default to low privilege
END;
$$;


-- --------------------------------------------------------------------
-- 3. FIX FIRST ADMIN LOCKOUT (AUTOMATIC ELEVATION GENERATION)
-- --------------------------------------------------------------------

-- Trigger function that fires on a new user sign up inside Supabase Auth.
-- If they are the first user, elevate them to 'admin', else default to 'operator'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first_profile boolean;
BEGIN
  -- Check if any profiles exist in our system yet
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) INTO is_first_profile;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'First User'),
    CASE WHEN is_first_profile THEN 'admin' ELSE 'operator' END
  );
  RETURN new;
END;
$$;

-- Apply user auto-creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- --------------------------------------------------------------------
-- 4. FIX IDEMPOTENT STOCK REDUCTION (PREVENTS DOUBLE-REDUCTION)
-- --------------------------------------------------------------------

-- Decoupled state-machine trigger to ensure inventory is deducted ONLY ONCE when orders 
-- transition to 'confirmed', 'dispatched', or 'delivered', and restored if cancelled/returned.
CREATE OR REPLACE FUNCTION public.manage_order_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_rec record;
  is_insert boolean := (TG_OP = 'INSERT');
  was_deducted boolean := CASE WHEN is_insert THEN false ELSE OLD.stock_deducted END;
  new_status text := NEW.status;
BEGIN
  -- CASE 1: Transition to confirmed/dispatched/delivered AND stock NOT YET deducted
  IF (new_status IN ('confirmed', 'dispatched', 'delivered') AND NOT was_deducted) THEN
    -- Loop through order items and subtract stock from the products table
    FOR item_rec IN SELECT product_id, quantity FROM public.order_items WHERE order_id = NEW.id LOOP
      UPDATE public.products
      SET stock_quantity = stock_quantity - item_rec.quantity
      WHERE id = item_rec.product_id;
    END LOOP;
    
    NEW.stock_deducted := true;

  -- CASE 2: Transition to cancelled/returned AND stock WAS previously deducted
  ELSIF (NOT is_insert AND new_status IN ('cancelled', 'returned') AND was_deducted) THEN
    -- Loop through order items and restore stock to the products table
    FOR item_rec IN SELECT product_id, quantity FROM public.order_items WHERE order_id = NEW.id LOOP
      UPDATE public.products
      SET stock_quantity = stock_quantity + item_rec.quantity
      WHERE id = item_rec.product_id;
    END LOOP;
    
    NEW.stock_deducted := false;
  END IF;

  RETURN NEW;
END;
$$;

-- Apply the stock trigger to the orders table
DROP TRIGGER IF EXISTS trigger_manage_order_stock ON public.orders;
CREATE TRIGGER trigger_manage_order_stock
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.manage_order_stock();


-- --------------------------------------------------------------------
-- 5. FIX & APPLY RLS POLICIES FOR ALL TABLES (PREVENTING RECURSION)
-- --------------------------------------------------------------------

-- Enable Row Level Security on core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- --- A. PROFILES POLICIES ---
DROP POLICY IF EXISTS "Allow users to view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to manage all profiles" ON public.profiles;

CREATE POLICY "Allow users to view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow admins to manage all profiles" ON public.profiles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');


-- --- B. PRODUCTS, BRANDS, VARIANTS & MOVEMENTS SELECT POLICIES (Allow public select for frontend compatibility, write requires admin) ---
DROP POLICY IF EXISTS "Allow staff to select products" ON public.products;
DROP POLICY IF EXISTS "Allow admins to write products" ON public.products;

CREATE POLICY "Allow staff to select products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Allow admins to write products" ON public.products
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- Also optimize Brands, Variants & Inventory Movements for public select
DROP POLICY IF EXISTS "Allow staff to select brands" ON public.brands;
DROP POLICY IF EXISTS "Allow admins to write brands" ON public.brands;
CREATE POLICY "Allow staff to select brands" ON public.brands
  FOR SELECT USING (true);
CREATE POLICY "Allow admins to write brands" ON public.brands
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Allow staff to select variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow admins to write variants" ON public.product_variants;
CREATE POLICY "Allow staff to select variants" ON public.product_variants
  FOR SELECT USING (true);
CREATE POLICY "Allow admins to write variants" ON public.product_variants
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Allow staff to select inventory movements" ON public.inventory_movements;
CREATE POLICY "Allow staff to select inventory movements" ON public.inventory_movements
  FOR SELECT USING (true);



-- --- C. ORDERS POLICIES ---
DROP POLICY IF EXISTS "Allow staff to read orders" ON public.orders;
DROP POLICY IF EXISTS "Allow staff to insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow staff to update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admins to delete orders" ON public.orders;

CREATE POLICY "Allow staff to read orders" ON public.orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow staff to insert orders" ON public.orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow staff to update orders" ON public.orders
  FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admins to delete orders" ON public.orders
  FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');


-- --- D. ORDER_ITEMS POLICIES (Linked to parent Order rights) ---
DROP POLICY IF EXISTS "Allow select order items based on order access" ON public.order_items;
DROP POLICY IF EXISTS "Allow insert order items based on order access" ON public.order_items;
DROP POLICY IF EXISTS "Allow update order items based on order access" ON public.order_items;
DROP POLICY IF EXISTS "Allow delete order items based on order access" ON public.order_items;

CREATE POLICY "Allow select order items based on order access" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id
    )
  );

CREATE POLICY "Allow insert order items based on order access" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id
    )
  );

CREATE POLICY "Allow update order items based on order access" ON public.order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id
    )
  );

CREATE POLICY "Allow delete order items based on order access" ON public.order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE public.orders.id = public.order_items.order_id
    )
  );
