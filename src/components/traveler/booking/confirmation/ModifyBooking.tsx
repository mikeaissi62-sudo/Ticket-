"use client";

import React, { useState } from 'react';

interface ModifyBookingProps {
  data?: {
    ref?: string;
    from?: string;
    to?: string;
    seat?: string;
    price?: string | number;
    phone?: string;
    isFlexible?: boolean;
    company?: string;
  };
}

export const ModifyBooking: React.FC<ModifyBookingProps> = ({ data }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('Changement de programme');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [refundInfo, setRefundInfo] = useState<{ amount: number; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const bookingRef = data?.ref && data.ref.startsWith('TK')
    ? data.ref
    : (data?.ref ? `TKP-${data.ref}` : 'TKP-2026-9812');
  const rawPrice = data?.price ? Number(String(data.price).replace(/[^0-9]/g, '')) : 7500;
  const price = rawPrice > 0 ? rawPrice : 7500;
  // Par défaut, si non spécifié, le billet est flexible sur Ticket+
  const isFlexible = data?.isFlexible !== false;
  const penaltyFee = 300;
  const refundAmount = Math.max(0, price - penaltyFee);

  const handleCancelAndRefund = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_reference: bookingRef,
          reason,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setIsCancelled(true);
        setRefundInfo({
          amount: resData.refund_amount || refundAmount,
          message: resData.message || `Remboursement de ${(resData.refund_amount || refundAmount).toLocaleString('fr-FR')} FCFA validé.`,
        });

        // Mettre à jour localStorage
        try {
          const raw = localStorage.getItem('ticketplus_guest_bookings');
          if (raw) {
            const list = JSON.parse(raw);
            const targetRef = (data?.ref || bookingRef).toUpperCase();
            const updated = list.map((b: any) => {
              const bRef = String(b.ref || '').toUpperCase();
              return (bRef === targetRef || bRef === bookingRef.toUpperCase() || bRef.includes(targetRef))
                ? { ...b, status: 'cancelled' }
                : b;
            });
            localStorage.setItem('ticketplus_guest_bookings', JSON.stringify(updated));
          }

          // Ajouter une notification d'annulation
          const notifsRaw = localStorage.getItem('ticketplus_notifications');
          const notifs = notifsRaw ? JSON.parse(notifsRaw) : [];
          const refundNotif = {
            id: `notif-${Date.now()}`,
            title: `Billet remboursé (${bookingRef})`,
            message: `Votre remboursement de ${(resData.refund_amount || refundAmount).toLocaleString('fr-FR')} FCFA a été crédité sur votre compte Mobile Money. Siège N° ${data?.seat || '14'} libéré.`,
            type: 'booking',
            booking_ref: bookingRef,
            is_read: false,
            created_at: new Date().toISOString(),
          };
          notifs.unshift(refundNotif);
          localStorage.setItem('ticketplus_notifications', JSON.stringify(notifs));

          // Enregistrer aussi sur le serveur si connecté
          fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(refundNotif),
          }).catch(() => {});

          window.dispatchEvent(new Event('ticketplus_update'));
        } catch (e) {
          console.warn('LocalStorage refund update warning:', e);
        }
      } else {
        setErrorMessage(resData.error || 'Erreur lors du traitement de la demande.');
      }
    } catch {
      setErrorMessage('Erreur réseau. Veuillez vérifier votre connexion.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between gap-space-sm mt-space-lg border border-outline-variant/30">
        <div className="flex items-center gap-space-xs">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined text-[18px]">
              {isCancelled ? 'check_circle' : 'help'}
            </span>
          </div>
          <div>
            <div className="font-label-md text-label-md font-semibold text-on-surface">
              {isCancelled ? 'Billet annulé & remboursé' : 'Un empêchement ?'}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">
              {isCancelled
                ? 'Remboursement Mobile Money en cours'
                : (isFlexible ? 'Billet flexible • Remboursable jusqu’à 2h avant le départ' : 'Tarif standard • Conditions spécifiques')}
            </div>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold shadow-sm transition-colors ${
            isCancelled
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-surface-container-lowest hover:bg-surface text-on-surface'
          }`}
        >
          {isCancelled ? 'Détails' : 'Gérer / Annuler'}
        </button>
      </div>

      {/* Modale d'annulation & remboursement */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !isProcessing && setModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="-mx-6 -mt-6 sm:-mx-7 sm:-mt-7 p-5 mb-5 bg-[#0B1324] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#00D084] text-[#0B1324] flex items-center justify-center font-extrabold text-[15px]">
                  T+
                </div>
                <div>
                  <h4 className="font-bold text-[15px] leading-tight">
                    {isCancelled ? 'Statut du Remboursement' : 'Annulation & Remboursement'}
                  </h4>
                  <p className="text-[11px] text-[#94A3B8]">
                    Référence : <strong>{bookingRef}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => !isProcessing && setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                aria-label="Fermer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {isCancelled && refundInfo ? (
              /* Vue après confirmation du remboursement */
              <div className="text-center py-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[36px]">verified</span>
                </div>
                <h5 className="text-[18px] font-black text-[#0F172A] mb-1">
                  Remboursement Confirmé !
                </h5>
                <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">
                  {refundInfo.message}
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-5 text-left text-[12px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-emerald-800">Montant reversé :</span>
                    <strong className="text-emerald-900 font-extrabold text-[14px]">
                      {refundInfo.amount.toLocaleString('fr-FR')} FCFA
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-800">Délai estimé :</span>
                    <span className="font-semibold text-emerald-900">5 à 15 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-800">Statut du siège :</span>
                    <span className="font-semibold text-emerald-900">Libéré pour remise en vente</span>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#0B1324] hover:bg-[#1E293B] text-white font-bold text-[13px] transition-all"
                >
                  Fermer
                </button>
              </div>
            ) : isFlexible ? (
              /* Billet Flexible : Possibilité de remboursement */
              <div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 w-fit text-[11px] font-bold mb-3">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Option Billet Flexible Active
                </div>

                <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">
                  En cas d&apos;empêchement, vous pouvez annuler votre billet et recevoir le remboursement immédiat sur votre compte Mobile Money.
                </p>

                {/* Calcul du remboursement */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4 space-y-2 text-[12px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Montant payé pour le trajet :</span>
                    <span className="font-bold text-slate-800">{price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Frais de traitement Ticket+ :</span>
                    <span className="font-semibold text-rose-600">- {penaltyFee} FCFA</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-[14px]">
                    <span className="font-extrabold text-slate-900">Montant net remboursé :</span>
                    <span className="font-black text-emerald-600">
                      {refundAmount.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>

                {/* Sélection du motif */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Motif de l&apos;annulation
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-900 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option>Changement de programme</option>
                    <option>Voyage reporté</option>
                    <option>Raison de santé</option>
                    <option>Empêchement professionnel</option>
                    <option>Autre motif</option>
                  </select>
                </div>

                {errorMessage && (
                  <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-700 text-[12px] border border-rose-200 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Avertissement */}
                <div className="p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[11px] leading-relaxed mb-5 flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                  <span>
                    Cette opération est <strong>irréversible</strong>. Votre place sera immédiatement remise en vente et le montant sera recrédité sur votre numéro Mobile Money.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] transition-all disabled:opacity-50"
                  >
                    Garder mon billet
                  </button>
                  <button
                    onClick={handleCancelAndRefund}
                    disabled={isProcessing}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                        <span>Traitement...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
                        <span>Confirmer l&apos;annulation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Billet Standard Non Flexible */
              <div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 w-fit text-[11px] font-bold mb-3">
                  <span className="material-symbols-outlined text-[15px]">warning</span>
                  Billet Standard (Non Flexible)
                </div>

                <p className="text-[13px] text-slate-600 mb-4 leading-relaxed">
                  Conformément aux conditions de transport, les billets standards ne sont pas remboursables en cas d&apos;annulation volontaire.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5 text-[12px] space-y-2 text-slate-700">
                  <p>
                    Pour reporter votre date de départ ou transférer votre billet à un proche, veuillez contacter directement l&apos;assistance voyageur Ticket+ avec votre référence <strong>{bookingRef}</strong>.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] transition-all"
                  >
                    Fermer
                  </button>
                  <a
                    href={`https://wa.me/2290154658907?text=${encodeURIComponent(`Bonjour Ticket+, j'ai un empêchement pour mon billet standard ${bookingRef} (${data?.from} -> ${data?.to}). Pouvez-vous m'aider ?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl bg-[#00D084] hover:bg-[#00B874] text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-md"
                  >
                    <span className="material-symbols-outlined text-[16px]">support_agent</span>
                    Assistance 24/7
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

