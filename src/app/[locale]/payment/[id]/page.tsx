'use client';
import React, { useState } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Input } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { ChevronLeft, Smartphone, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function PaymentPage() {
  const locale = useLocale();
  const [provider, setProvider] = useState<'mtn' | 'moov'>('mtn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const total = 12300; // Mock total

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-brand-blue">Paiement Réussi !</h1>
          <p className="text-gray-500">
            Votre réservation a été confirmée. Vous recevrez un SMS avec votre ticket électronique sous peu.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Trajet</span>
              <span className="font-semibold text-brand-darkGray">Cotonou - Parakou</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Montant payé</span>
              <span className="font-semibold text-brand-blue">{total.toLocaleString()} FCFA</span>
            </div>
          </div>
          <Link href={`/${locale}/search`} className="block w-full">
            <Button variant="primary" fullWidth>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-brand-blue pt-12 pb-6 px-4 md:px-12 text-white sticky top-0 z-40">
        <div className="flex items-center mb-2 max-w-lg mx-auto">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold ml-2">Paiement Mobile</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">Montant à payer</p>
          <p className="text-4xl font-bold text-brand-blue">{total.toLocaleString()} FCFA</p>
        </Card>

        <h2 className="text-lg font-bold text-brand-darkGray px-1">Choisissez votre réseau</h2>
        <div className="grid grid-cols-2 gap-4">
          <div 
            onClick={() => setProvider('mtn')}
            className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center transition ${
              provider === 'mtn' ? 'border-brand-yellow bg-brand-yellow/10' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="w-16 h-16 bg-yellow-400 rounded-full mb-2 flex items-center justify-center font-bold text-blue-900 text-lg">MTN</div>
            <span className="font-semibold text-brand-darkGray">MTN MoMo</span>
          </div>
          
          <div 
            onClick={() => setProvider('moov')}
            className={`cursor-pointer rounded-2xl border-2 p-4 flex flex-col items-center transition ${
              provider === 'moov' ? 'border-brand-blue bg-brand-blue/5' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="w-16 h-16 bg-blue-600 rounded-full mb-2 flex items-center justify-center font-bold text-white text-lg">MOOV</div>
            <span className="font-semibold text-brand-darkGray">Moov Money</span>
          </div>
        </div>

        <Card>
          <Input 
            label="Numéro de téléphone" 
            placeholder={`Ex: ${provider === 'mtn' ? '61' : '95'} 00 00 00`} 
            type="tel" 
            icon={<Smartphone className="w-5 h-5 text-gray-400" />}
          />
          <p className="text-xs text-gray-500 mt-4 text-center">
            Veuillez garder votre téléphone à proximité pour valider le paiement.
          </p>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:pl-64 z-50">
        <div className="max-w-lg mx-auto">
          <Button 
            size="lg" 
            fullWidth 
            className="bg-brand-yellow text-white hover:bg-brand-yellowHover font-bold text-lg h-14"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? 'Traitement en cours...' : 'Confirmer le paiement'}
          </Button>
        </div>
      </div>
    </div>
  );
}
