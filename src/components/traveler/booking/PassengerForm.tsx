import React from 'react';

interface PassengerFormProps {
  fullName: string;
  setFullName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  email: string;
  setEmail: (email: string) => void;
}

export const PassengerForm = ({
  fullName, setFullName,
  phone, setPhone,
  email, setEmail
}: PassengerFormProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-space-sm">
        <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-label-sm flex items-center justify-center">1</span>
        <h3 className="font-title-md text-title-md font-bold text-on-surface">Informations Voyageur Principal</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <div className="space-y-1 md:col-span-2">
          <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="fullName">Nom complet (selon pièce d'identité) *</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-on-surface-variant">badge</span>
            <input 
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-xl pl-10 pr-4 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none" 
              id="fullName" 
              placeholder="Ex: BIO TCHANE Koffi" 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="phone">Téléphone WhatsApp & SMS *</label>
          <div className="relative flex">
            <div className="bg-surface-container px-3 py-2.5 rounded-l-xl font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
              <span>🇧🇯</span>
              <span>+229</span>
            </div>
            <input 
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-r-xl px-3 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none" 
              id="phone" 
              placeholder="01 95 XX XX" 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <span className="font-label-sm text-label-sm text-secondary block">Billet électronique instantané et alertes de départ envoyés ici</span>
        </div>
        <div className="space-y-1">
          <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="email">Adresse e-mail <span className="text-on-surface-variant font-normal">(Facultatif)</span></label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-on-surface-variant">mail</span>
            <input 
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-xl pl-10 pr-4 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none" 
              id="email" 
              placeholder="voyageur@example.bj" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <span className="font-label-sm text-label-sm text-outline block">Pour recevoir votre reçu fiscal et facture PDF</span>
        </div>
      </div>
    </div>
  );
};
