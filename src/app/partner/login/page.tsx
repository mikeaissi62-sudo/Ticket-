'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const COMPANIES_LIST = [
  { id: '9cb670bc-6814-48e6-92ce-db1605611ee5', name: 'Confort Lines' },
  { id: '51552b14-510a-46d0-9140-7256371cec26', name: 'Baobab Express' },
  { id: '7907afa5-999f-4ad1-a436-3473a39a694c', name: 'ATT Transports' },
  { id: '678a2737-3ac1-481b-8c2a-55e5a168ba3f', name: 'STM Voyageur' },
  { id: 'other', name: 'Autre nouvelle compagnie conventionnée' },
];

export default function PartnerLoginPage() {
  const [supabase] = useState(() => createClient());

  // Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState(COMPANIES_LIST[0].id);
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // ===== CONNEXION PAR EMAIL =====
  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthError(
          error.message === 'Invalid login credentials'
            ? 'Identifiants invalides. Veuillez vérifier votre adresse email et votre mot de passe.'
            : error.message
        );
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Vérifier le rôle de l'utilisateur
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .single();

        const role = profile?.role;
        if (role !== 'partner' && role !== 'admin') {
          // L'utilisateur n'est pas un partenaire
          await supabase.auth.signOut();
          setAuthError(
            "Ce compte n'est pas autorisé sur le Portail Compagnie. Veuillez utiliser vos identifiants transporteur officiel ou vous connecter via l'espace voyageur."
          );
          setIsLoading(false);
          return;
        }

        // Connexion réussie -> redirection directe vers le tableau de bord partenaire
        setAuthSuccess('Connexion réussie ! Redirection vers le Portail Compagnie...');
        setTimeout(() => {
          window.location.href = '/partner';
        }, 300);
      }
    } catch {
      setAuthError('Une erreur inattendue est survenue. Veuillez vérifier votre connexion.');
      setIsLoading(false);
    }
  };

  // ===== INSCRIPTION COMPAGNIE PAR EMAIL =====
  const handlePartnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsLoading(true);

    if (!firstName.trim() || !lastName.trim()) {
      setAuthError('Veuillez renseigner votre prénom et votre nom.');
      setIsLoading(false);
      return;
    }

    try {
      const companyId = selectedCompanyId !== 'other' ? selectedCompanyId : null;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          role: 'partner',
          companyId,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || "Erreur lors de la création du compte partenaire.");
        setIsLoading(false);
        return;
      }

      // Connexion immédiate avec le compte créé
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setAuthSuccess('Compte partenaire créé avec succès ! Veuillez vous connecter.');
        setAuthMode('login');
        setIsLoading(false);
        return;
      }

      setAuthSuccess('Compte créé avec succès ! Accès au Portail Compagnie...');
      setTimeout(() => {
        window.location.href = '/partner';
      }, 400);
    } catch {
      setAuthError('Erreur de connexion. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  // ===== AUTHENTIFICATION DIRECTE AVEC GOOGLE =====
  const handleGooglePartnerAuth = async () => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/partner`,
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
      }
    } catch {
      setAuthError('Erreur de connexion avec Google.');
      setIsLoading(false);
    }
  };

  // ===== CONNEXION DÉMO RAPIDE =====
  const handleDemoPartnerLogin = async () => {
    setAuthError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/demo?role=partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'partner' }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setAuthError(data.error || 'Erreur lors de la connexion démo partenaire.');
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

      window.location.href = '/partner';
    } catch {
      setAuthError('Erreur de connexion.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071320] text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0B1929]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/fr" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]">corporate_fare</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[15px] tracking-tight text-white flex items-center gap-1.5">
                Ticket<span className="text-teal-400">+</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono uppercase tracking-wider border border-teal-500/30">
                  PARTNER
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Portail Compagnies de Transport</span>
            </div>
          </Link>

          <Link
            href="/fr"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-[12px] font-semibold border border-slate-700/60 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Site Ticket+</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <div className="w-full max-w-[1080px] grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: B2B Transport Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                Espace Pro Sécurisé • Flotte &amp; Billetterie
              </span>
            </div>

            <h1 className="text-[32px] sm:text-[40px] font-black text-white tracking-tight leading-[1.15]">
              Pilotez l&apos;activité de vos autocars en temps réel.
            </h1>

            <p className="text-[15px] text-slate-300 leading-relaxed">
              Réservé aux transporteurs agréés et équipes de gestion. Créez votre compte ou connectez-vous pour administrer vos trajets, valider les billets en gare et suivre les recettes financières.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#0F243A] border border-slate-800/90 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                </div>
                <h3 className="text-[13px] font-bold text-white">Gestion de Flotte</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Suivi des bus actifs, attributions de chauffeurs et maintenance.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F243A] border border-slate-800/90 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                </div>
                <h3 className="text-[13px] font-bold text-white">Contrôle Embarqué</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Validation instantanée par QR code pour éradiquer les fraudes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F243A] border border-slate-800/90 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[20px]">payments</span>
                </div>
                <h3 className="text-[13px] font-bold text-white">Reversement Direct</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Rapports financiers transparents et règlements automatisés.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F243A] border border-slate-800/90 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[20px]">support_agent</span>
                </div>
                <h3 className="text-[13px] font-bold text-white">Support Dédié B2B</h3>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Ligne d&apos;assistance prioritaire réservée aux compagnies partenaires.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Dark Partner Card */}
          <div className="lg:col-span-6 w-full max-w-[480px] mx-auto">
            <div className="bg-[#0F243A]/95 rounded-3xl border border-slate-700/70 shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-sm">
              
              {/* Card Header with Mode Toggle (Connexion / Inscription) */}
              <div className="p-6 sm:p-7 border-b border-slate-800/90 bg-gradient-to-r from-teal-950/40 via-[#0F243A] to-slate-900/60">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                    AUTHENTIFICATION PRO
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">verified_user</span>
                </div>
                
                <h2 className="text-[22px] font-extrabold text-white tracking-tight">
                  {authMode === 'login' ? 'Connexion Compagnie' : 'Créer un Compte Compagnie'}
                </h2>
                <p className="text-[12px] text-slate-400 mt-1">
                  {authMode === 'login'
                    ? 'Accédez à votre console de gestion transporteur Ticket+.'
                    : 'Enregistrez votre compagnie de transport sur le réseau officiel.'}
                </p>

                {/* Switch Login / Register Tabs */}
                <div className="flex gap-2 mt-4 bg-slate-900/70 p-1.5 rounded-xl border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setAuthError(null); setAuthSuccess(null); }}
                    className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all ${
                      authMode === 'login'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Se connecter
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setAuthError(null); setAuthSuccess(null); }}
                    className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all ${
                      authMode === 'register'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Créer un compte
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 sm:p-7 space-y-5">
                
                {/* Error Alert */}
                {authError && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-[12px] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0 mt-0.5">error</span>
                    <span>{authError}</span>
                  </div>
                )}

                {/* Success Alert */}
                {authSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-[12px] flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400 shrink-0 mt-0.5">check_circle</span>
                    <span>{authSuccess}</span>
                  </div>
                )}

                {/* 1. DIRECT GOOGLE AUTH BUTTON */}
                <div>
                  <button
                    type="button"
                    onClick={handleGooglePartnerAuth}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-[13px] transition-all flex items-center justify-center gap-3 shadow-md disabled:opacity-60 cursor-pointer active:scale-98"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>
                      {authMode === 'login' ? 'Continuer avec Google' : 'Créer un compte avec Google'}
                    </span>
                  </button>

                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-slate-800"></div>
                    <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                      ou par email
                    </span>
                    <div className="flex-1 h-px bg-slate-800"></div>
                  </div>
                </div>

                {/* 2. EMAIL FORM: LOGIN MODE */}
                {authMode === 'login' ? (
                  <form onSubmit={handlePartnerLogin} className="space-y-4">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-300 mb-1.5">
                        Email Professionnel Compagnie
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          mail
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="partenaire@confortlines.bj"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#091827] border border-slate-700 text-white placeholder-slate-500 text-[13px] font-medium outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[12px] font-bold text-slate-300">
                          Mot de passe
                        </label>
                        <a
                          href="https://wa.me/2290154658907?text=Demande%20de%20réinitialisation%20mot%20de%20passe%20partenaire%20Ticket%2B"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
                        >
                          Assistance mot de passe ?
                        </a>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          lock
                        </span>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#091827] border border-slate-700 text-white placeholder-slate-500 text-[13px] font-medium outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-[12px] text-slate-400">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-700 text-teal-500 focus:ring-teal-500 accent-teal-500 cursor-pointer"
                        />
                        <span>Mémoriser ma session</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-extrabold text-[14px] shadow-lg shadow-teal-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
                    >
                      {isLoading ? (
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">login</span>
                          <span>Se connecter au Portail</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* 3. EMAIL FORM: REGISTER MODE */
                  <form onSubmit={handlePartnerRegister} className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Prénom responsable</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Marc"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#091827] border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-teal-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Nom responsable</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Adékambi"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#091827] border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Compagnie de Transport</label>
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-[#091827] border border-slate-700 text-white text-[13px] font-medium outline-none focus:border-teal-400 cursor-pointer"
                      >
                        {COMPANIES_LIST.map((c) => (
                          <option key={c.id} value={c.id} className="bg-[#0B1929] text-white">
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCompanyId === 'other' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Nom de votre Compagnie</label>
                        <input
                          type="text"
                          required
                          value={customCompanyName}
                          onChange={(e) => setCustomCompanyName(e.target.value)}
                          placeholder="Ex: Alafia Transports"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#091827] border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-teal-400"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Email professionnel</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="direction@compagnie.bj"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#091827] border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-teal-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Téléphone de service</label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+229 01 00 00 00"
                          className="w-full px-3 py-2.5 rounded-xl bg-[#091827] border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-teal-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Mot de passe sécurisé</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Au moins 6 caractères"
                        className="w-full px-3 py-2.5 rounded-xl bg-[#091827] border border-slate-700 text-white placeholder-slate-500 text-[13px] outline-none focus:border-teal-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-extrabold text-[14px] shadow-lg shadow-teal-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
                    >
                      {isLoading ? (
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                          <span>Créer mon Compte Compagnie</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Quick Demo Login Button */}
                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={handleDemoPartnerLogin}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold text-[12px] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span>Connexion Rapide Démo (Compagnie Test)</span>
                  </button>
                </div>

                {/* Switch to Traveler Login */}
                <div className="pt-1 text-center">
                  <p className="text-[12px] text-slate-400">
                    Vous êtes un voyageur ?{' '}
                    <Link
                      href="/fr/login"
                      className="text-teal-400 hover:text-teal-300 font-bold underline"
                    >
                      Accéder à l&apos;espace voyageur
                    </Link>
                  </p>
                </div>

              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-4 text-center text-[12px] text-slate-500">
        Ticket+ Bénin • Espace Partenaires Institutionnels &amp; Compagnies de Transport • Sécurité SSL 256-bit
      </footer>
    </div>
  );
}
