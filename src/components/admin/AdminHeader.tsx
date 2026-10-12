'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const { profile } = useAuth();

  return (
    <header className="h-16 px-8 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div>
        <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Plateforme Active</span>
        </div>

        {/* Currency badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
          <span className="material-symbols-outlined text-[16px] text-slate-400">payments</span>
          <span>Devise : <strong>XOF (FCFA)</strong></span>
        </div>

        {/* Quick action button */}
        <Link
          href="/admin/companies"
          className="h-9 px-3.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">add_business</span>
          <span className="hidden sm:inline">Ajouter Compagnie</span>
        </Link>
      </div>
    </header>
  );
};
