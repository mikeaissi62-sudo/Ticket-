'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function PartnerLoginPage() {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

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
              Réservé aux transporteurs agréés et équipes de gestion. Connectez-vous à votre portail pour administrer vos trajets, valider les billets en gare et suivre les recettes financières.
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

          {/* Right Column: High-End Dark Partner Login Card */}
          <div className="lg:col-span-6 w-full max-w-[460px] mx-auto">
            <div className="bg-[#0F243A]/95 rounded-3xl border border-slate-700/70 shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-sm">
              
              {/* Card Header */}
              <div className="p-6 sm:p-7 border-b border-slate-800/90 bg-gradient-to-r from-teal-950/40 via-[#0F243A] to-slate-900/60">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-300 font-mono text-[11px] font-bold uppercase tracking-wider">
                    AUTHENTIFICATION PRO
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-[20px]">verified_user</span>
                </div>
                <h2 className="text-[22px] font-extrabold text-white tracking-tight">
                  Connexion Compagnie
                </h2>
                <p className="text-[12px] text-slate-400 mt-1">
                  Accédez à votre console de gestion transporteur Ticket+.
                </p>
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
                      <span>Mémoriser ma session sur ce poste</span>
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

                {/* Quick Demo Login Button */}
                <div className="pt-3 border-t border-slate-800/80">
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
                <div className="pt-2 text-center">
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
