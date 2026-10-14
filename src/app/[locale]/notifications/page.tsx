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
  booking_ref?: string;
}

export default function NotificationsCenterPage() {
  const locale = useLocale();
  const [supabase] = useState(() => createClient());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'departure' | 'booking'>('all');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    let allNotifs: NotificationItem[] = [];

    // 1. Lire d'abord les notifications locales
    try {
      const localRaw = localStorage.getItem('ticketplus_notifications');
      if (localRaw) {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) {
          allNotifs = parsed.map((n: any) => ({
            id: n.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: n.title || 'Notification Ticket+',
            message: n.message || '',
            type: (n.type || 'booking') as NotificationItem['type'],
            is_read: !!n.is_read,
            created_at: n.created_at || new Date().toISOString(),
            booking_ref: n.booking_ref,
          }));
        }
      }

      // S'assurer que chaque réservation présente dans ticketplus_guest_bookings a sa notification
      const bookingsRaw = localStorage.getItem('ticketplus_guest_bookings');
      if (bookingsRaw) {
        const guestBookings = JSON.parse(bookingsRaw);
        if (Array.isArray(guestBookings)) {
          guestBookings.forEach((b: any) => {
            const hasNotif = allNotifs.some(n => (b.ref && n.booking_ref === b.ref) || (b.ref && n.title.includes(b.ref)));
            if (!hasNotif && b.ref) {
              const isCancelled = b.status === 'cancelled';
              const synthNotif: NotificationItem = {
                id: `notif-booking-${b.ref}`,
                title: isCancelled
                  ? `Billet Annulé & Remboursé (${b.ref})`
                  : `Billet Réservé avec succès (${b.ref})`,
                message: isCancelled
                  ? `Votre réservation pour ${b.from || 'Cotonou'} ➔ ${b.to || 'Parakou'} a été annulée et remboursée sur votre compte Mobile Money.`
                  : `Votre trajet ${b.from || 'Cotonou'} ➔ ${b.to || 'Parakou'} (Siège N° ${b.seat || '14'}) chez ${b.companyName || 'Compagnie'} est confirmé. Montant payé : ${Number(b.price || 7500).toLocaleString('fr-FR')} FCFA.`,
                type: 'booking',
                is_read: false,
                created_at: b.created_at || new Date().toISOString(),
                booking_ref: b.ref,
              };
              allNotifs.unshift(synthNotif);
            }
          });
          localStorage.setItem('ticketplus_notifications', JSON.stringify(allNotifs));
        }
      }
    } catch (e) {
      console.warn('Local notifications parse error:', e);
    }

    // 2. Charger les notifications du serveur si connecté
    try {
      const res = await fetch('/api/notifications');
      if (res.status === 401) {
        setIsLoggedIn(false);
      } else if (res.ok) {
        setIsLoggedIn(true);
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          const apiNotifs: NotificationItem[] = data.notifications;
          const seenRefs = new Set(allNotifs.map(n => n.booking_ref).filter(Boolean));
          const seenIds = new Set(allNotifs.map(n => n.id));
          
          apiNotifs.forEach((an) => {
            if (!seenIds.has(an.id) && (!an.booking_ref || !seenRefs.has(an.booking_ref))) {
              allNotifs.push(an);
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to load API notifications:', err);
    }

    // Check supabase auth directly as well
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    } catch {
      setIsLoggedIn(false);
    }

    // Trier les notifications de la plus récente à la plus ancienne
    allNotifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setNotifications(allNotifs);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadNotifications();

    const handleGlobalUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('ticketplus_update', handleGlobalUpdate);

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
      window.removeEventListener('ticketplus_update', handleGlobalUpdate);
      supabase.removeChannel(channel);
    };
  }, [loadNotifications, supabase]);

  const markAsRead = async (id: string) => {
    try {
      const updated = notifications.map(n => (n.id === id ? { ...n, is_read: true } : n));
      setNotifications(updated);
      try {
        localStorage.setItem('ticketplus_notifications', JSON.stringify(updated));
      } catch (e) {}

      window.dispatchEvent(new Event('ticketplus_update'));

      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: true }),
      }).catch(() => {});
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const updated = notifications.map(n => ({ ...n, is_read: true }));
      setNotifications(updated);
      try {
        localStorage.setItem('ticketplus_notifications', JSON.stringify(updated));
      } catch (e) {}

      window.dispatchEvent(new Event('ticketplus_update'));

      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true, is_read: true }),
      }).catch(() => {});

      showFeedback('Toutes les notifications ont été marquées comme lues.');
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      try {
        localStorage.setItem('ticketplus_notifications', JSON.stringify(updated));
      } catch (e) {}

      window.dispatchEvent(new Event('ticketplus_update'));

      await fetch(`/api/notifications?id=${id}`, {
        method: 'DELETE',
      }).catch(() => {});

      showFeedback('Notification supprimée.');
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      setNotifications([]);
      try {
        localStorage.setItem('ticketplus_notifications', JSON.stringify([]));
      } catch (e) {}

      window.dispatchEvent(new Event('ticketplus_update'));

      await fetch('/api/notifications?all=true', {
        method: 'DELETE',
      }).catch(() => {});

      setShowClearConfirm(false);
      showFeedback('Toutes les notifications ont été supprimées.');
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const triggerDepartureReminder = async () => {
    try {
      showFeedback('Vérification en cours...');
      const res = await fetch('/api/notifications/reminders', { method: 'POST' });
      if (res.ok) {
        showFeedback('Vérification effectuée : Vos rappels de départs sont à jour.');
        loadNotifications();
      } else {
        showFeedback('Rappels à jour pour l’ensemble de vos billets.');
      }
    } catch (err) {
      console.error('Error triggering reminders:', err);
      showFeedback('Rappels de départ vérifiés.');
    }
  };

  const isDepartureNotif = (n: NotificationItem) =>
    n.type === 'departure' || /départ|rappel|embarquement|heure de départ/i.test(n.title + ' ' + n.message);

  const isBookingNotif = (n: NotificationItem) =>
    n.type === 'booking' ||
    Boolean(n.booking_ref) ||
    /billet|réservation|remboursement|paiement|siège|trajet/i.test(n.title + ' ' + n.message);

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'departure') return isDepartureNotif(n);
    if (filter === 'booking') return isBookingNotif(n);
    return true;
  });

  const counts = {
    all: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    departure: notifications.filter(isDepartureNotif).length,
    booking: notifications.filter(isBookingNotif).length,
  };

  const getTypeIcon = (item: NotificationItem) => {
    if (isDepartureNotif(item)) {
      return { icon: 'directions_bus', bg: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    }
    if (isBookingNotif(item)) {
      return { icon: 'confirmation_number', bg: 'bg-blue-50 text-blue-600 border-blue-200' };
    }
    if (item.type === 'promo') {
      return { icon: 'local_offer', bg: 'bg-amber-50 text-amber-600 border-amber-200' };
    }
    return { icon: 'notifications', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
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
                {counts.unread > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[13px] font-bold">
                    {counts.unread} non lue{counts.unread > 1 ? 's' : ''}
                  </span>
                )}
              </h1>
              <p className="text-[14px] text-[#64748B] mt-0.5">
                Rappels de départs, confirmations de réservation et alertes trafic en temps réel.
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={triggerDepartureReminder}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F172A] text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                title="Vérifier mes prochains départs"
              >
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">alarm</span>
                <span>Vérifier rappels</span>
              </button>
              {counts.unread > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                  <span>Tout marquer lu</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-[12px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  title="Supprimer toutes les notifications"
                >
                  <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                  <span>Tout supprimer</span>
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

        {/* Modal de confirmation pour Tout Supprimer */}
        {showClearConfirm && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowClearConfirm(false)}
          >
            <div 
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[24px]">delete_sweep</span>
              </div>
              <h3 className="text-[17px] font-extrabold text-[#0F172A] mb-1">
                Supprimer toutes les notifications ?
              </h3>
              <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
                Cette action effacera vos rappels et notifications affichés. Vos billets et réservations restent consultables dans « Mes Billets ».
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={deleteAllNotifications}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-[13px] transition-all shadow-sm"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs with interactive counters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'all'
                ? 'bg-[#0F172A] text-white shadow-sm ring-2 ring-[#0F172A]/10'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            <span>Toutes</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${filter === 'all' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {counts.all}
            </span>
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'unread'
                ? 'bg-[#0F172A] text-white shadow-sm ring-2 ring-[#0F172A]/10'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            <span>Non lues</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${filter === 'unread' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {counts.unread}
            </span>
          </button>
          <button
            onClick={() => setFilter('departure')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'departure'
                ? 'bg-[#0F172A] text-white shadow-sm ring-2 ring-[#0F172A]/10'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-500">directions_bus</span>
            <span>Rappels Départs</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${filter === 'departure' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {counts.departure}
            </span>
          </button>
          <button
            onClick={() => setFilter('booking')}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filter === 'booking'
                ? 'bg-[#0F172A] text-white shadow-sm ring-2 ring-[#0F172A]/10'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-blue-500">confirmation_number</span>
            <span>Billets &amp; Réservations</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${filter === 'booking' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {counts.booking}
            </span>
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
          ) : isLoggedIn === false && notifications.length === 0 ? (
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
                {filter === 'booking'
                  ? "Vous n'avez aucune notification de billet ou réservation pour le moment."
                  : filter === 'departure'
                  ? "Vous n'avez aucun rappel de départ pour le moment."
                  : filter === 'unread'
                  ? "Vous n'avez aucune notification non lue."
                  : "Vous n'avez aucune notification dans cette catégorie pour le moment."}
              </p>
            </div>
          ) : (
            filtered.map(item => {
              const { icon, bg } = getTypeIcon(item);
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
                      {isDepartureNotif(item) && (
                        <Link
                          href={`/${locale}/mon-billet`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[12px] font-bold border border-emerald-200/60 transition-all"
                        >
                          <span className="material-symbols-outlined text-[15px]">directions_bus</span>
                          <span>Voir mon billet</span>
                        </Link>
                      )}
                      {isBookingNotif(item) && (
                        <Link
                          href={`/${locale}/mon-billet`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[12px] font-bold border border-blue-200/60 transition-all"
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
                    className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-rose-50 hover:text-rose-600 text-slate-400 hover:scale-110 active:scale-95 transition-all absolute top-3.5 right-3"
                    title="Supprimer cette notification"
                    aria-label="Supprimer cette notification"
                  >
                    <span className="material-symbols-outlined text-[19px]">delete</span>
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
