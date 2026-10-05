"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PriceSummaryProps {
  selectedSeat: string | null;
  basePrice: number;
  extraLuggage: boolean;
  extraLuggagePrice: number;
  totalPrice: number;
  locale: string;
}

export const PriceSummary = ({
  selectedSeat,
  basePrice,
  extraLuggage,
  extraLuggagePrice,
  totalPrice,
  locale
}: PriceSummaryProps) => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const formattedBasePrice = basePrice.toLocaleString('fr-FR') + ' FCFA';
  const formattedExtraLuggage = extraLuggagePrice.toLocaleString('fr-FR') + ' FCFA';
  const formattedTotal = totalPrice.toLocaleString('fr-FR') + ' FCFA';

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate API call and redirect
    setTimeout(() => {
      router.push(`/${locale}/reservation/confirmation`);
    }, 1500);
  };

  return (
    <>
      <div className="bg-surface-container-low p-space-md rounded-xl space-y-space-xs">
        <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
          <span>Billet Confort Lines VIP (Siège <strong id="summary-seat-no">#{selectedSeat || '?'}</strong>)</span>
          <span className="font-medium text-on-surface">{formattedBasePrice}</span>
        </div>
        
        {extraLuggage && (
          <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant" id="extra-luggage-row">
            <span>Bagage supplémentaire (+20 kg)</span>
            <span className="font-medium text-on-surface">{formattedExtraLuggage}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
          <span>Frais de réservation & SMS</span>
          <span className="font-medium text-secondary">0 FCFA (Gratuit)</span>
        </div>
        
        <div className="pt-space-sm flex items-center justify-between">
          <span className="font-title-md text-title-md font-bold text-on-surface">Montant Total à Payer</span>
          <span className="font-headline-md text-headline-md font-bold text-on-surface" id="total-price">{formattedTotal}</span>
        </div>
      </div>
      
      <div className="space-y-space-sm">
        <button 
          onClick={handlePay}
          disabled={!selectedSeat || isProcessing}
          className="w-full bg-primary hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed text-on-primary py-3.5 px-space-md rounded-xl font-body-lg text-body-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99]" 
          type="button"
        >
          {isProcessing ? (
            <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
          ) : (
            <span className="material-symbols-outlined text-[20px]">lock</span>
          )}
          <span>{isProcessing ? 'Traitement en cours...' : `Confirmer et Payer (${formattedTotal})`}</span>
          {!isProcessing && (
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          )}
        </button>
        <div className="flex items-start gap-2 bg-surface-container-low p-space-sm rounded-lg text-label-sm font-label-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">verified</span>
          <div>
            <strong>Garantie Ticket+ et Option Flexibilité :</strong> Annulation et remboursement possibles jusqu'à 2 jours avant le départ du bus (avec des frais de 300 FCFA). Passé ce délai, aucun remboursement n'est accordé. Service client WhatsApp actif 24h/7j.
          </div>
        </div>
      </div>
    </>
  );
};
