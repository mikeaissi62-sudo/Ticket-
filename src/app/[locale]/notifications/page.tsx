'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'departure' | 'promo' | 'system' | 'alert';
  is_read: boolean;
  created_at: string;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  booking: { icon: 'confirmation_number', color: 'text-[#10B981]', bg: 'bg-[#ECFDF5]' },
  departure: { icon: 'schedule', color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' },
  alert: { icon: 'error', color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' },
  promo: { icon: 'campaign', color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]' },
  system: { icon: 'info', color: 'text-[#64748B]', bg: 'bg-[#F1F5F9]' },
};

function formatNotificationDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Aujourd'hui • ${time}`;
    if (isYesterday) return `Hier • ${time}`;
    return `${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} • ${time}`;
  } catch {
    return dateStr;
  }
}

export default function NotificationsPage() {
  const locale = useLocale();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.status === 401) {
        setIsLoggedIn(false);
        setNotifications([]);
        return;
      }
      setIsLoggedIn(true);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true, is_read: true }),
      });
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const toggleRead = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: nextStatus } : n))
    );
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: nextStatus }),
      });
    } catch (err) {
      console.error('Failed to toggle read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <section className="px-4 sm:px-6 pb-4 pt-4">
        <div className="max-w-[800px] mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${locale}`} className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors">
              Accueil
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[13px] text-[#0F172A] font-semibold">Notifications</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EF4444] text-white text-[12px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-[14px] text-[#64748B] mt-1">
                Restez informé en temps réel de vos réservations, rappels et actualités.
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0F172A] text-[13px] font-semibold hover:bg-[#F1F5F9] transition-all shadow-sm self-start sm:self-auto"
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
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-12 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-[42px] text-[#10B981] animate-spin mb-3">
                progress_activity
              </span>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">Chargement des notifications...</h3>
              <p className="text-[13px] text-[#64748B]">Connexion sécurisée à Supabase.</p>
            </div>
          ) : isLoggedIn === false ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-10 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px] text-[#F59E0B]">lock</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#0F172A] mb-1">
                Connectez-vous pour voir vos notifications
              </h3>
              <p className="text-[14px] text-[#64748B] max-w-[420px] mb-6">
                Accédez à vos confirmations d&apos;achat, rappels 2h avant le départ de votre bus et changements d&apos;horaires.
              </p>
              <Link
                href={`/${locale}/profil`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F172A] text-white text-[14px] font-semibold hover:bg-[#1E293B] transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Se connecter / S&apos;inscrire
              </Link>
            </div>
          ) : notifications.length === 0 ? (
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
                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
                return (
                  <div
                    key={notif.id}
                    className={`relative bg-white rounded-2xl border transition-all overflow-hidden group ${
                      notif.is_read
                        ? 'border-[#E2E8F0] shadow-sm opacity-80 hover:opacity-100'
                        : 'border-[#10B981]/30 shadow-md ring-1 ring-[#10B981]/10'
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {!notif.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981]"></div>
                    )}

                    <div className="p-4 sm:p-5 flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bg}`}
                      >
                        <span className={`material-symbols-outlined text-[20px] ${config.color}`}>
                          {config.icon}
                        </span>
                      </div>

                      <div className="flex-1 pr-14">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4
                            className={`text-[15px] font-bold ${
                              notif.is_read ? 'text-[#334155]' : 'text-[#0F172A]'
                            }`}
                          >
                            {notif.title}
                          </h4>
                          <span className="text-[11px] font-medium text-[#94A3B8] whitespace-nowrap">
                            {formatNotificationDate(notif.created_at)}
                          </span>
                        </div>
                        <p
                          className={`text-[13px] leading-relaxed ${
                            notif.is_read ? 'text-[#64748B]' : 'text-[#334155] font-medium'
                          }`}
                        >
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleRead(notif.id, notif.is_read)}
                        className="w-8 h-8 rounded-full bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] flex items-center justify-center transition-colors"
                        title={notif.is_read ? 'Marquer comme non lu' : 'Marquer comme lu'}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {notif.is_read ? 'mark_email_unread' : 'mark_email_read'}
                        </span>
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
