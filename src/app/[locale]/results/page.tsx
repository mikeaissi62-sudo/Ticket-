'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function ResultsPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || 'Cotonou';
  const to = searchParams.get('to') || 'Parakou';
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const passengers = searchParams.get('passengers') || '1';

  const [showSearchDrawer, setShowSearchDrawer] = useState(false);

  // Format date for display
  const dateObj = new Date(dateParam + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col w-full">

      {/* ============ TOP ROUTE BRIEF & STICKY NAVIGATION BAR ============ */}
      <section className="w-full bg-surface-container-lowest shadow-sm">
        <div className="max-w-[1140px] mx-auto px-gutter py-space-md">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">

            {/* Journey Visual Breadcrumb */}
            <div className="flex items-center gap-space-md flex-wrap">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{from}</span>
                <div className="flex items-center text-secondary">
                  <span className="w-8 h-[2px] bg-secondary/30 rounded-full"></span>
                  <span className="material-symbols-outlined text-[20px] -ml-1">arrow_forward</span>
                </div>
                <span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">{to}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-secondary text-[18px]">calendar_today</span>
                <span className="font-label-md text-label-md text-on-surface font-medium capitalize">{formattedDate}</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant mx-1"></span>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
                <span className="font-label-md text-label-md text-on-surface font-medium">{passengers} Voyageur{Number(passengers) > 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Quick Modify Search Button */}
            <div className="flex items-center gap-space-sm w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-label-sm text-label-sm font-semibold">3 Départs Directs Garantis</span>
              </div>
              <button
                onClick={() => setShowSearchDrawer(!showSearchDrawer)}
                className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-md text-body-md font-semibold transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Modifier</span>
              </button>
            </div>
          </div>

          {/* Expandable Mini Modify Form */}
          {showSearchDrawer && (
            <div className="pt-space-md mt-space-md bg-surface-container-low p-space-md rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm">
                <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">trip_origin</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Origine</span>
                    <input className="bg-transparent font-body-md text-body-md font-semibold text-on-surface focus:outline-none" type="text" defaultValue={`${from} (Toutes gares)`} />
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Destination</span>
                    <input className="bg-transparent font-body-md text-body-md font-semibold text-on-surface focus:outline-none" type="text" defaultValue={`${to} (Centre-ville)`} />
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">event</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date</span>
                    <input className="bg-transparent font-body-md text-body-md font-semibold text-on-surface focus:outline-none" type="date" defaultValue={dateParam} />
                  </div>
                </div>
                <button className="bg-primary text-on-primary py-3 rounded-lg font-body-md text-body-md font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  <span>Mettre à jour</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============ DATE NAVIGATION RIBBON ============ */}
        <div className="w-full bg-surface-container-low/60">
          <div className="max-w-[1140px] mx-auto px-gutter py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {/* Hier (Complet) */}
            <button className="flex-1 min-w-[170px] py-2 px-3 rounded-lg text-left opacity-60 hover:opacity-80 transition-opacity bg-transparent">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Hier • 23 Oct.</span>
                <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-semibold uppercase">Complet</span>
              </div>
              <div className="font-label-md text-label-md text-outline">Tous départs passés</div>
            </button>

            {/* Aujourd'hui (Actif) */}
            <button className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl bg-surface-container-lowest shadow-sm text-left relative transition-all">
              <div className="absolute -top-1 right-3">
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-bold tracking-wide uppercase">Sélectionné</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Aujourd&apos;hui</span>
                <span className="font-label-md text-label-md text-secondary font-semibold">24 Octobre</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">À partir de <span className="font-bold text-on-surface">6 500 FCFA</span></span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">3 bus dispo</span>
              </div>
            </button>

            {/* Demain */}
            <button className="flex-1 min-w-[180px] py-2 px-3 rounded-lg text-left hover:bg-surface-container-lowest/80 transition-all">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Demain • 25 Oct.</span>
                <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">4 départs</span>
              </div>
              <div className="font-label-md text-label-md text-on-surface font-semibold">Dès 6 500 FCFA</div>
            </button>

            {/* Samedi */}
            <button className="hidden lg:flex flex-col flex-1 min-w-[160px] py-2 px-3 rounded-lg text-left hover:bg-surface-container-lowest/80 transition-all">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Samedi • 26 Oct.</span>
              </div>
              <div className="font-label-md text-label-md text-on-surface font-semibold">Dès 6 500 FCFA</div>
            </button>

            <button className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant shrink-0" title="Voir calendrier complet">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <div className="w-full max-w-[1140px] mx-auto px-gutter py-space-xl">

        {/* Filter Chips Row */}
        <div className="flex items-center justify-between gap-space-md mb-space-lg flex-wrap">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-label-sm text-label-sm text-on-surface-variant mr-2 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">filter_list</span> Filtrer :
            </span>
            <button className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all">
              Tous les départs (3)
            </button>
            <button className="px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span>Confort Lines</span>
              <span className="bg-secondary-container px-1.5 py-0.5 rounded text-[10px] text-on-secondary-container font-bold">Actif</span>
            </button>
            <button className="px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all">
              <span className="material-symbols-outlined text-[16px] text-secondary">ac_unit</span>
              <span>Bus Climatisé VIP</span>
            </button>
            <button className="px-3 py-1.5 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all">
              <span className="material-symbols-outlined text-[16px] text-secondary">bolt</span>
              <span>Trajet Direct RNIE 2</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Trier par :</span>
            <select className="bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold px-3 py-1.5 rounded-lg shadow-sm focus:outline-none cursor-pointer">
              <option>Départ le plus tôt (07h00)</option>
              <option>Prix le plus bas (6 500 F)</option>
              <option>Places disponibles</option>
            </select>
          </div>
        </div>

        {/* ============ ACTIVE ROUTE LAYOUT GRID ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">

          {/* ======== List of Departures (8 columns) ======== */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">

            {/* ---- Departure 1: 07:00 VIP Morning ---- */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              {/* Header */}
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-title-md font-bold text-on-surface">Confort Lines</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Partenaire Officiel
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Autocar Grand Tourisme VIP • RNIE 2 Direct</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span>
                  <span className="font-label-md text-label-md font-bold">8 places restantes</span>
                </div>
              </div>

              {/* Schedule & Stations Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center my-space-md py-space-sm bg-surface-container-low/40 px-space-md rounded-xl">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">07:00</span>
                    <span className="font-label-sm text-[10px] uppercase font-bold text-secondary bg-surface-container px-1.5 py-0.5 rounded">Matin</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{from}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Gare Étoile Rouge
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">6h 30m de trajet</span>
                  <div className="w-full flex items-center gap-1 text-outline">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <div className="flex-1 h-[2px] bg-outline-variant relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-secondary">
                        <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  </div>
                  <span className="font-label-sm text-[10px] text-secondary font-semibold mt-1">Direct sans escale longue</span>
                </div>
                <div className="flex flex-col md:text-right">
                  <div className="flex items-center md:justify-end gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">13:30</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{to}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center md:justify-end gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Terminus Gare Centrale {to}
                  </span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex items-center gap-space-sm flex-wrap py-2">
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">ac_unit</span> Climatisation continue
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">wifi</span> Wi-Fi HD 4G
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">power</span> Prises USB / 220V
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">airline_seat_recline_extra</span> Sièges Inclinables
                </span>
              </div>

              {/* Price + CTA */}
              <div className="pt-space-md mt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] leading-8 font-bold text-on-surface">6 500</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                    <span className="font-label-sm text-[10px] text-secondary bg-secondary-container/40 px-1.5 py-0.5 rounded font-bold">Tarif Officiel Garanti</span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Taxes &amp; assurance passager incluses</p>
                </div>
                <Link href={`/${locale}/seat/1`} className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]">
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* ---- Departure 2: 09:30 Confort Lines Express ---- */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-title-md font-bold text-on-surface">Confort Lines Express</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Partenaire Officiel
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Départ Gare Jonquet • Collation et boisson offertes</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container">
                  <span className="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span>
                  <span className="font-label-md text-label-md font-bold">12 places restantes</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center my-space-md py-space-sm bg-surface-container-low/40 px-space-md rounded-xl">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">09:30</span>
                    <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">Matinée</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{from}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Agence Principale Jonquet
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">6h 30m de trajet</span>
                  <div className="w-full flex items-center gap-1 text-outline">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <div className="flex-1 h-[2px] bg-outline-variant relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-secondary">
                        <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  </div>
                  <span className="font-label-sm text-[10px] text-secondary font-semibold mt-1">Arrêt rapide Bohicon</span>
                </div>
                <div className="flex flex-col md:text-right">
                  <div className="flex items-center md:justify-end gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">16:00</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{to}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center md:justify-end gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Terminus Gare Centrale
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-space-sm flex-wrap py-2">
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">ac_unit</span> Climatisation intégrale
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">bakery_dining</span> Collation incluse
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">luggage</span> Bagage 25kg inclus
                </span>
              </div>

              <div className="pt-space-md mt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] leading-8 font-bold text-on-surface">6 500</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                    <span className="font-label-sm text-[10px] text-secondary bg-secondary-container/40 px-1.5 py-0.5 rounded font-bold">Sans Commission</span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Paiement Mobile Money ou CB</p>
                </div>
                <Link href={`/${locale}/seat/2`} className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]">
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* ---- Departure 3: 14:00 VIP Soirée (Low Seats Warning) ---- */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-title-md font-bold text-on-surface">Confort Lines VIP Soirée</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Partenaire Officiel
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Gare Étoile Rouge • Arrivée sécurisée en début de soirée</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/50 text-on-error-container">
                  <span className="material-symbols-outlined text-[16px]">alarm</span>
                  <span className="font-label-md text-label-md font-bold">Plus que 4 places !</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center my-space-md py-space-sm bg-surface-container-low/40 px-space-md rounded-xl">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">14:00</span>
                    <span className="font-label-sm text-[10px] uppercase font-bold text-on-tertiary-fixed-variant bg-tertiary-fixed px-1.5 py-0.5 rounded">Après-midi</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{from}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Gare Étoile Rouge
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">6h 30m de trajet</span>
                  <div className="w-full flex items-center gap-1 text-outline">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <div className="flex-1 h-[2px] bg-outline-variant relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-secondary">
                        <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  </div>
                  <span className="font-label-sm text-[10px] text-secondary font-semibold mt-1">Direct via Savè</span>
                </div>
                <div className="flex flex-col md:text-right">
                  <div className="flex items-center md:justify-end gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">20:30</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{to}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center md:justify-end gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Terminus {to} Dépôt
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-space-sm flex-wrap py-2">
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">ac_unit</span> Climatisation
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">tv</span> Écran Vidéo HD
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">airline_seat_recline_extra</span> Sièges Cuir VIP
                </span>
              </div>

              <div className="pt-space-md mt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] leading-8 font-bold text-on-surface">6 500</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                  </div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Attribution directe sur le plan du car</p>
                </div>
                <Link href={`/${locale}/seat/3`} className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]">
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* ---- Ongoing Carrier Integration Notice ---- */}
            <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm">
              <div className="flex items-start gap-space-md">
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
                  <span className="material-symbols-outlined text-[22px]">domain_add</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                    <span className="font-title-md text-title-md font-bold text-on-surface">Autres compagnies en cours d&apos;intégration</span>
                    <span className="font-label-sm text-[11px] px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-semibold">Prochainement</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
                    Dans le cadre de l&apos;unification de la billetterie nationale, ces transporteurs rejoindront la plateforme de réservation instantanée très bientôt :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    {['Baobab Express', 'STM Voyageurs', 'ATT Transports'].map((name, i) => (
                      <div key={i} className="bg-surface-container-lowest p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px] text-outline">directions_bus</span>
                          <span className="font-body-md text-body-md font-semibold text-on-surface">{name}</span>
                        </div>
                        <span className="font-label-sm text-[10px] text-outline font-medium">Bientôt</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* ======== Right Column: Sidebar Widgets (4 columns) ======== */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">

            {/* Fleet Presentation Photo Card */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-48 w-full bg-surface-container-high">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">Flotte Certifiée Confort</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-on-primary">
                  <span className="font-title-md text-title-md font-bold block">Voyagez en toute sérénité</span>
                  <span className="font-label-sm text-label-sm text-on-primary/80">Bus climatisés avec chauffeur professionnel agréé</span>
                </div>
              </div>
              <div className="p-space-md space-y-space-sm">
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">security</span>
                  <div>
                    <span className="font-label-md text-label-md font-bold text-on-surface block">Contrôles techniques réguliers</span>
                    <span className="font-body-md text-body-md text-on-surface-variant">Maintenance certifiée avant chaque liaison interurbaine.</span>
                  </div>
                </div>
                <div className="flex items-start gap-space-sm">
                  <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">badge</span>
                  <div>
                    <span className="font-label-md text-label-md font-bold text-on-surface block">Chauffeurs assermentés</span>
                    <span className="font-body-md text-body-md text-on-surface-variant">Formés aux trajets longue distance et respect strict du code routier béninois.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Itinéraire RNIE 2 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-title-md text-title-md font-bold text-on-surface">Itinéraire RNIE 2</span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">415 km</span>
              </div>
              <div className="w-full h-36 bg-surface-container-high rounded-lg relative overflow-hidden mb-space-sm shadow-inner">
                <div className="absolute inset-0 bg-primary/20"></div>
                <div className="absolute bottom-2 left-2 bg-surface-container-lowest/90 px-2.5 py-1 rounded-md text-[11px] font-semibold text-on-surface flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px] text-secondary">navigation</span>
                  <span>Halte prévue : Bohicon</span>
                </div>
              </div>
              <div className="space-y-2 pt-1 text-on-surface-variant font-label-md text-label-md">
                <div className="flex items-center justify-between">
                  <span>Point de départ</span>
                  <span className="font-semibold text-on-surface">Gare de {from}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Villes traversées</span>
                  <span className="text-right text-on-surface font-medium">Allada, Bohicon, Dassa, Savè</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Terminus</span>
                  <span className="font-semibold text-on-surface">Gare de {to}</span>
                </div>
              </div>
            </div>

            {/* Besoin d'aide ? */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex items-center gap-2 mb-space-sm">
                <span className="material-symbols-outlined text-[20px] text-secondary">contact_support</span>
                <span className="font-title-md text-title-md font-bold text-on-surface">Besoin d&apos;aide ?</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                Une question sur les heures d&apos;embarquement ou les bagages ? Nos conseillers sont joignables directement à {from}.
              </p>
              <a className="w-full py-2.5 px-space-md rounded-xl bg-secondary-container/60 hover:bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold flex items-center justify-center gap-2 transition-colors" href="https://wa.me/2290154658907" target="_blank" rel="noopener noreferrer">
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Échanger sur WhatsApp (+229)</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* ============ REASSURANCE GLOBAL STRIP ============ */}
      <section className="w-full bg-surface-container-lowest shadow-sm mt-space-lg">
        <div className="max-w-[1140px] mx-auto px-gutter py-space-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            <div className="flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-[22px]">price_check</span>
              </div>
              <div>
                <span className="font-title-md text-title-md font-bold text-on-surface block mb-1">Tarifs Officiels Garantis</span>
                <span className="font-body-md text-body-md text-on-surface-variant">Strictement identique au prix au guichet en gare, sans frais cachés.</span>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-[22px]">airline_seat_recline_extra</span>
              </div>
              <div>
                <span className="font-title-md text-title-md font-bold text-on-surface block mb-1">Choix Précis du Siège</span>
                <span className="font-body-md text-body-md text-on-surface-variant">Visualisez l&apos;agencement du bus et réservez votre place préférée en temps réel.</span>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-[22px]">qr_code_2</span>
              </div>
              <div>
                <span className="font-title-md text-title-md font-bold text-on-surface block mb-1">Billet Instantané QR</span>
                <span className="font-body-md text-body-md text-on-surface-variant">Reçu directement par SMS et WhatsApp dès la validation de votre paiement.</span>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center text-on-secondary-container shrink-0">
                <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
              </div>
              <div>
                <span className="font-title-md text-title-md font-bold text-on-surface block mb-1">Paiement Mobile National</span>
                <span className="font-body-md text-body-md text-on-surface-variant">Règlement direct et sans surcoût via MTN Mobile Money, Moov Money et Visa/Mastercard.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
