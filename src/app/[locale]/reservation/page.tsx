"use client";

import React, { useState } from 'react';
import { SeatSelection } from '@/components/traveler/booking/SeatSelection';
import { JourneySummary } from '@/components/traveler/booking/JourneySummary';
import { PassengerForm } from '@/components/traveler/booking/PassengerForm';
import { BookingOptions } from '@/components/traveler/booking/BookingOptions';
import { PaymentSection } from '@/components/traveler/booking/PaymentSection';
import { PriceSummary } from '@/components/traveler/booking/PriceSummary';
import { BookingAssistance } from '@/components/traveler/booking/BookingAssistance';
import Link from 'next/link';

export default function BookingPage({ params: { locale } }: { params: { locale: string } }) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>("12");
  const [extraLuggage, setExtraLuggage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mtn');
  const [fullName, setFullName] = useState("Koffi Christian DOSSOU");
  const [phone, setPhone] = useState("01 64 28 90");
  const [email, setEmail] = useState("koffi.dossou@gmail.com");

  const basePrice = 6500;
  const extraLuggagePrice = extraLuggage ? 1000 : 0;
  const totalPrice = basePrice + extraLuggagePrice;

  return (
    <main className="w-full pt-20 min-h-screen bg-background" style={{ background: 'linear-gradient(135deg, rgb(212, 223, 238) 0%, rgb(223, 232, 244) 50%, rgb(216, 227, 240) 100%)' }}>
      <div className="flex flex-col w-full">
        <div className="max-w-[1140px] mx-auto px-4 md:px-6 w-full py-space-md sm:py-space-lg">
          
          {/* Breadcrumb / Top Bar */}
          <div className="mb-space-lg flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md sm:p-space-lg rounded-xl shadow-md">
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
                3. Paiement & Billet
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
            
            {/* Colonne de gauche (Sièges) */}
            <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg flex flex-col shadow-md">
              <SeatSelection 
                selectedSeat={selectedSeat} 
                setSelectedSeat={setSelectedSeat} 
              />
            </section>

            {/* Colonne de droite (Infos & Formulaire) */}
            <section className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-md sm:p-space-lg flex flex-col gap-space-lg shadow-md">
              <JourneySummary />
              
              <PassengerForm 
                fullName={fullName} setFullName={setFullName}
                phone={phone} setPhone={setPhone}
                email={email} setEmail={setEmail}
              />
              
              <BookingOptions 
                extraLuggage={extraLuggage}
                setExtraLuggage={setExtraLuggage}
              />
              
              <PaymentSection 
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
              
              <PriceSummary 
                selectedSeat={selectedSeat}
                basePrice={basePrice}
                extraLuggage={extraLuggage}
                extraLuggagePrice={extraLuggagePrice}
                totalPrice={totalPrice}
                locale={locale}
              />
            </section>
            
          </div>

          <BookingAssistance />

        </div>
      </div>
    </main>
  );
}
