'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

interface Company {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  description?: string;
  is_active: boolean;
  is_official_partner: boolean;
  rating: number;
  total_reviews: number;
  daily_departures: number;
  routes?: { id: string; name: string; base_price: number; duration_minutes: number; features?: string[] }[];
}

export default function HomePage() {
  const locale = useLocale();
  const router = useRouter();

  // Search form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [origin, setOrigin] = useState('Cotonou');
  const [destination, setDestination] = useState('Parakou');
  const [departureDate, setDepartureDate] = useState(todayStr);
  const [passengers, setPassengers] = useState('1');

  // Interactive seat simulator state
  const [selectedSeat, setSelectedSeat] = useState<string>('03');

  // Supabase dynamic companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [minPrice, setMinPrice] = useState<number>(5500);

  useEffect(() => {
    async function loadData() {
      try {
        const [compRes, routesRes] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/routes')
        ]);

        if (compRes.ok) {
          const compData = await compRes.json();
          if (compData.companies && compData.companies.length > 0) {
            setCompanies(compData.companies);
          }
        }

        if (routesRes.ok) {
          const rData = await routesRes.json();
          if (rData.routes && rData.routes.length > 0) {
            const minP = Math.min(...rData.routes.map((r: any) => r.price || 99999));
            if (minP < 99999) setMinPrice(minP);
          }
        }
      } catch (err) {
        console.error('Failed to load landing page data from DB:', err);
      }
    }
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/${locale}/resultats?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&date=${departureDate}&passengers=${passengers}`
    );
  };

  // Find Confort Lines from DB if available
  const confortLines = companies.find(c => c.slug === 'confort-lines') || {
    name: 'Confort Lines',
    slug: 'confort-lines',
    subtitle: 'Voyagez en toute sérénité',
    rating: 4.5,
    daily_departures: 11,
    total_reviews: 1280,
    description: 'Pionnier de la digitalisation avec Ticket+, Confort Lines propose des autocars climatisés grand tourisme reliant quotidiennement le Sud et le Septentrion. Flotte auditée avec chauffeurs professionnels accrédités.'
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Ambient Glow Layer */}
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface pb-space-xl">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-fixed/20 blur-3xl pointer-events-none"></div>
        <div className="absolute top-48 -left-32 w-80 h-80 rounded-full bg-surface-container-highest/40 blur-3xl pointer-events-none"></div>

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-space-lg lg:pt-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            
            {/* Text Column */}
            <div className="lg:col-span-7 flex flex-col gap-space-md z-10">
              
              {/* Launch Badge */}
              <div className="inline-flex flex-wrap items-center gap-space-xs self-start bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-sm">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-label-md text-label-md text-on-surface">Phase officielle de lancement au Bénin</span>
                <span className="text-on-surface-variant font-label-md text-label-md">•</span>
                <span className="font-label-md text-label-md text-secondary font-semibold">Partenaire exclusif : {confortLines.name}</span>
              </div>

              {/* Headline */}
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight leading-tight">
                La nouvelle ère du voyage en bus au Bénin <span className="text-secondary">débute ici</span>.
              </h1>

              {/* Subtitle */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Ticket+ connecte les voyageurs aux meilleures compagnies de transport certifiées. Consultez les départs en temps réel, réservez votre place sans vous déplacer et recevez votre e-billet sécurisé par WhatsApp &amp; SMS.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
                <a 
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-space-md rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm hover:bg-inverse-surface shadow-md transition-all group" 
                  href="#reservations"
                >
                  <span>Réserver un billet maintenant</span>
                  <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </a>
                <a 
                  className="inline-flex items-center justify-center px-space-lg py-space-md rounded-xl bg-surface-container-lowest text-on-surface font-title-md text-title-md shadow-sm hover:bg-surface-container-low transition-all" 
                  href="#partenariats"
                >
                  Découvrir nos partenariats
                </a>
              </div>

              {/* Quick Account Access Bar */}
              <div className="flex flex-wrap items-center gap-space-md pt-space-xs text-on-surface-variant">
                <div className="flex items-center gap-space-xs text-label-md font-label-md">
                  <span className="material-symbols-outlined text-secondary text-[18px]">verified_user</span>
                  <span>Plateforme Nationale Sécurisée</span>
                </div>
                <span className="text-outline-variant font-label-md">•</span>
                <Link 
                  className="font-label-md text-label-md text-on-surface hover:text-secondary underline decoration-surface-variant underline-offset-4" 
                  href={`/${locale}/login`}
                >
                  Se connecter
                </Link>
                <span className="text-outline-variant font-label-md">•</span>
                <Link 
                  className="font-label-md text-label-md text-secondary hover:text-on-secondary-container font-semibold" 
                  href={`/${locale}/login`}
                >
                  Créer un compte voyageur
                </Link>
              </div>

            </div>

            {/* Visual Hero Media */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-surface-container-lowest rounded-2xl p-space-sm shadow-xl overflow-hidden">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-surface-container">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Car grand tourisme interurbain VIP au Bénin" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTQkitAp25_6WtX2_GBtV4vka8eUf4z7AGRiF0lYr5psfpB8Yvuvwe6ZJYvwgNB-IFvmrB5oJhbhgM11uOpPctDiQnjq4YmtUAjE8DjYKTyFxCUvFwXGgtIofQPWh8x8osw1tc36VbnoBeX5sPX45YBPZgK02z17lwQcU7Z9Xih0581kwIN3r-Apg-RjrSljYdpfuZwoiNwORm2BfvY3vbY3usdUlNOVFe-WH1NzlsnjPzU3GJYaORMw" 
                  />
                  {/* Glass Badge on Image */}
                  <div className="absolute bottom-3 left-3 right-3 bg-surface/90 backdrop-blur-md rounded-xl p-space-sm shadow-md flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
                        <span className="material-symbols-outlined text-[22px]">directions_bus</span>
                      </div>
                      <div>
                        <p className="font-title-md text-title-md text-on-surface leading-none">{confortLines.name} VIP</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Ligne Premium Cotonou - Parakou</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-space-xs bg-secondary-container px-space-xs py-0.5 rounded-full text-on-secondary-container font-label-sm text-label-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        Actif
                      </span>
                    </div>
                  </div>
                </div>

                {/* Route Snippet preview card with DB price */}
                <div className="mt-space-sm p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between text-on-surface">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
                    <span className="font-label-md text-label-md">Départs quotidiens : 06h00 • 08h30 • 14h00</span>
                  </div>
                  <span className="font-label-md text-label-md font-semibold text-secondary">
                    Dès {minPrice.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Micro floating guarantee ticket */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-surface-container-lowest p-space-md rounded-xl shadow-lg items-center gap-space-md z-20">
                <div className="w-11 h-11 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                </div>
                <div>
                  <p className="font-title-md text-title-md text-on-surface font-bold">Billet Instantané</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Livré sous 2 secondes par WhatsApp</p>
                </div>
              </div>
            </div>

          </div>

          {/* KEY IMPACT STATS (4 Floating Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-xl">
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[26px]">event_available</span>
              </div>
              <div className="min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface">100%</p>
                <p className="font-label-md text-label-md text-on-surface-variant truncate">Départs Garantis</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary flex-shrink-0">
                <span className="material-symbols-outlined text-[26px]">price_check</span>
              </div>
              <div className="min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface">0 FCFA</p>
                <p className="font-label-md text-label-md text-on-surface-variant truncate">Frais cachés</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                <span className="material-symbols-outlined text-[26px]">support_agent</span>
              </div>
              <div className="min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface">24/7</p>
                <p className="font-label-md text-label-md text-on-surface-variant truncate">Assistance WhatsApp</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md flex items-center gap-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary flex-shrink-0">
                <span className="material-symbols-outlined text-[26px]">hub</span>
              </div>
              <div className="min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface">1<sup className="text-xs">er</sup> Réseau</p>
                <p className="font-label-md text-label-md text-on-surface-variant truncate">Centralisé au Bénin</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* BOOKING WIDGET STRIP */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 -mt-10 relative z-20 w-full" id="reservations">
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-xl border border-outline-variant/30">
          <div className="flex items-center justify-between mb-space-md pb-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[24px]">search</span>
              <h2 className="font-title-md text-title-md text-on-surface font-bold">Rechercher &amp; Comparer un trajet</h2>
            </div>
            <span className="font-label-md text-label-md text-on-surface-variant hidden sm:inline-block">Paiement direct MoMo &amp; Moov</span>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-md">
            {/* Origin */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Ville de départ</label>
              <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-sm rounded-xl">
                <span className="material-symbols-outlined text-outline text-[20px]">trip_origin</span>
                <select 
                  value={origin} 
                  onChange={e => setOrigin(e.target.value)} 
                  className="w-full bg-transparent font-title-md text-title-md text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="Cotonou">Cotonou (Gare Étoile / Ganhi)</option>
                  <option value="Parakou">Parakou (Gare Centrale)</option>
                  <option value="Bohicon">Bohicon</option>
                  <option value="Natitingou">Natitingou</option>
                  <option value="Porto-Novo">Porto-Novo</option>
                  <option value="Abomey">Abomey</option>
                </select>
              </div>
            </div>

            {/* Destination */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Destination</label>
              <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-sm rounded-xl">
                <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                <select 
                  value={destination} 
                  onChange={e => setDestination(e.target.value)} 
                  className="w-full bg-transparent font-title-md text-title-md text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="Parakou">Parakou</option>
                  <option value="Cotonou">Cotonou</option>
                  <option value="Bohicon">Bohicon</option>
                  <option value="Natitingou">Natitingou</option>
                  <option value="Tanguiéta">Tanguiéta</option>
                  <option value="Porto-Novo">Porto-Novo</option>
                  <option value="Abomey">Abomey</option>
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Date de départ</label>
              <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-sm rounded-xl">
                <span className="material-symbols-outlined text-outline text-[20px]">calendar_month</span>
                <input 
                  type="date" 
                  value={departureDate} 
                  onChange={e => setDepartureDate(e.target.value)} 
                  className="w-full bg-transparent font-title-md text-title-md text-on-surface focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Passengers */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Voyageurs</label>
              <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-sm rounded-xl">
                <span className="material-symbols-outlined text-outline text-[20px]">group</span>
                <select 
                  value={passengers} 
                  onChange={e => setPassengers(e.target.value)} 
                  className="w-full bg-transparent font-title-md text-title-md text-on-surface focus:outline-none cursor-pointer"
                >
                  <option value="1">1 passager</option>
                  <option value="2">2 passagers</option>
                  <option value="3">3 passagers</option>
                  <option value="4">4+ passagers</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col justify-end">
              <button 
                type="submit" 
                className="w-full h-[52px] bg-secondary text-on-secondary rounded-xl font-headline-sm text-headline-sm flex items-center justify-center gap-space-xs hover:bg-on-secondary-container shadow-md transition-all active:scale-98"
              >
                <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                <span>Rechercher</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION PARTENARIATS CONSOLIDÉS & EN COURS */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-space-xl" id="partenariats">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-xs rounded-full mb-space-sm">
              <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
              <span className="font-label-md text-label-md text-on-surface">Écosystème Certifié de Transport</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Nos Partenariats &amp; Compagnies Certifiées</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs">
              Nous digitalisons les gares routières en étroite collaboration avec les leaders du transport de personnes pour une expérience sans friction.
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="px-space-md py-space-xs rounded-full bg-surface-container-low font-label-md text-label-md text-on-surface font-semibold">
              {companies.length > 0 ? `${companies.length} Compagnies Partenaires` : '4 Compagnies Actives'}
            </span>
            <span className="px-space-md py-space-xs rounded-full bg-surface-container-high font-label-md text-label-md text-on-surface-variant">
              1 En déploiement (Ayina)
            </span>
          </div>
        </div>

        {/* CARTE VEDETTE: Confort Lines (Dynamique DB) */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg lg:p-space-xl shadow-lg mb-space-lg border border-outline-variant/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            
            {/* Visual Presentation */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-xl overflow-hidden shadow-md aspect-video bg-surface-container">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Autocar moderne Confort Lines au Bénin" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm2d6lrq_PpmmRlUoX_WEFFjiZjTbA4o3Fo7vFYNzJhXah9qPgV8uxFW8DdZRsQ8E_CBsXSWeJ7g4yKJOOM-okQ83voNgQ4BTrLoUvodNHqpPDuupJTaFbRZbXHoTD174ZD1aySBs-se32WeyN408WhG0iPXU4cYGjM0rf1IBa9uxFVCiCAYfWjh8nmYvB_gtmmAV3JujyNk4omPtA7u8AkMnmv4CuuGD_JNvWgHURjHZW7DHKtmmT5Q" 
                />
              </div>
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-secondary text-on-secondary font-label-md text-label-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
                  Partenaire Officiel de Lancement
                </span>
              </div>
            </div>

            {/* Partnership Details */}
            <div className="lg:col-span-6 flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm">
                    CL
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">{confortLines.name}</h3>
                    <p className="font-label-md text-label-md text-secondary font-semibold">
                      {confortLines.daily_departures || 11} départs quotidiens en direct
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-on-tertiary-container bg-tertiary-fixed px-space-sm py-space-xs rounded-lg font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[16px]">military_tech</span>
                  Label Qualité VIP ★ {confortLines.rating || 4.5}
                </span>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {confortLines.description || 'Pionnier de la digitalisation avec Ticket+, Confort Lines propose des autocars climatisés grand tourisme reliant quotidiennement le Sud et le Septentrion. Flotte auditée avec chauffeurs professionnels accrédités.'}
              </p>

              {/* Key Route features grid */}
              <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-low text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">wifi</span>
                  <span className="font-body-md text-body-md">WiFi &amp; Prises à bord</span>
                </div>
                <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-low text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">ac_unit</span>
                  <span className="font-body-md text-body-md">Climatisation continue</span>
                </div>
                <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-low text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">luggage</span>
                  <span className="font-body-md text-body-md">Bagages sécurisés (30kg)</span>
                </div>
                <div className="flex items-center gap-space-xs p-space-xs rounded-lg bg-surface-container-low text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">security</span>
                  <span className="font-body-md text-body-md">Assurance trajet incluse</span>
                </div>
              </div>

              {/* Active Lines Available */}
              <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Lignes disponibles :</span>
                <span className="px-space-sm py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface">Cotonou ⇄ Parakou (7 500 F)</span>
                <span className="px-space-sm py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface">Cotonou ⇄ Bohicon (3 000 F)</span>
                <span className="px-space-sm py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface">Cotonou ⇄ Natitingou (12 000 F)</span>
              </div>

              <div className="pt-space-xs">
                <Link 
                  className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-xl bg-primary text-on-primary font-title-md text-title-md hover:bg-inverse-surface transition-colors shadow-sm" 
                  href={`/${locale}/compagnies/confort-lines`}
                >
                  <span>Voir les départs {confortLines.name}</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* PROCHAINES COMPAGNIES ET RÉSEAU EN COURS (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          {/* Baobab Express */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-on-surface font-bold">
                  BE
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                  Partenaire Actif
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface font-bold">Baobab Express</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Liaisons interurbaines régulières vers le Grand Nord (Parakou, Natitingou, Djougou).</p>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="font-semibold text-secondary">8 départs/jour</span>
              <Link href={`/${locale}/compagnies/baobab-express`} className="text-primary font-bold hover:underline">Découvrir →</Link>
            </div>
          </div>

          {/* STM Voyageur */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-on-surface font-bold">
                  STM
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                  Partenaire Actif
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface font-bold">STM Voyageurs</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Spécialiste des grands axes et des liaisons rapides méridionales (Porto-Novo, Cotonou, Parakou).</p>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="font-semibold text-secondary">6 départs/jour</span>
              <Link href={`/${locale}/compagnies/stm-voyageur`} className="text-primary font-bold hover:underline">Découvrir →</Link>
            </div>
          </div>

          {/* ATT Transports */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-on-surface font-bold">
                  ATT
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold">
                  Partenaire Actif
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface font-bold">ATT Transports</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Réseau historique desservant les localités du Zou, Abomey, Bohicon et de l&apos;Atacora.</p>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
              <span className="font-semibold text-secondary">5 départs/jour</span>
              <Link href={`/${locale}/compagnies/att-transports`} className="text-primary font-bold hover:underline">Découvrir →</Link>
            </div>
          </div>

          {/* Ayina Transports */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-on-surface font-bold">
                  AT
                </div>
                <span className="px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-bold">
                  En audit
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface font-bold">Ayina Transports</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Confort et liaisons inter-préfectorales à haute cadence. Audit technique de gare en cours.</p>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">rule</span>
              <span>Bientôt disponible</span>
            </div>
          </div>
        </div>

        {/* CARRIER ONBOARDING CALLOUT */}
        <div className="bg-primary-container text-on-primary rounded-2xl p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-xl">
          <div className="flex items-center gap-space-md">
            <div className="w-14 h-14 rounded-2xl bg-surface-container/10 flex items-center justify-center flex-shrink-0 text-secondary-fixed">
              <span className="material-symbols-outlined text-[32px]">handshake</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-primary">Vous êtes une compagnie de transport ?</h3>
              <p className="font-body-md text-body-md text-on-primary-container mt-1">
                Rejoignez le réseau Ticket+ et optimisez le taux de remplissage de vos cars grâce à notre billetterie dématérialisée sécurisée.
              </p>
            </div>
          </div>
          <Link 
            className="flex-shrink-0 px-space-lg py-space-md rounded-xl bg-secondary text-on-secondary font-title-md text-title-md hover:bg-on-secondary-container transition-colors shadow-md whitespace-nowrap" 
            href={`/${locale}/contact`}
          >
            Devenir compagnie partenaire
          </Link>
        </div>
      </section>

      {/* SECTION POURQUOI CHOISIR TICKET+ */}
      <section className="bg-surface-container-low py-space-xl" id="la-solution">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">Avantages Exclusifs</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs">Pourquoi choisir Ticket+ pour vos voyages ?</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs">
              Une conception pensée pour simplifier radicalement la vie des voyageurs réguliers et occasionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {/* Feature 1 */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col justify-between hover:translate-y-[-4px] transition-transform border border-outline-variant/30">
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-[26px]">chat</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Billetterie 100% WhatsApp &amp; SMS</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Plus besoin d&apos;imprimer votre ticket. Votre QR code officiel arrive directement sur votre messagerie et par SMS de secours avec tous les détails.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs">
                <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Format smartphone universel
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col justify-between hover:translate-y-[-4px] transition-transform border border-outline-variant/30">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-[26px]">verified</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Tarifs Officiels Garantis</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Payez exactement le prix fixé en gare sans commission occulte. Réglable en 30 secondes via MTN MoMo, Moov Money ou carte bancaire.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs">
                <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Paiement 100% sécurisé
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col justify-between hover:translate-y-[-4px] transition-transform border border-outline-variant/30">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-[26px]">airline_seat_recline_extra</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Choix Libre du Siège</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Sélectionnez votre place préférée en visualisant le plan réel de l&apos;autocar : fenêtre pour la vue panoramique, allée ou rangées avant.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs">
                <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Plan interactif en direct
                </span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col justify-between hover:translate-y-[-4px] transition-transform border border-outline-variant/30">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center mb-space-md">
                  <span className="material-symbols-outlined text-[26px]">timer_off</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Zéro File d&apos;Attente</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Fini les bousculades aux guichets de gare dès l&apos;aube. Arrivez 20 minutes avant le départ et montez à bord l&apos;esprit totalement serein.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs">
                <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Embarquement express
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION COMMENT ÇA MARCHE ? (3 ÉTAPES) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-space-xl">
        <div className="text-center max-w-2xl mx-auto mb-space-xl">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">Processus Sans Effort</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs">Comment fonctionne Ticket+ ?</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs">Votre billet confirmé en moins de deux minutes chrono.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg relative">
          {/* Step 1 */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col relative border border-outline-variant/30">
            <div className="flex items-center justify-between mb-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-md text-headline-md text-primary font-bold">
                1
              </div>
              <span className="material-symbols-outlined text-secondary text-[24px]">travel_explore</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Comparez les départs et horaires</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Entrez votre ville d&apos;origine et de destination. Visualisez instantanément les heures de départ, les gares d&apos;embarquement et les compagnies partenaires.
            </p>
            <div className="mt-space-lg p-space-xs bg-surface-container-low rounded-xl text-center font-label-md text-label-md text-on-surface-variant font-medium">
              Affichage en temps réel
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col relative border border-outline-variant/30">
            <div className="flex items-center justify-between mb-space-md">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center font-headline-md text-headline-md text-on-secondary-container font-bold">
                2
              </div>
              <span className="material-symbols-outlined text-secondary text-[24px]">event_seat</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Sélectionnez votre siège</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Choisissez votre fauteuil sur le plan d&apos;implantation du car. Saisissez le prénom, nom et numéro de téléphone WhatsApp du passager.
            </p>
            <div className="mt-space-lg p-space-xs bg-surface-container-low rounded-xl text-center font-label-md text-label-md text-on-surface-variant font-medium">
              Attribution immédiate garantie
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col relative border border-outline-variant/30">
            <div className="flex items-center justify-between mb-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-md text-headline-md text-primary font-bold">
                3
              </div>
              <span className="material-symbols-outlined text-secondary text-[24px]">contactless</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Réglez et embarquez</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Confirmez par MTN MoMo ou Moov Money. Vous recevez sur-le-champ votre QR code de contrôle officiel sur WhatsApp &amp; SMS. Présentez-le à la gare.
            </p>
            <div className="mt-space-lg p-space-xs bg-surface-container-low rounded-xl text-center font-label-md text-label-md text-on-surface-variant font-medium">
              Contrôle digital en 3 secondes
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE SEAT & TICKET PREVIEW HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-space-xl">
        <div className="bg-surface-container rounded-2xl p-space-lg lg:p-space-xl shadow-md border border-outline-variant/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
            
            {/* Interactive Micro Seat Demo */}
            <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-space-lg shadow-md">
              <div className="flex items-center justify-between mb-space-md">
                <div>
                  <p className="font-title-md text-title-md text-on-surface font-bold">Disposition Cabine</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Exemple autocar Confort Lines (52 sièges)</p>
                </div>
                <span className="material-symbols-outlined text-secondary text-[20px]">airline_seat_recline_normal</span>
              </div>

              {/* Coach layout mockup with interactive clicks */}
              <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-sm">
                {/* Front row labels */}
                <div className="flex justify-between items-center px-space-xs text-label-sm font-label-sm text-on-surface-variant font-semibold">
                  <span>Poste Conducteur</span>
                  <span className="material-symbols-outlined text-[18px]">airline_seat_recline_extra</span>
                </div>

                {/* Seat grid simulator */}
                <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
                  {/* Row 1 */}
                  <div className="p-2 rounded-lg bg-surface-variant text-on-surface-variant">01</div>
                  <div className="p-2 rounded-lg bg-surface-variant text-on-surface-variant">02</div>
                  <div className="text-on-surface-variant/40 flex items-center justify-center font-label-sm">Allée</div>
                  <button 
                    type="button"
                    onClick={() => setSelectedSeat('03')}
                    className={`p-2 rounded-lg transition-all ${
                      selectedSeat === '03' ? 'bg-secondary text-on-secondary shadow-md font-bold' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    03
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedSeat('04')}
                    className={`p-2 rounded-lg transition-all ${
                      selectedSeat === '04' ? 'bg-secondary text-on-secondary shadow-md font-bold' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    04
                  </button>

                  {/* Row 2 */}
                  <button 
                    type="button"
                    onClick={() => setSelectedSeat('05')}
                    className={`p-2 rounded-lg transition-all ${
                      selectedSeat === '05' ? 'bg-secondary text-on-secondary shadow-md font-bold' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    05
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedSeat('06')}
                    className={`p-2 rounded-lg transition-all ${
                      selectedSeat === '06' ? 'bg-secondary text-on-secondary shadow-md font-bold' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    06
                  </button>
                  <div className="text-on-surface-variant/40 flex items-center justify-center font-label-sm">Allée</div>
                  <button 
                    type="button"
                    onClick={() => setSelectedSeat('07')}
                    className={`p-2 rounded-lg transition-all ${
                      selectedSeat === '07' ? 'bg-secondary text-on-secondary shadow-md font-bold' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    07
                  </button>
                  <div className="p-2 rounded-lg bg-surface-variant text-on-surface-variant">08</div>

                  {/* Row 3 */}
                  <button 
                    type="button"
                    onClick={() => setSelectedSeat('09')}
                    className={`p-2 rounded-lg transition-all ${
                      selectedSeat === '09' ? 'bg-secondary text-on-secondary shadow-md font-bold' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    09
                  </button>
                  <div className="p-2 rounded-lg bg-surface-variant text-on-surface-variant">10</div>
                  <div className="text-on-surface-variant/40 flex items-center justify-center font-label-sm">Allée</div>
                  <button 
                    type="button"
                    onClick={() => setSelectedSeat('11')}
                    className={`p-2 rounded-lg transition-all ${
                      selectedSeat === '11' ? 'bg-secondary text-on-secondary shadow-md font-bold' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    11
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSelectedSeat('12')}
                    className={`p-2 rounded-lg transition-all ${
                      selectedSeat === '12' ? 'bg-secondary text-on-secondary shadow-md font-bold' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}
                  >
                    12
                  </button>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-around pt-space-xs border-t border-surface-variant text-label-sm font-label-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-secondary"></span>
                    <span>Votre sélection ({selectedSeat})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-surface-container-highest"></span>
                    <span>Libre</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-surface-variant"></span>
                    <span>Occupé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory copy */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="inline-flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-full self-start shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">Transparence Totale des Réservations</span>
              </div>
              
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                Chaque passager monte avec un titre authentifié et vérifiable.
              </h3>

              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Le QR Code Ticket+ intègre l&apos;identifiant unique du voyageur, son siège attribué, la gare exacte d&apos;embarquement et la référence de paiement mobile. Les contrôleurs en gare scannent directement l&apos;écran de votre smartphone sans nécessiter de papier.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
                  <div className="flex items-center gap-space-xs text-secondary font-title-md text-title-md font-bold">
                    <span className="material-symbols-outlined">payments</span>
                    <span>Mobile Money Natif</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Paiement sans carte de crédit : tapez votre code secret directement sur votre combiné (MTN MoMo ou Moov Money).
                  </p>
                </div>

                <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
                  <div className="flex items-center gap-space-xs text-secondary font-title-md text-title-md font-bold">
                    <span className="material-symbols-outlined">notifications_active</span>
                    <span>Rappels de Départ</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    Notification WhatsApp &amp; SMS 2 heures avant le trajet avec rappel des accès à la gare.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION TÉMOIGNAGES & RÉASSURANCE INSTITUTIONNELLE */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-space-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-semibold">Confiance Établie</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs">Ce que disent les voyageurs béninois</h2>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-secondary text-[22px]">star</span>
            <span className="font-title-md text-title-md text-on-surface font-bold">4.9 / 5</span>
            <span className="font-body-md text-body-md text-on-surface-variant">sur plus de 1 200 départs supervisés</span>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg mb-space-xl">
          {/* Testimonial 1 */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center gap-1 text-secondary mb-space-sm">
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed italic">
                « Pour mes missions professionnelles à Parakou, j&apos;évite enfin la queue de 5h du matin à la gare. J&apos;ai réservé la veille depuis mon canapé à Cadjèhoun, payé par MTN MoMo et mon siège était garanti dans le car Confort Lines. »
              </p>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-primary font-bold">
                BA
              </div>
              <div>
                <p className="font-title-md text-title-md text-on-surface leading-none font-bold">Bio Abdoulaye</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Consultant en agronomie • Cotonou</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center gap-1 text-secondary mb-space-sm">
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed italic">
                « La réception du QR code directement sur WhatsApp avec le plan de route est formidable. Aucune mauvaise surprise sur le tarif, c&apos;est rigoureusement le prix de la gare. Je recommande chaudement ! »
              </p>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-primary font-bold">
                CA
              </div>
              <div>
                <p className="font-title-md text-title-md text-on-surface leading-none font-bold">Chantal Agossa</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Commerçante • Bohicon</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col justify-between border border-outline-variant/30">
            <div>
              <div className="flex items-center gap-1 text-secondary mb-space-sm">
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
                <span className="material-symbols-outlined text-[18px]">star</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface leading-relaxed italic">
                « J&apos;ai pu réserver le billet de mes parents pour Natitingou depuis mon bureau. Le support WhatsApp a répondu en moins de 3 minutes pour clarifier l&apos;heure de départ. Bravo pour cette innovation béninoise. »
              </p>
            </div>
            <div className="mt-space-md pt-space-xs flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-primary font-bold">
                FD
              </div>
              <div>
                <p className="font-title-md text-title-md text-on-surface leading-none font-bold">Fabrice Dossou</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Ingénieur Systèmes • Porto-Novo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Assurance Badges Strip */}
        <div className="bg-surface-container-low rounded-2xl p-space-md flex flex-wrap items-center justify-around gap-space-md text-on-surface-variant border border-outline-variant/30">
          <div className="flex items-center gap-space-xs font-label-md text-label-md">
            <span className="material-symbols-outlined text-secondary text-[20px]">lock</span>
            <span>Transactions Cryptées SSL 256 bits</span>
          </div>
          <div className="flex items-center gap-space-xs font-label-md text-label-md">
            <span className="material-symbols-outlined text-secondary text-[20px]">policy</span>
            <span>Conforme Réglementation Transport Bénin</span>
          </div>
          <div className="flex items-center gap-space-xs font-label-md text-label-md">
            <span className="material-symbols-outlined text-secondary text-[20px]">chat</span>
            <span>Assistance directe WhatsApp : +229 01 54 65 89 07</span>
          </div>
        </div>
      </section>

      {/* BANNIÈRE D'APPEL À L'ACTION FINALE (CTA BANNER) */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-space-xl">
        <div className="relative bg-primary-container text-on-primary rounded-3xl p-space-xl lg:p-20 overflow-hidden shadow-2xl">
          {/* Decorative Backdrop circles */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-surface-container/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl flex flex-col gap-space-md">
            <div className="inline-flex items-center gap-space-xs bg-surface-container/10 px-space-md py-space-xs rounded-full self-start">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
              <span className="font-label-md text-label-md text-secondary-fixed font-semibold">Embarquement immédiat</span>
            </div>

            <h2 className="font-display-lg text-display-lg text-on-primary tracking-tight font-extrabold">
              Prêt à voyager autrement ?
            </h2>

            <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl leading-relaxed">
              Créez votre compte en 30 secondes ou réservez votre prochain trajet interurbain dès maintenant avec {confortLines.name} et notre réseau national certifié.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
              <Link 
                className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-xl bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-low transition-all shadow-lg active:scale-98" 
                href={`/${locale}/login`}
              >
                <span>Créer un compte gratuit</span>
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </Link>
              <a 
                className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-xl bg-secondary text-on-secondary font-headline-sm text-headline-sm hover:bg-on-secondary-container transition-all shadow-md active:scale-98" 
                href="https://wa.me/2290154658907"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>Contacter le support WhatsApp</span>
              </a>
            </div>

            {/* Micro footer text inside banner */}
            <div className="flex items-center gap-space-xs text-on-primary-container font-label-sm text-label-sm pt-space-xs">
              <span className="material-symbols-outlined text-[16px] text-secondary-fixed">bolt</span>
              <span>Confirmation instantanée par SMS &amp; WhatsApp dès validation du paiement.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
