'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

const STATIONS = [
  { city: 'Cotonou', name: 'Gare Étoile Rouge', address: "Carrefour de l'Étoile Rouge, Agontinkon", phone: '+229 01 54 65 89 07' },
  { city: 'Parakou', name: 'Terminus Confort Lines', address: 'Boulevard Principal, Parakou', phone: '+229 01 54 65 89 07' },
  { city: 'Bohicon', name: 'Gare Routière Bohicon', address: 'Centre-ville, Bohicon', phone: '+229 01 54 65 89 07' },
  { city: 'Natitingou', name: 'Agence Principale', address: 'Route Nationale, Natitingou', phone: '+229 01 54 65 89 07' },
];

export default function ContactPage() {
  const locale = useLocale();
  const [formSent, setFormSent] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 5000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="px-4 sm:px-6 pb-6 pt-4">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${locale}`} className="text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors">Accueil</Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[13px] text-[#0F172A] font-semibold">Contact</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#0F172A] tracking-tight">
            Nous Contacter
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1 max-w-2xl">
            Notre équipe est disponible 7j/7 pour vous accompagner dans vos réservations et répondre à toutes vos questions.
          </p>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="px-4 sm:px-6 pb-6">
        <div className="max-w-[1140px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="https://wa.me/2290154658907" target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 hover:shadow-md hover:border-[#10B981] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center mb-3 group-hover:bg-[#10B981] transition-colors">
              <span className="material-symbols-outlined text-[24px] text-[#10B981] group-hover:text-white transition-colors">chat</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">WhatsApp</h3>
            <p className="text-[12px] text-[#64748B] mb-2">Réponse instantanée — Canal prioritaire</p>
            <span className="text-[14px] font-bold text-[#10B981]">+229 01 54 65 89 07</span>
          </a>
          <a href="tel:+2290154658907" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 hover:shadow-md hover:border-[#10B981] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center mb-3 group-hover:bg-[#0F172A] transition-colors">
              <span className="material-symbols-outlined text-[24px] text-[#64748B] group-hover:text-white transition-colors">call</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">Téléphone</h3>
            <p className="text-[12px] text-[#64748B] mb-2">Lun - Sam • 06h30 — 21h00</p>
            <span className="text-[14px] font-bold text-[#0F172A]">+229 01 54 65 89 07</span>
          </a>
          <a href="mailto:support@ticketplus.bj" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 hover:shadow-md hover:border-[#10B981] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#F1F5F9] flex items-center justify-center mb-3 group-hover:bg-[#0F172A] transition-colors">
              <span className="material-symbols-outlined text-[24px] text-[#64748B] group-hover:text-white transition-colors">mail</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">Email</h3>
            <p className="text-[12px] text-[#64748B] mb-2">Réponse sous 24h ouvrées</p>
            <span className="text-[14px] font-bold text-[#0F172A]">support@ticketplus.bj</span>
          </a>
        </div>
      </section>

      {/* Form + Stations */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Contact Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
            <h2 className="text-[18px] font-extrabold text-[#0F172A] mb-1">Envoyer un message</h2>
            <p className="text-[13px] text-[#64748B] mb-5">Remplissez le formulaire ci-dessous et nous vous répondrons dans les meilleurs délais.</p>

            {formSent && (
              <div className="mb-4 p-3 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20 text-[#059669] text-[13px] font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Votre message a été envoyé avec succès ! Nous vous répondrons sous 24h.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-[#0F172A] block mb-1">Nom complet *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] text-[#0F172A] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 outline-none transition-all"
                    placeholder="Koffi Dossou"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-[#0F172A] block mb-1">Téléphone *</label>
                  <input
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] text-[#0F172A] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 outline-none transition-all"
                    placeholder="+229 01 64 28 90"
                  />
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#0F172A] block mb-1">Email <span className="text-[#94A3B8] font-normal">(facultatif)</span></label>
                <input
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] text-[#0F172A] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 outline-none transition-all"
                  placeholder="koffi@example.bj"
                  type="email"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#0F172A] block mb-1">Sujet *</label>
                <select
                  required
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] text-[#0F172A] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 outline-none transition-all"
                >
                  <option value="">Choisir un sujet...</option>
                  <option value="reservation">Problème de réservation</option>
                  <option value="remboursement">Demande de remboursement</option>
                  <option value="modification">Modification de billet</option>
                  <option value="information">Demande d&apos;information</option>
                  <option value="partenariat">Proposition de partenariat</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#0F172A] block mb-1">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] text-[#0F172A] focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 outline-none transition-all resize-none"
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>
              <button type="submit" className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0F172A] text-white text-[14px] font-semibold hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">send</span>
                Envoyer le message
              </button>
            </form>
          </div>

          {/* Stations & Gares */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-[18px] font-extrabold text-[#0F172A] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#10B981]">pin_drop</span>
              Nos gares partenaires
            </h2>
            {STATIONS.map((s) => (
              <div key={s.city} className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-[#0F172A]">location_city</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[14px] font-bold text-[#0F172A]">{s.name}</h3>
                    <p className="text-[12px] text-[#64748B] mt-0.5">{s.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-[11px] font-semibold text-[#10B981] hover:underline">
                        <span className="material-symbols-outlined text-[14px]">call</span>
                        {s.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* FAQ Shortcut */}
            <div className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-4">
              <h3 className="text-[14px] font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#64748B]">help</span>
                Questions fréquentes
              </h3>
              <div className="space-y-2 text-[12px] text-[#64748B]">
                <p><strong className="text-[#0F172A]">Puis-je annuler mon billet ?</strong> — Oui, dans un délai de 2 jours avant le départ (frais de 300 FCFA).</p>
                <p><strong className="text-[#0F172A]">Quel bagage est inclus ?</strong> — 1 valise en soute (max 25 kg) + 1 bagage cabine.</p>
                <p><strong className="text-[#0F172A]">Comment recevoir mon billet ?</strong> — Par SMS, WhatsApp ou téléchargement PDF après paiement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
