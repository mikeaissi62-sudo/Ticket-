'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  idType: string;
  notifSms: boolean;
  notifWhatsapp: boolean;
  notifEmail: boolean;
  createdAt?: string;
}

interface StatsData {
  totalTrips: number;
  totalSpent: number;
  unreadNotifs: number;
}

export default function ProfilPage() {
  const locale = useLocale();
  const [supabase] = useState(() => createClient());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Auth form state
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authPhone, setAuthPhone] = useState('');

  // User state
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: 'Cotonou',
    idType: 'cni',
    notifSms: true,
    notifWhatsapp: true,
    notifEmail: false,
  });

  const [stats, setStats] = useState<StatsData>({
    totalTrips: 0,
    totalSpent: 0,
    unreadNotifs: 0,
  });

  // Fetch current user and profile
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser({ id: currentUser.id, email: currentUser.email });

      // Fetch profile via API
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        const p = data.profile || {};
        const prefs = p.preferences || {};

        setProfile({
          firstName: p.first_name || currentUser.user_metadata?.first_name || '',
          lastName: p.last_name || currentUser.user_metadata?.last_name || '',
          phone: p.phone || currentUser.user_metadata?.phone || '',
          email: p.email || currentUser.email || '',
          city: prefs.city || 'Cotonou',
          idType: prefs.idType || 'cni',
          notifSms: prefs.notifSms ?? true,
          notifWhatsapp: prefs.notifWhatsapp ?? true,
          notifEmail: prefs.notifEmail ?? false,
          createdAt: p.created_at || currentUser.created_at,
        });

        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadProfile();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile();
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile, supabase]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError(error.message === 'Invalid login credentials' 
          ? 'Email ou mot de passe incorrect.' 
          : error.message);
        return;
      }

      if (data.user) {
        await loadProfile();
      }
    } catch {
      setAuthError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    if (!authFirstName || !authLastName || !authPhone) {
      setAuthError('Veuillez remplir votre nom, prénom et numéro de téléphone.');
      setIsAuthLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            first_name: authFirstName,
            last_name: authLastName,
            phone: authPhone,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data.user) {
        // Also save profile into users table
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: authFirstName,
            lastName: authLastName,
            phone: authPhone,
            email: authEmail,
            city: 'Cotonou',
            idType: 'cni',
            notifSms: true,
            notifWhatsapp: true,
            notifEmail: false,
          }),
        });

        await loadProfile();
      }
    } catch {
      setAuthError("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Quick Demo Login for testing
  const handleDemoLogin = async () => {
    setAuthError(null);
    setIsAuthLoading(true);
    const demoEmail = 'voyageur.demo@ticketplus.bj';
    const demoPass = 'TicketPlus2026!';

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPass,
      });

      if (signInError) {
        // Create demo user if does not exist
        const { error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPass,
          options: {
            data: {
              first_name: 'Koffi',
              last_name: 'Dossou',
              phone: '01 64 28 90',
            },
          },
        });

        if (signUpError) {
          setAuthError(signUpError.message);
          return;
        }

        // Try sign in again
        await supabase.auth.signInWithPassword({
          email: demoEmail,
          password: demoPass,
        });
      }

      await loadProfile();
    } catch {
      setAuthError('Erreur de connexion démo.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setIsLoading(false);
  };

  // Save profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert('Erreur lors de la sauvegarde du profil.');
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <section className="px-4 sm:px-6 pb-4 pt-4">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${locale}`} className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors">
              Accueil
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[13px] text-[#0F172A] font-semibold">Profil</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight">
            Mon Espace Voyageur
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1">
            Gérez vos informations personnelles, vos billets et vos préférences d&apos;alertes SMS &amp; WhatsApp.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 pb-12 flex-1">
        <div className="max-w-[1140px] mx-auto">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-12 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-[42px] text-[#10B981] animate-spin mb-3">
                progress_activity
              </span>
              <h3 className="text-[16px] font-bold text-[#0F172A] mb-1">Chargement de votre profil...</h3>
              <p className="text-[13px] text-[#64748B]">Connexion sécurisée à Supabase.</p>
            </div>
          ) : !user ? (
            /* --- NOT LOGGED IN: AUTH VIEW --- */
            <div className="max-w-[480px] mx-auto">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 sm:p-8">
                {/* Tabs */}
                <div className="flex bg-[#F1F5F9] p-1 rounded-xl mb-6">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${
                      authMode === 'login' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Se connecter
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(null); }}
                    className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${
                      authMode === 'register' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                    }`}
                  >
                    Créer un compte
                  </button>
                </div>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[13px] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    <span>{authError}</span>
                  </div>
                )}

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-bold text-[#334155] mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        placeholder="exemple@email.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] text-[#0F172A] focus:border-[#10B981] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-[#334155] mb-1">Mot de passe</label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] text-[#0F172A] focus:border-[#10B981] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-3 rounded-xl bg-[#0F172A] text-white text-[14px] font-bold hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isAuthLoading ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">login</span>
                      )}
                      Connexion
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[12px] font-bold text-[#334155] mb-1">Prénom</label>
                        <input
                          type="text"
                          required
                          value={authFirstName}
                          onChange={e => setAuthFirstName(e.target.value)}
                          placeholder="Koffi"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-bold text-[#334155] mb-1">Nom</label>
                        <input
                          type="text"
                          required
                          value={authLastName}
                          onChange={e => setAuthLastName(e.target.value)}
                          placeholder="Dossou"
                          className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#334155] mb-1">Téléphone Mobile</label>
                      <div className="flex">
                        <span className="px-3 py-2 rounded-l-xl bg-[#E2E8F0] border border-r-0 border-[#CBD5E1] text-[12px] font-bold text-[#334155]">
                          🇧🇯 +229
                        </span>
                        <input
                          type="tel"
                          required
                          value={authPhone}
                          onChange={e => setAuthPhone(e.target.value)}
                          placeholder="01 64 28 90"
                          className="w-full px-3 py-2 rounded-r-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#334155] mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        placeholder="koffi.dossou@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#334155] mb-1">Mot de passe</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        placeholder="Au moins 6 caractères"
                        className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-3 rounded-xl bg-[#10B981] text-white text-[14px] font-bold hover:bg-[#059669] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                    >
                      {isAuthLoading ? (
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                      )}
                      Créer mon compte Ticket+
                    </button>
                  </form>
                )}

                {/* Demo account quick login */}
                <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center">
                  <p className="text-[12px] text-[#64748B] mb-2">Vous souhaitez juste tester l&apos;application ?</p>
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isAuthLoading}
                    className="w-full py-2.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] text-[12px] font-bold hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#10B981]">bolt</span>
                    Connexion rapide Démo (Voyageur Bénin)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* --- LOGGED IN: FULL PROFILE VIEW --- */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: User Card & Stats */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                  <div className="bg-[#0F172A] p-6 flex flex-col items-center text-center text-white relative">
                    <button
                      onClick={handleLogout}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                      title="Se déconnecter"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                    </button>
                    <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-3 border-2 border-white/20 text-white">
                      <span className="material-symbols-outlined text-[36px]">person</span>
                    </div>
                    <h2 className="text-[18px] font-bold">
                      {profile.firstName || 'Voyageur'} {profile.lastName}
                    </h2>
                    <p className="text-[12px] text-white/70 mt-0.5">
                      Membre Ticket+ depuis {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '2026'}
                    </p>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-[13px]">
                      <span className="material-symbols-outlined text-[18px] text-[#10B981]">phone</span>
                      <span className="text-[#0F172A] font-medium">+229 {profile.phone || 'Non renseigné'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[13px]">
                      <span className="material-symbols-outlined text-[18px] text-[#64748B]">mail</span>
                      <span className="text-[#0F172A] font-medium">{profile.email || user.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[13px]">
                      <span className="material-symbols-outlined text-[18px] text-[#64748B]">location_city</span>
                      <span className="text-[#0F172A] font-medium">{profile.city}, Bénin</span>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0]">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <Link
                          href={`/${locale}/mon-billet`}
                          className="bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-xl p-3 transition-colors border border-[#E2E8F0] block"
                        >
                          <div className="text-[20px] font-black text-[#0F172A]">{stats.totalTrips}</div>
                          <div className="text-[11px] font-semibold text-[#64748B] flex items-center justify-center gap-1 mt-0.5">
                            <span>Voyages</span>
                            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                          </div>
                        </Link>
                        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
                          <div className="text-[17px] font-black text-[#10B981]">
                            {stats.totalSpent.toLocaleString('fr-FR')} F
                          </div>
                          <div className="text-[11px] font-semibold text-[#64748B] mt-0.5">FCFA dépensés</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-2">
                  <Link
                    href={`/${locale}/mon-billet`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors border border-[#E2E8F0]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-[#10B981]">confirmation_number</span>
                      <span className="text-[13px] font-bold text-[#0F172A]">Mes Billets &amp; Réservations</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] text-[11px] font-bold">
                      {stats.totalTrips}
                    </span>
                  </Link>
                  <Link
                    href={`/${locale}/notifications`}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors border border-[#E2E8F0]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[20px] text-[#F59E0B]">notifications</span>
                      <span className="text-[13px] font-bold text-[#0F172A]">Notifications &amp; Alertes</span>
                    </div>
                    {stats.unreadNotifs > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#EF4444] text-white text-[11px] font-bold">
                        {stats.unreadNotifs}
                      </span>
                    )}
                  </Link>
                </div>
              </div>

              {/* Right Column: Edit Forms */}
              <div className="lg:col-span-2 space-y-5">
                {savedSuccess && (
                  <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[13px] font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#10B981]">check_circle</span>
                    Vos modifications ont été synchronisées avec succès sur Supabase.
                  </div>
                )}

                {/* Personal Information Form */}
                <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
                  <h3 className="text-[16px] font-bold text-[#0F172A] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#10B981]">badge</span>
                    Informations personnelles
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1">Prénom</label>
                      <input
                        value={profile.firstName}
                        onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1">Nom</label>
                      <input
                        value={profile.lastName}
                        onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1">Téléphone Mobile</label>
                      <div className="flex">
                        <span className="px-3 py-2.5 rounded-l-xl bg-[#E2E8F0] border border-r-0 border-[#CBD5E1] text-[12px] font-bold text-[#334155]">
                          🇧🇯 +229
                        </span>
                        <input
                          value={profile.phone}
                          onChange={e => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-r-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1">Email</label>
                      <input
                        value={profile.email}
                        onChange={e => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1">Ville de résidence</label>
                      <select
                        value={profile.city}
                        onChange={e => setProfile({ ...profile, city: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                      >
                        {['Cotonou', 'Parakou', 'Bohicon', 'Natitingou', 'Porto-Novo', 'Djougou', 'Abomey'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[12px] font-semibold text-[#334155] block mb-1">Pièce d&apos;identité</label>
                      <select
                        value={profile.idType}
                        onChange={e => setProfile({ ...profile, idType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                      >
                        <option value="cni">CNI (Carte Nationale d&apos;Identité)</option>
                        <option value="cip">CIP (Certificat d&apos;Identification Personnelle)</option>
                        <option value="passport">Passeport</option>
                      </select>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="pt-4 border-t border-[#E2E8F0] mb-5">
                    <h4 className="text-[14px] font-bold text-[#0F172A] mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#F59E0B]">notifications</span>
                      Préférences d&apos;alertes &amp; notifications
                    </h4>
                    <div className="space-y-2.5">
                      {[
                        { key: 'notifSms', label: 'Notifications SMS', desc: 'Confirmations de réservation et rappels 2h avant le bus', icon: 'sms' },
                        { key: 'notifWhatsapp', label: 'Notifications WhatsApp', desc: 'Réception de votre e-billet avec QR Code directement sur WhatsApp', icon: 'chat' },
                        { key: 'notifEmail', label: 'Notifications Email', desc: 'Factures, reçus de paiement et actualités', icon: 'mail' },
                      ].map(item => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[18px] text-[#64748B]">{item.icon}</span>
                            <div>
                              <div className="text-[13px] font-bold text-[#0F172A]">{item.label}</div>
                              <div className="text-[11px] text-[#64748B]">{item.desc}</div>
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            checked={profile[item.key as keyof ProfileData] as boolean}
                            onChange={e => setProfile({ ...profile, [item.key]: e.target.checked })}
                            className="w-5 h-5 rounded text-[#10B981] accent-[#10B981] cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-[#0F172A] text-white text-[13px] font-bold hover:bg-[#1E293B] transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
                    >
                      {isSaving ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">save</span>
                      )}
                      Enregistrer les modifications
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-[12px] text-[#DC2626] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">logout</span>
                      Déconnexion
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
