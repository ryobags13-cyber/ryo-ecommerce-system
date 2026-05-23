import { createClient } from '@supabase/supabase-js';
import { Product, Order, Customer, Expense, AdCampaign, Profile, OrderItem, EmployeePerformance, Brand, Category, ProductVariant, InventoryMovement } from './types';

// Read configuration safely
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Check if credentials exist and are not placeholder values
export const isConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here'
);

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// ====================================================================
// ALGERIAN WILAYAS LIST (58 standard departments)
// ====================================================================
export interface Wilaya {
  code: string;
  name: string;
  shippingFeeStopDesk: number;
  shippingFeeHome: number;
}

export const ALGERIAN_WILAYAS: Wilaya[] = [
  { code: '16', name: '16 - Alger', shippingFeeStopDesk: 300, shippingFeeHome: 500 },
  { code: '31', name: '31 - Oran', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '25', name: '25 - Constantine', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '09', name: '09 - Blida', shippingFeeStopDesk: 350, shippingFeeHome: 550 },
  { code: '15', name: '15 - Tizi Ouzou', shippingFeeStopDesk: 400, shippingFeeHome: 600 },
  { code: '19', name: '19 - Sétif', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '06', name: '06 - Béjaïa', shippingFeeStopDesk: 400, shippingFeeHome: 600 },
  { code: '13', name: '13 - Tlemcen', shippingFeeStopDesk: 450, shippingFeeHome: 700 },
  { code: '30', name: '30 - Ouargla', shippingFeeStopDesk: 500, shippingFeeHome: 900 },
  { code: '39', name: '39 - El Oued', shippingFeeStopDesk: 500, shippingFeeHome: 900 },
  { code: '47', name: '47 - Ghardaïa', shippingFeeStopDesk: 550, shippingFeeHome: 950 },
  { code: '01', name: '01 - Adrar', shippingFeeStopDesk: 700, shippingFeeHome: 1100 },
  { code: '02', name: '02 - Chlef', shippingFeeStopDesk: 400, shippingFeeHome: 600 },
  { code: '03', name: '03 - Laghouat', shippingFeeStopDesk: 450, shippingFeeHome: 750 },
  { code: '04', name: '04 - Oum El Bouaghi', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '05', name: '05 - Batna', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '07', name: '07 - Biskra', shippingFeeStopDesk: 450, shippingFeeHome: 750 },
  { code: '08', name: '08 - Béchar', shippingFeeStopDesk: 600, shippingFeeHome: 1000 },
  { code: '10', name: '10 - Bouira', shippingFeeStopDesk: 350, shippingFeeHome: 550 },
  { code: '11', name: '11 - Tamanrasset', shippingFeeStopDesk: 800, shippingFeeHome: 1300 },
  { code: '12', name: '12 - Tébessa', shippingFeeStopDesk: 450, shippingFeeHome: 700 },
  { code: '14', name: '14 - Tiaret', shippingFeeStopDesk: 450, shippingFeeHome: 650 },
  { code: '17', name: '17 - Djelfa', shippingFeeStopDesk: 450, shippingFeeHome: 700 },
  { code: '18', name: '18 - Jijel', shippingFeeStopDesk: 400, shippingFeeHome: 600 },
  { code: '20', name: '20 - Saïda', shippingFeeStopDesk: 450, shippingFeeHome: 700 },
  { code: '21', name: '21 - Skikda', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '22', name: '22 - Sidi Bel Abbès', shippingFeeStopDesk: 450, shippingFeeHome: 700 },
  { code: '23', name: '23 - Annaba', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '24', name: '24 - Guelma', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '26', name: '26 - Médéa', shippingFeeStopDesk: 350, shippingFeeHome: 550 },
  { code: '27', name: '27 - Mostaganem', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '28', name: '28 - M\'Sila', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '29', name: '29 - Mascara', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '32', name: '32 - El Bayadh', shippingFeeStopDesk: 500, shippingFeeHome: 800 },
  { code: '33', name: '33 - Illizi', shippingFeeStopDesk: 800, shippingFeeHome: 1300 },
  { code: '34', name: '34 - Bordj Bou Arréridj', shippingFeeStopDesk: 400, shippingFeeHome: 600 },
  { code: '35', name: '35 - Boumerdès', shippingFeeStopDesk: 350, shippingFeeHome: 500 },
  { code: '36', name: '36 - El Tarf', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '37', name: '37 - Tindouf', shippingFeeStopDesk: 800, shippingFeeHome: 1300 },
  { code: '38', name: '38 - Tissemsilt', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '40', name: '40 - Khenchela', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '41', name: '41 - Souk Ahras', shippingFeeStopDesk: 450, shippingFeeHome: 700 },
  { code: '42', name: '42 - Tipaza', shippingFeeStopDesk: 350, shippingFeeHome: 550 },
  { code: '43', name: '43 - Mila', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '44', name: '44 - Aïn Defla', shippingFeeStopDesk: 350, shippingFeeHome: 550 },
  { code: '45', name: '45 - Naâma', shippingFeeStopDesk: 500, shippingFeeHome: 800 },
  { code: '46', name: '46 - Aïn Témouchent', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '48', name: '48 - Relizane', shippingFeeStopDesk: 400, shippingFeeHome: 650 },
  { code: '49', name: '49 - El M\'Ghair', shippingFeeStopDesk: 500, shippingFeeHome: 900 },
  { code: '50', name: '50 - El Meniaa', shippingFeeStopDesk: 550, shippingFeeHome: 950 },
  { code: '51', name: '51 - Ouled Djellal', shippingFeeStopDesk: 500, shippingFeeHome: 850 },
  { code: '52', name: '52 - Bordj Baji Mokhtar', shippingFeeStopDesk: 900, shippingFeeHome: 1500 },
  { code: '53', name: '53 - Béni Abbès', shippingFeeStopDesk: 650, shippingFeeHome: 1000 },
  { code: '54', name: '54 - Timimoun', shippingFeeStopDesk: 650, shippingFeeHome: 1000 },
  { code: '55', name: '55 - Touggourt', shippingFeeStopDesk: 500, shippingFeeHome: 850 },
  { code: '56', name: '56 - Djanet', shippingFeeStopDesk: 900, shippingFeeHome: 1500 },
  { code: '57', name: '57 - In Salah', shippingFeeStopDesk: 700, shippingFeeHome: 1100 },
  { code: '58', name: '58 - In Guezzam', shippingFeeStopDesk: 900, shippingFeeHome: 1500 }
];

