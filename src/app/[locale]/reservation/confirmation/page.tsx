'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ConfirmationHeader } from "@/components/traveler/booking/confirmation/ConfirmationHeader";
import { TicketCard } from "@/components/traveler/booking/confirmation/TicketCard";
import { ActionButtons } from "@/components/traveler/booking/confirmation/ActionButtons";
import { StationInfo } from "@/components/traveler/booking/confirmation/StationInfo";
import { ModifyBooking } from "@/components/traveler/booking/confirmation/ModifyBooking";

export default function BookingConfirmationPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();

  const from = searchParams.get('from') || 'Cotonou';
  const to = searchParams.get('to') || 'Parakou';
  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const seat = searchParams.get('seat') || '12';
  const payment = searchParams.get('payment') || 'mtn';
  const price = searchParams.get('price') || '6500';
  const name = searchParams.get('name') || 'Voyageur';
  const phone = searchParams.get('phone') || '01 54 65 89 07';
  const company = searchParams.get('company') || 'Confort Lines VIP';
  const ref = searchParams.get('ref') || 'TK-78B451';

  const bookingData = { ref, from, to, date: dateParam, seat, payment, price, name, phone, company };

  // Dès la confirmation d'achat : enregistrer le billet et créer la notification
  useEffect(() => {
    try {
      const bookingRef = ref && ref.startsWith('TK') ? ref : `TKP-${ref}`;
      const rawPrice = price ? Number(String(price).replace(/[^0-9]/g, '')) : 7500;
      const formattedPrice = (rawPrice > 0 ? rawPrice : 7500).toLocaleString('fr-FR');

      // 1. Sauvegarde dans les réservations accessibles sur "Mon Billet"
      const storedBookings = localStorage.getItem('ticketplus_guest_bookings');
      const bookingsList = storedBookings ? JSON.parse(storedBookings) : [];
      const alreadyExists = bookingsList.some((b: any) => b.ref === bookingRef);

      if (!alreadyExists) {
        bookingsList.unshift({
          id: `booking-${Date.now()}`,
          ref: bookingRef,
          from,
          to,
          date: dateParam,
          departure: '07:00',
          seat,
          price: rawPrice > 0 ? rawPrice : 7500,
          status: 'confirmed',
          passenger: name || 'Voyageur',
          payment: payment.includes('moov') ? 'Moov Money (Payé)' : 'MTN MoMo (Payé)',
          companyName: company || 'Confort Lines VIP',
          isFlexible: true,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('ticketplus_guest_bookings', JSON.stringify(bookingsList));
      }

      // 2. Création de la notification d'achat confirmée
      const storedNotifs = localStorage.getItem('ticketplus_notifications');
      const notifsList = storedNotifs ? JSON.parse(storedNotifs) : [];
      const notifAlreadyExists = notifsList.some((n: any) => n.booking_ref === bookingRef);

      if (!notifAlreadyExists) {
        const newNotif = {
          id: `notif-${Date.now()}`,
          title: `Billet réservé avec succès (${bookingRef})`,
          message: `Votre trajet ${from} ➔ ${to} (Siège N° ${seat}) chez ${company} est confirmé. Montant payé : ${formattedPrice} FCFA. Vous pouvez le consulter et le télécharger.`,
          type: 'booking',
          booking_ref: bookingRef,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        notifsList.unshift(newNotif);
        localStorage.setItem('ticketplus_notifications', JSON.stringify(notifsList));

        // Enregistrer également sur le serveur si connecté
        fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNotif),
        }).catch(() => {});
      }

      // 3. Répertorier chaque billet acheté dans Supabase pour le portail admin
      fetch('/api/bookings/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_reference: bookingRef,
          from,
          to,
          company_name: company,
          date: dateParam,
          seat,
          price: rawPrice > 0 ? rawPrice : 7500,
          name,
          phone,
          payment_method: payment,
        }),
      }).catch((err) => {
        console.warn('Booking record API sync warning:', err);
      });

      // Notifier le Header pour actualiser immédiatement les compteurs
      window.dispatchEvent(new Event('ticketplus_update'));
    } catch (e) {
      console.warn('Booking confirmation sync warning:', e);
    }
  }, [ref, from, to, dateParam, seat, payment, price, name, phone, company]);

  return (
    <main className="min-h-screen bg-surface pb-10 pt-6 print:p-0 print:m-0 print:bg-white print:min-h-0">
      <div className="max-w-[1140px] mx-auto px-4 md:px-6 print:p-0 print:max-w-none">
        
        {/* En-tête de page (Retour) - Masqué à l'impression */}
        <div className="print:hidden mb-space-lg flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors font-label-lg text-label-lg font-medium group">
            <div className="w-10 h-10 rounded-full bg-surface-container-low group-hover:bg-primary-container flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[20px] group-hover:text-on-primary-container">arrow_back</span>
            </div>
            Retour à l&apos;accueil
          </Link>
          <a href="https://wa.me/2290154658907" className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline hover:bg-surface-container-low transition-colors font-label-md text-label-md font-medium text-on-surface">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            Besoin d&apos;aide ?
          </a>
        </div>

        {/* Composant de validation / succès - Masqué à l'impression */}
        <div className="print:hidden">
          <ConfirmationHeader />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start print:block">
          {/* Colonne Principale : Le Billet (hauteur naturelle sans espace vide) */}
          <div className="lg:col-span-8 flex justify-center items-start self-start print:w-full">
            <TicketCard data={bookingData} />
          </div>

          {/* Colonne Latérale : Actions & Infos - Masquée à l'impression */}
          <div className="print:hidden lg:col-span-4 space-y-space-lg">
            <ActionButtons phone={phone} data={bookingData} />
            <StationInfo from={from} />
            <ModifyBooking data={bookingData} />
          </div>
        </div>

      </div>
    </main>
  );
}
