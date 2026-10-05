'use client';

import React from 'react';

interface BookingData {
  from: string;
  to: string;
  date: string;
  seat: string;
  payment: string;
  price: string;
  name: string;
  phone: string;
  company: string;
}

const getCityCode = (city: string) => {
  const codes: Record<string, string> = {
    'Cotonou': 'COO',
    'Parakou': 'PKO',
    'Bohicon': 'BOH',
    'Natitingou': 'NAT',
    'Djougou': 'DJG',
    'Tanguiéta': 'TAN',
    'Porto-Novo': 'PTN',
    'Abomey': 'ABM',
  };
  return codes[city] || city.slice(0, 3).toUpperCase();
};

const getStationName = (city: string, company: string) => {
  const isConfort = company.includes('Confort');
  const stations: Record<string, string> = {
    'Cotonou': isConfort ? 'Gare Étoile Rouge (Agontinkon)' : 'Gare Centrale',
    'Parakou': isConfort ? 'Terminus Central Confort Lines' : 'Terminus ' + company.split(' ')[0],
    'Bohicon': 'Gare Routière Bohicon',
    'Natitingou': isConfort ? 'Agence Principale Natitingou' : 'Gare Routière',
    'Djougou': 'Gare Centrale Djougou',
    'Tanguiéta': isConfort ? 'Agence Confort Lines Tanguiéta' : 'Agence Principale',
    'Porto-Novo': 'Gare Routière Porto-Novo',
    'Abomey': 'Gare Routière Abomey',
  };
  return stations[city] || `Gare de ${city}`;
};

const getPaymentLabel = (method: string) => {
  const labels: Record<string, string> = {
    'mtn': 'MTN MoMo',
    'moov': 'Moov Money',
    'card': 'Carte Visa/MC',
  };
  return labels[method] || method;
};

const getSeatInfo = (seat: string) => {
  const seatNum = parseInt(seat, 10);
  const rowNum = Math.ceil(seatNum / 4);
  const isWindow = (seatNum % 4 === 1 || seatNum % 4 === 0);
  return { row: rowNum, type: isWindow ? 'Fenêtre' : 'Couloir' };
};

