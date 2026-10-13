'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export const Header = () => {
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  // Ne pas afficher le Header sur la page login ou register
  if (pathname.includes('/login') || pathname.includes('/register')) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="h-20 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: Logo */}
          <div className="flex items-center shrink-0">
            <Link 
              href={`/${locale}`} 
              prefetch={true}
              className="flex items-center gap-2.5 group shrink-0 active:scale-95 transition-transform duration-75"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">confirmation_number</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-headline-sm text-[20px] sm:text-[22px] text-on-surface font-extrabold tracking-tight">
                  Ticket<span className="text-[#10B981]">+</span>
                </span>
                <span className="text-[11px] text-on-surface-variant font-medium hidden sm:inline tracking-normal">
                  Billetterie Bénin
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation (Flex, never overlapping) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
            <Link 
              href={`/${locale}`} 
              prefetch={true}
              className={`px-3 py-2 transition-all rounded-xl text-[13px] xl:text-[14px] font-semibold active:scale-95 duration-75 ${
                isActive(`/${locale}`) 
                  ? 'bg-primary/10 text-primary font-bold' 
                  : 'text-[#475569] hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Accueil
            </Link>
            <Link 
              href={`/${locale}/compagnies`} 
              prefetch={true}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] xl:text-[14px] font-semibold transition-all active:scale-95 duration-75 ${
                isActive(`/${locale}/compagnies`)
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-[#475569] hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span>Compagnies</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-secondary-container text-on-secondary-container font-bold">
                4
              </span>
            </Link>
            <Link 
              href={`/${locale}/tarifs-et-lignes`} 
              prefetch={true}
              className={`px-3 py-2 rounded-xl text-[13px] xl:text-[14px] font-semibold transition-all active:scale-95 duration-75 ${
                isActive(`/${locale}/tarifs-et-lignes`)
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-[#475569] hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Tarifs &amp; Lignes
            </Link>
            <Link 
              href={`/${locale}/contact`} 
              prefetch={true}
              className={`px-3 py-2 rounded-xl text-[13px] xl:text-[14px] font-semibold transition-all active:scale-95 duration-75 ${
                isActive(`/${locale}/contact`)
                  ? 'bg-primary/10 text-primary font-bold'
                  : 'text-[#475569] hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right: Actions & User Buttons (Harmonious height & spacing) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Currency badge (wide screens only) */}
            <div className="hidden 2xl:flex items-center gap-1.5 bg-surface-container px-3 h-10 rounded-xl whitespace-nowrap text-[12px] font-semibold text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">payments</span>
              <span>XOF (FCFA)</span>
            </div>

            {/* WhatsApp Assistance Button (xl screens) */}
            <a
              href="https://wa.me/2290154658907"
              target="_blank"
              rel="noopener noreferrer"
              title="Assistance WhatsApp"
              className="hidden xl:flex items-center justify-center w-10 h-10 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] transition-all active:scale-90 duration-75 shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </a>

            {/* Mon Billet Primary Button */}
            <Link
              href={`/${locale}/mon-billet`}
              prefetch={true}
              className="h-10 px-3.5 sm:px-4 flex items-center justify-center rounded-xl bg-primary hover:bg-primary-container text-on-primary text-[13px] font-bold transition-all active:scale-95 duration-75 shadow-sm whitespace-nowrap gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
              <span>Mon Billet</span>
            </Link>

            {/* Notifications Button */}
            <Link
              href={`/${locale}/notifications`}
              prefetch={true}
              aria-label="Notifications"
              title="Notifications"
              className={`hidden sm:flex w-10 h-10 items-center justify-center rounded-xl transition-all active:scale-90 duration-75 shrink-0 ${
                isActive(`/${locale}/notifications`)
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </Link>

            {/* User Buttons: Logged In vs Visitor (Upwork Style) */}
            {user ? (
              <>
                <Link
                  href={`/${locale}/profil`}
                  prefetch={true}
                  aria-label="Mon Profil"
                  title="Mon Profil"
                  className={`hidden sm:flex h-10 px-3.5 items-center justify-center gap-1.5 rounded-xl transition-all active:scale-95 duration-75 shrink-0 ${
                    isActive(`/${locale}/profil`)
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/40 font-bold text-[12px]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  <span>Profil</span>
                </Link>

                <button
                  onClick={() => signOut()}
                  title="Se déconnecter"
                  aria-label="Se déconnecter"
                  className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl bg-surface-container hover:bg-rose-50 hover:text-rose-600 text-on-surface-variant border border-outline-variant/40 transition-all active:scale-90 duration-75 shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href={`/${locale}/login`}
                  prefetch={true}
                  className="h-10 px-3.5 flex items-center justify-center rounded-xl text-[13px] font-bold text-[#0F172A] hover:bg-surface-container transition-all active:scale-95"
                >
                  Se connecter
                </Link>
                <Link
                  href={`/${locale}/login`}
                  prefetch={true}
                  className="h-10 px-4 flex items-center justify-center rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold transition-all shadow-sm active:scale-95"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-on-surface bg-surface-container hover:bg-surface-container-high active:scale-90 transition-transform duration-75"
            >
              <span className="material-symbols-outlined text-[22px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-20 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-surface-container-lowest border-b border-outline-variant/40 p-5 shadow-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <nav className="flex flex-col gap-1.5">
              <Link 
                href={`/${locale}`} 
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)} 
                className={`px-4 py-3 rounded-xl text-[14px] font-semibold active:scale-98 transition-all duration-75 flex items-center gap-3 ${
                  isActive(`/${locale}`) 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-[#475569] hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                Accueil
              </Link>
              <Link 
                href={`/${locale}/compagnies`} 
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)} 
                className={`px-4 py-3 rounded-xl text-[14px] font-semibold flex items-center justify-between active:scale-98 transition-all duration-75 ${
                  isActive(`/${locale}/compagnies`)
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-[#475569] hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                  <span>Compagnies</span>
                </div>
                <span className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  4 actifs
                </span>
              </Link>
              <Link 
                href={`/${locale}/tarifs-et-lignes`} 
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)} 
                className={`px-4 py-3 rounded-xl text-[14px] font-semibold active:scale-98 transition-all duration-75 flex items-center gap-3 ${
                  isActive(`/${locale}/tarifs-et-lignes`)
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-[#475569] hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">alt_route</span>
                Tarifs &amp; Lignes
              </Link>
              <Link 
                href={`/${locale}/contact`} 
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)} 
                className={`px-4 py-3 rounded-xl text-[14px] font-semibold active:scale-98 transition-all duration-75 flex items-center gap-3 ${
                  isActive(`/${locale}/contact`)
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-[#475569] hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">mail</span>
                Contact
              </Link>
              <hr className="my-2 border-outline-variant/40" />
              <Link 
                href={`/${locale}/mon-billet`} 
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)} 
                className={`px-4 py-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 active:scale-98 transition-all duration-75 ${
                  isActive(`/${locale}/mon-billet`)
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-[#475569] hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                Mon Billet
              </Link>
              <Link 
                href={`/${locale}/notifications`} 
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)} 
                className={`px-4 py-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 active:scale-98 transition-all duration-75 ${
                  isActive(`/${locale}/notifications`)
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-[#475569] hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                Notifications
              </Link>
              <Link 
                href={`/${locale}/profil`} 
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)} 
                className={`px-4 py-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 active:scale-98 transition-all duration-75 ${
                  isActive(`/${locale}/profil`) || isActive(`/${locale}/login`)
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-[#475569] hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                {user ? 'Mon Profil' : 'Mon Profil'}
              </Link>
              {user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="px-4 py-3 rounded-xl text-[14px] font-semibold flex items-center gap-3 text-rose-600 hover:bg-rose-50 active:scale-98 transition-all duration-75 text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Se déconnecter
                </button>
              )}
              <hr className="my-2 border-outline-variant/40" />
              <a 
                href="https://wa.me/2290154658907" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-3 rounded-xl text-[14px] font-semibold text-[#128C7E] bg-[#25D366]/15 hover:bg-[#25D366]/25 flex items-center gap-3 active:scale-98 transition-all duration-75"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                Assistance WhatsApp
              </a>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};
