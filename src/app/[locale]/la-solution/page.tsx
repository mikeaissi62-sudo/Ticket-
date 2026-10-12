'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

export default function PresentationPage() {
  const locale = useLocale();

  // Interactive seat simulator state
  const [selectedSeat, setSelectedSeat] = useState<string>('03');

  // Supabase dynamic companies & min price state
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
        console.error('Failed to load presentation data:', err);
      }
    }
    loadData();
  }, []);

  // Find Confort Lines or fallback
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
      {/* =========================================================================
          1. HERO HEADER VISUEL EN IMAGE (Hero Banner)
         ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface pb-space-xl pt-space-md sm:pt-space-lg">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-fixed/25 blur-3xl pointer-events-none"></div>
        <div className="absolute top-48 -left-32 w-80 h-80 rounded-full bg-surface-container-highest/40 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Main Hero Card with Panoramic Image Header */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-outline-variant/40 bg-surface-container-lowest">
            
            {/* Visual Cover Banner Image with Overlay */}
            <div className="relative h-[280px] sm:h-[360px] md:h-[420px] w-full overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTQkitAp25_6WtX2_GBtV4vka8eUf4z7AGRiF0lYr5psfpB8Yvuvwe6ZJYvwgNB-IFvmrB5oJhbhgM11uOpPctDiQnjq4YmtUAjE8DjYKTyFxCUvFwXGgtIofQPWh8x8osw1tc36VbnoBeX5sPX45YBPZgK02z17lwQcU7Z9Xih0581kwIN3r-Apg-RjrSljYdpfuZwoiNwORm2BfvY3vbY3usdUlNOVFe-WH1NzlsnjPzU3GJYaORMw"
                alt="Autocar moderne Confort Lines grand tourisme au Bénin"
                className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20"></div>

              {/* Badges on image top */}
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-wrap items-center justify-between gap-3 z-10">
                <div className="inline-flex items-center gap-2 bg-surface/90 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-white/20">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                  <span className="text-[12px] sm:text-[13px] font-bold text-on-surface">Phase officielle de lancement au Bénin</span>
                  <span className="text-on-surface-variant text-[11px] hidden md:inline">•</span>
                  <span className="text-[12px] sm:text-[13px] font-extrabold text-secondary hidden md:inline">Partenaire exclusif : Confort Lines</span>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-secondary text-on-secondary px-3.5 py-1.5 rounded-full text-[12px] font-bold shadow-md">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Plateforme Nationale Certifiée</span>
                </div>
              </div>

              {/* Hero Headline Overlaid on Image */}
              <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 z-10 max-w-3xl">
                <h1 className="font-display-lg text-display-lg text-white font-extrabold tracking-tight leading-tight drop-shadow-md">
                  La nouvelle ère du voyage en bus au Bénin <span className="text-[#86f2e4]">débute ici</span>.
                </h1>
                <p className="text-white/90 text-[14px] sm:text-[16px] md:text-[18px] font-medium mt-2 max-w-2xl leading-relaxed drop-shadow-sm">
                  Ticket+ connecte les voyageurs aux compagnies certifiées du Bénin. Consultez les départs, réservez sans vous déplacer et recevez votre e-billet sécurisé par WhatsApp &amp; SMS.
                </p>
              </div>
            </div>

            {/* Sub-Hero Bar with Quick Actions and Fast Stats */}
            <div className="p-6 sm:p-8 bg-surface-container-lowest flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-t border-outline-variant/30">
              
              {/* CTAs : Redirection vers la page de connexion / inscription */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm hover:bg-inverse-surface shadow-md transition-all active:scale-95 group"
                >
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  <span>Créer mon compte</span>
                </Link>

                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container-low text-on-surface font-title-md text-title-md hover:bg-surface-container-high transition-all active:scale-95 border border-outline-variant/50"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  <span>Se connecter</span>
                </Link>

                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary text-on-secondary font-title-md text-title-md hover:bg-on-secondary-container transition-all active:scale-95 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  <span>Réserver un trajet</span>
                </Link>
              </div>

              {/* Route & Price Snippet */}
              <div className="flex items-center gap-4 bg-surface-container-low px-4 py-3 rounded-2xl border border-outline-variant/30">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">directions_bus</span>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-on-surface leading-tight">Départs quotidiens réguliers</p>
                  <p className="text-[12px] text-on-surface-variant">Cotonou ⇄ Parakou dès <span className="font-extrabold text-secondary">{minPrice.toLocaleString('fr-FR')} FCFA</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Chiffres Clés & Impact National */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[26px]">event_available</span>
              </div>
              <div className="min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface font-extrabold">100%</p>
                <p className="font-label-md text-label-md text-on-surface-variant truncate">Départs Garantis</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-[26px]">price_check</span>
              </div>
              <div className="min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface font-extrabold">0 FCFA</p>
                <p className="font-label-md text-label-md text-on-surface-variant truncate">Frais cachés (Prix gare)</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[26px]">support_agent</span>
              </div>
              <div className="min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface font-extrabold">24/7</p>
                <p className="font-label-md text-label-md text-on-surface-variant truncate">Assistance WhatsApp</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-[26px]">hub</span>
              </div>
              <div className="min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface font-extrabold">1<sup className="text-xs">er</sup> Réseau</p>
                <p className="font-label-md text-label-md text-on-surface-variant truncate">Centralisé au Bénin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. NOS PARTENARIATS & COMPAGNIES CERTIFIÉES
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-space-xl" id="partenariats">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-md py-space-xs rounded-full mb-space-sm">
              <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
              <span className="font-label-md text-label-md text-on-surface font-bold">Écosystème Certifié de Transport</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
              Nos Partenariats &amp; Compagnies Certifiées
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-xs leading-relaxed">
              Nous digitalisons les gares routières en étroite collaboration avec les leaders du transport de personnes pour une expérience sans friction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">
              1 Compagnie Active
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container-high font-label-md text-label-md text-on-surface-variant">
              4 En déploiement
            </span>
          </div>
        </div>

        {/* CARTE VEDETTE: Confort Lines */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-outline-variant/30 mb-space-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visual Bus Presentation */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden shadow-md aspect-video bg-surface-container">
                <img
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm2d6lrq_PpmmRlUoX_WEFFjiZjTbA4o3Fo7vFYNzJhXah9qPgV8uxFW8DdZRsQ8E_CBsXSWeJ7g4yKJOOM-okQ83voNgQ4BTrLoUvodNHqpPDuupJTaFbRZbXHoTD174ZD1aySBs-se32WeyN408WhG0iPXU4cYGjM0rf1IBa9uxFVCiCAYfWjh8nmYvB_gtmmAV3JujyNk4omPtA7u8AkMnmv4CuuGD_JNvWgHURjHZW7DHKtmmT5Q"
                  alt="Autocar Confort Lines reliant Cotonou et Parakou"
                />
              </div>
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md shadow-md font-bold">
                  <span className="w-2 h-2 rounded-full bg-secondary-fixed animate-ping"></span>
                  Partenaire Officiel de Lancement
                </span>
              </div>
            </div>

            {/* Partnership Details */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-headline-sm text-headline-sm font-bold">
                    CL
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface font-extrabold">{confortLines.name}</h3>
                    <p className="font-label-md text-label-md text-secondary font-semibold">1 Compagnie Active en Ligne • {confortLines.daily_departures || 11} départs/jour</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-on-tertiary-container bg-tertiary-fixed px-3 py-1 rounded-lg font-label-sm text-label-sm font-bold">
                  <span className="material-symbols-outlined text-[16px]">military_tech</span>
                  Label Qualité VIP
                </span>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {confortLines.description}
              </p>

              {/* Key Route features grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">wifi</span>
                  <span className="font-body-md text-body-md font-medium">WiFi &amp; Prises à bord</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">ac_unit</span>
                  <span className="font-body-md text-body-md font-medium">Climatisation continue</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">luggage</span>
                  <span className="font-body-md text-body-md font-medium">Bagages sécurisés (30kg)</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-low text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[20px]">security</span>
                  <span className="font-body-md text-body-md font-medium">Assurance trajet incluse</span>
                </div>
              </div>

              {/* Active Lines Available */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">Lignes disponibles :</span>
                <span className="px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm font-semibold text-on-surface">Cotonou ⇄ Parakou</span>
                <span className="px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm font-semibold text-on-surface">Cotonou ⇄ Bohicon</span>
                <span className="px-3 py-1 rounded-full bg-surface-container font-label-sm text-label-sm font-semibold text-on-surface">Cotonou ⇄ Natitingou</span>
              </div>

              <div className="pt-2">
                <Link
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-title-md text-title-md hover:bg-inverse-surface transition-all active:scale-95"
                  href={`/${locale}`}
                >
                  <span>Voir les départs Confort Lines</span>
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* PROCHAINES COMPAGNIES EN COURS D'INTÉGRATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-space-xl">
          {/* Baobab Express */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-on-surface font-bold">
                  BE
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  En intégration
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface font-bold">Baobab Express</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Liaisons interurbaines régulières à travers tout le territoire national béninois.</p>
            </div>
            <div className="mt-4 pt-2 flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">hourglass_top</span>
              <span className="font-medium">8 départs/jour prévus</span>
            </div>
          </div>

          {/* STM Voyageurs */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-on-surface font-bold">
                  STM
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  En intégration
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface font-bold">STM Voyageurs</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Spécialiste des grands axes et des liaisons directes méridionales.</p>
            </div>
            <div className="mt-4 pt-2 flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">sync</span>
              <span className="font-medium">Synchronisation API en cours</span>
            </div>
          </div>

          {/* ATT Transports */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-on-surface font-bold">
                  ATT
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  Partenariat signé
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface font-bold">ATT Transports</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Réseau historique desservant les localités du Zou et de l&apos;Atacora.</p>
            </div>
            <div className="mt-4 pt-2 flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">task_alt</span>
              <span className="font-medium">Convention validée</span>
            </div>
          </div>

          {/* Ayina Transports */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-title-md text-title-md text-on-surface font-bold">
                  AT
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                  En audit
                </span>
              </div>
              <h4 className="font-title-md text-title-md text-on-surface font-bold">Ayina Transports</h4>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">Confort et liaisons inter-préfectorales à haute cadence de départs.</p>
            </div>
            <div className="mt-4 pt-2 flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-secondary">rule</span>
              <span className="font-medium">Audit technique de gare</span>
            </div>
          </div>
        </div>

        {/* CARRIER ONBOARDING CALLOUT */}
        <div className="bg-primary-container text-on-primary rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-outline-variant/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-container/10 flex items-center justify-center shrink-0 text-secondary-fixed">
              <span className="material-symbols-outlined text-[32px]">handshake</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold">Vous êtes une compagnie de transport ?</h3>
              <p className="font-body-md text-body-md text-on-primary-container mt-1">
                Rejoignez le réseau Ticket+ et optimisez le taux de remplissage de vos cars grâce à notre billetterie dématérialisée sécurisée.
              </p>
            </div>
          </div>
          <Link
            className="shrink-0 px-6 py-3.5 rounded-xl bg-secondary text-on-secondary font-title-md text-title-md hover:bg-on-secondary-container transition-all active:scale-95 shadow-md font-bold"
            href={`/${locale}/contact`}
          >
            Devenir compagnie partenaire
          </Link>
        </div>
      </section>

      {/* =========================================================================
          3. AVANTAGES EXCLUSIFS (Pourquoi choisir Ticket+ ?)
         ========================================================================= */}
      <section className="bg-surface-container-low py-space-xl border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-extrabold">Avantages Exclusifs</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mt-2">
              Pourquoi choisir Ticket+ pour vos voyages ?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2 leading-relaxed">
              Une conception pensée pour simplifier radicalement la vie des voyageurs réguliers et occasionnels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[26px]">chat</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Billetterie 100% WhatsApp &amp; SMS</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Plus besoin d&apos;imprimer votre ticket. Votre QR code officiel arrive directement sur votre messagerie et par SMS de secours avec tous les détails.
                </p>
              </div>
              <div className="mt-5 pt-2 border-t border-outline-variant/20">
                <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary font-bold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Format smartphone universel
                </span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[26px]">verified</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Tarifs Officiels Garantis</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Payez exactement le prix fixé en gare sans commission occulte. Réglable en 30 secondes via MTN MoMo, Moov Money ou carte bancaire.
                </p>
              </div>
              <div className="mt-5 pt-2 border-t border-outline-variant/20">
                <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary font-bold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Paiement 100% sécurisé
                </span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-primary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[26px]">airline_seat_recline_extra</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Choix Libre du Siège</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Sélectionnez votre place préférée en visualisant le plan réel de l&apos;autocar : fenêtre pour la vue panoramique, allée ou rangées avant.
                </p>
              </div>
              <div className="mt-5 pt-2 border-t border-outline-variant/20">
                <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary font-bold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Plan interactif en direct
                </span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-secondary flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[26px]">timer_off</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Zéro File d&apos;Attente</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Fini les bousculades aux guichets de gare dès l&apos;aube. Arrivez 20 minutes avant le départ et montez à bord l&apos;esprit totalement serein.
                </p>
              </div>
              <div className="mt-5 pt-2 border-t border-outline-variant/20">
                <span className="inline-flex items-center gap-1 font-label-md text-label-md text-secondary font-bold">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Embarquement express
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. PROCESSUS SANS EFFORT (Comment fonctionne Ticket+ en 3 étapes ?)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-space-xl">
        <div className="text-center max-w-2xl mx-auto mb-space-xl">
          <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-extrabold">Processus Sans Effort</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mt-2">Comment fonctionne Ticket+ ?</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Votre billet officiel confirmé en moins de deux minutes chrono.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-md text-headline-md text-primary font-bold">
                  1
                </div>
                <span className="material-symbols-outlined text-secondary text-[26px]">travel_explore</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Comparez les départs et horaires</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Entrez votre ville d&apos;origine et de destination. Visualisez instantanément les heures de départ, les gares d&apos;embarquement et les compagnies partenaires.
              </p>
            </div>
            <div className="mt-6 p-2.5 bg-surface-container-low rounded-xl text-center font-label-md text-label-md text-on-surface-variant font-medium">
              Affichage en temps réel
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center font-headline-md text-headline-md text-on-secondary-container font-bold">
                  2
                </div>
                <span className="material-symbols-outlined text-secondary text-[26px]">event_seat</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Sélectionnez votre siège</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Choisissez votre fauteuil sur le plan d&apos;implantation du car. Saisissez le prénom, nom et numéro de téléphone WhatsApp du passager.
              </p>
            </div>
            <div className="mt-6 p-2.5 bg-surface-container-low rounded-xl text-center font-label-md text-label-md text-on-surface-variant font-medium">
              Attribution immédiate garantie
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-headline-md text-headline-md text-primary font-bold">
                  3
                </div>
                <span className="material-symbols-outlined text-secondary text-[26px]">contactless</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-2">Réglez et embarquez</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Confirmez par MTN MoMo ou Moov Money. Vous recevez sur-le-champ votre QR code de contrôle officiel sur WhatsApp &amp; SMS. Présentez-le à la gare.
              </p>
            </div>
            <div className="mt-6 p-2.5 bg-surface-container-low rounded-xl text-center font-label-md text-label-md text-on-surface-variant font-medium">
              Contrôle digital en 3 secondes
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SIMULATEUR INTERACTIF CABINE & TITRE SÉCURISÉ
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-space-xl">
        <div className="bg-surface-container rounded-3xl p-6 sm:p-8 lg:p-10 shadow-md border border-outline-variant/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Interactive Micro Seat Demo */}
            <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-title-md text-title-md text-on-surface font-bold">Disposition Cabine</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Exemple autocar Confort Lines (52 sièges)</p>
                </div>
                <span className="material-symbols-outlined text-secondary text-[22px]">airline_seat_recline_normal</span>
              </div>

              {/* Coach layout mockup with click handler */}
              <div className="p-4 bg-surface-container-low rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center px-1 text-label-sm font-label-sm text-on-surface-variant">
                  <span>Poste Conducteur</span>
                  <span className="material-symbols-outlined text-[18px]">airline_seat_recline_extra</span>
                </div>

                {/* Seat grid simulator */}
                <div className="grid grid-cols-5 gap-2 text-center text-xs font-bold">
                  {/* Row 1 */}
                  <button type="button" onClick={() => setSelectedSeat('01')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '01' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest'}`}>01</button>
                  <button type="button" onClick={() => setSelectedSeat('02')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '02' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest'}`}>02</button>
                  <div className="text-on-surface-variant/40 flex items-center justify-center font-label-sm">Allée</div>
                  <button type="button" onClick={() => setSelectedSeat('03')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '03' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'}`}>03</button>
                  <button type="button" onClick={() => setSelectedSeat('04')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '04' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'}`}>04</button>

                  {/* Row 2 */}
                  <button type="button" onClick={() => setSelectedSeat('05')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '05' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'}`}>05</button>
                  <button type="button" onClick={() => setSelectedSeat('06')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '06' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'}`}>06</button>
                  <div className="text-on-surface-variant/40 flex items-center justify-center font-label-sm">Allée</div>
                  <button type="button" onClick={() => setSelectedSeat('07')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '07' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'}`}>07</button>
                  <button type="button" onClick={() => setSelectedSeat('08')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '08' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest'}`}>08</button>

                  {/* Row 3 */}
                  <button type="button" onClick={() => setSelectedSeat('09')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '09' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'}`}>09</button>
                  <button type="button" onClick={() => setSelectedSeat('10')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '10' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-highest'}`}>10</button>
                  <div className="text-on-surface-variant/40 flex items-center justify-center font-label-sm">Allée</div>
                  <button type="button" onClick={() => setSelectedSeat('11')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '11' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'}`}>11</button>
                  <button type="button" onClick={() => setSelectedSeat('12')} className={`p-2 rounded-lg transition-colors ${selectedSeat === '12' ? 'bg-secondary text-on-secondary ring-2 ring-secondary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-variant'}`}>12</button>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-around pt-3 border-t border-surface-variant text-label-sm font-label-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-secondary"></span>
                    <span className="font-bold">Siège {selectedSeat} (Sélectionné)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-surface-container-highest"></span>
                    <span>Libre</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-surface-variant"></span>
                    <span>Occupé</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory copy */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 bg-surface-container-lowest px-3.5 py-1.5 rounded-full self-start shadow-sm border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                <span className="font-label-md text-label-md text-on-surface font-bold">Transparence Totale des Réservations</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight">
                Chaque passager monte avec un titre authentifié et vérifiable.
              </h3>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                Le QR Code Ticket+ intègre l&apos;identifiant unique du voyageur, son siège attribué, la gare exacte d&apos;embarquement et la référence de paiement mobile. Les contrôleurs en gare scannent directement l&apos;écran de votre smartphone sans nécessiter de papier.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
                  <div className="flex items-center gap-2 text-secondary font-title-md text-title-md font-bold">
                    <span className="material-symbols-outlined">payments</span>
                    <span>Mobile Money Natif</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Paiement sans carte de crédit : tapez votre code secret directement sur votre combiné.</p>
                </div>
                <div className="p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
                  <div className="flex items-center gap-2 text-secondary font-title-md text-title-md font-bold">
                    <span className="material-symbols-outlined">notifications_active</span>
                    <span>Rappels de Départ</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Notification WhatsApp 2 heures avant le trajet avec rappel des accès à la gare.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. AVIS & TÉMOIGNAGES DES VOYAGEURS BÉNINOIS
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-space-xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
          <div>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest font-extrabold">Confiance Établie</span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-extrabold tracking-tight mt-2">
              Ce que disent les voyageurs béninois
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-xl shadow-sm border border-outline-variant/30">
            <span className="material-symbols-outlined text-secondary text-[22px]">star</span>
            <span className="font-title-md text-title-md text-on-surface font-bold">4.9 / 5</span>
            <span className="font-body-md text-body-md text-on-surface-variant">sur plus de 1 200 départs supervisés</span>
          </div>
        </div>

        {/* Testimonials 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-space-xl">
          {/* Testimonial 1 */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-secondary mb-3">
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
            <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center gap-3">
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
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-secondary mb-3">
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
            <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center gap-3">
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
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-secondary mb-3">
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
            <div className="mt-5 pt-3 border-t border-outline-variant/20 flex items-center gap-3">
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
        <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-around gap-4 text-on-surface-variant border border-outline-variant/30">
          <div className="flex items-center gap-2 font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined text-secondary text-[20px]">lock</span>
            <span>Transactions Cryptées SSL 256 bits</span>
          </div>
          <div className="flex items-center gap-2 font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined text-secondary text-[20px]">policy</span>
            <span>Conforme Réglementation Transport Bénin</span>
          </div>
          <div className="flex items-center gap-2 font-label-md text-label-md font-semibold">
            <span className="material-symbols-outlined text-secondary text-[20px]">chat</span>
            <span>Assistance directe WhatsApp : +229 01 54 65 89 07</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. APPEL À L'ACTION FINALE (CTA BANNER)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-space-xl">
        <div className="relative bg-primary text-on-primary rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl border border-outline-variant/20">
          {/* Decorative Backdrop circles */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-secondary/30 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-surface-container/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl flex flex-col gap-5">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full self-start backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
              <span className="font-label-md text-label-md text-secondary-fixed font-bold">Embarquement immédiat</span>
            </div>

            <h2 className="font-display-lg text-display-lg text-on-primary tracking-tight font-extrabold leading-tight">
              Prêt à voyager autrement ?
            </h2>

            <p className="font-body-lg text-body-lg text-white/80 max-w-2xl leading-relaxed">
              Créez votre compte voyageur en 30 secondes ou réservez votre prochain trajet interurbain dès maintenant avec {confortLines.name} et notre réseau national certifié.
            </p>

            {/* CTA Buttons - Dirigent vers la page de connexion / inscription */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-surface-container-lowest text-on-surface font-headline-sm text-headline-sm hover:bg-surface-container-low transition-all shadow-lg active:scale-95 font-bold" 
                href={`/${locale}/login`}
              >
                <span>Créer un compte gratuit</span>
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </Link>

              <Link 
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-secondary text-on-secondary font-headline-sm text-headline-sm hover:bg-on-secondary-container transition-all shadow-md active:scale-95 font-bold" 
                href={`/${locale}/login`}
              >
                <span>Se connecter</span>
                <span className="material-symbols-outlined text-[20px]">login</span>
              </Link>

              <a 
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-title-md text-title-md hover:bg-white/20 transition-all active:scale-95 border border-white/20" 
                href="https://wa.me/2290154658907"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>Support WhatsApp</span>
              </a>
            </div>

            {/* Micro footer text inside banner */}
            <div className="flex items-center gap-2 text-white/70 font-label-sm text-label-sm pt-2">
              <span className="material-symbols-outlined text-[16px] text-secondary-fixed">bolt</span>
              <span>Confirmation instantanée par SMS &amp; WhatsApp dès validation du paiement.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
