'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  description?: string;
  contact_info?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  rating?: number;
  daily_departures?: number;
  is_official_partner?: boolean;
  stations?: Array<{ id: string; name: string; city: string }>;
  routes?: Array<{ id: string; name: string; base_price: number; duration_minutes: number; features?: string[] }>;
  features?: string[];
  founded?: string;
  fleet?: number;
  cities?: string[];
}

const FALLBACK_COMPANIES: CompanyData[] = [
  {
    id: '1',
    name: 'Confort Lines',
    slug: 'confort-lines',
    subtitle: 'Voyagez en toute sérénité',
    description: 'Leader du transport interurbain VIP au Bénin. Flotte climatisée, sièges cuir inclinables, ports USB et WiFi haut débit à bord. Plus de 15 ans d\'expérience sur les routes nationales.',
    founded: '2009',
    fleet: 12,
    daily_departures: 18,
    features: ['Climatisation intégrale', 'WiFi haut débit', 'Sièges cuir inclinables', 'Ports USB individuels', 'Collation offerte (longue distance)', 'Assurance voyageur incluse'],
    contact_info: { phone: '+229 01 54 65 89 07' },
    cities: ['Cotonou', 'Parakou', 'Bohicon', 'Natitingou', 'Djougou', 'Tanguiéta'],
    is_official_partner: true,
  },
  {
    id: '2',
    name: 'Baobab Express',
    slug: 'baobab-express',
    subtitle: 'Spécialiste du Nord',
    description: 'Transport régional rapide, réseau dense sur le sud et le centre du Bénin.',
    founded: '2015',
    fleet: 20,
    daily_departures: 30,
    features: ['Climatisation', 'Navettes fréquentes', 'Service Courrier'],
    contact_info: { phone: '+229 01 98 76 54 32' },
    cities: ['Cotonou', 'Porto-Novo', 'Ouidah', 'Bohicon', 'Abomey', 'Lokossa'],
    is_official_partner: true,
  },
  {
    id: '3',
    name: 'ATT Transports',
    slug: 'att-transports',
    subtitle: 'Le transport accessible',
    description: 'Spécialiste des lignes transfrontalières Bénin-Togo-Niger et des longs courriers confortables.',
    founded: '2012',
    fleet: 15,
    daily_departures: 12,
    features: ['Climatisation VIP', 'Soutes sécurisées', 'Prises électriques', 'Trajets internationaux'],
    contact_info: { phone: '+229 01 23 45 67 89' },
    cities: ['Cotonou', 'Parakou', 'Malanville', 'Djougou', 'Natitingou'],
    is_official_partner: true,
  },
  {
    id: '4',
    name: 'STM Voyageur',
    slug: 'stm-voyageur',
    subtitle: 'Confort et ponctualité',
    description: 'Liaisons interurbaines classiques et économiques, offrant sécurité et fiabilité à petit prix.',
    founded: '2018',
    fleet: 10,
    daily_departures: 15,
    features: ['Economique', 'Ventilation', 'TV à bord'],
    contact_info: { phone: '+229 01 11 22 33 44' },
    cities: ['Cotonou', 'Bohicon', 'Parakou', 'Dassa'],
    is_official_partner: false,
  }
];