export function getWilayaByCode(code: string): Wilaya {
  return ALGERIAN_WILAYAS.find(w => w.code === code) || ALGERIAN_WILAYAS[0];
}

// --------------------------------------------------------------------
// LOCAL STORAGE MOCK ENGINE SEEDS
// --------------------------------------------------------------------
const SEED_PROFILES: Profile[] = [
  { id: '1', email: 'admin@algerian-cod.com', full_name: 'Imad Eddine Abdelkader', role: 'admin', phone: '0550112233', is_active: true },
  { id: '2', email: 'samira.b@algerian-cod.com', full_name: 'Samira Belkacem', role: 'manager', phone: '0660445566', is_active: true },
  { id: '3', email: 'fateh.o@algerian-cod.com', full_name: 'Fateh Othman', role: 'operator', phone: '0770889900', is_active: true },
  { id: '4', email: 'anis.l@algerian-cod.com', full_name: 'Anis Lamine', role: 'shipper', phone: '0560223344', is_active: true }
];

const SEED_BRANDS: Brand[] = [
  { id: 'b1', name: 'RYO BAGS', description: 'Sacs à main féminins chics de haute couture', created_at: new Date().toISOString() },
  { id: 'b2', name: 'RYO RIDERS', description: 'Accessoires urbains authentiques et streetwear de performance', created_at: new Date().toISOString() }
];

const SEED_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Women Handbags', description: 'Sacs à main élégants pour femmes', created_at: new Date().toISOString() },
  { id: 'cat2', name: 'Durags', description: 'Durags en satin soyeux de qualité supérieure', created_at: new Date().toISOString() },
  { id: 'cat3', name: 'Arm Sleeves', description: 'Manchettes rafraîchissantes de protection UV', created_at: new Date().toISOString() },
  { id: 'cat4', name: 'Accessories', description: 'Divers accessoires complémentaires de mode', created_at: new Date().toISOString() }
];

const SEED_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    brand_id: 'b1', 
    brand_name: 'RYO BAGS',
    sku: 'CRY-BAG-SR', 
    name: 'Crystal Bag SR', 
    category: 'Women Handbags', 
    purchase_price: 1200, 
    price: 3700, 
    stock_quantity: 64, 
    min_stock_alert: 5, 
    is_active: true, 
    weight_kg: 0.60,
    description: 'Exquis sac en cristal de luxe avec bandoulière détachable. Style chic et moderne de la collection RYO BAGS, idéal pour les occasions uniques.',
    created_at: new Date().toISOString()
  },
  { 
    id: 'p2', 
    brand_id: 'b2', 
    brand_name: 'RYO RIDERS',
    sku: 'RYO-DRG', 
    name: 'Durag Satin Silky', 
    category: 'Durags', 
    purchase_price: 700, 
    price: 1900, 
    stock_quantity: 15, 
    min_stock_alert: 5, 
    is_active: true, 
    weight_kg: 0.10,
    description: 'Durag satiné de haute qualité par RYO RIDERS pour maintien idéal des waves et confort extrême.',
    created_at: new Date().toISOString()
  },
  { 
    id: 'p3', 
    brand_id: 'b2', 
    brand_name: 'RYO RIDERS',
    sku: 'RYO-ARM-SLV', 
    name: 'Cooling Arm Sleeves', 
    category: 'Arm Sleeves', 
    purchase_price: 200, 
    price: 1400, 
    stock_quantity: 100, 
    min_stock_alert: 10, 
    is_active: true, 
    weight_kg: 0.15,
    description: 'Manchettes ultra-rafraîchissantes de protection UV. Vendu exclusivement par paire. Offres : 1 paire = 1400 DA, 2 paires = 2600 DA, 3 paires = 3900 DA.',
    created_at: new Date().toISOString()
  }
];

const SEED_PRODUCT_VARIANTS: ProductVariant[] = [
  { id: 'v1', product_id: 'p1', sku: 'CRY-BAG-SR-SLV', name: 'Crystal Bag SR - Silver', stock_quantity: 55, color: 'Silver', size: 'Unique', pack_quantity: 1 },
  { id: 'v2', product_id: 'p1', sku: 'CRY-BAG-SR-BLU', name: 'Crystal Bag SR - Blue', stock_quantity: 9, color: 'Blue', size: 'Unique', pack_quantity: 1 },
  { id: 'v3', product_id: 'p2', sku: 'RYO-DRG-BLK', name: 'Durag Satin Silky - Black', stock_quantity: 11, color: 'Black', size: 'Unique', pack_quantity: 1 },
  { id: 'v4', product_id: 'p2', sku: 'RYO-DRG-WHT', name: 'Durag Satin Silky - White', stock_quantity: 4, color: 'White', size: 'Unique', pack_quantity: 1 },
  { id: 'v5', product_id: 'p3', sku: 'RYO-SLV-BLK', name: 'Cooling Arm Sleeves - Black', stock_quantity: 73, color: 'Black', size: 'Paire', pack_quantity: 1 },
  { id: 'v6', product_id: 'p3', sku: 'RYO-SLV-PNK', name: 'Cooling Arm Sleeves - Pink', stock_quantity: 14, color: 'Pink', size: 'Paire', pack_quantity: 1 },
  { id: 'v7', product_id: 'p3', sku: 'RYO-SLV-WHT', name: 'Cooling Arm Sleeves - White', stock_quantity: 13, color: 'White', size: 'Paire', pack_quantity: 1 }
];

