'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSearchStore } from '@/stores/searchStore';

const CITIES = [
  { name: 'Cotonou', station: 'Gare Étoile Rouge' },
  { name: 'Parakou', station: 'Gare Principale' },
  { name: 'Bohicon', station: 'Gare Routière' },
  { name: 'Natitingou', station: 'Agence Principale' },
  { name: 'Djougou', station: 'Gare Centrale' },
  { name: 'Tanguiéta', station: 'Agence Partenaires' },
  { name: 'Porto-Novo', station: 'Gare Routière' },
];

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

export const SearchForm = () => {
  const router = useRouter();
  const locale = useLocale();
  const formRef = useRef<HTMLDivElement>(null);
  const { from, to, date, passengers: storePassengers, setSearch } = useSearchStore();

  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [activeDropdown, setActiveDropdown] = useState<'from' | 'to' | 'date' | 'passengers' | null>(null);
  
  const [fromCity, setFromCity] = useState(CITIES.find(c => c.name.toLowerCase() === from.toLowerCase()) || CITIES[0]);
  const [toCity, setToCity] = useState(CITIES.find(c => c.name.toLowerCase() === to.toLowerCase()) || CITIES[1]);
  const [selectedDate, setSelectedDate] = useState<Date>(date ? new Date(date) : new Date());
  const [passengers, setPassengers] = useState(storePassengers || 1);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwap = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const [isSearching, setIsSearching] = useState(false);

  const prefetchResults = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    router.prefetch(`/${locale}/resultats?from=${encodeURIComponent(fromCity.name)}&to=${encodeURIComponent(toCity.name)}&date=${dateStr}&passengers=${passengers}`);
  };

  const handleSearch = () => {
    setIsSearching(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    setSearch(fromCity.name, toCity.name, dateStr, passengers);
    router.push(`/${locale}/resultats?from=${encodeURIComponent(fromCity.name)}&to=${encodeURIComponent(toCity.name)}&date=${dateStr}&passengers=${passengers}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Calendar Logic
  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const padding = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Adjust for Monday start

    const days = [];
    for (let i = 0; i < padding; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const setDateToday = () => {
    setSelectedDate(new Date());
    setActiveDropdown(null);
  };

  const setDateTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
    setActiveDropdown(null);
  };

  return (
    <div ref={formRef} data-testid="search-form" className="w-full max-w-[900px] bg-white rounded-2xl shadow-md border border-[#E2E8F0] p-5 sm:p-6 md:p-7 text-left relative z-20">
      {/* Trip type selector + badge */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-full">
          <button
            onClick={() => setTripType('oneway')}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
              tripType === 'oneway'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Aller simple
          </button>
          <button
            onClick={() => setTripType('roundtrip')}
            className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${
              tripType === 'roundtrip'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Aller-retour
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#059669] font-medium bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#10B981]/20">
          <span className="material-symbols-outlined text-[13px]">verified</span>
          <span>Réservation officielle directe</span>
        </div>
      </div>

      {/* Search Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_1fr_auto] gap-3 items-stretch relative">
        
        {/* Departure */}
        <div className="relative">
          <div 
            onClick={() => setActiveDropdown(activeDropdown === 'from' ? null : 'from')}
            className={`h-full bg-[#F8FAFC] rounded-xl p-3.5 border transition-colors cursor-pointer group ${activeDropdown === 'from' ? 'border-[#10B981] ring-1 ring-[#10B981]/30' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[14px] text-[#10B981]">trip_origin</span>
              <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Départ (Ville)</span>
            </div>
            <div className="text-[17px] font-bold text-[#0F172A]">{fromCity.name}</div>
            <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{fromCity.station}</div>
          </div>
          
          {/* Departure Dropdown */}
          {activeDropdown === 'from' && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:w-[240px] bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2 px-2 pt-1">Villes desservies</div>
              {CITIES.map((city) => (
                <div 
                  key={city.name} 
                  onClick={() => { setFromCity(city); setActiveDropdown(null); }}
                  className={`px-3 py-2 rounded-lg cursor-pointer flex flex-col transition-colors ${fromCity.name === city.name ? 'bg-[#ECFDF5] text-[#059669]' : 'hover:bg-[#F8FAFC] text-[#0F172A]'}`}
                >
                  <span className="text-[14px] font-bold">{city.name}</span>
                  <span className={`text-[11px] ${fromCity.name === city.name ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>{city.station}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="hidden lg:flex items-center justify-center relative z-10">
          <button
            onClick={handleSwap}
            aria-label="Permuter les villes"
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:border-[#CBD5E1] flex items-center justify-center transition-all hover:shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
          </button>
        </div>

        {/* Arrival */}
        <div className="relative">
          <div 
            onClick={() => setActiveDropdown(activeDropdown === 'to' ? null : 'to')}
            className={`h-full bg-[#F8FAFC] rounded-xl p-3.5 border transition-colors cursor-pointer group ${activeDropdown === 'to' ? 'border-[#10B981] ring-1 ring-[#10B981]/30' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[14px] text-[#10B981]">location_on</span>
              <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Arrivée (Ville)</span>
            </div>
            <div className="text-[17px] font-bold text-[#0F172A]">{toCity.name}</div>
            <div className="text-[11px] text-[#94A3B8] mt-0.5 truncate">{toCity.station}</div>
          </div>

          {/* Arrival Dropdown */}
          {activeDropdown === 'to' && (
            <div className="absolute top-[calc(100%+8px)] left-0 w-full sm:w-[240px] bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2 px-2 pt-1">Villes desservies</div>
              {CITIES.map((city) => (
                <div 
                  key={city.name} 
                  onClick={() => { setToCity(city); setActiveDropdown(null); }}
                  className={`px-3 py-2 rounded-lg cursor-pointer flex flex-col transition-colors ${toCity.name === city.name ? 'bg-[#ECFDF5] text-[#059669]' : 'hover:bg-[#F8FAFC] text-[#0F172A]'}`}
                >
                  <span className="text-[14px] font-bold">{city.name}</span>
                  <span className={`text-[11px] ${toCity.name === city.name ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>{city.station}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="relative">
          <div 
            onClick={() => setActiveDropdown(activeDropdown === 'date' ? null : 'date')}
            className={`h-full bg-[#F8FAFC] rounded-xl p-3.5 border transition-colors cursor-pointer ${activeDropdown === 'date' ? 'border-[#10B981] ring-1 ring-[#10B981]/30' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[14px] text-[#64748B]">calendar_today</span>
              <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Date de voyage</span>
            </div>
            <div className="text-[17px] font-bold text-[#0F172A] capitalize">{formatDate(selectedDate)}</div>
            <div className="flex items-center gap-2 mt-1 text-[11px]">
              <span onClick={(e) => { e.stopPropagation(); setDateToday(); }} className="text-[#10B981] font-semibold cursor-pointer hover:underline">Aujourd'hui</span>
              <span className="text-[#CBD5E1]">•</span>
              <span onClick={(e) => { e.stopPropagation(); setDateTomorrow(); }} className="text-[#94A3B8] cursor-pointer hover:underline">Demain</span>
            </div>
          </div>

          {/* Calendar Dropdown */}
          {activeDropdown === 'date' && (
            <div className="absolute top-[calc(100%+8px)] left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 w-[280px] bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() - 1); setSelectedDate(d); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F1F5F9] text-[#64748B]"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <div className="text-[14px] font-bold text-[#0F172A]">
                  {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </div>
                <button 
                  onClick={() => { const d = new Date(selectedDate); d.setMonth(d.getMonth() + 1); setSelectedDate(d); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F1F5F9] text-[#64748B]"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map(day => (
                  <div key={day} className="text-[11px] font-semibold text-[#94A3B8] text-center py-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getCalendarDays().map((day, idx) => (
                  <div key={idx} className="aspect-square flex items-center justify-center">
                    {day && (
                      <button 
                        onClick={() => { 
                          const d = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                          setSelectedDate(d); 
                          setActiveDropdown(null); 
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition-colors ${
                          day === selectedDate.getDate() 
                            ? 'bg-[#10B981] text-white font-bold shadow-sm' 
                            : 'text-[#0F172A] hover:bg-[#F1F5F9] font-medium'
                        }`}
                      >
                        {day}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Passengers */}
        <div className="relative">
          <div 
            onClick={() => setActiveDropdown(activeDropdown === 'passengers' ? null : 'passengers')}
            className={`h-full bg-[#F8FAFC] rounded-xl p-3.5 border transition-colors cursor-pointer ${activeDropdown === 'passengers' ? 'border-[#10B981] ring-1 ring-[#10B981]/30' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[14px] text-[#64748B]">group</span>
              <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wide">Passagers</span>
            </div>
            <div className="text-[17px] font-bold text-[#0F172A]">{passengers} Adulte{passengers > 1 ? 's' : ''}</div>
          </div>

          {/* Passengers Dropdown */}
          {activeDropdown === 'passengers' && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[220px] bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-bold text-[#0F172A]">Adultes</div>
                  <div className="text-[11px] text-[#64748B]">Plus de 12 ans</div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    disabled={passengers <= 1}
                    className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="text-[15px] font-bold text-[#0F172A] w-3 text-center">{passengers}</span>
                  <button 
                    onClick={() => setPassengers(Math.min(10, passengers + 1))}
                    className="w-8 h-8 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: info + CTA */}
      <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
          <span className="material-symbols-outlined text-[#10B981] text-[16px]">verified_user</span>
          <span>Tarifs officiels sans surcoût • Paiement MTN MoMo, Moov & Carte</span>
        </div>
        <button
          onClick={handleSearch}
          onMouseEnter={prefetchResults}
          onTouchStart={prefetchResults}
          disabled={isSearching}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0F172A] text-white hover:bg-[#1E293B] text-[15px] font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.97] cursor-pointer disabled:opacity-80"
        >
          {isSearching ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              <span>Recherche en cours...</span>
            </>
          ) : (
            <>
              <span>Rechercher les départs</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
