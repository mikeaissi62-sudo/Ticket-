'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { BusTracker } from '@/components/traveler/BusTracker';

export default function SuiviIndexPage() {
  const locale = useLocale();
  const router = useRouter();
  const [searchRef, setSearchRef] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchRef.trim().toUpperCase();
    if (clean) {
      router.push(`/${locale}/suivi/${clean}`);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-[13px] text-[#64748B]">
          <Link href={`/${locale}`} className="hover:text-[#0F172A] transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-[#0F172A] font-semibold">Suivi en direct</span>
        </div>

        {/* Search by Reference Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-md mb-8">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-extrabold mb-2">
              RADAR BUS TEMPS RÉEL
            </span>
            <h1 className="text-[26px] sm:text-[32px] font-extrabold text-[#0F172A] tracking-tight mb-2">
              Suivre un Autocar en Direct
            </h1>
            <p className="text-[14px] text-[#64748B] mb-5">
              Entrez votre numéro de réservation (ex: <strong>TK-78B451</strong>) pour visualiser la position GPS exacte du bus sur la carte.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  placeholder="Référence de billet (ex: TK-78B451)"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[#0F172A] text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-all uppercase placeholder:normal-case"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-[14px] transition-all flex items-center justify-center gap-2 shadow-md shrink-0"
              >
                <span>Localiser le bus</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>

        {/* Live Active Demonstration Bus */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-[#0F172A]">
            Départ en direct : Corridor Cotonou ➔ Parakou
          </h2>
          <span className="text-[12px] text-[#10B981] font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
            Balise active
          </span>
        </div>

        <BusTracker
          tripId="demo-cotonou-parakou"
          bookingRef="TK-LIVE-BENIN"
          companyName="Confort Lines VIP"
          from="Cotonou"
          to="Parakou"
          departureTime="07:00"
          arrivalTime="13:30"
          busPlateNumber="AA 1234 RB"
        />
      </div>
    </div>
  );
}