const SEED_INVENTORY_MOVEMENTS: InventoryMovement[] = [
  { id: 'm1', product_id: 'p1', variant_id: 'v1', quantity: 55, type: 'stock_in', reason: 'Stock initial - Silver', created_at: new Date().toISOString() },
  { id: 'm2', product_id: 'p1', variant_id: 'v2', quantity: 9, type: 'stock_in', reason: 'Stock initial - Blue', created_at: new Date().toISOString() },
  { id: 'm3', product_id: 'p2', variant_id: 'v3', quantity: 11, type: 'stock_in', reason: 'Stock initial - Black', created_at: new Date().toISOString() },
  { id: 'm4', product_id: 'p2', variant_id: 'v4', quantity: 4, type: 'stock_in', reason: 'Stock initial - White', created_at: new Date().toISOString() },
  { id: 'm5', product_id: 'p3', variant_id: 'v5', quantity: 73, type: 'stock_in', reason: 'Stock initial - Black pairs', created_at: new Date().toISOString() },
  { id: 'm6', product_id: 'p3', variant_id: 'v6', quantity: 14, type: 'stock_in', reason: 'Stock initial - Pink pairs', created_at: new Date().toISOString() },
  { id: 'm7', product_id: 'p3', variant_id: 'v7', quantity: 13, type: 'stock_in', reason: 'Stock initial - White pairs', created_at: new Date().toISOString() }
];

const SEED_CUSTOMERS: Customer[] = [
  { id: 'c1', phone: '0551987654', full_name: 'Yacine Benmansour', wilaya_code: '16', commune: 'Sidi M\'Hamed', address: '04 Rue Didouche Mourad, Alger Centre', is_blacklisted: false, total_orders_count: 5, successful_delivery_count: 5 },
  { id: 'c2', phone: '0661234567', full_name: 'Meriem Bensaoula', wilaya_code: '31', commune: 'Bir El Djir', address: 'Cité 500 Logements, Oran', is_blacklisted: false, total_orders_count: 3, successful_delivery_count: 2 },
  { id: 'c3', phone: '0772456123', full_name: 'Amine Djahnit', wilaya_code: '19', commune: 'El Eulma', address: 'Quartier commercial d\'El Eulma, Sétif', is_blacklisted: false, total_orders_count: 8, successful_delivery_count: 7 },
  { id: 'c4', phone: '0555998877', full_name: 'Farid Kaci', wilaya_code: '15', commune: 'Draâ Ben Khedda', address: 'Route Nationale N12, Tizi Ouzou', is_blacklisted: true, blacklist_reason: 'Refused delivery twice on contact dispatch without valid reason after confirming call.', total_orders_count: 2, successful_delivery_count: 0 }
];

// Seed initial orders
const SEED_ORDERS: Order[] = [
  {
    id: 'o1',
    order_number: 'COD-20260520-0001',
    customer_id: 'c1',
    customer_name: 'Yacine Benmansour',
    customer_phone: '0551987654',
    wilaya_code: '16',
    commune: 'Sidi M\'Hamed',
    shipping_address: '04 Rue Didouche Mourad, Alger Centre',
    subtotal_price: 3700,
    shipping_fee: 500,
    discount_amount: 0,
    total_price: 4200,
    status: 'delivered',
    payment_status: 'paid',
    tracking_number: 'YAL-ALG-19942',
    has_stop_desk: false,
    stock_deducted: true,
    estimated_profit: 3000,
    created_at: '2026-05-20T10:30:00Z',
    notes: 'Confirmé par téléphone, livraison rapide'
  },
  {
    id: 'o2',
    order_number: 'COD-20260521-0002',
    customer_id: 'c2',
    customer_name: 'Meriem Bensaoula',
    customer_phone: '0661234567',
    wilaya_code: '31',
    commune: 'Bir El Djir',
    shipping_address: 'Cité 500 Logements, Oran',
    subtotal_price: 3800,
    shipping_fee: 400,
    discount_amount: 0,
    total_price: 4200,
    status: 'dispatched',
    payment_status: 'unpaid',
    tracking_number: 'ZR-ORN-8647',
    has_stop_desk: true,
    stock_deducted: true,
    estimated_profit: 2800,
    created_at: '2026-05-21T14:15:00Z',
    notes: 'Stop Desk Bel Air Oran'
  },
  {
    id: 'o3',
    order_number: 'COD-20260523-0003',
    customer_id: 'c3',
    customer_name: 'Amine Djahnit',
    customer_phone: '0772456123',
    wilaya_code: '19',
    commune: 'El Eulma',
    shipping_address: 'Quartier commercial d\'El Eulma, Sétif',
    subtotal_price: 1400,
    shipping_fee: 650,
    discount_amount: 0,
    total_price: 2050,
    status: 'pending',
    payment_status: 'unpaid',
    tracking_number: '',
    has_stop_desk: false,
    stock_deducted: false,
    estimated_profit: 1850,
    created_at: '2026-05-23T09:00:00Z',
    notes: 'Appeler avant de dispatcher'
  },
  {
    id: 'o4',
    order_number: 'COD-20260523-0004',
    customer_id: 'c4',
    customer_name: 'Farid Kaci',
    customer_phone: '0555998877',
    wilaya_code: '15',
    commune: 'Draâ Ben Khedda',
    shipping_address: 'Route Nationale N12, Tizi Ouzou',
    subtotal_price: 3700,
    shipping_fee: 600,
    discount_amount: 0,
    total_price: 4300,
    status: 'cancelled',
    payment_status: 'unpaid',
    tracking_number: '',
    has_stop_desk: false,
    stock_deducted: false,
    estimated_profit: 0,
    created_at: '2026-05-23T11:45:00Z',
    notes: 'Client sur liste noire - Annulé automatiquement'
  }
];

