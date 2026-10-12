'use client';

import React, { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('Ticket+ Bénin');
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [supportPhone, setSupportPhone] = useState('+229 01 64 00 00 00');
  const [supportEmail, setSupportEmail] = useState('contact@ticketplus.bj');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [momoActive, setMomoActive] = useState(true);
  const [moovActive, setMoovActive] = useState(true);
  const [cardActive, setCardActive] = useState(true);
  const [whatsappActive, setWhatsappActive] = useState(true);
  const [smsActive, setSmsActive] = useState(true);
  const [bookingFee, setBookingFee] = useState(0);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdminHeader
        title="Paramètres & Configuration"
        subtitle="Configuration globale de la plateforme Ticket+ Bénin"
      />

      <main className="flex-1 p-8 max-w-5xl">
        {savedSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              <span className="text-sm font-semibold">Les modifications ont été enregistrées avec succès.</span>
            </div>
            <button
              onClick={() => setSavedSuccess(false)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Informations Générales */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Paramètres Généraux</h2>
                <p className="text-xs text-slate-500">Identité et coordonnées de la plateforme</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nom de la plateforme
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Taux de commission par défaut (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={defaultCommission}
                    onChange={(e) => setDefaultCommission(Number(e.target.value))}
                    className="w-full h-11 px-3.5 pr-8 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <span className="absolute right-3.5 top-3 text-sm font-bold text-slate-400">%</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Prélevé sur chaque billet vendu via la plateforme</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Téléphone Support
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Support
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Passerelles de Paiement */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Passerelles de Paiement (Bénin)</h2>
                <p className="text-xs text-slate-500">Activation et état des moyens de paiement acceptés</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* MTN MoMo */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-400/20 text-amber-700 font-extrabold flex items-center justify-center text-xs">
                    MTN
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">MTN Mobile Money Bénin</h3>
                    <p className="text-xs text-slate-500">API MoMo v2.0 • Code marchand configuré</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={momoActive}
                    onChange={(e) => setMomoActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Moov Money */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                    MOOV
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Moov Money Bénin (Flooz)</h3>
                    <p className="text-xs text-slate-500">Passerelle Moov Money B2C</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={moovActive}
                    onChange={(e) => setMoovActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Cartes bancaires */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-700 font-extrabold flex items-center justify-center text-xs">
                    CARD
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Cartes Bancaires (Visa / Mastercard)</h3>
                    <p className="text-xs text-slate-500">Stripe / FedaPay Gateway</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cardActive}
                    onChange={(e) => setCardActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Canaux de Notification */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Canaux de Notification</h2>
                <p className="text-xs text-slate-500">Envoi automatique de billets et alertes aux voyageurs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[24px]">chat</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">WhatsApp Business API</h3>
                    <p className="text-xs text-slate-500">Envoi billet PDF + QR code</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whatsappActive}
                    onChange={(e) => setWhatsappActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600 text-[24px]">sms</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Passerelle SMS (OTP & Billet)</h3>
                    <p className="text-xs text-slate-500">SMS de confirmation de départ</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsActive}
                    onChange={(e) => setSmsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: Maintenance & Mode Dégradé */}
          <div className="bg-white rounded-2xl border border-rose-200/60 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-rose-100">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Zone Critique</h2>
                <p className="text-xs text-slate-500">Gestion de la disponibilité du service</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50/50 border border-rose-200/80">
              <div>
                <h3 className="text-sm font-bold text-rose-950">Mode Maintenance</h3>
                <p className="text-xs text-rose-800">
                  Bloque les réservations pour les voyageurs et affiche un écran d'indisponibilité temporaire.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
          </div>

          {/* Bouton d'enregistrement */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="h-12 px-8 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
