'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export const Header = () => {
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#CBD5E1]/60">
        <div className="h-[72px] max-w-[1140px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold tracking-tight text-[#0F172A] leading-tight">
                Ticket<span className="text-[#10B981]">+</span>
              </span>
              <span className="text-[10px] text-[#64748B] font-medium leading-tight hidden sm:block">
                Comparateur & Billetterie
              </span>
            </div>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden xl:flex items-center gap-1">
            <Link href={`/${locale}`} className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#0F172A] bg-[#F1F5F9] transition-colors">
              Accueil
            </Link>
            <Link href={`/${locale}/compagnies`} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors flex items-center gap-2">
              Compagnies
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-semibold border border-[#10B981]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                1 actif
              </span>
            </Link>
            <Link href={`/${locale}/tarifs-et-lignes`} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
              Tarifs & Lignes
            </Link>
            <Link href={`/${locale}/contact`} className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://wa.me/2290154658907"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-[#059669] bg-[#ECFDF5] hover:bg-[#D1FAE5] transition-colors border border-[#10B981]/20"
            >
              <span className="material-symbols-outlined text-[14px]">support_agent</span>
              <span>Assistance WhatsApp</span>
            </a>

            <div className="hidden md:flex items-center px-2.5 py-1 rounded-md text-[11px] text-[#94A3B8] font-medium bg-[#F8FAFC]">
              <span className="font-semibold text-[#64748B]">XOF</span>
              <span className="mx-1 text-[#CBD5E1]">/</span>
              <span>FCFA</span>
            </div>

            <Link
              href={`/${locale}/mon-billet`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
              <span className="hidden sm:inline">Mon Billet</span>
            </Link>

            <button className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors hidden xl:flex">
              <span className="material-symbols-outlined text-[#0F172A] text-[20px]">person</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-full bg-[#F1F5F9] flex items-center justify-center hover:bg-[#E2E8F0] transition-colors xl:hidden"
            >
              <span className="material-symbols-outlined text-[#0F172A] text-[20px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-[72px] bg-white/98 backdrop-blur-lg xl:hidden">
          <nav className="flex flex-col p-4 gap-1">
            <Link href={`/${locale}`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-[15px] font-semibold text-[#0F172A] bg-[#F1F5F9]">
              Accueil
            </Link>
            <Link href={`/${locale}/compagnies`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-[15px] font-medium text-[#64748B] hover:bg-[#F8FAFC] flex items-center justify-between">
              <span>Compagnies</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                1 actif
              </span>
            </Link>
            <Link href={`/${locale}/tarifs-et-lignes`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-[15px] font-medium text-[#64748B] hover:bg-[#F8FAFC]">
              Tarifs & Lignes
            </Link>
            <Link href={`/${locale}/contact`} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-xl text-[15px] font-medium text-[#64748B] hover:bg-[#F8FAFC]">
              Contact
            </Link>
            <hr className="my-2 border-[#E2E8F0]" />
            <a href="https://wa.me/2290154658907" target="_blank" rel="noopener noreferrer" className="px-4 py-3 rounded-xl text-[15px] font-medium text-[#059669] bg-[#ECFDF5] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              Assistance WhatsApp
            </a>
          </nav>
        </div>
      )}
    </>
  );
};
