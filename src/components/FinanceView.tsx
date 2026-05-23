import React, { useState, useEffect } from 'react';
import { Expense, Order } from '../types';
import { mockDb } from '../supabase';
import { 
  DollarSign, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  Trash2, 
  Briefcase, 
  AlertCircle,
  PiggyBank
} from 'lucide-react';

export default function FinanceView() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [category, setCategory] = useState<'marketing' | 'delivery' | 'sourcing' | 'operational' | 'salaries' | 'other'>('marketing');
  const [amount, setAmount] = useState(5000);
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('2026-05-23');

  useEffect(() => {
    refreshFinance();
  }, []);

  const refreshFinance = async () => {
    try {
      const [expensesData, ordersData] = await Promise.all([
        mockDb.getExpenses(),
        mockDb.getOrders()
      ]);
      setExpenses(expensesData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error("Error fetching finance data:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) {
      alert('Veuillez spécifier une description et un montant valide.');
      return;
    }

    try {
      await mockDb.saveExpense({
        id: '',
        category,
        amount,
        description,
        expense_date: expenseDate,
      });

      setDescription('');
      setAmount(5000);
      setCategory('marketing');
      setShowAddForm(false);
      await refreshFinance();
    } catch (err) {
      console.error("Error creating expense:", err);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;
    try {
      await mockDb.deleteExpense(expenseId);
      await refreshFinance();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  // Math metrics
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  
  // Confirmed/Delivered orders revenue and profit
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((acc, o) => acc + o.total_price, 0);
  const rawProfit = deliveredOrders.reduce((acc, o) => acc + (o.estimated_profit || 0), 0);
  const netProfit = rawProfit - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-900">Finance & Charges d'Exploitation</h2>
          <p className="text-xs text-gray-500">Mettez à jour vos dépenses externes pour obtenir une vision exacte du bénéfice net restant.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition self-start"
        >
          <Plus className="w-4 h-4" />
          Ajouter Charge / Dépense
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Déclarer une Nouvelle Dépense</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Catégorie de Charge *</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none"
              >
                <option value="marketing">Marketing Ad Spend</option>
                <option value="delivery">Livraison / Surcharges retours</option>
                <option value="sourcing">Achat de marchandise (Wholesale)</option>
                <option value="operational">Loyer & Matériel opérationnel</option>
                <option value="salaries">Salaires & Commissions Call Center</option>
                <option value="other">Autres dépenses</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Montant unitaire (DA) *</label>
              <input 
                type="number" 
                required
                min="10"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date d'effet *</label>
              <input 
                type="date" 
                required
                value={expenseDate}
                onChange={e => setExpenseDate(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description explicative de la charge *</label>
            <input 
              type="text" 
              required
              placeholder="Ex. Versement FB Ads Pixel Imad, ou Transport carton dates de Biskra"
              value={description}
              onChange={e => setDescription(e.target.value)}
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
              Enregistrer la dépense
            </button>
          </div>
        </form>
      )}

      {/* Finance report summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Deliveries Income */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Revenus Encaissés</span>
          <h3 className="text-2xl font-bold font-mono text-gray-950 mt-1">{totalRevenue.toLocaleString()} DA</h3>
          <p className="text-[10px] text-gray-400 mt-1">Colis livrés uniquement</p>
        </div>

        {/* Goods + Delivery Margins estimate */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Marge brute</span>
          <h3 className="text-2xl font-bold font-mono text-indigo-700 mt-1">+{rawProfit.toLocaleString()} DA</h3>
          <p className="text-[10px] text-slate-400 mt-1">Revenu moins coût d'achat</p>
        </div>

        {/* Expenses */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Charges d'Exploitation</span>
          <h3 className="text-2xl font-bold font-mono text-amber-600 mt-1">-{totalExpenses.toLocaleString()} DA</h3>
          <p className="text-[10px] text-amber-500 mt-1">Sourcing, marketing, salaires</p>
        </div>

        {/* Real Bottom-line Net profit */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Bénéfice Net</span>
          <h3 className={`text-2xl font-bold font-mono mt-1 ${
            netProfit >= 0 ? 'text-green-700' : 'text-red-700'
          }`}>
            {netProfit.toLocaleString()} DA
          </h3>
          <p className="text-[10px] text-slate-500 mt-1">Marge brute moins charges</p>
        </div>
      </div>

      {/* Expense ledger tables */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-sm">Registre Général des Charges</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Description de la charge</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Date de Facture</th>
                <th className="p-4">Montant Payé</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {expenses.length > 0 ? (
                expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-4 font-bold text-gray-900">{exp.description}</td>
                    <td className="p-4">
                      <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-bold ${
                        exp.category === 'marketing' ? 'bg-red-50 text-red-700 border border-red-100' :
                        exp.category === 'salaries' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        exp.category === 'sourcing' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        exp.category === 'delivery' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                        'bg-slate-50 text-slate-700 border border-slate-100'
                      }`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono">{exp.expense_date}</td>
                    <td className="p-4 font-mono font-black text-gray-900">
                      -{exp.amount.toLocaleString()} DA
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                        title="Supprimer la charge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Aucune dépense enregistrée dans ce registre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
