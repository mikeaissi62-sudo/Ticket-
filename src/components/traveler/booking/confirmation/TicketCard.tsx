'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import QRCode from 'qrcode';

export interface BookingData {
  ref?: string;
  from?: string;
  to?: string;
  date?: string;
  departure?: string;
  arrival?: string;
  duration?: string;
  fromStation?: string;
  toStation?: string;
  seat?: string;
  payment?: string;
  price?: string | number;
  name?: string;
  phone?: string;
  company?: string;
  isFlexible?: boolean;
}

const getStationName = (city: string, company: string = '') => {
  const isConfort = company.toLowerCase().includes('confort');
  const stations: Record<string, string> = {
    'Cotonou': isConfort ? 'Gare Jonquet' : 'Gare Étoile Rouge',
    'Parakou': 'Gare Centrale',
    'Bohicon': 'Gare Routière Bohicon',
    'Natitingou': 'Agence Principale',
    'Djougou': 'Gare Centrale Djougou',
    'Tanguiéta': 'Agence Principale',
    'Porto-Novo': 'Gare Routière',
    'Abomey': 'Gare Routière Abomey',
  };
  return stations[city] || `Gare de ${city}`;
};

const getPaymentDisplay = (method: string = '') => {
  const lower = method.toLowerCase();
  if (lower.includes('mtn') || lower === 'mtn_momo') return 'MTN MoMo (Payé)';
  if (lower.includes('moov') || lower === 'moov_money') return 'Moov Money (Payé)';
  if (lower.includes('card') || lower.includes('carte') || lower.includes('visa')) return 'Carte Bancaire (Payé)';
  if (lower.includes('celtiis')) return 'Celtiis Cash (Payé)';
  return 'MTN MoMo (Payé)';
};

const getSeatDisplay = (seat: string = '14') => {
  const seatNum = parseInt(seat, 10);
  if (isNaN(seatNum)) return `N° ${seat}`;
  const isWindow = (seatNum % 4 === 1 || seatNum % 4 === 0);
  return `N° ${seatNum} (${isWindow ? 'Fenêtre' : 'Couloir'})`;
};

