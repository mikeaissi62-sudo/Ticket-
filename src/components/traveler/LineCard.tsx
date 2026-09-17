'use client';

import React from 'react';
import Link from 'next/link';

interface LineCardProps {
  from: string;
  to: string;
  price: string;
  details: string;
  duration: string;
  tag: string;
}

export const LineCard = ({ from, to, price, details, duration, tag }: LineCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Top tag bar */}
      <div className="px-4 pt-3.5 pb-2 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-semibold border border-[#10B981]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          Opéré par Confort Lines
        </span>
        <span className="text-[10px] text-[#94A3B8] font-medium">{tag}</span>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">
          {from} ⇄ {to}
        </h3>
        <p className="text-[12px] text-[#64748B] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-[#10B981]">directions_bus</span>
          {details}
        </p>
      </div>

      {/* Price + CTA */}
      <div className="px-4 pb-4 mt-auto">
        <div className="mb-3">
          <span className="text-[11px] text-[#94A3B8] font-medium">Tarif officiel dès</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-extrabold text-[#0F172A] tracking-tight">{price}</span>
            <span className="text-[13px] text-[#94A3B8] font-medium">FCFA</span>
          </div>
        </div>
        <Link
          href="#"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] transition-all"
        >
          Voir les départs / Réserver
        </Link>
      </div>
    </div>
  );
};
