'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBookingStore } from '@/stores/bookingStore';
import { COMPANIES, STATIONS } from '@/lib/mock-data';
import { useLocale } from 'next-intl';

export default function BookingPage() {
  const params = useParams();
  const locale = useLocale();
  const router = useRouter();
  const tripId = params.id;
  
  const { selectedTrip, setPassengerInfo, setExtras, setPaymentMethod: setStorePaymentMethod, selectSeats } = useBookingStore();
  
  const [selectedSeat, setSelectedSeat] = useState<string>("12");
  const [extraLuggage, setExtraLuggage] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("mtn");

  React.useEffect(() => {
    if (!selectedTrip) {
      router.push(`/${locale}/resultats`);
    }
  }, [selectedTrip, router, locale]);

  React.useEffect(() => {
    if (selectedTrip) {
      const disabledSeats = selectedTrip.disabledSeats.map(s => s.toString().padStart(2, '0'));
      if (disabledSeats.includes(selectedSeat)) {
        const allSeats = Array.from({length: 32}, (_, i) => (i + 1).toString().padStart(2, '0'));
        const firstFree = allSeats.find(s => !disabledSeats.includes(s));
        if (firstFree) setSelectedSeat(firstFree);
      }
    }
  }, [selectedTrip, selectedSeat]);

  if (!selectedTrip) {
    return <div className="p-8 text-center text-on-surface">Redirection vers les résultats...</div>;
  }

  const company = COMPANIES.find(c => c.id === selectedTrip.companyId) || COMPANIES[0];
  const companyName = company.name;
  const carName = `Autocar ${companyName}`;
  const bannerImg = "/images/bus-banner.jpg";
  
  const disabledSeats = selectedTrip.disabledSeats.map(s => s.toString().padStart(2, '0'));

  const from = STATIONS.find(s => s.id === selectedTrip.departureStationId)?.city || 'Cotonou';
  const to = STATIONS.find(s => s.id === selectedTrip.arrivalStationId)?.city || 'Parakou';
  const dateParam = selectedTrip.date;

  const basePrice = selectedTrip.price;
  const extraLuggagePrice = extraLuggage ? 1000 : 0;
  const totalPrice = basePrice + extraLuggagePrice;
  
  const handleSeatClick = (seat: string) => {
    setSelectedSeat(seat);
  };
  
  const handlePaymentSubmit = () => {
    const nameEl = document.getElementById('fullName') as HTMLInputElement;
    const phoneEl = document.getElementById('phone') as HTMLInputElement;
    const emailEl = document.getElementById('email') as HTMLInputElement;
    
    setPassengerInfo({
      firstName: nameEl?.value.split(' ')[0] || 'Voyageur',
      lastName: nameEl?.value.split(' ').slice(1).join(' ') || '',
      phone: phoneEl?.value || '',
      idType: 'cni'
    });
    
    setExtras(extraLuggage, true);
    setStorePaymentMethod(paymentMethod);
    selectSeats([parseInt(selectedSeat, 10)]);

    const confirmParams = new URLSearchParams({
      from,
      to,
      date: dateParam,
      seat: selectedSeat,
      payment: paymentMethod,
      price: totalPrice.toString(),
      name: nameEl?.value || 'Voyageur',
      phone: phoneEl?.value || '',
      company: companyName
    }).toString();
    router.push(`/${locale}/reservation/confirmation?${confirmParams}`);
  };

  const getSeatLabel = (seat: string) => {
    const seatNum = parseInt(seat, 10);
    const rowNum = Math.ceil(seatNum / 4);
    const isWindow = (seatNum % 4 === 1 || seatNum % 4 === 0);
    return `Siège N° ${seat} (${isWindow ? 'Fenêtre' : 'Couloir'}, Rangée ${rowNum})`;
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1140px] mx-auto px-gutter w-full py-space-md sm:py-space-lg">
        <div className="mb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-sm md:shadow-md">
          <div className="flex items-center gap-space-xs sm:gap-space-sm text-label-sm font-label-sm">
            <span className="inline-flex items-center gap-1 text-secondary font-semibold">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              1. Recherche
            </span>
            <span className="text-outline-variant font-medium">/</span>
            <span className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
              2. Choix du Siège
            </span>
            <span className="text-outline-variant font-medium">/</span>
            <span className="text-outline font-normal">
              3. Paiement &amp; Billet
            </span>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-auto">
            <div className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-lg text-label-sm font-label-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[15px] text-secondary">verified_user</span>
              <span>Réservation garantie en temps réel</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 bg-secondary-container/40 px-2.5 py-1.5 rounded-lg text-label-sm font-label-sm text-on-secondary-container font-semibold">
              <span className="material-symbols-outlined text-[15px]">timer</span>
              <span>14:52 restants</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg lg:gap-space-xl items-start">
          <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg flex flex-col shadow-md">
            <div className="flex items-start justify-between mb-space-sm pb-space-sm">
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold mb-1">
                  <span>{carName}</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Configuration Sièges</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Sélectionnez votre emplacement à bord</p>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider font-semibold">Choisi</span>
                <span className="inline-flex items-center justify-center font-headline-sm text-headline-sm font-bold text-secondary bg-secondary-container/40 px-2.5 py-0.5 rounded-lg">#{selectedSeat}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-space-sm rounded-lg mb-space-md font-label-sm text-label-sm">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-3.5 h-3.5 rounded bg-surface-container-lowest shadow-sm"></span>
                <span className="text-on-surface-variant">Libre</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-3.5 h-3.5 rounded bg-secondary text-on-secondary flex items-center justify-center text-[9px] font-bold">✓</span>
                <span className="text-on-surface font-semibold">Sélectionné</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center">
                <span className="w-3.5 h-3.5 rounded bg-surface-container-high text-outline flex items-center justify-center text-[10px]">
                  <span className="material-symbols-outlined text-[10px]">lock</span>
                </span>
                <span className="text-outline">Occupé</span>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col items-center">
              <div className="w-full max-w-[310px] bg-surface-container-lowest rounded-t-[36px] rounded-b-2xl p-space-md shadow-sm relative">
                <div className="w-full pb-space-md mb-space-md flex items-center justify-between px-2">
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[18px] text-secondary">sensor_door</span>
                    <span>Entrée passagers</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low px-2 py-1 rounded-md">
                    <span className="material-symbols-outlined text-[18px]">sports_motorsports</span>
                    <span>Poste Chauffeur</span>
                  </div>
                </div>
                
                <div className="text-center font-label-sm text-label-sm text-outline uppercase tracking-wider mb-2">
                  Avant de l'autocar
                </div>
                
                <div className="space-y-2.5 font-label-md text-label-md">
                  {/* Rows Generation */}
                  {[
                    { row: 1, seats: ["01", "02", "03", "04"] },
                    { row: 2, seats: ["05", "06", "07", "08"] },
                    { row: 3, seats: ["09", "10", "11", "12"] },
                    { row: 4, seats: ["13", "14", "15", "16"] },
                    { row: 5, seats: ["17", "18", "19", "20"] },
                    { row: 6, seats: ["21", "22", "23", "24"] },
                    { row: 7, seats: ["25", "26", "27", "28"] },
                  ].map((r) => (
                    <div key={r.row} className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {r.seats.slice(0, 2).map((seat) => (
                          <button
                            key={seat}
                            disabled={disabledSeats.includes(seat)}
                            onClick={() => handleSeatClick(seat)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              disabledSeats.includes(seat) 
                                ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                                : selectedSeat === seat 
                                  ? 'bg-secondary text-on-secondary shadow-md font-bold' 
                                  : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-sm font-semibold'
                            }`}
                            type="button"
                          >
                            {disabledSeats.includes(seat) ? <span className="material-symbols-outlined text-[14px]">lock</span> : seat}
                          </button>
                        ))}
                      </div>
                      <div className={`w-6 text-center font-label-sm text-label-sm ${
                        ['09','10','11','12'].some(s => selectedSeat === s) && r.row === 3 
                        || ['13','14','15','16'].some(s => selectedSeat === s) && r.row === 4 
                        || ['17','18','19','20'].some(s => selectedSeat === s) && r.row === 5 
                        || ['21','22','23','24'].some(s => selectedSeat === s) && r.row === 6
                        || ['25','26','27','28'].some(s => selectedSeat === s) && r.row === 7
                        || ['01','02','03','04'].some(s => selectedSeat === s) && r.row === 1
                        || ['05','06','07','08'].some(s => selectedSeat === s) && r.row === 2
                        ? 'text-secondary font-bold' : 'text-outline-variant'
                      }`}>
                        R{r.row}
                      </div>
                      <div className="flex gap-2">
                        {r.seats.slice(2, 4).map((seat) => (
                          <button
                            key={seat}
                            disabled={disabledSeats.includes(seat)}
                            onClick={() => handleSeatClick(seat)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              disabledSeats.includes(seat) 
                                ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                                : selectedSeat === seat 
                                  ? 'bg-secondary text-on-secondary shadow-md font-bold' 
                                  : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-sm font-semibold'
                            }`}
                            type="button"
                          >
                            {disabledSeats.includes(seat) ? <span className="material-symbols-outlined text-[14px]">lock</span> : seat}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Row 8 */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-2">
                      {["29", "30"].map((seat) => (
                        <button
                          key={seat}
                          disabled={disabledSeats.includes(seat)}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            disabledSeats.includes(seat)
                              ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                              : selectedSeat === seat 
                                ? 'bg-secondary text-on-secondary shadow-md font-bold' 
                                : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-sm font-semibold'
                          }`}
                          type="button"
                        >
                          {disabledSeats.includes(seat) ? <span className="material-symbols-outlined text-[14px]">lock</span> : seat}
                        </button>
                      ))}
                    </div>
                    <div className="w-6 text-center text-outline-variant font-label-sm text-label-sm">R8</div>
                    <div className="flex gap-2">
                      {["31", "32"].map((seat) => (
                        <button
                          key={seat}
                          disabled={disabledSeats.includes(seat)}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            disabledSeats.includes(seat)
                              ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                              : selectedSeat === seat 
                                ? 'bg-secondary text-on-secondary shadow-md font-bold' 
                                : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-sm font-semibold'
                          }`}
                          type="button"
                        >
                          {disabledSeats.includes(seat) ? <span className="material-symbols-outlined text-[14px]">lock</span> : seat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-center font-label-sm text-label-sm text-outline uppercase tracking-wider mt-3">
                  Arrière de l'autocar
                </div>
              </div>
            </div>
            
            <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-[18px]">airline_seat_recline_extra</span>
              </div>
              <div className="flex-1">
                <div className="font-label-md text-label-md font-semibold text-on-surface">
                  {getSeatLabel(selectedSeat)}
                </div>
                <div className="font-label-sm text-label-sm text-on-surface-variant">Prise USB dédiée • Climatisation individuelle • Repose-pieds</div>
              </div>
            </div>
            
            <div className="mt-space-md overflow-hidden rounded-xl relative shadow-sm">
              <img className="w-full h-32 object-cover" alt="A modern luxury Scania touring bus" src={bannerImg} />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent flex items-end p-3">
                <div className="text-on-primary">
                  <span className="font-label-sm text-label-sm block opacity-80">Véhicule assigné</span>
                  <span className="font-label-md text-label-md font-semibold">{companyName} • Wi-Fi 4G à bord</span>
                </div>
              </div>
            </div>
          </section>
          
          <section className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg flex flex-col gap-space-lg shadow-md">
            <div className="bg-surface-container-low p-space-md rounded-xl">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-outline-variant/30">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span className="font-label-md text-label-md font-bold uppercase tracking-wider text-on-surface">{companyName}</span>
                </div>
                <span className="font-label-sm text-label-sm bg-secondary-container px-2.5 py-0.5 rounded-full text-on-secondary-container font-semibold">Confirmé</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center">
                <div className="md:col-span-5">
                  <div className="font-headline-md text-headline-md font-bold text-on-surface">{selectedTrip.departureTime}</div>
                  <div className="font-body-md text-body-md font-semibold text-on-surface">{from}</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                    {STATIONS.find(s => s.id === selectedTrip.departureStationId)?.name || 'Gare'}
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col items-center justify-center my-1 md:my-0">
                  <span className="font-label-sm text-label-sm text-outline font-medium">{selectedTrip.duration}</span>
                  <div className="w-full flex items-center justify-center gap-1 my-1">
                    <div className="h-0.5 bg-outline-variant w-full"></div>
                    <span className="material-symbols-outlined text-[16px] text-secondary">directions_bus</span>
                    <div className="h-0.5 bg-outline-variant w-full"></div>
                  </div>
                  <span className="font-label-sm text-[10px] text-secondary font-semibold">Direct</span>
                </div>
                <div className="md:col-span-5 md:text-right">
                  <div className="font-headline-md text-headline-md font-bold text-on-surface">{selectedTrip.arrivalTime}</div>
                  <div className="font-body-md text-body-md font-semibold text-on-surface">{to}</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center md:justify-end gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px] text-secondary">pin_drop</span>
                    Terminus {companyName.split(" ")[0]}
                  </div>
                </div>
              </div>
            </div>
            
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
                    <input className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-xl pl-10 pr-4 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none border border-transparent focus:border-outline-variant" id="fullName" placeholder="Ex: BIO TCHANE Koffi" type="text" defaultValue="Koffi Christian DOSSOU" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="phone">Téléphone WhatsApp &amp; SMS *</label>
                  <div className="relative flex">
                    <div className="bg-surface-container px-3 py-2.5 rounded-l-xl font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5 border-r border-outline-variant/30">
                      <span>🇧🇯</span>
                      <span>+229</span>
                    </div>
                    <input className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-r-xl px-3 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none border border-transparent focus:border-outline-variant" id="phone" placeholder="01 54 65 89 07" type="tel" defaultValue="01 64 28 90" />
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary block mt-1">Billet électronique instantané et alertes de départ envoyés ici</span>
                </div>
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="email">Adresse e-mail <span className="text-on-surface-variant font-normal">(Facultatif)</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-on-surface-variant">mail</span>
                    <input className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-xl pl-10 pr-4 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none border border-transparent focus:border-outline-variant" id="email" placeholder="voyageur@example.bj" type="email" defaultValue="koffi.dossou@gmail.com" />
                  </div>
                  <span className="font-label-sm text-label-sm text-outline block mt-1">Pour recevoir votre reçu fiscal et facture PDF</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-space-sm">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-label-sm flex items-center justify-center">2</span>
                <h3 className="font-title-md text-title-md font-bold text-on-surface">Bagages &amp; Options de Route</h3>
              </div>
              <div className="space-y-space-sm">
                <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[20px]">luggage</span>
                    </div>
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">Bagage standard en soute</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">1 valise (jusqu'à 25 kg) + 1 sac à dos cabine</div>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md font-bold text-secondary bg-secondary-container/50 px-2.5 py-1 rounded-full">Inclus</span>
                </div>
                
                <label className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low cursor-pointer hover:bg-surface-container transition-colors">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
                      <span className="material-symbols-outlined text-[20px]">add_box</span>
                    </div>
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">Option bagage additionnel (+20 kg)</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Idéal pour colis volumineux ou marchandises autorisées</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-label-md font-bold text-on-surface">+1 000 FCFA</span>
                    <input 
                      className="w-4 h-4 rounded text-secondary focus:ring-0 cursor-pointer" 
                      id="extra-luggage-toggle" 
                      type="checkbox"
                      checked={extraLuggage}
                      onChange={(e) => setExtraLuggage(e.target.checked)}
                    />
                  </div>
                </label>
                
                {/* Option Flexibilité ajoutée tel que demandé par l'utilisateur */}
                <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[20px]">event_available</span>
                    </div>
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">Flexibilité Annulation</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Annulation et remboursement (frais: 300 FCFA) jusqu'à 2 jours avant le départ</div>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md font-bold text-secondary bg-secondary-container/50 px-2.5 py-1 rounded-full">Inclus</span>
                </div>
                
                <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                    </div>
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">Assurance corporelle voyageur</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Couverture collision et rapatriement partenaire béninois</div>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md font-bold text-secondary bg-secondary-container/50 px-2.5 py-1 rounded-full">Offerte</span>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-space-sm">
                <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-label-sm flex items-center justify-center">3</span>
                <h3 className="font-title-md text-title-md font-bold text-on-surface">Mode de Paiement Sécurisé</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm" id="payment-selector">
                <div 
                  onClick={() => setPaymentMethod("mtn")}
                  className={`payment-card p-space-sm rounded-xl cursor-pointer transition-all flex flex-col justify-between ${paymentMethod === 'mtn' ? 'bg-surface-container-low ring-1 ring-secondary' : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-low'}`} 
                  data-payment="mtn"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">Direct</span>
                    <span className={`material-symbols-outlined text-[18px] transition-opacity ${paymentMethod === 'mtn' ? 'text-secondary' : 'text-outline-variant opacity-0'}`}>check_circle</span>
                  </div>
                  <div className="font-body-md text-body-md font-bold text-on-surface">MTN MoMo</div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Paiement instantané USSD</span>
                </div>
                
                <div 
                  onClick={() => setPaymentMethod("moov")}
                  className={`payment-card p-space-sm rounded-xl cursor-pointer transition-all flex flex-col justify-between ${paymentMethod === 'moov' ? 'bg-surface-container-low ring-1 ring-secondary' : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-low'}`} 
                  data-payment="moov"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-label-sm text-outline">Bénin</span>
                    <span className={`material-symbols-outlined text-[18px] transition-opacity ${paymentMethod === 'moov' ? 'text-secondary' : 'text-outline-variant opacity-0'}`}>check_circle</span>
                  </div>
                  <div className="font-body-md text-body-md font-semibold text-on-surface">Moov Money</div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Code de validation OTP</span>
                </div>
                
                <div 
                  onClick={() => setPaymentMethod("card")}
                  className={`payment-card p-space-sm rounded-xl cursor-pointer transition-all flex flex-col justify-between ${paymentMethod === 'card' ? 'bg-surface-container-low ring-1 ring-secondary' : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-low'}`} 
                  data-payment="card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-label-sm text-outline">International</span>
                    <span className={`material-symbols-outlined text-[18px] transition-opacity ${paymentMethod === 'card' ? 'text-secondary' : 'text-outline-variant opacity-0'}`}>check_circle</span>
                  </div>
                  <div className="font-body-md text-body-md font-semibold text-on-surface">Carte Visa / MC</div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Paiement 3D-Secure</span>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-space-md rounded-xl space-y-space-xs">
              <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                <span>Billet {companyName} (Siège <strong>#{selectedSeat}</strong>)</span>
                <span className="font-medium text-on-surface">{basePrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
              {extraLuggage && (
                <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                  <span>Bagage supplémentaire (+20 kg)</span>
                  <span className="font-medium text-on-surface">1 000 FCFA</span>
                </div>
              )}
              <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                <span>Frais de réservation &amp; SMS</span>
                <span className="font-medium text-secondary">0 FCFA (Gratuit)</span>
              </div>
              <div className="pt-space-sm flex items-center justify-between border-t border-outline-variant/30 mt-2">
                <span className="font-title-md text-title-md font-bold text-on-surface">Montant Total à Payer</span>
                <span className="font-headline-md text-headline-md font-bold text-on-surface">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>
            
            <div className="space-y-space-sm">
              <button 
                onClick={handlePaymentSubmit}
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-3.5 px-space-md rounded-xl font-body-lg text-body-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99]" 
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span>Confirmer et Payer ({totalPrice.toLocaleString('fr-FR')} FCFA)</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
              <div className="flex items-start gap-2 bg-surface-container-low p-space-sm rounded-lg text-label-sm font-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">verified</span>
                <div>
                  <strong>Garantie Ticket+ et Annulation Flexible :</strong> Annulation et remboursement à 100% sans frais jusqu'à 2 jours avant le départ. Service client WhatsApp actif 24h/7j.
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <div className="mt-space-xl p-space-md bg-surface-container-lowest rounded-xl flex flex-col md:flex-row items-center justify-between gap-space-md shadow-md">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-[26px]">headset_mic</span>
            </div>
            <div>
              <div className="font-title-md text-title-md font-bold text-on-surface">Une question sur ce départ ?</div>
              <div className="font-body-md text-body-md text-on-surface-variant">L'équipe d'embarquement Ticket+ Cotonou est joignable directement par téléphone.</div>
            </div>
          </div>
          <div className="flex items-center gap-space-sm w-full md:w-auto">
            <a className="w-full md:w-auto px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold text-center transition-colors" href="#">
              Voir la politique bagages
            </a>
            <a className="w-full md:w-auto px-space-md py-2.5 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md font-semibold text-center transition-colors shadow-sm" href="https://wa.me/2290154658907">
              +229 01 54 65 89 07
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
