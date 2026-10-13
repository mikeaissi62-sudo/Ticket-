import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment/service';
import { PaymentInitiateRequest } from '@/lib/payment/types';

// POST /api/payments/initiate — Initialisation d'un paiement Mobile Money
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const phone = raw.phone || raw.phone_number;
    const booking_id = raw.booking_id || raw.booking_reference;
    const provider = raw.provider;

    if (!booking_id || !provider || !phone) {
      return NextResponse.json(
        { error: 'Les paramètres réservation, moyen de paiement et téléphone sont obligatoires.' },
        { status: 400 }
      );
    }

    const payload: PaymentInitiateRequest = {
      booking_id,
      provider,
      phone,
      amount: raw.amount,
      otp: raw.otp,
    };

    const result = await PaymentService.initiatePayment(payload);
    return NextResponse.json(
      {
        ...result,
        payment: {
          id: result.payment_id,
          transaction_id: result.transaction_id,
          amount: result.amount,
          status: result.status,
          provider: result.provider,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('API payments initiate error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l’initialisation du paiement.' },
      { status: 500 }
    );
  }
}
