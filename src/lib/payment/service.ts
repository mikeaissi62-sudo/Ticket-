import { createClient } from '@/lib/supabase/server';
import { MtnMoMoService } from './momo';
import { MoovMoneyService } from './moov';
import {
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  PaymentStatusResponse,
  RefundResponse,
  PaymentProvider,
} from './types';

export class PaymentService {
  /**
   * Initialise un paiement Mobile Money pour une réservation
   */
  public static async initiatePayment(
    req: PaymentInitiateRequest
  ): Promise<PaymentInitiateResponse> {
    const supabase = await createClient();

    // 1. Récupérer la réservation
    let booking: any = null;
    if (req.booking_id) {
      const { data } = await supabase
        .from('bookings')
        .select('*, trip:trips(*)')
        .or(`id.eq.${req.booking_id},booking_reference.eq.${req.booking_id}`)
        .limit(1);
      if (data && data.length > 0) {
        booking = data[0];
      }
    }

    const bookingRef =
      booking?.booking_reference ||
      (req as any).booking_reference ||
      (req.booking_id?.startsWith('TK-')
        ? req.booking_id
        : `TK-BEN-${Math.floor(100000 + Math.random() * 900000)}`);
    const amount = req.amount || (booking ? Number(booking.total_price) : 7500);
    let transactionId = '';
    let ussdPrompt = '';
    let instructions = '';

    // 2. Appel au prestataire selon le moyen de paiement
    if (req.provider === 'mtn_momo') {
      const res = await MtnMoMoService.requestToPay({
        amount,
        phone: req.phone,
        bookingRef,
      });
      transactionId = res.referenceId;
      ussdPrompt = res.ussdPrompt;
      instructions = 'Validez l’invite USSD sur votre écran MTN ou composez *460# avec votre code PIN.';
    } else if (req.provider === 'moov_money') {
      const res = await MoovMoneyService.requestPayment({
        amount,
        phone: req.phone,
        bookingRef,
        otp: req.otp,
      });
      transactionId = res.referenceId;
      ussdPrompt = res.ussdPrompt;
      instructions = 'Validez le message entrant Moov ou générez votre code OTP via *855#.';
    } else {
      transactionId = `CARD-${Date.now()}`;
      ussdPrompt = 'Paiement sécurisé par carte bancaire Visa/Mastercard.';
      instructions = 'Saisie 3D-Secure.';
    }

    // 3. Enregistrer ou mettre à jour la ligne dans la table payments si la réservation existe
    let paymentId = transactionId;
    if (booking?.id) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('booking_id', booking.id)
        .limit(1);

      if (existingPayment && existingPayment.length > 0) {
        paymentId = existingPayment[0].id;
        await supabase
          .from('payments')
          .update({
            provider: req.provider,
            transaction_id: transactionId,
            amount,
            status: 'pending',
            provider_response: { initiated_at: new Date().toISOString(), phone: req.phone },
          })
          .eq('id', paymentId);
      } else {
        const { data: newPayment, error: insertPayErr } = await supabase
          .from('payments')
          .insert({
            booking_id: booking.id,
            provider: req.provider,
            transaction_id: transactionId,
            amount,
            currency: 'XOF',
            status: 'pending',
            provider_response: { initiated_at: new Date().toISOString(), phone: req.phone },
          })
          .select()
          .single();

        if (insertPayErr) {
          console.error('Payment record insert error:', insertPayErr);
        }
        paymentId = newPayment?.id || transactionId;
      }
    }

