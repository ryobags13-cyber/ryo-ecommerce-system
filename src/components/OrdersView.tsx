import React, { useState, useEffect } from 'react';
import { Order, Product, OrderItem } from '../types';
import { mockDb, ALGERIAN_WILAYAS, cleanPhone, getWilayaByCode } from '../supabase';
import { 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Save, 
  PhoneCall, 
  MapPin, 
  Truck, 
  HelpCircle,
  FileSpreadsheet,
  FileCheck
} from 'lucide-react';

export default function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Create Order Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('16'); // default Algiers
  const [commune, setCommune] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [hasStopDesk, setHasStopDesk] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [orderItemsState, setOrderItemsState] = useState<{ product_id: string; quantity: number }[]>([
    { product_id: '', quantity: 1 }
  ]);

  // Selected Order Detail Modal/Drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  // Update shipping fee when wilaya or stop-desk changes
  const activeWilaya = getWilayaByCode(selectedWilayaCode);
  const calculatedShippingFee = hasStopDesk ? activeWilaya.shippingFeeStopDesk : activeWilaya.shippingFeeHome;

  const refreshData = async () => {
    try {
      const [ordersData, productsData, orderItemsData] = await Promise.all([
        mockDb.getOrders(),
        mockDb.getProducts(),
        mockDb.getOrderItems()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
      setOrderItems(orderItemsData);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !customerPhone || orderItemsState.some(i => !i.product_id)) {
      alert('Veuillez remplir le nom, le numéro de téléphone et choisir au moins un produit.');
      return;
    }

    const orderPayload: Partial<Order> = {
      customer_name: customerName,
      customer_phone: customerPhone,
      wilaya_code: selectedWilayaCode,
      commune,
      shipping_address: shippingAddress,
      shipping_fee: calculatedShippingFee,
      discount_amount: discountAmount,
      has_stop_desk: hasStopDesk,
      notes,
      status: 'pending'
    };

    try {
      await mockDb.createOrder(orderPayload, orderItemsState);
      
      // Reset Form
      setCustomerName('');
      setCustomerPhone('');
      setSelectedWilayaCode('16');
      setCommune('');
      setShippingAddress('');
      setHasStopDesk(false);
      setDiscountAmount(0);
      setNotes('');
      setOrderItemsState([{ product_id: '', quantity: 1 }]);
      setShowAddForm(false);
      
      // Refresh List
      await refreshData();
    } catch (err) {
      console.error("Error creating order:", err);
      alert('Erreur lors de la création de la commande.');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: any) => {
    try {
      await mockDb.updateOrderStatus(orderId, status);
      await refreshData();
      // Update active modal order if open to show modified metrics
      if (selectedOrder && selectedOrder.id === orderId) {
        const refreshedOrders = await mockDb.getOrders();
        const refreshed = refreshedOrders.find(o => o.id === orderId);
        if (refreshed) setSelectedOrder(refreshed);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande définitivement ?')) return;
    try {
      await mockDb.deleteOrder(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      await refreshData();
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Erreur lors de la suppression de la commande.");
    }
  };

  const addItemRow = () => {
    setOrderItemsState([...orderItemsState, { product_id: '', quantity: 1 }]);
  };

  const updateItemRow = (index: number, product_id: string, quantity: number) => {
    const next = [...orderItemsState];
    next[index] = { product_id, quantity };
    setOrderItemsState(next);
  };

  const removeItemRow = (index: number) => {
    if (orderItemsState.length === 1) return;
    setOrderItemsState(orderItemsState.filter((_, i) => i !== index));
  };

  // Google Sheets simulated manual trigger
  const handleSimulateGoogleSheetsImport = async () => {
    const rands = Math.floor(Math.random() * 900) + 100;
    const fakeRowId = `sheettask_ext_${rands}`;
    
    // Pick an Algerian name and random product
    const mockNames = ['Zinedine Zidane', 'Ryad Mahrez', 'Djamel Belmadi', 'Sofia Boutella'];
    const name = mockNames[Math.floor(Math.random() * mockNames.length)];
    const phone = '0552' + String(Math.floor(Math.random() * 900000) + 100000);
    const wilayas = ['16', '31', '25', '19', '15'];
    const wilCode = wilayas[Math.floor(Math.random() * wilayas.length)];
    
    const randomProduct = products[0] || { id: 'p1' };

    const sheetOrder: Partial<Order> = {
      customer_name: name,
      customer_phone: phone,
      wilaya_code: wilCode,
      commune: 'Importé de Google Sheets',
      shipping_address: 'Validation requise',
      shipping_fee: 500,
      discount_amount: 0,
      has_stop_desk: false,
      notes: `Import de ligne automatique ID: ${fakeRowId}`,
      external_id: fakeRowId,
      status: 'pending'
    };

    try {
      await mockDb.createOrder(sheetOrder, [{ product_id: randomProduct.id, quantity: 1 }]);
      await refreshData();
      alert(`Google Sheets Import Simulé ! Commande de ${name} ajoutée avec l'identifiant de ligne unique ${fakeRowId}.`);
    } catch (err) {
      console.error("Error creating sheet order:", err);
    }
  };

  const filteredOrders = orders.filter(o => {
    const term = search.toLowerCase();
    const phoneClean = cleanPhone(o.customer_phone);
    const matchesSearch = 
      o.customer_name.toLowerCase().includes(term) ||
      o.order_number.toLowerCase().includes(term) ||
      phoneClean.includes(term) ||
      o.commune.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Control actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-900">Commandes Cash On Delivery</h2>
          <p className="text-xs text-gray-500">Gérez le statut des appels, la confirmation de livraison et les fiches Wilayas.</p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={handleSimulateGoogleSheetsImport}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Importer de Google Sheets
          </button>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Créer Commande Test
          </button>
        </div>
      </div>

      {/* Conditional Order Creation Drawer/Card */}
      {showAddForm && (
        <form onSubmit={handleCreateOrder} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md space-y-4">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Formulaire de Commande COD</h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-mono font-medium">Algérie Format</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nom */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom Complet Client *</label>
              <input 
                type="text" 
                required
                placeholder="Ex. Ryad Mahrez"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {/* Telephone (Auto formats to Algerian format) */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 mb-1">Téléphone *</label>
              <input 
                type="text" 
                required
                placeholder="Ex: 0550 12 34 56"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-gray-400">Sera automatiquement normalisé sous format national.</span>
            </div>

            {/* Wilaya Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Wilaya de Destination *</label>
              <select 
                value={selectedWilayaCode}
                onChange={e => setSelectedWilayaCode(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-white focus:border-indigo-400 focus:outline-none"
              >
                {ALGERIAN_WILAYAS.map(w => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
            </div>

            {/* Commune */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Commune de Livraison</label>
              <input 
                type="text" 
                placeholder="Ex. El Biar, Hydra, Bir El Djir"
                value={commune}
                onChange={e => setCommune(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            {/* Adresse exacte */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse de livraison détaillée *</label>
              <input 
                type="text" 
                required
                placeholder="Quartier, Bâtiment, Numéro d'appartement"
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Delivery choices */}
          <div className="bg-gray-50 p-4 rounded-xl flex flex-wrap gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input 
                type="checkbox" 
                checked={hasStopDesk} 
                onChange={e => setHasStopDesk(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              Livraison en Bureau (Stop Desk - Tarif Réduit)
            </label>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-gray-400 font-sans">Frais de livraison:</span>
              <strong className="text-indigo-600 font-bold">{calculatedShippingFee} DA</strong>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-sans">Réduction (DA):</span>
              <input 
                type="number" 
                min="0"
                value={discountAmount}
                onChange={e => setDiscountAmount(Number(e.target.value))}
                className="w-20 font-mono rounded-lg border border-gray-200 p-1 text-center"
              />
            </div>
          </div>

          {/* Order items list dynamically populated */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Produit(s) commandés</span>
              <button 
                type="button" 
                onClick={addItemRow}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
              >
                + Ajouter Produit
              </button>
            </div>

            {orderItemsState.map((row, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select 
                  required
                  value={row.product_id}
                  onChange={e => updateItemRow(index, e.target.value, row.quantity)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="">-- Sélectionner un produit --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                      {p.name} - ({p.price} DA) [En stock: {p.stock_quantity}]
                    </option>
                  ))}
                </select>

                <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shrink-0">
                  <button 
                    type="button" 
                    disabled={row.quantity <= 1}
                    onClick={() => updateItemRow(index, row.product_id, row.quantity - 1)}
                    className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 disabled:opacity-20 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 font-mono text-xs text-gray-800 font-bold">{row.quantity}</span>
                  <button 
                    type="button" 
                    onClick={() => updateItemRow(index, row.product_id, row.quantity + 1)}
                    className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 text-xs font-bold"
                  >
                    +
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={() => removeItemRow(index)}
                  className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes Internes / Instructions de l'opérateur</label>
            <textarea 
              rows={2}
              placeholder="Ex: Le client souhaite être livré après 17h."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs hover:bg-gray-100 font-semibold"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow"
            >
              Enregistrer la Commande
            </button>
          </div>
        </form>
      )}

      {/* Orders Filter Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Rechercher nom, code, téléphone, ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400"
          />
        </div>

        {/* Status Filters Tab */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { label: 'Tous', value: 'all' },
            { label: 'En attente', value: 'pending' },
            { label: 'Confirmé', value: 'confirmed' },
            { label: 'Expédié', value: 'dispatched' },
            { label: 'Livré', value: 'delivered' },
            { label: 'Retourné', value: 'returned' },
            { label: 'Annulé', value: 'cancelled' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition font-medium ${
                statusFilter === tab.value 
                  ? 'bg-gray-900 text-white font-semibold' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">N° Commande</th>
                <th className="p-4">Détails Client</th>
                <th className="p-4">Wilaya (Frais)</th>
                <th className="p-4">Frais & Total</th>
                <th className="p-4">Stock Déduit</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const items = orderItems.filter(itm => itm.order_id === order.id);
                  const activeWil = getWilayaByCode(order.wilaya_code);
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/70 transition">
                      {/* Code */}
                      <td className="p-4 font-mono">
                        <span className="text-gray-900 font-bold block">{order.order_number}</span>
                        <span className="text-[10px] text-gray-400 font-normal">{new Date(order.created_at || '').toLocaleDateString('fr-FR')}</span>
                      </td>

                      {/* Client */}
                      <td className="p-4">
                        <div className="text-gray-900 font-bold">{order.customer_name}</div>
                        <div className="text-gray-400 text-[10px] font-mono flex items-center gap-1 mt-0.5">
                          <PhoneCall className="w-3 h-3 text-gray-400" />
                          {order.customer_phone}
                        </div>
                      </td>

                      {/* Region */}
                      <td className="p-4">
                        <span className="text-gray-900 font-bold block">{activeWil.name}</span>
                        <span className="text-[10px] text-gray-400">
                          {order.has_stop_desk ? 'Bureau de livraison' : 'Livraison à domicile'}
                        </span>
                      </td>

                      {/* Money calculations */}
                      <td className="p-4">
                        <div className="font-mono text-gray-900 font-bold">{order.total_price.toLocaleString()} DA</div>
                        <div className="text-[10px] text-emerald-600 font-mono">
                          Marge: {order.estimated_profit?.toLocaleString()} DA
                        </div>
                      </td>

                      {/* Stock Checkmark */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                          order.stock_deducted 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {order.stock_deducted ? 'Déduit' : 'Intact'}
                        </span>
                      </td>

                      {/* Status select dropdown */}
                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={e => handleUpdateStatus(order.id, e.target.value as any)}
                          className={`text-[11px] font-bold rounded-lg border px-2 py-1 bg-white focus:outline-none ${
                            order.status === 'pending' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                            order.status === 'confirmed' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            order.status === 'dispatched' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' :
                            order.status === 'delivered' ? 'border-green-200 text-green-700 bg-green-50' :
                            order.status === 'returned' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                            'border-red-200 text-red-700 bg-red-50' // cancelled
                          }`}
                        >
                          <option value="pending">En attente</option>
                          <option value="confirmed">Confirmé</option>
                          <option value="dispatched">Expédié</option>
                          <option value="delivered">Livré</option>
                          <option value="returned">Retourné</option>
                          <option value="cancelled">Annulé</option>
                        </select>
                      </td>

                      {/* View Button */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Consulter
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Aucune commande trouvée correspondante aux critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Persistent Inspection Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-sans font-bold text-gray-900">Commande {selectedOrder.order_number}</h3>
                <span className="text-[10px] text-gray-400 font-mono">Date d'enregistrement: {new Date(selectedOrder.created_at || '').toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg p-1.5"
              >
                ✕
              </button>
            </div>

            {/* Client detail widget */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block pb-0.5">Destinataire</span>
                  <strong className="text-gray-900">{selectedOrder.customer_name}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block pb-0.5">Téléphone National</span>
                  <strong className="text-gray-900 font-mono">{selectedOrder.customer_phone}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block pb-0.5">Wilaya</span>
                  <strong className="text-gray-900">{getWilayaByCode(selectedOrder.wilaya_code).name}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block pb-0.5">Commune / Adresse</span>
                  <strong className="text-gray-900">{selectedOrder.commune} – {selectedOrder.shipping_address}</strong>
                </div>
              </div>

              {/* Items Summary Table */}
              <div className="border border-gray-100 rounded-xl overflow-hidden mt-2 text-xs">
                <div className="bg-gray-50 p-2.5 font-bold text-gray-600 flex justify-between">
                  <span>Produit</span>
                  <span>Total</span>
                </div>
                <div className="divide-y divide-gray-50 bg-white">
                  {orderItems.filter(itm => itm.order_id === selectedOrder.id).map(itm => (
                    <div key={itm.id} className="p-2.5 flex justify-between">
                      <div>
                        <span className="font-bold text-gray-800">{itm.product_name || 'Produit'}</span>
                        <span className="text-gray-400 text-[10px] block font-mono">Qté: {itm.quantity} x {itm.price} DA</span>
                      </div>
                      <span className="font-mono font-bold text-gray-900">{(itm.price * itm.quantity).toLocaleString()} DA</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced info panel */}
              <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-2 font-medium">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-mono text-gray-950">{(selectedOrder.total_price - selectedOrder.shipping_fee + selectedOrder.discount_amount).toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Frais de livraison ({selectedOrder.has_stop_desk ? 'Bureau' : 'Domicile'})</span>
                  <span className="font-mono text-gray-950">+{selectedOrder.shipping_fee} DA</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Réduction</span>
                    <span className="font-mono">-{selectedOrder.discount_amount} DA</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200/50 pt-2 text-sm font-bold text-gray-900">
                  <span>Total à percevoir</span>
                  <span className="font-mono">{selectedOrder.total_price.toLocaleString()} DA</span>
                </div>
                <div className="flex justify-between text-emerald-600 pt-0.5 border-t border-dashed border-gray-200 mt-2">
                  <span>Estimation Marge Nette</span>
                  <span className="font-mono font-bold">{selectedOrder.estimated_profit?.toLocaleString()} DA</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-100">
                  <strong>Notes:</strong> {selectedOrder.notes}
                </div>
              )}

              {/* Status controller inline */}
              <div className="pt-2 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-gray-600">Changer l'état pour tester les stocks :</span>
                <div className="grid grid-cols-3 gap-1">
                  {['pending', 'confirmed', 'dispatched', 'delivered', 'returned', 'cancelled'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, st as any)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition ${
                        selectedOrder.status === st 
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {st === 'pending' ? 'En attente' :
                       st === 'confirmed' ? 'Confirmé' :
                       st === 'dispatched' ? 'Expédié' :
                       st === 'delivered' ? 'Livré' :
                       st === 'returned' ? 'Retourné' : 'Annulé'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="w-1/3 bg-red-600 hover:bg-red-700 font-semibold py-2.5 rounded-xl text-white text-xs transition flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Supprimer
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-2/3 bg-gray-900 hover:bg-gray-800 rounded-xl text-white font-semibold py-2.5 text-xs transition"
              >
                Fermer l'Aperçu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
