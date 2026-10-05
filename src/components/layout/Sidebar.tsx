'use client';
import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Home, Ticket, Smartphone, Clock, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const locale = useLocale();

  const navItems = [
    { label: t('home'), icon: Home, href: '/recherche' },
    { label: t('tickets'), icon: Ticket, href: '/tickets' },
    { label: t('momo'), icon: Smartphone, href: '/momo' },
    { label: t('schedules'), icon: Clock, href: '/schedules' },
    { label: t('account'), icon: User, href: '/account' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-brand-blue text-white z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-brand-yellow">Ticket+</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === `/${locale}${item.href}` || pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={`/${locale}${item.href}`}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-brand-lightBlue text-brand-yellow font-semibold' 
                  : 'text-gray-300 hover:bg-brand-lightBlue hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-brand-lightBlue">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-bold text-brand-blue">
            JD
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-brand-yellow">Voyageur</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
