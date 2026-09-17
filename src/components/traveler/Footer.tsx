'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export const Footer = () => {
  const locale = useLocale();

  return (
    <footer className="w-full bg-white border-t border-[#E2E8F0]">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
              </div>
              <span className="text-[17px] font-bold tracking-tight text-[#0F172A]">
                Ticket<span className="text-[#10B981]">+</span> Bénin
              </span>
            </div>
            <p className="text-[13px] text-[#64748B] max-w-sm leading-relaxed">
              Tous les horaires, prix réels et billets sécurisés en un clic.
            </p>
            <div className="flex items-start gap-2 pt-1">
              <span className="material-symbols-outlined text-[#10B981] text-[18px] mt-0.5">verified_user</span>
              <div className="text-[13px]">
                <span className="font-semibold text-[#0F172A] block">Transporteur Partenaire Actif</span>
                <span className="text-[#64748B]">Confort Lines S.A. • Liaisons quotidiennes Cotonou, Parakou, Natitingou, Bohicon</span>
                <span className="block text-[#94A3B8] text-[11px] mt-1">Assistance voyageurs 7j/7</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <div className="text-[14px] font-bold text-[#0F172A]">Plateforme & Réservation</div>
            <ul className="space-y-2.5 text-[13px] text-[#64748B]">
              <li><Link href={`/${locale}`} className="hover:text-[#0F172A] transition-colors">Rechercher un trajet</Link></li>
              <li><Link href={`/${locale}/compagnies`} className="hover:text-[#0F172A] transition-colors">Compagnies & Flotte</Link></li>
              <li><Link href={`/${locale}/mon-billet`} className="hover:text-[#0F172A] transition-colors">Télécharger mon billet</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-[#0F172A] transition-colors">Support & Gares partenaires</Link></li>
            </ul>
          </div>

          {/* Certification */}
          <div className="space-y-4">
            <div className="text-[14px] font-bold text-[#0F172A]">Partenaires & Sécurité</div>
            <p className="text-[13px] text-[#64748B]">Plateforme conforme aux standards du Ministère du Cadre de Vie et des Transports du Bénin.</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F1F5F9] text-[11px] text-[#0F172A] font-medium">
              <span className="material-symbols-outlined text-[#10B981] text-[14px]">verified</span>
              Billetterie Certifiée & Conforme
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#64748B] pt-1">
              <span className="material-symbols-outlined text-[14px]">support_agent</span>
              <span>Support WhatsApp : +229 01 54 65 89 07</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-[#94A3B8] border-t border-[#E2E8F0]">
          <p>© 2024 Ticket+ Bénin. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/conditions`} className="hover:text-[#0F172A] transition-colors">Conditions Générales</Link>
            <Link href={`/${locale}/confidentialite`} className="hover:text-[#0F172A] transition-colors">Confidentialité</Link>
            <Link href={`/${locale}/mentions-legales`} className="hover:text-[#0F172A] transition-colors">Mentions Légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
