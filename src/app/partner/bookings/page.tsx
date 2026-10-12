'use client';

import React, { useState } from 'react';

// ── Types ──
interface BookingItem {
  id: string;
  reference: string;
  passengerName: string;
  passengerPhone: string;
  route: string;
  tripDate: string;
  departureTime: string;
  seatNumber: string;
  busType: 'VIP' | 'Confort' | 'Standard';
  amount: string;
  hasBaggage: boolean;
  isFlexible: boolean;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
}

// ── Données mock ──
const BOOKINGS: BookingItem[] = [
  { id: '1', reference: 'TK-A8F3K2', passengerName: 'Kévin Adjovi', passengerPhone: '+229 97 12 34 56', route: 'Cotonou → Parakou', tripDate: '12 Oct 2026', departureTime: '06:30', seatNumber: 'A3', busType: 'VIP', amount: '8 500 XOF', hasBaggage: true, isFlexible: false, status: 'confirmed', createdAt: '11 Oct, 22:45' },
  { id: '2', reference: 'TK-B1L9M4', passengerName: 'Fatou Adjaké', passengerPhone: '+229 96 78 90 12', route: 'Cotonou → Porto-Novo', tripDate: '12 Oct 2026', departureTime: '08:00', seatNumber: 'B7', busType: 'Standard', amount: '2 500 XOF', hasBaggage: false, isFlexible: true, status: 'confirmed', createdAt: '12 Oct, 06:15' },
  { id: '3', reference: 'TK-C3R7P6', passengerName: 'Marc Houngbo', passengerPhone: '+229 95 45 67 89', route: 'Bohicon → Cotonou', tripDate: '12 Oct 2026', departureTime: '07:00', seatNumber: 'C2', busType: 'Confort', amount: '5 000 XOF', hasBaggage: true, isFlexible: false, status: 'pending', createdAt: '12 Oct, 05:30' },
  { id: '4', reference: 'TK-D5T2N8', passengerName: 'Ines Kpossou', passengerPhone: '+229 67 23 45 67', route: 'Cotonou → Abomey', tripDate: '13 Oct 2026', departureTime: '09:30', seatNumber: 'A1', busType: 'Standard', amount: '4 000 XOF', hasBaggage: false, isFlexible: false, status: 'confirmed', createdAt: '12 Oct, 14:20' },
  { id: '5', reference: 'TK-E9W4Q1', passengerName: 'Paul Atchadé', passengerPhone: '+229 91 89 01 23', route: 'Parakou → Natitingou', tripDate: '13 Oct 2026', departureTime: '06:00', seatNumber: 'B4', busType: 'VIP', amount: '6 500 XOF', hasBaggage: true, isFlexible: true, status: 'cancelled', createdAt: '11 Oct, 18:10' },
  { id: '6', reference: 'TK-F2X6R3', passengerName: 'Amina Saka', passengerPhone: '+229 98 56 78 90', route: 'Cotonou → Ouidah', tripDate: '12 Oct 2026', departureTime: '10:00', seatNumber: 'C5', busType: 'Confort', amount: '1 500 XOF', hasBaggage: false, isFlexible: false, status: 'completed', createdAt: '11 Oct, 20:00' },
  { id: '7', reference: 'TK-G7Y1S5', passengerName: 'David Mehou', passengerPhone: '+229 94 34 56 78', route: 'Cotonou → Parakou', tripDate: '14 Oct 2026', departureTime: '06:30', seatNumber: 'A8', busType: 'VIP', amount: '8 500 XOF', hasBaggage: true, isFlexible: true, status: 'pending', createdAt: '12 Oct, 16:45' },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmée', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  pending: { label: 'En attente', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  cancelled: { label: 'Annulée', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  completed: { label: 'Terminée', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
};

const TYPE_BADGE = {
  VIP: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  Confort: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  Standard: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
};

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  const filteredBookings = BOOKINGS.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchSearch = searchQuery === '' || 
      b.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.route.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: BOOKINGS.length,
    confirmed: BOOKINGS.filter((b) => b.status === 'confirmed').length,
    pending: BOOKINGS.filter((b) => b.status === 'pending').length,
    revenue: BOOKINGS.filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + parseInt(b.amount.replace(/\D/g, '')), 0),
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-[22px]">confirmation_number</span>
            Réservations
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Suivez les réservations en temps réel</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">search</span>
            <input
              type="text"
              placeholder="Réf, passager, trajet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs w-56 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Exporter
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-teal-500 text-[20px]">confirmation_number</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">{stats.total}</div>
              <div className="text-[11px] text-slate-400 font-medium">Total réservations</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-500 text-[20px]">verified</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">{stats.confirmed}</div>
              <div className="text-[11px] text-slate-400 font-medium">Confirmées</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500 text-[20px]">hourglass_top</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">{stats.pending}</div>
              <div className="text-[11px] text-slate-400 font-medium">En attente</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-cyan-500 text-[20px]">payments</span>
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900">{stats.revenue.toLocaleString()} <span className="text-xs font-medium text-slate-400">XOF</span></div>
              <div className="text-[11px] text-slate-400 font-medium">Revenus associés</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {(['all', 'confirmed', 'pending', 'cancelled', 'completed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-teal-300'
              }`}
            >
              {s === 'all' ? 'Toutes' : STATUS_MAP[s].label}
            </button>
          ))}
          <span className="text-xs text-slate-400 ml-2">{filteredBookings.length} résultat(s)</span>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réf.</th>
                  <th className="text-left px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passager</th>
                  <th className="text-left px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trajet</th>
                  <th className="text-left px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Heure</th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Siège</th>
                  <th className="text-right px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Montant</th>
                  <th className="text-center px-3 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="text-center px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="border-t border-slate-100/80 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono font-bold text-teal-600">{b.reference}</span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs font-semibold text-slate-700">{b.passengerName}</div>
                      <div className="text-[10px] text-slate-400">{b.passengerPhone}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-slate-600">{b.route}</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${TYPE_BADGE[b.busType]}`}>
                        {b.busType}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-xs text-slate-600">{b.tripDate}</div>
                      <div className="text-[10px] text-slate-400">{b.departureTime}</div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-bold text-slate-600">{b.seatNumber}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-xs font-bold text-slate-700">{b.amount}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_MAP[b.status].color}`}>
                        {STATUS_MAP[b.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                        title="Détails"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500">receipt_long</span>
                {selectedBooking.reference}
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400">Passager</span>
                <span className="text-xs font-bold text-slate-700">{selectedBooking.passengerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400">Téléphone</span>
                <span className="text-xs text-slate-600">{selectedBooking.passengerPhone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400">Trajet</span>
                <span className="text-xs font-semibold text-slate-700">{selectedBooking.route}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400">Date & Heure</span>
                <span className="text-xs text-slate-600">{selectedBooking.tripDate} à {selectedBooking.departureTime}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400">Siège / Type</span>
                <span className="text-xs text-slate-600">{selectedBooking.seatNumber} — {selectedBooking.busType}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400">Montant</span>
                <span className="text-sm font-extrabold text-teal-600">{selectedBooking.amount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400">Bagages</span>
                <span className="text-xs text-slate-600">{selectedBooking.hasBaggage ? 'Oui' : 'Non'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-400">Flexible</span>
                <span className="text-xs text-slate-600">{selectedBooking.isFlexible ? 'Oui' : 'Non'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-xs text-slate-400">Statut</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_MAP[selectedBooking.status].color}`}>
                  {STATUS_MAP[selectedBooking.status].label}
                </span>
              </div>
            </div>
            <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setSelectedBooking(null)} className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
