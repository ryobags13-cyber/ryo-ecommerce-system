import { isConfigured, supabase } from '../supabase';
import { 
  Key, 
  Database, 
  Settings, 
  CheckCircle2, 
  Info, 
  Lock, 
  AlertCircle,
  Server,
  FileText
} from 'lucide-react';

export default function ParamsView() {
  const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'Non défini';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-sans text-gray-900">Paramètres Système & Intégration</h2>
        <p className="text-xs text-gray-500">Configurez votre base de données Supabase, gérez les clés d'accès, et vérifiez l'état de synchronisation.</p>
      </div>

      {/* Integration Status Box */}
      <div className={`p-6 rounded-2xl border ${
        isConfigured 
          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
          : 'bg-amber-50/50 border-amber-200 text-amber-900'
      } flex flex-col md:flex-row gap-4 items-start justify-between`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {isConfigured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <h3 className="font-bold text-sm">
              {isConfigured ? 'Connexion Supabase Active !' : 'Mode Démonstration Actif'}
            </h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
            {isConfigured 
              ? `Votre application est connectée à Supabase à l'adresse : ${supabaseUrl}. Les profils administrés, états des stocks et marges sont synchronisés en temps réel avec votre Schéma PostgreSQL SQL.`
              : 'Les variables de connexion Supabase ne sont pas détectées ou utilisent des valeurs de démonstration. L\'application fonctionne en mode hors-ligne crypté localement dans localStorage. Les créations de commandes factices et mise à jour de stock sont simulées.'}
          </p>
        </div>

        <div className="shrink-0 font-mono text-2xs px-3 py-1 bg-white border rounded-full font-bold">
          {isConfigured ? 'PRODUCTION CLOUD' : 'LOCAL EMULATOR'}
        </div>
      </div>

      {/* Database sync information and credentials steps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supabase Creds Manual Documentation */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-indigo-600" />
            <h4 className="font-sans font-bold text-gray-900 text-sm">Comment connecter votre base de données Supabase ?</h4>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Pour basculer du mode démonstration à votre base PostgreSQL Supabase hébergée, vous devez renseigner vos variables d'environnement.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl space-y-2.5">
              <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono tracking-wider">Étape 1 : Récupérer les clés sur Supabase</span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Connectez-vous sur votre console <strong>Supabase</strong>, allez dans <strong>Project Settings &gt; API</strong>, puis copiez :
              </p>
              <ul className="list-disc pl-5 text-2xs text-gray-500 space-y-1 font-sans">
                <li><strong>Project URL</strong> (ex. https://xyzkp5...supabase.co)</li>
                <li><strong>anon public API key</strong> (la clé JWT anon)</li>
              </ul>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2.5">
              <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono tracking-wider">Étape 2 : Configurer les Secrets dans AI Studio</span>
              <p className="text-xs text-gray-600 leading-relaxed">
                Ouvrez le menu <strong>Settings &gt; Secrets</strong> de votre console <strong>Google AI Studio</strong> (ou modifiez le fichier local <code className="font-mono bg-white border px-1 rounded">.env</code>), puis ajoutez les clés suivantes :
              </p>
              
              <div className="bg-gray-900 text-gray-300 font-mono text-xs p-3.5 rounded-lg space-y-2 select-all leading-normal">
                <p><span className="text-indigo-400">VITE_SUPABASE_URL</span>=https://votre-id-projet.supabase.co</p>
                <p><span className="text-indigo-400">VITE_SUPABASE_ANON_KEY</span>=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Database profile layout config */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h4 className="font-sans font-bold text-gray-900 text-sm">Structure des Tables exploitées par l'applet</h4>
          </div>

          <p className="text-xs text-gray-500">
            L'application est configurée pour requêter de façon optimale les tables suivantes de votre base de données Supabase, selon le fichier <code className="font-mono bg-gray-50 px-1 rounded text-red-600">schema.sql</code> :
          </p>

          <div className="space-y-3 font-medium text-xs">
            <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
              <span className="font-mono text-gray-800">profiles</span>
              <span className="text-[10px] text-gray-400 font-sans">Admin, collaborateurs, opérateurs, Livreurs</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
              <span className="font-mono text-gray-800">customers</span>
              <span className="text-[10px] text-gray-400 font-sans">Coordonnées, historique, états Liste Noire</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
              <span className="font-mono text-gray-800">products & product_variants</span>
              <span className="text-[10px] text-gray-400 font-sans">Catalogue, prix d'achat/vente, stock physique</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
              <span className="font-mono text-gray-800">orders & order_items</span>
              <span className="text-[10px] text-gray-400 font-sans">Suivi COD, statut de livraison, marge bénéficiaire</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
              <span className="font-mono text-gray-800">ad_campaigns & expenses</span>
              <span className="text-[10px] text-gray-400 font-sans">Gabarits de charges financières pour calcul du ROI net</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-xl text-xs text-indigo-800 flex items-center gap-2 font-sans">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Aucune modification n'a été apportée aux triggers SQL ou au schema de sécurité pour préserver l'intégrité de vos flux existants.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
