import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { mockDb, cleanPhone } from '../supabase';
import { 
  Users, 
  Search, 
  AlertOctagon, 
  CheckCircle2, 
  UserPlus, 
  Trash2, 
  VolumeX,
  ShieldAlert,
  Frown,
  Activity
} from 'lucide-react';

export default function CustomersView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterBlacklist, setFilterBlacklist] = useState<string>('all');

  // Add Customer FormState
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilayaCode, setWilayaCode] = useState('16');
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState('');
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');

  useEffect(() => {
    refreshCustomers();
  }, []);

  const refreshCustomers = async () => {
    const data = await mockDb.getCustomers();
    setCustomers(data);
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('Veuillez renseigner le nom complet et le téléphone.');
      return;
    }

    const payload: Customer = {
      id: Math.random().toString(36).substring(2, 9),
      full_name: fullName,
      phone: cleanPhone(phone),
      wilaya_code: wilayaCode,
      commune,
      address,
      is_blacklisted: isBlacklisted,
      blacklist_reason: isBlacklisted ? blacklistReason : '',
      total_orders_count: 0,
      successful_delivery_count: 0
    };

    try {
      await mockDb.saveCustomer(payload);

      // Reset Form
      setFullName('');
      setPhone('');
      setWilayaCode('16');
      setCommune('');
      setAddress('');
      setIsBlacklisted(false);
      setBlacklistReason('');
      setShowAddForm(false);

      await refreshCustomers();
    } catch (err) {
      console.error("Error adding customer:", err);
      alert("Erreur lors de la création du client.");
    }
  };

  const toggleBlacklistStatus = async (customer: Customer) => {
    const nextStatus = !customer.is_blacklisted;
    const reason = nextStatus ? 'Refus de colis automatique ou refus de réponse répétitif.' : '';
    
    try {
      await mockDb.saveCustomer({
        ...customer,
        is_blacklisted: nextStatus,
        blacklist_reason: reason
      });
      await refreshCustomers();
    } catch (err) {
      console.error("Error setting customer blacklist status:", err);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const term = search.toLowerCase();
    const phoneClean = cleanPhone(c.phone);
    const matchesSearch = c.full_name.toLowerCase().includes(term) || phoneClean.includes(term) || (c.address && c.address.toLowerCase().includes(term));

    if (filterBlacklist === 'blacklisted') return matchesSearch && c.is_blacklisted;
    if (filterBlacklist === 'clean') return matchesSearch && !c.is_blacklisted;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-gray-900">Base Clients & Fidélité</h2>
          <p className="text-xs text-gray-500 font-normal">
            Gérez les fiches clients et identifiez les numéros frauduleux/blacklistés avant d'expédier vos colis et risquer des frais de retour.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition self-start"
        >
          <UserPlus className="w-4 h-4" />
          Nouveau Client
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddCustomer} className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md space-y-4">
          <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">Ajouter un Client</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom Complet *</label>
              <input 
                type="text" 
                required
                placeholder="Ex. Sofiane Benaissa"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Téléphone *</label>
              <input 
                type="text" 
                required
                placeholder="Ex. 0661998877"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Wilaya</label>
              <input 
                type="text" 
                placeholder="Ex. 16 - Alger"
                value={wilayaCode}
                onChange={e => setWilayaCode(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Commune</label>
              <input 
                type="text" 
                placeholder="Ex. Sidi M'hamed"
                value={commune}
                onChange={e => setCommune(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse de livraison</label>
              <input 
                type="text" 
                placeholder="Cité des 500 logements, Bâtiment 3"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full text-xs rounded-xl border border-gray-200 p-2.5 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-red-700">
              <input 
                type="checkbox" 
                checked={isBlacklisted} 
                onChange={e => setIsBlacklisted(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
              />
              Mettre ce client sur Liste Noire (Blacklist)
            </label>

            {isBlacklisted && (
              <div>
                <label className="block text-2xs font-bold text-gray-500 mb-1 uppercase">Motif de la mise sur Liste Noire</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex. Retour récurrent, insalubrité ou refus de retrait au bureau de livraisons..."
                  value={blacklistReason}
                  onChange={e => setBlacklistReason(e.target.value)}
                  className="w-full text-xs rounded-xl border border-red-200 p-2 mr-2 bg-white focus:outline-none"
                />
              </div>
            )}
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
              Créer Client
            </button>
          </div>
        </form>
      )}

      {/* Filter and Table of clients */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Rechercher nom, téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterBlacklist('all')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              filterBlacklist === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Tous ({customers.length})
          </button>
          <button
            onClick={() => setFilterBlacklist('clean')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              filterBlacklist === 'clean' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Fidèles Clean
          </button>
          <button
            onClick={() => setFilterBlacklist('blacklisted')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
              filterBlacklist === 'blacklisted' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            Liste Noire ({customers.filter(c => c.is_blacklisted).length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Nom Complet</th>
                <th className="p-4">Téléphone National</th>
                <th className="p-4">Localité (Wilaya)</th>
                <th className="p-4">Statistiques COD</th>
                <th className="p-4">Taux de Succès</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Action Liste Noire</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map(cust => {
                  const hasOrders = cust.total_orders_count > 0;
                  const ratio = hasOrders ? (cust.successful_delivery_count / cust.total_orders_count * 100).toFixed(0) : '0';

                  return (
                    <tr key={cust.id} className={`hover:bg-gray-50/70 transition-colors ${cust.is_blacklisted ? 'bg-red-50/30' : ''}`}>
                      <td className="p-4">
                        <span className="text-gray-900 font-bold block">{cust.full_name}</span>
                        {cust.is_blacklisted && (
                          <span className="text-[9px] text-red-700 font-bold font-sans mt-0.5 block flex items-center gap-0.5">
                            <ShieldAlert className="w-3 h-3 text-red-600 shrink-0" />
                            Bloqué: {cust.blacklist_reason}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-gray-900 font-semibold">{cust.phone}</td>

                      <td className="p-4 font-sans text-gray-900">
                        {cust.wilaya_code} - {cust.commune || 'Wilaya'}
                      </td>

                      <td className="p-4">
                        <div className="font-mono text-gray-900">
                          Total Cmds: <strong className="font-black text-xs text-indigo-700">{cust.total_orders_count}</strong>
                        </div>
                        <div className="text-[10px] text-green-600 font-mono">
                          Livrées: <strong>{cust.successful_delivery_count}</strong>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden shrink-0">
                            <div 
                              className={`h-full rounded-full ${
                                Number(ratio) >= 70 ? 'bg-green-500' : Number(ratio) >= 40 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${ratio}%` }}
                            ></div>
                          </div>
                          <span className="font-mono font-bold text-gray-900 text-xs">{ratio}%</span>
                        </div>
                      </td>

                      {/* Display status label */}
                      <td className="p-4">
                        {cust.is_blacklisted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                            Liste Noire
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                            Fidèle
                          </span>
                        )}
                      </td>

                      {/* Blacklist toggle button */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleBlacklistStatus(cust)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto ${
                            cust.is_blacklisted 
                              ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                          }`}
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          {cust.is_blacklisted ? 'Réhabiliter Client' : 'Mettre sur Liste Noire'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Frown className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    Aucun client ne correspond aux critères de recherche actuels.
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