export default function CompagniesPage() {
  const locale = useLocale();
  const [companies, setCompanies] = useState<CompanyData[]>(FALLBACK_COMPANIES);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch('/api/companies');
        if (!res.ok) throw new Error('Erreur lors du chargement des compagnies');
        const data = await res.json();
        
        if (data.companies && data.companies.length > 0) {
          const mapped: CompanyData[] = data.companies.map((c: any) => {
            const fallback = FALLBACK_COMPANIES.find(f => f.slug === c.slug);
            const citiesList = c.stations && c.stations.length > 0 
              ? Array.from(new Set(c.stations.map((s: any) => s.city))) as string[]
              : fallback?.cities || ['Cotonou', 'Parakou'];

            return {
              id: c.id,
              name: c.name,
              slug: c.slug,
              subtitle: c.subtitle || fallback?.subtitle || 'Transporteur certifié',
              description: c.description || fallback?.description,
              founded: fallback?.founded || '2015',
              fleet: fallback?.fleet || 15,
              daily_departures: c.daily_departures || fallback?.daily_departures || 12,
              features: fallback?.features || ['Climatisation', 'Bagages sécurisés', 'Chauffeur agréé'],
              contact_info: c.contact_info || fallback?.contact_info || { phone: '+229 97 00 00 00' },
              cities: citiesList,
              is_official_partner: c.is_official_partner,
              stations: c.stations,
              routes: c.routes,
            };
          });
          setCompanies(mapped);
          setIsLive(true);
        }
      } catch (err) {
        console.warn('Fallback aux données statiques pour compagnies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="px-4 sm:px-6 pb-6 pt-4">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${locale}`} className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors">Accueil</Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[13px] text-[#0F172A] font-semibold">Compagnies</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
            <div>
              <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight">
                Compagnies Partenaires
              </h1>
              <p className="text-[14px] text-[#64748B] mt-1 max-w-2xl">
                Découvrez les transporteurs certifiés disponibles sur Ticket+ pour vos voyages interurbains au Bénin.
              </p>
            </div>

            {isLive && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Synchronisé Supabase en direct</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Active Companies List */}
      <div className="flex flex-col gap-8 pb-8">
        {loading ? (
          <div className="max-w-[1140px] mx-auto w-full px-4 sm:px-6">
            <div className="animate-pulse flex flex-col gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-slate-100 rounded-2xl border border-slate-200"></div>
              ))}
            </div>
          </div>
        ) : (
          companies.map(company => (
            <section key={company.slug} className="px-4 sm:px-6">
              <div className="max-w-[1140px] mx-auto">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                  {/* Company Header */}
                  <div className="relative bg-[#0F172A] p-6 sm:p-8 text-white overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <span className="material-symbols-outlined text-[32px] text-white">directions_bus</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h2 className="text-[24px] font-extrabold">{company.name}</h2>
                          {company.is_official_partner ? (
                            <span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-[11px] font-bold uppercase tracking-wider border border-[#10B981]/30">
                              ● Partenaire Officiel
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-[11px] font-bold uppercase tracking-wider border border-sky-500/30">
                              ● Partenaire Agréé
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-white/60 mt-1">
                          {company.subtitle} • Fondée en {company.founded}
                        </p>
                      </div>
                      <Link
                        href={`/${locale}/resultats?from=Cotonou&to=Parakou&date=${new Date().toISOString().split('T')[0]}&passengers=1`}
                        className="px-5 py-2.5 rounded-xl bg-white text-[#0F172A] text-[13px] font-bold hover:bg-[#F8FAFC] transition-all shadow-sm"
                      >
                        Voir les départs
                      </Link>
                    </div>
                  </div>

                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#E2E8F0]">
                    {[
                      { icon: 'directions_bus', label: 'Véhicules', value: `${company.fleet}` },
                      { icon: 'route', label: 'Lignes', value: `${company.routes?.length || 4}` },
                      { icon: 'schedule', label: 'Départs/jour', value: `${company.daily_departures}` },
                      { icon: 'location_city', label: 'Villes', value: `${company.cities?.length || 3}` },
                    ].map((stat) => (
                      <div key={stat.label} className="p-4 text-center border-r border-[#E2E8F0] last:border-r-0">
                        <span className="material-symbols-outlined text-[20px] text-[#10B981] mb-1 block">{stat.icon}</span>
                        <div className="text-[22px] font-extrabold text-[#0F172A]">{stat.value}</div>
                        <div className="text-[11px] text-[#94A3B8] font-medium">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-[15px] font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#10B981]">info</span>
                          À propos
                        </h3>
                        <p className="text-[13px] text-[#64748B] leading-relaxed mb-4">{company.description}</p>

                        <h3 className="text-[15px] font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#10B981]">star</span>
                          Équipements & Services
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {company.features?.map((f) => (
                            <span key={f} className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] text-[12px] text-[#0F172A] font-medium border border-[#E2E8F0]">
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Cities & Contact */}
                      <div>
                        <h3 className="text-[15px] font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-[#10B981]">pin_drop</span>
                          Villes desservies
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {company.cities?.map((city) => (
                            <Link
                              key={city}
                              href={`/${locale}/resultats?from=${encodeURIComponent(city)}&to=${encodeURIComponent(city === 'Cotonou' ? 'Parakou' : 'Cotonou')}&date=${new Date().toISOString().split('T')[0]}&passengers=1`}
                              className="flex items-center gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#10B981] hover:bg-[#ECFDF5] transition-all group"
                            >
                              <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:bg-[#10B981]/10 transition-colors">
                                <span className="material-symbols-outlined text-[16px] text-[#64748B] group-hover:text-[#10B981]">location_city</span>
                              </span>
                              <span className="text-[13px] font-semibold text-[#0F172A]">{city}</span>
                            </Link>
                          ))}
                        </div>

                        {company.contact_info?.phone && (
                          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <span className="material-symbols-outlined text-[18px] text-[#64748B]">phone</span>
                            <div>
                              <div className="text-[12px] text-[#94A3B8]">Contact & Réservations</div>
                              <a href={`tel:${company.contact_info.phone}`} className="text-[14px] font-bold text-[#0F172A] hover:text-[#10B981] transition-colors">
                                {company.contact_info.phone}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
