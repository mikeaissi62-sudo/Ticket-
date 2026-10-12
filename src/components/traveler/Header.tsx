'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-[1140px] mx-auto px-gutter flex items-center justify-between relative">
          
          {/* Logo */}
          <div className="flex items-center gap-2 z-10 shrink-0">
            <Link 
              href={`/${locale}`} 
              prefetch={true}
              className="flex items-center gap-space-sm text-left group shrink-0 active:scale-95 transition-transform duration-75"
            >
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
            <Link 
              href={`/${locale}`} 
              prefetch={true}
              className={`px-space-sm py-2 transition-all rounded-lg font-body-md text-body-md active:scale-95 duration-75 ${
                isActive(`/${locale}`) 
                  ? 'bg-primary-container/30 text-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Accueil
            </Link>
            <Link 
              href={`/${locale}/compagnies`} 
              prefetch={true}
              className={`inline-flex items-center gap-1.5 px-space-sm py-2 rounded-lg font-body-md text-body-md transition-all active:scale-95 duration-75 ${
                isActive(`/${locale}/compagnies`)
                  ? 'bg-primary-container/30 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Compagnies
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-[10px] bg-secondary-container text-on-secondary-container font-semibold">4 actifs</span>
            </Link>
            <Link 
              href={`/${locale}/tarifs-et-lignes`} 
              prefetch={true}
              className={`px-space-sm py-2 rounded-lg font-body-md text-body-md transition-all active:scale-95 duration-75 ${
                isActive(`/${locale}/tarifs-et-lignes`)
                  ? 'bg-primary-container/30 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Tarifs &amp; Lignes
            </Link>
            <Link 
              href={`/${locale}/contact`} 
              prefetch={true}
              className={`px-space-sm py-2 rounded-lg font-body-md text-body-md transition-all active:scale-95 duration-75 ${
                isActive(`/${locale}/contact`)
                  ? 'bg-primary-container/30 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
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
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-secondary-container/60 hover:bg-secondary-container text-on-secondary-container transition-all active:scale-90 duration-75 shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </a>

            <div className="hidden md:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-2 rounded-xl whitespace-nowrap h-10">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">payments</span>
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">XOF (FCFA)</span>
            </div>

            <Link
              href={`/${locale}/mon-billet`}
              prefetch={true}
              className="px-space-md py-2.5 h-10 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all active:scale-95 duration-75 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] whitespace-nowrap"
            >
              Mon Billet
            </Link>

            <Link
              href={`/${locale}/profil`}
              prefetch={true}
              aria-label="Espace Profil Voyageur"
              className="hidden lg:flex w-10 h-10 rounded-full bg-primary items-center justify-center hover:bg-primary-container transition-all active:scale-90 duration-75 shrink-0"
            >
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              className="lg:hidden p-2 rounded-xl text-on-surface hover:bg-surface-container active:scale-90 transition-transform duration-75"
            >
              <span className="material-symbols-outlined text-[24px]">
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
            <Link 
              href={`/${locale}`} 
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)} 
              className={`px-4 py-3 rounded-xl font-body-md text-body-md active:scale-98 transition-all duration-75 ${
                isActive(`/${locale}`) 
                  ? 'bg-primary-container/30 text-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container font-medium'
              }`}
            >
              Accueil
            </Link>
            <Link 
              href={`/${locale}/compagnies`} 
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)} 
              className={`px-4 py-3 rounded-xl font-body-md text-body-md flex items-center justify-between active:scale-98 transition-all duration-75 ${
                isActive(`/${locale}/compagnies`)
                  ? 'bg-primary-container/30 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container font-medium'
              }`}
            >
              <span>Compagnies</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                4 actifs
              </span>
            </Link>
            <Link 
              href={`/${locale}/tarifs-et-lignes`} 
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)} 
              className={`px-4 py-3 rounded-xl font-body-md text-body-md active:scale-98 transition-all duration-75 ${
                isActive(`/${locale}/tarifs-et-lignes`)
                  ? 'bg-primary-container/30 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container font-medium'
              }`}
            >
              Tarifs &amp; Lignes
            </Link>
            <Link 
              href={`/${locale}/contact`} 
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)} 
              className={`px-4 py-3 rounded-xl font-body-md text-body-md active:scale-98 transition-all duration-75 ${
                isActive(`/${locale}/contact`)
                  ? 'bg-primary-container/30 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container font-medium'
              }`}
            >
              Contact
            </Link>
            <Link 
              href={`/${locale}/profil`} 
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)} 
              className={`px-4 py-3 rounded-xl font-body-md text-body-md flex items-center gap-2 active:scale-98 transition-all duration-75 ${
                isActive(`/${locale}/profil`)
                  ? 'bg-primary-container/30 text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container font-medium'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Mon Profil
            </Link>
            <hr className="my-2 border-outline-variant" />
            <a 
              href="https://wa.me/2290154658907" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-3 rounded-xl font-body-md text-body-md font-medium text-on-secondary-container bg-secondary-container/60 flex items-center gap-2 active:scale-98 transition-all duration-75"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Assistance WhatsApp
            </a>
          </nav>
        </div>
      )}
    </>
  );
};
