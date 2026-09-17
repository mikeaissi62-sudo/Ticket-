import React from 'react';
import { TripCard } from '../../../components/ui/TripCard';
import { Button } from '../../../components/ui/Button';
import { ChevronLeft, Filter, SlidersHorizontal, Edit2, ShieldCheck, Zap, HeadphonesIcon, Snowflake } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function ResultsPage() {
  const locale = useLocale();
  
  const searchSummary = {
    from: 'Cotonou',
    to: 'Parakou',
    date: 'Aujourd\'hui, 24 Oct.',
    passengers: 1
  };

  const dates = [
    { day: 'Hier', date: '23 Oct.', active: false, info: 'Complet' },
    { day: 'Aujourd\'hui', date: '24 Oct.', active: true, info: 'SÉLECTIONNÉ' },
    { day: 'Demain', date: '25 Oct.', active: false, info: 'dès 5 000F' },
    { day: 'Samedi', date: '26 Oct.', active: false, info: 'dès 6 000F' },
  ];

  const trips = [
    {
      id: '1',
      companyName: 'Baobab Express',
      rating: 4.9,
      reviews: 1240,
      departureTime: '07:00',
      departureStation: 'Gare Jonquet',
      arrivalTime: '13:30',
      arrivalStation: 'Terminus Parakou',
      duration: '6h30',
      stops: 'Direct sans arrêt',
      price: 6500,
      seatsLeft: 4,
      features: ['ac', 'wifi', 'usb'],
      badgeType: 'VIP' as const
    },
    {
      id: '2',
      companyName: 'STM Voyageurs',
      rating: 4.7,
      reviews: 890,
      departureTime: '08:30',
      departureStation: 'Étoile Rouge',
      arrivalTime: '15:15',
      arrivalStation: 'Gare Centrale',
      duration: '6h45',
      stops: '1 arrêt (Bohicon)',
      price: 6000,
      seatsLeft: 12,
      features: ['ac', 'baggage'],
      badgeType: 'Confort' as const
    },
    {
      id: '3',
      companyName: 'ATT Transports',
      rating: 4.8,
      reviews: 620,
      departureTime: '11:00',
      departureStation: 'Gare Cadjehoun',
      arrivalTime: '17:30',
      arrivalStation: 'Parakou Dépôt',
      duration: '6h30',
      stops: 'Non-stop direct',
      price: 7000,
      seatsLeft: 2,
      features: ['direct', 'ac'],
      badgeType: 'Express' as const
    },
    {
      id: '4',
      companyName: 'Atacora Ligne',
      rating: 4.3,
      reviews: 410,
      departureTime: '14:00',
      departureStation: 'Gare Dantokpa',
      arrivalTime: '21:00',
      arrivalStation: 'Parakou Dépôt',
      duration: '7h00',
      stops: '2 escales',
      price: 5000,
      seatsLeft: 18,
      features: ['eco', 'ventilated'],
      badgeType: 'Standard' as const,
      buttonDisabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header Section */}
      <div className="bg-brand-darkBlue pt-4 pb-6 px-4 md:px-12 text-white sticky top-12 z-40 rounded-b-3xl shadow-sm">
        <div className="flex items-center justify-between mb-4 max-w-5xl mx-auto">
          <div className="flex items-center">
            <Link href={`/${locale}/search`} className="p-1 -ml-1 mr-2 hover:bg-white/10 rounded-full transition">
              <ChevronLeft className="w-7 h-7" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                {searchSummary.from} <ArrowRightIcon className="w-4 h-4 text-brand-yellow" /> {searchSummary.to}
              </h1>
              <div className="flex items-center text-xs text-brand-lightBlue mt-1">
                <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {searchSummary.date}</span>
                <span className="mx-2">•</span>
                <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {searchSummary.passengers} Passager</span>
              </div>
            </div>
          </div>
          <button className="bg-brand-blue border border-brand-lightBlue text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-brand-lightBlue transition">
            <Edit2 className="w-3 h-3" />
            <span>Modifier</span>
          </button>
        </div>

        {/* Date Selector Carousel */}
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 max-w-5xl mx-auto">
          {dates.map((d, idx) => (
            <div 
              key={idx} 
              className={`flex-shrink-0 flex flex-col justify-center items-center px-4 py-2 rounded-2xl cursor-pointer transition min-w-[80px] ${
                d.active 
                  ? 'bg-brand-yellow text-brand-darkBlue border-2 border-brand-yellow shadow-md' 
                  : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
              }`}
            >
              {d.active && <div className="w-1.5 h-1.5 bg-brand-darkBlue rounded-full mb-1"></div>}
              <span className={`text-xs ${d.active ? 'font-bold' : ''}`}>{d.day}</span>
              <span className={`text-sm ${d.active ? 'font-black' : 'font-bold'}`}>{d.date}</span>
              <span className={`text-[10px] mt-0.5 ${d.active ? 'font-bold uppercase tracking-wide' : 'text-brand-lightBlue'}`}>
                {d.info}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Carousel */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar px-4 py-4 max-w-5xl mx-auto bg-gray-50">
        <div className="flex-shrink-0 bg-brand-darkBlue text-white px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold shadow-sm">
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </div>
        <div className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium shadow-sm">
          Climatisé <Snowflake className="w-3 h-3 text-brand-lightBlue ml-1" />
        </div>
        <div className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm">
          Baobab Express
        </div>
        <div className="flex-shrink-0 bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium shadow-sm">
          Direct <Zap className="w-3 h-3 text-brand-yellow ml-1" />
        </div>
      </div>

      {/* MoMo Guarantee Banner */}
      <div className="px-4 max-w-5xl mx-auto mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex gap-3 shadow-sm">
          <div className="bg-brand-yellow/20 p-2 rounded-xl flex-shrink-0 h-max">
            <ShieldCheck className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-bold text-yellow-800 text-sm">Garantie Voyage MoMo</h3>
            <p className="text-xs text-yellow-700 mt-0.5 leading-relaxed">
              Remboursement garanti à 100% jusqu'à 2h avant le départ
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-12">
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="text-sm font-medium text-gray-600">{trips.length} départs trouvés</h2>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Zap className="w-3 h-3" />
            Tarifs officiels
          </div>
        </div>

        {/* Trip List */}
        <div className="space-y-0">
          {trips.map((trip) => (
            trip.buttonDisabled ? (
              <div key={trip.id} className="block">
                <TripCard {...trip} />
              </div>
            ) : (
              <Link key={trip.id} href={`/${locale}/seat/${trip.id}`} className="block">
                <TripCard {...trip} />
              </Link>
            )
          ))}
        </div>

        {/* WhatsApp Help */}
        <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-2xl p-4 mt-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm text-brand-blue">
              <HeadphonesIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-brand-darkGray text-sm">Besoin d'aide pour réserver ?</p>
              <p className="text-xs text-gray-500 mt-0.5">Assistance WhatsApp 24/7 disponible</p>
            </div>
          </div>
          <button className="text-brand-blue text-xs font-bold border border-brand-blue rounded-full px-4 py-1.5">
            Discuter
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline Icons for precise visual
const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
