'use client';

import React, { useState } from 'react';

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

// ── Données mock ──
const SCHEDULES: ScheduleItem[] = [
  { id: '1', routeName: 'Cotonou → Parakou', from: 'Cotonou Dantokpa', to: 'Parakou Gare', departureTime: '06:30', daysOfWeek: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], busAssigned: 'VIP-01', busType: 'VIP', duration: '5h30', basePrice: '8 500 XOF', isActive: true },
  { id: '2', routeName: 'Cotonou → Porto-Novo', from: 'Cotonou Missèbo', to: 'Porto-Novo Grand Marché', departureTime: '08:00', daysOfWeek: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'], busAssigned: 'STD-03', busType: 'Standard', duration: '1h15', basePrice: '2 500 XOF', isActive: true },
  { id: '3', routeName: 'Bohicon → Cotonou', from: 'Bohicon Centre', to: 'Cotonou Dantokpa', departureTime: '07:00', daysOfWeek: ['Lun', 'Mer', 'Ven', 'Dim'], busAssigned: 'CNF-02', busType: 'Confort', duration: '2h00', basePrice: '5 000 XOF', isActive: true },
  { id: '4', routeName: 'Cotonou → Abomey', from: 'Cotonou Dantokpa', to: 'Abomey Royal', departureTime: '09:30', daysOfWeek: ['Lun', 'Mar', 'Jeu', 'Sam'], busAssigned: 'STD-04', busType: 'Standard', duration: '2h30', basePrice: '4 000 XOF', isActive: true },
  { id: '5', routeName: 'Parakou → Natitingou', from: 'Parakou Gare', to: 'Natitingou Centre', departureTime: '06:00', daysOfWeek: ['Mar', 'Ven', 'Dim'], busAssigned: 'VIP-02', busType: 'VIP', duration: '4h00', basePrice: '6 500 XOF', isActive: false },
  { id: '6', routeName: 'Cotonou → Ouidah', from: 'Cotonou Godomey', to: 'Ouidah Porte', departureTime: '10:00', daysOfWeek: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], busAssigned: 'CNF-05', busType: 'Confort', duration: '0h45', basePrice: '1 500 XOF', isActive: true },
];

const ALL_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const TYPE_COLORS = {
  VIP: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Confort: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  Standard: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

export default function SchedulesPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showAddModal, setShowAddModal] = useState(false);

  const activeSchedules = SCHEDULES.filter((s) => s.isActive).length;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-[22px]">schedule</span>
            Trajets & Horaires
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Planifiez et gérez vos itinéraires</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] mr-1 align-middle">view_list</span>
              Liste
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === 'calendar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] mr-1 align-middle">calendar_month</span>
              Calendrier
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm shadow-teal-500/20"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nouveau trajet
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-teal-500 text-[20px]">route</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">{SCHEDULES.length}</div>
              <div className="text-[11px] text-slate-400 font-medium">Trajets configurés</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">{activeSchedules}</div>
              <div className="text-[11px] text-slate-400 font-medium">Actifs</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-cyan-500 text-[20px]">location_city</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">8</div>
              <div className="text-[11px] text-slate-400 font-medium">Villes desservies</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-500 text-[20px]">avg_pace</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">42</div>
              <div className="text-[11px] text-slate-400 font-medium">Départs / semaine</div>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-500 text-[18px]">format_list_bulleted</span>
              Tous les trajets
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {SCHEDULES.map((schedule) => (
              <div
                key={schedule.id}
                className={`px-5 py-4 hover:bg-slate-50/50 transition-colors ${!schedule.isActive ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  {/* Left: Route Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Time badge */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/15 flex flex-col items-center justify-center shrink-0">
                      <span className="text-lg font-extrabold text-teal-600 leading-none">{schedule.departureTime.split(':')[0]}</span>
                      <span className="text-[10px] text-teal-500 font-bold">:{schedule.departureTime.split(':')[1]}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900">{schedule.routeName}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${TYPE_COLORS[schedule.busType]}`}>
                          {schedule.busType}
                        </span>
                        {!schedule.isActive && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-500 border border-rose-200">
                            Inactif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-2">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">pin_drop</span>
                          {schedule.from}
                        </span>
                        <span className="material-symbols-outlined text-[13px] text-slate-300">arrow_forward</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">flag</span>
                          {schedule.to}
                        </span>
                      </div>
                      {/* Days */}
                      <div className="flex items-center gap-1">
                        {ALL_DAYS.map((day) => (
                          <span
                            key={day}
                            className={`w-7 h-5 rounded text-[9px] font-bold flex items-center justify-center ${
                              schedule.daysOfWeek.includes(day)
                                ? 'bg-teal-500/15 text-teal-600'
                                : 'bg-slate-100 text-slate-300'
                            }`}
                          >
                            {day[0]}{day[1]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Meta + Actions */}
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900">{schedule.basePrice}</div>
                      <div className="text-[10px] text-slate-400">Durée : {schedule.duration}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="material-symbols-outlined text-[13px]">directions_bus</span>
                      {schedule.busAssigned}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500">add_road</span>
                Nouveau trajet
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Gare de départ</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white">
                    <option>Cotonou Dantokpa</option>
                    <option>Cotonou Missèbo</option>
                    <option>Bohicon Centre</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Gare d&apos;arrivée</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white">
                    <option>Parakou Gare</option>
                    <option>Porto-Novo Grand Marché</option>
                    <option>Abomey Royal</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Heure départ</label>
                  <input type="time" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Durée</label>
                  <input type="text" placeholder="2h30" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Prix (XOF)</label>
                  <input type="number" placeholder="5000" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Jours de circulation</label>
                <div className="flex gap-1.5">
                  {ALL_DAYS.map((day) => (
                    <label key={day} className="flex items-center justify-center w-10 h-8 rounded-lg border border-slate-200 text-xs font-bold cursor-pointer hover:border-teal-300 transition-colors">
                      <input type="checkbox" className="sr-only" />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Bus assigné</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white">
                  <option>VIP-01 (Mercedes Sprinter)</option>
                  <option>CNF-02 (Yutong ZK6122)</option>
                  <option>STD-03 (Iveco Daily)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
                Annuler
              </button>
              <button className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm">
                Créer le trajet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
