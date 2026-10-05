'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const cities = ["Cotonou", "Parakou", "Bohicon", "Natitingou", "Djougou", "Porto-Novo", "Abomey"];

export default function ResultsPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const from = searchParams.get('from') || 'Cotonou';
  const to = searchParams.get('to') || 'Parakou';
  
  // Base dates
  const today = new Date();
  const defaultDate = today.toISOString().split('T')[0];
  const dateParam = searchParams.get('date') || defaultDate;
  const passengers = searchParams.get('passengers') || '1';

  const ROUTES = [
    { from: 'Cotonou', to: 'Parakou', distance: '420 km', duration: '6h 30m', price: 6500 },
    { from: 'Cotonou', to: 'Natitingou', distance: '560 km', duration: '9h 45m', price: 9000 },
    { from: 'Cotonou', to: 'Bohicon', distance: '120 km', duration: '2h 15m', price: 3500 },
    { from: 'Cotonou', to: 'Djougou', distance: '460 km', duration: '7h 30m', price: 8000 },
    { from: 'Cotonou', to: 'Tanguiéta', distance: '600 km', duration: '10h 30m', price: 10000 },
    { from: 'Parakou', to: 'Natitingou', distance: '140 km', duration: '3h 00m', price: 4000 },
    { from: 'Bohicon', to: 'Parakou', distance: '300 km', duration: '4h 30m', price: 5000 },
    { from: 'Cotonou', to: 'Porto-Novo', distance: '30 km', duration: '0h 45m', price: 1500 },
  ];

  const currentRoute = ROUTES.find(r => 
    (r.from.toLowerCase() === from.toLowerCase() && r.to.toLowerCase() === to.toLowerCase()) || 
    (r.to.toLowerCase() === from.toLowerCase() && r.from.toLowerCase() === to.toLowerCase())
  ) || { price: 6500, duration: '6h 30m', distance: '420 km' };

  const basePrice = currentRoute.price;
  const formatPrice = (p: number) => p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [editFrom, setEditFrom] = useState(from);
  const [editTo, setEditTo] = useState(to);
  const [editDate, setEditDate] = useState(dateParam);

  const [filterConfort, setFilterConfort] = useState(false);
  const [filterBaobab, setFilterBaobab] = useState(false);
  const [filterATT, setFilterATT] = useState(false);
  const [filterSTM, setFilterSTM] = useState(false);
  const [filterVIP, setFilterVIP] = useState(false);
  const [filterDirect, setFilterDirect] = useState(false);
  const [sortBy, setSortBy] = useState('timeAsc');

  // Departure data for sorting/filtering
  const d1_time = 700; const d1_price = basePrice; const d1_seats = 23; 
  const d1_vip = true; const d1_direct = true; const d1_company = 'confort';

  const d2_time = 930; const d2_price = basePrice; const d2_seats = 15; 
  const d2_vip = false; const d2_direct = false; const d2_company = 'confort';

  const d3_time = 1400; const d3_price = basePrice; const d3_seats = 5; 
  const d3_vip = true; const d3_direct = true; const d3_company = 'confort';

  const d4_time = 800; const d4_price = basePrice * 0.9; const d4_seats = 18;
  const d4_vip = false; const d4_direct = true; const d4_company = 'baobab';

  const d5_time = 1100; const d5_price = basePrice * 1.1; const d5_seats = 12;
  const d5_vip = true; const d5_direct = true; const d5_company = 'att';

  const d6_time = 1530; const d6_price = basePrice * 0.8; const d6_seats = 30;
  const d6_vip = false; const d6_direct = false; const d6_company = 'stm';

  const isCompanySelected = filterConfort || filterBaobab || filterATT || filterSTM;

  const showD1 = (!isCompanySelected || filterConfort) && (!filterVIP || d1_vip) && (!filterDirect || d1_direct);
  const showD2 = (!isCompanySelected || filterConfort) && (!filterVIP || d2_vip) && (!filterDirect || d2_direct);
  const showD3 = (!isCompanySelected || filterConfort) && (!filterVIP || d3_vip) && (!filterDirect || d3_direct);
  const showD4 = (!isCompanySelected || filterBaobab) && (!filterVIP || d4_vip) && (!filterDirect || d4_direct);
  const showD5 = (!isCompanySelected || filterATT) && (!filterVIP || d5_vip) && (!filterDirect || d5_direct);
  const showD6 = (!isCompanySelected || filterSTM) && (!filterVIP || d6_vip) && (!filterDirect || d6_direct);

  const getOrder = (id: number) => {
    const data = [
      { id: 1, t: d1_time, p: d1_price, s: d1_seats },
      { id: 2, t: d2_time, p: d2_price, s: d2_seats },
      { id: 3, t: d3_time, p: d3_price, s: d3_seats },
      { id: 4, t: d4_time, p: d4_price, s: d4_seats },
      { id: 5, t: d5_time, p: d5_price, s: d5_seats },
      { id: 6, t: d6_time, p: d6_price, s: d6_seats },
    ];
    if (sortBy === 'timeAsc') data.sort((a,b) => a.t - b.t);
    else if (sortBy === 'priceAsc') data.sort((a,b) => a.p - b.p);
    else if (sortBy === 'seatsDesc') data.sort((a,b) => b.s - a.s);
    
    return data.findIndex(d => d.id === id);
  };

  // Sync edit state with URL params
  useEffect(() => {
    setEditFrom(from);
    setEditTo(to);
    setEditDate(dateParam);
  }, [from, to, dateParam]);

  const updateSearch = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleUpdate = () => {
    updateSearch({ from: editFrom, to: editTo, date: editDate });
    setShowSearchDrawer(false);
  };

  // Format date for display
  const dateObj = new Date(dateParam + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

  // Date Ribbon Helpers
  const formatDateForUrl = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };
  const formatShortDate = (date: Date) => date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
  if (today.getDay() === 6) nextSaturday.setDate(nextSaturday.getDate() + 7);

  const isSelectedDate = (d: Date) => formatDateForUrl(d) === dateParam;

  const bookingParams = new URLSearchParams({
    from,
    to,
    date: dateParam,
    passengers
  }).toString();

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
                  <div className="flex flex-col w-full">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Origine</span>
                    <select 
                      className="bg-transparent font-body-md text-body-md font-semibold text-on-surface focus:outline-none cursor-pointer w-full"
                      value={editFrom}
                      onChange={(e) => setEditFrom(e.target.value)}
                    >
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">location_on</span>
                  <div className="flex flex-col w-full">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Destination</span>
                    <select 
                      className="bg-transparent font-body-md text-body-md font-semibold text-on-surface focus:outline-none cursor-pointer w-full"
                      value={editTo}
                      onChange={(e) => setEditTo(e.target.value)}
                    >
                      {cities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-3 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">event</span>
                  <div className="flex flex-col w-full">
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date</span>
                    <input 
                      className="bg-transparent font-body-md text-body-md font-semibold text-on-surface focus:outline-none w-full" 
                      type="date" 
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                    />
                  </div>
                </div>
                <button onClick={handleUpdate} className="bg-primary text-on-primary py-3 rounded-lg font-body-md text-body-md font-semibold hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
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
            {/* Hier */}
            <button 
              onClick={() => updateSearch({ date: formatDateForUrl(yesterday) })}
              className={`flex-1 min-w-[170px] py-2 px-3 rounded-lg text-left transition-all ${isSelectedDate(yesterday) ? 'bg-surface-container-lowest shadow-sm ring-1 ring-secondary' : 'opacity-60 hover:opacity-80'}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-label-sm text-label-sm ${isSelectedDate(yesterday) ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>Hier • {formatShortDate(yesterday)}</span>
                <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-semibold uppercase">Complet</span>
              </div>
              <div className="font-label-md text-label-md text-outline">Tous départs passés</div>
            </button>

            {/* Aujourd'hui */}
            <button 
              onClick={() => updateSearch({ date: formatDateForUrl(today) })}
              className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-left relative transition-all ${isSelectedDate(today) ? 'bg-surface-container-lowest shadow-sm ring-1 ring-secondary' : 'hover:bg-surface-container-lowest/80'}`}
            >
              {isSelectedDate(today) && (
                <div className="absolute -top-1 right-3">
                  <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-bold tracking-wide uppercase">Sélectionné</span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className={`font-headline-sm text-headline-sm font-bold ${isSelectedDate(today) ? 'text-on-surface' : 'text-on-surface-variant'}`}>Aujourd'hui</span>
                <span className={`font-label-md text-label-md font-semibold ${isSelectedDate(today) ? 'text-secondary' : 'text-outline-variant'}`}>{formatShortDate(today)}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">À partir de <span className="font-bold text-on-surface">{formatPrice(basePrice)} FCFA</span></span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold">3 bus dispo</span>
              </div>
            </button>

            {/* Demain */}
            <button 
              onClick={() => updateSearch({ date: formatDateForUrl(tomorrow) })}
              className={`flex-1 min-w-[180px] py-2 px-3 rounded-lg text-left transition-all ${isSelectedDate(tomorrow) ? 'bg-surface-container-lowest shadow-sm ring-1 ring-secondary' : 'hover:bg-surface-container-lowest/80'}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-label-sm text-label-sm ${isSelectedDate(tomorrow) ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>Demain • {formatShortDate(tomorrow)}</span>
                <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">4 départs</span>
              </div>
              <div className="font-label-md text-label-md text-on-surface font-semibold">Dès {formatPrice(basePrice)} FCFA</div>
            </button>

            {/* Samedi */}
            <button 
              onClick={() => updateSearch({ date: formatDateForUrl(nextSaturday) })}
              className={`hidden lg:flex flex-col flex-1 min-w-[160px] py-2 px-3 rounded-lg text-left transition-all ${isSelectedDate(nextSaturday) ? 'bg-surface-container-lowest shadow-sm ring-1 ring-secondary' : 'hover:bg-surface-container-lowest/80'}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-label-sm text-label-sm ${isSelectedDate(nextSaturday) ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>Samedi • {formatShortDate(nextSaturday)}</span>
              </div>
              <div className="font-label-md text-label-md text-on-surface font-semibold">Dès {formatPrice(basePrice)} FCFA</div>
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
            <button 
              onClick={() => { setFilterConfort(false); setFilterBaobab(false); setFilterATT(false); setFilterSTM(false); setFilterVIP(false); setFilterDirect(false); }}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold transition-all ${!filterConfort && !filterBaobab && !filterATT && !filterSTM && !filterVIP && !filterDirect ? 'bg-[#0f172a] text-white' : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'}`}
            >
              Tous les départs
            </button>
            <button 
              onClick={() => setFilterConfort(!filterConfort)}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all bg-surface-container-lowest hover:bg-surface-container text-on-surface`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0d9488]"></span>
              <span>Confort Lines</span>
              {filterConfort && <span className="bg-[#5eead4] text-[#134e4a] px-1.5 py-0.5 rounded text-[10px] font-bold">Actif</span>}
            </button>
            <button 
              onClick={() => setFilterBaobab(!filterBaobab)}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all bg-surface-container-lowest hover:bg-surface-container text-on-surface`}
            >
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
              <span>Baobab Express</span>
              {filterBaobab && <span className="bg-[#fde68a] text-[#78350f] px-1.5 py-0.5 rounded text-[10px] font-bold">Actif</span>}
            </button>
            <button 
              onClick={() => setFilterATT(!filterATT)}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all bg-surface-container-lowest hover:bg-surface-container text-on-surface`}
            >
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
              <span>ATT Transports</span>
              {filterATT && <span className="bg-[#bfdbfe] text-[#1e3a8a] px-1.5 py-0.5 rounded text-[10px] font-bold">Actif</span>}
            </button>
            <button 
              onClick={() => setFilterSTM(!filterSTM)}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all bg-surface-container-lowest hover:bg-surface-container text-on-surface`}
            >
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
              <span>STM Voyageur</span>
              {filterSTM && <span className="bg-[#ddd6fe] text-[#4c1d95] px-1.5 py-0.5 rounded text-[10px] font-bold">Actif</span>}
            </button>
            <button 
              onClick={() => setFilterVIP(!filterVIP)}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all bg-surface-container-lowest hover:bg-surface-container text-on-surface mt-2 sm:mt-0`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#0d9488]">ac_unit</span>
              <span>Bus Climatisé VIP</span>
              {filterVIP && <span className="bg-[#5eead4] text-[#134e4a] px-1.5 py-0.5 rounded text-[10px] font-bold">Actif</span>}
            </button>
            <button 
              onClick={() => setFilterDirect(!filterDirect)}
              className={`px-3 py-1.5 rounded-full font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-all bg-surface-container-lowest hover:bg-surface-container text-on-surface mt-2 sm:mt-0`}
            >
              <span className="material-symbols-outlined text-[16px] text-[#0d9488]">bolt</span>
              <span>Trajet Direct RNIE 2</span>
              {filterDirect && <span className="bg-[#5eead4] text-[#134e4a] px-1.5 py-0.5 rounded text-[10px] font-bold">Actif</span>}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Trier par :</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold px-3 py-1.5 rounded-lg shadow-sm focus:outline-none cursor-pointer"
            >
              <option value="timeAsc">Départ le plus tôt (07h00)</option>
              <option value="priceAsc">Prix le plus bas ({formatPrice(basePrice)} F)</option>
              <option value="seatsDesc">Places disponibles</option>
            </select>
          </div>
        </div>

        {/* ============ ACTIVE ROUTE LAYOUT GRID ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">

          {/* ======== List of Departures (8 columns) ======== */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            
            {!showD1 && !showD2 && !showD3 && !showD4 && !showD5 && !showD6 && (
              <div className="bg-surface-container-lowest rounded-xl p-space-lg text-center shadow-sm">
                <span className="material-symbols-outlined text-outline text-[48px] mb-4">search_off</span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">Aucun départ ne correspond</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Essayez de modifier vos filtres de recherche.</p>
                <button onClick={() => { setFilterConfort(false); setFilterBaobab(false); setFilterATT(false); setFilterSTM(false); setFilterVIP(false); setFilterDirect(false); }} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold">Réinitialiser les filtres</button>
              </div>
            )}

            {/* ---- Departure 1: 07:00 VIP Morning ---- */}
            {showD1 && (
            <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" style={{ order: getOrder(1) }}>
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
                  <span className="font-label-md text-label-md font-bold">23 places restantes</span>
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
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">{currentRoute.duration} de trajet</span>
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
                    <span className="text-[28px] leading-8 font-bold text-on-surface">{formatPrice(d1_price)}</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                  </div>
                </div>
                <Link href={`/${locale}/reservation/1?${bookingParams}`} className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]">
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
            )}

            {/* ---- Departure 2: 09:30 Confort Lines Express ---- */}
            {showD2 && (
            <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" style={{ order: getOrder(2) }}>
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
                  <span className="font-label-md text-label-md font-bold">15 places restantes</span>
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
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">{currentRoute.duration} de trajet</span>
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
                    <span className="text-[28px] leading-8 font-bold text-on-surface">{formatPrice(d2_price)}</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                  </div>
                </div>
                <Link href={`/${locale}/reservation/2?${bookingParams}`} className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]">
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
            )}

            {/* ---- Departure 3: 14:00 VIP Soirée (Low Seats Warning) ---- */}
            {showD3 && (
            <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" style={{ order: getOrder(3) }}>
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
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span>
                  <span className="font-label-md text-label-md font-bold">5 places restantes</span>
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
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">{currentRoute.duration} de trajet</span>
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
                    <span className="text-[28px] leading-8 font-bold text-on-surface">{formatPrice(d3_price)}</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                  </div>
                </div>
                <Link href={`/${locale}/reservation/3?${bookingParams}`} className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]">
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
            )}

            {/* ---- Departure 4: 08:00 Baobab Express ---- */}
            {showD4 && (
            <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" style={{ order: getOrder(4) }}>
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#f59e0b] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-title-md font-bold text-on-surface">Baobab Express</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Partenaire Officiel
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Ligne Express Régionale</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container">
                  <span className="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span>
                  <span className="font-label-md text-label-md font-bold">{d4_seats} places restantes</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center my-space-md py-space-sm bg-surface-container-low/40 px-space-md rounded-xl">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">08:00</span>
                    <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">Matin</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{from}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Gare Principale
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">{currentRoute.duration} de trajet</span>
                  <div className="w-full flex items-center gap-1 text-outline">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
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
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">14:30</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{to}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center md:justify-end gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Agence Locale
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-space-sm flex-wrap py-2">
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">ac_unit</span> Climatisation
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-[#f59e0b]">bolt</span> Prises de courant
                </span>
              </div>

              <div className="pt-space-md mt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] leading-8 font-bold text-on-surface">{formatPrice(d4_price)}</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                  </div>
                </div>
                <Link href={`/${locale}/reservation/4?${bookingParams}`} className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]">
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
            )}

            {/* ---- Departure 5: 11:00 ATT Transports ---- */}
            {showD5 && (
            <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" style={{ order: getOrder(5) }}>
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-title-md font-bold text-on-surface">ATT Transports VIP</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Partenaire Officiel
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Trajet Inter-urbain Confort</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span>
                  <span className="font-label-md text-label-md font-bold">{d5_seats} places restantes</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center my-space-md py-space-sm bg-surface-container-low/40 px-space-md rounded-xl">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">11:00</span>
                    <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">Matin</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{from}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Terminus Principal
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">{currentRoute.duration} de trajet</span>
                  <div className="w-full flex items-center gap-1 text-outline">
                    <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
                    <div className="flex-1 h-[2px] bg-outline-variant relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-secondary">
                        <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  </div>
                  <span className="font-label-sm text-[10px] text-secondary font-semibold mt-1">Direct Rapide</span>
                </div>
                <div className="flex flex-col md:text-right">
                  <div className="flex items-center md:justify-end gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">17:30</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{to}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center md:justify-end gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Gare d'Arrivée
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-space-sm flex-wrap py-2">
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-[#3b82f6]">ac_unit</span> Climatisation VIP
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-[#3b82f6]">airline_seat_recline_extra</span> Sièges Ajustables
                </span>
              </div>

              <div className="pt-space-md mt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] leading-8 font-bold text-on-surface">{formatPrice(d5_price)}</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                  </div>
                </div>
                <Link href={`/${locale}/reservation/5?${bookingParams}`} className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]">
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
            )}

            {/* ---- Departure 6: 15:30 STM Voyageur ---- */}
            {showD6 && (
            <div className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group" style={{ order: getOrder(6) }}>
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#8b5cf6] flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-title-md font-bold text-on-surface">STM Voyageur</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Partenaire Officiel
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Classique Économique</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/40 text-on-secondary-container">
                  <span className="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span>
                  <span className="font-label-md text-label-md font-bold">{d6_seats} places restantes</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center my-space-md py-space-sm bg-surface-container-low/40 px-space-md rounded-xl">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">15:30</span>
                    <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">Après-midi</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{from}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Gare Routière
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">{currentRoute.duration} de trajet</span>
                  <div className="w-full flex items-center gap-1 text-outline">
                    <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
                    <div className="flex-1 h-[2px] bg-outline-variant relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-secondary">
                        <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  </div>
                  <span className="font-label-sm text-[10px] text-secondary font-semibold mt-1">Arrêts réguliers</span>
                </div>
                <div className="flex flex-col md:text-right">
                  <div className="flex items-center md:justify-end gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">22:00</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{to}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center md:justify-end gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span> Gare de Destination
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-space-sm flex-wrap py-2">
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-[#8b5cf6]">wind_power</span> Ventilation
                </span>
                <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-[#8b5cf6]">tv</span> TV à Bord
                </span>
              </div>

              <div className="pt-space-md mt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] leading-8 font-bold text-on-surface">{formatPrice(d6_price)}</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                  </div>
                </div>
                <Link href={`/${locale}/reservation/6?${bookingParams}`} className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]">
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
            )}

          </div>

          {/* ======== Right Column: Sidebar Widgets (4 columns) ======== */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">

            {/* Fleet Presentation Photo Card */}
            <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
              <div className="relative h-48 w-full bg-surface-container-high">
                <img src="/images/bus-banner.jpg" alt="Flottes Certifiées Ticket+" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
                <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">Flottes Certifiées</span>
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
                <span>Échanger sur WhatsApp (+229 01 54 65 89 07)</span>
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
