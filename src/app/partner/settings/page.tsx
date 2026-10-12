'use client';

import React, { useState } from 'react';

export default function PartnerSettingsPage() {
  const [companyName, setCompanyName] = useState('Confort Lines Bénin');
  const [tagline, setTagline] = useState('Voyagez en toute sérénité à travers le Bénin');
  const [phone, setPhone] = useState('+229 01 64 22 11 00');
  const [email, setEmail] = useState('contact@confortlines.bj');
  const [headquarters, setHeadquarters] = useState('Gare de l\'Étoile Rouge, Cotonou');
  const [momoPayoutNumber, setMomoPayoutNumber] = useState('+229 01 64 22 11 00');
  const [bankRib, setBankRib] = useState('BJ061 01001 001234567890 45');
  const [payoutFrequency, setPayoutFrequency] = useState('weekly');
  const [luggageAllowance, setLuggageAllowance] = useState('23');
  const [boardingNoticeMinutes, setBoardingNoticeMinutes] = useState('30');
  const [autoSmsNotice, setAutoSmsNotice] = useState(true);
  const [autoWhatsappTicket, setAutoWhatsappTicket] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 px-6 lg:px-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-400">tune</span>
            Paramètres de la Compagnie
          </h1>
          <p className="text-xs text-slate-400">Configuration générale de votre compte transporteur</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Compte Vérifié</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8 max-w-5xl">
        {savedSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-teal-400">check_circle</span>
              <span className="text-sm font-semibold">Les paramètres de la compagnie ont été mis à jour avec succès.</span>
            </div>
            <button onClick={() => setSavedSuccess(false)} className="text-teal-400 hover:text-teal-200">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Profil Compagnie */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">business</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Identité de l'Entreprise</h2>
                <p className="text-xs text-slate-400">Informations publiques affichées sur les billets et résultats</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Raison Sociale / Nom commercial
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Slogan ou description
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Téléphone Standard / WhatsApp Client
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Professionnel
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Gare Principale / Siège
                </label>
                <input
                  type="text"
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Versements & Compte Financier */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Versements des Recettes (Payouts)</h2>
                <p className="text-xs text-slate-400">Comptes sur lesquels Ticket+ vire vos recettes nettes de commissions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Numéro Mobile Money (MTN / Moov)
                </label>
                <input
                  type="text"
                  value={momoPayoutNumber}
                  onChange={(e) => setMomoPayoutNumber(e.target.value)}
                  placeholder="+229 01 XX XX XX XX"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                />
                <p className="mt-1 text-[11px] text-slate-400">Pour virements instantanés Mobile Money</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Fréquence des versements
                </label>
                <select
                  value={payoutFrequency}
                  onChange={(e) => setPayoutFrequency(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                >
                  <option value="daily">Quotidien (chaque soir)</option>
                  <option value="weekly">Hebdomadaire (tous les lundis)</option>
                  <option value="biweekly">Bimensuel (1er et 15 du mois)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Relevé d'Identité Bancaire (RIB)
                </label>
                <input
                  type="text"
                  value={bankRib}
                  onChange={(e) => setBankRib(e.target.value)}
                  placeholder="Code banque - Guichet - Compte - Clé"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm font-mono text-white focus:outline-none focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Règles de Voyage & Embarquement */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">luggage</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Règles Voyageurs & Bagages</h2>
                <p className="text-xs text-slate-400">Conditions mentionnées sur le ticket du passager</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Présentation avant départ (Minutes)
                </label>
                <input
                  type="number"
                  value={boardingNoticeMinutes}
                  onChange={(e) => setBoardingNoticeMinutes(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                />
                <p className="mt-1 text-[11px] text-slate-400">Délai recommandé d'arrivée en gare avant le départ</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Poids bagages inclus (Kg)
                </label>
                <input
                  type="number"
                  value={luggageAllowance}
                  onChange={(e) => setLuggageAllowance(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white focus:outline-none focus:border-teal-500 transition-all"
                />
                <p className="mt-1 text-[11px] text-slate-400">Franchise bagage soute comprise dans le tarif standard</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Rappels WhatsApp automatiques</h4>
                  <p className="text-xs text-slate-400">Envoyer automatiquement un rappel au voyageur 2h avant le départ</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoWhatsappTicket}
                    onChange={(e) => setAutoWhatsappTicket(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Alerte SMS en cas de retard</h4>
                  <p className="text-xs text-slate-400">Notifier les passagers si un bus a plus de 15 minutes de retard</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSmsNotice}
                    onChange={(e) => setAutoSmsNotice(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="h-12 px-8 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Sauvegarder les paramètres
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
