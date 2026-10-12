'use client';

import React from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminAnalyticsPage() {
  const popularRoutes = [
    { route: 'Cotonou ➔ Parakou', bookings: 218, revenue: 1417000, trend: '+14%' },
    { route: 'Cotonou ➔ Natitingou', bookings: 142, revenue: 1349000, trend: '+22%' },
    { route: 'Cotonou ➔ Bohicon', bookings: 98, revenue: 392000, trend: '+5%' },
    { route: 'Parakou ➔ Cotonou', bookings: 184, revenue: 1196000, trend: '+11%' },
    { route: 'Cotonou ➔ Djougou', bookings: 66, revenue: 561000, trend: '+18%' },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Analytics & Fréquentation"
        subtitle="Performances des corridors de transport, taux de conversion et flux de voyageurs"
      />

      <main className="p-8 space-y-8 max-w-7xl">
        {/* Top metrics summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Recherches hebdomadaires</span>
            <div className="text-2xl font-black text-slate-900 mt-1">4 820</div>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              +28% depuis le lancement
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Taux de conversion global</span>
            <div className="text-2xl font-black text-slate-900 mt-1">11.4%</div>
            <span className="text-xs text-slate-400 font-medium mt-2 block">
              Recherches aboutissant à un e-billet
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Heure de pointe des départs</span>
            <div className="text-2xl font-black text-slate-900 mt-1">07h00 & 14h00</div>
            <span className="text-xs text-blue-600 font-semibold mt-2 block">
              Créneaux matinaux les plus rentables
            </span>
          </div>
        </div>

        {/* Popular Routes Ranking Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Palmarès des Lignes Bénin</h2>
              <p className="text-xs text-slate-500">Classement par volume de passagers et chiffre d'affaires généré</p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              Temps Réel
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Rang</th>
                  <th className="py-3 px-4">Ligne de Transport</th>
                  <th className="py-3 px-4 text-center">Billets Vendus</th>
                  <th className="py-3 px-4 text-right">Volume d'affaires (FCFA)</th>
                  <th className="py-3 px-4 text-right">Croissance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {popularRoutes.map((r, idx) => (
                  <tr key={r.route} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">route</span>
                      {r.route}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-slate-800">{r.bookings} passagers</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {r.revenue.toLocaleString('fr-FR')} <span className="text-[10px] text-slate-400 font-normal">FCFA</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">{r.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
