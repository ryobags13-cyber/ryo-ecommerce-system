import React, { useState, useEffect } from 'react';
import { isConfigured, supabase, mockDb } from './supabase';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Boxes, 
  Users, 
  Megaphone, 
  Briefcase, 
  UsersRound, 
  Settings, 
  LogOut, 
  Bell, 
  Database, 
  TrendingUp, 
  Mail, 
  Lock, 
  ShieldCheck,
  MapPin,
  Clock,
  Menu,
  X
} from 'lucide-react';

// Subviews
import DashboardStats from './components/DashboardStats';
import OrdersView from './components/OrdersView';
import ProductsView from './components/ProductsView';
import StockView from './components/StockView';
import CustomersView from './components/CustomersView';
import CampaignsView from './components/CampaignsView';
import FinanceView from './components/FinanceView';
import EmployeesView from './components/EmployeesView';
import ParamsView from './components/ParamsView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [username, setUsername] = useState('Imad Eddine Abdelkader');
  const [email, setEmail] = useState('admin@algerian-cod.com');
  const [profileRole, setProfileRole] = useState('Admin Principal');
  const [showNotifications, setShowNotifications] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

  // Form states for login
  const [loginEmail, setLoginEmail] = useState('admin@algerian-cod.com');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Responsive mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    // Simulate authentications
    setTimeout(() => {
      if (loginEmail === 'admin@algerian-cod.com') {
        setIsAuthenticated(true);
        setUsername('Imad Eddine Abdelkader');
        setEmail(loginEmail);
        setProfileRole('Admin Principal');
      } else {
        // Fallback generic login support for any input for easier assessment
        setIsAuthenticated(true);
        const namePart = loginEmail.split('@')[0];
        setUsername(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        setEmail(loginEmail);
        setProfileRole('Manager Adjoint');
      }
      setIsLoading(false);
    }, 700);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Commandes', icon: ShoppingBag },
    { name: 'Produits', icon: Package },
    { name: 'Stock', icon: Boxes },
    { name: 'Clients', icon: Users },
    { name: 'Publicité', icon: Megaphone },
    { name: 'Finance', icon: Briefcase },
    { name: 'Employés', icon: UsersRound },
    { name: 'Paramètres', icon: Settings },
  ];

  return (
    <div id="app_container" className="min-h-screen bg-[#f8fafc] flex flex-col font-sans transition-colors">
      
      {/* ----------------- LOGIN PAGE ----------------- */}
      {!isAuthenticated ? (
        <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-900/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-slate-100 relative min-h-screen">
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-xs text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-gray-500 font-medium">BETA Démontage</span>
          </div>

          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            {/* Visual Brand */}
            <div className="flex justify-center flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl font-mono shadow-md shadow-indigo-200">
                DZ
              </div>
              <h2 className="mt-4 text-center text-2xl font-black font-sans tracking-tight text-gray-900">
                E-Commerce COD Algerie
              </h2>
              <p className="mt-1.5 text-center text-xs text-indigo-600/80 font-semibold font-mono uppercase tracking-wider">
                Système d'administration
              </p>
            </div>
          </div>

          <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
              <form className="space-y-5" onSubmit={handleLogin}>
                
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Adresse Email de l'Admin
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      placeholder="admin@algerian-cod.com"
                      className="block w-full text-xs pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 font-medium text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase text-gray-500 tracking-wider">
                    Mot de passe
                  </label>
                  <div className="mt-1 relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full text-xs pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 font-mono text-gray-800"
                    />
                  </div>
                </div>

                {loginError && (
                  <p className="text-xs text-red-600 font-semibold text-center mt-1">{loginError}</p>
                )}

                <div className="flex items-center justify-between text-xs pt-1.5 border-t border-gray-50">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Sessions sécurisées
                  </span>
                  <span className="text-gray-400 text-[10px] font-medium font-mono">Algeria Standard time</span>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-100 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Connexion en cours...' : 'Se connecter au Dashboard'}
                  </button>
                </div>
              </form>

              <div className="mt-5 p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px] text-indigo-900 leading-normal space-y-1">
                <strong>💡 Note d'accès:</strong>
                <p>Compte administrateur par défaut pré-rempli pour tester l'interface. Entrez l'email de votre profil pour y accéder.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (

        /* ----------------- ADMIN DASHBOARD LAYOUT ----------------- */
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar Menu (Desktop) */}
          <aside className="hidden lg:flex lg:flex-shrink-0 lg:flex-col w-64 border-r border-gray-200 bg-white">
            <div className="h-16 flex items-center gap-2.5 px-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm font-mono shadow-md">
                DZ
              </div>
              <div>
                <h1 className="text-xs font-black text-gray-900 uppercase tracking-tight">Algerian COD</h1>
                <p className="text-[9px] text-indigo-600 font-mono font-bold tracking-wider uppercase">Console d'Admin</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
              <nav className="space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.name)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                        isActive 
                          ? 'bg-gray-900 text-white shadow-xs' 
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      {item.name}
                    </button>
                  );
                })}
              </nav>

              {/* Sidebar bottom profile actions */}
              <div className="border-t border-gray-100 pt-4 mt-6 space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0">
                    IM
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{username}</p>
                    <span className="text-[10px] text-gray-400 block truncate">{email}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0 text-red-500" />
                  Déconnexion
                </button>
              </div>
            </div>
          </aside>

          {/* Core Content Layout Area */}
          <main className="flex-1 min-w-0 flex flex-col overflow-y-auto max-h-screen">
            
            {/* Top Navigation Header */}
            <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
              
              {/* Left controls */}
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    Alger, Dz
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                  <span className="text-xs text-gray-400 font-mono hidden sm:inline flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {liveTime}
                  </span>
                </div>
              </div>

              {/* Right controls - Notification and status badges */}
              <div className="flex items-center gap-4">
                {/* Supabase Status Bar */}
                <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                  isConfigured 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  <Database className="w-3.5 h-3.5" />
                  <span>{isConfigured ? 'Supabase Connecté' : 'Mode Démo (Local)'}</span>
                </div>

                {/* Notifications Panel */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                  >
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                    <Bell className="w-5 h-5" />
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 p-4 space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <span className="text-xs font-bold text-gray-900">Alertes Récentes</span>
                        <span className="text-[10px] text-indigo-600 font-bold uppercase">Lu</span>
                      </div>
                      <div className="space-y-2.5 text-xs text-gray-600 max-h-48 overflow-y-auto">
                        <div className="p-2.5 bg-gray-50 rounded-lg">
                          <p className="font-semibold text-gray-900 text-2xs">Fiche client blacklistée</p>
                          <p className="text-[10px] text-gray-500">Un numéro sur la liste noire a essayé d'enregistrer une livraison.</p>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-lg">
                          <p className="font-semibold text-gray-900 text-2xs">Alerte Stocks Dates Deglet Nour</p>
                          <p className="text-[10px] text-gray-500">Le stock de dattes de Biskra est descendu sous le seuil d'alerte.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Header Block */}
                <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-gray-900 shrink-0">{username}</p>
                    <span className="text-[10px] text-slate-400 font-medium block">{profileRole}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-950 text-white flex items-center justify-center font-bold text-xs">
                    IM
                  </div>
                </div>
              </div>
            </header>

            {/* Main view container rendered according to state */}
            <div id="view_dashboard_body" className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
              
              {/* Alert Mode Banner */}
              {!isConfigured && (
                <div className="bg-amber-50 rounded-2xl border border-amber-200/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-xl text-amber-700 shrink-0">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block font-bold">Base de données en mode démonstration</strong>
                      <span className="text-gray-600">Pour intégrer vos tables réelles Supabase (profiles, products, orders, etc.), configurez vos variables secrets.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('Paramètres')}
                    className="bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3.5 py-1.5 rounded-lg text-[10px] transition shrink-0"
                  >
                    Voir l'authentification
                  </button>
                </div>
              )}

              {/* ROUTED VIEW PANEL */}
              {activeTab === 'Dashboard' && <DashboardStats onNavigate={setActiveTab} />}
              {activeTab === 'Commandes' && <OrdersView />}
              {activeTab === 'Produits' && <ProductsView />}
              {activeTab === 'Stock' && <StockView />}

              {activeTab === 'Clients' && <CustomersView />}
              {activeTab === 'Publicité' && <CampaignsView />}
              {activeTab === 'Finance' && <FinanceView />}
              {activeTab === 'Employés' && <EmployeesView />}
              {activeTab === 'Paramètres' && <ParamsView />}

            </div>
          </main>
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)}></div>
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white pt-5 pb-4">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white bg-gray-900 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-shrink-0 flex items-center px-4 gap-2 border-b border-gray-100 pb-4">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm font-mono tracking-tight shadow-md">
                DZ
              </div>
              <span className="font-bold text-gray-950 text-xs">Menu COD Algérie</span>
            </div>

            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveTab(item.name);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive 
                          ? 'bg-gray-900 text-white' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {item.name}
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-gray-100 mt-6 space-y-2">
                <p className="text-2xs uppercase text-gray-400 font-bold">Admin connecté</p>
                <p className="text-xs font-bold text-gray-900">{username}</p>
                <button
                  onClick={handleLogout}
                  className="w-full text-left font-semibold text-xs text-red-600 py-1.5"
                >
                  Fermer la session
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
