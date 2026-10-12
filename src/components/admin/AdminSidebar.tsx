'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

const NAV_ITEMS: SidebarItem[] = [
  { name: "Vue d'ensemble", href: '/admin', icon: 'dashboard' },
  { name: 'Compagnies', href: '/admin/companies', icon: 'business' },
  { name: 'Analytics & Trafic', href: '/admin/analytics', icon: 'analytics' },
  { name: 'Revenus & Commissions', href: '/admin/revenue', icon: 'payments' },
  { name: 'Utilisateurs & Rôles', href: '/admin/users', icon: 'group' },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-500/20">
            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm tracking-tight flex items-center gap-1">
              Ticket<span className="text-emerald-400">+</span>
              <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">ADMIN</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Pilotage Plateforme
        </div>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[18px] ${active ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Accès Rapides
        </div>
        <Link
          href="/fr"
          target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">public</span>
          <span>Voir le site voyageur</span>
          <span className="material-symbols-outlined text-[14px] ml-auto text-slate-400">open_in_new</span>
        </Link>
        <Link
          href="/partner"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
          <span>Portail Compagnie</span>
        </Link>
      </nav>

      {/* User Session & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3 p-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
            {profile?.first_name ? profile.first_name[0]?.toUpperCase() : (user?.email ? user.email[0]?.toUpperCase() : 'A')}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-bold text-white truncate">
              {profile?.first_name ? `${profile.first_name} ${profile.last_name}` : (user?.email || 'Administrateur')}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium capitalize">
              {profile?.role || 'admin'}
            </span>
          </div>
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
