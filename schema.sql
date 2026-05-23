-- ====================================================================
-- Algerian COD eCommerce Management System - Complete Database Schema
-- ====================================================================

-- --------------------------------------------------------------------
-- SYSTEM EXTENSIONS & SETUP
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- CUSTOM ENUMS & TYPES
-- --------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'operator', 'shipper');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'dispatched', 'delivered', 'returned', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'partially_paid', 'paid', 'refunded');
CREATE TYPE public.movement_type AS ENUM ('stock_in', 'stock_out', 'adjustment', 'return');
CREATE TYPE public.call_outcome AS ENUM ('no_answer', 'busy', 'wrong_number', 'confirmed', 'cancelled', 'callback_requested');
CREATE TYPE public.expense_category AS ENUM ('marketing', 'delivery', 'sourcing', 'operational', 'salaries', 'other');

-- --------------------------------------------------------------------
-- DATABASE TABLES CREATE
-- --------------------------------------------------------------------

-- 1. BRANDS TABLE
CREATE TABLE public.brands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    logo_url text,
    website text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PROFILES TABLE (Staff & Admin Directory linked to Supabase Auth)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    full_name text NOT NULL,
    role public.user_role NOT NULL DEFAULT 'operator'::public.user_role,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CUSTOMERS TABLE (Persistent client list for building loyalty and blacklists)
CREATE TABLE public.customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone text NOT NULL UNIQUE,
    full_name text NOT NULL,
    wilaya_code text NOT NULL, -- Algeria uses 58 wilayas
    commune text,
    address text,
    is_blacklisted boolean DEFAULT false NOT NULL,
    blacklist_reason text,
    total_orders_count integer DEFAULT 0 NOT NULL,
    successful_delivery_count integer DEFAULT 0 NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PRODUCTS TABLE
CREATE TABLE public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
    sku text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    purchase_price decimal(12,2) NOT NULL DEFAULT 0.00, -- Cost of purchasing the item
    price decimal(12,2) NOT NULL DEFAULT 0.00, -- Selling price in Algerian Dinar (DZD)
    stock_quantity integer NOT NULL DEFAULT 0,
    min_stock_alert integer DEFAULT 5 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    weight_kg decimal(6,2) DEFAULT 0.10,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PRODUCT_VARIANTS TABLE (For Size, Color variations)
CREATE TABLE public.product_variants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    sku text NOT NULL UNIQUE,
    name text NOT NULL, -- e.g., "M / Black"
    stock_quantity integer NOT NULL DEFAULT 0,
    price_override decimal(12,2), -- Optional specific price override
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. DELIVERY_COMPANIES TABLE (Yalidine, ZR Express, etc.)
CREATE TABLE public.delivery_companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    contact_phone text,
    api_key text, -- For automated shipping webhook integrations
    tracking_url_template text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ORDERS TABLE (Core Cash on Delivery Engine)
