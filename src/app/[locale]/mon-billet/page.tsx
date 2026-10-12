'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

interface Ticket {
  id: string;
  ref: string;
  from: string;
  to: string;
  date: string;
  departure: string;
  seat: string;
  price: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  passenger: string;
  payment: string;
  companyName: string;
}

const STATUS_MAP = {
  confirmed: { label: 'Confirmé', color: 'bg-[#ECFDF5] text-[#059669] border-[#10B981]/20', icon: 'check_circle' },
  completed: { label: 'Effectué', color: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]', icon: 'done_all' },
  cancelled: { label: 'Annulé', color: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]', icon: 'cancel' },
};

// Map booking status to ticket status
function mapStatus(status: string): 'confirmed' | 'completed' | 'cancelled' {
  if (status === 'confirmed' || status === 'pending') return 'confirmed';
  if (status === 'cancelled') return 'cancelled';
  return 'completed';
}

export default function MonBilletPage() {
  const locale = useLocale();
  const [searchRef, setSearchRef] = useState('');
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.status === 401) {
        setIsLoggedIn(false);
        setTickets([]);
        return;
      }
      setIsLoggedIn(true);
      const data = await res.json();
      
      if (data.bookings && data.bookings.length > 0) {
        const mapped: Ticket[] = data.bookings.map((b: any) => ({
          id: b.id,
          ref: b.booking_reference || `TK-${b.id.slice(0, 8).toUpperCase()}`,
          from: b.trip?.route?.departure_station?.city || 'Cotonou',
          to: b.trip?.route?.arrival_station?.city || 'Parakou',
          date: b.trip?.trip_date || new Date(b.created_at).toISOString().split('T')[0],
          departure: (b.trip?.departure_time || '07:00').substring(0, 5),
          seat: b.seat?.seat_number?.toString().padStart(2, '0') || '01',
          price: b.total_price || 0,
          status: mapStatus(b.status),
          passenger: `${b.passenger_first_name || ''} ${b.passenger_last_name || ''}`.trim(),
          payment: b.payment?.method || 'Mobile Money',
          companyName: b.trip?.route?.company?.name || 'Compagnie',
        }));
        setTickets(mapped);
        return;
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
    
    // If no bookings from API or error, check if user is logged in
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    } catch {
      setIsLoggedIn(false);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings().finally(() => setIsLoading(false));
  }, [fetchBookings]);

  const filtered = tickets
    .filter(t => filter === 'all' || t.status === filter)
    .filter(t => !searchRef || t.ref.toLowerCase().includes(searchRef.toLowerCase()));

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="px-4 sm:px-6 pb-4 pt-4">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${locale}`} className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors">Accueil</Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[13px] text-[#0F172A] font-semibold">Mes Billets</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight">
            Mes Billets
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1">
            Retrouvez et téléchargez tous vos billets de voyage Ticket+.
          </p>
        </div>
      </section>

      {/* Search + Filter Bar */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="max-w-[1140px] mx-auto">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-[#94A3B8]">search</span>
              <input
                type="text"
                value={searchRef}
                onChange={e => setSearchRef(e.target.value)}
                placeholder="Rechercher par référence (ex: TK-2026-...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 outline-none transition-all"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {([['all', 'Tous'], ['confirmed', 'Confirmés'], ['completed', 'Effectués'], ['cancelled', 'Annulés']] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                    filter === key
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9] border border-[#E2E8F0]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tickets List */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-[1140px] mx-auto space-y-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-[#10B981] block mb-3 animate-spin">progress_activity</span>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">Chargement de vos billets...</h3>
              <p className="text-[13px] text-[#64748B]">Veuillez patienter un instant.</p>
            </div>
          ) : isLoggedIn === false ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-[#F59E0B] block mb-3">login</span>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">Connectez-vous pour voir vos billets</h3>
              <p className="text-[13px] text-[#64748B] mb-4">Créez un compte ou connectez-vous pour accéder à votre historique de réservations.</p>
              <Link href={`/${locale}/profil`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] transition-all">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Se connecter / S&apos;inscrire
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 text-center">
              <span className="material-symbols-outlined text-[48px] text-[#CBD5E1] block mb-3">confirmation_number</span>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">Aucun billet trouvé</h3>
              <p className="text-[13px] text-[#64748B] mb-4">Vous n&apos;avez pas encore de billet correspondant à ce filtre.</p>
              <Link href={`/${locale}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-[#1E293B] transition-all">
                <span className="material-symbols-outlined text-[18px]">search</span>
                Rechercher un trajet
              </Link>
            </div>
          ) : (
            filtered.map(ticket => {
              const st = STATUS_MAP[ticket.status];
              const dateObj = new Date(ticket.date + 'T00:00:00');
              const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
              return (
                <div key={ticket.id} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden hover:shadow-md transition-all">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px] text-[#0F172A]">directions_bus</span>
                        </div>
                        <div>
                          <div className="text-[16px] font-bold text-[#0F172A]">{ticket.from} → {ticket.to}</div>
                          <div className="text-[12px] text-[#94A3B8]">{ticket.companyName} • Réf. <strong>{ticket.ref}</strong></div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${st.color}`}>
                        <span className="material-symbols-outlined text-[14px]">{st.icon}</span>
                        {st.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-[12px]">
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Date</span>
                        <span className="text-[#0F172A] font-semibold capitalize">{formattedDate}</span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Départ</span>
                        <span className="text-[#0F172A] font-semibold">{ticket.departure}</span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Siège</span>
                        <span className="text-[#0F172A] font-semibold">N° {ticket.seat}</span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Paiement</span>
                        <span className="text-[#0F172A] font-semibold">{ticket.payment}</span>
                      </div>
                      <div className="bg-[#F8FAFC] rounded-lg p-2.5">
                        <span className="text-[#94A3B8] block">Montant</span>
                        <span className="text-[#0F172A] font-bold">{ticket.price.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    </div>

                    {ticket.status === 'confirmed' && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#E2E8F0]">
                        <button className="px-4 py-2 rounded-xl bg-[#0F172A] text-white text-[12px] font-semibold hover:bg-[#1E293B] transition-all flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">download</span>
                          Télécharger PDF
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-[#ECFDF5] text-[#059669] text-[12px] font-semibold hover:bg-[#D1FAE5] transition-all flex items-center gap-1.5 border border-[#10B981]/20">
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          Envoyer sur WhatsApp
                        </button>
                        <button className="px-4 py-2 rounded-xl bg-[#F8FAFC] text-[#64748B] text-[12px] font-semibold hover:bg-[#F1F5F9] transition-all flex items-center gap-1.5 border border-[#E2E8F0]">
                          <span className="material-symbols-outlined text-[16px]">qr_code</span>
                          Voir QR Code
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
