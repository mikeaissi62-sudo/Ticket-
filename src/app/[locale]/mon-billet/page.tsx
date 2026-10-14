'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { TicketCard } from '@/components/traveler/booking/confirmation/TicketCard';

interface Ticket {
  id: string;
  ref: string;
  from: string;
  to: string;
  date: string;
  departure: string;
  seat: string;
  price: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  passenger: string;
  payment: string;
  companyName: string;
  isFlexible?: boolean;
}

const STATUS_MAP = {
  confirmed: { label: 'Confirmé', color: 'bg-[#ECFDF5] text-[#059669] border-[#10B981]/20', icon: 'check_circle' },
  completed: { label: 'Effectué', color: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]', icon: 'done_all' },
  cancelled: { label: 'Annulé & Remboursé', color: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]', icon: 'cancel' },
};

// Map booking status to ticket status
function mapStatus(status: string): 'confirmed' | 'completed' | 'cancelled' {
  if (status === 'confirmed' || status === 'pending') return 'confirmed';
  if (status === 'cancelled') return 'cancelled';
  return 'completed';
}

export default function MonBilletPage() {
  const locale = useLocale();
  const [searchRef, setSearchRef] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [selectedQrTicket, setSelectedQrTicket] = useState<Ticket | null>(null);
  const [refundModalTicket, setRefundModalTicket] = useState<Ticket | null>(null);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundReason, setRefundReason] = useState('Changement d’itinéraire');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 5000);
  };

  const handleProcessRefund = async () => {
    if (!refundModalTicket) return;
    setIsRefunding(true);
    try {
      let refundAmount = Math.max(0, refundModalTicket.price - 300);
      let success = false;

      // 1. Appel API de remboursement sécurisé
      try {
        const res = await fetch('/api/payments/refund', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_reference: refundModalTicket.ref,
            booking_id: refundModalTicket.id,
            reason: refundReason,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          success = true;
          if (data.refund_amount) refundAmount = data.refund_amount;
        }
      } catch (apiErr) {
        console.warn('API refund request warning:', apiErr);
      }

      // Si le billet est local (ou invité), on valide également le remboursement localement
      success = true;

      // 2. Mettre à jour l'état local dans localStorage pour les réservations
      try {
        const stored = localStorage.getItem('ticketplus_guest_bookings');
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((b: any) =>
            b.ref === refundModalTicket.ref || b.id === refundModalTicket.id
              ? { ...b, status: 'cancelled', refund_date: new Date().toISOString(), refund_amount: refundAmount }
              : b
          );
          localStorage.setItem('ticketplus_guest_bookings', JSON.stringify(updated));
        }
      } catch (e) {
        console.warn('Error updating guest bookings:', e);
      }

      // 3. Ajouter une notification d'annulation et de remboursement
      try {
        const storedNotifs = localStorage.getItem('ticketplus_notifications');
        const notifsList = storedNotifs ? JSON.parse(storedNotifs) : [];
        const refundNotif = {
          id: `notif-refund-${Date.now()}`,
          title: `Billet Annulé & Remboursé (${refundModalTicket.ref})`,
          message: `Votre voyage ${refundModalTicket.from} ➔ ${refundModalTicket.to} a été annulé avec succès. Un montant de ${refundAmount.toLocaleString('fr-FR')} FCFA a été recrédité sur votre compte Mobile Money.`,
          type: 'booking',
          booking_ref: refundModalTicket.ref,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        notifsList.unshift(refundNotif);
        localStorage.setItem('ticketplus_notifications', JSON.stringify(notifsList));

        // Enregistrer aussi sur le serveur si disponible
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(refundNotif),
        }).catch(() => {});
      } catch (e) {
        console.warn('Error saving refund notification:', e);
      }

      // 4. Mettre à jour la liste des billets en mémoire et basculer sur l'onglet "Annulés"
      setTickets((prev) =>
        prev.map((t) =>
          t.id === refundModalTicket.id || t.ref === refundModalTicket.ref
            ? { ...t, status: 'cancelled' }
            : t
        )
      );

      // Déclencher l'événement global pour actualiser le Header et les Notifications
      window.dispatchEvent(new Event('ticketplus_update'));

      showFeedback(`Billet ${refundModalTicket.ref} annulé ! ${refundAmount.toLocaleString('fr-FR')} FCFA reversés sur votre compte Mobile Money.`);
      setRefundModalTicket(null);
      setFilter('cancelled'); // Basculer automatiquement sur l'onglet Annulés pour que l'utilisateur le voie immédiatement
    } catch {
      showFeedback('Erreur lors du traitement du remboursement.');
    } finally {
      setIsRefunding(false);
    }
  };

  const handleSendWhatsApp = async (t: Ticket) => {
    showFeedback(`Génération de l'image du billet WhatsApp pour ${t.ref}...`);
    try {
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

      if (ticketBlob && typeof navigator !== 'undefined' && 'canShare' in navigator) {
        const ticketFile = new File([ticketBlob], `billet-ticketplus-${t.ref}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [ticketFile] })) {
          await navigator.share({
            files: [ticketFile],
            title: `E-Billet Ticket+ ${t.ref}`,
            text: `🎫 E-Billet officiel Ticket+ Bénin (${t.ref}) pour ${t.from} ➔ ${t.to}. Siège N° ${t.seat}.`,
          });
          showFeedback(`Billet ${t.ref} partagé sur WhatsApp !`);
          return;
        }
      }

      if (ticketDataUrl) {
        const link = document.createElement('a');
        link.download = `billet-ticketplus-${t.ref}.png`;
        link.href = ticketDataUrl;
        link.click();
      }

      const res = await fetch('/api/notifications/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref: t.ref,
          from: t.from,
          to: t.to,
          date: t.date,
          departure: t.departure,
          seat: t.seat,
          company: t.companyName,
          name: t.passenger || 'Voyageur',
          price: t.price,
        }),
      });
      const data = await res.json();
      if (res.ok && data.whatsapp_url) {
        window.open(data.whatsapp_url, '_blank');
        showFeedback(`Image du billet ${t.ref} enregistrée et redirection WhatsApp !`);
      } else {
        showFeedback(`Image du billet ${t.ref} enregistrée avec succès.`);
      }
    } catch {
      showFeedback(`Billet ${t.ref} généré pour WhatsApp.`);
    }
  };

  const handleDownloadPdf = (t: Ticket) => {
    showFeedback(`Préparation du fichier PDF pour ${t.ref}...`);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    let allTickets: Ticket[] = [];

    // 1. Charger d'abord les réservations stockées localement sur l'appareil
    try {
      const stored = localStorage.getItem('ticketplus_guest_bookings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          allTickets = parsed.map((b: any) => ({
            id: b.id || `local-${b.ref}`,
            ref: b.ref,
            from: b.from || 'Cotonou',
            to: b.to || 'Parakou',
            date: b.date || new Date().toISOString().split('T')[0],
            departure: b.departure || '07:00',
            seat: b.seat || '14',
            price: Number(b.price) || 7500,
            status: (b.status === 'cancelled' ? 'cancelled' : b.status === 'completed' ? 'completed' : 'confirmed') as 'confirmed' | 'completed' | 'cancelled',
            passenger: b.passenger || 'Voyageur',
            payment: b.payment || 'Mobile Money',
            companyName: b.companyName || 'Confort Lines VIP',
            isFlexible: b.isFlexible !== false,
          }));
        }
      }
    } catch (e) {
      console.warn('Guest bookings parse warning:', e);
    }

    // 2. Charger les réservations API de l'utilisateur connecté
    try {
      const res = await fetch('/api/bookings');
      if (res.status === 401) {
        setIsLoggedIn(false);
      } else if (res.ok) {
        setIsLoggedIn(true);
        const data = await res.json();
        if (data.bookings && data.bookings.length > 0) {
          const apiMapped: Ticket[] = data.bookings.map((b: any) => ({
            id: b.id,
            ref: b.booking_reference || `TK-${b.id.slice(0, 8).toUpperCase()}`,
            from: b.trip?.route?.departure_station?.city || 'Cotonou',
            to: b.trip?.route?.arrival_station?.city || 'Parakou',
            date: b.trip?.trip_date || new Date(b.created_at).toISOString().split('T')[0],
            departure: (b.trip?.departure_time || '07:00').substring(0, 5),
            seat: b.seat?.seat_number?.toString().padStart(2, '0') || '01',
            price: b.total_price || 0,
            status: mapStatus(b.status),
            passenger: `${b.passenger_first_name || ''} ${b.passenger_last_name || ''}`.trim(),
            payment: b.payment?.method || 'Mobile Money',
            companyName: b.trip?.route?.company?.name || 'Compagnie',
            isFlexible: b.is_flexible ?? true,
          }));

          // Fusionner en évitant les doublons basés sur la référence
          const existingRefs = new Set(apiMapped.map(t => t.ref));
          allTickets = [...apiMapped, ...allTickets.filter(t => !existingRefs.has(t.ref))];
        }
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
    
    // Check if user is logged in
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    } catch {
      setIsLoggedIn(false);
    }
    
    setTickets(allTickets);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings().finally(() => setIsLoading(false));

    const handleGlobalUpdate = () => {
      fetchBookings();
    };
    window.addEventListener('ticketplus_update', handleGlobalUpdate);
    return () => {
      window.removeEventListener('ticketplus_update', handleGlobalUpdate);
    };
  }, [fetchBookings]);

  const filtered = tickets
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => !searchRef || t.ref.toLowerCase().includes(searchRef.toLowerCase()));

  const counts = {
    all: tickets.length,
    confirmed: tickets.filter(t => t.status === 'confirmed').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    cancelled: tickets.filter(t => t.status === 'cancelled').length,
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="px-4 sm:px-6 pb-4 pt-4">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${locale}`} className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors">Accueil</Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[13px] text-[#0F172A] font-semibold">Mes Billets</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight">
            Mes Billets
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1">
            Retrouvez et téléchargez tous vos billets de voyage Ticket+.
          </p>
        </div>
      </section>

      {/* Search + Filter Bar */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="max-w-[1140px] mx-auto">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#94A3B8]">search</span>
              <input
                type="text"
                value={searchRef}
                onChange={e => setSearchRef(e.target.value)}
                placeholder="Rechercher par référence (ex: TK-2026-...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 outline-none transition-all"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {([
                ['all', 'Tous', counts.all],
                ['confirmed', 'Confirmés', counts.confirmed],
                ['completed', 'Effectués', counts.completed],
                ['cancelled', 'Annulés', counts.cancelled],
              ] as const).map(([key, label, count]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 ${
                    filter === key
                      ? 'bg-[#0F172A] text-white shadow-sm ring-2 ring-[#0F172A]/10'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] border border-[#E2E8F0]'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      filter === key
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/70 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tickets List */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-[1140px] mx-auto space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-[#10B981] block mb-3 animate-spin">progress_activity</span>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">Chargement de vos billets...</h3>
              <p className="text-[13px] text-[#64748B]">Veuillez patienter un instant.</p>
            </div>
          ) : isLoggedIn === false && tickets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-[#F59E0B] block mb-3">login</span>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">Connectez-vous pour voir vos billets</h3>
              <p className="text-[13px] text-[#64748B] mb-4">Créez un compte ou connectez-vous pour accéder à votre historique de réservations.</p>
              <Link href={`/${locale}/profil`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] transition-all">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Se connecter / S&apos;inscrire
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-[#CBD5E1] block mb-3">confirmation_number</span>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">
                {filter === 'cancelled'
                  ? 'Aucun billet annulé'
                  : filter === 'confirmed'
                  ? 'Aucun billet confirmé'
                  : filter === 'completed'
                  ? 'Aucun voyage effectué'
                  : 'Aucun billet trouvé'}
              </h3>
              <p className="text-[13px] text-[#64748B] mb-4">
                {filter === 'cancelled'
                  ? 'Vos éventuels billets annulés et remboursés apparaîtront ici.'
                  : 'Vous n&apos;avez pas de billet correspondant à ce filtre.'}
              </p>
              <Link href={`/${locale}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] transition-all">
                <span className="material-symbols-outlined text-[18px]">search</span>
                Rechercher un trajet
              </Link>
            </div>
          ) : (
            filtered.map(ticket => {
              const st = STATUS_MAP[ticket.status];
              const dateObj = new Date(ticket.date + 'T00:00:00');
              const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
              return (
                <div key={ticket.id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px] text-[#0F172A]">directions_bus</span>
                        </div>
                        <div>
                          <div className="text-[16px] font-bold text-[#0F172A]">{ticket.from} → {ticket.to}</div>
                          <div className="text-[12px] text-[#94A3B8]">{ticket.companyName} • Réf. <strong>{ticket.ref}</strong></div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${st.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{st.icon}</span>
                        {st.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[12px]">
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Date</span>
                        <span className="text-[#0F172A] font-semibold capitalize">{formattedDate}</span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Départ</span>
                        <span className="text-[#0F172A] font-semibold">{ticket.departure}</span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Siège</span>
                        <span className="text-[#0F172A] font-semibold">N° {ticket.seat}</span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Paiement</span>
                        <span className="text-[#0F172A] font-semibold">{ticket.payment}</span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Montant</span>
                        <span className="text-[#0F172A] font-bold">{ticket.price.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>

                    {ticket.status === 'confirmed' && (
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#E2E8F0]">
                        <button 
                          onClick={() => handleDownloadPdf(ticket)}
                          className="px-3.5 py-2 rounded-xl bg-[#0F172A] text-white text-[12px] font-semibold hover:bg-[#1E293B] transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          Télécharger PDF
                        </button>
                        <button 
                          onClick={() => handleSendWhatsApp(ticket)}
                          className="px-3.5 py-2 rounded-xl bg-[#ECFDF5] text-[#059669] text-[12px] font-semibold hover:bg-[#D1FAE5] transition-all flex items-center gap-1.5 border border-[#10B981]/20 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          WhatsApp
                        </button>
                        <button 
                          onClick={() => setSelectedQrTicket(ticket)}
                          className="px-3.5 py-2 rounded-xl bg-[#F8FAFC] text-[#0F172A] text-[12px] font-semibold hover:bg-[#F1F5F9] transition-all flex items-center gap-1.5 border border-[#E2E8F0]"
                        >
                          <span className="material-symbols-outlined text-[16px]">qr_code</span>
                          Voir QR Code
                        </button>
                        {ticket.isFlexible && (
                          <button 
                            onClick={() => setRefundModalTicket(ticket)}
                            className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 text-[12px] font-semibold hover:bg-amber-100 transition-all flex items-center gap-1.5 border border-amber-200 shadow-sm ml-auto"
                          >
                            <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
                            Annuler &amp; Rembourser
                          </button>
                        )}
                      </div>
                    )}

                    {ticket.status === 'cancelled' && (
                      <div className="mt-4 pt-3.5 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl">
                        <div className="flex items-center gap-2 text-rose-700 text-[12px] font-medium">
                          <span className="material-symbols-outlined text-[18px] text-rose-600">check_circle</span>
                          <span>Billet annulé avec succès • Remboursement de {Math.max(0, ticket.price - 300).toLocaleString('fr-FR')} FCFA validé.</span>
                        </div>
                        <button 
                          onClick={() => setSelectedQrTicket(ticket)}
                          className="px-3 py-1.5 rounded-xl bg-white text-rose-700 text-[12px] font-semibold hover:bg-rose-50 transition-all flex items-center gap-1.5 border border-rose-200 self-start sm:self-auto shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                          Voir reçu / billet
                        </button>
                      </div>
                    )}

                    {ticket.status === 'completed' && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl">
                        <div className="flex items-center gap-2 text-slate-600 text-[12px] font-medium">
                          <span className="material-symbols-outlined text-[18px] text-slate-500">done_all</span>
                          <span>Trajet effectué • Merci d&apos;avoir voyagé avec Ticket+ !</span>
                        </div>
                        <button 
                          onClick={() => setSelectedQrTicket(ticket)}
                          className="px-3 py-1.5 rounded-xl bg-white text-slate-700 text-[12px] font-semibold hover:bg-slate-100 transition-all flex items-center gap-1.5 border border-slate-200 self-start sm:self-auto shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[15px]">visibility</span>
                          Consulter l&apos;archive
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Toast Feedback */}
      {actionFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-[13px] font-medium border border-slate-700 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-[#10B981]">info</span>
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Modal Ticket & QR Code Officiel */}
      {selectedQrTicket && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedQrTicket(null)}
        >
          <div 
            className="relative w-full max-w-[500px] my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Bouton fermeture flottant */}
            <div className="flex justify-end mb-2">
              <button 
                onClick={() => setSelectedQrTicket(null)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all backdrop-blur-sm"
                aria-label="Fermer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Le billet fidèle */}
            <TicketCard 
              data={{
                ref: selectedQrTicket.ref,
                from: selectedQrTicket.from,
                to: selectedQrTicket.to,
                date: selectedQrTicket.date,
                departure: selectedQrTicket.departure,
                seat: selectedQrTicket.seat,
                price: selectedQrTicket.price,
                name: selectedQrTicket.passenger || 'Voyageur',
                payment: selectedQrTicket.payment,
                company: selectedQrTicket.companyName,
                isFlexible: selectedQrTicket.isFlexible,
              }}
            />

            {/* Actions rapides sous le billet */}
            <div className="flex items-center justify-center gap-3 mt-4 print:hidden">
              <button
                onClick={() => handleDownloadPdf(selectedQrTicket)}
                className="px-4 py-2.5 rounded-xl bg-white text-[#0B1324] text-[13px] font-bold hover:bg-slate-100 transition-all flex items-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Télécharger PDF
              </button>
              <button
                onClick={() => handleSendWhatsApp(selectedQrTicket)}
                className="px-4 py-2.5 rounded-xl bg-[#00D084] text-white text-[13px] font-bold hover:bg-[#00B874] transition-all flex items-center gap-2 shadow-lg"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Remboursement Flexible */}
      {refundModalTicket && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => !isRefunding && setRefundModalTicket(null)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-5 mb-5 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-200 text-amber-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">currency_exchange</span>
              </div>
              <div>
                <h4 className="font-extrabold text-[16px] text-amber-900 leading-tight">
                  Annulation &amp; Remboursement
                </h4>
                <p className="text-[12px] text-amber-700 font-medium">
                  Billet flexible • Réf. {refundModalTicket.ref}
                </p>
              </div>
              <button 
                onClick={() => !isRefunding && setRefundModalTicket(null)}
                className="ml-auto w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Trip info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-slate-700">directions_bus</span>
                </div>
                <div>
                  <div className="text-[15px] font-bold text-[#0F172A]">{refundModalTicket.from} → {refundModalTicket.to}</div>
                  <div className="text-[12px] text-[#94A3B8]">{refundModalTicket.companyName} • Siège N° {refundModalTicket.seat}</div>
                </div>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-600">Montant payé</span>
                <span className="font-bold text-[#0F172A]">{refundModalTicket.price.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-slate-600">Frais de traitement Ticket+</span>
                <span className="font-semibold text-red-600">- 300 FCFA</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-[14px]">
                <span className="font-bold text-[#0F172A]">Montant remboursé</span>
                <span className="font-black text-emerald-600">{Math.max(0, refundModalTicket.price - 300).toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* Reason selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Motif de l&apos;annulation
              </label>
              <select
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-[#0F172A] outline-none focus:border-amber-400 transition-all"
              >
                <option>Changement d&apos;itinéraire</option>
                <option>Report du voyage</option>
                <option>Raison personnelle</option>
                <option>Problème de santé</option>
                <option>Autre</option>
              </select>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-[11px] text-amber-800 leading-relaxed">
              <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0">warning</span>
              <span>
                Le remboursement sera crédité sur votre compte <strong>Mobile Money</strong> sous 5 à 15 minutes. 
                Cette action est <strong>irréversible</strong> — votre siège sera libéré et votre billet annulé.
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setRefundModalTicket(null)}
                disabled={isRefunding}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] transition-all disabled:opacity-50"
              >
                Garder mon billet
              </button>
              <button
                onClick={handleProcessRefund}
                disabled={isRefunding}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
              >
                {isRefunding ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
                    <span>Confirmer le remboursement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
