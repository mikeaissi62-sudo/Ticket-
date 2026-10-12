'use client';

import React, { useState } from 'react';

// ── Types ──
interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
  commission: number;
}

interface RoutePerformance {
  route: string;
  revenue: number;
  bookings: number;
  occupancyRate: number;
  avgPrice: number;
}

interface PayoutItem {
  id: string;
  date: string;
  amount: string;
  method: string;
  status: 'completed' | 'pending' | 'processing';
  reference: string;
}

// ── Données mock ──
const MONTHLY_DATA: MonthlyRevenue[] = [
  { month: 'Mai', revenue: 1850000, bookings: 312, commission: 185000 },
  { month: 'Juin', revenue: 2100000, bookings: 356, commission: 210000 },
  { month: 'Juil', revenue: 2650000, bookings: 428, commission: 265000 },
  { month: 'Août', revenue: 3200000, bookings: 510, commission: 320000 },
  { month: 'Sep', revenue: 2800000, bookings: 445, commission: 280000 },
  { month: 'Oct', revenue: 2400000, bookings: 380, commission: 240000 },
];

const ROUTE_PERFORMANCE: RoutePerformance[] = [
  { route: 'Cotonou → Parakou', revenue: 1870000, bookings: 220, occupancyRate: 85, avgPrice: 8500 },
  { route: 'Cotonou → Porto-Novo', revenue: 625000, bookings: 250, occupancyRate: 72, avgPrice: 2500 },
  { route: 'Bohicon → Cotonou', revenue: 950000, bookings: 190, occupancyRate: 68, avgPrice: 5000 },
  { route: 'Cotonou → Abomey', revenue: 560000, bookings: 140, occupancyRate: 55, avgPrice: 4000 },
  { route: 'Parakou → Natitingou', revenue: 390000, bookings: 60, occupancyRate: 45, avgPrice: 6500 },
  { route: 'Cotonou → Ouidah', revenue: 225000, bookings: 150, occupancyRate: 62, avgPrice: 1500 },
];

const PAYOUTS: PayoutItem[] = [
  { id: '1', date: '10 Oct 2026', amount: '1 920 000 XOF', method: 'MTN MoMo', status: 'completed', reference: 'PAY-2026-1010' },
  { id: '2', date: '01 Oct 2026', amount: '2 240 000 XOF', method: 'Virement Bancaire', status: 'completed', reference: 'PAY-2026-1001' },
  { id: '3', date: '20 Sep 2026', amount: '1 680 000 XOF', method: 'MTN MoMo', status: 'completed', reference: 'PAY-2026-0920' },
  { id: '4', date: '15 Oct 2026', amount: '960 000 XOF', method: 'Moov Money', status: 'processing', reference: 'PAY-2026-1015' },
  { id: '5', date: '20 Oct 2026', amount: '1 200 000 XOF', method: 'MTN MoMo', status: 'pending', reference: 'PAY-2026-1020' },
];

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
  completed: { label: 'Effectué', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  processing: { label: 'En cours', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  pending: { label: 'Planifié', color: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
};

export default function RevenuePage() {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const totalRevenue = MONTHLY_DATA.reduce((sum, m) => sum + m.revenue, 0);
  const totalBookings = MONTHLY_DATA.reduce((sum, m) => sum + m.bookings, 0);
  const totalCommission = MONTHLY_DATA.reduce((sum, m) => sum + m.commission, 0);
  const netRevenue = totalRevenue - totalCommission;
  const maxRevenue = Math.max(...MONTHLY_DATA.map((m) => m.revenue));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-500 text-[22px]">trending_up</span>
            Revenus & Statistiques
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Analysez vos performances financières</p>
        </div>
        <div className="flex items-center gap-2">
          {(['month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-teal-500 text-white shadow-sm shadow-teal-500/20'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année'}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-teal-500 text-[20px]">account_balance_wallet</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">↑ 14%</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{(totalRevenue / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Revenus bruts (XOF)</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500 text-[20px]">savings</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">↑ 12%</span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{(netRevenue / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Revenus nets (XOF)</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-cyan-500 text-[20px]">confirmation_number</span>
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalBookings.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Réservations totales</div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-rose-500 text-[20px]">percent</span>
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{(totalCommission / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Commission plateforme (10%)</div>
          </div>
        </div>

        {/* Revenue Chart (CSS Bar Chart) */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-500 text-[18px]">bar_chart</span>
              Évolution des revenus
            </h2>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-teal-500"></span> Revenus
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-400"></span> Commission
              </span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {MONTHLY_DATA.map((m) => {
              const height = (m.revenue / maxRevenue) * 100;
              const commHeight = (m.commission / maxRevenue) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-bold text-slate-500">{(m.revenue / 1000000).toFixed(1)}M</div>
                  <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '160px' }}>
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        className="w-5 bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md transition-all hover:from-teal-700 hover:to-teal-500"
                        style={{ height: `${height}%` }}
                        title={`${m.revenue.toLocaleString()} XOF`}
                      />
                      <div
                        className="w-5 bg-gradient-to-t from-rose-500 to-rose-300 rounded-t-md transition-all hover:from-rose-600 hover:to-rose-400"
                        style={{ height: `${commHeight}%` }}
                        title={`${m.commission.toLocaleString()} XOF`}
                      />
                    </div>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Route Performance */}
          <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-500 text-[18px]">leaderboard</span>
                Performance par trajet
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="text-left px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trajet</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenus</th>
                    <th className="text-right px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Réservations</th>
                    <th className="text-center px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Occupation</th>
                    <th className="text-right px-5 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prix moy.</th>
                  </tr>
                </thead>
                <tbody>
                  {ROUTE_PERFORMANCE.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100/80 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold text-slate-700">{r.route}</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-xs font-bold text-slate-700">{(r.revenue / 1000).toFixed(0)}k XOF</span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-xs text-slate-600">{r.bookings}</span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                r.occupancyRate >= 80 ? 'bg-emerald-500' : r.occupancyRate >= 60 ? 'bg-teal-500' : 'bg-amber-400'
                              }`}
                              style={{ width: `${r.occupancyRate}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{r.occupancyRate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs text-slate-500">{r.avgPrice.toLocaleString()} XOF</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payouts */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-500 text-[18px]">account_balance</span>
                Historique des versements
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {PAYOUTS.map((payout) => (
                <div key={payout.id} className="px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{payout.amount}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PAYOUT_STATUS[payout.status].color}`}>
                      {PAYOUT_STATUS[payout.status].label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{payout.date}</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">credit_card</span>
                      {payout.method}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5 font-mono">{payout.reference}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