CREATE TABLE public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number text NOT NULL UNIQUE,
    customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
    delivery_company_id uuid REFERENCES public.delivery_companies(id) ON DELETE SET NULL,
    
    -- Recipient Details (Denormalized so state changes don't affect previous invoices)
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    wilaya_code text NOT NULL, -- Code (01 to 58)
    commune text NOT NULL,
    shipping_address text NOT NULL,
    
    -- Financial details
    subtotal_price decimal(12,2) NOT NULL DEFAULT 0.00,
    shipping_fee decimal(12,2) NOT NULL DEFAULT 0.00,
    discount_amount decimal(12,2) NOT NULL DEFAULT 0.00,
    total_price decimal(12,2) GENERATED ALWAYS AS (subtotal_price + shipping_fee - discount_amount) STORED,
    estimated_profit decimal(12,2) DEFAULT 0.00, -- Automatically computed
    
    -- Status Tracker
    status public.order_status NOT NULL DEFAULT 'pending'::public.order_status,
    payment_status public.payment_status NOT NULL DEFAULT 'unpaid'::public.payment_status,
    tracking_number text, -- Delivery company internal code
    has_stop_desk boolean DEFAULT false NOT NULL, -- Customer picks up from dispatch desk, cheaper shipping
    stock_deducted boolean DEFAULT false NOT NULL, -- Avoids double stock reduction on triggers
    
    -- Import & Meta Coordinates
    external_id text UNIQUE, -- Prevent Google Sheets import duplicates
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ORDER_ITEMS TABLE
CREATE TABLE public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    variant_id uuid REFERENCES public.product_variants(id) ON DELETE RESTRICT,
    quantity integer NOT NULL CHECK (quantity > 0),
    price decimal(12,2) NOT NULL, -- Set at the time of purchase
    purchase_price_at_sale decimal(12,2) NOT NULL, -- Static capture of cost of goods at sale time for accurate profit calculation
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. INVENTORY_MOVEMENTS TABLE (Audits stock additions/subtractions)
CREATE TABLE public.inventory_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
    quantity integer NOT NULL,
    type public.movement_type NOT NULL,
    reason text,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. EXPENSES TABLE (Tracks acquisition, hardware, delivery rates, marketing overhead)
CREATE TABLE public.expenses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category public.expense_category NOT NULL,
    amount decimal(12,2) NOT NULL CHECK (amount >= 0.00),
    description text NOT NULL,
    expense_date date NOT NULL DEFAULT CURRENT_DATE,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. CALL_LOGS TABLE (High importance in COD, where customers must confirm before shipping is cleared)
CREATE TABLE public.call_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    operator_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    outcome public.call_outcome NOT NULL,
    notes text,
    called_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. AD_CAMPAIGNS TABLE (For linking meta ads, tiktok ads to computing real ROI)
CREATE TABLE public.ad_campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    platform text NOT NULL, -- e.g. "Facebook", "TikTok"
    spend decimal(12,2) NOT NULL DEFAULT 0.00,
    starts_at date NOT NULL,
    ends_at date NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. SHEET_IMPORT_LOGS TABLE (Audit Google Sheets updates)
CREATE TABLE public.sheet_import_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sheet_name text NOT NULL,
    imported_rows_count integer NOT NULL DEFAULT 0,
    ignored_rows_count integer NOT NULL DEFAULT 0,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. EMPLOYEE_PERFORMANCE TABLE (Aggregated view of successful deliveries & conversions)
CREATE TABLE public.employee_performance (
    profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_calls_made integer DEFAULT 0 NOT NULL,
    total_orders_confirmed integer DEFAULT 0 NOT NULL,
    total_orders_delivered integer DEFAULT 0 NOT NULL,
    conversion_rate decimal(5,2) DEFAULT 0.00 NOT NULL, -- percentage of calls leading to confirmation
    delivery_success_rate decimal(5,2) DEFAULT 0.00 NOT NULL, -- percentage of confirmed that went 'delivered'
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. AUDIT_LOGS TABLE (Secured tracking of all actions taken by administrators, shippers or operators)
CREATE TABLE public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    table_name text NOT NULL,
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ====================================================================
-- PERFORMANCE OPTIMIZING INDEXES
-- ====================================================================
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_tracking_number ON public.orders(tracking_number);
CREATE INDEX idx_orders_external_id ON public.orders(external_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_audit_logs_record ON public.audit_logs(table_name, record_id);


-- ====================================================================
-- TRIGGERS & PL/PGSQL UTILITY FUNCTIONS
-- ====================================================================

-- 1. PHONE NORMALIZER (Algerian Numbers Formatter)
-- Transforms forms of: "+213 550..." || "0550..." || "550..." into "0550XXXXXX"
-- Normalization structure allows direct, zero-friction operator communication.
CREATE OR REPLACE FUNCTION public.normalize_algerian_phone()
RETURNS trigger AS $$
DECLARE
    cleaned text;
BEGIN
    IF NEW.customer_phone IS NULL THEN
        RETURN NEW;
    END IF;

    -- Remove all spaces, dashes, parentheses
    cleaned := regexp_replace(NEW.customer_phone, '\D', '', 'g');

    -- Fix leading prefix structures
    IF cleaned LIKE '213%' THEN
        cleaned := '0' || substring(cleaned from 4);
    ELSIF cleaned LIKE '00213%' THEN
        cleaned := '0' || substring(cleaned from 6);
    ELSIF substring(cleaned from 1 for 1) != '0' AND length(cleaned) = 9 THEN
        cleaned := '0' || cleaned;
    END IF;

    NEW.customer_phone := cleaned;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply normalizer to orders and customers
CREATE TRIGGER trg_normalize_phone_orders
    BEFORE INSERT OR UPDATE OF customer_phone ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.normalize_algerian_phone();

CREATE TRIGGER trg_normalize_phone_customers
    BEFORE INSERT OR UPDATE OF phone ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.normalize_algerian_phone();


-- 2. AUTOMATIC UNIQUE ORDER NUMBER GENERATOR (COD-YYYYMMDD-XXXXXX)
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS trigger AS $$
DECLARE
    date_part text;
    seq_part integer;
    new_order_number text;
BEGIN
    date_part := to_char(CURRENT_DATE, 'YYYYMMDD');
    
    -- Fetch consecutive count of orders for today to append sequential tracker
    SELECT COALESCE(COUNT(*), 0) + 1 INTO seq_part 
    FROM public.orders 
    WHERE created_at::date = CURRENT_DATE;

    new_order_number := 'COD-' || date_part || '-' || lpad(seq_part::text, 4, '0');
    NEW.order_number := new_order_number;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
    EXECUTE FUNCTION public.generate_order_number();


-- 3. INTERACTIVE PROFIT COMPUTATION & SALES CAPTURING
-- Installs cost coefficients dynamically to estimate order margins in real-time.
CREATE OR REPLACE FUNCTION public.calculate_order_profit()
RETURNS trigger AS $$
DECLARE
    total_cost decimal(12,2) := 0.00;
    discount_val decimal(12,2) := 0.00;
BEGIN
    -- Pull the baseline product acquisition prices and aggregate
    SELECT COALESCE(SUM(purchase_price_at_sale * quantity), 0.00) INTO total_cost
    FROM public.order_items
    WHERE order_id = NEW.id;

    -- Calculate potential profit
    NEW.estimated_profit := NEW.subtotal_price + NEW.shipping_fee - NEW.discount_amount - total_cost;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_order_profit
    BEFORE UPDATE OF subtotal_price, shipping_fee, discount_amount ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.calculate_order_profit();


-- 4. DECUPLED STOCK MANAGEMENT TRIGGER (PREVENTS IDEMPOTENCY / DOUBLE DEDUCTION FLUCTUATIONS)
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
  -- CASE 1: Transition TO confirmed/dispatched/delivered AND stock NOT YET deducted
  IF (new_status IN ('confirmed', 'dispatched', 'delivered') AND NOT was_deducted) THEN
    -- Loop through order items and subtract stock from the products table
    FOR item_rec IN SELECT product_id, quantity FROM public.order_items WHERE order_id = NEW.id LOOP
      UPDATE public.products
      SET stock_quantity = stock_quantity - item_rec.quantity
      WHERE id = item_rec.product_id;
    END LOOP;
    
    NEW.stock_deducted := true;

  -- CASE 2: Transition TO cancelled/returned AND stock WAS previously deducted
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

CREATE TRIGGER trigger_manage_order_stock
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.manage_order_stock();


-- --------------------------------------------------------------------
-- SECURITY RLS POLICIES & FUNCTIONS
-- --------------------------------------------------------------------

-- Recursion Protection Function: Get user role safely bypasses RLS directly.
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role::text INTO user_role FROM public.profiles WHERE id = user_id LIMIT 1;
  RETURN COALESCE(user_role, 'operator');
END;
$$;

-- Setup User auto-creation mechanism for new Auth Signs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first_profile boolean;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) INTO is_first_profile;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'System Operator'),
    CASE WHEN is_first_profile THEN 'admin'::public.user_role ELSE 'operator'::public.user_role END
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Enable Row Level Security (RLS) on all tables for PCI compliance
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheet_import_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- RLS DEFINITION FOR PROFILE ENGINES (Recursion Free!)
CREATE POLICY "Allow members to view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow admins to manage profiles" ON public.profiles FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS DEFINITION FOR BRANDS ENGINES
CREATE POLICY "Allow staff to select brands" ON public.brands FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to write brands" ON public.brands FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS DEFINITION FOR PRODUCTS & VARIANTS ENGINES
CREATE POLICY "Allow staff to select products" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to write products" ON public.products FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Allow staff to select variants" ON public.product_variants FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to write variants" ON public.product_variants FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS DEFINITION FOR CUSTOMERS ENGINES
CREATE POLICY "Allow staff to read and write customers" ON public.customers FOR ALL USING (auth.role() = 'authenticated');

-- RLS DEFINITION FOR ORDERS ENGINES
CREATE POLICY "Allow staff to read orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow staff to insert orders" ON public.orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow staff to update orders" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to delete orders" ON public.orders FOR DELETE USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS DEFINITION FOR ORDER ITEMS (Uses Order existence rule check)
CREATE POLICY "Allow select order items based on order access" ON public.order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE public.orders.id = public.order_items.order_id));

