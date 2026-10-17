'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBookingStore } from '@/stores/bookingStore';
import { useLocale } from 'next-intl';

interface SeatData {
  id: string;
  seat_number: number;
  status: 'available' | 'reserved' | 'sold';
}

const AFRICAN_COUNTRIES = [
  { code: 'BJ', name: 'Bénin', dialCode: '+229', flag: '🇧🇯', digits: 10, placeholder: '01 54 65 89 07' },
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
];

export default function BookingPage() {
  const params = useParams();
  const locale = useLocale();
  const router = useRouter();
  const tripId = params.id as string;
  
  const { selectedTrip, setPassengerInfo, setExtras, setPaymentMethod: setStorePaymentMethod, selectSeats } = useBookingStore();
  
  const [selectedSeat, setSelectedSeat] = useState<string>("01");
  const [selectedCountry, setSelectedCountry] = useState(AFRICAN_COUNTRIES[0]);
  const [extraLuggage, setExtraLuggage] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("mtn");
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if no trip selected
  useEffect(() => {
    if (!selectedTrip) {
      router.push(`/${locale}/resultats`);
    }
  }, [selectedTrip, router, locale]);

  // Fetch seats from Supabase API
  const fetchSeats = useCallback(async () => {
    if (!tripId || tripId.startsWith('sched-')) {
      // Schedule-based trips don't have real seats in DB yet
      setIsLoadingSeats(false);
      return;
    }
    try {
      setIsLoadingSeats(true);
      const res = await fetch(`/api/trips/${tripId}/seats`);
      if (res.ok) {
        const data = await res.json();
        if (data.seats && data.seats.length > 0) {
          setSeats(data.seats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch seats:', err);
    } finally {
      setIsLoadingSeats(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  // Compute disabled seats from Supabase or fallback
  const disabledSeatNumbers: string[] = React.useMemo(() => {
    if (seats.length > 0) {
      return seats
        .filter(s => s.status !== 'available')
        .map(s => s.seat_number.toString().padStart(2, '0'));
    }
    // Fallback for schedule-based trips
    const disabledList = Array.isArray(selectedTrip?.disabledSeats) ? selectedTrip!.disabledSeats : [2, 5, 12, 19, 23];
    return disabledList.map((s: any) => s.toString().padStart(2, '0'));
  }, [seats, selectedTrip]);

  // Auto-select first free seat
  useEffect(() => {
    if (disabledSeatNumbers.includes(selectedSeat)) {
      const allSeats = Array.from({length: 32}, (_, i) => (i + 1).toString().padStart(2, '0'));
      const firstFree = allSeats.find(s => !disabledSeatNumbers.includes(s));
      if (firstFree) setSelectedSeat(firstFree);
    }
  }, [disabledSeatNumbers, selectedSeat]);

  const [momoSession, setMomoSession] = useState<{
    paymentId: string;
    provider: 'mtn_momo' | 'moov_money';
    amount: number;
    phone: string;
    bookingRef: string;
    confirmUrlParams: string;
    countdown: number;
    status: 'waiting_ussd' | 'confirming' | 'success' | 'failed';
    errorMessage?: string;
    otpInput?: string;
  } | null>(null);

  // Polling for Mobile Money transaction status and timer countdown
  useEffect(() => {
    if (!momoSession || momoSession.status === 'success' || momoSession.status === 'failed') return;

    // Countdown interval
    const timer = setInterval(() => {
      setMomoSession((prev) => {
        if (!prev) return null;
        if (prev.countdown <= 1) {
          clearInterval(timer);
          return {
            ...prev,
            countdown: 0,
            status: 'failed',
            errorMessage: 'Délai d’attente USSD expiré (60s). Veuillez relancer le paiement.',
          };
        }
        return { ...prev, countdown: prev.countdown - 1 };
      });
    }, 1000);

    // Polling interval
    const poller = setInterval(async () => {
      if (!momoSession.paymentId) return;
      try {
        const res = await fetch(`/api/payments/${momoSession.paymentId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            clearInterval(timer);
            clearInterval(poller);
            setMomoSession((prev) => prev ? { ...prev, status: 'success' } : null);
            setTimeout(() => {
              router.push(`/${locale}/reservation/confirmation?${momoSession.confirmUrlParams}`);
            }, 1200);
          } else if (data.status === 'failed') {
            clearInterval(timer);
            clearInterval(poller);
            setMomoSession((prev) => prev ? {
              ...prev,
              status: 'failed',
              errorMessage: data.errorMessage || 'Le paiement mobile a échoué ou a été refusé.',
            } : null);
          }
        }
      } catch (err) {
        console.error('Erreur vérification paiement:', err);
      }
    }, 3000);

    return () => {
      clearInterval(timer);
      clearInterval(poller);
    };
  }, [momoSession, router, locale]);

  if (!selectedTrip) {
    return <div className="p-8 text-center text-on-surface">Redirection vers les résultats...</div>;
  }

  const companyName = selectedTrip.companyName || 'Compagnie Partenaire';
  const carName = `Autocar ${companyName}`;
  const bannerImg = "/images/bus-banner.jpg";

  const from = selectedTrip.from || 'Cotonou';
  const to = selectedTrip.to || 'Parakou';
  const dateParam = selectedTrip.date || new Date().toISOString().split('T')[0];

  const basePrice = selectedTrip.price;
  const extraLuggagePrice = extraLuggage ? 1000 : 0;
  const totalPrice = basePrice + extraLuggagePrice;
  


  const handleManualConfirmPayment = async (otpCode?: string) => {
    if (!momoSession) return;
    setMomoSession((prev) => prev ? { ...prev, status: 'confirming' } : null);
    try {
      const url = `/api/payments/${momoSession.paymentId}/status?confirm=true${otpCode ? `&otp=${encodeURIComponent(otpCode)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && (data.status === 'success' || data.success)) {
        setMomoSession((prev) => prev ? { ...prev, status: 'success' } : null);
        setTimeout(() => {
          router.push(`/${locale}/reservation/confirmation?${momoSession.confirmUrlParams}&status=success`);
        }, 1500);
      } else {
        setMomoSession((prev) => prev ? { ...prev, status: 'failed', errorMessage: data.error || 'Validation impossible.' } : null);
      }
    } catch {
      setMomoSession((prev) => prev ? { ...prev, status: 'failed', errorMessage: 'Erreur réseau lors de la validation.' } : null);
    }
  };

  const handleSeatClick = (seat: string) => {
    setSelectedSeat(seat);
  };
  
  const handlePaymentSubmit = async () => {
    const nameEl = document.getElementById('fullName') as HTMLInputElement;
    const phoneEl = document.getElementById('phone') as HTMLInputElement;
    const emailEl = document.getElementById('email') as HTMLInputElement;
    
    const fullName = nameEl?.value.trim() || '';
    const phone = phoneEl?.value.trim() || '';
    const email = emailEl?.value.trim() || '';

    if (!fullName) {
      alert('Veuillez renseigner votre nom complet.');
      nameEl?.focus();
      return;
    }

    if (!phone || phone.length < 6) {
      alert('Veuillez renseigner un numéro de téléphone valide.');
      phoneEl?.focus();
      return;
    }

    const fullPhone = `${selectedCountry.dialCode} ${phone}`;
    const firstName = fullName.split(' ')[0] || 'Voyageur';
    const lastName = fullName.split(' ').slice(1).join(' ') || '';

    setPassengerInfo({ firstName, lastName, phone: fullPhone, idType: 'cni' });
    setExtras(extraLuggage, true);
    setStorePaymentMethod(paymentMethod);
    selectSeats([parseInt(selectedSeat, 10)]);

    setIsSubmitting(true);

    let bookingId: string = '';
    let bookingRef: string = `TK-BEN-${Math.floor(100000 + Math.random() * 900000)}`;

    // Try to create booking via Supabase API if real trip
    if (!tripId.startsWith('sched-') && seats.length > 0) {
      try {
        const seatObj = seats.find(s => s.seat_number === parseInt(selectedSeat, 10));
        if (seatObj) {
          const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trip_id: tripId,
              seat_id: seatObj.id,
              passenger_first_name: firstName,
              passenger_last_name: lastName,
              passenger_phone: phone,
              has_baggage: extraLuggage,
              is_flexible: true,
              total_price: totalPrice,
            }),
          });
          const data = await res.json();
          if (res.ok && data.booking) {
            bookingId = data.booking.id;
            bookingRef = data.booking.booking_reference || bookingRef;
          }
        }
      } catch (err) {
        console.error('Booking submission error:', err);
      }
    }

    const confirmParams = new URLSearchParams({
      from, to, date: dateParam, seat: selectedSeat,
      payment: paymentMethod, price: totalPrice.toString(),
      name: fullName, phone, company: companyName, ref: bookingRef,
    }).toString();

    // If payment is Mobile Money (MTN MoMo or Moov Money), initiate payment and show USSD prompt
    if (paymentMethod === 'mtn' || paymentMethod === 'moov') {
      try {
        const initRes = await fetch('/api/payments/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking_id: bookingId || undefined,
            booking_reference: bookingRef,
            amount: totalPrice,
            provider: paymentMethod === 'mtn' ? 'mtn_momo' : 'moov_money',
            phone: phone,
            phone_number: phone,
            passenger_name: fullName,
            passenger_email: email || undefined,
          }),
        });

        const initData = await initRes.json();
        setIsSubmitting(false);

        const paymentId = initData.payment?.id || initData.payment_id;
        if (initRes.ok && paymentId) {
          setMomoSession({
            paymentId,
            provider: paymentMethod === 'mtn' ? 'mtn_momo' : 'moov_money',
            amount: totalPrice,
            phone,
            bookingRef,
            confirmUrlParams: confirmParams,
            countdown: 60,
            status: 'waiting_ussd',
          });
          return;
        } else {
          console.warn('Initiate returned error or fallback:', initData.error);
        }
      } catch (err) {
        console.error('Payment initiation error:', err);
      }
    }

    setIsSubmitting(false);

    // Fallback: direct confirmation redirect for card or offline flow
    router.push(`/${locale}/reservation/confirmation?${confirmParams}&status=success`);
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
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {isLoadingSeats ? 'Chargement des places disponibles...' : 'Sélectionnez votre emplacement à bord'}
                </p>
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
                  Avant de l&apos;autocar
                </div>
                
                <div className="space-y-2.5 font-label-md text-label-md">
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
                            disabled={disabledSeatNumbers.includes(seat)}
                            onClick={() => handleSeatClick(seat)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              disabledSeatNumbers.includes(seat) 
                                ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                                : selectedSeat === seat 
                                  ? 'bg-secondary text-on-secondary shadow-md font-bold' 
                                  : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-sm font-semibold'
                            }`}
                            type="button"
                          >
                            {disabledSeatNumbers.includes(seat) ? <span className="material-symbols-outlined text-[14px]">lock</span> : seat}
                          </button>
                        ))}
                      </div>
                      <div className={`w-6 text-center font-label-sm text-label-sm ${
                        r.seats.some(s => selectedSeat === s) ? 'text-secondary font-bold' : 'text-outline-variant'
                      }`}>
                        R{r.row}
                      </div>
                      <div className="flex gap-2">
                        {r.seats.slice(2, 4).map((seat) => (
                          <button
                            key={seat}
                            disabled={disabledSeatNumbers.includes(seat)}
                            onClick={() => handleSeatClick(seat)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                              disabledSeatNumbers.includes(seat) 
                                ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                                : selectedSeat === seat 
                                  ? 'bg-secondary text-on-secondary shadow-md font-bold' 
                                  : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-sm font-semibold'
                            }`}
                            type="button"
                          >
                            {disabledSeatNumbers.includes(seat) ? <span className="material-symbols-outlined text-[14px]">lock</span> : seat}
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
                          disabled={disabledSeatNumbers.includes(seat)}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            disabledSeatNumbers.includes(seat)
                              ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                              : selectedSeat === seat 
                                ? 'bg-secondary text-on-secondary shadow-md font-bold' 
                                : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-sm font-semibold'
                          }`}
                          type="button"
                        >
                          {disabledSeatNumbers.includes(seat) ? <span className="material-symbols-outlined text-[14px]">lock</span> : seat}
                        </button>
                      ))}
                    </div>
                    <div className="w-6 text-center text-outline-variant font-label-sm text-label-sm">R8</div>
                    <div className="flex gap-2">
                      {["31", "32"].map((seat) => (
                        <button
                          key={seat}
                          disabled={disabledSeatNumbers.includes(seat)}
                          onClick={() => handleSeatClick(seat)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                            disabledSeatNumbers.includes(seat)
                              ? 'bg-surface-container-high text-outline cursor-not-allowed' 
                              : selectedSeat === seat 
                                ? 'bg-secondary text-on-secondary shadow-md font-bold' 
                                : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface shadow-sm font-semibold'
                          }`}
                          type="button"
                        >
                          {disabledSeatNumbers.includes(seat) ? <span className="material-symbols-outlined text-[14px]">lock</span> : seat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-center font-label-sm text-label-sm text-outline uppercase tracking-wider mt-3">
                  Arrière de l&apos;autocar
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
                    {selectedTrip.departureStation || `Gare ${from}`}
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
                    {selectedTrip.arrivalStation || `Terminus ${companyName.split(" ")[0]}`}
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
                  <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="fullName">Nom complet (selon pièce d&apos;identité) *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-on-surface-variant">badge</span>
                    <input className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-xl pl-10 pr-4 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none border border-transparent focus:border-outline-variant" id="fullName" placeholder="Ex: BIO TCHANE Koffi" type="text" defaultValue="Koffi Christian DOSSOU" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="phone">Téléphone WhatsApp &amp; SMS *</label>
                  <div className="relative flex">
                    <select
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const found = AFRICAN_COUNTRIES.find(c => c.code === e.target.value);
                        if (found) setSelectedCountry(found);
                      }}
                      className="w-24 sm:w-28 shrink-0 bg-surface-container px-2 py-2.5 rounded-l-xl font-label-md text-label-md font-bold text-on-surface flex items-center border-r border-outline-variant/30 outline-none cursor-pointer hover:bg-slate-200 transition-colors text-xs"
                      title="Choisir le pays"
                      aria-label="Indicatif pays"
                    >
                      {AFRICAN_COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.dialCode}
                        </option>
                      ))}
                    </select>
                    <input className="flex-1 w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-r-xl px-3.5 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none border border-transparent focus:border-outline-variant" id="phone" placeholder={selectedCountry.placeholder} type="tel" defaultValue="01 64 28 90" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block font-label-md text-label-md font-semibold text-on-surface" htmlFor="email">Adresse e-mail <span className="text-on-surface-variant font-normal">(Facultatif)</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-on-surface-variant">mail</span>
                    <input className="w-full bg-surface-container-low focus:bg-surface-container-lowest rounded-xl pl-10 pr-4 py-2.5 font-body-md text-body-md text-on-surface transition-all outline-none border border-transparent focus:border-outline-variant" id="email" placeholder="voyageur@example.bj" type="email" defaultValue="koffi.dossou@gmail.com" />
                  </div>
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
                      <div className="font-label-sm text-label-sm text-on-surface-variant">1 valise (jusqu&apos;à 25 kg) + 1 sac à dos cabine</div>
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
                
                <div className="flex items-center justify-between p-space-sm rounded-xl bg-surface-container-low">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined text-[20px]">event_available</span>
                    </div>
                    <div>
                      <div className="font-body-md text-body-md font-semibold text-on-surface">Flexibilité Annulation</div>
                      <div className="font-label-sm text-label-sm text-on-surface-variant">Annulation et remboursement (frais: 300 FCFA) jusqu&apos;à 2 jours avant le départ</div>
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
                  className={`payment-card p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'mtn' ? 'bg-surface-container-low ring-1 ring-secondary' : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-low'}`} 
                  data-payment="mtn"
                >
                  <div className="font-body-md text-body-md font-bold text-on-surface">MTN MoMo</div>
                  <span className={`material-symbols-outlined text-[20px] transition-opacity ${paymentMethod === 'mtn' ? 'text-secondary' : 'text-outline-variant opacity-20'}`}>check_circle</span>
                </div>
                
                <div 
                  onClick={() => setPaymentMethod("moov")}
                  className={`payment-card p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'moov' ? 'bg-surface-container-low ring-1 ring-secondary' : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-low'}`} 
                  data-payment="moov"
                >
                  <div className="font-body-md text-body-md font-bold text-on-surface">Moov Money</div>
                  <span className={`material-symbols-outlined text-[20px] transition-opacity ${paymentMethod === 'moov' ? 'text-secondary' : 'text-outline-variant opacity-20'}`}>check_circle</span>
                </div>
                
                <div 
                  onClick={() => setPaymentMethod("card")}
                  className={`payment-card p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${paymentMethod === 'card' ? 'bg-surface-container-low ring-1 ring-secondary' : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-low'}`} 
                  data-payment="card"
                >
                  <div className="font-body-md text-body-md font-bold text-on-surface">Carte Visa / MC</div>
                  <span className={`material-symbols-outlined text-[20px] transition-opacity ${paymentMethod === 'card' ? 'text-secondary' : 'text-outline-variant opacity-20'}`}>check_circle</span>
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
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary-container text-on-primary py-3.5 px-space-md rounded-xl font-body-lg text-body-lg font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed" 
                type="button"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                    <span>Confirmer et Payer ({totalPrice.toLocaleString('fr-FR')} FCFA)</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
              <div className="flex items-start gap-2 bg-surface-container-low p-space-sm rounded-lg text-label-sm font-label-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary mt-0.5">verified</span>
                <div>
                  <strong>Garantie Ticket+ et Annulation Flexible :</strong> Annulation et remboursement à 100% sans frais jusqu&apos;à 2 jours avant le départ. Service client WhatsApp actif 24h/7j.
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
              <div className="font-body-md text-body-md text-on-surface-variant">L&apos;équipe d&apos;embarquement Ticket+ Cotonou est joignable directement par téléphone.</div>
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

      {/* Mobile Money USSD / OTP Prompt Modal */}
      {momoSession && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            if (momoSession.status !== 'confirming' && momoSession.status !== 'success') {
              if (confirm('Voulez-vous annuler l’attente de paiement Mobile Money ?')) {
                setMomoSession(null);
              }
            }
          }}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Operator Header Bar */}
            <div className={`-mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-5 mb-5 flex items-center justify-between ${
              momoSession.provider === 'mtn_momo' 
                ? 'bg-[#FFCC00] text-black' 
                : 'bg-[#005CA9] text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-[18px]">
                  {momoSession.provider === 'mtn_momo' ? 'M' : 'Flooz'}
                </div>
                <div>
                  <h4 className="font-extrabold text-[16px] leading-tight">
                    {momoSession.provider === 'mtn_momo' ? 'MTN MoMo Bénin' : 'Moov Money Bénin'}
                  </h4>
                  <p className="text-[12px] opacity-85 font-medium">
                    Paiement sécurisé par USSD Push
                  </p>
                </div>
              </div>
              <span className="font-mono text-[14px] font-bold px-3 py-1 rounded-full bg-white/25 backdrop-blur-sm">
                {momoSession.countdown}s
              </span>
            </div>

            {momoSession.status === 'success' ? (
              <div className="py-6 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[36px]">check_circle</span>
                </div>
                <h3 className="text-[20px] font-black text-[#0F172A] mb-1">
                  Paiement Validé avec Succès !
                </h3>
                <p className="text-[14px] text-slate-600 mb-2">
                  Votre transaction de <strong>{momoSession.amount.toLocaleString('fr-FR')} FCFA</strong> est confirmée.
                </p>
                <p className="text-[12px] text-slate-400">
                  Génération de votre billet en cours...
                </p>
              </div>
            ) : momoSession.status === 'failed' ? (
              <div className="py-4 text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[30px]">error</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#0F172A] mb-1">
                  Paiement non finalisé
                </h3>
                <p className="text-[13px] text-slate-600 mb-5">
                  {momoSession.errorMessage || 'La transaction n’a pas pu être validée dans les délais impartis.'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMomoSession(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[13px] transition-all"
                  >
                    Changer de moyen
                  </button>
                  <button
                    onClick={() => handleManualConfirmPayment()}
                    className="flex-1 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-[13px] transition-all"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Active Phone & USSD instructions */}
                <div className="text-center mb-5">
                  <div className="relative inline-flex items-center justify-center mb-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined text-[32px] animate-pulse">phonelink_ring</span>
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                    </span>
                  </div>

                  <h3 className="text-[18px] font-extrabold text-[#0F172A] mb-1">
                    Invitation USSD envoyée
                  </h3>
                  <p className="text-[13px] text-slate-600">
                    au numéro <strong className="text-[#0F172A]">{momoSession.phone}</strong>
                  </p>
                </div>

                {/* Step guide */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 mb-5 text-[12px] text-slate-700">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                    <span>Consultez l’écran de votre téléphone portable.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                    <span>
                      {momoSession.provider === 'mtn_momo' ? (
                        <>Composez votre <strong>code secret MTN MoMo</strong> pour autoriser le prélèvement de <strong>{momoSession.amount.toLocaleString('fr-FR')} FCFA</strong>.</>
                      ) : (
                        <>Validez la demande <strong>Moov Money (*855#)</strong> avec votre code secret pour autoriser <strong>{momoSession.amount.toLocaleString('fr-FR')} FCFA</strong>.</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Cette fenêtre se validera automatiquement dès confirmation du réseau.</span>
                  </div>
                </div>

                {/* Optional OTP input for Moov Money */}
                {momoSession.provider === 'moov_money' && (
                  <div className="mb-4">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Code d&apos;autorisation Moov OTP (Optionnel)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: 123456"
                        maxLength={8}
                        value={momoSession.otpInput || ''}
                        onChange={(e) => setMomoSession((prev) => prev ? { ...prev, otpInput: e.target.value } : null)}
                        className="flex-1 px-3 py-2 text-[13px] bg-slate-100 rounded-xl border border-slate-200 outline-none focus:border-[#005CA9]"
                      />
                      <button
                        type="button"
                        onClick={() => handleManualConfirmPayment(momoSession.otpInput)}
                        className="px-4 py-2 bg-[#005CA9] text-white text-[12px] font-bold rounded-xl hover:bg-[#004A87] transition-all"
                      >
                        Valider OTP
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={momoSession.status === 'confirming'}
                    onClick={() => handleManualConfirmPayment()}
                    className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-60"
                  >
                    {momoSession.status === 'confirming' ? (
                      <>
                        <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        <span>Vérification réseau...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>J&apos;ai validé sur mon téléphone</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMomoSession(null)}
                    className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-700 text-[12px] font-semibold transition-colors"
                  >
                    Annuler et choisir un autre moyen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
