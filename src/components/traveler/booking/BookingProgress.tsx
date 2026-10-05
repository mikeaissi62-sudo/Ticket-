import React from 'react';

export const BookingProgress = () => {
  return (
    <div className="mb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm shadow-md">
      <div className="flex items-center gap-space-xs sm:gap-space-sm text-label-sm font-label-sm">
        <span className="inline-flex items-center gap-1 text-secondary font-semibold">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          1. Recherche
        </span>
        <span className="text-outline-variant font-medium">/</span>
        <span className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1 rounded-full font-semibold">
          <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
          2. Choix du Siège
        </span>
        <span className="text-outline-variant font-medium">/</span>
        <span className="text-outline font-normal">
          3. Paiement &amp; Billet
        </span>
      </div>
      
      <div className="flex items-center gap-space-sm self-start md:self-auto">
        <div className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
          <span>Réservation garantie en temps réel</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 bg-secondary-container/40 px-2.5 py-1.5 rounded-lg text-label-sm font-label-sm text-on-secondary-container font-semibold">
          <span className="material-symbols-outlined text-[15px]">timer</span>
          <span>14:52 restants</span>
        </div>
      </div>
    </div>
  );
};
