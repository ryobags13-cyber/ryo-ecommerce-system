import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, InventoryMovement } from '../types';
import { mockDb } from '../supabase';
import { 
  Boxes, 
  AlertTriangle, 
  ArrowUpDown, 
  Plus, 
  Minus, 
  History, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  ShieldCheck,
  Search,
  RefreshCw,
  Package
} from 'lucide-react';

export default function StockView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');

  // Quick Adjustment Form State
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [adjustQuantity, setAdjustQuantity] = useState(1);
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out' | 'adjustment'>('adjustment');
  const [adjustReason, setAdjustReason] = useState('Ajustement inventaire périodique');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const prodsData = await mockDb.getProducts();
      const varsData = await mockDb.getProductVariants();
      const movsData = await mockDb.getInventoryMovements();
      
      setProducts(prodsData);
      setVariants(varsData);
      setMovements(movsData);
    } catch (err) {
      console.error("Error loading stock view data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId) {
      alert('Veuillez sélectionner une variante ou un article à ajuster.');
      return;
    }
    if (adjustQuantity <= 0) {
      alert('La quantité d\'ajustement doit être supérieure à zéro.');
      return;
    }

    const targetVar = variants.find(v => v.id === selectedVariantId);
    if (!targetVar) return;

    const quantityMultiplier = adjustType === 'stock_out' ? -1 : 1;
    const qtyChange = adjustQuantity * quantityMultiplier;

    try {
      // 1. Update Variant Stock in database
      const updatedVariantQty = Math.max(0, targetVar.stock_quantity + qtyChange);
      await mockDb.saveProductVariant({
        id: targetVar.id,
        stock_quantity: updatedVariantQty
      });

      // 2. Also update parent product total stock sum
      const parentProd = products.find(p => p.id === targetVar.product_id);
      if (parentProd) {
        // compute sum of all variants for this product
        const siblingVars = variants.filter(v => v.product_id === parentProd.id);
        const newTotalProductStock = siblingVars.reduce((sum, v) => {
          if (v.id === targetVar.id) return sum + updatedVariantQty;
          return sum + v.stock_quantity;
        }, 0);

        await mockDb.saveProduct({
          id: parentProd.id,
          stock_quantity: newTotalProductStock
        });
      }

      // 3. Register historical audit log movement
      await mockDb.saveInventoryMovement({
        product_id: targetVar.product_id,
        variant_id: targetVar.id,
        quantity: adjustQuantity,
        type: adjustType === 'stock_in' ? 'stock_in' : adjustType === 'stock_out' ? 'stock_out' : 'adjustment',
        reason: adjustReason || 'Ajustement manuel de stock'
      });

      // Reset form & reload
      setAdjustQuantity(1);
      setAdjustReason('Ajustement inventaire périodique');
      await loadData();
      alert('Ajustement de stock appliqué avec succès !');
    } catch (err) {
      console.error("Error applying manual stock adjustment:", err);
      alert('Une erreur s\'est produite lors de la mise à jour des stocks.');
    }
  };

  // Metrics Calculations
  const totalStockPieces = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
  
  // Total Valuation = stock_quantity of variants * purchase_price of respective product
  const totalValuationDA = variants.reduce((sum, v) => {
    const p = products.find(prod => prod.id === v.product_id);
    const purchaseCost = p ? p.purchase_price : 0;
    return sum + (v.stock_quantity * purchaseCost);
  }, 0);

  // Selling power valuation
  const totalRetailValuationDA = variants.reduce((sum, v) => {
    const p = products.find(prod => prod.id === v.product_id);
    const retailPrice = p ? p.price : 0;
    return sum + (v.stock_quantity * retailPrice);
  }, 0);

  const potentialGrossProfit = totalRetailValuationDA - totalValuationDA;

  // Alerts filtering
  const lowStockVariants = variants.filter(v => {
    const p = products.find(prod => prod.id === v.product_id);
    const alertThreshold = p ? p.min_stock_alert : 5;
    return v.stock_quantity <= alertThreshold;
  });

  // Filtered lists
  const filteredVariants = variants.filter(v => {
    const p = products.find(prod => prod.id === v.product_id);
    const pName = p ? p.name.toLowerCase() : '';
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pName.includes(searchTerm.toLowerCase());

    const matchesProduct = selectedProductFilter ? v.product_id === selectedProductFilter : true;
    return matchesSearch && matchesProduct;
  });

  return (
    <div className="space-y-6">
      {/* Overview stats group */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-2xs font-extrabold uppercase tracking-wider text-gray-400">Total Pièces en Stock</span>
              <h3 className="text-2xl font-mono font-black text-gray-900 mt-1">{totalStockPieces} <span className="text-xs font-sans font-medium text-gray-500">unités</span></h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-2xs text-gray-500 font-medium">
            <span className="text-green-600 font-bold">●</span> Seuil de sécurité global assuré
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-2xs font-extrabold uppercase tracking-wider text-gray-400">Valeur d'Acquisition (Achat)</span>
              <h3 className="text-2xl font-mono font-black text-slate-800 mt-1">{totalValuationDA.toLocaleString()} <span className="text-xs font-sans font-medium text-gray-500">DA</span></h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-2xs text-slate-500 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Capital immobilisé en stock optimal
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-2xs font-extrabold uppercase tracking-wider text-gray-400">Total Ventes Potentielles</span>
              <h3 className="text-2xl font-mono font-black text-indigo-700 mt-1">{totalRetailValuationDA.toLocaleString()} <span className="text-xs font-sans font-medium text-gray-500">DA</span></h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-2xs text-gray-500 font-medium">
            Marge brute potentielle de {potentialGrossProfit.toLocaleString()} DA
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm ring-2 ring-amber-50/50">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-2xs font-extrabold uppercase tracking-wider text-amber-600">Sous Seuil de Sécurité</span>
              <h3 className="text-2xl font-mono font-black text-amber-700 mt-1">{lowStockVariants.length} <span className="text-xs font-sans font-medium text-gray-500">alertes</span></h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-2xs text-amber-600 font-medium">
            {lowStockVariants.length > 0 ? "Réapprovisionnement COD recommandé" : "Aucune rupture imminente"}
          </div>
        </div>
      </div>

      {/* Two Columns: Adjust/Action panel & Actual Stock Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Stock Adjust & Critical Alerts list */}
        <div className="space-y-6 lg:col-span-1">
          <form onSubmit={handleApplyAdjustment} className="bg-white p-5 rounded-2xl border border-indigo-50 shadow-sm space-y-4">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-bold text-gray-900 text-sm">Ajustement Manuel de Stock</h3>
              <p className="text-[10px] text-gray-500 font-medium">Injectez immédiatement du stock de démarrage ou corrigez les écarts.</p>
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-600 mb-1">Sélectionner Article / Variante *</label>
              <select 
                required 
                value={selectedVariantId}
                onChange={e => setSelectedVariantId(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
              >
                <option value="">-- Choisir un produit (Variante) --</option>
                {variants.map(v => {
                  const p = products.find(prod => prod.id === v.product_id);
                  const isPair = p?.category === 'Arm Sleeves';
                  const unitLabel = isPair ? 'paires' : 'pcs';
                  return (
                    <option key={v.id} value={v.id}>
                      [{v.sku}] {v.name} ({v.stock_quantity} {unitLabel})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-bold text-gray-600 mb-1">Mouvement</label>
                <select 
                  value={adjustType}
                  onChange={e => setAdjustType(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
                >
                  <option value="stock_in">Entrée (+)</option>
                  <option value="stock_out">Sortie (-)</option>
                  <option value="adjustment">Ajustement Ecart</option>
                </select>
              </div>

              <div>
                <label className="block text-2xs font-bold text-gray-600 mb-1">Quantité</label>
                <input 
                  type="number" 
                  min="1" 
                  required
                  value={adjustQuantity}
                  onChange={e => setAdjustQuantity(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:ring-1 focus:ring-indigo-400 focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-bold text-gray-600 mb-1">Motif / Justification audit</label>
              <input 
                type="text" 
                required
                placeholder="Ex. Réception conteneur, Perte douane, etc."
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Appliquer l'ajustement
            </button>
          </form>

          {/* Under threshold notifications box */}
          <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1 border-b border-amber-50 pb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Stock Critique (Seuils d'Alerte)
            </h4>
            
            {lowStockVariants.length === 0 ? (
              <p className="text-[11px] text-gray-500 font-medium">Tout est en ordre. Aucun article sous le seuil critique.</p>
            ) : (
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                {lowStockVariants.map(v => {
                  const p = products.find(prod => prod.id === v.product_id);
                  const isPair = p?.category === 'Arm Sleeves';
                  const unitLabel = isPair ? 'paires' : 'pcs';
                  return (
                    <div key={v.id} className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100/30 flex items-center justify-between text-2xs">
                      <div>
                        <strong className="block text-amber-900 font-sans">{v.name}</strong>
                        <span className="text-gray-500 font-mono">SKU: {v.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="block font-mono font-black text-amber-700 text-xs">{v.stock_quantity} {unitLabel}</span>
                        <span className="text-[9px] text-gray-400 font-semibold font-sans">Seuil: {p?.min_stock_alert}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Actual Stock Tracker list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher variante, SKU, produit parent..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={selectedProductFilter}
                onChange={e => setSelectedProductFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-gray-200 focus:outline-none bg-white w-full md:w-48"
              >
                <option value="">Tous les Produits Parents</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-sans uppercase text-[10px]">SKU / Variante</th>
                    <th className="p-4 font-sans uppercase text-[10px]">Produit Parent</th>
                    <th className="p-4 font-sans uppercase text-[10px] text-center">Attribs Globaux</th>
                    <th className="p-4 font-sans uppercase text-[10px] text-right">Stock Actuel</th>
                    <th className="p-4 font-sans uppercase text-[10px] text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredVariants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">
                        Aucune variante ou stock trouvé avec ces filtres.
                      </td>
                    </tr>
                  ) : (
                    filteredVariants.map(v => {
                      const p = products.find(prod => prod.id === v.product_id);
                      const threshold = p ? p.min_stock_alert : 5;
                      const isLacking = v.stock_quantity <= threshold;
                      const isPair = p?.category === 'Arm Sleeves';
                      const unitLabel = isPair ? 'paires' : 'pcs';

                      return (
                        <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            <strong className="block text-gray-900 font-sans text-sm">{v.name}</strong>
                            <span className="text-2xs font-mono text-gray-500 font-bold uppercase">{v.sku}</span>
                          </td>
                          <td className="p-4 text-gray-600 font-medium">
                            {p ? p.name : 'Inconnu'}
                            <small className="block text-[10px] text-indigo-600 uppercase font-semibold">{p?.category}</small>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded mr-1">
                              {v.color || 'Unique'}
                            </span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">
                              {v.size || 'Unique'}
                            </span>
                          </td>
                          <td className="p-4 text-right font-mono font-black text-gray-900">
                            <div className={`${isLacking ? 'text-amber-600' : 'text-gray-900'}`}>
                              {v.stock_quantity} {unitLabel}
                            </div>
                            <span className="text-[9px] text-gray-400 font-sans font-normal block">Alerte: {threshold} {unitLabel}</span>
                          </td>
                          <td className="p-4 text-right">
                            {isLacking ? (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">
                                Critique
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                                Conforme
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs section - Stock Movement History Ledger */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="border-b border-gray-100 pb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <History className="w-4 h-4 text-gray-600" /> Grand Livre des Mouvements de Stock
            </h3>
            <p className="text-xs text-gray-500">Traçabilité complète des entrées, sorties, et réajustements codifiés du stock.</p>
          </div>
          <button 
            onClick={loadData}
            className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Actualiser historique
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="p-3 font-sans uppercase text-[10px]">Date & Heure</th>
                <th className="p-3 font-sans uppercase text-[10px]">Article / Variante</th>
                <th className="p-3 font-sans uppercase text-[10px]">Type d'opération</th>
                <th className="p-3 font-sans uppercase text-[10px] text-right">Qté impactée</th>
                <th className="p-3 font-sans uppercase text-[10px]">Justification / Motif</th>
                <th className="p-3 font-sans uppercase text-[10px]">Opérateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">
                    Aucun historique de mouvement disponible ou saisi pour l'instant.
                  </td>
                </tr>
              ) : (
                movements.map(m => {
                  const dateObj = m.created_at ? new Date(m.created_at) : new Date();
                  const formattedDate = dateObj.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="p-3 text-gray-500 font-mono text-2xs">
                        {formattedDate}
                      </td>
                      <td className="p-3 font-medium text-gray-900">
                        {m.variant_name || 'Inconnu (Variante)'}
                        <small className="block text-[9px] text-gray-500 font-mono uppercase">{m.product_name}</small>
                      </td>
                      <td className="p-3">
                        {m.type === 'stock_in' && (
                          <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Entrée (+)
                          </span>
                        )}
                        {m.type === 'stock_out' && (
                          <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Sortie (-)
                          </span>
                        )}
                        {m.type === 'adjustment' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Ajustement (±)
                          </span>
                        )}
                        {m.type === 'return' && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Retour client
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        {m.type === 'stock_out' ? '-' : '+'}{m.quantity}
                      </td>
                      <td className="p-3 text-gray-600">
                        {m.reason || 'Aucune justification'}
                      </td>
                      <td className="p-3 text-gray-500">
                        {m.operator_name || 'Système'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
