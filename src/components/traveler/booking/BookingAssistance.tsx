import React from 'react';

export const BookingAssistance = () => {
  return (
    <div className="mt-space-xl p-space-md bg-surface-container-lowest rounded-xl flex flex-col md:flex-row items-center justify-between gap-space-md shadow-md">
      <div className="flex items-center gap-space-md">
        <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
          <span className="material-symbols-outlined text-[26px]">headset_mic</span>
        </div>
        <div>
          <div className="font-title-md text-title-md font-bold text-on-surface">Une question sur ce départ ?</div>
          <div className="font-body-md text-body-md text-on-surface-variant">L'équipe d'embarquement Ticket+ Cotonou est joignable directement par téléphone.</div>
        </div>
      </div>
      <div className="flex items-center gap-space-sm w-full md:w-auto">
        <a className="w-full md:w-auto px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors" href="#">
          Voir la politique bagages
        </a>
        <a className="w-full md:w-auto px-space-md py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold text-center transition-colors shadow-sm" href="tel:+2290154658907">
          +229 01 54 65 89 07
        </a>
      </div>
    </div>
  );
};
