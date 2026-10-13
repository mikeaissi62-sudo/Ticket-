import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment/service';
import { refundPaymentSchema } from '@/lib/validations/payment';
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/security/rateLimit';
import { sanitizePlainText } from '@/lib/security/sanitize';

// POST /api/payments/refund — Remboursement sécurisé de billets flexibles
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`refund:${clientIp}`, RateLimitPresets.PAYMENT_INITIATE);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Trop de requêtes. Veuillez patienter ${rateLimit.reset} secondes.` },
        { status: 429 }
      );
    }

    const raw = await request.json();

    // 2. Validation Zod
    const validation = refundPaymentSchema.safeParse(raw);
    if (!validation.success) {
      const firstError = validation.error.issues?.[0]?.message || 'Données de remboursement invalides.';
      return NextResponse.json(
        { error: firstError, details: validation.error.format() },
        { status: 400 }
      );
    }

    const { booking_reference, booking_id, reason } = validation.data;
    const identifier = sanitizePlainText(booking_reference || booking_id || '');
    const cleanReason = sanitizePlainText(reason || 'Annulation volontaire du passager');

    if (!identifier) {
      return NextResponse.json(
        { error: 'Paramètre booking_reference ou booking_id obligatoire.' },
        { status: 400 }
      );
    }

    const result = await PaymentService.refundFlexibleBooking(identifier, cleanReason);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('API payments refund error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement du remboursement.' },
      { status: 400 }
    );
  }
}
