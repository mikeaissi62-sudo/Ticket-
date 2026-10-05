import React from 'react';

interface BookingOptionsProps {
  extraLuggage: boolean;
  setExtraLuggage: (val: boolean) => void;
}

export const BookingOptions = ({
  extraLuggage,
  setExtraLuggage
}: BookingOptionsProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-space-sm">
        <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-label-sm flex items-center justify-center">2</span>
        <h3 className="font-title-md text-title-md font-bold text-on-surface">Bagages & Options de Route</h3>
      </div>
      <div className="space-y-space-sm">
        <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">luggage</span>
            </div>
            <div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">Bagage standard en soute</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">1 valise (jusqu'à 25 kg) + 1 sac à dos cabine</div>
            </div>
          </div>
          <span className="font-label-md text-label-md font-bold text-secondary bg-secondary-container/50 px-2.5 py-1 rounded-full">Inclus</span>
        </div>
        
        <label className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-[20px]">add_box</span>
            </div>
            <div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">Option bagage additionnel (+20 kg)</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">Idéal pour colis volumineux ou marchandises autorisées</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-label-md text-label-md font-bold text-on-surface">+1 000 FCFA</span>
            <input 
              className="w-4 h-4 rounded text-secondary focus:ring-0" 
              id="extra-luggage-toggle" 
              type="checkbox"
              checked={extraLuggage}
              onChange={(e) => setExtraLuggage(e.target.checked)}
            />
          </div>
        </label>
        
        <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
            </div>
            <div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">Assurance corporelle voyageur</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">Couverture collision et rapatriement partenaire béninois</div>
            </div>
          </div>
          <span className="font-label-md text-label-md font-bold text-secondary bg-secondary-container/50 px-2.5 py-1 rounded-full">Offerte</span>
        </div>

        <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
          <div className="flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">event_repeat</span>
            </div>
            <div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">Option Flexibilité</div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">Annulation et remboursement (frais de 300 FCFA) jusqu'à 2 jours avant le départ.</div>
            </div>
          </div>
          <span className="font-label-md text-label-md font-bold text-secondary bg-secondary-container/50 px-2.5 py-1 rounded-full">Inclus</span>
        </div>
      </div>
    </div>
  );
};
