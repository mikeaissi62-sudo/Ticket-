'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  type: 'booking' | 'alert' | 'promo' | 'system';
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Réservation confirmée !', message: 'Votre billet TK-2026-4821 pour Cotonou ➔ Parakou a été confirmé. Bon voyage !', date: 'Aujourd\'hui', time: '14:30', type: 'booking', read: false },
  { id: '2', title: 'Rappel de départ', message: 'N\'oubliez pas, votre bus pour Bohicon part demain à 09h30. Présentez-vous 30min avant.', date: 'Aujourd\'hui', time: '09:00', type: 'alert', read: false },
  { id: '3', title: 'Nouveau Partenaire !', message: 'Baobab Express rejoint bientôt Ticket+. Préparez-vous à découvrir de nouvelles destinations.', date: 'Hier', time: '11:15', type: 'promo', read: true },
  { id: '4', title: 'Bienvenue sur Ticket+', message: 'Votre compte a été créé avec succès. Complétez votre profil pour une réservation plus rapide.', date: '18 Sept', time: '16:45', type: 'system', read: true },
];

const TYPE_CONFIG = {
  booking: { icon: 'confirmation_number', color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
  alert: { icon: 'error', color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' },
  promo: { icon: 'campaign', color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]' },
  system: { icon: 'info', color: 'text-[#64748B]', bg: 'bg-[#F1F5F9]' },
};

export default function NotificationsPage() {
  const locale = useLocale();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <section className="px-4 sm:px-6 pb-4 pt-4">
        <div className="max-w-[800px] mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${locale}`} className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors">Accueil</Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[13px] text-[#0F172A] font-semibold">Notifications</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-[#EF4444] text-white text-[12px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-[14px] text-[#64748B] mt-1">
                Restez informé de vos réservations et des actualités.
              </p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-[13px] font-semibold hover:bg-[#F1F5F9] transition-all shadow-sm"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="px-4 sm:px-6 pb-12 flex-1">
        <div className="max-w-[800px] mx-auto">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-[#94A3B8]">notifications_off</span>
              </div>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">Aucune notification</h3>
              <p className="text-[13px] text-[#64748B]">Vous êtes à jour ! Vous n&apos;avez aucune nouvelle notification.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => {
                const config = TYPE_CONFIG[notif.type];
                return (
                  <div 
                    key={notif.id} 
                    className={`relative bg-white rounded-2xl border transition-all overflow-hidden group ${
                      notif.read ? 'border-[#E2E8F0] shadow-sm opacity-75 hover:opacity-100' : 'border-[#10B981]/30 shadow-md ring-1 ring-[#10B981]/10'
                    }`}
                  >
                    {/* Unread indicator */}
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981]"></div>
                    )}
                    
                    <div className="p-4 sm:p-5 flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}>
                        <span className={`material-symbols-outlined text-[20px] ${config.color}`}>{config.icon}</span>
                      </div>
                      
                      <div className="flex-1 pr-8">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-[15px] font-bold ${notif.read ? 'text-[#334155]' : 'text-[#0F172A]'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[11px] font-medium text-[#94A3B8] whitespace-nowrap ml-2">
                            {notif.date} • {notif.time}
                          </span>
                        </div>
                        <p className={`text-[13px] leading-relaxed ${notif.read ? 'text-[#64748B]' : 'text-[#475569] font-medium'}`}>
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    {/* Actions overlay on hover (desktop) */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                       <button 
                        onClick={() => toggleRead(notif.id)}
                        className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] flex items-center justify-center transition-colors tooltip-trigger"
                        title={notif.read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                      >
                        <span className="material-symbols-outlined text-[16px]">{notif.read ? 'mark_email_unread' : 'mark_email_read'}</span>
                      </button>
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="w-8 h-8 rounded-full bg-[#FEF2F2] text-[#EF4444] hover:bg-[#FEE2E2] hover:text-[#DC2626] flex items-center justify-center transition-colors"
                        title="Supprimer"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
