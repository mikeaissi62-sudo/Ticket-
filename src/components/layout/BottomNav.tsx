import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Home, Ticket, Smartphone, Clock, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export const BottomNav = () => {
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  const navItems = [
    { label: t('home'), icon: Home, href: '/search' },
    { label: t('tickets'), icon: Ticket, href: '/tickets' },
    { label: t('momo'), icon: Smartphone, href: '/momo' },
    { label: t('schedules'), icon: Clock, href: '/schedules' },
    { label: t('account'), icon: User, href: '/account' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-brand-yellow' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
