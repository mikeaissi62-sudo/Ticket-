import React from 'react';

export const ConfirmationHeader = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-lg mb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-md">
        <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <div>
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">Réservation confirmée & garantie</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Valide / Prêt pour l'embarquement
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Émis et certifié par <strong className="text-on-surface font-semibold">Confort Lines Bénin</strong> • Référence centrale #TK-2024-8849
          </p>
        </div>
      </div>
      <div className="flex items-center gap-space-xs self-start md:self-auto bg-surface-container-low px-space-sm py-1.5 rounded-lg">
        <span className="material-symbols-outlined text-[18px] text-secondary">security</span>
        <span className="font-label-sm text-label-sm text-on-surface font-medium">Billet Sécurisé & Non Transférable</span>
      </div>
    </div>
  );
};
