'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { generateMockTrips, COMPANIES, STATIONS } from '@/lib/mock-data';
import { useBookingStore } from '@/stores/bookingStore';
import { TripCard } from '@/components/traveler/results/TripCard';

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
  const { selectTrip } = useBookingStore();
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

  const [liveTrips, setLiveTrips] = useState<any[] | null>(null);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [isLoadingLive, setIsLoadingLive] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTrips() {
      setIsLoadingLive(true);
      try {
        const res = await fetch(`/api/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${dateParam}&passengers=${passengers}`);
        if (!res.ok) throw new Error('API trips error');
        const data = await res.json();
        if (isMounted && data.trips && data.trips.length > 0) {
          setLiveTrips(data.trips);
          setIsLiveSupabase(true);
        } else if (isMounted) {
          setLiveTrips(null);
          setIsLiveSupabase(false);
        }
      } catch (err) {
        console.warn('Fallback aux départs locaux:', err);
        if (isMounted) {
          setLiveTrips(null);
          setIsLiveSupabase(false);
        }
      } finally {
        if (isMounted) setIsLoadingLive(false);
      }
    }
    loadTrips();
    return () => { isMounted = false; };
  }, [from, to, dateParam, passengers]);

  const rawTrips = liveTrips || generateMockTrips(from, to, dateParam);
  let trips = [...rawTrips];
  const isCompanySelected = filterConfort || filterBaobab || filterATT || filterSTM;
  if (isCompanySelected) {
    trips = trips.filter(t => {
      const slug = (t.companySlug || '').toLowerCase();
      const name = (t.companyName || '').toLowerCase();
      const id = String(t.companyId || '');
      return (
        (filterConfort && (slug.includes('confort') || name.includes('confort') || id === 'c-1')) ||
        (filterBaobab && (slug.includes('baobab') || name.includes('baobab') || id === 'c-2')) ||
        (filterATT && (slug.includes('att') || name.includes('att') || id === 'c-3')) ||
        (filterSTM && (slug.includes('stm') || name.includes('stm') || id === 'c-4'))
      );
    });
  }
  if (filterVIP) trips = trips.filter(t => t.features?.includes('ac') || t.features?.includes('vip') || t.busType === 'VIP');
  if (filterDirect) trips = trips.filter(t => t.duration?.startsWith('2h') || t.duration?.startsWith('3h') || t.duration?.startsWith('5h'));

  trips.sort((a, b) => {
    if (sortBy === 'timeAsc') return a.departureTime.localeCompare(b.departureTime);
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'seatsDesc') return b.availableSeats - a.availableSeats;
    return 0;
  });

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
                <span className="font-label-sm text-label-sm font-semibold">{trips.length} Départ{trips.length > 1 ? 's' : ''} Direct{trips.length > 1 ? 's' : ''} Garanti{trips.length > 1 ? 's' : ''}</span>
                {isLiveSupabase && (
                  <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    Supabase Live
                  </span>
                )}
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
                <span className="font-label-sm text-label-sm text-secondary font-semibold">{trips.length} bus dispo</span>
              </div>
            </button>

            {/* Demain */}
            <button 
              onClick={() => updateSearch({ date: formatDateForUrl(tomorrow) })}
              className={`flex-1 min-w-[180px] py-2 px-3 rounded-lg text-left transition-all ${isSelectedDate(tomorrow) ? 'bg-surface-container-lowest shadow-sm ring-1 ring-secondary' : 'hover:bg-surface-container-lowest/80'}`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-label-sm text-label-sm ${isSelectedDate(tomorrow) ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}>Demain • {formatShortDate(tomorrow)}</span>
                <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-semibold">{Math.max(trips.length + 1, 3)} départs</span>
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
            
            {isLoadingLive ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-xl text-center shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[40px] animate-spin mb-3 inline-block">progress_activity</span>
                <h3 className="font-title-md text-title-md font-bold text-on-surface">Recherche en temps réel...</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Interrogation des compagnies partenaires et des départs en direct.</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="bg-surface-container-lowest rounded-xl p-space-lg text-center shadow-sm">
                <span className="material-symbols-outlined text-outline text-[48px] mb-4">search_off</span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">Aucun départ ne correspond</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Essayez de modifier vos filtres de recherche.</p>
                <button onClick={() => { setFilterConfort(false); setFilterBaobab(false); setFilterATT(false); setFilterSTM(false); setFilterVIP(false); setFilterDirect(false); }} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold">Réinitialiser les filtres</button>
              </div>
            ) : (
              trips.map((trip) => {
                const company = COMPANIES.find((c) => c.id === trip.companyId) || {
                  name: trip.companyName || 'Compagnie',
                  subtitle: trip.companySubtitle || 'Transport de voyageurs',
                  isOfficialPartner: trip.isPartnerOfficial ?? false,
                };
                const depStation = trip.departureStation || STATIONS.find(s => s.id === trip.departureStationId)?.name || `Gare ${from}`;
                const arrStation = trip.arrivalStation || STATIONS.find(s => s.id === trip.arrivalStationId)?.name || `Gare ${to}`;
                return (
                  <div key={trip.id} className="relative">
                    <TripCard
                      companyName={trip.companyName || company.name}
                      companySubtitle={trip.companySubtitle || company.subtitle || "Transport de voyageurs"}
                      isPartnerOfficial={trip.isPartnerOfficial ?? company.isOfficialPartner ?? false}
                      seatsLeft={trip.availableSeats}
                      departureTime={trip.departureTime}
                      departureLabel=""
                      departureStation={depStation}
                      arrivalTime={trip.arrivalTime}
                      arrivalStation={arrStation}
                      duration={trip.duration}
                      directLabel={trip.features?.includes("direct") ? "Trajet Direct" : "Départ certifié"}
                      amenities={trip.features || ['ac']}
                      price={trip.price}
                      priceLabel=""
                      onSelect={() => {
                        selectTrip({
                          id: trip.id,
                          companyId: trip.companyId,
                          companyName: trip.companyName || company.name,
                          companySubtitle: trip.companySubtitle || company.subtitle,
                          departureTime: trip.departureTime,
                          arrivalTime: trip.arrivalTime,
                          duration: trip.duration,
                          price: trip.price,
                          departureStationId: trip.departureStationId,
                          arrivalStationId: trip.arrivalStationId,
                          availableSeats: trip.availableSeats,
                          disabledSeats: trip.disabledSeats || [2, 5, 12, 19, 23],
                          from: from,
                          to: to,
                          date: dateParam,
                          features: trip.features || [],
                        });
                        router.push(`/${locale}/reservation/${trip.id}`);
                      }}
                    />
                  </div>
                );
              })
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
