'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function ProfilPage() {
  const locale = useLocale();
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'Koffi',
    lastName: 'Dossou',
    phone: '01 64 28 90',
    email: 'koffi.dossou@gmail.com',
    city: 'Cotonou',
    idType: 'cni',
    notifSms: true,
    notifWhatsapp: true,
    notifEmail: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="px-gutter pb-space-sm pt-space-md">
        <div className="max-w-[1140px] mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/${locale}`} className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors">Accueil</Link>
            <span className="text-outline-variant">/</span>
            <span className="font-label-sm text-label-sm text-on-surface font-semibold">Profil</span>
          </div>
          <h1 className="font-display-sm text-display-sm md:font-display-md md:text-display-md font-extrabold text-on-surface tracking-tight">
            Mon Profil
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Gérez vos informations personnelles et vos préférences de notification.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-[1140px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="bg-primary p-space-lg flex flex-col items-center text-center text-on-primary">
                <div className="w-20 h-20 rounded-full bg-on-primary/10 flex items-center justify-center mb-space-sm border-2 border-on-primary/20">
                  <span className="material-symbols-outlined text-[36px]">person</span>
                </div>
                <h2 className="font-title-lg text-title-lg font-bold">{profile.firstName} {profile.lastName}</h2>
                <p className="font-label-sm text-label-sm text-on-primary/70 mt-0.5">Membre Ticket+ depuis Sept. 2026</p>
              </div>
              <div className="p-space-md space-y-space-sm">
                <div className="flex items-center gap-3 font-body-md text-body-md">
                  <span className="material-symbols-outlined text-[18px] text-secondary">phone</span>
                  <span className="text-on-surface font-medium">+229 {profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 font-body-md text-body-md">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">mail</span>
                  <span className="text-on-surface font-medium">{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 font-body-md text-body-md">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">location_city</span>
                  <span className="text-on-surface font-medium">{profile.city}, Bénin</span>
                </div>
                <div className="pt-space-md border-t border-outline-variant">
                  <div className="grid grid-cols-2 gap-space-sm text-center">
                    <div className="bg-surface-container rounded-lg p-space-sm">
                      <div className="font-headline-sm text-headline-sm font-extrabold text-on-surface">3</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Voyages</div>
                    </div>
                    <div className="bg-surface-container rounded-lg p-space-sm">
                      <div className="font-headline-sm text-headline-sm font-extrabold text-secondary">14 000</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">FCFA dépensés</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 space-y-space-md">
            {saved && (
              <div className="p-space-sm rounded-xl bg-secondary-container/40 border border-secondary/20 text-on-secondary-container font-label-md text-label-md font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Vos modifications ont été enregistrées avec succès.
              </div>
            )}

            {/* Personal Info */}
            <form onSubmit={handleSave}>
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-space-md sm:p-space-lg">
                <h3 className="font-title-md text-title-md font-bold text-on-surface mb-space-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">badge</span>
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md mb-space-md">
                  <div>
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">Prénom</label>
                    <input value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">Nom</label>
                    <input value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">Téléphone</label>
                    <div className="flex">
                      <span className="px-3 py-2.5 rounded-l-xl bg-surface-container-high border border-r-0 border-outline-variant font-label-md text-label-md font-semibold text-on-surface">🇧🇯 +229</span>
                      <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-r-xl bg-surface-container border border-outline-variant font-body-md text-body-md text-on-surface focus:border-secondary outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">Email</label>
                    <input value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant font-body-md text-body-md text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary/30 outline-none transition-all" type="email" />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">Ville de résidence</label>
                    <select value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant font-body-md text-body-md text-on-surface focus:border-secondary outline-none transition-all">
                      {['Cotonou', 'Parakou', 'Bohicon', 'Natitingou', 'Porto-Novo', 'Djougou', 'Abomey'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1">Pièce d&apos;identité</label>
                    <select value={profile.idType} onChange={e => setProfile({...profile, idType: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant font-body-md text-body-md text-on-surface focus:border-secondary outline-none transition-all">
                      <option value="cni">CNI (Carte Nationale d&apos;Identité)</option>
                      <option value="cip">CIP</option>
                      <option value="passport">Passeport</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-primary-container transition-all flex items-center gap-2 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Enregistrer les modifications
                </button>
              </div>
            </form>

            {/* Notification Preferences */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-space-md sm:p-space-lg">
              <h3 className="font-title-md text-title-md font-bold text-on-surface mb-space-md flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">notifications</span>
                Préférences de notification
              </h3>
              <div className="space-y-space-sm">
                {[
                  { key: 'notifSms', label: 'Notifications SMS', desc: 'Confirmations et rappels de voyage par SMS', icon: 'sms' },
                  { key: 'notifWhatsapp', label: 'Notifications WhatsApp', desc: 'Billets et alertes via WhatsApp', icon: 'chat' },
                  { key: 'notifEmail', label: 'Notifications Email', desc: 'Reçus fiscaux et newsletters', icon: 'mail' },
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container border border-outline-variant cursor-pointer hover:bg-surface-container-high transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{item.icon}</span>
                      <div>
                        <div className="font-label-md text-label-md font-semibold text-on-surface">{item.label}</div>
                        <div className="font-label-sm text-label-sm text-on-surface-variant">{item.desc}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile[item.key as keyof typeof profile] as boolean}
                      onChange={e => setProfile({...profile, [item.key]: e.target.checked})}
                      className="w-5 h-5 rounded text-secondary focus:ring-secondary/30 cursor-pointer accent-secondary"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
