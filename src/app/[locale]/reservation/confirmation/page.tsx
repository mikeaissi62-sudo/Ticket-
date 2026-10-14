'use client';

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg print:block">
          {/* Colonne Principale : Le Billet */}
          <div className="lg:col-span-8 flex justify-center print:w-full">
            <TicketCard data={bookingData} />
          </div>

          {/* Colonne Latérale : Actions & Infos - Masquée à l'impression */}
          <div className="print:hidden lg:col-span-4 space-y-space-lg">
            <ActionButtons phone={phone} data={bookingData} />
            <StationInfo from={from} />
            <ModifyBooking />
          </div>
        </div>

      </div>
    </main>
  );
}
