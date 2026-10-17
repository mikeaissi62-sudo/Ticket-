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
          className={`payment-card p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
            paymentMethod === 'mtn' 
              ? 'bg-surface-container-low ring-1 ring-secondary' 
              : 'bg-surface-container-lowest hover:bg-surface-container-low shadow-sm'
          }`}
        >
          <div className="font-body-md text-body-md font-bold text-on-surface">MTN MoMo</div>
          <span className={`material-symbols-outlined text-[20px] payment-check transition-opacity ${paymentMethod === 'mtn' ? 'text-secondary' : 'opacity-20 text-outline-variant'}`}>
            check_circle
          </span>
        </div>

        <div 
          onClick={() => setPaymentMethod('moov')}
          className={`payment-card p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
            paymentMethod === 'moov' 
              ? 'bg-surface-container-low ring-1 ring-secondary' 
              : 'bg-surface-container-lowest hover:bg-surface-container-low shadow-sm'
          }`}
        >
          <div className="font-body-md text-body-md font-bold text-on-surface">Moov Money</div>
          <span className={`material-symbols-outlined text-[20px] payment-check transition-opacity ${paymentMethod === 'moov' ? 'text-secondary' : 'opacity-20 text-outline-variant'}`}>
            check_circle
          </span>
        </div>

        <div 
          onClick={() => setPaymentMethod('card')}
          className={`payment-card p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
            paymentMethod === 'card' 
              ? 'bg-surface-container-low ring-1 ring-secondary' 
              : 'bg-surface-container-lowest hover:bg-surface-container-low shadow-sm'
          }`}
        >
          <div className="font-body-md text-body-md font-bold text-on-surface">Carte Visa / MC</div>
          <span className={`material-symbols-outlined text-[20px] payment-check transition-opacity ${paymentMethod === 'card' ? 'text-secondary' : 'opacity-20 text-outline-variant'}`}>
            check_circle
          </span>
        </div>
        
      </div>
    </div>
  );
};
