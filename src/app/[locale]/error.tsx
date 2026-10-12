'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] max-w-md w-full">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[24px]">warning</span>
        </div>
        <h2 className="text-[18px] font-bold text-[#0F172A] mb-2">Une erreur temporaire est survenue</h2>
        <p className="text-[13px] text-[#64748B] mb-6">Nous nous excusons pour ce désagrément. Vous pouvez réessayer ou revenir à l&apos;accueil.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-[#0F172A] text-[13px] font-semibold hover:bg-[#F1F5F9] transition-colors"
          >
            Réessayer
          </button>
          <Link
            href={`/${locale}`}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-[13px] font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
