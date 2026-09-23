'use client';
import React from 'react';

export const SidebarWidgets = () => {
  return (
    <div className="space-y-6">
      {/* Widget Sérénité */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="h-32 bg-slate-200 relative overflow-hidden flex items-end">
           {/* Placeholder for actual image */}
           <div className="absolute inset-0 bg-[#0F172A]/60 flex flex-col justify-end p-4 text-white">
              <span className="material-symbols-outlined text-[24px] mb-1">verified_user</span>
              <h3 className="font-bold text-[15px]">Voyagez en toute sérénité</h3>
           </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#10B981] text-[18px]">check_circle</span>
            <div className="text-[13px]">
              <span className="font-semibold text-[#0F172A] block">Flotte Certifiée Confort</span>
              <span className="text-[#64748B]">Véhicules climatisés haut de gamme</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#10B981] text-[18px]">check_circle</span>
            <div className="text-[13px]">
              <span className="font-semibold text-[#0F172A] block">Contrôles techniques réguliers</span>
              <span className="text-[#64748B]">Sécurité maximale garantie</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[#10B981] text-[18px]">check_circle</span>
            <div className="text-[13px]">
              <span className="font-semibold text-[#0F172A] block">Chauffeurs assermentés</span>
              <span className="text-[#64748B]">Formation continue et suivi strict</span>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Itinéraire */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
        <h3 className="font-bold text-[#0F172A] text-[15px] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[#64748B]">route</span>
          Itinéraire RNIE 2
        </h3>
        
        <div className="relative pl-6 py-2">
          <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-[#E2E8F0] z-0"></div>
          
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-[14px] h-[14px] rounded-full border-2 border-[#10B981] bg-white absolute -left-[6px]"></div>
              <div className="text-[13px]">
                <span className="font-semibold text-[#0F172A] block">Cotonou</span>
                <span className="text-[#64748B] text-[11px]">Point de départ</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-[10px] h-[10px] rounded-full bg-[#CBD5E1] absolute -left-[4px]"></div>
              <div className="text-[13px]">
                <span className="font-medium text-[#64748B] block">Bohicon (Halte 15 min)</span>
                <span className="text-[#94A3B8] text-[11px]">Ville traversée</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-[14px] h-[14px] rounded-full bg-[#EF4444] border-2 border-white shadow-sm absolute -left-[6px]"></div>
              <div className="text-[13px]">
                <span className="font-semibold text-[#0F172A] block">Parakou</span>
                <span className="text-[#64748B] text-[11px]">Terminus</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[13px]">
          <span className="text-[#64748B]">Distance totale</span>
          <span className="font-bold text-[#0F172A]">415 km</span>
        </div>
      </div>

      {/* Widget Aide */}
      <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-5 shadow-sm text-center">
        <div className="w-12 h-12 bg-[#ECFDF5] rounded-full mx-auto flex items-center justify-center text-[#10B981] mb-3">
          <span className="material-symbols-outlined text-[24px]">support_agent</span>
        </div>
        <h3 className="font-bold text-[#0F172A] text-[15px] mb-2">Besoin d'aide ?</h3>
        <p className="text-[12px] text-[#64748B] mb-4">
          Notre équipe est disponible 7j/7 pour vous assister dans votre réservation.
        </p>
        <a 
          href="https://wa.me/2290154658907"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#22C35E] text-white text-[13px] font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">forum</span>
          Échanger sur WhatsApp
        </a>
      </div>
    </div>
  );
};
