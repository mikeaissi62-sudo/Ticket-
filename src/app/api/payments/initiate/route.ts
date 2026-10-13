import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment/service';
import { PaymentInitiateRequest } from '@/lib/payment/types';
import { initiatePaymentSchema } from '@/lib/validations/payment';
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/security/rateLimit';
import { sanitizeBeninPhone, sanitizePlainText } from '@/lib/security/sanitize';

// POST /api/payments/initiate — Initialisation d'un paiement Mobile Money sécurisé
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting strict sur l'initiation de paiement (5 req / min)
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`pay:${clientIp}`, RateLimitPresets.PAYMENT_INITIATE);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Trop de tentatives de paiement. Veuillez patienter ${rateLimit.reset} secondes avant de réessayer.` },
        { status: 429 }
      );
    }

    const raw = await request.json();
    const normalizedInput = {
      booking_id: raw.booking_id || raw.booking_reference,
      booking_reference: raw.booking_reference || raw.booking_id,
      provider: raw.provider,
      phone: sanitizeBeninPhone(raw.phone || raw.phone_number),
      amount: raw.amount ? Number(raw.amount) : undefined,
      otp: raw.otp ? String(raw.otp).trim() : undefined,
    };

    // 2. Validation stricte avec schéma Zod
    const validation = initiatePaymentSchema.safeParse(normalizedInput);
    if (!validation.success) {
      const firstError = validation.error.issues?.[0]?.message || 'Données de paiement non conformes.';
      return NextResponse.json(
        { error: firstError, details: validation.error.format() },
        { status: 400 }
      );
    }

    const validData = validation.data;

    const payload: PaymentInitiateRequest = {
      booking_id: sanitizePlainText(validData.booking_id),
      provider: validData.provider,
      phone: validData.phone,
      amount: validData.amount,
      otp: validData.otp,
    };

    // 3. Appel du service de paiement
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
