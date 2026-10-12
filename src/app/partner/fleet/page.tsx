'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

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

const DEFAULT_BUSES: BusItem[] = [
  { id: '1', plateNumber: 'AA-1234-BJ', model: 'Mercedes Sprinter 516', busType: 'VIP', totalSeats: 20, hasAc: true, hasWifi: true, hasUsb: true, hasTv: true, hasWc: false, isActive: true, lastTrip: '12 Oct 2026' },
  { id: '2', plateNumber: 'AB-5678-BJ', model: 'Yutong ZK6122', busType: 'Confort', totalSeats: 45, hasAc: true, hasWifi: false, hasUsb: true, hasTv: false, hasWc: true, isActive: true, lastTrip: '11 Oct 2026' },
  { id: '3', plateNumber: 'AC-9012-BJ', model: 'Iveco Daily 70C', busType: 'Standard', totalSeats: 55, hasAc: false, hasWifi: false, hasUsb: false, hasTv: false, hasWc: false, isActive: true, lastTrip: '12 Oct 2026' },
  { id: '4', plateNumber: 'AD-3456-BJ', model: 'Mercedes Tourismo', busType: 'VIP', totalSeats: 40, hasAc: true, hasWifi: true, hasUsb: true, hasTv: true, hasWc: true, isActive: true, lastTrip: '10 Oct 2026' },
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
  const [buses, setBuses] = useState<BusItem[]>(DEFAULT_BUSES);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'VIP' | 'Confort' | 'Standard'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [newPlate, setNewPlate] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState<'VIP' | 'Confort' | 'Standard'>('Confort');
  const [newSeats, setNewSeats] = useState(45);
  const [hasAc, setHasAc] = useState(true);
  const [hasWifi, setHasWifi] = useState(true);
  const [hasUsb, setHasUsb] = useState(true);
  const [hasTv, setHasTv] = useState(false);
  const [hasWc, setHasWc] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadBuses();
  }, []);

  async function loadBuses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching buses:', error);
        return;
      }

      if (data && data.length > 0) {
        const mapped: BusItem[] = data.map((b: any) => ({
          id: b.id,
          plateNumber: b.plate_number,
          model: b.model,
          busType: b.bus_type || 'Confort',
          totalSeats: b.total_seats || 45,
          hasAc: !!b.has_ac,
          hasWifi: !!b.has_wifi,
          hasUsb: !!b.has_usb,
          hasTv: !!b.has_tv,
          hasWc: !!b.has_wc,
          isActive: b.is_active ?? true,
          lastTrip: 'Actif',
        }));
        setBuses(mapped);
      }
    } catch (err) {
      console.error('Failed to load buses from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBus(e: React.FormEvent) {
    e.preventDefault();
    if (!newPlate || !newModel) return;

    try {
      setIsSubmitting(true);
      // Fetch Confort Lines ID default
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', 'confort-lines')
        .single();

      const companyId = company?.id || '9cb670bc-6814-48e6-92ce-db1605611ee5';

      const { data, error } = await supabase.from('buses').insert({
        company_id: companyId,
        plate_number: newPlate,
        model: newModel,
        bus_type: newType,
        total_seats: Number(newSeats),
        has_ac: hasAc,
        has_wifi: hasWifi,
        has_usb: hasUsb,
        has_tv: hasTv,
        has_wc: hasWc,
        is_active: true,
      }).select().single();

      if (error) {
        alert(`Erreur d'ajout: ${error.message}`);
        return;
      }

      // Add to state
      if (data) {
        setBuses((prev) => [
          {
            id: data.id,
            plateNumber: data.plate_number,
            model: data.model,
            busType: data.bus_type,
            totalSeats: data.total_seats,
            hasAc: data.has_ac,
            hasWifi: data.has_wifi,
            hasUsb: data.has_usb,
            hasTv: data.has_tv,
            hasWc: data.has_wc,
            isActive: data.is_active,
            lastTrip: 'Nouveau',
          },
          ...prev,
        ]);
      }

      // Reset form
      setNewPlate('');
      setNewModel('');
      setShowAddModal(false);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteBus(id: string) {
    if (!confirm('Supprimer ce bus de la flotte ?')) return;
    try {
      await supabase.from('buses').delete().eq('id', id);
      setBuses((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  }

  const filteredBuses = filter === 'all' ? buses : buses.filter((b) => b.busType === filter);
  const activeBuses = buses.filter((b) => b.isActive).length;
  const totalSeats = buses.reduce((sum, b) => sum + b.totalSeats, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-[22px]">directions_bus</span>
            Flotte & Bus
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Gérez vos véhicules connectés à Supabase</p>
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
                <div className="text-2xl font-extrabold text-slate-900">{buses.length}</div>
                <div className="text-xs text-slate-400 font-medium">Total bus en flotte</div>
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
                <span className="material-symbols-outlined text-cyan-500 text-[20px]">airline_seat_recline_extra</span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{totalSeats}</div>
                <div className="text-xs text-slate-400 font-medium">Capacité totale sièges</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['all', 'VIP', 'Confort', 'Standard'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === type
                  ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20'
                  : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {type === 'all' ? 'Tous les bus' : type}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-medium">
            {filteredBuses.length} bus affiché{filteredBuses.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Bus Grid */}
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-500 text-3xl animate-spin">progress_activity</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuses.map((bus) => (
              <div
                key={bus.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all group"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {bus.plateNumber}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-800 mt-2">{bus.model}</h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${TYPE_COLORS[bus.busType]}`}>
                      {bus.busType}
                    </span>
                    <span
                      className={`w-2 h-2 rounded-full ${bus.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}
                    />
                  </div>
                </div>

                {/* Seats Info */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">event_seat</span>
                  <span className="font-semibold text-slate-700">{bus.totalSeats} places</span>
                  <span className="text-slate-300">•</span>
                  <span>{bus.lastTrip}</span>
                </div>

                {/* Features */}
                <div className="flex items-center gap-2 mb-4">
                  {FEATURE_ICONS.map((f) => {
                    const active = bus[f.key];
                    return (
                      <span
                        key={f.key}
                        title={f.label}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[14px] transition-colors ${
                          active
                            ? 'bg-teal-500/10 text-teal-600'
                            : 'bg-slate-100 text-slate-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">{f.icon}</span>
                      </span>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-medium text-slate-400">
                    {bus.isActive ? 'Opérationnel' : 'En maintenance'}
                  </span>
                  <button
                    onClick={() => handleDeleteBus(bus.id)}
                    className="text-xs text-slate-400 hover:text-rose-500 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Bus Modal */}
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
            <form onSubmit={handleAddBus} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Immatriculation</label>
                  <input
                    type="text"
                    required
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="AA-0000-BJ"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Modèle</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="Mercedes Tourismo"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Confort">Confort</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Nombre de sièges</label>
                  <input
                    type="number"
                    min="10"
                    max="80"
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-2 block">Équipements</label>
                <div className="flex flex-wrap gap-2">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs cursor-pointer hover:border-teal-300">
                    <input type="checkbox" checked={hasAc} onChange={(e) => setHasAc(e.target.checked)} className="accent-teal-500" />
                    <span>Climatisation</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs cursor-pointer hover:border-teal-300">
                    <input type="checkbox" checked={hasWifi} onChange={(e) => setHasWifi(e.target.checked)} className="accent-teal-500" />
                    <span>Wi-Fi</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs cursor-pointer hover:border-teal-300">
                    <input type="checkbox" checked={hasUsb} onChange={(e) => setHasUsb(e.target.checked)} className="accent-teal-500" />
                    <span>Prises USB</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs cursor-pointer hover:border-teal-300">
                    <input type="checkbox" checked={hasTv} onChange={(e) => setHasTv(e.target.checked)} className="accent-teal-500" />
                    <span>Écran TV</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs cursor-pointer hover:border-teal-300">
                    <input type="checkbox" checked={hasWc} onChange={(e) => setHasWc(e.target.checked)} className="accent-teal-500" />
                    <span>Toilettes (WC)</span>
                  </label>
                </div>
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
                  Enregistrer dans Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
