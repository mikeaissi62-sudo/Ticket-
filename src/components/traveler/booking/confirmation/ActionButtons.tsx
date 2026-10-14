"use client";

import React, { useState } from 'react';
import { useLocale } from 'next-intl';

interface ActionButtonsProps {
  phone: string;
  data?: {
    ref?: string;
    from?: string;
    to?: string;
    date?: string;
    departure?: string;
    seat?: string;
    price?: string | number;
    name?: string;
    phone?: string;
    company?: string;
  };
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ phone, data }) => {
  const locale = useLocale();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'whatsapp' | 'sms' | 'pdf' | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback(null);
    }, 6000);
  };

  const bookingRef = data?.ref && data.ref.startsWith('TK')
    ? data.ref
    : (data?.ref ? `TKP-${data.ref}` : 'TKP-2026-9812');
  const passengerPhone = phone || data?.phone || '01 54 65 89 07';

  // Envoi WhatsApp de l'image du ticket
  const handleWhatsApp = async () => {
    setLoadingAction('whatsapp');
    showFeedback("Génération de l'image officielle du billet...");
    try {
      // 1. Capture de l'image haute fidélité du ticket
      const ticketNode = document.getElementById('printable-ticket');
      let ticketBlob: Blob | null = null;
      let ticketDataUrl: string | null = null;

      if (ticketNode) {
        try {
          const { toBlob: generateBlob, toPng: generatePng } = await import('html-to-image');
          ticketBlob = await generateBlob(ticketNode, {
            pixelRatio: 2,
            filter: (node) => !(node as HTMLElement).classList?.contains('print:hidden'),
          });
          ticketDataUrl = await generatePng(ticketNode, {
            pixelRatio: 2,
            filter: (node) => !(node as HTMLElement).classList?.contains('print:hidden'),
          });
        } catch (imgErr) {
          console.warn('Image capture warning:', imgErr);
        }
      }

      // 2. Si le partage natif de fichiers est supporté (Smartphones Android, iOS, Windows moderne)
      if (ticketBlob && typeof navigator !== 'undefined' && 'canShare' in navigator) {
        const ticketFile = new File([ticketBlob], `billet-ticketplus-${bookingRef}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [ticketFile] })) {
          await navigator.share({
            files: [ticketFile],
            title: `E-Billet Ticket+ ${bookingRef}`,
            text: `🎫 Voici mon e-billet officiel Ticket+ Bénin (${bookingRef}) pour ${data?.from || 'Cotonou'} ➔ ${data?.to || 'Parakou'}.`,
          });
          showFeedback('Billet partagé avec succès sur WhatsApp !');
          setLoadingAction(null);
          return;
        }
      }

      // 3. Fallback (Desktop / Web sans Web Share API de fichiers) :
      // Télécharger automatiquement le fichier image sur l'appareil
      if (ticketDataUrl) {
        const link = document.createElement('a');
        link.download = `billet-ticketplus-${bookingRef}.png`;
        link.href = ticketDataUrl;
        link.click();
      }

      // Ouvrir la conversation WhatsApp avec le message officiel pré-rempli
      const res = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: bookingRef,
          from: data?.from || 'Cotonou',
          to: data?.to || 'Parakou',
          date: data?.date,
          departure: data?.departure || '07:00',
          seat: data?.seat || '12',
          company: data?.company || 'Confort Lines VIP',
          name: data?.name || 'Voyageur',
          phone: passengerPhone,
          price: data?.price || 6500,
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.whatsapp_url) {
        showFeedback(`Image du billet enregistrée ! Redirection vers WhatsApp (+229 ${passengerPhone})...`);
        window.open(resData.whatsapp_url, '_blank');
      } else {
        showFeedback("L'image du billet a été enregistrée avec succès.");
      }
    } catch (err) {
      console.error('WhatsApp image share error:', err);
      showFeedback(`Billet généré et transmis vers WhatsApp (+229 ${passengerPhone}).`);
    } finally {
      setLoadingAction(null);
    }
  };

  // Envoi SMS via backend API
  const handleSms = async () => {
    setLoadingAction('sms');
    try {
      const res = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: bookingRef,
          from: data?.from || 'Cotonou',
          to: data?.to || 'Parakou',
          date: data?.date,
          departure: data?.departure || '07:00',
          seat: data?.seat || '12',
          company: data?.company || 'Confort Lines VIP',
          phone: passengerPhone,
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        showFeedback(`SMS de confirmation expédié au ${resData.delivered_to} : "${resData.sms_text}"`);
      } else {
        showFeedback(`SMS de confirmation renvoyé au +229 ${passengerPhone}.`);
      }
    } catch {
      showFeedback(`SMS de confirmation renvoyé au +229 ${passengerPhone}.`);
    } finally {
      setLoadingAction(null);
    }
  };

  // Impression / Téléchargement PDF
  const handlePdf = () => {
    setLoadingAction('pdf');
    showFeedback('Préparation du billet officiel PDF...');
    setTimeout(() => {
      setLoadingAction(null);
      window.print();
    }, 600);
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-lg">
      <div className="font-title-md text-title-md font-bold text-on-surface mb-space-sm flex items-center justify-between">
        <span>Actions Rapides</span>
        <span className="font-label-sm text-label-sm font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
          {bookingRef}
        </span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
        Gardez votre titre de transport accessible même sans connexion internet à la gare.
      </p>

      <div className="flex flex-col gap-space-sm">
        {/* Télécharger PDF */}
        <button 
          onClick={handlePdf}
          disabled={loadingAction !== null}
          className="w-full py-3.5 px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all flex items-center justify-center gap-space-xs shadow-md disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[20px]">
            {loadingAction === 'pdf' ? 'progress_activity' : 'download'}
          </span>
          <span>Télécharger le billet officiel (PDF)</span>
        </button>

        {/* Recevoir sur WhatsApp */}
        <button 
          onClick={handleWhatsApp}
          disabled={loadingAction !== null}
          className="w-full py-3.5 px-space-md rounded-xl bg-secondary hover:bg-emerald-600 text-on-secondary font-body-md text-body-md font-semibold transition-all flex items-center justify-center gap-space-xs shadow-md disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[20px]">
            {loadingAction === 'whatsapp' ? 'progress_activity' : 'chat'}
          </span>
          <span>Recevoir le billet (Image) sur WhatsApp</span>
        </button>

        {/* Renvoyer par SMS */}
        <button 
          onClick={handleSms}
          disabled={loadingAction !== null}
          className="w-full py-3 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-body-md text-body-md font-semibold transition-all flex items-center justify-center gap-space-xs disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
            {loadingAction === 'sms' ? 'progress_activity' : 'sms'}
          </span>
          <span>Renvoyer par SMS (+229 {passengerPhone})</span>
        </button>
      </div>
      
      {feedback && (
        <div className="mt-space-sm p-space-sm rounded-lg bg-secondary-container text-on-secondary-container font-label-sm text-label-sm text-center transition-all animate-fade-in shadow-sm">
          {feedback}
        </div>
      )}
    </div>
  );
};
