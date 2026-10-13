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

type AuthMethod = 'phone' | 'email' | 'google';
type PhoneStep = 'input' | 'verify';

export default function ProfilPage() {
  const locale = useLocale();
  const [supabase] = useState(() => createClient());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Phone OTP state
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Email auth form state
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

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

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

  // ===== PHONE OTP HANDLERS =====
  const handleSendOtp = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthLoading(true);
    setDemoOtp(null);

    try {
      const res = await fetch('/api/auth/phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Erreur lors de l'envoi du code.");
        setIsAuthLoading(false);
        return;
      }

      setPhoneStep('verify');
      setOtpCountdown(120); // 2 minutes

      if (data.demo_mode && data.demo_otp) {
        setDemoOtp(data.demo_otp);
        setAuthSuccess(`Code envoyé ! Mode démo : votre code est ${data.demo_otp}`);
      } else {
        setAuthSuccess('Un code de vérification a été envoyé par SMS.');
      }
    } catch {
      setAuthError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthLoading(true);

    try {
      const res = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp: otpCode }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || 'Code incorrect.');
        setIsAuthLoading(false);
        return;
      }

      if (data.native && data.session) {
        // Native Supabase OTP — session already set
        await loadProfile();
      } else if (data.email && data.password) {
        // Demo mode — sign in with temp credentials
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          setAuthError(signInError.message);
          setIsAuthLoading(false);
          return;
        }

        await loadProfile();
      }

      // Reset phone state
      setPhoneStep('input');
      setOtpCode('');
      setDemoOtp(null);
      setOtpCountdown(0);
    } catch {
      setAuthError('Erreur lors de la vérification. Veuillez réessayer.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // ===== EMAIL AUTH HANDLERS =====
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          firstName: authFirstName,
          lastName: authLastName,
          phone: authPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Erreur lors de l'inscription.");
        setIsAuthLoading(false);
        return;
      }

      // Automatically sign in the newly registered pre-confirmed user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (signInError) {
        setAuthError(signInError.message);
        setIsAuthLoading(false);
        return;
      }

      await loadProfile();
    } catch {
      setAuthError("Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  // ===== GOOGLE OAUTH HANDLER =====
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}/profil`,
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsAuthLoading(false);
      }
      // Si pas d'erreur, le navigateur redirige vers Google
    } catch {
      setAuthError('Erreur de connexion Google.');
      setIsAuthLoading(false);
    }
  };

  // Quick Demo Login
  const handleDemoLogin = async () => {
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || data.error) {
        setAuthError(data.error || 'Erreur lors de la configuration du compte démo.');
        setIsAuthLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setAuthError(signInError.message);
        setIsAuthLoading(false);
        return;
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
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setIsLoading(false);
    if (typeof window !== 'undefined') {
      window.location.href = `/${locale}/login`;
    }
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

  // Auth method config
  const authMethods: { key: AuthMethod; icon: string; label: string; recommended?: boolean }[] = [
    { key: 'phone', icon: 'smartphone', label: 'Téléphone', recommended: true },
    { key: 'email', icon: 'mail', label: 'Email' },
    { key: 'google', icon: 'g_mobiledata', label: 'Google' },
  ];

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
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden">
                
                {/* Auth Method Selector */}
                <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-5 text-center">
                  <h2 className="text-white text-[18px] font-bold mb-1">
                    Connexion à Ticket+
                  </h2>
                  <p className="text-white/60 text-[12px]">
                    Choisissez votre méthode de connexion préférée
                  </p>
                  
                  <div className="flex gap-2 mt-4 bg-white/10 p-1 rounded-xl">
                    {authMethods.map(m => (
                      <button
                        key={m.key}
                        onClick={() => { setAuthMethod(m.key); setAuthError(null); setAuthSuccess(null); }}
                        className={`flex-1 py-2.5 px-2 rounded-lg text-[12px] font-bold transition-all flex flex-col items-center gap-1 relative ${
                          authMethod === m.key
                            ? 'bg-white text-[#0F172A] shadow-md'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {m.key === 'google' ? (
                          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                            <path fill={authMethod === 'google' ? '#4285F4' : 'currentColor'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill={authMethod === 'google' ? '#34A853' : 'currentColor'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill={authMethod === 'google' ? '#FBBC05' : 'currentColor'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill={authMethod === 'google' ? '#EA4335' : 'currentColor'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">{m.icon}</span>
                        )}
                        <span>{m.label}</span>
                        {m.recommended && (
                          <span className="absolute -top-1 -right-1 bg-[#10B981] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                            🇧🇯
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  {/* Error / Success messages */}
                  {authError && (
                    <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[13px] flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
                      <span>{authError}</span>
                    </div>
                  )}
                  {authSuccess && (
                    <div className="mb-4 p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[13px] flex items-start gap-2">
                      <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">check_circle</span>
                      <span>{authSuccess}</span>
                    </div>
                  )}

                  {/* ===== PHONE OTP AUTH ===== */}
                  {authMethod === 'phone' && (
                    <div className="space-y-4">
                      <div className="text-center mb-2">
                        <div className="inline-flex items-center gap-2 bg-[#ECFDF5] text-[#065F46] text-[11px] font-bold px-3 py-1.5 rounded-full">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          Recommandé au Bénin — rapide et sans mot de passe
                        </div>
                      </div>

                      {phoneStep === 'input' ? (
                        <>
                          <div>
                            <label className="block text-[12px] font-bold text-[#334155] mb-1.5">
                              Numéro de téléphone mobile
                            </label>
                            <div className="flex">
                              <span className="px-3 py-2.5 rounded-l-xl bg-[#E2E8F0] border border-r-0 border-[#CBD5E1] text-[13px] font-bold text-[#334155] flex items-center gap-1.5 whitespace-nowrap">
                                🇧🇯 +229
                              </span>
                              <input
                                type="tel"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                placeholder="01 64 28 90"
                                className="w-full px-4 py-2.5 rounded-r-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[15px] text-[#0F172A] focus:border-[#10B981] outline-none tracking-wider"
                                maxLength={12}
                              />
                            </div>
                            <p className="text-[11px] text-[#94A3B8] mt-1.5">
                              Vous recevrez un code de vérification à 6 chiffres par SMS.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isAuthLoading || !phoneNumber || phoneNumber.replace(/\s/g, '').length < 8}
                            className="w-full py-3 rounded-xl bg-[#10B981] text-white text-[14px] font-bold hover:bg-[#059669] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAuthLoading ? (
                              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">sms</span>
                            )}
                            Recevoir mon code SMS
                          </button>
                        </>
                      ) : (
                        <>
                          {/* OTP Verification step */}
                          <div className="text-center mb-2">
                            <p className="text-[13px] text-[#64748B]">
                              Code envoyé au <span className="font-bold text-[#0F172A]">+229 {phoneNumber}</span>
                            </p>
                            {otpCountdown > 0 && (
                              <p className="text-[11px] text-[#94A3B8] mt-1">
                                Expire dans {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                              </p>
                            )}
                          </div>

                          {/* Demo OTP hint */}
                          {demoOtp && (
                            <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-[12px] flex items-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">science</span>
                              <span>Mode démo — Code : <strong className="text-[16px] tracking-widest">{demoOtp}</strong></span>
                            </div>
                          )}

                          <div>
                            <label className="block text-[12px] font-bold text-[#334155] mb-1.5">
                              Code de vérification (6 chiffres)
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={otpCode}
                              onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              className="w-full px-4 py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[24px] text-center text-[#0F172A] focus:border-[#10B981] outline-none tracking-[0.5em] font-mono font-bold"
                              maxLength={6}
                              autoFocus
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isAuthLoading || otpCode.length !== 6}
                            className="w-full py-3 rounded-xl bg-[#0F172A] text-white text-[14px] font-bold hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAuthLoading ? (
                              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">verified</span>
                            )}
                            Vérifier et se connecter
                          </button>

                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => { setPhoneStep('input'); setOtpCode(''); setDemoOtp(null); setAuthError(null); setAuthSuccess(null); }}
                              className="text-[12px] text-[#64748B] hover:text-[#0F172A] font-medium flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                              Changer de numéro
                            </button>
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={isAuthLoading || otpCountdown > 0}
                              className="text-[12px] text-[#10B981] hover:text-[#059669] font-bold disabled:text-[#94A3B8] disabled:cursor-not-allowed"
                            >
                              {otpCountdown > 0 ? `Renvoyer (${otpCountdown}s)` : 'Renvoyer le code'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ===== EMAIL AUTH ===== */}
                  {authMethod === 'email' && (
                    <div>
                      {/* Login / Register tabs */}
                      <div className="flex bg-[#F1F5F9] p-1 rounded-xl mb-5">
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
                    </div>
                  )}

                  {/* ===== GOOGLE OAUTH ===== */}
                  {authMethod === 'google' && (
                    <div className="space-y-4">
                      <div className="text-center mb-2">
                        <p className="text-[13px] text-[#64748B]">
                          Connectez-vous instantanément avec votre compte Google.
                          Aucun mot de passe requis.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isAuthLoading}
                        className="w-full py-3.5 rounded-xl bg-white border-2 border-[#E2E8F0] text-[#334155] text-[14px] font-bold hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60"
                      >
                        {isAuthLoading ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                        )}
                        Continuer avec Google
                      </button>

                      <div className="p-3 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[11px] text-[#64748B] text-center">
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
                        Nécessite la configuration des identifiants Google Cloud dans le dashboard Supabase.
                      </div>
                    </div>
                  )}

                  {/* Separator */}
                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-[#E2E8F0]"></div>
                    <span className="text-[11px] text-[#94A3B8] font-medium">OU</span>
                    <div className="flex-1 h-px bg-[#E2E8F0]"></div>
                  </div>

                  {/* Demo account quick login */}
                  <div className="text-center">
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

              {/* Security notice */}
              <div className="mt-4 text-center">
                <p className="text-[11px] text-[#94A3B8] flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Connexion sécurisée via Supabase Auth — données chiffrées
                </p>
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

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 rounded-xl bg-[#0F172A] text-white text-[13px] font-bold hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
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
                      className="text-[12px] text-[#DC2626] font-semibold hover:underline flex items-center justify-center gap-1 py-1"
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