export const TicketCard = ({ data }: { data: BookingData }) => {
  const router = useRouter();
  const locale = useLocale();

  const fromCity = data.from || 'Cotonou';
  const toCity = data.to || 'Parakou';
  const companyName = data.company || 'Confort Lines VIP';
  const passengerName = data.name && data.name !== 'Voyageur' ? data.name : 'Astride Koffi';
  const departureTime = data.departure || '07:00';
  const arrivalTime = data.arrival || '13:30';
  const tripDuration = data.duration || '6h30';
  const departureStation = data.fromStation || getStationName(fromCity, companyName);
  const arrivalStation = data.toStation || (toCity === 'Parakou' ? 'Gare Centrale' : getStationName(toCity, companyName));
  const seatDisplay = getSeatDisplay(data.seat || '14');
  const paymentDisplay = getPaymentDisplay(data.payment || 'mtn');

  // Format de référence identique à l'image : TKP-2026-9812
  const bookingRef = data.ref && data.ref.startsWith('TK') 
    ? data.ref 
    : (data.ref ? `TKP-${data.ref}` : 'TKP-2026-9812');

  const [qrSvg, setQrSvg] = useState<string>('');

  useEffect(() => {
    // Génération du QR Code vectoriel SVG scannable
    const qrData = `TICKET+_BENIN|REF:${bookingRef}|${fromCity}->${toCity}|PASSENGER:${passengerName}|SEAT:${data.seat || '14'}|STATUS:CONFIRMED`;
    QRCode.toString(qrData, { 
      type: 'svg', 
      margin: 0, 
      color: { dark: '#0F172A', light: '#FFFFFF' } 
    }, (err, svg) => {
      if (!err && svg) {
        setQrSvg(svg);
      }
    });
  }, [bookingRef, fromCity, toCity, passengerName, data.seat]);

  const handleBookIdentical = () => {
    const dateStr = data.date || new Date().toISOString().split('T')[0];
    router.push(`/${locale}/resultats?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${dateStr}&passengers=1`);
  };

  return (
    <div 
      id="printable-ticket" 
      className="ticket-card-container w-full max-w-[480px] sm:max-w-[500px] mx-auto rounded-[32px] shadow-[0_20px_50px_rgba(11,19,43,0.16)] border border-slate-200/80 overflow-hidden bg-white font-['Plus_Jakarta_Sans',sans-serif] transition-all select-none"
    >
      {/* ============================================================ */}
      {/* 1. EN-TÊTE SOMBRE (Header avec fond bleu nuit / noir ébène)   */}
      {/* ============================================================ */}
      <div className="bg-[#0B1324] text-white p-6 sm:p-7 relative overflow-hidden">
        
        {/* Ligne 1 : Logo & Nom de la marque + Badge de statut */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar T+ Vert */}
            <div className="w-11 h-11 rounded-2xl bg-[#00D084] flex items-center justify-center text-white font-extrabold text-[17px] tracking-tight shadow-md flex-shrink-0">
              T+
            </div>
            <div>
              <h2 className="text-white font-bold text-[17px] sm:text-[18px] tracking-tight leading-snug">
                Ticket+ Bénin
              </h2>
              <span className="text-[#00D084] font-bold text-[11px] tracking-widest uppercase block mt-0.5">
                E-BILLET OFFICIEL
              </span>
            </div>
          </div>

          {/* Badge Confirmé */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-[12px] sm:text-[13px] font-semibold bg-[#06392D] text-[#34D399] border border-[#10B981]/30 shadow-sm">
              Confirmé
            </span>
          </div>
        </div>

        {/* Ligne 2 : DÉPART — TRAJET — ARRIVÉE */}
        <div className="grid grid-cols-12 items-center mt-7 pt-1 gap-2">
          
          {/* Bloc Départ (Gauche) */}
          <div className="col-span-5 text-left">
            <span className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider block">
              DÉPART
            </span>
            <div className="text-white font-extrabold text-[22px] sm:text-[25px] tracking-tight mt-0.5 truncate leading-tight">
              {fromCity}
            </div>
            <div className="text-[#94A3B8] text-[12px] sm:text-[13px] font-normal mt-1 truncate">
              {departureStation} • {departureTime}
            </div>
          </div>

          {/* Bloc Ligne de trajet & Bus (Centre) */}
          <div className="col-span-2 flex flex-col items-center justify-center px-1">
            <span className="text-[#00D084] text-[12px] font-bold text-center block mb-1 whitespace-nowrap">
              {tripDuration}
            </span>
            <div className="w-full flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00D084] flex-shrink-0"></span>
              <div className="h-0 flex-1 border-t border-dashed border-[#64748B]"></div>
              <span className="material-symbols-outlined text-[#00D084] text-[22px] flex-shrink-0">
                directions_bus
              </span>
            </div>
          </div>

          {/* Bloc Arrivée (Droite) */}
          <div className="col-span-5 text-right">
            <span className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider block">
              ARRIVÉE
            </span>
            <div className="text-white font-extrabold text-[22px] sm:text-[25px] tracking-tight mt-0.5 truncate leading-tight">
              {toCity}
            </div>
            <div className="text-[#94A3B8] text-[12px] sm:text-[13px] font-normal mt-1 truncate">
              {arrivalStation} • {arrivalTime}
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CORPS BLANC DU TICKET                                       */}
      {/* ============================================================ */}
      <div className="bg-white p-6 sm:p-7 text-left">
        
        {/* Grille 2x2 des informations principales */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          
          {/* Compagnie */}
          <div>
            <span className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider block">
              COMPAGNIE
            </span>
            <div className="text-[#0F172A] font-extrabold text-[15px] sm:text-[16px] mt-1 truncate">
              {companyName}
            </div>
          </div>

          {/* Siège Réservé */}
          <div>
            <span className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider block">
              SIÈGE RÉSERVÉ
            </span>
            <div className="text-[#059669] font-extrabold text-[15px] sm:text-[16px] mt-1 truncate">
              {seatDisplay}
            </div>
          </div>

          {/* Voyageur */}
          <div>
            <span className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider block">
              VOYAGEUR
            </span>
            <div className="text-[#0F172A] font-extrabold text-[15px] sm:text-[16px] mt-1 truncate">
              {passengerName}
            </div>
          </div>

          {/* Paiement */}
          <div>
            <span className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider block">
              PAIEMENT
            </span>
            <div className="text-[#0F172A] font-extrabold text-[15px] sm:text-[16px] mt-1 truncate">
              {paymentDisplay}
            </div>
          </div>

        </div>

        {/* Ligne séparatrice fine */}
        <div className="border-t border-[#F1F5F9] my-5"></div>

        {/* Section Code Réservation & QR Code */}
        <div className="flex items-center justify-between gap-4">
          
          {/* Code de réservation scannable */}
          <div>
            <span className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider block">
              CODE RÉSERVATION
            </span>
            <div className="text-[#0F172A] font-extrabold text-[18px] sm:text-[20px] tracking-wider mt-1 font-mono">
              {bookingRef}
            </div>
            <div className="text-[#059669] text-[12px] font-semibold mt-1">
              Scannable à l&apos;embarquement
            </div>
          </div>

          {/* Boîte QR Code */}
          <div className="w-[84px] h-[84px] sm:w-[92px] sm:h-[92px] rounded-2xl border border-[#E2E8F0] p-2 flex items-center justify-center bg-white shadow-sm flex-shrink-0">
            {qrSvg ? (
              <div 
                className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
            )}
          </div>

        </div>

        {/* Bouton d'action en bas : Réserver un billet identique */}
        <button
          type="button"
          onClick={handleBookIdentical}
          className="print:hidden w-full mt-6 py-3.5 px-6 rounded-2xl bg-[#0B1324] hover:bg-[#1E293B] text-white font-bold text-[14px] sm:text-[15px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Réserver un billet identique</span>
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>

      </div>
    </div>
  );
};
