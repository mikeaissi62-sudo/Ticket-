'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface RouteData {
  id: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  price: number;
  departures: number;
  features: string[];
  company: string;
  companySlug: string;
}

// Fallback data used when Supabase data isn't available yet
const FALLBACK_ROUTES: RouteData[] = [
  { id: 'f1', from: 'Cotonou', to: 'Parakou', distance: '420 km', duration: '6h30', price: 6500, departures: 4, features: ['Climatisé', 'WiFi', 'USB'], company: 'Confort Lines', companySlug: 'confort-lines' },
  { id: 'f2', from: 'Cotonou', to: 'Natitingou', distance: '560 km', duration: '9h45', price: 9000, departures: 2, features: ['Climatisé', 'Collation', 'VIP'], company: 'Confort Lines', companySlug: 'confort-lines' },
  { id: 'f3', from: 'Cotonou', to: 'Bohicon', distance: '120 km', duration: '2h15', price: 3500, departures: 6, features: ['Climatisé', 'Express'], company: 'Confort Lines', companySlug: 'confort-lines' },
  { id: 'f4', from: 'Cotonou', to: 'Porto-Novo', distance: '30 km', duration: '0h45', price: 1500, departures: 8, features: ['Express', 'Navette'], company: 'Confort Lines', companySlug: 'confort-lines' },
  { id: 'f5', from: 'Cotonou', to: 'Parakou', distance: '420 km', duration: '6h30', price: 5200, departures: 3, features: ['Ventilation', 'TV'], company: 'STM Voyageurs', companySlug: 'stm-voyageurs' },
  { id: 'f6', from: 'Cotonou', to: 'Bohicon', distance: '120 km', duration: '2h15', price: 2800, departures: 5, features: ['Économique'], company: 'STM Voyageurs', companySlug: 'stm-voyageurs' },
];

const companyColors: Record<string, string> = {
  'Confort Lines': '#0d9488',
  'Baobab Express': '#f59e0b',
  'ATT Transports': '#3b82f6',
  'STM Voyageurs': '#8b5cf6',
};

