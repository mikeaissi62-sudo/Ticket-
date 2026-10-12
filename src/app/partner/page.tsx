'use client';

import React, { useState } from 'react';

// ── Types pour les données mock ──
interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

interface RecentBooking {
  id: string;
  reference: string;
  passenger: string;
  route: string;
  date: string;
  time: string;
  amount: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface UpcomingTrip {
  id: string;
  route: string;
  departure: string;
  bus: string;
  seatsBooked: number;
  totalSeats: number;
  status: 'scheduled' | 'boarding';
}

// ── Données mock ──
const STATS: StatCard[] = [
  { label: 'Réservations aujourd\'hui', value: '47', change: '+12%', changeType: 'up', icon: 'confirmation_number', color: 'teal' },
  { label: 'Revenus du mois', value: '2.4M XOF', change: '+8.3%', changeType: 'up', icon: 'payments', color: 'emerald' },
  { label: 'Taux d\'occupation', value: '78%', change: '+5%', changeType: 'up', icon: 'event_seat', color: 'cyan' },
  { label: 'Bus actifs', value: '12', change: '0', changeType: 'neutral', icon: 'directions_bus', color: 'slate' },
];

const RECENT_BOOKINGS: RecentBooking[] = [
  { id: '1', reference: 'TK-A8F3K2', passenger: 'Kévin Adjovi', route: 'Cotonou → Parakou', date: '12 Oct', time: '06:30', amount: '8 500 XOF', status: 'confirmed' },
  { id: '2', reference: 'TK-B1L9M4', passenger: 'Fatou Adjaké', route: 'Cotonou → Porto-Novo', date: '12 Oct', time: '08:00', amount: '2 500 XOF', status: 'confirmed' },
  { id: '3', reference: 'TK-C3R7P6', passenger: 'Marc Houngbo', route: 'Bohicon → Cotonou', date: '12 Oct', time: '07:00', amount: '5 000 XOF', status: 'pending' },
  { id: '4', reference: 'TK-D5T2N8', passenger: 'Ines Kpossou', route: 'Cotonou → Abomey', date: '13 Oct', time: '09:30', amount: '4 000 XOF', status: 'confirmed' },
  { id: '5', reference: 'TK-E9W4Q1', passenger: 'Paul Atchadé', route: 'Parakou → Natitingou', date: '13 Oct', time: '06:00', amount: '6 500 XOF', status: 'cancelled' },
];

const UPCOMING_TRIPS: UpcomingTrip[] = [
  { id: '1', route: 'Cotonou → Parakou', departure: '12 Oct, 06:30', bus: 'VIP-01 (Mercedes)', seatsBooked: 32, totalSeats: 40, status: 'boarding' },
  { id: '2', route: 'Cotonou → Porto-Novo', departure: '12 Oct, 08:00', bus: 'STD-03 (Iveco)', seatsBooked: 18, totalSeats: 55, status: 'scheduled' },
  { id: '3', route: 'Bohicon → Cotonou', departure: '12 Oct, 07:00', bus: 'CNF-02 (Yutong)', seatsBooked: 27, totalSeats: 45, status: 'scheduled' },
  { id: '4', route: 'Cotonou → Abomey', departure: '13 Oct, 09:30', bus: 'STD-04 (Iveco)', seatsBooked: 8, totalSeats: 55, status: 'scheduled' },
];

const STATUS_COLORS = {
  confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  boarding: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  scheduled: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmée',
  pending: 'En attente',
  cancelled: 'Annulée',
  boarding: 'Embarquement',
  scheduled: 'Programmé',
};

export default function PartnerDashboard() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'teal': return { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20', icon: 'text-teal-500' };
      case 'emerald': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', icon: 'text-emerald-500' };
      case 'cyan': return { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20', icon: 'text-cyan-500' };
      default: return { bg: 'bg-slate-500/10', text: 'text-slate-500', border: 'border-slate-500/20', icon: 'text-slate-400' };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-[22px]">space_dashboard</span>
            Tableau de bord
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Vue d&apos;ensemble de votre activité</p>
        </div>
        <div className="flex items-center gap-2">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {p === 'today' ? "Aujourd'hui" : p === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const c = getColorClasses(stat.color);
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[20px] ${c.icon}`}>{stat.icon}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    stat.changeType === 'up' ? 'bg-emerald-50 text-emerald-600' :
                    stat.changeType === 'down' ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {stat.changeType === 'up' && '↑ '}{stat.changeType === 'down' && '↓ '}{stat.change}
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Recent Bookings */}
          <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-500 text-[18px]">receipt_long</span>
                <h2 className="text-sm font-bold text-slate-900">Dernières réservations</h2>
              </div>
              <a href="/partner/bookings" className="text-xs text-teal-500 hover:text-teal-600 font-semibold flex items-center gap-1">
                Tout voir <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="text-left px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réf.</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Passager</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trajet</th>
                    <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Montant</th>
                    <th className="text-center px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_BOOKINGS.map((b) => (
                    <tr key={b.id} className="border-t border-slate-100/80 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono font-bold text-teal-600">{b.reference}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-semibold text-slate-700">{b.passenger}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-slate-500">{b.route}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-slate-400">{b.date}, {b.time}</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-xs font-bold text-slate-700">{b.amount}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_COLORS[b.status]}`}>
                          {STATUS_LABELS[b.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Trips */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-500 text-[18px]">departure_board</span>
                <h2 className="text-sm font-bold text-slate-900">Prochains départs</h2>
              </div>
              <a href="/partner/schedules" className="text-xs text-teal-500 hover:text-teal-600 font-semibold flex items-center gap-1">
                Horaires <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            </div>
            <div className="divide-y divide-slate-100">
              {UPCOMING_TRIPS.map((trip) => {
                const occupancy = Math.round((trip.seatsBooked / trip.totalSeats) * 100);
                return (
                  <div key={trip.id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">{trip.route}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[trip.status]}`}>
                        {STATUS_LABELS[trip.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">schedule</span>
                        {trip.departure}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">directions_bus</span>
                        {trip.bus}
                      </span>
                    </div>
                    {/* Occupation bar */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            occupancy >= 80 ? 'bg-emerald-500' : occupancy >= 50 ? 'bg-teal-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${occupancy}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 shrink-0">
                        {trip.seatsBooked}/{trip.totalSeats} <span className="text-slate-400">({occupancy}%)</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-[18px]">bolt</span>
            Actions rapides
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Ajouter un bus', icon: 'add_circle', href: '/partner/fleet', color: 'teal' },
              { label: 'Nouveau trajet', icon: 'add_road', href: '/partner/schedules', color: 'cyan' },
              { label: 'Voir les réservations', icon: 'list_alt', href: '/partner/bookings', color: 'emerald' },
              { label: 'Mes revenus', icon: 'account_balance', href: '/partner/revenue', color: 'indigo' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 hover:border-teal-500/30 hover:bg-teal-50/30 transition-all group"
              >
                <div className={`w-9 h-9 rounded-lg bg-${action.color}-500/10 flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-${action.color}-500 text-[20px]`}>{action.icon}</span>
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-teal-700 transition-colors">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
