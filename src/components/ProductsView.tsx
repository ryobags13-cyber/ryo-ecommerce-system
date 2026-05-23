import React, { useState, useEffect } from 'react';
import { Product, Brand, Category, ProductVariant } from '../types';
import { mockDb } from '../supabase';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  Boxes, 
  CheckCircle2, 
  Info,
  Tag,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Layers,
  ShoppingBag,
  Eye,
  Settings,
  ShieldAlert,
  Save,
  Grid
} from 'lucide-react';

export default function ProductsView() {
  // Navigation Tabs at Product Level
  const [productSubTab, setProductSubTab] = useState<'items' | 'brands' | 'categories'>('items');

  // Core Entity Lists
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);

  // Expanded Product IDs to show their variants drawer
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>({});

  // Query / Search Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Form Modals / Expanders State
  const [showProductForm, setShowProductForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // --- Product Form State ---
  const [prodSku, setProdSku] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodBrandId, setProdBrandId] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodPurchasePrice, setProdPurchasePrice] = useState(0);
  const [prodPrice, setProdPrice] = useState(0);
  const [prodDescription, setProdDescription] = useState('');
  const [prodWeight, setProdWeight] = useState(0.2);
  const [prodMinAlert, setProdMinAlert] = useState(5);

  // --- Variant Form State (Linked inline to expanded products) ---
  const [addingVariantProductId, setAddingVariantProductId] = useState<string | null>(null);
  const [varSku, setVarSku] = useState('');
  const [varColor, setVarColor] = useState('');
  const [varSize, setVarSize] = useState('Unique');
  const [varStock, setVarStock] = useState(1);
  const [varPriceOverride, setVarPriceOverride] = useState('');

  // --- Brand Form State ---
  const [brandName, setBrandName] = useState('');
  const [brandDesc, setBrandDesc] = useState('');

  // --- Category Form State ---
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const coreProds = await mockDb.getProducts();
      const coreBrands = await mockDb.getBrands();
      const coreCats = await mockDb.getCategories();
      const coreVars = await mockDb.getProductVariants();

      setProducts(coreProds);
      setBrands(coreBrands);
      setCategories(coreCats);
      setVariants(coreVars);
    } catch (e) {
      console.error("Error loading products tab data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Toggle expanded state for a product variants drawer
  const toggleProductExpand = (prodId: string) => {
    setExpandedProductIds(prev => ({
      ...prev,
      [prodId]: !prev[prodId]
    }));
  };

  // Switch form to edit product
  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setProdSku(p.sku);
    setProdName(p.name);
    setProdBrandId(p.brand_id || '');
    setProdCategory(p.category || '');
    setProdPurchasePrice(p.purchase_price);
    setProdPrice(p.price);
    setProdDescription(p.description || '');
    setProdWeight(p.weight_kg || 0.2);
    setProdMinAlert(p.min_stock_alert);
    setShowProductForm(true);
  };

  const handleOpenNewProduct = () => {
    setEditingProduct(null);
    setProdSku('');
    setProdName('');
    setProdBrandId(brands[0]?.id || '');
    setProdCategory(categories[0]?.name || 'Women Handbags');
    setProdPurchasePrice(0);
    setProdPrice(0);
    setProdDescription('');
    setProdWeight(0.2);
    setProdMinAlert(5);
    setShowProductForm(true);
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet article ? Cela supprimera toutes ses variantes associées.")) return;
    try {
      await mockDb.deleteProduct(id);
      await loadAllData();
      alert("Article supprimé de l'inventaire.");
    } catch (e) {
      console.error("Error deleting product:", e);
    }
  };

  // Submit product creation / edition
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodSku || !prodName || prodPrice <= 0) {
      alert("Veuillez remplir les informations obligatoires (SKU, Nom, Prix de Vente).");
      return;
    }

    try {
      const payload: Partial<Product> = {
        ...(editingProduct ? { id: editingProduct.id } : {}),
        sku: prodSku.toUpperCase().trim(),
        name: prodName.trim(),
        brand_id: prodBrandId || undefined,
        category: prodCategory,
        purchase_price: prodPurchasePrice,
        price: prodPrice,
        description: prodDescription.trim(),
        weight_kg: prodWeight,
        min_stock_alert: prodMinAlert,
        stock_quantity: editingProduct ? editingProduct.stock_quantity : 0,
        is_active: editingProduct ? editingProduct.is_active : true
      };

      await mockDb.saveProduct(payload);
      setShowProductForm(false);
      await loadAllData();
      alert(editingProduct ? "Produit mis à jour avec succès !" : "Produit ajouté au catalogue !");
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Erreur lors de la sauvegarde.");
    }
  };

  // Submit Brand
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName) return;
    try {
      await mockDb.saveBrand({
        name: brandName.trim(),
        description: brandDesc.trim()
      });
      setBrandName('');
      setBrandDesc('');
      setShowBrandForm(false);
      await loadAllData();
      alert("Marque enregistrée.");
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Brand
  const handleDeleteBrand = async (bId: string) => {
    if (!confirm("Supprimer cette marque définitivement ?")) return;
    try {
      await mockDb.deleteBrand(bId);
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Category
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    try {
      await mockDb.saveCategory({
        name: catName.trim(),
        description: catDesc.trim()
      });
      setCatName('');
      setCatDesc('');
      setShowCategoryForm(false);
      await loadAllData();
      alert("Catégorie créée.");
    } catch (err) {
      console.error(err);
    }
  };

  // Inline Variant creation
  const handleVariantSubmit = async (e: React.FormEvent, parentProdId: string) => {
    e.preventDefault();
    if (!varSku || !varColor) {
      alert("Veuillez indiquer un SKU de variante et une couleur.");
      return;
    }

    try {
      // 1. Save Variant
      const newVar = await mockDb.saveProductVariant({
        product_id: parentProdId,
        sku: varSku.toUpperCase().trim(),
        name: `${products.find(p => p.id === parentProdId)?.name} - ${varColor} ${varSize !== 'Unique' ? `(${varSize})` : ''}`.trim(),
        color: varColor.trim(),
        size: varSize,
        stock_quantity: varStock,
        price_override: varPriceOverride ? Number(varPriceOverride) : undefined
      });

      // 2. Clear Variant Form
      setVarSku('');
      setVarColor('');
      setVarSize('Unique');
      setVarStock(1);
      setVarPriceOverride('');
      setAddingVariantProductId(null);

      // 3. Update total product stock level
      const parentProd = products.find(p => p.id === parentProdId);
      if (parentProd) {
        // compute sum of sibling variants plus the newly added one
        const parentVars = variants.filter(v => v.product_id === parentProdId);
        const nextSum = parentVars.reduce((sum, v) => sum + v.stock_quantity, 0) + varStock;
        
        await mockDb.saveProduct({
          id: parentProd.id,
          stock_quantity: nextSum
        });
      }

      // 4. Create initial audited inventory movement
      await mockDb.saveInventoryMovement({
        product_id: parentProdId,
        variant_id: newVar.id,
        quantity: varStock,
        type: 'stock_in',
        reason: `Initialisation de la variante (${varColor})`
      });

      await loadAllData();
      alert("Variante créée avec succès et associée au stock !");
    } catch (err) {
      console.error(err);
      alert("Erreur de sauvegarde de variante.");
    }
  };

  // Delete product variant
  const handleDeleteVariant = async (varId: string, parentProductId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette variante de stock ?")) return;
    try {
      await mockDb.deleteProductVariant(varId);
      
      // Update parent product quantity sum
      const parentProd = products.find(p => p.id === parentProductId);
      if (parentProd) {
        const remainingVars = variants.filter(v => v.product_id === parentProductId && v.id !== varId);
        const nextSum = remainingVars.reduce((sum, v) => sum + v.stock_quantity, 0);
        await mockDb.saveProduct({
          id: parentProductId,
          stock_quantity: nextSum
        });
      }

      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrandFilter ? p.brand_id === selectedBrandFilter : true;
    const matchesCategory = selectedCategoryFilter ? p.category === selectedCategoryFilter : true;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation menus for products system editing */}
      <div className="flex border-b border-gray-100 gap-6">
        <button
          onClick={() => setProductSubTab('items')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
            productSubTab === 'items' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Articles & Variantes
        </button>
        <button
          onClick={() => setProductSubTab('brands')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
            productSubTab === 'brands' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tag className="w-4 h-4" /> Marques Référencées
        </button>
        <button
          onClick={() => setProductSubTab('categories')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
            productSubTab === 'categories' 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> Catégories de Vente
        </button>
      </div>

      {loading && (
        <p className="text-center py-6 text-xs text-gray-500 font-mono">Chargement des données en cours, veuillez patienter...</p>
      )}

      {/* =========================================
          TAB 1: ARTICLES & GRANULAR VARIANTS
          ========================================= */}
      {productSubTab === 'items' && !loading && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold font-sans text-gray-900 uppercase tracking-widest text-indigo-700">Catalogue des Articles</h2>
              <p className="text-xs text-gray-500">Ajoutez vos fiches produits mères, puis configurez leurs coloris et tailles.</p>
            </div>
            <button
              onClick={handleOpenNewProduct}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition self-start"
            >
              <Plus className="w-4 h-4" /> Ajouter un Article
            </button>
          </div>

          {/* Product Creation / Edition Form */}
          {showProductForm && (
            <form onSubmit={handleProductSubmit} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-md space-y-4">
              <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-indigo-600" />
                {editingProduct ? `Modifier la fiche produit : ${editingProduct.sku}` : 'Créer une nouvelle fiche produit maman'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">SKU Unique (Product ID) *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex. CRY-BAG-SR"
                    value={prodSku}
                    onChange={e => setProdSku(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none uppercase font-mono font-bold"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Nom Public Commercial *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex. Crystal Bag SR"
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1 font-sans">Marque Assignée *</label>
                  <select
                    value={prodBrandId}
                    onChange={e => setProdBrandId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none bg-white"
                  >
                    <option value="">-- Sélectionner Marque --</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Catégorie Ordo *</label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none bg-white"
                  >
                    <option value="">-- Sélectionner Catégorie --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Poids Unitaire (Kg)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={prodWeight}
                    onChange={e => setProdWeight(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Prix de Revient d'Achat (DA)</label>
                  <input 
                    type="number" 
                    required 
                    value={prodPurchasePrice}
                    onChange={e => setProdPurchasePrice(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Prix de Vente COD Standard (DA) *</label>
                  <input 
                    type="number" 
                    required 
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Alerte Stock Minimum</label>
                  <input 
                    type="number" 
                    value={prodMinAlert}
                    onChange={e => setProdMinAlert(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Description Fiche Technique</label>
                <textarea 
                  rows={2}
                  placeholder="Décrivez les atouts, packagings ou caractéristiques du produit..."
                  value={prodDescription}
                  onChange={e => setProdDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowProductForm(false)}
                  className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs hover:bg-gray-100 font-semibold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" /> Enregistrer la Fiche
                </button>
              </div>
            </form>
          )}

          {/* Catalog Filter Controls */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher nom, SKU maman..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={selectedBrandFilter}
                onChange={e => setSelectedBrandFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-gray-200 bg-white w-full md:w-40 focus:outline-none"
              >
                <option value="">Toutes Marques</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="text-xs p-2 rounded-xl border border-gray-200 bg-white w-full md:w-40 focus:outline-none"
              >
                <option value="">Toutes Catégories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products List Grid with inline Variants Drawer support */}
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map(p => {
              const prodVars = variants.filter(v => v.product_id === p.id);
              const isExpanded = !!expandedProductIds[p.id];
              const parentBrand = brands.find(b => b.id === p.brand_id)?.name || 'RYO';

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
                  <div className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold font-sans text-xs shrink-0 self-center">
                        {parentBrand.substring(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded font-mono uppercase">
                            SKU: {p.sku}
                          </span>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase font-sans">
                            {p.category}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mt-1">{p.name}</h4>
                        <p className="text-2xs text-gray-500 line-clamp-1 mt-0.5">{p.description || "Aucune description technique."}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-50 pt-3 md:pt-0">
                      <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono">
                        <div>
                          <span className="text-[9px] text-gray-400 uppercase font-sans block">Coût Achat</span>
                          <strong className="text-slate-700">{p.purchase_price} DA</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 uppercase font-sans block">Prix COD</span>
                          <strong className="text-indigo-600">{p.price} DA</strong>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-400 uppercase font-sans block">Variants</span>
                          <strong className="text-gray-900">{prodVars.length} types</strong>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => toggleProductExpand(p.id)}
                          className="p-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-2xs font-bold transition flex items-center gap-1"
                        >
                          <Grid className="w-3.5 h-3.5" />
                          {isExpanded ? 'Fermer' : 'Gérer variantes'}
                        </button>
                        <button
                          onClick={() => handleEditProductClick(p)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Modifier l'article"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer définitivement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* E-commerce variants drawer configuration list */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-gray-100 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Variantes de ventes configurées pour {p.sku}</h5>
                        
                        {addingVariantProductId !== p.id ? (
                          <button
                            onClick={() => {
                              setAddingVariantProductId(p.id);
                              setVarSku(`${p.sku}-`);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xs px-2.5 py-1 rounded-lg shadow-sm transition flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Créer une Variante
                          </button>
                        ) : (
                          <button
                            onClick={() => setAddingVariantProductId(null)}
                            className="text-gray-500 hover:text-gray-900 font-bold text-2xs"
                          >
                            Annuler l'ajout
                          </button>
                        )}
                      </div>

                      {/* Add Variant Form inline */}
                      {addingVariantProductId === p.id && (
                        <form onSubmit={(e) => handleVariantSubmit(e, p.id)} className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">SKU Variante *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Fid-Bag-Silver"
                              value={varSku}
                              onChange={e => setVarSku(e.target.value)}
                              className="w-full text-xs rounded-lg border border-gray-200 p-2 font-mono uppercase bg-gray-50 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Couleur *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Ex. Silver, Blue, Black"
                              value={varColor}
                              onChange={e => setVarColor(e.target.value)}
                              className="w-full text-xs rounded-lg border border-gray-200 p-2 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Taille (Défaut: Unique)</label>
                            <input 
                              type="text" 
                              placeholder="Unique, M, L, XL"
                              value={varSize}
                              onChange={e => setVarSize(e.target.value)}
                              className="w-full text-xs rounded-lg border border-gray-200 p-2 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Stock Initial</label>
                            <input 
                              type="number" 
                              min="0"
                              value={varStock}
                              onChange={e => setVarStock(Number(e.target.value))}
                              className="w-full text-xs rounded-lg border border-gray-200 p-2 focus:outline-none font-mono"
                            />
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="submit"
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs p-2 rounded-lg w-full shadow text-center"
                            >
                              Enregistrer
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Display configured variants for that product */}
                      {prodVars.length === 0 ? (
                        <p className="text-2xs text-gray-400 font-medium italic">Aucune variante enregistrée pour l'instant. Cliquez ci-dessus pour ajouter des coloris/tailles uniques.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {prodVars.map(v => {
                            const isPair = p.category === 'Arm Sleeves';
                            const unitLabel = isPair ? 'paires' : 'pcs';

                            return (
                              <div key={v.id} className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-3xs flex items-center justify-between">
                                <div className="min-w-0">
                                  <strong className="block text-gray-900 text-xs font-sans truncate">{v.name}</strong>
                                  <span className="text-[9px] text-gray-500 font-mono block uppercase font-bold">SKU : {v.sku}</span>
                                  <div className="flex gap-1 mt-1">
                                    <span className="text-[8px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded font-mono">
                                      {v.color || 'Unique'}
                                    </span>
                                    <span className="text-[8px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded font-mono">
                                      {v.size || 'Unique'}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <strong className="text-xs text-gray-900 font-mono block">{v.stock_quantity ?? 0} {unitLabel}</strong>
                                  <button
                                    onClick={() => handleDeleteVariant(v.id, p.id)}
                                    className="text-[10px] text-gray-400 hover:text-red-700 font-semibold p-1 transition"
                                    title="Supprimer la variante"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* =========================================
          TAB 2: GESTION DES MARQUES
          ========================================= */}
      {productSubTab === 'brands' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Add brand Form (left column) */}
          <div className="md:col-span-1">
            <form onSubmit={handleBrandSubmit} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center gap-1">
                <Tag className="w-4 h-4 text-indigo-600" /> Ajouter une Nouvelle Marque
              </h3>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Nom de la marque *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex. RYO BAGS"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Vocation de la marque / Descriptif</label>
                <textarea 
                  rows={3}
                  placeholder="Vêtements, maroquinerie, accessoires haut de gamme..."
                  value={brandDesc}
                  onChange={e => setBrandDesc(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
              >
                Créer Marque
              </button>
            </form>
          </div>

          {/* Brands list (right columns) */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold font-sans uppercase tracking-widest text-slate-400">Marques partenaires actives</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brands.map(b => (
                <div key={b.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex justify-between items-start">
                  <div>
                    <strong className="text-gray-950 font-sans text-sm block">{b.name}</strong>
                    <p className="text-xs text-gray-500 mt-1">{b.description || "Aucun descriptif pour cette marque d'importation."}</p>
                    <small className="text-[10px] text-indigo-600 font-mono block mt-2">ID : {b.id.substring(0, 8)}...</small>
                  </div>

                  <button
                    onClick={() => handleDeleteBrand(b.id)}
                    className="p-1 px-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-2xs font-bold transition shrink-0"
                    title="Supprimer la marque"
                  >
                    Effacer
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}


      {/* =========================================
          TAB 3: CATÉGORIES DE VENTES
          ========================================= */}
      {productSubTab === 'categories' && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Add Category Form (left) */}
          <div className="md:col-span-1">
            <form onSubmit={handleCategorySubmit} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center gap-1">
                <FolderOpen className="w-4 h-4 text-indigo-600" /> Créer une Catégorie
              </h3>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Nom de la catégorie *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex. Women Handbags"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-2xs font-extrabold uppercase text-gray-500 mb-1">Description / Notes de tri</label>
                <textarea 
                  rows={3}
                  placeholder="Description du type de marchandises..."
                  value={catDesc}
                  onChange={e => setCatDesc(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
              >
                Enregistrer Catégorie
              </button>
            </form>
          </div>

          {/* Categories track (right) */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold font-sans uppercase tracking-widest text-slate-400">Classifications du catalogue</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(c => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
                  <strong className="text-gray-950 font-sans text-sm block">{c.name}</strong>
                  <p className="text-xs text-gray-500 mt-1">{c.description || "Aucune note additionnelle."}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
