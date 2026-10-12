'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

type AuthMethod = 'phone' | 'email' | 'google';
type PhoneStep = 'input' | 'verify';

interface CountryPhone {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  digits: number;
  placeholder: string;
}

const COUNTRIES: CountryPhone[] = [
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯', digits: 10, placeholder: '01 64 28 90 00' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬', digits: 8, placeholder: '90 12 34 56' },
  { code: 'NG', name: 'Nigéria', dialCode: '+234', flag: '🇳🇬', digits: 10, placeholder: '80 12 34 56 78' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', digits: 10, placeholder: '07 01 23 45 67' },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪', digits: 8, placeholder: '90 12 34 56' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', digits: 8, placeholder: '70 12 34 56' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', digits: 9, placeholder: '24 123 4567' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳', digits: 9, placeholder: '77 123 45 67' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱', digits: 8, placeholder: '66 12 34 56' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳', digits: 9, placeholder: '62 123 4567' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲', digits: 9, placeholder: '6 71 23 45 67' },
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦', digits: 8, placeholder: '06 12 34 56' },
  { code: 'CG', name: 'Congo', dialCode: '+242', flag: '🇨🇬', digits: 9, placeholder: '06 123 4567' },
  { code: 'CD', name: 'RDC', dialCode: '+243', flag: '🇨🇩', digits: 9, placeholder: '81 234 5678' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', digits: 9, placeholder: '6 12 34 56 78' },
  { code: 'BE', name: 'Belgique', dialCode: '+32', flag: '🇧🇪', digits: 9, placeholder: '470 12 34 56' },
  { code: 'US', name: 'États-Unis', dialCode: '+1', flag: '🇺🇸', digits: 10, placeholder: '202 555 0123' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', digits: 10, placeholder: '416 555 0123' },
];

export default function LoginPage() {
  const locale = useLocale();
  const router = useRouter();

  const [supabase] = useState(() => createClient());
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Selected Country for Phone
  const [selectedCountry, setSelectedCountry] = useState<CountryPhone>(COUNTRIES[0]); // Default Bénin

  // Phone OTP state
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Email form state
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  // Phone field inside email registration form (matching the image)
  const [regPhoneNumber, setRegPhoneNumber] = useState('');
  const [regSelectedCountry, setRegSelectedCountry] = useState<CountryPhone>(COUNTRIES[0]);
  // Se souvenir de moi
  const [rememberMe, setRememberMe] = useState(true);

  // Check if already logged in -> redirect directly to destination or home
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const searchParams = new URLSearchParams(window.location.search);
          const redirectParam = searchParams.get('redirect');
          if (redirectParam) {
            const cleanPath = redirectParam.replace(/^\/(fr|en)/, '');
            router.replace(`/${locale}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`);
            return;
          }
          router.replace(`/${locale}`);
          return;
        }
      } catch {
        // Continue to login page
      } finally {
        setIsCheckingSession(false);
      }
    }
    checkSession();
  }, [locale, router, supabase]);

  // OTP Countdown timer
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

  // Redirection vers l'Accueil ou la page demandée après connexion ou inscription
  const handleAuthSuccess = () => {
    try {
      localStorage.setItem('tp_remember_me', rememberMe ? '1' : '0');
    } catch {}
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get('redirect');
      if (redirectParam) {
        const cleanPath = redirectParam.replace(/^\/(fr|en)/, '');
        router.replace(`/${locale}${cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath}`);
        router.refresh();
        return;
      }
    } catch {}
    router.replace(`/${locale}`);
    router.refresh();
  };

  // ===== PHONE OTP HANDLERS =====
  const handleSendOtp = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsLoading(true);
    setDemoOtp(null);

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length !== selectedCountry.digits) {
      setAuthError(`Numéro invalide pour ${selectedCountry.name}. Veuillez saisir exactement ${selectedCountry.digits} chiffres (actuellement ${cleanDigits.length}).`);
      setIsLoading(false);
      return;
    }

    try {
      const fullPhone = `${selectedCountry.dialCode}${cleanDigits}`;
      const res = await fetch('/api/auth/phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: fullPhone,
          dialCode: selectedCountry.dialCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Erreur lors de l'envoi du code.");
        setIsLoading(false);
        return;
      }

      setPhoneStep('verify');
      setOtpCountdown(120);

      if (data.demo_mode && data.demo_otp) {
        setDemoOtp(data.demo_otp);
        setAuthSuccess(`Code envoyé ! Mode démo : votre code est ${data.demo_otp}`);
      } else {
        setAuthSuccess(`Un code de vérification à 6 chiffres a été envoyé par SMS au ${selectedCountry.dialCode} ${cleanDigits}.`);
      }
    } catch {
      setAuthError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsLoading(true);

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    const fullPhone = `${selectedCountry.dialCode}${cleanDigits}`;

    try {
      const res = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: fullPhone, 
          otp: otpCode,
          dialCode: selectedCountry.dialCode,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || 'Code incorrect ou expiré.');
        setIsLoading(false);
        return;
      }

      if (data.email && data.password) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          setAuthError(signInError.message);
          setIsLoading(false);
          return;
        }
      }

      handleAuthSuccess();
    } catch {
      setAuthError('Erreur lors de la vérification. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  // ===== EMAIL HANDLERS =====
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (error) {
        setAuthError(error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : error.message);
        setIsLoading(false);
        return;
      }

      handleAuthSuccess();
    } catch {
      setAuthError('Erreur de connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    if (!authFirstName || !authLastName) {
      setAuthError('Veuillez remplir votre nom et votre prénom.');
      setIsLoading(false);
      return;
    }

    try {
      // Build full phone number from registration form
      const regDigits = regPhoneNumber.replace(/\D/g, '');
      const fullRegPhone = regDigits.length > 0
        ? `${regSelectedCountry.dialCode}${regDigits}`
        : undefined;

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          firstName: authFirstName,
          lastName: authLastName,
          ...(fullRegPhone ? { phone: fullRegPhone } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Erreur lors de l'inscription.");
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });

      if (signInError) {
        setAuthError(signInError.message);
        setIsLoading(false);
        return;
      }

      handleAuthSuccess();
    } catch {
      setAuthError("Erreur lors de l'inscription. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  // ===== GOOGLE OAUTH =====
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/${locale}`,
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
      }
    } catch {
      setAuthError('Erreur de connexion Google.');
      setIsLoading(false);
    }
  };

  // ===== DEMO LOGIN =====
  const handleDemoLogin = async () => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      const data = await res.json();

      if (!res.ok || data.error) {
        setAuthError(data.error || 'Erreur compte démo.');
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setAuthError(signInError.message);
        setIsLoading(false);
        return;
      }

      handleAuthSuccess();
    } catch {
      setAuthError('Erreur de connexion démo.');
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[36px] text-[#10B981] animate-spin">
            progress_activity
          </span>
          <p className="text-[14px] text-[#64748B] font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-[960px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Brand presentation (Hidden on mobile or compact) */}
        <div className="lg:col-span-5 space-y-6 text-left hidden lg:block">
          <h1 className="text-[34px] xl:text-[38px] font-black text-[#0F172A] tracking-tight leading-tight">
            Voyagez l&apos;esprit tranquille avec <span className="text-[#10B981]">Ticket+</span>
          </h1>

          <p className="text-[14px] text-[#475569] leading-relaxed">
            Créez votre compte en quelques secondes pour réserver vos places, recevoir vos e-billets et être alerté par SMS et WhatsApp.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#10B981] shrink-0">
                <span className="material-symbols-outlined text-[20px]">phone_iphone</span>
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-[#0F172A]">Connexion SMS instantanée</h2>
                <p className="text-[12px] text-[#64748B]">Plus besoin de mot de passe, un code SMS sécurisé suffit.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#10B981] shrink-0">
                <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-[#0F172A]">Vos e-billets dans votre poche</h2>
                <p className="text-[12px] text-[#64748B]">Accédez à vos QR codes même sans connexion internet.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#10B981] shrink-0">
                <span className="material-symbols-outlined text-[20px]">schedule</span>
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-[#0F172A]">Alertes départ en temps réel</h2>
                <p className="text-[12px] text-[#64748B]">Rappel par SMS &amp; WhatsApp 2h avant le départ de votre bus.</p>
              </div>
            </div>
          </div>


        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xl overflow-hidden">
            
            {/* Top banner */}
            <div className="bg-[#0F172A] p-6 text-white text-center relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#10B981] flex items-center justify-center text-white font-black text-[14px]">
                    T+
                  </div>
                  <span className="font-bold text-[14px] tracking-tight">Ticket+</span>
                </div>


              </div>

              <h2 className="text-[20px] sm:text-[22px] font-extrabold tracking-tight">
                {authMode === 'login' ? 'Bienvenue sur Ticket+' : 'Créez votre compte Voyageur'}
              </h2>
              <p className="text-white/70 text-[12px] mt-1">
                {authMode === 'login'
                  ? 'Connectez-vous pour accéder à vos billets et vos trajets'
                  : 'Rejoignez des milliers de voyageurs partout au Bénin'}
              </p>

              {/* Login / Register Toggle */}
              <div className="flex bg-white/10 p-1 rounded-xl mt-4">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${
                    authMode === 'login'
                      ? 'bg-white text-[#0F172A] shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Se connecter
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${
                    authMode === 'register'
                      ? 'bg-white text-[#0F172A] shadow-md'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Créer un compte
                </button>
              </div>
            </div>

            {/* Form body */}
            <div className="p-6 sm:p-8">
              
              {/* Auth Method tabs */}
              <div className="flex gap-2 mb-6 bg-[#F1F5F9] p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('phone'); setAuthError(null); }}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 relative ${
                    authMethod === 'phone'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">smartphone</span>
                  <span>Téléphone</span>
                  <span className="hidden sm:inline-block bg-[#10B981] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                    SMS
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod('email'); setAuthError(null); }}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authMethod === 'email'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  <span>Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod('google'); setAuthError(null); }}
                  className={`flex-1 py-2.5 px-2 rounded-xl text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    authMethod === 'google'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>
              </div>

              {/* Error & Success alerts */}
              {authError && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[13px] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[13px] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">check_circle</span>
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* METHOD 1: PHONE OTP (Avec sélecteur de tous les pays et nombre de chiffres) */}
              {authMethod === 'phone' && (
                <div className="space-y-4">
                  {phoneStep === 'input' ? (
                    <>
                      <div>
                        <label className="block text-[12px] font-bold text-[#334155] mb-1.5">
                          Numéro de téléphone
                        </label>

                        <div className="flex">
                          {/* Country Selector Dropdown */}
                          <div className="relative">
                            <select
                              value={selectedCountry.code}
                              onChange={(e) => {
                                const found = COUNTRIES.find(c => c.code === e.target.value);
                                if (found) setSelectedCountry(found);
                              }}
                              className="appearance-none h-full pl-3 pr-8 py-3 rounded-l-xl bg-[#E2E8F0] border border-r-0 border-[#CBD5E1] text-[13px] font-bold text-[#1E293B] cursor-pointer outline-none focus:bg-[#CBD5E1]/60"
                              aria-label="Sélectionner le pays"
                            >
                              {COUNTRIES.map(c => (
                                <option key={c.code} value={c.code} className="text-[#0F172A] bg-white">
                                  {c.flag} {c.name} ({c.dialCode})
                                </option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined text-[16px] text-[#475569] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              expand_more
                            </span>
                          </div>

                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            placeholder={selectedCountry.placeholder}
                            className="w-full px-4 py-3 rounded-r-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[15px] text-[#0F172A] focus:border-[#10B981] outline-none font-semibold tracking-wider"
                            maxLength={selectedCountry.digits + 4}
                            autoFocus
                          />
                        </div>

                        <div className="pt-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-[#475569]">
                            <input
                              type="checkbox"
                              checked={rememberMe}
                              onChange={e => setRememberMe(e.target.checked)}
                              className="w-4 h-4 rounded border-[#CBD5E1] text-[#10B981] focus:ring-[#10B981] accent-[#10B981] cursor-pointer"
                            />
                            <span>Se souvenir de moi</span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading || phoneNumber.replace(/\D/g, '').length === 0}
                        className="w-full py-3.5 rounded-xl bg-[#10B981] text-white text-[14px] font-bold hover:bg-[#059669] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">sms</span>
                        )}
                        Recevoir mon code SMS
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="text-center py-1">
                        <p className="text-[13px] text-[#64748B]">
                          Code envoyé au <strong className="text-[#0F172A]">{selectedCountry.dialCode} {phoneNumber}</strong>
                        </p>
                        {otpCountdown > 0 && (
                          <p className="text-[11px] text-[#94A3B8] mt-1">
                            Expire dans {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>

                      {demoOtp && (
                        <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-[12px] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">science</span>
                          <span>Mode démo : saisissez le code <strong className="text-[15px] tracking-widest">{demoOtp}</strong></span>
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
                        disabled={isLoading || otpCode.length !== 6}
                        className="w-full py-3.5 rounded-xl bg-[#0F172A] text-white text-[14px] font-bold hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">verified</span>
                        )}
                        Valider et continuer vers l&apos;accueil
                      </button>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => { setPhoneStep('input'); setOtpCode(''); setDemoOtp(null); }}
                          className="text-[12px] text-[#64748B] hover:text-[#0F172A] font-medium flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                          Modifier le numéro
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isLoading || otpCountdown > 0}
                          className="text-[12px] text-[#10B981] hover:text-[#059669] font-bold disabled:text-[#94A3B8] disabled:cursor-not-allowed"
                        >
                          {otpCountdown > 0 ? `Renvoyer (${otpCountdown}s)` : 'Renvoyer le code'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* METHOD 2: EMAIL & PASSWORD (Sans la ligne téléphone dans l'image) */}
              {authMethod === 'email' && (
                <div>
                  {authMode === 'login' ? (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
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

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-[#475569]">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-[#CBD5E1] text-[#10B981] focus:ring-[#10B981] accent-[#10B981] cursor-pointer"
                          />
                          <span>Se souvenir de moi</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl bg-[#0F172A] text-white text-[14px] font-bold hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isLoading ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">login</span>
                        )}
                        Se connecter
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleEmailRegister} className="space-y-3.5">
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

                      {/* Téléphone mobile avec sélecteur de pays */}
                      <div>
                        <label className="block text-[12px] font-bold text-[#334155] mb-1.5">Téléphone mobile</label>
                        <div className="flex">
                          <div className="relative">
                            <select
                              value={regSelectedCountry.code}
                              onChange={(e) => {
                                const found = COUNTRIES.find(c => c.code === e.target.value);
                                if (found) setRegSelectedCountry(found);
                              }}
                              className="appearance-none h-full pl-3 pr-8 py-2.5 rounded-l-xl bg-[#E2E8F0] border border-r-0 border-[#CBD5E1] text-[13px] font-bold text-[#1E293B] cursor-pointer outline-none focus:bg-[#CBD5E1]/60"
                              aria-label="Sélectionner le pays"
                            >
                              {COUNTRIES.map(c => (
                                <option key={c.code} value={c.code} className="text-[#0F172A] bg-white">
                                  {c.flag} {c.name} ({c.dialCode})
                                </option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined text-[14px] text-[#475569] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                              expand_more
                            </span>
                          </div>
                          <input
                            type="tel"
                            value={regPhoneNumber}
                            onChange={e => setRegPhoneNumber(e.target.value)}
                            placeholder={regSelectedCountry.placeholder}
                            className="w-full px-4 py-2.5 rounded-r-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] text-[#0F172A] focus:border-[#10B981] outline-none font-semibold tracking-wider"
                            maxLength={regSelectedCountry.digits + 4}
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
                          className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
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
                          className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:border-[#10B981] outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-[#475569]">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-[#CBD5E1] text-[#10B981] focus:ring-[#10B981] accent-[#10B981] cursor-pointer"
                          />
                          <span>Se souvenir de moi</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-2xl bg-[#10B981] text-white text-[14px] font-bold hover:bg-[#059669] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60"
                      >
                        {isLoading ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                        )}
                        Créer mon compte
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* METHOD 3: GOOGLE OAUTH */}
              {authMethod === 'google' && (
                <div className="space-y-4">
                  <p className="text-[13px] text-[#64748B] text-center">
                    Connectez-vous en un clic avec votre compte Google et accédez directement aux réservations.
                  </p>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-white border-2 border-[#E2E8F0] text-[#334155] text-[14px] font-bold hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-60"
                  >
                    {isLoading ? (
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
                </div>
              )}

              {/* Separator */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[#E2E8F0]"></div>
                <span className="text-[11px] text-[#94A3B8] font-medium">OU</span>
                <div className="flex-1 h-px bg-[#E2E8F0]"></div>
              </div>

              {/* One-click Demo Button */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] text-[12px] font-bold hover:bg-[#F1F5F9] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-[#10B981]">bolt</span>
                Tester immédiatement (Compte Démo Voyageur)
              </button>



            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
