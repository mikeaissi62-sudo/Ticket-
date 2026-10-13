'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'departure' | 'promo' | 'system';
  is_read: boolean;
  created_at: string;
}

export default function NotificationsCenterPage() {
  const locale = useLocale();
  const [supabase] = useState(() => createClient());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'departure' | 'booking'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const loadNotifications = useCallback(async () => {
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
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // Supabase Realtime Subscription pour recevoir les notifications en direct
    const channel = supabase
      .channel('user-notifications-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadNotifications, supabase]);

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: true }),
      });
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true, is_read: true }),
      });
      showFeedback('Toutes les notifications ont été marquées comme lues.');
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications(prev => prev.filter(n => n.id !== id));
      await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      });
      showFeedback('Notification supprimée.');
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const triggerDepartureReminder = async () => {
    try {
      const res = await fetch('/api/notifications/reminders', { method: 'POST' });
      if (res.ok) {
        showFeedback('Vérification effectuée : Rappels de départ actualisés.');
        loadNotifications();
      }
    } catch (err) {
      console.error('Error triggering reminders:', err);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'departure') return n.type === 'departure';
    if (filter === 'booking') return n.type === 'booking';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'departure':
        return { icon: 'directions_bus', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
      case 'booking':
        return { icon: 'confirmation_number', bg: 'bg-blue-50 text-blue-600 border-blue-200' };
      case 'promo':
        return { icon: 'local_offer', bg: 'bg-amber-50 text-amber-600 border-amber-200' };
      default:
        return { icon: 'notifications', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-slate-50">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1 text-[13px] text-[#64748B]">
            <Link href={`/${locale}`} className="hover:text-[#0F172A] transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-[#0F172A] font-semibold">Centre de Notifications</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <h1 className="text-[28px] sm:text-[34px] font-extrabold text-[#0F172A] tracking-tight flex items-center gap-3">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[13px] font-bold">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </h1>
              <p className="text-[14px] text-[#64748B] mt-0.5">
                Rappels de départs, confirmations de réservation et alertes trafic en temps réel.
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={triggerDepartureReminder}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                title="Vérifier mes prochains départs"
              >
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">alarm</span>
                <span>Vérifier rappels</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                  <span>Tout marquer lu</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feedback alert */}
        {actionFeedback && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-medium flex items-center gap-2 animate-fade-in shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all ${
              filter === 'unread'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            Non lues ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('departure')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'departure'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-500">directions_bus</span>
            <span>Rappels Départs</span>
          </button>
          <button
            onClick={() => setFilter('booking')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'booking'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-blue-500">confirmation_number</span>
            <span>Billets & Réservations</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-[36px] text-[#10B981] animate-spin mb-2 block">
                progress_activity
              </span>
              <p className="text-[14px] text-[#64748B]">Chargement de vos notifications...</p>
            </div>
          ) : isLoggedIn === false ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-[#CBD5E1] mb-2 block">
                lock
              </span>
              <h3 className="text-[17px] font-bold text-[#0F172A] mb-1">Connexion requise</h3>
              <p className="text-[13px] text-[#64748B] mb-5 max-w-sm mx-auto">
                Connectez-vous pour consulter vos notifications de voyage, alertes départs et confirmations.
              </p>
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-[13px] font-bold hover:bg-[#1E293B] transition-all"
              >
                Se connecter
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-[#CBD5E1] mb-2 block">
                notifications_off
              </span>
              <h3 className="text-[17px] font-bold text-[#0F172A] mb-1">Aucune notification</h3>
              <p className="text-[13px] text-[#64748B] max-w-sm mx-auto">
                Vous n&apos;avez aucune notification dans cette catégorie pour le moment.
              </p>
            </div>
          ) : (
            filtered.map(item => {
              const { icon, bg } = getTypeIcon(item.type);
              const dateObj = new Date(item.created_at);
              const formattedTime = dateObj.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && markAsRead(item.id)}
                  className={`bg-white rounded-2xl border transition-all p-4 sm:p-5 flex items-start gap-3 sm:gap-4 relative group cursor-pointer shadow-sm hover:shadow-md ${
                    item.is_read
                      ? 'border-[#E2E8F0] opacity-90'
                      : 'border-[#10B981]/40 bg-emerald-50/20 ring-1 ring-[#10B981]/20'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${bg}`}
                  >
                    <span className="material-symbols-outlined text-[22px]">{icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-[15px] font-bold text-[#0F172A] leading-tight">
                        {item.title}
                      </h4>
                      {!item.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block shrink-0"></span>
                      )}
                      <span className="text-[11px] text-[#94A3B8] ml-auto">
                        {formattedTime}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#475569] leading-relaxed">
                      {item.message}
                    </p>

                    {/* Quick Link Actions */}
                    <div className="flex items-center gap-3 mt-3">
                      {item.type === 'departure' && (
                        <Link
                          href={`/${locale}/mon-billet`}
                          className="inline-flex items-center gap-1 text-[12px] font-bold text-[#10B981] hover:underline"
                        >
                          <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                          <span>Voir mon billet</span>
                        </Link>
                      )}
                      {item.type === 'booking' && (
                        <Link
                          href={`/${locale}/mon-billet`}
                          className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:underline"
                        >
                          <span className="material-symbols-outlined text-[15px]">confirmation_number</span>
                          <span>Voir mon billet</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => deleteNotification(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-all absolute top-4 right-3"
                    title="Supprimer la notification"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