CREATE POLICY "Allow insert order items based on order access" ON public.order_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE public.orders.id = public.order_items.order_id));

CREATE POLICY "Allow update order items based on order access" ON public.order_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.orders WHERE public.orders.id = public.order_items.order_id))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE public.orders.id = public.order_items.order_id));

CREATE POLICY "Allow delete order items based on order access" ON public.order_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.orders WHERE public.orders.id = public.order_items.order_id));

-- RLS DEFINITION FOR AUXILIARY LOGS, PERFORMANCE & EXPENSES
CREATE POLICY "Allow staff to write call logs" ON public.call_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow staff to select delivery companies" ON public.delivery_companies FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to write delivery companies" ON public.delivery_companies FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Allow staff to select sheet import logs" ON public.sheet_import_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow managers to write sheet import logs" ON public.sheet_import_logs FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Allow staff to view employee performance" ON public.employee_performance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow managers to write employee performance" ON public.employee_performance FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Allow staff to select campaigns" ON public.ad_campaigns FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow managers to write campaigns" ON public.ad_campaigns FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Allow staff to select inventory movements" ON public.inventory_movements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow managers to write inventory movements" ON public.inventory_movements FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Allow staff to select expenses" ON public.expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow managers to write expenses" ON public.expenses FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'manager'));

CREATE POLICY "Allow staff to select audit logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to write audit logs" ON public.audit_logs FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');