const SEED_ORDER_ITEMS: OrderItem[] = [
  { id: 'item1', order_id: 'o1', product_id: 'p1', quantity: 1, price: 3700, purchase_price_at_sale: 1200, product_name: 'Crystal Bag SR', product_sku: 'CRY-BAG-SR' },
  { id: 'item2', order_id: 'o2', product_id: 'p2', quantity: 2, price: 1900, purchase_price_at_sale: 700, product_name: 'Durag Satin Silky', product_sku: 'RYO-DRG' },
  { id: 'item3', order_id: 'o3', product_id: 'p3', quantity: 1, price: 1400, purchase_price_at_sale: 200, product_name: 'Cooling Arm Sleeves', product_sku: 'RYO-ARM-SLV' },
  { id: 'item4', order_id: 'o4', product_id: 'p1', quantity: 1, price: 3700, purchase_price_at_sale: 1200, product_name: 'Crystal Bag SR', product_sku: 'CRY-BAG-SR' }
];

const SEED_EXPENSES: Expense[] = [
  { id: 'e1', category: 'marketing', amount: 15000, description: 'Facebook Meta Ads - Ramadan Promotion Dates Campaign', expense_date: '2026-05-20' },
  { id: 'e2', category: 'delivery', amount: 3200, description: 'ZR Express monthly account setup and insurance fee', expense_date: '2026-05-21' },
  { id: 'e3', category: 'salaries', amount: 45000, description: 'Part-time operator bonus for call confirmation streaks', expense_date: '2026-05-22' },
  { id: 'e4', category: 'sourcing', amount: 24000, description: 'Wholesale batch dates import transport from Tolga, Biskra', expense_date: '2026-05-23' }
];

const SEED_AD_CAMPAIGNS: AdCampaign[] = [
  { id: 'ad1', name: 'Dates Biskra Sales Meta', platform: 'Facebook ADs', spend: 45000, starts_at: '2026-05-15', ends_at: '2026-05-25' },
  { id: 'ad2', name: 'Kabylie Olive Oil Promo', platform: 'TikTok ADs', spend: 22000, starts_at: '2026-05-18', ends_at: '2026-05-28' },
  { id: 'ad3', name: 'Babouche Elegant Slides', platform: 'Instagram ADs', spend: 15000, starts_at: '2026-05-20', ends_at: '2026-05-27' }
];

