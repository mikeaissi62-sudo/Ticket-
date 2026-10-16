'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createClient } from '@/lib/supabase/client';

interface CompanyRevenue {
  company: string;
  volume: number;
  commissionRate: number;
  commissionAmount: number;
  netCompany: number;
  status: string;
}

export default function AdminRevenuePage() {
  const [companyRevenues, setCompanyRevenues] = useState<CompanyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRevenueData() {
      try {
        const supabase = createClient();
        const { data: companies } = await supabase
          .from('companies')
          .select('id, name, commission_rate')
          .order('name');

        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            total_price,
            status,
            trip:trips (
              route:routes (
                company_id
              )
            )
          `)
          .neq('status', 'cancelled');

        const defaultCompanies = companies && companies.length > 0 
          ? companies 
          : [
              { id: '1', name: 'Confort Lines', commission_rate: 10 },
              { id: '2', name: 'Baobab Express', commission_rate: 10 },
              { id: '3', name: 'STM Voyageurs', commission_rate: 10 },
              { id: '4', name: 'ATT Transports', commission_rate: 10 },
            ];

        const aggregated: CompanyRevenue[] = defaultCompanies.map((comp: any) => {
          const compBookings = (bookings || []).filter((b: any) => b.trip?.route?.company_id === comp.id);
          const volume = compBookings.reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);
          const rate = comp.commission_rate || 10;
          const comm = Math.round(volume * (rate / 100));
          const net = volume - comm;

          return {
            company: comp.name,
            volume,
            commissionRate: rate,
            commissionAmount: comm,
            netCompany: net,
            status: volume > 0 ? 'À reverser' : 'Aucun flux',
          };
        });

        setCompanyRevenues(aggregated);
      } catch (err) {
        console.error('Erreur chargement revenus:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRevenueData();
  }, []);

  const totalGMV = companyRevenues.reduce((acc, c) => acc + c.volume, 0);
  const totalCommission = companyRevenues.reduce((acc, c) => acc + c.commissionAmount, 0);
  const totalPayout = companyRevenues.reduce((acc, c) => acc + c.netCompany, 0);

  function handleExportCSV() {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Compagnie,Volume d Affaires (FCFA),Taux (%),Commission Ticket+ (FCFA),Net Compagnie (FCFA),Statut\n' +
      companyRevenues
        .map((c) => `${c.company},${c.volume},${c.commissionRate}%,${c.commissionAmount},${c.netCompany},${c.status}`)
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ticketplus_revenus_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Revenus & Commissions Plateforme"
        subtitle="Ventilation des encaissements Mobile Money (MTN/Moov) et reversements compagnies"
      />

      <main className="p-8 space-y-8 max-w-7xl">
        {/* Summary Financial Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Encaissements Bruts (GMV)</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalGMV.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">FCFA</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">100% collecté via Mobile Money & Cartes</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-emerald-600 font-semibold uppercase">Commissions Ticket+ Nettes</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {totalCommission.toLocaleString('fr-FR')} <span className="text-xs font-bold text-emerald-400">FCFA</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Taux moyen négocié : 10% par billet</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-blue-600 font-semibold uppercase">Reversements aux Compagnies</span>
            <div className="text-2xl font-black text-blue-900 mt-1">
              {totalPayout.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">FCFA</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Règlement hebdomadaire par virement / MoMo Pro</p>
          </div>
        </div>

        {/* Revenue Table by Company */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Décompte par Compagnie Partenaire</h2>
              <p className="text-xs text-slate-500">Période courante — Clôture hebdomadaire</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] text-emerald-600">file_download</span>
              <span>Exporter CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Compagnie</th>
                  <th className="py-3 px-4 text-right">Volume Brut (FCFA)</th>
                  <th className="py-3 px-4 text-center">Taux Comm.</th>
                  <th className="py-3 px-4 text-right">Commission Ticket+</th>
                  <th className="py-3 px-4 text-right">Net à Reverser</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {companyRevenues.map((c) => (
                  <tr key={c.company} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.company}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                      {c.volume.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-600">{c.commissionRate}%</td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      +{c.commissionAmount.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {c.netCompany.toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'Réglé'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
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