export default function TarifsEtLignesPage() {
  const locale = useLocale();
  const [routes, setRoutes] = useState<RouteData[]>(FALLBACK_ROUTES);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCity, setFilterCity] = useState('Toutes');
  const [filterCompany, setFilterCompany] = useState('Toutes');
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departures'>('price');

  const fetchRoutes = useCallback(async () => {
    try {
      const res = await fetch('/api/routes');
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          // Map features to user-friendly labels
          const featureLabels: Record<string, string> = {
            ac: 'Climatisé', wifi: 'WiFi', usb: 'USB', vip: 'VIP',
            tv: 'TV', collation: 'Collation', express: 'Express',
            navette: 'Navette', economique: 'Économique',
          };
          const mapped = data.routes.map((r: any) => ({
            ...r,
            features: (r.features || []).map((f: string) => featureLabels[f] || f),
          }));
          setRoutes(mapped);
        }
      }
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  // Dynamic cities and companies from data
  const cities = React.useMemo(() => {
    const set = new Set<string>();
    routes.forEach(r => { set.add(r.from); set.add(r.to); });
    return ['Toutes', ...Array.from(set).sort()];
  }, [routes]);

  const companies = React.useMemo(() => {
    const set = new Set<string>();
    routes.forEach(r => set.add(r.company));
    return ['Toutes', ...Array.from(set).sort()];
  }, [routes]);

  const filtered = routes
    .filter(r => filterCity === 'Toutes' || r.from === filterCity || r.to === filterCity)
    .filter(r => filterCompany === 'Toutes' || r.company === filterCompany)
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'departures') return b.departures - a.departures;
      return a.duration.localeCompare(b.duration);
    });

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="px-4 sm:px-6 pb-6 pt-4">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${locale}`} className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors">Accueil</Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[13px] text-[#0F172A] font-semibold">Tarifs & Lignes</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight">
            Grille Tarifaire & Lignes
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1 max-w-2xl">
            Tarifs officiels de nos compagnies partenaires — sans frais cachés ni commission. Consultez tous les trajets et réservez en un clic.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="max-w-[1140px] mx-auto">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 flex flex-col gap-4">
            {/* Company filter */}
            <div>
              <label className="text-[11px] text-[#94A3B8] font-semibold uppercase tracking-wider block mb-1.5">Filtrer par compagnie</label>
              <div className="flex flex-wrap gap-1.5">
                {companies.map(company => (
                  <button
                    key={company}
                    onClick={() => setFilterCompany(company)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-1.5 ${
                      filterCompany === company
                        ? 'bg-[#0F172A] text-white shadow-sm'
                        : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                    }`}
                  >
                    {company !== 'Toutes' && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: companyColors[company] || '#64748B' }}></span>
                    )}
                    {company}
                  </button>
                ))}
              </div>
            </div>
            {/* City + Sort row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <label className="text-[11px] text-[#94A3B8] font-semibold uppercase tracking-wider block mb-1.5">Filtrer par ville</label>
                <div className="flex flex-wrap gap-1.5">
                  {cities.map(city => (
                    <button
                      key={city}
                      onClick={() => setFilterCity(city)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                        filterCity === city
                          ? 'bg-[#0F172A] text-white shadow-sm'
                          : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-[#94A3B8] font-semibold uppercase tracking-wider block mb-1.5">Trier par</label>
                <div className="flex gap-1.5">
                  {([['price', 'Prix'], ['departures', 'Fréquence'], ['duration', 'Durée']] as const).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSortBy(key)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                        sortBy === key
                          ? 'bg-[#10B981] text-white shadow-sm'
                          : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Table */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-[1140px] mx-auto">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-[#10B981] block mb-3 animate-spin">progress_activity</span>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">Chargement des tarifs...</h3>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="text-left px-5 py-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Ligne</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Compagnie</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Distance</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Durée</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Dép./jour</th>
                      <th className="text-center px-4 py-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Services</th>
                      <th className="text-right px-5 py-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Tarif</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((route, idx) => (
                      <tr key={route.id || idx} className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]" style={{ color: companyColors[route.company] || '#10B981' }}>directions_bus</span>
                            <div className="text-[14px] font-bold text-[#0F172A]">{route.from} → {route.to}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: `${companyColors[route.company] || '#64748B'}15`, color: companyColors[route.company] || '#64748B' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: companyColors[route.company] || '#64748B' }}></span>
                            {route.company}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-[13px] text-[#64748B] font-medium">{route.distance}</td>
                        <td className="px-4 py-4 text-center text-[13px] text-[#0F172A] font-semibold">{route.duration}</td>
                        <td className="px-4 py-4 text-center text-[13px] text-[#0F172A] font-bold">{route.departures}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap justify-center gap-1">
                            {route.features.map(f => (
                              <span key={f} className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[10px] text-[#64748B] font-medium">{f}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-[18px] font-extrabold text-[#0F172A]">{route.price.toLocaleString('fr-FR')}</span>
                          <span className="text-[11px] text-[#94A3B8] ml-1">FCFA</span>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/${locale}/resultats?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${new Date().toISOString().split('T')[0]}&passengers=1`}
                            className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-[12px] font-semibold hover:bg-[#1E293B] transition-all whitespace-nowrap"
                          >
                            Réserver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-[#E2E8F0]">
                {filtered.map((route, idx) => (
                  <div key={route.id || idx} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]" style={{ color: companyColors[route.company] || '#10B981' }}>directions_bus</span>
                        <span className="text-[15px] font-bold text-[#0F172A]">{route.from} → {route.to}</span>
                      </div>
                      <span className="text-[11px] text-[#94A3B8]">{route.distance}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: `${companyColors[route.company] || '#64748B'}15`, color: companyColors[route.company] || '#64748B' }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: companyColors[route.company] || '#64748B' }}></span>
                        {route.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-3 text-[12px] text-[#64748B]">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{route.duration}</span>
                      <span>{route.departures} dép./jour</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {route.features.map(f => (
                        <span key={f} className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[10px] text-[#64748B] font-medium">{f}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[20px] font-extrabold text-[#0F172A]">{route.price.toLocaleString('fr-FR')}</span>
                        <span className="text-[12px] text-[#94A3B8] ml-1">FCFA</span>
                      </div>
                      <Link
                        href={`/${locale}/resultats?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}&date=${new Date().toISOString().split('T')[0]}&passengers=1`}
                        className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-[12px] font-semibold hover:bg-[#1E293B] transition-all"
                      >
                        Réserver
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="mt-4 flex items-start gap-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
            <span className="material-symbols-outlined text-[18px] text-[#10B981] mt-0.5">info</span>
            <p className="text-[12px] text-[#64748B] leading-relaxed">
              Les tarifs affichés sont les <strong className="text-[#0F172A]">tarifs officiels de nos compagnies partenaires</strong>, sans aucune commission ajoutée par Ticket+. Les prix incluent l&apos;assurance voyageur et un bagage standard en soute (jusqu&apos;à 25 kg). Les horaires et fréquences peuvent varier selon la saison.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
