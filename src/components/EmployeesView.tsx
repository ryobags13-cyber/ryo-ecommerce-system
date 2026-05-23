import { useState, useEffect } from 'react';
import { EmployeePerformance } from '../types';
import { mockDb } from '../supabase';
import { 
  Users, 
  PhoneCall, 
  Activity, 
  Award, 
  TrendingUp, 
  HelpCircle 
} from 'lucide-react';

export default function EmployeesView() {
  const [employees, setEmployees] = useState<EmployeePerformance[]>([]);

  useEffect(() => {
    refreshEmployees();
  }, []);

  const refreshEmployees = async () => {
    try {
      const data = await mockDb.getEmployeePerformance();
      setEmployees(data || []);
    } catch (err) {
      console.error("Error fetching employee performance:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-sans text-gray-900">Rendement de l'Équipe & Dispatch</h2>
        <p className="text-xs text-gray-500">Supervisez les statistiques de confirmation de vos téléconseillers (Call Center COD) et l'efficacité de vos livreurs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => {
          const isOperator = emp.role === 'operator';
          return (
            <div key={emp.profile_id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{emp.full_name}</h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase font-bold tracking-wider font-mono">
                    {emp.role}
                  </span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-xl">
                  <PhoneCall className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Progress meters for key task metrics */}
              <div className="space-y-3.5 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                    <span>Appels émis confirmés</span>
                    <strong className="text-slate-900 font-bold">{emp.total_calls_made} appels</strong>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gray-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, emp.total_calls_made * 2)}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                    <span>Taux de Confirmation</span>
                    <strong className="text-indigo-600 font-mono font-bold">{emp.conversion_rate}%</strong>
                  </div>
                  <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${emp.conversion_rate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                    <span>Succès Livraison (Livré/Confirmé)</span>
                    <strong className="text-emerald-600 font-mono font-bold">{emp.delivery_success_rate}%</strong>
                  </div>
                  <div className="w-full bg-gray-50 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${emp.delivery_success_rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Performance award badges */}
              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-2.5 text-xs text-gray-600 font-medium">
                <Award className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {emp.role === 'admin' ? 'Superviseur de la plateforme' :
                   emp.role === 'manager' ? 'Gestionnaire des stocks et fiches' :
                   'Opérateur support & confirmation téléphonique actif'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
