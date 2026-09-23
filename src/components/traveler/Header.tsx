'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export const Header = () => {
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-[1140px] mx-auto px-gutter flex items-center justify-between relative">
          
          {/* Logo */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            <Link href={`/${locale}`} className="flex items-center gap-space-sm text-left group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)]">
                <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Ticket<span className="text-secondary">+</span></span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Billetterie Officielle Bénin</span>
              </div>
            </Link>
          </div>

          {/* Navigation Desktop (Absolutely Centered) */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 absolute left-1/2 -translate-x-1/2 shrink-0 whitespace-nowrap">
            <Link href={`/${locale}`} className="px-space-sm py-2 transition-all bg-surface-container text-on-surface font-semibold rounded-lg font-body-md text-body-md">
              Accueil
            </Link>
            <Link href={`/${locale}/compagnies`} className="inline-flex items-center gap-1.5 px-space-sm py-2 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
              Compagnies
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-[10px] bg-secondary-container text-on-secondary-container font-semibold">1 actif</span>
            </Link>
            <Link href={`/${locale}/tarifs-et-lignes`} className="px-space-sm py-2 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
              Tarifs &amp; Lignes
            </Link>
            <Link href={`/${locale}/contact`} className="px-space-sm py-2 rounded-lg font-body-md text-body-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all">
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            {/* WhatsApp Icon Button */}
            <a
              href="https://wa.me/2290154658907"
              target="_blank"
              rel="noopener noreferrer"
              title="Assistance WhatsApp"
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-secondary-container/60 hover:bg-secondary-container text-on-secondary-container transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </a>

            <div className="hidden md:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-2 rounded-xl whitespace-nowrap h-10">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">payments</span>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">XOF (FCFA)</span>
            </div>

            <Link
              href={`/${locale}/mon-billet`}
              className="px-space-md py-2.5 h-10 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-colors shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] whitespace-nowrap"
            >
              Mon Billet
            </Link>

            <Link
              href={`/${locale}/compte-voyageur`}
              aria-label="Espace Profil Voyageur"
              className="hidden lg:flex w-10 h-10 rounded-full bg-primary items-center justify-center hover:bg-primary-container transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors lg:hidden shrink-0"
            >
              <span className="material-symbols-outlined text-on-surface text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-20 bg-surface-container-lowest/98 backdrop-blur-lg lg:hidden">
          <nav className="flex flex-col p-4 gap-1">
            <Link href={`/${locale}`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl font-body-md text-body-md font-semibold text-on-surface bg-surface-container">
              Accueil
            </Link>
            <Link href={`/${locale}/compagnies`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl font-body-md text-body-md font-medium text-on-surface-variant hover:bg-surface-container flex items-center justify-between">
              <span>Compagnies</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                1 actif
              </span>
            </Link>
            <Link href={`/${locale}/tarifs-et-lignes`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl font-body-md text-body-md font-medium text-on-surface-variant hover:bg-surface-container">
              Tarifs &amp; Lignes
            </Link>
            <Link href={`/${locale}/contact`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl font-body-md text-body-md font-medium text-on-surface-variant hover:bg-surface-container">
              Contact
            </Link>
            <hr className="my-2 border-outline-variant" />
            <a href="https://wa.me/2290154658907" target="_blank" rel="noopener noreferrer" className="px-4 py-3 rounded-xl font-body-md text-body-md font-medium text-on-secondary-container bg-secondary-container/60 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Assistance WhatsApp
            </a>
          </nav>
        </div>
      )}
    </>
  );
};
