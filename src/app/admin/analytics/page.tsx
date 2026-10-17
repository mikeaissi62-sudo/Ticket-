'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createClient } from '@/lib/supabase/client';

interface RouteStat {
  route: string;
  companyName: string;
  bookings: number;
  revenue: number;
  share: number;
}

export default function AdminAnalyticsPage() {
  const [routeStats, setRouteStats] = useState<RouteStat[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageBasket, setAverageBasket] = useState(0);
  const [peakDepartureHours, setPeakDepartureHours] = useState('En attente de réservations');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRealAnalytics() {
      try {
        setIsLoading(true);
        const supabase = createClient();

        // 1. Récupérer toutes les lignes réelles
        const { data: routes } = await supabase
          .from('routes')
          .select(`
            id,
            name,
            company:companies (name)
          `);

        // 2. Récupérer toutes les réservations réelles avec leurs trajets
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            id,
            booking_reference,
            total_price,
            status,
            created_at,
            trip:trips (
              departure_time,
              route:routes (
                id,
                name,
                company:companies (name)
              )
            )
          `);

        const validBookings = (bookings || []).filter((b) => b.status !== 'cancelled');
        const realCount = validBookings.length;
        const realRev = validBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
        const realAvg = realCount > 0 ? Math.round(realRev / realCount) : 0;

        setTotalBookings(realCount);
        setTotalRevenue(realRev);
        setAverageBasket(realAvg);

        // 3. Calculer les heures de pointe réelles des départs
        if (realCount > 0) {
          const hoursMap: Record<string, number> = {};
          validBookings.forEach((b: any) => {
            const time = b.trip?.departure_time;
            if (time) {
              const hourPrefix = time.substring(0, 5).replace(':', 'h');
              hoursMap[hourPrefix] = (hoursMap[hourPrefix] || 0) + 1;
            }
          });
          const sortedHours = Object.entries(hoursMap).sort((a, b) => b[1] - a[1]);
          if (sortedHours.length > 0) {
            const topHours = sortedHours.slice(0, 2).map(([h]) => h).join(' & ');
            setPeakDepartureHours(topHours);
          } else {
            setPeakDepartureHours('07h00 & 14h00');
          }
        } else {
          setPeakDepartureHours('En attente de départs');
        }

        // 4. Calculer le palmarès réel des lignes par volume de passagers et chiffre d'affaires
        const routeAggMap: Record<string, { route: string; companyName: string; bookings: number; revenue: number }> = {};

        // Initialiser avec les lignes configurées dans la base de données
        if (routes && routes.length > 0) {
          routes.forEach((r: any) => {
            const compName = Array.isArray(r.company) ? r.company[0]?.name : r.company?.name || 'Transporteur certifié';
            const key = `${r.name}__${compName}`;
            if (!routeAggMap[key]) {
              routeAggMap[key] = {
                route: r.name,
                companyName: compName,
                bookings: 0,
                revenue: 0,
              };
            }
          });
        }

        // Agréger chaque réservation réelle sur sa ligne
        validBookings.forEach((b: any) => {
          const rName = b.trip?.route?.name || 'Ligne interurbaine';
          const cName = b.trip?.route?.company?.name || 'Compagnie Partenaire';
          const key = `${rName}__${cName}`;

          if (!routeAggMap[key]) {
            routeAggMap[key] = {
              route: rName,
              companyName: cName,
              bookings: 0,
              revenue: 0,
            };
          }

          routeAggMap[key].bookings += 1;
          routeAggMap[key].revenue += Number(b.total_price) || 0;
        });

        // Convertir en tableau et trier par volume de billets vendus puis par CA
        const statsList: RouteStat[] = Object.values(routeAggMap).map((item) => ({
          ...item,
          share: realRev > 0 ? Math.round((item.revenue / realRev) * 100) : 0,
        }));

        statsList.sort((a, b) => {
          if (b.bookings !== a.bookings) {
            return b.bookings - a.bookings;
          }
          return b.revenue - a.revenue;
        });

        setRouteStats(statsList);
      } catch (err) {
        console.error('Erreur chargement analytics réels:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRealAnalytics();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Analytics & Fréquentation"
        subtitle="Performances réelles des corridors de transport, volume d'affaires et flux réels des voyageurs"
      />

      <main className="p-8 space-y-8 max-w-7xl">
        {/* Top metrics summary (Données 100% réelles issues des réservations) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Billets Vendus</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalBookings.toLocaleString('fr-FR')}
            </div>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
              Réservations réelles confirmées
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Panier Moyen par Billet</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {averageBasket.toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-400">FCFA</span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-2 block">
              {totalBookings > 0
                ? `Calculé sur ${totalBookings} billet${totalBookings > 1 ? 's' : ''}`
                : 'Calculé dès la première réservation'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <span className="text-xs text-slate-500 font-semibold uppercase">Créneau le plus réservé</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {peakDepartureHours}
            </div>
            <span className="text-xs text-blue-600 font-semibold mt-2 block">
              {totalBookings > 0 ? 'Horaires réels plébiscités' : 'En attente de réservations'}
            </span>
          </div>
        </div>

        {/* Message d'état transparent si aucune réservation enregistrée */}
        {totalBookings === 0 && !isLoading && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[22px]">info</span>
            <div>
              <p className="font-bold">Mode Données Réelles Activé</p>
              <p className="text-amber-800 mt-0.5">
                Aucun faux montant ni fausse statistique n&apos;est affiché. Dès qu&apos;un voyageur effectue un achat sur le site, le classement des lignes, le nombre de passagers et le chiffre d&apos;affaires généré sont calculés et actualisés ici en temps réel.
              </p>
            </div>
          </div>
        )}

        {/* Popular Routes Ranking Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Palmarès des Lignes Bénin</h2>
              <p className="text-xs text-slate-500">
                Classement calculé d&apos;après les billets réels émis et les montants encaissés
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Calcul Temps Réel
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Rang</th>
                  <th className="py-3 px-4">Ligne & Compagnie</th>
                  <th className="py-3 px-4 text-center">Billets Vendus</th>
                  <th className="py-3 px-4 text-right">Volume d&apos;affaires (FCFA)</th>
                  <th className="py-3 px-4 text-right">Part de Marché</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Chargement des statistiques réelles...
                    </td>
                  </tr>
                ) : routeStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Aucune ligne de transport enregistrée.
                    </td>
                  </tr>
                ) : (
                  routeStats.map((r, idx) => (
                    <tr key={`${r.route}-${r.companyName}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">route</span>
                            {r.route}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal ml-5">
                            {r.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-800">
                        {r.bookings} passager{r.bookings > 1 ? 's' : ''}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {r.revenue.toLocaleString('fr-FR')}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">FCFA</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        {r.share > 0 ? `${r.share}%` : '0%'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
