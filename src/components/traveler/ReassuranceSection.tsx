'use client';

import React from 'react';

export const ReassuranceSection = () => {
  return (
    <>
      {/* 3 Columns Reassurance */}
      <section className="py-12">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 sm:p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {/* Flotte Moderne */}
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <span className="material-symbols-outlined text-[24px]">directions_bus</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#0F172A] mb-2">Flotte Moderne</h3>
                <p className="text-[13px] text-[#64748B] leading-relaxed">
                  Autocars récents, climatisation continue et sièges inclinables ergonomiques pour un repos parfait tout au long du trajet.
                </p>
              </div>

              {/* Paiement Instantané */}
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <span className="material-symbols-outlined text-[24px]">payments</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#0F172A] mb-2">Paiement Instantané</h3>
                <p className="text-[13px] text-[#64748B] leading-relaxed">
                  Validation sécurisée sans file d&apos;attente par MTN MoMo, Moov Money ou Carte bancaire avec confirmation immédiate.
                </p>
              </div>

              {/* Ponctualité */}
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center mb-4 mx-auto md:mx-0">
                  <span className="material-symbols-outlined text-[24px]">schedule</span>
                </div>
                <h3 className="text-[16px] font-bold text-[#0F172A] mb-2">Ponctualité Respectée</h3>
                <p className="text-[13px] text-[#64748B] leading-relaxed">
                  Départs à heure fixe, suivi logistique en direct et agents d&apos;assistance dédiés au voyageur dans chaque gare.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="pb-12">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px] text-[#0F172A]">info</span>
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-[#0F172A]">Besoin d&apos;un billet pour aujourd&apos;hui ?</h4>
                <p className="text-[12px] text-[#64748B]">Présentez-vous 30 minutes avant le départ à la Gare Étoile Rouge ou réservez en ligne.</p>
              </div>
            </div>
            <a
              href="https://wa.me/2290154658907"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-5 py-2.5 rounded-xl border border-[#10B981] text-[#059669] text-[13px] font-semibold hover:bg-[#ECFDF5] transition-colors"
            >
              Contacter la gare
            </a>
          </div>
        </div>
      </section>
    </>
  );
};
