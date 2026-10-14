'use client';
import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface SearchSummaryBarProps {
  from?: string;
  to?: string;
  date?: string;
  passengers?: number;
  tripCount?: number;
}

export const SearchSummaryBar = ({ from = 'Cotonou', to = 'Parakou', date, passengers = 1, tripCount = 0 }: SearchSummaryBarProps) => {
  const locale = useLocale();

  let formattedDate = 'Date non définie';
  if (date) {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  return (
    <div className="bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 w-full md:w-auto">
          <div className="flex items-center gap-3 text-[#0F172A]">
            <span className="text-xl font-bold">{from}</span>
            <span className="material-symbols-outlined text-[#64748B]">arrow_right_alt</span>
            <span className="text-xl font-bold">{to}</span>
          </div>
          
          <div className="hidden md:block w-[1px] h-8 bg-[#E2E8F0]"></div>
          
          <div className="flex items-center gap-4 text-[14px] text-[#64748B] font-medium">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span>{passengers} Voyageur{passengers > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] text-[#059669] border border-[#10B981]/20 text-[12px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            {tripCount} Départ{tripCount > 1 ? 's' : ''} Direct{tripCount > 1 ? 's' : ''} Garanti{tripCount > 1 ? 's' : ''}
          </div>
          <Link 
            href={`/${locale}`}
            className="px-4 py-2 rounded-lg border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-[13px] font-semibold transition-colors shadow-sm bg-white"
          >
            Modifier
          </Link>
        </div>

      </div>
    </div>
  );
};
