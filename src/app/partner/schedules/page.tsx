'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

// ── Types ──
interface ScheduleItem {
  id: string;
  routeName: string;
  from: string;
  to: string;
  departureTime: string;
  daysOfWeek: string[];
  busAssigned: string;
  busType: 'VIP' | 'Confort' | 'Standard';
  duration: string;
  basePrice: string;
  isActive: boolean;
}

const DEFAULT_SCHEDULES: ScheduleItem[] = [
  { id: '1', routeName: 'Cotonou → Parakou', from: 'Cotonou Dantokpa', to: 'Parakou Gare', departureTime: '06:30', daysOfWeek: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], busAssigned: 'VIP-01', busType: 'VIP', duration: '5h30', basePrice: '8 500 XOF', isActive: true },
  { id: '2', routeName: 'Cotonou → Porto-Novo', from: 'Cotonou Missèbo', to: 'Porto-Novo Grand Marché', departureTime: '08:00', daysOfWeek: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], busAssigned: 'STD-03', busType: 'Standard', duration: '1h15', basePrice: '2 500 XOF', isActive: true },
  { id: '3', routeName: 'Bohicon → Cotonou', from: 'Bohicon Centre', to: 'Cotonou Dantokpa', departureTime: '07:00', daysOfWeek: ['Lun', 'Mer', 'Ven', 'Dim'], busAssigned: 'CNF-02', busType: 'Confort', duration: '2h00', basePrice: '5 000 XOF', isActive: true },
];

const ALL_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const TYPE_COLORS = {
  VIP: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Confort: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  Standard: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(DEFAULT_SCHEDULES);
  const [routesList, setRoutesList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal form states
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [depTime, setDepTime] = useState('07:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      // Charger les routes pour le modal
      const { data: routes } = await supabase.from('routes').select('id, name');
      if (routes) setRoutesList(routes);

      // Charger les horaires avec routes
      const { data, error } = await supabase
        .from('schedules')
        .select(`
          id,
          departure_time,
          days_of_week,
          is_active,
          routes (
            id,
            name,
            base_price,
            duration_minutes
          )
        `);

      if (error) {
        console.error('Error fetching schedules:', error);
        return;
      }

      if (data && data.length > 0) {
        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const mapped: ScheduleItem[] = data.map((s: any) => {
          const route = s.routes;
          const routeName = route?.name || 'Trajet Interurbain';
          const parts = routeName.split('→');
          const from = parts[0]?.trim() || 'Origine';
          const to = parts[1]?.trim() || 'Destination';
          const durationHours = route?.duration_minutes ? `${Math.floor(route.duration_minutes / 60)}h${route.duration_minutes % 60 ? route.duration_minutes % 60 : '00'}` : '4h00';
          const days = (s.days_of_week || [0, 1, 2, 3, 4, 5, 6]).map((d: number) => dayNames[d] || 'Lun');

          return {
            id: s.id,
            routeName,
            from,
            to,
            departureTime: s.departure_time?.slice(0, 5) || '07:00',
            daysOfWeek: days,
            busAssigned: 'Auto-assigné',
            busType: 'Confort',
            duration: durationHours,
            basePrice: `${(route?.base_price || 5000).toLocaleString('fr-FR')} XOF`,
            isActive: s.is_active ?? true,
          };
        });
        setSchedules(mapped);
      }
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSchedule(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRouteId) {
      alert('Veuillez sélectionner un trajet');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase.from('schedules').insert({
        route_id: selectedRouteId,
        departure_time: `${depTime}:00`,
        days_of_week: selectedDays,
        is_active: true,
      }).select(`
        id,
        departure_time,
        days_of_week,
        is_active,
        routes (
          id,
          name,
          base_price,
          duration_minutes
        )
      `).single();

      if (error) {
        alert(`Erreur: ${error.message}`);
        return;
      }

      if (data) {
        await loadData();
      }

      setShowAddModal(false);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeSchedules = schedules.filter((s) => s.isActive).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-[22px]">schedule</span>
            Trajets & Horaires
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Planifiez et gérez vos itinéraires connectés à Supabase</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Semaine
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm shadow-teal-500/20"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nouveau départ
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-500 text-[20px]">route</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{schedules.length}</div>
                <div className="text-xs text-slate-400 font-medium">Départs programmés</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{activeSchedules}</div>
                <div className="text-xs text-slate-400 font-medium">Actifs cette semaine</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-cyan-500 text-[20px]">map</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{routesList.length || 10}</div>
                <div className="text-xs text-slate-400 font-medium">Lignes interurbaines</div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedules Table */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Itinéraire</th>
                  <th className="px-4 py-4">Départ</th>
                  <th className="px-4 py-4">Jours</th>
                  <th className="px-4 py-4">Durée</th>
                  <th className="px-4 py-4">Tarif</th>
                  <th className="px-4 py-4">Statut</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm">{schedule.routeName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {schedule.from} → {schedule.to}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-700 font-mono font-bold text-xs">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {schedule.departureTime}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {ALL_DAYS.map((day) => {
                          const active = schedule.daysOfWeek.includes(day);
                          return (
                            <span
                              key={day}
                              className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center ${
                                active ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-300'
                              }`}
                            >
                              {day[0]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">{schedule.duration}</td>
                    <td className="px-4 py-4 font-bold text-slate-900">{schedule.basePrice}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          schedule.isActive
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${schedule.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {schedule.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs text-slate-400 hover:text-teal-600 font-semibold transition-colors">
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500">add_circle</span>
                Nouveau départ régulier
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Ligne / Trajet</label>
                <select
                  required
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white"
                >
                  <option value="">Sélectionner une ligne</option>
                  {routesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Heure de départ</label>
                <input
                  type="time"
                  required
                  value={depTime}
                  onChange={(e) => setDepTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting && <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>}
                  Créer l'horaire dans Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
