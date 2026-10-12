'use client';

import React, { useState } from 'react';

// ── Types ──
interface BusItem {
  id: string;
  plateNumber: string;
  model: string;
  busType: 'VIP' | 'Confort' | 'Standard';
  totalSeats: number;
  hasAc: boolean;
  hasWifi: boolean;
  hasUsb: boolean;
  hasTv: boolean;
  hasWc: boolean;
  isActive: boolean;
  lastTrip: string;
}

// ── Données mock ──
const BUSES: BusItem[] = [
  { id: '1', plateNumber: 'AA-1234-BJ', model: 'Mercedes Sprinter 516', busType: 'VIP', totalSeats: 20, hasAc: true, hasWifi: true, hasUsb: true, hasTv: true, hasWc: false, isActive: true, lastTrip: '12 Oct 2026' },
  { id: '2', plateNumber: 'AB-5678-BJ', model: 'Yutong ZK6122', busType: 'Confort', totalSeats: 45, hasAc: true, hasWifi: false, hasUsb: true, hasTv: false, hasWc: true, isActive: true, lastTrip: '11 Oct 2026' },
  { id: '3', plateNumber: 'AC-9012-BJ', model: 'Iveco Daily 70C', busType: 'Standard', totalSeats: 55, hasAc: false, hasWifi: false, hasUsb: false, hasTv: false, hasWc: false, isActive: true, lastTrip: '12 Oct 2026' },
  { id: '4', plateNumber: 'AD-3456-BJ', model: 'Mercedes Tourismo', busType: 'VIP', totalSeats: 40, hasAc: true, hasWifi: true, hasUsb: true, hasTv: true, hasWc: true, isActive: true, lastTrip: '10 Oct 2026' },
  { id: '5', plateNumber: 'AE-7890-BJ', model: 'Iveco Crossway', busType: 'Standard', totalSeats: 50, hasAc: false, hasWifi: false, hasUsb: false, hasTv: false, hasWc: false, isActive: false, lastTrip: '05 Oct 2026' },
  { id: '6', plateNumber: 'AF-2345-BJ', model: 'Yutong ZK6858', busType: 'Confort', totalSeats: 35, hasAc: true, hasWifi: true, hasUsb: true, hasTv: false, hasWc: false, isActive: true, lastTrip: '12 Oct 2026' },
];

const TYPE_COLORS = {
  VIP: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Confort: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  Standard: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

const FEATURE_ICONS: { key: keyof Pick<BusItem, 'hasAc' | 'hasWifi' | 'hasUsb' | 'hasTv' | 'hasWc'>; icon: string; label: string }[] = [
  { key: 'hasAc', icon: 'ac_unit', label: 'Clim' },
  { key: 'hasWifi', icon: 'wifi', label: 'WiFi' },
  { key: 'hasUsb', icon: 'usb', label: 'USB' },
  { key: 'hasTv', icon: 'tv', label: 'TV' },
  { key: 'hasWc', icon: 'wc', label: 'WC' },
];

export default function FleetPage() {
  const [filter, setFilter] = useState<'all' | 'VIP' | 'Confort' | 'Standard'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredBuses = filter === 'all' ? BUSES : BUSES.filter((b) => b.busType === filter);
  const activeBuses = BUSES.filter((b) => b.isActive).length;
  const totalSeats = BUSES.reduce((sum, b) => sum + b.totalSeats, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-[22px]">directions_bus</span>
            Flotte & Bus
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Gérez vos véhicules et leur configuration</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm shadow-teal-500/20"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Ajouter un bus
        </button>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-500 text-[20px]">directions_bus</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{BUSES.length}</div>
                <div className="text-xs text-slate-400 font-medium">Total bus</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500 text-[20px]">check_circle</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{activeBuses}</div>
                <div className="text-xs text-slate-400 font-medium">Actifs</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-cyan-500 text-[20px]">event_seat</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{totalSeats}</div>
                <div className="text-xs text-slate-400 font-medium">Places totales</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['all', 'VIP', 'Confort', 'Standard'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300'
              }`}
            >
              {f === 'all' ? 'Tous' : f}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-2">{filteredBuses.length} résultat(s)</span>
        </div>

        {/* Bus Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredBuses.map((bus) => (
            <div
              key={bus.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                bus.isActive ? 'border-slate-200/60' : 'border-slate-200/40 opacity-60'
              }`}
            >
              {/* Bus Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-600 text-[22px]">directions_bus</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {bus.plateNumber}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${TYPE_COLORS[bus.busType]}`}>
                        {bus.busType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{bus.model}</div>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${bus.isActive ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-slate-300'}`} title={bus.isActive ? 'Actif' : 'Inactif'} />
              </div>

              {/* Bus Details */}
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Places</span>
                  <span className="text-sm font-bold text-slate-700">{bus.totalSeats} sièges</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Dernier trajet</span>
                  <span className="text-xs text-slate-500">{bus.lastTrip}</span>
                </div>

                {/* Features */}
                <div className="flex items-center gap-1.5 pt-1">
                  {FEATURE_ICONS.map((f) => (
                    <div
                      key={f.key}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        bus[f.key]
                          ? 'bg-teal-500/10 text-teal-500'
                          : 'bg-slate-100 text-slate-300'
                      }`}
                      title={f.label}
                    >
                      <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
                <button className="text-xs text-slate-400 hover:text-teal-600 font-semibold flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-[14px]">edit</span> Modifier
                </button>
                <button className="text-xs text-slate-400 hover:text-rose-500 font-semibold flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-[14px]">delete</span> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Add Bus Modal (Placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500">add_circle</span>
                Ajouter un bus
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Immatriculation</label>
                  <input type="text" placeholder="AA-0000-BJ" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Modèle</label>
                  <input type="text" placeholder="Mercedes Sprinter" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Type</label>
                  <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white">
                    <option value="VIP">VIP</option>
                    <option value="Confort">Confort</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Nombre de sièges</label>
                  <input type="number" placeholder="45" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Équipements</label>
                <div className="flex flex-wrap gap-2">
                  {FEATURE_ICONS.map((f) => (
                    <label key={f.key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs cursor-pointer hover:border-teal-300 transition-colors">
                      <input type="checkbox" className="accent-teal-500" />
                      <span className="material-symbols-outlined text-[14px] text-slate-500">{f.icon}</span>
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
                Annuler
              </button>
              <button className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
