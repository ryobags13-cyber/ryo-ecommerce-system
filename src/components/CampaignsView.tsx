import React, { useState, useEffect } from 'react';
import { AdCampaign } from '../types';
import { mockDb } from '../supabase';
import { 
  Megaphone, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  PlayCircle,
  HelpCircle
} from 'lucide-react';

import { Order } from '../types';

export default function CampaignsView() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Facebook Ads');
  const [spend, setSpend] = useState(10000);
  const [startsAt, setStartsAt] = useState('2026-05-20');
  const [endsAt, setEndsAt] = useState('2026-05-30');

  useEffect(() => {
    refreshCampaigns();
  }, []);

  const refreshCampaigns = async () => {
    try {
      const [campaignsData, ordersData] = await Promise.all([
        mockDb.getAdCampaigns(),
        mockDb.getOrders()
      ]);
      setCampaigns(campaignsData || []);
      setOrders(ordersData || []);
    } catch (err) {
      console.error("Error fetching campaigns & orders:", err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || spend <= 0) {
      alert('Veuillez introduire un label et un montant valide.');
      return;
    }

    try {
      await mockDb.saveAdCampaign({
        id: '',
        name,
        platform,
        spend,
        starts_at: startsAt,
        ends_at: endsAt
      });

      setName('');
      setSpend(10000);
      setStartsAt('2026-05-20');
      setEndsAt('2026-05-30');
      setShowAdd(false);
      await refreshCampaigns();
    } catch (err) {
      console.error("Error registering campaign:", err);
    }
  };

  const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
  
  // Real sales from delivered orders
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((acc, o) => acc + o.total_price, 0);
  const totalProfit = deliveredOrders.reduce((acc, o) => acc + (o.estimated_profit || 0), 0);

  // Automatic marketing ROI calculations
  // ROI = (Total Revenue - Total Spend) / Total Spend * 100
  const marketingRoi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100).toFixed(0) : '0';
  const profitRoi = totalSpend > 0 ? ((totalProfit - totalSpend) / totalSpend * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-900">Suivi Publicitaire & ROI</h2>
          <p className="text-xs text-gray-500">Supervisez les montants alloués aux publicités Meta, TikTok ou Google Ads pour évaluer vos marges nettes.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition self-start"
        >
          <Plus className="w-4 h-4" />
          Déclarer une Campagne
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Ajouter un Budget Publicitaire</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom du Pixel / Campagne *</label>
              <input 
                type="text" 
                required
                placeholder="Ex. Deglet Nour Dates Ramadan Conversions"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Plateforme Pub *</label>
              <select 
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 bg-white focus:outline-none"
              >
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="Instagram Ads">Instagram Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Snapchat Ads">Snapchat Ads</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Dépense (DA) *</label>
              <input 
                type="number" 
                required
                min="100"
                placeholder="Ex. 15000"
                value={spend}
                onChange={e => setSpend(Number(e.target.value))}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date Debut *</label>
              <input 
                type="date" 
                required
                value={startsAt}
                onChange={e => setStartsAt(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date Fin *</label>
              <input 
                type="date" 
                required
                value={endsAt}
                onChange={e => setEndsAt(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              type="button" 
              onClick={() => setShowAdd(false)}
              className="border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-xs hover:bg-gray-100 font-semibold"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Campaign Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Investissement Total Ads</span>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalSpend.toLocaleString()} DA</h3>
          <p className="text-xs text-slate-500 font-mono mt-1">Cumulé sur l'ensemble des réseaux</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">ROI Chiffre d'Affaire</span>
          <h3 className={`text-2xl font-bold mt-1 ${Number(marketingRoi) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {marketingRoi}%
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Ventes livrées ({totalRevenue.toLocaleString()} DA) / Publicité
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">ROI Bénéfice Net</span>
          <h3 className={`text-2xl font-bold mt-1 ${Number(profitRoi) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
            {profitRoi}%
          </h3>
          <p className="text-xs text-slate-500 font-mono mt-1">
            Marge nette ({totalProfit.toLocaleString()} DA) / Publicité
          </p>
        </div>
      </div>

      {/* Campaigns Listing */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-sm">Financement des Pixels Actifs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Pixel / Campagne</th>
                <th className="p-4">Plateforme</th>
                <th className="p-4">Montant Alloué (Dépensé)</th>
                <th className="p-4">Période d'activité</th>
                <th className="p-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {campaigns.length > 0 ? (
                campaigns.map(c => {
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-4 font-bold text-gray-900">{c.name}</td>
                      <td className="p-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-[10px] font-bold">
                          {c.platform}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-900">
                        {c.spend.toLocaleString()} DA
                      </td>
                      <td className="p-4 flex items-center gap-1.5 pt-4">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Du {new Date(c.starts_at).toLocaleDateString()} au {new Date(c.ends_at).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                          Actif
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <Megaphone className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Aucune campagne publicitaire n'a été déclarée récemment.
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