// Helper to sanitize local storage data getting or setting
function getLocal<T>(key: string, seed: T[]): T[] {
  const data = localStorage.getItem(`dz_cod_${key}`);
  if (!data) {
    localStorage.setItem(`dz_cod_${key}`, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return seed;
  }
}

function saveLocal<T>(key: string, data: T[]) {
  localStorage.setItem(`dz_cod_${key}`, JSON.stringify(data));
}

export function isUuid(str: string): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// ====================================================================
// FALLBACK DATA STORES (Mock Store acting as localized Supabase substitute)
// ====================================================================
export const mockDb = {
  getProfiles: async (): Promise<Profile[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) console.error("Error fetching profiles:", error);
      return data || [];
    }
    return getLocal<Profile>('profiles', []);
  },
  saveProfile: async (item: Profile): Promise<void> => {
    if (isConfigured && supabase) {
      const { error } = await supabase.from('profiles').upsert(item);
      if (error) console.error("Error saving profile:", error);
      return;
    }
    const list = getLocal<Profile>('profiles', []);
    const idx = list.findIndex(p => p.id === item.id);
    if (idx !== -1) list[idx] = item;
    else list.push(item);
    saveLocal('profiles', list);
  },

  getProducts: async (): Promise<Product[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) console.error("Error fetching products:", error);
      if (data) {
        try {
          const { data: bData } = await supabase.from('brands').select('id, name');
          if (bData) {
            return data.map((p: any) => ({
              ...p,
              brand_name: bData.find((b: any) => b.id === p.brand_id)?.name || ''
            }));
          }
        } catch (bErr) {
          // ignore
        }
        return data;
      }
      return [];
    }
    const prods = getLocal<Product>('products', SEED_PRODUCTS);
    const brands = getLocal<Brand>('brands', SEED_BRANDS);
    return prods.map(p => ({
      ...p,
      brand_name: brands.find(b => b.id === p.brand_id)?.name || ''
    }));
  },
  saveProduct: async (item: Partial<Product> & { id?: string }): Promise<void> => {
    if (isConfigured && supabase) {
      if (item.id && isUuid(item.id)) {
        const { error } = await supabase.from('products').update(item).eq('id', item.id);
        if (error) throw error;
      } else {
        const { id, ...newItem } = item;
        const { error } = await supabase.from('products').insert({
          ...newItem,
          sku: newItem.sku || `PROD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          is_active: newItem.is_active ?? true
        });
        if (error) throw error;
      }
      return;
    }

    const list = getLocal<Product>('products', SEED_PRODUCTS);
    if (item.id) {
      const idx = list.findIndex(p => p.id === item.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...item };
      }
    } else {
      list.push({ 
        ...item, 
        id: Math.random().toString(36).substring(2, 9), 
        sku: item.sku || `PROD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        is_active: true, 
        created_at: new Date().toISOString() 
      } as Product);
    }
    saveLocal('products', list);
  },
  deleteProduct: async (id: string): Promise<void> => {
    if (isConfigured && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const list = getLocal<Product>('products', SEED_PRODUCTS);
    const filtered = list.filter(p => p.id !== id);
    saveLocal('products', filtered);
  },

  getCustomers: async (): Promise<Customer[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) console.error("Error fetching customers:", error);
      return data || [];
    }
    return getLocal<Customer>('customers', []);
  },
  saveCustomer: async (item: Customer): Promise<Customer> => {
    if (isConfigured && supabase) {
      const normalizedPhone = cleanPhone(item.phone);
      const updatedCustomer = { ...item, phone: normalizedPhone };
      if (item.id && isUuid(item.id)) {
        const { error } = await supabase.from('customers').update({
          full_name: updatedCustomer.full_name,
          phone: updatedCustomer.phone,
          wilaya_code: updatedCustomer.wilaya_code,
          commune: updatedCustomer.commune,
          address: updatedCustomer.address,
          is_blacklisted: updatedCustomer.is_blacklisted,
          blacklist_reason: updatedCustomer.blacklist_reason,
          total_orders_count: updatedCustomer.total_orders_count,
          successful_delivery_count: updatedCustomer.successful_delivery_count
        }).eq('id', item.id);
        if (error) throw error;
        return updatedCustomer;
      } else {
        const { id, ...insertPayload } = updatedCustomer;
        const { data, error } = await supabase.from('customers').insert(insertPayload).select().single();
        if (error) throw error;
        return data;
      }
    }

    const list = getLocal<Customer>('customers', []);
    const normalizedPhone = cleanPhone(item.phone);
    const existingIdx = list.findIndex(c => cleanPhone(c.phone) === normalizedPhone);
    const updatedCustomer = { ...item, phone: normalizedPhone };
    
    if (existingIdx !== -1) {
      list[existingIdx] = { ...list[existingIdx], ...updatedCustomer };
    } else {
      updatedCustomer.id = updatedCustomer.id || Math.random().toString(36).substring(2, 9);
      updatedCustomer.total_orders_count = updatedCustomer.total_orders_count || 0;
      updatedCustomer.successful_delivery_count = updatedCustomer.successful_delivery_count || 0;
      updatedCustomer.is_blacklisted = updatedCustomer.is_blacklisted || false;
      list.push(updatedCustomer);
    }
    saveLocal('customers', list);
    return updatedCustomer;
  },

  getOrders: async (): Promise<Order[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) console.error("Error fetching orders:", error);
      return data || [];
    }
    return getLocal<Order>('orders', []);
  },
  getOrderItems: async (): Promise<OrderItem[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products (
            name,
            sku
          )
        `);
      if (error) {
        console.error("Error fetching order items:", error);
        return [];
      }
      return (data || []).map((item: any) => ({
        ...item,
        product_name: item.products?.name || 'Produit Supprimé',
        product_sku: item.products?.sku || 'N/A'
      }));
    }
    return getLocal<OrderItem>('order_items', []);
  },
  
  createOrder: async (orderData: Partial<Order>, items: { product_id: string; quantity: number }[]): Promise<Order> => {
    if (isConfigured && supabase) {
      const cleanCustomerPhone = cleanPhone(orderData.customer_phone || '');
      
      const { data: existingCustomers } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', cleanCustomerPhone);

      let customerId = '';
      let customerObj: any = null;

      if (existingCustomers && existingCustomers.length > 0) {
        customerObj = existingCustomers[0];
        customerId = customerObj.id;
        await supabase
          .from('customers')
          .update({ total_orders_count: (customerObj.total_orders_count || 0) + 1 })
          .eq('id', customerId);
      } else {
        const { data: newCust, error: custErr } = await supabase
          .from('customers')
          .insert({
            phone: cleanCustomerPhone,
            full_name: orderData.customer_name || 'Inconnu',
            wilaya_code: orderData.wilaya_code || '16',
            commune: orderData.commune || '',
            address: orderData.shipping_address || '',
            total_orders_count: 1,
            successful_delivery_count: 0
          })
          .select()
          .single();
        if (custErr) throw custErr;
        customerObj = newCust;
        customerId = newCust.id;
      }

      const productIds = items.map(i => i.product_id);
      const { data: dbProducts } = await supabase
        .from('products')
        .select('id, name, sku, price, purchase_price')
        .in('id', productIds);

      let subtotal = 0;
      let totalPurchaseCost = 0;
      const computedItems = items.map(itm => {
        const p = dbProducts?.find(prod => prod.id === itm.product_id);
        const itemPrice = p ? Number(p.price) : 0;
        const purchasePrice = p ? Number(p.purchase_price) : 0;
        subtotal += itemPrice * itm.quantity;
        totalPurchaseCost += purchasePrice * itm.quantity;
        return {
          product_id: itm.product_id,
          quantity: itm.quantity,
          price: itemPrice,
          purchase_price_at_sale: purchasePrice
        };
      });

      const shippingFee = orderData.shipping_fee ?? 500;
      const discountAmount = orderData.discount_amount ?? 0;
      const totalPrice = subtotal + shippingFee - discountAmount;
      const estimatedProfit = totalPrice - totalPurchaseCost;
      const statusInput = orderData.status || 'pending';

      const invoicePayload = {
        customer_id: customerId,
        customer_name: orderData.customer_name || customerObj.full_name,
        customer_phone: cleanCustomerPhone,
        wilaya_code: orderData.wilaya_code || '16',
        commune: orderData.commune || '',
        shipping_address: orderData.shipping_address || '',
        subtotal_price: subtotal,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        status: statusInput,
        payment_status: orderData.payment_status || 'unpaid',
        tracking_number: orderData.tracking_number || '',
        has_stop_desk: !!orderData.has_stop_desk,
        notes: orderData.notes || '',
        estimated_profit: estimatedProfit
      };

      const { data: newOrder, error: orderErr } = await supabase
        .from('orders')
        .insert(invoicePayload)
        .select()
        .single();

      if (orderErr) throw orderErr;

      const orderItemPayloads = computedItems.map(itm => ({
        order_id: newOrder.id,
        product_id: itm.product_id,
        quantity: itm.quantity,
        price: itm.price,
        purchase_price_at_sale: itm.purchase_price_at_sale
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItemPayloads);

      if (itemsErr) throw itemsErr;

      if (['confirmed', 'dispatched', 'delivered'].includes(statusInput)) {
        await supabase
          .from('orders')
          .update({ status: statusInput })
          .eq('id', newOrder.id);
      }

      return newOrder;
    }

    const orders = getLocal<Order>('orders', []);
    const orderItems = getLocal<OrderItem>('order_items', []);
    const products = getLocal<Product>('products', []);

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todayOrdersCount = orders.filter(o => o.created_at?.startsWith(new Date().toISOString().slice(0, 10))).length;
    const orderNum = `COD-${todayStr}-${String(todayOrdersCount + 1).padStart(4, '0')}`;

    let subtotal = 0;
    const newItems: OrderItem[] = [];
    const ordId = Math.random().toString(36).substring(2, 9);
    const cleanCustomerPhone = cleanPhone(orderData.customer_phone || '');

    items.forEach(itm => {
      const prod = products.find(p => p.id === itm.product_id);
      if (prod) {
        const itemPrice = prod.price;
        subtotal += itemPrice * itm.quantity;
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          order_id: ordId,
          product_id: prod.id,
          quantity: itm.quantity,
          price: itemPrice,
          purchase_price_at_sale: prod.purchase_price,
          product_name: prod.name,
          product_sku: prod.sku
        });
      }
    });

    const customers = getLocal<Customer>('customers', []);
    let cust = customers.find(c => cleanPhone(c.phone) === cleanCustomerPhone);
    if (!cust) {
      cust = {
        id: Math.random().toString(36).substring(2, 9),
        phone: cleanCustomerPhone,
        full_name: orderData.customer_name || 'Inconnu',
        wilaya_code: orderData.wilaya_code || '16',
        commune: orderData.commune || '',
        address: orderData.shipping_address || '',
        is_blacklisted: false,
        total_orders_count: 1,
        successful_delivery_count: 0
      };
      customers.push(cust);
      saveLocal('customers', customers);
    } else {
      cust.total_orders_count += 1;
      saveLocal('customers', customers);
    }

    const newOrder: Order = {
      id: ordId,
      order_number: orderNum,
      customer_id: cust.id,
      customer_name: orderData.customer_name || cust.full_name,
      customer_phone: cleanCustomerPhone,
      wilaya_code: orderData.wilaya_code || '16',
      commune: orderData.commune || '',
      shipping_address: orderData.shipping_address || '',
      subtotal_price: subtotal,
      shipping_fee: orderData.shipping_fee ?? 500,
      discount_amount: orderData.discount_amount ?? 0,
      total_price: subtotal + (orderData.shipping_fee ?? 500) - (orderData.discount_amount ?? 0),
      status: (orderData.status as any) || 'pending',
      payment_status: orderData.payment_status || 'unpaid',
      tracking_number: orderData.tracking_number || '',
      has_stop_desk: !!orderData.has_stop_desk,
      stock_deducted: false,
      notes: orderData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let totalAcquisition = 0;
    newItems.forEach(ni => {
      totalAcquisition += ni.purchase_price_at_sale * ni.quantity;
    });
    newOrder.estimated_profit = newOrder.total_price - totalAcquisition;

    if (['confirmed', 'dispatched', 'delivered'].includes(newOrder.status)) {
      newItems.forEach(ni => {
        const pIdx = products.findIndex(p => p.id === ni.product_id);
        if (pIdx !== -1) {
          products[pIdx].stock_quantity = Math.max(0, products[pIdx].stock_quantity - ni.quantity);
        }
      });
      newOrder.stock_deducted = true;
      saveLocal('products', products);
    }

    orders.unshift(newOrder);
    saveLocal('orders', orders);

    const updatedOrderItems = [...orderItems, ...newItems];
    saveLocal('order_items', updatedOrderItems);

    return newOrder;
  },

  updateOrderStatus: async (orderId: string, newStatus: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'returned' | 'cancelled'): Promise<void> => {
    if (isConfigured && supabase) {
      const { data: prevOrder } = await supabase.from('orders').select('status, customer_id').eq('id', orderId).single();
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;

      if (prevOrder && prevOrder.customer_id) {
        const prevStatus = prevOrder.status;
        if (newStatus === 'delivered' && prevStatus !== 'delivered') {
          const { data: customerObj } = await supabase.from('customers').select('successful_delivery_count').eq('id', prevOrder.customer_id).single();
          if (customerObj) {
            await supabase.from('customers').update({
              successful_delivery_count: (customerObj.successful_delivery_count || 0) + 1
            }).eq('id', prevOrder.customer_id);
            await supabase.from('orders').update({ payment_status: 'paid' }).eq('id', orderId);
          }
        } else if (prevStatus === 'delivered' && newStatus !== 'delivered') {
          const { data: customerObj } = await supabase.from('customers').select('successful_delivery_count').eq('id', prevOrder.customer_id).single();
          if (customerObj) {
            await supabase.from('customers').update({
              successful_delivery_count: Math.max(0, (customerObj.successful_delivery_count || 0) - 1)
            }).eq('id', prevOrder.customer_id);
            await supabase.from('orders').update({ payment_status: 'unpaid' }).eq('id', orderId);
          }
        }
      }
      return;
    }

    const orders = getLocal<Order>('orders', []);
    const orderItems = getLocal<OrderItem>('order_items', []);
    const products = getLocal<Product>('products', []);
    const customers = getLocal<Customer>('customers', []);

    const ordIdx = orders.findIndex(o => o.id === orderId);
    if (ordIdx === -1) return;

    const ord = orders[ordIdx];
    const prevStatus = ord.status;
    const wasDeducted = ord.stock_deducted;

    let stockDeltaMode: 'no_change' | 'deduct' | 'restore' = 'no_change';

    if (['confirmed', 'dispatched', 'delivered'].includes(newStatus) && !wasDeducted) {
      stockDeltaMode = 'deduct';
      ord.stock_deducted = true;
    } else if (['cancelled', 'returned'].includes(newStatus) && wasDeducted) {
      stockDeltaMode = 'restore';
      ord.stock_deducted = false;
    }

    const items = orderItems.filter(item => item.order_id === orderId);
    items.forEach(itm => {
      const pIdx = products.findIndex(p => p.id === itm.product_id);
      if (pIdx !== -1) {
        if (stockDeltaMode === 'deduct') {
          products[pIdx].stock_quantity = Math.max(0, products[pIdx].stock_quantity - itm.quantity);
        } else if (stockDeltaMode === 'restore') {
          products[pIdx].stock_quantity = products[pIdx].stock_quantity + itm.quantity;
        }
      }
    });

    if (newStatus === 'delivered' && prevStatus !== 'delivered') {
      const custIdx = customers.findIndex(c => c.id === ord.customer_id);
      if (custIdx !== -1) {
        customers[custIdx].successful_delivery_count += 1;
      }
      ord.payment_status = 'paid';
    } else if (prevStatus === 'delivered' && newStatus !== 'delivered') {
      const custIdx = customers.findIndex(c => c.id === ord.customer_id);
      if (custIdx !== -1) {
        customers[custIdx].successful_delivery_count = Math.max(0, customers[custIdx].successful_delivery_count - 1);
      }
      if (newStatus === 'returned' || newStatus === 'cancelled') {
        ord.payment_status = 'unpaid';
      }
    }

    ord.status = newStatus;
    ord.updated_at = new Date().toISOString();
    
    saveLocal('orders', orders);
    saveLocal('products', products);
    saveLocal('customers', customers);
  },

  deleteOrder: async (orderId: string): Promise<void> => {
    if (isConfigured && supabase) {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      return;
    }
    const orders = getLocal<Order>('orders', []);
    const filtered = orders.filter(o => o.id !== orderId);
    saveLocal('orders', filtered);

    const orderItems = getLocal<OrderItem>('order_items', []);
    const filteredItems = orderItems.filter(i => i.order_id !== orderId);
    saveLocal('order_items', filteredItems);
  },

  deleteExpense: async (expenseId: string): Promise<void> => {
    if (isConfigured && supabase) {
      const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
      if (error) throw error;
      return;
    }
    const list = getLocal<Expense>('expenses', []);
    const filtered = list.filter(e => e.id !== expenseId);
    saveLocal('expenses', filtered);
  },

  getExpenses: async (): Promise<Expense[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false });
      if (error) console.error("Error fetching expenses:", error);
      return data || [];
    }
    return getLocal<Expense>('expenses', []);
  },
  saveExpense: async (item: Partial<Expense> & { id?: string }): Promise<void> => {
    if (isConfigured && supabase) {
      if (item.id && isUuid(item.id)) {
        const { error } = await supabase.from('expenses').update(item).eq('id', item.id);
        if (error) throw error;
      } else {
        const { id, ...newItem } = item;
        const { error } = await supabase.from('expenses').insert(newItem);
        if (error) throw error;
      }
      return;
    }

    const list = getLocal<Expense>('expenses', []);
    list.unshift({
      ...item,
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    } as Expense);
    saveLocal('expenses', list);
  },

  getAdCampaigns: async (): Promise<AdCampaign[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('ad_campaigns').select('*').order('starts_at', { ascending: false });
      if (error) console.error("Error fetching campaigns:", error);
      return data || [];
    }
    return getLocal<AdCampaign>('ad_campaigns', []);
  },
  saveAdCampaign: async (item: Partial<AdCampaign> & { id?: string }): Promise<void> => {
    if (isConfigured && supabase) {
      if (item.id && isUuid(item.id)) {
        const { error } = await supabase.from('ad_campaigns').update(item).eq('id', item.id);
        if (error) throw error;
      } else {
        const { id, ...newItem } = item;
        const { error } = await supabase.from('ad_campaigns').insert(newItem);
        if (error) throw error;
      }
      return;
    }

    const list = getLocal<AdCampaign>('ad_campaigns', []);
    list.unshift({
      ...item,
      id: Math.random().toString(36).substring(2, 9)
    } as AdCampaign);
    saveLocal('ad_campaigns', list);
  },

  getBrands: async (): Promise<Brand[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('brands').select('*').order('name');
      if (error) console.error("Error fetching brands:", error);
      return data || [];
    }
    return getLocal<Brand>('brands', SEED_BRANDS);
  },
  saveBrand: async (item: Partial<Brand> & { id?: string }): Promise<Brand> => {
    if (isConfigured && supabase) {
      if (item.id && isUuid(item.id)) {
        const { data, error } = await supabase.from('brands').update(item).eq('id', item.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { id, ...newItem } = item;
        const { data, error } = await supabase.from('brands').insert(newItem).select().single();
        if (error) throw error;
        return data;
      }
    }
    const list = getLocal<Brand>('brands', SEED_BRANDS);
    const brandItem = {
      ...item,
      id: item.id || Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    } as Brand;
    const idx = list.findIndex(b => b.id === brandItem.id);
    if (idx !== -1) list[idx] = { ...list[idx], ...brandItem };
    else list.push(brandItem);
    saveLocal('brands', list);
    return brandItem;
  },
  deleteBrand: async (id: string): Promise<void> => {
    if (isConfigured && supabase) {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const list = getLocal<Brand>('brands', SEED_BRANDS);
    const filtered = list.filter(b => b.id !== id);
    saveLocal('brands', filtered);
  },

  getCategories: async (): Promise<Category[]> => {
    if (isConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (!error && data) return data;
      } catch (e) {
        // Fallback to table check gracefully
      }
    }
    return getLocal<Category>('categories', SEED_CATEGORIES);
  },
  saveCategory: async (item: Partial<Category> & { id?: string }): Promise<Category> => {
    const list = getLocal<Category>('categories', SEED_CATEGORIES);
    const catItem = {
      ...item,
      id: item.id || Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    } as Category;
    const idx = list.findIndex(c => c.id === catItem.id);
    if (idx !== -1) list[idx] = { ...list[idx], ...catItem };
    else list.push(catItem);
    saveLocal('categories', list);

    if (isConfigured && supabase) {
      try {
        await supabase.from('categories').upsert(catItem);
      } catch (e) {
        // Ignore table check gracefully
      }
    }
    return catItem;
  },
  deleteCategory: async (id: string): Promise<void> => {
    const list = getLocal<Category>('categories', SEED_CATEGORIES);
    const filtered = list.filter(c => c.id !== id);
    saveLocal('categories', filtered);
  },

  getProductVariants: async (): Promise<ProductVariant[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('product_variants').select('*').order('sku');
      if (error) console.error("Error fetching variants:", error);
      if (data) {
        try {
          const { data: pData } = await supabase.from('products').select('id, name');
          if (pData) {
            return data.map((v: any) => ({
              ...v,
              product_name: pData.find((p: any) => p.id === v.product_id)?.name || ''
            }));
          }
        } catch (pErr) {
          // ignore
        }
        return data;
      }
      return [];
    }
    const list = getLocal<ProductVariant>('product_variants', SEED_PRODUCT_VARIANTS);
    const products = getLocal<Product>('products', SEED_PRODUCTS);
    return list.map(v => ({
      ...v,
      product_name: products.find(p => p.id === v.product_id)?.name || ''
    }));
  },
  saveProductVariant: async (item: Partial<ProductVariant> & { id?: string }): Promise<ProductVariant> => {
    if (isConfigured && supabase) {
      if (item.id && isUuid(item.id)) {
        const { data, error } = await supabase.from('product_variants').update(item).eq('id', item.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { id, ...newItem } = item;
        const { data, error } = await supabase.from('product_variants').insert({
          ...newItem,
          sku: newItem.sku || `VAR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        }).select().single();
        if (error) throw error;
        return data;
      }
    }
    const list = getLocal<ProductVariant>('product_variants', SEED_PRODUCT_VARIANTS);
    const variantItem = {
      ...item,
      id: item.id || Math.random().toString(36).substring(2, 9),
      sku: item.sku || `VAR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      created_at: new Date().toISOString()
    } as ProductVariant;
    const idx = list.findIndex(v => v.id === variantItem.id);
    if (idx !== -1) list[idx] = { ...list[idx], ...variantItem };
    else list.push(variantItem);
    saveLocal('product_variants', list);
    return variantItem;
  },
  deleteProductVariant: async (id: string): Promise<void> => {
    if (isConfigured && supabase) {
      const { error } = await supabase.from('product_variants').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const list = getLocal<ProductVariant>('product_variants', SEED_PRODUCT_VARIANTS);
    const filtered = list.filter(v => v.id !== id);
    saveLocal('product_variants', filtered);
  },

  getInventoryMovements: async (): Promise<InventoryMovement[]> => {
    if (isConfigured && supabase) {
      const { data, error } = await supabase.from('inventory_movements').select('*').order('created_at', { ascending: false });
      if (error) console.error("Error fetching inventory movements:", error);
      if (data) {
        try {
          const { data: pData } = await supabase.from('products').select('id, name');
          const { data: vData } = await supabase.from('product_variants').select('id, name');
          const { data: profData } = await supabase.from('profiles').select('id, full_name');
          return data.map((m: any) => ({
            ...m,
            product_name: pData?.find((p: any) => p.id === m.product_id)?.name || '',
            variant_name: vData?.find((v: any) => v.id === m.variant_id)?.name || '',
            operator_name: profData?.find((p: any) => p.id === m.created_by)?.full_name || 'Système Auto'
          }));
        } catch (err) {
          // ignore
        }
        return data;
      }
      return [];
    }
    const list = getLocal<InventoryMovement>('inventory_movements', SEED_INVENTORY_MOVEMENTS);
    const products = getLocal<Product>('products', SEED_PRODUCTS);
    const variants = getLocal<ProductVariant>('product_variants', SEED_PRODUCT_VARIANTS);
    return list.map(m => ({
      ...m,
      product_name: products.find(p => p.id === m.product_id)?.name || '',
      variant_name: variants.find(v => v.id === m.variant_id)?.name || '',
      operator_name: 'Système Auto'
    }));
  },
  saveInventoryMovement: async (item: Partial<InventoryMovement> & { id?: string }): Promise<InventoryMovement> => {
    if (isConfigured && supabase) {
      const { id, ...newItem } = item;
      const { data, error } = await supabase.from('inventory_movements').insert({
        ...newItem,
        created_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      return data;
    }
    const list = getLocal<InventoryMovement>('inventory_movements', SEED_INVENTORY_MOVEMENTS);
    const movItem = {
      ...item,
      id: item.id || Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    } as InventoryMovement;
    list.unshift(movItem);
    saveLocal('inventory_movements', list);
    return movItem;
  },

  getEmployeePerformance: async (): Promise<EmployeePerformance[]> => {
    const profiles = await mockDb.getProfiles();
    const orders = await mockDb.getOrders();
    let logsCountMap: Record<string, number> = {};

    if (isConfigured && supabase) {
      const { data: logs } = await supabase.from('call_logs').select('operator_id');
      if (logs) {
        logs.forEach((l: any) => {
          if (l.operator_id) {
            logsCountMap[l.operator_id] = (logsCountMap[l.operator_id] || 0) + 1;
          }
        });
      }
    }

    return profiles.map(p => {
      const callsValue = logsCountMap[p.id] || (p.role === 'operator' ? 12 : p.role === 'admin' ? 2 : 4);
      const profileOrders = orders.filter(o => o.assigned_to === p.id);
      
      const confirmed = profileOrders.filter(o => ['confirmed', 'dispatched', 'delivered'].includes(o.status)).length;
      const delivered = profileOrders.filter(o => o.status === 'delivered').length;
      
      const conversion_rate = callsValue > 0 ? Number(((confirmed / callsValue) * 100).toFixed(1)) : 0.0;
      const delivery_success_rate = confirmed > 0 ? Number(((delivered / confirmed) * 100).toFixed(1)) : 0.0;
      
      return {
        profile_id: p.id,
        full_name: p.full_name,
        role: p.role,
        total_calls_made: callsValue,
        total_orders_confirmed: confirmed,
        total_orders_delivered: delivered,
        conversion_rate,
        delivery_success_rate
      };
    });
  }
};

// Clean Algerian phone number implementation
export function cleanPhone(phoneStr: string): string {
  if (!phoneStr) return '';
  let cleaned = phoneStr.replace(/\D/g, '');
  if (cleaned.startsWith('213')) {
    cleaned = '0' + cleaned.substring(3);
  } else if (cleaned.startsWith('00213')) {
    cleaned = '0' + cleaned.substring(5);
  } else if (!cleaned.startsWith('0') && cleaned.length === 9) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}
