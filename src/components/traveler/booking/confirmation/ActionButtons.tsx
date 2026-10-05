"use client";

import React, { useState } from 'react';

export const ActionButtons = ({ phone }: { phone: string }) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-lg">
      <div className="font-title-md text-title-md font-bold text-on-surface mb-space-sm">Actions Rapides</div>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
        Gardez votre titre de transport accessible même sans connexion internet à la gare.
      </p>
      <div className="flex flex-col gap-space-sm">
        <button 
          onClick={() => showFeedback('Téléchargement sécurisé du billet PDF en cours...')}
          className="w-full py-3.5 px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all flex items-center justify-center gap-space-xs shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          <span>Télécharger le billet officiel (PDF)</span>
        </button>
        <button 
          onClick={() => showFeedback(`E-billet transmis instantanément sur WhatsApp (+229 ${phone}).`)}
          className="w-full py-3.5 px-space-md rounded-xl bg-secondary hover:bg-on-secondary-container text-on-secondary font-body-md text-body-md font-semibold transition-all flex items-center justify-center gap-space-xs shadow-md"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          <span>Recevoir sur WhatsApp</span>
        </button>
        <button 
          onClick={() => showFeedback(`SMS de confirmation renvoyé au +229 ${phone}.`)}
          className="w-full py-3 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-body-md text-body-md font-semibold transition-all flex items-center justify-center gap-space-xs"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">sms</span>
          <span>Renvoyer par SMS (+229 {phone})</span>
        </button>
      </div>
      
      {feedback && (
        <div className="mt-space-sm p-space-sm rounded-lg bg-secondary-container text-on-secondary-container font-label-sm text-label-sm text-center transition-all animate-fade-in">
          {feedback}
        </div>
      )}
    </div>
  );
};
