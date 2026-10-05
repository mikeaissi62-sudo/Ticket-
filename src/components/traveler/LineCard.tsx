'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useSearchStore } from '@/stores/searchStore';

interface LineCardProps {
  from: string;
  to: string;
  price: string;
  details: string;
  duration: string;
  tag: string;
}

export const LineCard = ({ from, to, price, details, duration, tag }: LineCardProps) => {
  const locale = useLocale();
  const router = useRouter();
  const { setSearch } = useSearchStore();
  
  // Set default date to today for the quick search link
  const todayStr = new Date().toISOString().split('T')[0];
  
  const searchUrl = `/${locale}/resultats?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${todayStr}&passengers=1`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSearch(from, to, todayStr, 1);
    router.push(searchUrl);
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Top tag bar */}
      <div className="px-space-sm pt-space-sm pb-2 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold border border-secondary/20">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
          Partenaires Officiels
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">{tag}</span>
      </div>

      {/* Content */}
      <div className="px-space-sm pb-2">
        <h3 className="font-title-md text-title-md font-bold text-on-surface mb-1">
          {from} ⇄ {to}
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-secondary">directions_bus</span>
          {details}
        </p>
      </div>

      {/* Price + CTA */}
      <div className="px-space-sm pb-space-sm mt-auto">
        <div className="mb-3">
          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Tarif officiel dès</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display-sm text-display-sm font-extrabold text-on-surface tracking-tight">{price}</span>
            <span className="font-body-md text-body-md text-on-surface-variant font-medium">FCFA</span>
          </div>
        </div>
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container hover:text-on-primary-container transition-all"
        >
          Voir les départs / Réserver
        </button>
      </div>
    </div>
  );
};
