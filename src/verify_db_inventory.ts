import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDbInventory() {
  console.log("=== VERIFYING SUPABASE DATABASE DATA ===");
  try {
    // 1. Fetch products
    const { data: products, error: prodErr } = await supabase.from('products').select('*');
    if (prodErr) {
      console.error("Error fetching products:", prodErr.message);
    } else {
      console.log(`Total Products Count: ${products?.length || 0}`);
      if (products && products.length > 0) {
        console.log("Products in Database:");
        products.forEach(p => {
          console.log(` - ${p.name} (SKU: ${p.sku}, Category: ${p.category}, Price: ${p.price} DA)`);
        });
      } else {
        console.log("No products found in database (products table is empty).");
      }
    }

    // 2. Fetch product_variants
    const { data: variants, error: varErr } = await supabase.from('product_variants').select('*');
    if (varErr) {
      console.error("Error fetching variants:", varErr.message);
    } else {
      console.log(`Total Product Variants Count: ${variants?.length || 0}`);
      if (variants && variants.length > 0) {
        const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
        console.log(`Total Stock Quantity across all variants: ${totalStock}`);
        console.log("Variants in Database:");
        variants.forEach(v => {
          console.log(` - ${v.name} (SKU: ${v.sku}, Stock: ${v.stock_quantity})`);
        });
      } else {
        console.log("No product variants found in database.");
      }
    }

    // 3. Fetch brands
    const { data: brands, error: brandErr } = await supabase.from('brands').select('*');
    if (brandErr) {
      console.error("Error fetching brands:", brandErr.message);
    } else {
      console.log(`Total Brands Count: ${brands?.length || 0}`);
    }

  } catch (err: any) {
    console.error("Failed to query remote Supabase:", err.message);
  }
}

verifyDbInventory();
