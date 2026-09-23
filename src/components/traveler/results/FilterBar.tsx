'use client';
import React from 'react';

export const FilterBar = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-2">
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
        <button className="px-4 py-2 rounded-full bg-[#0F172A] text-white text-[13px] font-semibold shrink-0">
          Tous les départs (3)
        </button>
        <button className="px-4 py-2 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] text-[13px] font-medium hover:border-[#CBD5E1] hover:text-[#0F172A] transition-colors shrink-0">
          Confort Lines
        </button>
        <button className="px-4 py-2 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] text-[13px] font-medium hover:border-[#CBD5E1] hover:text-[#0F172A] transition-colors shrink-0">
          Bus Climatisé VIP
        </button>
        <button className="px-4 py-2 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] text-[13px] font-medium hover:border-[#CBD5E1] hover:text-[#0F172A] transition-colors shrink-0">
          Trajet Direct RNIE 2
        </button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[13px] text-[#64748B]">Trier par :</span>
        <select className="bg-white border border-[#E2E8F0] text-[#0F172A] text-[13px] font-semibold rounded-lg px-3 py-2 outline-none focus:border-[#10B981] transition-colors appearance-none cursor-pointer relative">
          <option>Départ le plus tôt (07h00)</option>
          <option>Départ le plus tard</option>
          <option>Prix croissant</option>
        </select>
      </div>
    </div>
  );
};
