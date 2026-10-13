import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payment/service';
import { RefundRequest } from '@/lib/payment/types';

// POST /api/payments/refund — Remboursement de billets flexibles
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RefundRequest;
    const identifier = body.booking_reference || body.booking_id;

    if (!identifier) {
      return NextResponse.json(
        { error: 'Paramètre booking_reference ou booking_id obligatoire.' },
        { status: 400 }
      );
    }

    const result = await PaymentService.refundFlexibleBooking(
      identifier,
      body.reason || 'Annulation volontaire du passager'
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('API payments refund error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du traitement du remboursement.' },
      { status: 400 }
    );
  }
}
