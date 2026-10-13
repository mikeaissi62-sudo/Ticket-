import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PaymentService } from '@/lib/payment/service';

// GET /api/payments/[id]/status — Vérification du statut de la transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = params.id;
    const { searchParams } = new URL(request.url);
    const confirmNow = searchParams.get('confirm') === 'true';

    const supabase = await createClient();

    // Chercher le paiement par id, transaction_id ou booking_id
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*, booking:bookings(*)')
      .or(`id.eq.${paymentId},transaction_id.eq.${paymentId},booking_id.eq.${paymentId}`)
      .limit(1);

    if (error || !payments || payments.length === 0) {
      return NextResponse.json({
        success: true,
        payment_id: paymentId,
        booking_id: paymentId,
        booking_reference: `TK-${paymentId.slice(0, 8).toUpperCase()}`,
        provider: paymentId.toLowerCase().includes('moov') ? 'moov_money' : 'mtn_momo',
        status: confirmNow ? 'success' : 'pending',
        amount: 7500,
        paid_at: confirmNow ? new Date().toISOString() : undefined,
        qr_code_data: `TICKETPLUS:${paymentId}`,
        message: confirmNow
          ? 'Paiement simulé validé avec succès.'
          : 'En attente de validation USSD / saisie du code PIN par le client.',
      });
    }

    const payment = payments[0];
    const booking = payment.booking;

    // Si déjà validé
    if (payment.status === 'success') {
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*')
        .eq('booking_id', booking.id)
        .single();

      return NextResponse.json({
        success: true,
        payment_id: payment.id,
        booking_id: booking.id,
        booking_reference: booking.booking_reference,
        provider: payment.provider,
        status: 'success',
        amount: payment.amount,
        paid_at: payment.paid_at,
        qr_code_data: ticket?.qr_code_data,
        ticket_id: ticket?.id,
      });
    }

    // Si confirmation explicite (simulateur ou validation USSD reçue)
    if (confirmNow) {
      const confirmed = await PaymentService.confirmPayment(payment.id, {
        confirmed_by: 'client_ussd_validation',
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json(confirmed);
    }

    // Sinon toujours en attente USSD
    return NextResponse.json({
      success: true,
      payment_id: payment.id,
      booking_id: booking.id,
      booking_reference: booking.booking_reference,
      provider: payment.provider,
      status: payment.status,
      amount: payment.amount,
      message: 'En attente de validation USSD / saisie du code PIN par le client.',
    });
  } catch (err: any) {
    console.error('API payments status error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la vérification du paiement.' },
      { status: 500 }
    );
  }
}
