'use client';
import React, { useState } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { ChevronLeft, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function BookingPage() {
  const params = useParams();
  const locale = useLocale();
  const tripId = params.id;
  const [flexibility, setFlexibility] = useState(false);

  const basePrice = 12000;
  const flexPrice = 300;
  const total = basePrice + (flexibility ? flexPrice : 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-brand-blue pt-12 pb-6 px-4 md:px-12 text-white sticky top-0 z-40">
        <div className="flex items-center mb-2 max-w-2xl mx-auto">
          <Link href={`/${locale}/seat/${tripId}`} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold ml-2">Informations Passager</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <Card>
          <h2 className="text-lg font-bold text-brand-darkGray mb-4">Détails du passager (Siège 14)</h2>
          <div className="space-y-4">
            <Input label="Nom complet" placeholder="Ex: Jean Dupont" />
            <Input label="Numéro de téléphone" placeholder="Ex: +229 90 00 00 00" type="tel" />
            <Input label="Email (Optionnel)" placeholder="Ex: jean.dupont@email.com" type="email" />
          </div>
        </Card>

        <Card className={`border-2 transition-colors ${flexibility ? 'border-brand-yellow bg-brand-yellow/5' : 'border-gray-200'}`}>
          <div className="flex items-start space-x-4">
            <div className="pt-1">
              <input 
                type="checkbox" 
                id="flexibility" 
                checked={flexibility}
                onChange={(e) => setFlexibility(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-brand-yellow focus:ring-brand-yellow"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="flexibility" className="flex items-center text-lg font-bold text-brand-darkGray cursor-pointer">
                <ShieldCheck className="w-5 h-5 mr-2 text-brand-blue" />
                Option Flexibilité (+300 FCFA)
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Annulation et remboursement possibles jusqu'à 2h avant le départ avec une retenue minimale.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:pl-64 z-50">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total à payer</p>
            <p className="text-2xl font-bold text-brand-blue">{total.toLocaleString()} FCFA</p>
          </div>
          <Link href={`/${locale}/payment/${tripId}`}>
            <Button size="lg" className="px-8 bg-brand-yellow text-white hover:bg-brand-yellowHover font-bold">
              Payer
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
