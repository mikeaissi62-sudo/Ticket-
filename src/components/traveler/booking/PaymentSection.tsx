import React from 'react';

interface PaymentSectionProps {
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export const PaymentSection = ({
  paymentMethod,
  setPaymentMethod
}: PaymentSectionProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-space-sm">
        <span className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-label-sm flex items-center justify-center">3</span>
        <h3 className="font-title-md text-title-md font-bold text-on-surface">Mode de Paiement Sécurisé</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm" id="payment-selector">
        
        <div 
          onClick={() => setPaymentMethod('mtn')}
          className={`payment-card p-space-sm rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
            paymentMethod === 'mtn' 
              ? 'bg-surface-container-low' 
              : 'bg-surface-container-lowest hover:bg-surface-container-low shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full ${paymentMethod === 'mtn' ? 'bg-secondary-container text-on-secondary-container' : 'text-outline'}`}>
              {paymentMethod === 'mtn' ? 'Direct' : 'Bénin'}
            </span>
            <span className={`material-symbols-outlined text-[18px] payment-check transition-opacity ${paymentMethod === 'mtn' ? 'text-secondary' : 'opacity-0 text-outline-variant'}`}>
              check_circle
            </span>
          </div>
          <div className="font-body-md text-body-md font-bold text-on-surface">MTN MoMo</div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Paiement instantané USSD</span>
        </div>

        <div 
          onClick={() => setPaymentMethod('moov')}
          className={`payment-card p-space-sm rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
            paymentMethod === 'moov' 
              ? 'bg-surface-container-low' 
              : 'bg-surface-container-lowest hover:bg-surface-container-low shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full ${paymentMethod === 'moov' ? 'bg-secondary-container text-on-secondary-container' : 'text-outline'}`}>
              {paymentMethod === 'moov' ? 'Direct' : 'Bénin'}
            </span>
            <span className={`material-symbols-outlined text-[18px] payment-check transition-opacity ${paymentMethod === 'moov' ? 'text-secondary' : 'opacity-0 text-outline-variant'}`}>
              check_circle
            </span>
          </div>
          <div className="font-body-md text-body-md font-semibold text-on-surface">Moov Money</div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Code de validation OTP</span>
        </div>

        <div 
          onClick={() => setPaymentMethod('card')}
          className={`payment-card p-space-sm rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
            paymentMethod === 'card' 
              ? 'bg-surface-container-low' 
              : 'bg-surface-container-lowest hover:bg-surface-container-low shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`font-label-sm text-label-sm font-bold px-2 py-0.5 rounded-full ${paymentMethod === 'card' ? 'bg-secondary-container text-on-secondary-container' : 'text-outline'}`}>
              {paymentMethod === 'card' ? 'Direct' : 'International'}
            </span>
            <span className={`material-symbols-outlined text-[18px] payment-check transition-opacity ${paymentMethod === 'card' ? 'text-secondary' : 'opacity-0 text-outline-variant'}`}>
              check_circle
            </span>
          </div>
          <div className="font-body-md text-body-md font-semibold text-on-surface">Carte Visa / MC</div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Paiement 3D-Secure</span>
        </div>
        
      </div>
    </div>
  );
};
