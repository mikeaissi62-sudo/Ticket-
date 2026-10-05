'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Bus, Ticket, QrCode, Clock, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const BottomNav = () => {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const locale = useLocale();

  const navItems = [
    { label: 'Accueil', icon: Bus, href: '/' },
    { label: 'Billets', icon: Ticket, href: '/mon-billet' },
    { isFab: true }, // Placeholder for the FAB
    { label: 'Tarifs', icon: Clock, href: '/tarifs-et-lignes' },
    { label: 'Profil', icon: User, href: '/profil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe md:hidden z-50">
      <div className="flex justify-between items-center h-16 px-2 relative">
        {navItems.map((item, idx) => {
          if (item.isFab) {
            return (
              <div key="fab" className="flex-1 flex justify-center items-center">
                {/* FAB is absolutely positioned below */}
              </div>
            );
          }

          const href = item.href === '/' ? `/${locale}` : `/${locale}${item.href}`;
          const isActive = item.href === '/' 
            ? (pathname === `/${locale}` || pathname === `/${locale}/`)
            : pathname.startsWith(href);
            
          const Icon = item.icon!;
          
          return (
            <Link 
              key={item.href} 
              href={href}
              className={`flex-1 flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Floating Action Button (MoMo) */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
        <Link href={`/${locale}/momo`} className="flex flex-col items-center">
          <div className="w-14 h-14 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <QrCode className="w-6 h-6 text-brand-darkBlue" />
          </div>
          <span className="text-[10px] font-bold text-brand-darkBlue mt-1">MoMo</span>
        </Link>
      </div>
    </div>
  );
};
