import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BRANDS = {
  ryo_bags: 'b1111111-1111-1111-1111-111111111111',
  ryo_riders: 'b2222222-2222-2222-2222-222222222222'
};

const PRODUCTS = {
  p1: 'p1111111-1111-1111-1111-111111111111', // Crystal Bag SR
  p2: 'p2222222-2222-2222-2222-222222222222', // Durag Satin Silky
  p3: 'p3333333-3333-3333-3333-333333333333'  // Cooling Arm Sleeves
};

const VARIANTS = {
  v1: 'v1111111-1111-1111-1111-111111111111', // Crystal Bag SR - Silver
  v2: 'v2222222-2222-2222-2222-222222222222', // Crystal Bag SR - Blue
  v3: 'v3333333-3333-3333-3333-333333333333', // Durag Satin Silky - Black
  v4: 'v4444444-4444-4444-4444-444444444444', // Durag Satin Silky - White
  v5: 'v5555555-5555-5555-5555-555555555555', // Cooling Arm Sleeves - Black
  v6: 'v6666666-6666-6666-6666-666666666666', // Cooling Arm Sleeves - Pink
  v7: 'v7777777-7777-7777-7777-777777777777'  // Cooling Arm Sleeves - White
};

async function seedData() {
  console.log("Starting Supabase database inventory seed operation with admin authentication...");

  try {
    // Authenticate as Admin
    console.log("Signing in as admin...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@algerian-cod.com',
      password: 'AlgeriaCODAdmin2026!'
    });

    if (authError) {
      console.error("Authentication failed. Trying to proceed without auth or checking error:", authError);
      throw authError;
    }

    console.log("Admin authentication successful!");

    // 1. Clean existing records in correct order to avoid constraint issues
    console.log("Cleaning up potential existing catalog data to ensure a clean transaction...");
    await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('inventory_movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('brands').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Seed Brands
    console.log("Inserting Brands...");
    const brandsData = [
      { id: BRANDS.ryo_bags, name: 'RYO BAGS', description: 'Sacs à main féminins chics de haute couture' },
      { id: BRANDS.ryo_riders, name: 'RYO RIDERS', description: 'Accessoires urbains authentiques et streetwear de performance' }
    ];
    const { data: insertedBrands, error: brandsError } = await supabase.from('brands').insert(brandsData).select();
    if (brandsError) throw brandsError;
    console.log("Brands successfully seeded:", insertedBrands);

    // 3. Seed Products
    console.log("Inserting Products...");
    const productsData = [
      {
        id: PRODUCTS.p1,
        brand_id: BRANDS.ryo_bags,
        sku: 'CRY-BAG-SR',
        name: 'Crystal Bag SR',
        category: 'Women Handbags',
        purchase_price: 1200,
        price: 3700,
        stock_quantity: 64,
        min_stock_alert: 5,
        is_active: true,
        weight_kg: 0.60,
        description: 'Exquis sac en cristal de luxe avec bandoulière détachable. Style chic et moderne de la collection RYO BAGS, idéal pour les occasions uniques.'
      },
      {
        id: PRODUCTS.p2,
        brand_id: BRANDS.ryo_riders,
        sku: 'RYO-DRG',
        name: 'Durag Satin Silky',
        category: 'Durags',
        purchase_price: 700,
        price: 1900,
        stock_quantity: 15,
        min_stock_alert: 5,
        is_active: true,
        weight_kg: 0.10,
        description: 'Durag satiné de haute qualité par RYO RIDERS pour maintien idéal des waves et confort extrême.'
      },
      {
        id: PRODUCTS.p3,
        brand_id: BRANDS.ryo_riders,
        sku: 'RYO-ARM-SLV',
        name: 'Cooling Arm Sleeves',
        category: 'Arm Sleeves',
        purchase_price: 200,
        price: 1400,
        stock_quantity: 100,
        min_stock_alert: 10,
        is_active: true,
        weight_kg: 0.15,
        description: 'Manchettes ultra-rafraîchissantes de protection UV. Vendu exclusivement par paire. Offres : 1 paire = 1400 DA, 2 paires = 2600 DA, 3 paires = 3900 DA.'
      }
    ];
    const { data: insertedProducts, error: productsError } = await supabase.from('products').insert(productsData).select();
    if (productsError) throw productsError;
    console.log("Products successfully seeded:", insertedProducts);

    // 4. Seed Product Variants
    console.log("Inserting Product Variants...");
    const variantsData = [
      { id: VARIANTS.v1, product_id: PRODUCTS.p1, sku: 'CRY-BAG-SR-SLV', name: 'Crystal Bag SR - Silver', stock_quantity: 55, color: 'Silver', size: 'Unique', pack_quantity: 1 },
      { id: VARIANTS.v2, product_id: PRODUCTS.p1, sku: 'CRY-BAG-SR-BLU', name: 'Crystal Bag SR - Blue', stock_quantity: 9, color: 'Blue', size: 'Unique', pack_quantity: 1 },
      { id: VARIANTS.v3, product_id: PRODUCTS.p2, sku: 'RYO-DRG-BLK', name: 'Durag Satin Silky - Black', stock_quantity: 11, color: 'Black', size: 'Unique', pack_quantity: 1 },
      { id: VARIANTS.v4, product_id: PRODUCTS.p2, sku: 'RYO-DRG-WHT', name: 'Durag Satin Silky - White', stock_quantity: 4, color: 'White', size: 'Unique', pack_quantity: 1 },
      { id: VARIANTS.v5, product_id: PRODUCTS.p3, sku: 'RYO-SLV-BLK', name: 'Cooling Arm Sleeves - Black', stock_quantity: 73, color: 'Black', size: 'Paire', pack_quantity: 1 },
      { id: VARIANTS.v6, product_id: PRODUCTS.p3, sku: 'RYO-SLV-PNK', name: 'Cooling Arm Sleeves - Pink', stock_quantity: 14, color: 'Pink', size: 'Paire', pack_quantity: 1 },
      { id: VARIANTS.v7, product_id: PRODUCTS.p3, sku: 'RYO-SLV-WHT', name: 'Cooling Arm Sleeves - White', stock_quantity: 13, color: 'White', size: 'Paire', pack_quantity: 1 }
    ];
    const { data: insertedVariants, error: variantsError } = await supabase.from('product_variants').insert(variantsData).select();
    if (variantsError) throw variantsError;
    console.log("Product Variants successfully seeded:", insertedVariants);

    // 5. Seed Inventory Movements for traceability
    console.log("Inserting Inventory Movements...");
    const movementsData = [
      { product_id: PRODUCTS.p1, variant_id: VARIANTS.v1, quantity: 55, type: 'stock_in', reason: 'Stock initial - Silver' },
      { product_id: PRODUCTS.p1, variant_id: VARIANTS.v2, quantity: 9, type: 'stock_in', reason: 'Stock initial - Blue' },
      { product_id: PRODUCTS.p2, variant_id: VARIANTS.v3, quantity: 11, type: 'stock_in', reason: 'Stock initial - Black' },
      { product_id: PRODUCTS.p2, variant_id: VARIANTS.v4, quantity: 4, type: 'stock_in', reason: 'Stock initial - White' },
      { product_id: PRODUCTS.p3, variant_id: VARIANTS.v5, quantity: 73, type: 'stock_in', reason: 'Stock initial - Black pairs' },
      { product_id: PRODUCTS.p3, variant_id: VARIANTS.v6, quantity: 14, type: 'stock_in', reason: 'Stock initial - Pink pairs' },
      { product_id: PRODUCTS.p3, variant_id: VARIANTS.v7, quantity: 13, type: 'stock_in', reason: 'Stock initial - White pairs' }
    ];
    const { data: insertedMovements, error: movementsError } = await supabase.from('inventory_movements').insert(movementsData).select();
    if (movementsError) throw movementsError;
    console.log("Inventory Movements successfully seeded.");

    console.log("\n--- VERIFICATION STATS ---");
    console.log("Exact brands inserted:", insertedBrands);
    console.log("Exact products inserted:", insertedProducts);
    console.log("Exact variants inserted:", insertedVariants);
    console.log("Total Products Count:", insertedProducts.length);
    console.log("Total Variants Count:", insertedVariants.length);
    const totalStock = insertedVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
    console.log("Total Stock Quantity:", totalStock);
    console.log("Is products table no longer empty? YES (" + insertedProducts.length + " items)");
    console.log("--- SEED OPERATION SUCCESSFUL ---");

  } catch (err) {
    console.error("FATAL ERROR during seeding execution:", err);
    process.exit(1);
  }
}

seedData();
