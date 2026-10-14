'use client';

import React, { useState, useEffect } from 'react';
import { SearchForm } from '@/components/traveler/SearchForm';
import { LineCard } from '@/components/traveler/LineCard';
import { ReassuranceSection } from '@/components/traveler/ReassuranceSection';

interface PopularRoute {
  from: string;
  to: string;
  minPrice: number;
  departures: number;
  duration: string;
  details: string;
}

const FALLBACK_ROUTES: PopularRoute[] = [
  { from: 'Cotonou', to: 'Parakou', minPrice: 5200, departures: 11, duration: '6h30', details: '4 compagnies • Bus Climatisé & WiFi' },
  { from: 'Cotonou', to: 'Natitingou', minPrice: 7200, departures: 5, duration: '9h45', details: 'Confort VIP & Collation Offerte' },
  { from: 'Cotonou', to: 'Bohicon', minPrice: 2800, departures: 18, duration: '2h15', details: 'Navette Express Directe' },
];

function PopularRoutesSection() {
  const [routes, setRoutes] = useState<PopularRoute[]>(FALLBACK_ROUTES);

  useEffect(() => {
    async function fetchPopularRoutes() {
      try {
        const res = await fetch('/api/routes');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.routes || !Array.isArray(data.routes) || data.routes.length === 0) return;

        // Group routes by city pair and find min price + total departures
        const grouped: Record<string, { from: string; to: string; minPrice: number; departures: number; duration: string; companies: Set<string>; features: Set<string> }> = {};
        
        for (const r of data.routes) {
          if (!r || !r.from || !r.to) continue;
          const key = `${r.from}-${r.to}`;
          const price = typeof r.price === 'number' ? r.price : (Number(r.price) || 5000);
          const departures = typeof r.departures === 'number' ? r.departures : 1;
          const featuresList = Array.isArray(r.features) ? r.features : [];

          if (!grouped[key]) {
            grouped[key] = {
              from: r.from,
              to: r.to,
              minPrice: price,
              departures: departures,
              duration: r.duration || '6h30',
              companies: new Set(r.company ? [r.company] : []),
              features: new Set(featuresList),
            };
          } else {
            grouped[key].minPrice = Math.min(grouped[key].minPrice, price);
            grouped[key].departures += departures;
            if (r.company) grouped[key].companies.add(r.company);
            featuresList.forEach((f: string) => grouped[key].features.add(f));
          }
        }

        // Sort by number of departures (most popular first), take top 3
        const sorted = Object.values(grouped)
          .sort((a, b) => b.departures - a.departures)
          .slice(0, 3)
          .map(r => ({
            from: r.from,
            to: r.to,
            minPrice: r.minPrice || 5000,
            departures: r.departures || 1,
            duration: r.duration || '6h30',
            details: `${r.companies.size} compagnie${r.companies.size > 1 ? 's' : ''} • Bus ${Array.from(r.features).slice(0, 2).join(' & ') || 'Climatisé'}`,
          }));
        
        if (sorted.length > 0) {
          setRoutes(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch popular routes:', err);
      }
    }
    fetchPopularRoutes();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
      {routes.map((r) => (
        <LineCard
          key={`${r.from}-${r.to}`}
          from={r.from}
          to={r.to}
          price={`dès ${(r.minPrice || 0).toLocaleString('fr-FR')}`}
          details={r.details || 'Bus Climatisé'}
          duration={r.duration || '--'}
          tag={`${r.departures || 1} départs/jour`}
        />
      ))}
    </div>
  );
}

export default function AccueilVoyageurPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full pb-space-lg pt-space-md px-gutter">
        <div className="max-w-[1140px] mx-auto flex flex-col items-center text-center">
          <h1 className="font-display-md text-display-md md:font-display-lg md:text-display-lg font-extrabold text-on-surface tracking-tight max-w-3xl leading-tight">
            Comparez et réservez vos trajets en bus au Bénin.
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-4 mb-8 leading-relaxed">
            Trouvez les meilleurs départs, comparez les tarifs officiels et recevez votre billet garanti par SMS et WhatsApp en toute sérénité.
          </p>

          <SearchForm />
        </div>
      </section>

      {/* Bus Banner Image */}
      <section className="px-gutter pb-space-xl">
        <div className="max-w-[1140px] mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-primary h-[200px] sm:h-[260px] md:h-[300px] flex items-end shadow-md border border-outline-variant">
            <div className="absolute inset-0 bg-[url('/images/bus-banner.jpg')] bg-cover bg-center opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent"></div>
            <div className="relative z-10 p-space-md sm:p-space-lg">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold mb-2 block drop-shadow-sm">
                Partenaires Officiels • Bénin
              </span>
              <h2 className="text-on-primary font-title-lg text-title-lg sm:text-[22px] font-bold max-w-lg leading-snug drop-shadow-md">
                Voyagez avec l&apos;excellence de nos compagnies (Confort Lines, Baobab Express, ATT, STM) : sécurité et confort garantis.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Section — Dynamic from Supabase */}
      <section className="px-gutter pb-space-xl">
        <div className="max-w-[1140px] mx-auto">
          <div className="mb-space-lg">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Réseau Express</span>
            <h2 className="font-display-sm text-display-sm sm:font-display-md sm:text-display-md font-extrabold text-on-surface tracking-tight mt-1">
              Départs &amp; Lignes disponibles sur Ticket+
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Actuellement opéré par <strong className="text-on-surface">Confort Lines, Baobab Express, ATT Transports et STM Voyageurs</strong>.
            </p>
          </div>

          <PopularRoutesSection />
        </div>
      </section>

      {/* Reassurance + CTA */}
      <ReassuranceSection />
    </div>
  );
}
