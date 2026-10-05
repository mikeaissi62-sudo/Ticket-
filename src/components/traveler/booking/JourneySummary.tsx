import React from 'react';

export const JourneySummary = () => {
  return (
    <div className="bg-surface-container-low p-space-md rounded-xl">
      <div className="flex items-center justify-between pb-space-sm mb-space-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
          <span className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">Confort Lines Express VIP</span>
        </div>
        <span className="font-label-sm text-label-sm bg-secondary-container px-2.5 py-0.5 rounded-full text-on-secondary-container font-semibold">Confirmé</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
        <div className="md:col-span-5">
          <div className="font-headline-md text-headline-md font-bold text-on-surface">07:00</div>
          <div className="font-body-md text-body-md font-semibold text-on-surface">Cotonou</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
            Gare Étoile Rouge
          </div>
        </div>
        <div className="md:col-span-2 flex flex-col items-center justify-center my-1 md:my-0">
          <span className="font-label-sm text-label-sm text-outline font-medium">6h 30m</span>
          <div className="w-full flex items-center justify-center gap-1 my-1">
            <div className="h-0.5 bg-outline-variant w-full"></div>
            <span className="material-symbols-outlined text-[16px] text-secondary">directions_bus</span>
            <div className="h-0.5 bg-outline-variant w-full"></div>
          </div>
          <span className="font-label-sm text-[10px] text-secondary font-semibold">Direct</span>
        </div>
        <div className="md:col-span-5 md:text-right">
          <div className="font-headline-md text-headline-md font-bold text-on-surface">13:30</div>
          <div className="font-body-md text-body-md font-semibold text-on-surface">Parakou</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center md:justify-end gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[14px] text-secondary">pin_drop</span>
            Terminus Confort Lines
          </div>
        </div>
      </div>
    </div>
  );
};
