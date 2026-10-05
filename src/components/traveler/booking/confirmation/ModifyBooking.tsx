"use client";

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export const ModifyBooking = () => {
  const locale = useLocale();

  return (
    <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between gap-space-sm mt-space-lg">
      <div className="flex items-center gap-space-xs">
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
          <span className="material-symbols-outlined text-[18px]">help</span>
        </div>
        <div>
          <div className="font-label-md text-label-md font-semibold text-on-surface">Un empêchement ?</div>
          <div className="font-label-sm text-label-sm text-on-surface-variant">Modifiable jusqu'à 2h avant le départ</div>
        </div>
      </div>
      <Link href={`/${locale}`} className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface text-on-surface font-label-sm text-label-sm font-semibold shadow-sm transition-colors">
        Modifier
      </Link>
    </div>
  );
};
