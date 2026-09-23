'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export const Footer = () => {
  const locale = useLocale();

  return (
    <footer className="w-full bg-surface-container-lowest shadow-[0_-1px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1140px] mx-auto px-gutter pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl mb-space-xl">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-space-sm mb-space-md">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Ticket<span className="text-secondary">+</span></span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
              Plateforme de réservation et comparateur interurbain certifié au Bénin. Voyagez sereinement avec nos flottes partenaires équipées de standards VIP.
            </p>
            <div className="flex items-center gap-space-xs text-secondary">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="font-label-sm text-label-sm font-semibold">Billetterie Conventionnée Officielle</span>
            </div>
          </div>

          {/* Lignes Populaires */}
          <div>
            <div className="font-title-md text-title-md text-on-surface font-semibold mb-space-md">Lignes Populaires</div>
            <ul className="space-y-space-xs">
              <li className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer">Cotonou ➔ Parakou</li>
              <li className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer">Cotonou ➔ Porto-Novo</li>
              <li className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer">Parakou ➔ Natitingou</li>
              <li className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer">Cotonou ➔ Bohicon / Abomey</li>
              <li className="font-body-md text-body-md text-on-surface-variant hover:text-on-surface cursor-pointer">Liaisons Transfrontalières (Lomé/Niamey)</li>
            </ul>
          </div>

          {/* Compagnies & Réseau */}
          <div>
            <div className="font-title-md text-title-md text-on-surface font-semibold mb-space-md">Compagnies &amp; Réseau</div>
            <ul className="space-y-space-xs">
              <li className="font-body-md text-body-md text-on-surface-variant flex items-center justify-between">
                <span>Confort Lines</span>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">Exclusif</span>
              </li>
              <li className="font-body-md text-body-md text-on-surface-variant flex items-center justify-between">
                <span>Baobab Express</span>
                <span className="font-label-sm text-label-sm text-outline">Bientôt</span>
              </li>
              <li className="font-body-md text-body-md text-on-surface-variant flex items-center justify-between">
                <span>STM Voyageurs</span>
                <span className="font-label-sm text-label-sm text-outline">Bientôt</span>
              </li>
              <li className="font-body-md text-body-md text-on-surface-variant pt-2">
                <Link href={`/${locale}/compagnies`} className="text-secondary hover:underline font-label-md text-label-md">
                  Découvrir le réseau partenaire
                </Link>
              </li>
            </ul>
          </div>

          {/* Assistance & Sécurité */}
          <div>
            <div className="font-title-md text-title-md text-on-surface font-semibold mb-space-md">Assistance &amp; Sécurité</div>
            <div className="space-y-space-sm mb-space-md">
              <div className="flex items-center gap-space-xs font-body-md text-body-md text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-secondary">support_agent</span>
                <span>Support 24/7 (Bénin &amp; Diaspora)</span>
              </div>
              <div className="flex items-center gap-space-xs font-body-md text-body-md text-on-surface">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">phone</span>
                <span>+229 01 99 00 00 / WhatsApp</span>
              </div>
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant mb-space-xs">Paiements 100% Sécurisés :</div>
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">MTN MoMo</span>
              <span className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">Moov Money</span>
              <span className="px-2.5 py-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface font-medium">Carte Bancaire</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-sm text-label-sm text-on-surface-variant border-t border-outline-variant">
          <p>© 2025 Ticket+ Bénin. Tous droits réservés. En partenariat avec Confort Lines Bénin.</p>
          <div className="flex items-center gap-space-md">
            <Link href={`/${locale}/mentions-legales`} className="hover:text-on-surface transition-colors">Mentions Légales</Link>
            <Link href={`/${locale}/conditions`} className="hover:text-on-surface transition-colors">Conditions Générales</Link>
            <Link href={`/${locale}/confidentialite`} className="hover:text-on-surface transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
