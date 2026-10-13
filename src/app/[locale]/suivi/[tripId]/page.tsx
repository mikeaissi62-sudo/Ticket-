'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { BusTracker } from '@/components/traveler/BusTracker';

export default function SuiviTripPage() {
  const params = useParams();
  const locale = useLocale();
  const router = useRouter();
  const tripParam = (params.tripId as string) || 'TK-78B451';

  const [bookingInfo, setBookingInfo] = useState<{
    ref: string;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    company: string;
    seat: string;
    plate: string;
  }>({
    ref: tripParam.startsWith('TK-') ? tripParam : `TK-${tripParam.slice(0, 6).toUpperCase()}`,
    from: 'Cotonou',
    to: 'Parakou',
    departureTime: '07:00',
    arrivalTime: '13:30',
    company: 'Confort Lines VIP',
    seat: '12',
    plate: 'AA 1234 RB',
  });

  const [loading, setLoading] = useState(false);

  // Essayer de charger les infos réelles de la réservation si possible
  useEffect(() => {
    async function fetchTripDetails() {
      try {
        setLoading(true);
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const data = await res.json();
          if (data.bookings && data.bookings.length > 0) {
            const found = data.bookings.find(
              (b: any) =>
                b.booking_reference === tripParam ||
                b.id === tripParam ||
                b.trip_id === tripParam
            );
            if (found) {
              setBookingInfo({
                ref: found.booking_reference || tripParam,
                from: found.trip?.route?.departure_station?.city || 'Cotonou',
                to: found.trip?.route?.arrival_station?.city || 'Parakou',
                departureTime: (found.trip?.departure_time || '07:00').substring(0, 5),
                arrivalTime: '13:30',
                company: found.trip?.route?.company?.name || 'Confort Lines VIP',
                seat: found.seat?.seat_number?.toString() || '12',
                plate: found.trip?.bus?.plate_number || 'AA 1234 RB',
              });
            }
          }
        }
      } catch (err) {
        console.warn('Trip details fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTripDetails();
  }, [tripParam]);

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-[13px] text-[#64748B]">
            <Link href={`/${locale}`} className="hover:text-[#0F172A] transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link href={`/${locale}/mon-billet`} className="hover:text-[#0F172A] transition-colors">
              Mes Billets
            </Link>
            <span>/</span>
            <span className="text-[#0F172A] font-semibold">Suivi en direct</span>
          </div>

          <Link
            href={`/${locale}/mon-billet`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[13px] font-semibold text-[#0F172A] shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
            <span>Voir mon e-billet</span>
          </Link>
        </div>

        {/* Hero Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-extrabold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            RADAR GPS SATELLITE ACTIF
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight">
            Suivi Temps Réel de votre Autocar
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1">
            Localisation précise par balise GPS et Supabase Realtime le long de l&apos;axe national {bookingInfo.from} ➔ {bookingInfo.to}.
          </p>
        </div>

        {/* Bus Tracker Component */}
        <BusTracker
          tripId={tripParam}
          bookingRef={bookingInfo.ref}
          companyName={bookingInfo.company}
          from={bookingInfo.from}
          to={bookingInfo.to}
          departureTime={bookingInfo.departureTime}
          arrivalTime={bookingInfo.arrivalTime}
          busPlateNumber={bookingInfo.plate}
        />

        {/* Helpful Assistance Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">notifications_active</span>
            </div>
            <h4 className="text-[15px] font-bold text-[#0F172A] mb-1">Rappels SMS &amp; WhatsApp</h4>
            <p className="text-[12px] text-[#64748B] leading-relaxed">
              Vous recevez un SMS automatique dès que le bus approche à moins de 30 km de votre gare d&apos;embarquement.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <h4 className="text-[15px] font-bold text-[#0F172A] mb-1">Sécurité Routière Certifiée</h4>
            <p className="text-[12px] text-[#64748B] leading-relaxed">
              Vitesse régulée à 90 km/h max avec contrôle télématique permanent par le centre de contrôle Ticket+.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[20px]">headset_mic</span>
            </div>
            <h4 className="text-[15px] font-bold text-[#0F172A] mb-1">Assistance Embarquement</h4>
            <p className="text-[12px] text-[#64748B] leading-relaxed">
              Une question ou un retard ? Contactez la régulation au <strong>+229 01 54 65 89 07</strong> (WhatsApp ou Appel direct).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
