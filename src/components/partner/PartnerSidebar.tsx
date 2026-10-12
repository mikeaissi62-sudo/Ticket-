'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

const NAV_SECTIONS = [
  {
    label: 'Gestion',
    items: [
      { name: "Tableau de bord", href: '/partner', icon: 'space_dashboard' },
      { name: 'Flotte & Bus', href: '/partner/fleet', icon: 'directions_bus' },
      { name: 'Trajets & Horaires', href: '/partner/schedules', icon: 'schedule' },
      { name: 'Réservations', href: '/partner/bookings', icon: 'confirmation_number', badge: 'Live' },
    ] as SidebarItem[],
  },
  {
    label: 'Finance',
    items: [
      { name: 'Revenus & Stats', href: '/partner/revenue', icon: 'trending_up' },
    ] as SidebarItem[],
  },
];

export const PartnerSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) => {
    if (path === '/partner') {
      return pathname === '/partner' || pathname === '/partner/';
    }
    return pathname.startsWith(path);
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-[68px]' : 'w-64'
      } bg-[#0B1929] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/60 h-screen sticky top-0 transition-all duration-300`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/60">
        <Link href="/partner" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-sm shadow-teal-500/20 shrink-0">
            <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-white font-bold text-sm tracking-tight flex items-center gap-1">
                Ticket<span className="text-teal-400">+</span>
                <span className="text-[10px] bg-teal-500/15 text-teal-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider border border-teal-500/20">
                  PARTNER
                </span>
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title={collapsed ? 'Déplier' : 'Réduire'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Company Info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
              <span className="material-symbols-outlined text-teal-400 text-[20px]">domain</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">
                {profile?.first_name || 'Ma Compagnie'}
              </span>
              <span className="text-[10px] text-slate-400">Partenaire vérifié</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-3">
            {!collapsed && (
              <div className="px-3 pb-2 pt-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-0.5 ${
                    active
                      ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20 shadow-sm shadow-teal-500/5'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        active ? 'text-teal-400' : 'text-slate-500'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        item.badge === 'Live'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Quick Links */}
        {!collapsed && (
          <>
            <div className="pt-4 px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Accès Rapides
            </div>
            <Link
              href="/fr"
              target="_blank"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">public</span>
              <span>Site voyageur</span>
              <span className="material-symbols-outlined text-[14px] ml-auto text-slate-500">
                open_in_new
              </span>
            </Link>
          </>
        )}
      </nav>

      {/* User Session & Logout */}
      <div className="p-2.5 border-t border-slate-800/60 bg-[#091320]">
        <div className="flex items-center gap-2.5 p-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs shrink-0">
            {profile?.first_name
              ? profile.first_name[0]?.toUpperCase()
              : user?.email
              ? user.email[0]?.toUpperCase()
              : 'P'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                {profile?.first_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : user?.email || 'Partenaire'}
              </span>
              <span className="text-[10px] text-teal-400 font-medium capitalize">
                {profile?.role || 'partner'}
              </span>
            </div>
          )}
          <button
            onClick={() => signOut()}
            title="Se déconnecter"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
