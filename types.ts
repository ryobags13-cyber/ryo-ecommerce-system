export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'operator' | 'shipper';
  phone?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Customer {
  id: string;
  phone: string;
  full_name: string;
  wilaya_code: string;
  commune?: string;
  address?: string;
  is_blacklisted: boolean;
  blacklist_reason?: string;
  total_orders_count: number;
  successful_delivery_count: number;
  created_at?: string;
}

export interface Product {
  id: string;
  brand_id?: string;
  brand_name?: string; // join helper
  sku: string;
  name: string;
  category?: string;
  description?: string;
  purchase_price: number;
  price: number;
  stock_quantity: number;
  min_stock_alert: number;
  is_active: boolean;
  weight_kg?: number;
  images?: string[];
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  product_name?: string; // join helper
  sku: string;
  name: string;
  stock_quantity: number;
  price_override?: number;
  color?: string;
  size?: string;
  pack_quantity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  product_name?: string; // join helper
  variant_id?: string;
  variant_name?: string; // join helper
  quantity: number;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'return';
  reason?: string;
  created_by?: string;
  operator_name?: string; // join helper
  created_at?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'returned' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  delivery_company_id?: string;
  customer_name: string;
  customer_phone: string;
  wilaya_code: string;
  commune: string;
  shipping_address: string;
  subtotal_price: number;
  shipping_fee: number;
  discount_amount: number;
  total_price: number; // generated custom count
  estimated_profit?: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  tracking_number?: string;
  has_stop_desk: boolean;
  stock_deducted: boolean;
  external_id?: string;
  created_by?: string;
  assigned_to?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  purchase_price_at_sale: number;
  // utility join fields
  product_name?: string;
  product_sku?: string;
}

export interface Expense {
  id: string;
  category: 'marketing' | 'delivery' | 'sourcing' | 'operational' | 'salaries' | 'other';
  amount: number;
  description: string;
  expense_date: string;
  created_by?: string;
  created_at?: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: string;
  spend: number;
  starts_at: string;
  ends_at: string;
}

export interface DeliveryCompany {
  id: string;
  name: string;
  contact_phone?: string;
  api_key?: string;
  tracking_url_template?: string;
  is_active: boolean;
}

export interface EmployeePerformance {
  profile_id: string;
  full_name?: string; // joined
  role?: string; // joined
  total_calls_made: number;
  total_orders_confirmed: number;
  total_orders_delivered: number;
  conversion_rate: number;
  delivery_success_rate: number;
}
