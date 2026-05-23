-- ====================================================================
-- SECTION 2: seed_admin.sql
-- ====================================================================
-- Description: Seeding script to create the very first Admin user
-- safely inside Supabase's managed Auth.
-- ====================================================================

-- Step 1: Insert into auth.users (Supabase native authenticating table)
-- We use a static UUID 'd3b07384-d113-4a1e-b3f9-67995acaa312' so it is predictable.
-- We use expansions.crypt to encrypt the password directly inside the database.

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmed_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd3b07384-d113-4a1e-b3f9-67995acaa312',
  'authenticated',
  'authenticated',
  'admin@algerian-cod.com', -- Feel free to change this email
  extensions.crypt('AlgeriaCODAdmin2026!', extensions.gen_salt('bf')), -- Secure password: "AlgeriaCODAdmin2026!"
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Algeria COD Director"}',
  FALSE,
  NOW(),
  NOW(),
  NOW()
) 
ON CONFLICT (id) DO NOTHING;

-- Step 2: Fallback direct profile assertion
-- Since our public.handle_new_user() trigger automatically executes on "auth.users" shifts,
-- it will have already created this profile correctly.
-- We run an UPSERT statement here to guarantee the user's role is elevated to 'admin'.

INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role
)
VALUES (
  'd3b07384-d113-4a1e-b3f9-67995acaa312',
  'admin@algerian-cod.com',
  'Algeria COD Director',
  'admin'
)
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';

-- ====================================================================
-- SEED CONFIRMATION LOG:
-- Once this runs in your Supabase SQL Editor:
-- User Created: admin@algerian-cod.com
-- Password:     AlgeriaCODAdmin2026!
-- Role:         admin (Authorized to configure operations across all 58 Wilayas)
-- ====================================================================
