'use client';
import React from 'react';

export const DateCarousel = () => {
  const dates = [
    { label: 'Hier', date: 'Mer. 23 Oct', price: null, status: 'COMPLET', active: false },
    { label: "Aujourd'hui", date: 'Jeu. 24 Oct', price: 'Dès 6 500 FCFA', status: 'SÉLECTIONNÉ', active: true },
    { label: 'Demain', date: 'Ven. 25 Oct', price: 'Dès 6 500 FCFA', status: 'DISPONIBLE', active: false },
    { label: 'Samedi', date: 'Sam. 26 Oct', price: 'Dès 6 500 FCFA', status: 'DISPONIBLE', active: false },
    { label: 'Dimanche', date: 'Dim. 27 Oct', price: 'Dès 6 500 FCFA', status: 'DISPONIBLE', active: false },
  ];

  return (
    <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
      <div className="flex items-center gap-3 min-w-max">
        {dates.map((d, i) => (
          <button 
            key={i}
            className={`relative flex flex-col items-center justify-center min-w-[130px] p-3 rounded-xl border transition-all ${
              d.active 
                ? 'bg-[#042F2E] border-[#042F2E] text-white shadow-md shadow-[#042F2E]/20' 
                : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B]'
            }`}
          >
            {d.active && (
              <div className="absolute -top-2.5 bg-[#10B981] text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider">
                {d.status}
              </div>
            )}
            <span className={`text-[12px] font-medium mb-0.5 ${d.active ? 'text-[#99F6E4]' : ''}`}>{d.label}</span>
            <span className={`text-[15px] font-bold mb-1 ${d.active ? 'text-white' : 'text-[#0F172A]'}`}>{d.date}</span>
            {d.price ? (
              <span className={`text-[11px] font-semibold ${d.active ? 'text-[#34D399]' : 'text-[#10B981]'}`}>{d.price}</span>
            ) : (
              <span className="text-[11px] font-semibold text-[#94A3B8]">{d.status}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
