import React from 'react';

interface PassengerFormProps {
  fullName: string;
  setFullName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  email: string;
  setEmail: (email: string) => void;
}

const AFRICAN_COUNTRIES = [
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯', placeholder: '01 95 XX XX' },
  { code: 'TG', name: 'Togo', dialCode: '+228', flag: '🇹🇬', placeholder: '90 12 34 56' },
  { code: 'NG', name: 'Nigéria', dialCode: '+234', flag: '🇳🇬', placeholder: '80 12 34 56 78' },
  { code: 'CI', name: "Côte d'Ivoire", dialCode: '+225', flag: '🇨🇮', placeholder: '07 01 23 45 67' },
  { code: 'NE', name: 'Niger', dialCode: '+227', flag: '🇳🇪', placeholder: '90 12 34 56' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', placeholder: '70 12 34 56' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', placeholder: '24 123 4567' },
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳', placeholder: '77 123 45 67' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱', placeholder: '66 12 34 56' },
  { code: 'GN', name: 'Guinée', dialCode: '+224', flag: '🇬🇳', placeholder: '62 123 4567' },
  { code: 'CM', name: 'Cameroun', dialCode: '+237', flag: '🇨🇲', placeholder: '6 71 23 45 67' },
  { code: 'GA', name: 'Gabon', dialCode: '+241', flag: '🇬🇦', placeholder: '06 12 34 56' },
  { code: 'CG', name: 'Congo', dialCode: '+242', flag: '🇨🇬', placeholder: '06 123 4567' },
  { code: 'CD', name: 'RDC', dialCode: '+243', flag: '🇨🇩', placeholder: '81 234 5678' },
];

export const PassengerForm = ({
  fullName, setFullName,
  phone, setPhone,
  email, setEmail
}: PassengerFormProps) => {
  const [selectedCountry, setSelectedCountry] = React.useState(AFRICAN_COUNTRIES[0]);
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
            <select
              value={selectedCountry.code}
              onChange={(e) => {
                const found = AFRICAN_COUNTRIES.find(c => c.code === e.target.value);
                if (found) setSelectedCountry(found);
              }}
              className="bg-surface-container px-2.5 py-2.5 rounded-l-xl font-label-md text-label-md font-semibold text-on-surface flex items-center border-r border-outline-variant/30 outline-none cursor-pointer hover:bg-slate-200 transition-colors"
              title="Choisir le pays"
              aria-label="Indicatif pays"
            >
              {AFRICAN_COUNTRIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.dialCode} ({c.name})
                </option>
              ))}
            </select>
            <input 
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-r-xl px-3 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none" 
              id="phone" 
              placeholder={selectedCountry.placeholder} 
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