    return {
      success: true,
      payment_id: paymentId,
      transaction_id: transactionId,
      booking_reference: bookingRef,
      provider: req.provider,
      status: 'pending',
      amount,
      phone: req.phone,
      ussd_prompt: ussdPrompt,
      instructions,
    };
  }

  /**
   * Confirme le paiement et émet le billet officiel Ticket+
   */
  public static async confirmPayment(
    paymentIdOrTransactionId: string,
    providerResponse?: Record<string, any>
  ): Promise<PaymentStatusResponse> {
    const supabase = await createClient();

    // Trouver le paiement
    const { data: payments } = await supabase
      .from('payments')
      .select('*, booking:bookings(*)')
      .or(`id.eq.${paymentIdOrTransactionId},transaction_id.eq.${paymentIdOrTransactionId}`)
      .limit(1);

    if (!payments || payments.length === 0) {
      throw new Error('Paiement introuvable.');
    }

    const payment = payments[0];
    const booking = payment.booking;

    // 1. Mettre à jour le paiement à 'success'
    await supabase
      .from('payments')
      .update({
        status: 'success',
        paid_at: new Date().toISOString(),
        provider_response: providerResponse || payment.provider_response || {},
      })
      .eq('id', payment.id);

    // 2. Mettre à jour la réservation à 'confirmed'
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id);

    // 3. Créer le billet officiel avec données QR Code
    const qrData = JSON.stringify({
      ref: booking.booking_reference,
      booking_id: booking.id,
      passenger: `${booking.passenger_first_name} ${booking.passenger_last_name}`,
      phone: booking.passenger_phone,
      amount: payment.amount,
      issued_at: new Date().toISOString(),
      platform: 'Ticket+ Bénin',
    });

    const { data: ticket } = await supabase
      .from('tickets')
      .insert({
        booking_id: booking.id,
        qr_code_data: qrData,
        is_used: false,
      })
      .select()
      .single();

    // 4. Créer la notification pour l'utilisateur
    if (booking.user_id) {
      await supabase.from('notifications').insert({
        user_id: booking.user_id,
        title: `Paiement validé (${booking.booking_reference})`,
        message: `Votre paiement de ${Number(payment.amount).toLocaleString('fr-FR')} FCFA par ${payment.provider.toUpperCase()} est confirmé. Votre billet officiel est prêt.`,
        type: 'booking',
        is_read: false,
      });
    }

    return {
      success: true,
      payment_id: payment.id,
      booking_id: booking.id,
      booking_reference: booking.booking_reference,
      provider: payment.provider,
      status: 'success',
      amount: payment.amount,
      paid_at: new Date().toISOString(),
      qr_code_data: qrData,
      ticket_id: ticket?.id,
    };
  }

  /**
   * Remboursement d'un billet flexible (Annulation et restitution Mobile Money)
   */
  public static async refundFlexibleBooking(
    bookingReferenceOrId: string,
    reason = 'Annulation demandée par le voyageur'
  ): Promise<RefundResponse> {
    const supabase = await createClient();

    // Récupérer la réservation
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, payment:payments(*), seat:seats(*)')
      .or(`id.eq.${bookingReferenceOrId},booking_reference.eq.${bookingReferenceOrId}`)
      .limit(1);

    if (!bookings || bookings.length === 0) {
      throw new Error('Réservation introuvable.');
    }

    const booking = bookings[0];

    // Vérifier l'éligibilité au remboursement (doit être confirmé et flexible)
    if (booking.status === 'cancelled') {
      throw new Error('Cette réservation a déjà été annulée.');
    }

    if (!booking.is_flexible) {
      throw new Error('Ce billet ne bénéficie pas de l’option Flexibilité Annulation.');
    }

    const totalPrice = Number(booking.total_price);
    const penaltyFee = 300; // Frais techniques fixes 300 FCFA conformément aux conditions Ticket+
    const refundAmount = Math.max(0, totalPrice - penaltyFee);

    const payment = booking.payment && booking.payment.length > 0 ? booking.payment[0] : null;
    const provider: PaymentProvider = payment?.provider || 'mtn_momo';

    // 1. Appel du remboursement Mobile Money
    let refundResult;
    if (provider === 'moov_money') {
      refundResult = await MoovMoneyService.refund({
        amount: refundAmount,
        phone: booking.passenger_phone,
        bookingRef: booking.booking_reference,
      });
    } else {
      refundResult = await MtnMoMoService.refund({
        amount: refundAmount,
        phone: booking.passenger_phone,
        bookingRef: booking.booking_reference,
      });
    }

    // 2. Mettre à jour la réservation à 'cancelled'
    await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id);

    // 3. Libérer le siège pour d'autres voyageurs
    if (booking.seat_id) {
      await supabase
        .from('seats')
        .update({ status: 'available' })
        .eq('id', booking.seat_id);
    }

    // 4. Mettre à jour le paiement à 'refunded'
    if (payment) {
      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          provider_response: {
            refunded_at: new Date().toISOString(),
            refund_amount: refundAmount,
            penalty_fee: penaltyFee,
            reason,
            refund_tx_id: refundResult.refundTransactionId,
          },
        })
        .eq('id', payment.id);
    }

    // 5. Notifier le voyageur
    if (booking.user_id) {
      await supabase.from('notifications').insert({
        user_id: booking.user_id,
        title: `Remboursement validé (${booking.booking_reference})`,
        message: `Votre billet flexible a été remboursé à hauteur de ${refundAmount.toLocaleString('fr-FR')} FCFA sur votre compte ${provider.toUpperCase()} (${booking.passenger_phone}).`,
        type: 'booking',
        is_read: false,
      });
    }

    return {
      success: true,
      booking_reference: booking.booking_reference,
      refund_amount: refundAmount,
      penalty_fee: penaltyFee,
      refunded_to: booking.passenger_phone,
      payment_status: 'refunded',
      booking_status: 'cancelled',
      message: `Remboursement de ${refundAmount.toLocaleString('fr-FR')} FCFA effectué avec succès sur le numéro ${booking.passenger_phone}.`,
    };
  }
}