export const TicketCard = ({ data }: { data: BookingData }) => {
  const { from, to, date, seat, payment, price, name, phone, company } = data;
  const seatInfo = getSeatInfo(seat);
  
  // Format date
  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  
  // Generate ticket ref
  const ticketRef = `TK-${dateObj.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Current time for emission
  const now = new Date();
  const emittedDate = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const emittedTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-lg overflow-hidden">
      {/* En-tête du Billet */}
      <div className="bg-primary text-on-primary p-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-space-md relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-on-primary/5 pointer-events-none"></div>
        <div className="flex items-center gap-space-md z-10">
          <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/15 flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[26px]">directions_bus</span>
          </div>
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-sm text-headline-sm font-bold tracking-tight">{company.replace(' VIP', '')}</span>
              <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary font-label-sm text-label-sm font-semibold">VIP CLIMATISÉ</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-primary/70">Partenaire Transport Certifié • Ticket+</p>
          </div>
        </div>
        <div className="sm:text-right z-10">
          <span className="font-label-sm text-label-sm text-on-primary/60 uppercase block tracking-wider">E-Billet Officiel</span>
          <span className="font-headline-sm text-headline-sm font-bold tracking-wider text-secondary-fixed">#{ticketRef}</span>
          <p className="font-label-sm text-label-sm text-on-primary/70">Émis le {emittedDate} à {emittedTime}</p>
        </div>
      </div>
      
      {/* Corps du billet */}
      <div className="p-space-lg">
        {/* Résumé Trajet */}
        <div className="bg-surface-container-low rounded-xl p-space-md mb-space-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center">
            <div>
              <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider block mb-1">Point de Départ</span>
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg font-bold text-on-surface">{getCityCode(from)}</span>
                <span className="font-title-md text-title-md font-semibold text-on-surface">{from}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">{getStationName(from, company)}</p>
              <div className="mt-2 inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface font-semibold bg-surface-container-lowest px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                Départ : 07:00
              </div>
            </div>
            <div className="flex flex-col items-center justify-center text-center px-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">6h 30m Direct VIP</span>
              <div className="w-full flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary"></div>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-secondary via-secondary/40 to-primary"></div>
                <span className="material-symbols-outlined text-secondary text-[20px]">directions_bus</span>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-primary via-primary/40 to-primary"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-semibold mt-1">420 km • Non Stop</span>
            </div>
            <div className="md:text-right">
              <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider block mb-1">Destination</span>
              <div className="flex items-baseline gap-2 md:justify-end">
                <span className="font-display-lg text-display-lg font-bold text-on-surface">{getCityCode(to)}</span>
                <span className="font-title-md text-title-md font-semibold text-on-surface">{to}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant">{getStationName(to, company)}</p>
              <div className="mt-2 inline-flex items-center gap-1 font-label-sm text-label-sm text-on-surface font-semibold bg-surface-container-lowest px-2 py-1 rounded">
                <span className="material-symbols-outlined text-[16px] text-primary">flag</span>
                Arrivée estimée : 13:30
              </div>
            </div>
          </div>
        </div>
        
        {/* Infos Complémentaires */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-md mb-space-lg">
          <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-outline-variant/30">
            <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Date Voyage</span>
            <span className="font-title-md text-title-md font-bold text-on-surface capitalize">{formattedDate}</span>
            <span className="font-label-sm text-label-sm text-secondary font-medium block">Présence dès 06:30</span>
          </div>
          <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-outline-variant/30">
            <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Siège Attribué</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline-md text-headline-md font-extrabold text-secondary">N° {seat}</span>
              <span className="px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold">VIP</span>
            </div>
            <span className="font-label-sm text-label-sm text-on-surface-variant">{seatInfo.type} • Rangée {seatInfo.row}</span>
          </div>
          <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-outline-variant/30">
            <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Passager</span>
            <span className="font-title-md text-title-md font-bold text-on-surface truncate block">{name}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">+229 {phone}</span>
          </div>
          <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-outline-variant/30">
            <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase">Montant Réglé</span>
            <span className="font-title-md text-title-md font-bold text-on-surface">{parseInt(price).toLocaleString('fr-FR')} FCFA</span>
            <span className="font-label-sm text-label-sm text-secondary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check</span> {getPaymentLabel(payment)}
            </span>
          </div>
        </div>
        
        {/* Ligne pointillée séparatrice */}
        <div className="relative my-space-lg flex items-center justify-between">
          <div className="w-6 h-6 rounded-full bg-background -ml-9 shadow-inner"></div>
          <div className="flex-1 border-t-2 border-dashed border-outline-variant/60 mx-2"></div>
          <div className="w-6 h-6 rounded-full bg-background -mr-9 shadow-inner"></div>
        </div>
        
        {/* QR Code & Validation */}
        <div className="flex flex-col md:flex-row items-center gap-space-lg bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant/30">
          <div className="flex flex-col items-center justify-center p-space-sm bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.06)]">
            <div className="p-3 bg-surface-container-lowest rounded-lg">
              {/* SVG QR Code simulé */}
              <svg className="w-44 h-44" fill="none" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
                <rect fill="white" height="160" width="160"></rect>
                <rect fill="#0B1C30" height="40" width="40" x="10" y="10"></rect>
                <rect fill="white" height="28" width="28" x="16" y="16"></rect>
                <rect fill="#006A61" height="16" width="16" x="22" y="22"></rect>
                <rect fill="#0B1C30" height="40" width="40" x="110" y="10"></rect>
                <rect fill="white" height="28" width="28" x="116" y="16"></rect>
                <rect fill="#006A61" height="16" width="16" x="122" y="22"></rect>
                <rect fill="#0B1C30" height="40" width="40" x="10" y="110"></rect>
                <rect fill="white" height="28" width="28" x="16" y="116"></rect>
                <rect fill="#006A61" height="16" width="16" x="22" y="122"></rect>
                <rect fill="#0B1C30" height="10" width="10" x="60" y="15"></rect>
                <rect fill="#006A61" height="10" width="15" x="75" y="15"></rect>
                <rect fill="#0B1C30" height="10" width="20" x="60" y="30"></rect>
                <rect fill="#0B1C30" height="10" width="15" x="85" y="30"></rect>
                <rect fill="#006A61" height="10" width="15" x="15" y="60"></rect>
                <rect fill="#0B1C30" height="20" width="10" x="35" y="60"></rect>
                <rect fill="#0B1C30" height="15" width="20" x="15" y="85"></rect>
                <rect fill="#006A61" height="40" width="40" x="60" y="60"></rect>
                <rect fill="white" height="20" width="20" x="70" y="70"></rect>
                <rect fill="#0B1C30" height="10" width="10" x="75" y="75"></rect>
                <rect fill="#0B1C30" height="20" width="15" x="110" y="60"></rect>
                <rect fill="#006A61" height="10" width="15" x="135" y="60"></rect>
                <rect fill="#0B1C30" height="15" width="25" x="110" y="85"></rect>
                <rect fill="#0B1C30" height="15" width="10" x="60" y="110"></rect>
                <rect fill="#006A61" height="10" width="25" x="75" y="110"></rect>
                <rect fill="#006A61" height="20" width="20" x="60" y="130"></rect>
                <rect fill="#0B1C30" height="15" width="15" x="85" y="135"></rect>
                <rect fill="#0B1C30" height="25" width="10" x="110" y="110"></rect>
                <rect fill="#0B1C30" height="10" width="25" x="125" y="110"></rect>
                <rect fill="#006A61" height="20" width="25" x="125" y="130"></rect>
              </svg>
            </div>
            <span className="font-label-sm text-[10px] tracking-widest text-on-surface-variant font-mono mt-1">{ticketRef}-{company.split(' ')[0].toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-space-xs text-secondary mb-1">
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              <span className="font-title-md text-title-md font-semibold text-on-surface">Validation Immédiate à l&apos;Embarquement</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">
              Présentez directement ce QR Code sur votre smartphone aux agents de quai de la gare {getStationName(from, company).split('(')[0].trim()} de {from} ou au contrôleur à bord de l&apos;autocar {company.replace(' VIP', '')}.
            </p>
            <div className="bg-surface-container-low p-space-sm rounded-lg flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">phonelink_ring</span>
                <span className="font-label-sm text-label-sm text-on-surface">Preuve de paiement {getPaymentLabel(payment)}</span>
              </div>
              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-lowest font-semibold text-on-surface">Certifié {getPaymentLabel(payment).split(' ')[0]}</span>
            </div>
          </div>
        </div>
        
        {/* Footer du Billet */}
        <div className="bg-surface-container px-space-lg py-space-sm flex flex-wrap items-center justify-between gap-space-sm text-on-surface-variant font-label-sm text-label-sm mt-space-lg rounded-lg">
          <span>Bagages autorisés : 1 valise en soute (jusqu&apos;à 25kg) + 1 bagage cabine</span>
          <span>Climatisation • Ports USB • Sièges inclinables cuir</span>
        </div>
      </div>
      
      {/* Image du bus */}
      <div className="mt-space-lg rounded-b-xl overflow-hidden shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] bg-surface-container-lowest border-t border-outline-variant/20">
        <div className="relative h-48 w-full">
          <img 
            alt="Modern high-end luxury silver long-distance coach bus traveling along an open asphalt highway in sunny weather with scenic green landscapes, West African luxury intercity transport." 
            className="w-full h-full object-cover" 
            src="/images/bus-banner.jpg" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent flex items-end p-space-md">
            <div className="text-on-primary">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary-fixed font-semibold block">Votre Flotte Préférée</span>
              <span className="font-title-md text-title-md font-bold">{company} • Confort Garanti</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
