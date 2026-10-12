'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

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

const DEFAULT_BOOKINGS: BookingItem[] = [
  { id: '1', reference: 'TK-A8F3K2', passengerName: 'Kévin Adjovi', passengerPhone: '+229 01 64 28 90 00', route: 'Cotonou → Parakou', tripDate: '12 Oct 2026', departureTime: '06:30', seatNumber: '12A', busType: 'VIP', amount: '8 500 XOF', hasBaggage: true, isFlexible: false, status: 'confirmed', createdAt: '12 Oct, 08:30' },
  { id: '2', reference: 'TK-B1L9M4', passengerName: 'Fatou Adjaké', passengerPhone: '+229 01 65 11 22 33', route: 'Cotonou → Porto-Novo', tripDate: '12 Oct 2026', departureTime: '08:00', seatNumber: '14B', busType: 'Standard', amount: '8 500 XOF', hasBaggage: false, isFlexible: true, status: 'confirmed', createdAt: '12 Oct, 09:15' },
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
  const [bookings, setBookings] = useState<BookingItem[]>(DEFAULT_BOOKINGS);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'cancelled' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          passenger_first_name,
          passenger_last_name,
          passenger_phone,
          status,
          total_price,
          has_baggage,
          is_flexible,
          created_at,
          trips (
            trip_date,
            departure_time,
            routes (
              name
            ),
            buses (
              bus_type
            )
          ),
          seats (
            seat_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }

      if (data && data.length > 0) {
        const mapped: BookingItem[] = data.map((b: any) => {
          const trip = b.trips;
          const route = trip?.routes?.name || 'Cotonou → Parakou';
          const busType = trip?.buses?.bus_type || 'Confort';
          const seat = b.seats?.seat_number || 'Libre';

          return {
            id: b.id,
            reference: b.booking_reference,
            passengerName: `${b.passenger_first_name} ${b.passenger_last_name}`.trim(),
            passengerPhone: b.passenger_phone,
            route,
            tripDate: trip?.trip_date || 'Aujourd\'hui',
            departureTime: trip?.departure_time?.slice(0, 5) || '07:00',
            seatNumber: seat,
            busType,
            amount: `${Number(b.total_price || 0).toLocaleString('fr-FR')} XOF`,
            hasBaggage: !!b.has_baggage,
            isFlexible: !!b.is_flexible,
            status: b.status || 'confirmed',
            createdAt: new Date(b.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
        });
        setBookings(mapped);
      }
    } catch (err) {
      console.error('Failed to load bookings from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(bookingId: string) {
    try {
      await supabase
        .from('bookings')
        .update({ status: 'completed' })
        .eq('id', bookingId);

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'completed' } : b))
      );
      if (selectedBooking?.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: 'completed' } : null));
      }
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  }

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchSearch =
      searchQuery === '' ||
      b.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.route.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-[22px]">confirmation_number</span>
            Réservations & Embarquement
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Suivez les billets et validez les montées en gare</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadBookings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            Actualiser
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher par référence, nom ou trajet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === status
                    ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20'
                    : 'bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {status === 'all' ? 'Toutes' : STATUS_MAP[status]?.label || status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          {loading ? (
            <div className="min-h-[200px] flex items-center justify-center">
              <span className="material-symbols-outlined text-teal-500 text-3xl animate-spin">progress_activity</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Réf. Billet</th>
                    <th className="px-4 py-4">Passager</th>
                    <th className="px-4 py-4">Itinéraire</th>
                    <th className="px-4 py-4">Départ</th>
                    <th className="px-4 py-4">Siège</th>
                    <th className="px-4 py-4">Montant</th>
                    <th className="px-4 py-4">Statut</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => {
                    const statusInfo = STATUS_MAP[b.status] || STATUS_MAP.confirmed;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded text-xs">
                            {b.reference}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-slate-900 text-sm">{b.passengerName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{b.passengerPhone}</div>
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-700">{b.route}</td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-800">{b.tripDate}</div>
                          <div className="text-[11px] text-slate-400">{b.departureTime}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-800 text-xs">
                            {b.seatNumber}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-extrabold text-slate-900">{b.amount}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleCheckIn(b.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition-all shadow-xs"
                                title="Valider l'embarquement"
                              >
                                Valider
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="text-xs text-slate-400 hover:text-teal-600 font-semibold transition-colors"
                            >
                              Détails
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-200 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-sm font-extrabold text-teal-600">{selectedBooking.reference}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Détail Réservation</h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Passager</span>
                <span className="font-bold text-slate-800">{selectedBooking.passengerName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Téléphone</span>
                <span className="font-mono font-medium text-slate-800">{selectedBooking.passengerPhone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Itinéraire</span>
                <span className="font-bold text-slate-800">{selectedBooking.route}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Départ</span>
                <span className="font-medium text-slate-800">{selectedBooking.tripDate} à {selectedBooking.departureTime}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Siège</span>
                <span className="font-bold text-slate-800">{selectedBooking.seatNumber}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-400">Total réglé</span>
                <span className="font-extrabold text-emerald-600 text-sm">{selectedBooking.amount}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button onClick={() => setSelectedBooking(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                Fermer
              </button>
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={() => handleCheckIn(selectedBooking.id)}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                  Confirmer embarquement
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
