import { useState, useEffect } from 'react';
import { Product, Order, Customer } from '../types';
import { mockDb, ALGERIAN_WILAYAS } from '../supabase';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Percent,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

interface Props {
  onNavigate: (tab: string) => void;
}

export default function DashboardStats({ onNavigate }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    // Read from our data engine asynchronously
    async function loadData() {
      try {
        const [ordersData, productsData, customersData] = await Promise.all([
          mockDb.getOrders(),
          mockDb.getProducts(),
          mockDb.getCustomers()
        ]);
        setOrders(ordersData);
        setProducts(productsData);
        setCustomers(customersData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    }
    loadData();
  }, []);

  const totalOrders = orders.length;
  const activeProductsCount = products.filter(p => p.is_active).length;
  const activeCustomersCount = customers.length;

  // Revenue from successfully DELIVERED orders
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((acc, o) => acc + o.total_price, 0);

  // Profit calculations from delivered orders
  const totalProfit = deliveredOrders.reduce((acc, o) => acc + (o.estimated_profit || 0), 0);

  // Confirmation state percentages
  const confirmedCount = orders.filter(o => ['confirmed', 'dispatched', 'delivered'].includes(o.status)).length;
  const confirmationRate = totalOrders > 0 ? (confirmedCount / totalOrders * 100).toFixed(1) : '0';

  // Delivery state percentages
  const dispatchedOrDelivered = orders.filter(o => ['dispatched', 'delivered'].includes(o.status)).length;
  const deliverySuccessRate = confirmedCount > 0 ? (deliveredOrders.length / confirmedCount * 100).toFixed(1) : '0';

  // Alerts: items below min_stock_alert
  const lowStockProducts = products.filter(p => p.stock_quantity <= p.min_stock_alert);

  // Statistics per Wilaya for Algerian COD
  const wilayaStatsMap: Record<string, { count: number; value: number }> = {};
  orders.forEach(o => {
    if (o.status !== 'cancelled') {
      if (!wilayaStatsMap[o.wilaya_code]) {
        wilayaStatsMap[o.wilaya_code] = { count: 0, value: 0 };
      }
      wilayaStatsMap[o.wilaya_code].count += 1;
      wilayaStatsMap[o.wilaya_code].value += o.total_price;
    }
  });

  const sortedWilayas = Object.entries(wilayaStatsMap)
    .map(([code, data]) => {
      const wilayaName = ALGERIAN_WILAYAS.find(w => w.code === code)?.name || `Wilaya ${code}`;
      return { code, name: wilayaName, ...data };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Chiffre d'Affaires</span>
            <h3 className="text-2xl font-bold font-sans text-gray-900">{totalRevenue.toLocaleString()} DA</h3>
            <p className="text-xs text-green-600 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.h-3" />
              Livraisons payées uniquement
            </p>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Profit */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bénéfices Estimés</span>
            <h3 className="text-2xl font-bold font-sans text-indigo-700">{totalProfit.toLocaleString()} DA</h3>
            <p className="text-xs text-indigo-500 font-mono">Déduction des frais & achats</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Commandes Totales</span>
            <h3 className="text-2xl font-bold font-sans text-gray-900">{totalOrders}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {orders.filter(o => o.status === 'pending').length} en attente de confirmation
            </p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl text-amber-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* KPI: Delivery success rates */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Taux de Taux</span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold font-sans text-gray-900">{deliverySuccessRate}%</h3>
              <span className="text-xs text-gray-500 font-mono">Livraison</span>
            </div>
            <p className="text-xs text-gray-500">
              Conf: <strong className="font-mono">{confirmationRate}%</strong>
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
            <Percent className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wilaya Top Sales */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-sans font-bold text-gray-900">Wilayas Performance COD</h4>
              <p className="text-xs text-gray-500">Top des régions génératrices de volume (hors commandes annulées)</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-mono font-medium">
              58 Wilayas Active
            </span>
          </div>

          <div className="space-y-4">
            {sortedWilayas.length > 0 ? (
              sortedWilayas.map((w, index) => {
                const percentageOfTotal = totalRevenue > 0 ? (w.value / totalRevenue * 100) : 0;
                return (
                  <div key={w.code} className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-700 font-medium">
                      <span>{w.name}</span>
                      <span className="font-mono text-gray-900">{w.value.toLocaleString()} DA ({w.count} cmd)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, percentageOfTotal))}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 text-center py-6">Aucune statistique disponible pour le moment.</p>
            )}
          </div>
        </div>

        {/* Right Panel: Alerts & Stock alarms */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h4 className="font-sans font-bold text-gray-900">Alerte de Stock</h4>
            </div>
            <p className="text-xs text-gray-500 mb-4 font-normal">
              Produits dont la quantité est critique pour assurer les commandes à venir.
            </p>

            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                      <p className="text-[10px] font-mono text-gray-400">SKU: {p.sku}</p>
                    </div>
                    <span className="font-mono text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-md shrink-0">
                      {p.stock_quantity} pièces
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
                  <p className="text-xs">Tous les stocks sont au-dessus de l'alerte !</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={() => onNavigate('Stock')}
            className="w-full mt-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium py-2 rounded-xl text-xs transition duration-150"
          >
            Gérer les réapprovisionnements
          </button>
        </div>
      </div>

      {/* Recents pipeline tracking list */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h4 className="font-sans font-bold text-gray-900 mb-4 text-sm">Vue D'ensemble Opérationnelle</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400">En attente</span>
            <div className="text-lg font-bold text-gray-800 font-mono mt-1">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </div>
          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-500">Confirmé</span>
            <div className="text-lg font-bold text-blue-700 font-mono mt-1">
              {orders.filter(o => o.status === 'confirmed').length}
            </div>
          </div>
          <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-500">Expédié</span>
            <div className="text-lg font-bold text-indigo-700 font-mono mt-1">
              {orders.filter(o => o.status === 'dispatched').length}
            </div>
          </div>
          <div className="bg-green-50 p-3.5 rounded-xl border border-green-100 text-center">
            <span className="text-[10px] uppercase font-bold text-green-600">Livré</span>
            <div className="text-lg font-bold text-green-700 font-mono mt-1">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-100 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-500">Retourné</span>
            <div className="text-lg font-bold text-amber-700 font-mono mt-1">
              {orders.filter(o => o.status === 'returned').length}
            </div>
          </div>
          <div className="bg-red-50 p-3.5 rounded-xl border border-red-100 text-center">
            <span className="text-[10px] uppercase font-bold text-red-500">Annulé</span>
            <div className="text-lg font-bold text-red-700 font-mono mt-1">
              {orders.filter(o => o.status === 'cancelled').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
