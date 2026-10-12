'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function NotFound() {
  const locale = useLocale();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] max-w-md w-full">
        <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[24px]">search_off</span>
        </div>
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-2">Page introuvable</h2>
        <p className="text-[13px] text-[#64748B] mb-6">Cette page n&apos;existe plus ou a été retirée du site.</p>
        <Link
          href={`/${locale}`}
          className="inline-block px-5 py-2.5 rounded-xl bg-primary text-on-primary text-[13px] font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
        >
          Retourner à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
