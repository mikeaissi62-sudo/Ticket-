'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const COMPANIES = [
  {
    name: 'Confort Lines',
    slug: 'confort-lines',
    status: 'active' as const,
    description: 'Leader du transport interurbain VIP au Bénin. Flotte climatisée, sièges cuir inclinables, ports USB et WiFi haut débit à bord. Plus de 15 ans d\'expérience sur les routes nationales.',
    founded: '2009',
    fleet: 12,
    routes: 6,
    dailyDepartures: 18,
    features: ['Climatisation intégrale', 'WiFi haut débit', 'Sièges cuir inclinables', 'Ports USB individuels', 'Collation offerte (longue distance)', 'Assurance voyageur incluse'],
    contact: '+229 01 54 65 89 07',
    cities: ['Cotonou', 'Parakou', 'Bohicon', 'Natitingou', 'Djougou', 'Tanguiéta'],
  },
  {
    name: 'Baobab Express',
    slug: 'baobab-express',
    status: 'active' as const,
    description: 'Transport régional rapide, réseau dense sur le sud et le centre du Bénin.',
    founded: '2015',
    fleet: 20,
    routes: 10,
    dailyDepartures: 30,
    features: ['Climatisation', 'Navettes fréquentes', 'Service Courrier'],
    contact: '+229 01 98 76 54 32',
    cities: ['Cotonou', 'Porto-Novo', 'Ouidah', 'Bohicon', 'Abomey', 'Lokossa'],
  },
  {
    name: 'ATT Transports',
    slug: 'att-transports',
    status: 'active' as const,
    description: 'Spécialiste des lignes transfrontalières Bénin-Togo-Niger et des longs courriers confortables.',
    founded: '2012',
    fleet: 15,
    routes: 8,
    dailyDepartures: 12,
    features: ['Climatisation VIP', 'Soutes sécurisées', 'Prises électriques', 'Trajets internationaux'],
    contact: '+229 01 23 45 67 89',
    cities: ['Cotonou', 'Parakou', 'Malanville', 'Djougou', 'Natitingou'],
  },
  {
    name: 'STM Voyageur',
    slug: 'stm-voyageur',
    status: 'active' as const,
    description: 'Liaisons interurbaines classiques et économiques, offrant sécurité et fiabilité à petit prix.',
    founded: '2018',
    fleet: 10,
    routes: 5,
    dailyDepartures: 15,
    features: ['Economique', 'Ventilation', 'TV à bord'],
    contact: '+229 01 11 22 33 44',
    cities: ['Cotonou', 'Bohicon', 'Parakou', 'Dassa'],
  }
];

export default function CompagniesPage() {
  const locale = useLocale();

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
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight">
            Compagnies Partenaires
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1 max-w-2xl">
            Découvrez les transporteurs certifiés disponibles sur Ticket+ pour vos voyages interurbains au Bénin.
          </p>
        </div>
      </section>

      {/* Active Companies List */}
      <div className="flex flex-col gap-8 pb-8">
        {COMPANIES.map(company => (
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
                        <span className="px-3 py-1 rounded-full bg-[#10B981]/20 text-[#34D399] text-[11px] font-bold uppercase tracking-wider border border-[#10B981]/30">
                          ● Partenaire Actif
                        </span>
                      </div>
                      <p className="text-[13px] text-white/60 mt-1">Fondée en {company.founded} • Intégré sur Ticket+</p>
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
                    { icon: 'route', label: 'Lignes', value: `${company.routes}` },
                    { icon: 'schedule', label: 'Départs/jour', value: `${company.dailyDepartures}` },
                    { icon: 'location_city', label: 'Villes', value: `${company.cities.length}` },
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
                        {company.features.map((f) => (
                          <span key={f} className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] text-[12px] text-[#0F172A] font-medium border border-[#E2E8F0]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cities Served */}
                    <div>
                      <h3 className="text-[15px] font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#10B981]">pin_drop</span>
                        Villes desservies
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {company.cities.map((city) => (
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

                      <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                        <span className="material-symbols-outlined text-[18px] text-[#64748B]">phone</span>
                        <div>
                          <div className="text-[12px] text-[#94A3B8]">Contact & Réservations</div>
                          <a href={`tel:${company.contact}`} className="text-[14px] font-bold text-[#0F172A] hover:text-[#10B981] transition-colors">{company.contact}</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
