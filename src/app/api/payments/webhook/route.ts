import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PaymentService } from '@/lib/payment/service';

// POST /api/payments/webhook — Réception des webhooks MTN MoMo & Moov Money
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = Object.fromEntries(new URLSearchParams(rawBody));
    }

    console.log('Mobile Money Webhook received:', JSON.stringify(payload));

    // Extraction des champs standards MTN MoMo / Moov Money / FedaPay
    const referenceId =
      payload.referenceId ||
      payload.externalId ||
      payload.transaction_id ||
      payload.reference ||
      payload.id;

    const status = (payload.status || payload.event || '').toUpperCase();

    if (!referenceId) {
      return NextResponse.json(
        { error: 'Identifiant de référence manquant.' },
        { status: 400 }
      );
    }

    // Traitement du statut
    if (status === 'SUCCESSFUL' || status === 'SUCCESS' || status === 'TRANSACTION.SUCCESS') {
      try {
        await PaymentService.confirmPayment(referenceId, payload);
        return NextResponse.json({ received: true, status: 'confirmed' });
      } catch (err: any) {
        console.error('Webhook confirmation error:', err);
        return NextResponse.json({ received: true, error: err.message }, { status: 200 });
      }
    }

    if (status === 'FAILED' || status === 'REJECTED' || status === 'TIMEOUT') {
      const supabase = await createClient();
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          provider_response: payload,
        })
        .or(`id.eq.${referenceId},transaction_id.eq.${referenceId}`);

      return NextResponse.json({ received: true, status: 'failed' });
    }

    return NextResponse.json({ received: true, status: 'acknowledged' });
  } catch (error: any) {
    console.error('Webhook handling error:', error);
    return NextResponse.json(
      { error: 'Erreur interne de traitement du webhook.' },
      { status: 500 }
    );
  }
}
