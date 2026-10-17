import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { sanitizePlainText, sanitizeBeninPhone } from '@/lib/security/sanitize';

// POST /api/bookings/record
// Enregistre et répertorie chaque billet acheté sur le site voyageur dans Supabase
// Accessible tant pour les utilisateurs connectés que les réservations express/invités
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      booking_reference,
      from = 'Cotonou',
      to = 'Parakou',
      company_name = 'Confort Lines',
      date = new Date().toISOString().split('T')[0],
      seat = '01',
      price = 7500,
      name = 'Voyageur',
      phone = '+229 01 00 00 00 00',
      payment_method = 'mtn',
    } = body;

    const admin = createAdminClient();

    // 1. Déterminer la référence de réservation unique
    const finalRef = booking_reference
      ? (booking_reference.startsWith('TK') ? booking_reference : `TKP-${booking_reference}`)
      : `TK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 2. Vérifier si cette réservation a déjà été répertoriée (idempotence)
    const { data: existingBooking } = await admin
      .from('bookings')
      .select('*, trip:trips(*)')
      .eq('booking_reference', finalRef)
      .limit(1);

    if (existingBooking && existingBooking.length > 0) {
      return NextResponse.json({
        success: true,
        already_recorded: true,
        booking: existingBooking[0],
      });
    }

    // 3. Déterminer l'utilisateur
    let userId: string | null = null;

    // A. Vérifier si une session utilisateur connecté existe
    try {
      const userSupabase = await createClient();
      const { data: { user } } = await userSupabase.auth.getUser();
      if (user?.id) {
        userId = user.id;
      }
    } catch {}

    // B. Si pas connecté, chercher par téléphone dans public.users
    const sanitizedPhone = sanitizeBeninPhone(phone);
    if (!userId && sanitizedPhone) {
      const { data: phoneUser } = await admin
        .from('users')
        .select('id')
        .or(`phone.eq.${sanitizedPhone},phone.eq.${phone}`)
        .limit(1);
      if (phoneUser && phoneUser.length > 0) {
        userId = phoneUser[0].id;
      }
    }

    // C. Si toujours introuvable, utiliser le compte invité officiel
    if (!userId) {
      const { data: guestUser } = await admin
        .from('users')
        .select('id')
        .eq('email', 'guest@ticketplus.bj')
        .limit(1);

      if (guestUser && guestUser.length > 0) {
        userId = guestUser[0].id;
      } else {
        // Fallback sur le premier utilisateur admin ou voyageur
        const { data: fallbackUser } = await admin.from('users').select('id').limit(1);
        userId = fallbackUser?.[0]?.id || null;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Impossible d’attribuer la réservation à un utilisateur.' },
        { status: 500 }
      );
    }

    // 4. Identifier la compagnie
    const { data: companies } = await admin.from('companies').select('id, name');
    const matchedComp =
      companies?.find(
        (c) =>
          company_name.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(company_name.toLowerCase())
      ) || companies?.[0];

    const companyId = matchedComp?.id;

    // 5. Identifier ou trouver la route
    const { data: routes } = await admin
      .from('routes')
      .select('id, name, company_id')
      .eq('company_id', companyId);

    const matchedRoute =
      routes?.find((r) => r.name.toLowerCase().includes(to.toLowerCase())) ||
      routes?.[0];

    if (!matchedRoute) {
      return NextResponse.json(
        { error: 'Ligne de transport introuvable pour cette compagnie.' },
        { status: 404 }
      );
    }

    // 6. Récupérer ou créer un schedule pour cette ligne
    let scheduleId: string | undefined;
    const { data: scheds } = await admin
      .from('schedules')
      .select('id, bus_id')
      .eq('route_id', matchedRoute.id)
      .limit(1);

    if (scheds && scheds.length > 0) {
      scheduleId = scheds[0].id;
    } else {
      const { data: newSched } = await admin
        .from('schedules')
        .insert({
          route_id: matchedRoute.id,
          departure_time: '07:00:00',
          days_of_week: [0, 1, 2, 3, 4, 5, 6],
          is_active: true,
        })
        .select()
        .single();
      scheduleId = newSched?.id;
    }

    // 7. Récupérer un autocar de la compagnie
    const { data: buses } = await admin
      .from('buses')
      .select('id')
      .eq('company_id', companyId)
      .limit(1);
    const busId = buses?.[0]?.id || scheds?.[0]?.bus_id;

    // 8. Récupérer ou créer le voyage (trip) pour cette date
    let tripId: string | undefined;
    const { data: existingTrip } = await admin
      .from('trips')
      .select('id')
      .eq('route_id', matchedRoute.id)
      .eq('trip_date', date)
      .limit(1);

    if (existingTrip && existingTrip.length > 0) {
      tripId = existingTrip[0].id;
    } else {
      const { data: newTrip, error: tripError } = await admin
        .from('trips')
        .insert({
          route_id: matchedRoute.id,
          schedule_id: scheduleId,
          bus_id: busId,
          trip_date: date,
          departure_time: '07:00:00',
          status: 'scheduled',
          available_seats: 40,
        })
        .select()
        .single();

      if (tripError) {
        console.error('Erreur création trip:', tripError);
      }
      tripId = newTrip?.id;
    }

    // 9. Récupérer ou créer le siège (seat)
    let seatId: string | undefined;
    const cleanSeat = String(seat).padStart(2, '0');
    const { data: existingSeat } = await admin
      .from('seats')
      .select('id')
      .eq('trip_id', tripId)
      .eq('seat_number', cleanSeat)
      .limit(1);

    if (existingSeat && existingSeat.length > 0) {
      seatId = existingSeat[0].id;
      // Marquer occupé
      await admin.from('seats').update({ status: 'occupied' }).eq('id', seatId);
    } else {
      const { data: newSeat } = await admin
        .from('seats')
        .insert({
          trip_id: tripId,
          seat_number: cleanSeat,
          status: 'occupied',
        })
        .select()
        .single();
      seatId = newSeat?.id;
    }

    // 10. Parser le nom du voyageur
    const cleanName = sanitizePlainText(name || 'Voyageur');
    const nameParts = cleanName.split(' ');
    const firstName = nameParts[0] || 'Voyageur';
    const lastName = nameParts.slice(1).join(' ') || '';
    const numPrice = Number(String(price).replace(/[^0-9]/g, '')) || 7500;

    // 11. Insérer la réservation dans la table bookings
    const { data: booking, error: bookingErr } = await admin
      .from('bookings')
      .insert({
        user_id: userId,
        trip_id: tripId,
        seat_id: seatId,
        passenger_first_name: firstName,
        passenger_last_name: lastName,
        passenger_phone: sanitizedPhone || phone,
        booking_reference: finalRef,
        total_price: numPrice,
        status: 'confirmed',
        has_baggage: false,
        is_flexible: true,
      })
      .select(`
        *,
        trip:trips (
          route:routes (
            name,
            company:companies (name)
          )
        )
      `)
      .single();

    if (bookingErr) {
      console.error('Erreur insertion booking:', bookingErr);
      return NextResponse.json(
        { error: 'Erreur lors de l’enregistrement de la réservation.', details: bookingErr },
        { status: 500 }
      );
    }

    // 12. Enregistrer le paiement associé dans payments
    const providerEnum = payment_method.includes('moov')
      ? 'moov_money'
      : payment_method.includes('card')
      ? 'card'
      : 'mtn_momo';

    await admin.from('payments').insert({
      booking_id: booking.id,
      amount: numPrice,
      provider: providerEnum,
      status: 'success',
      paid_at: new Date().toISOString(),
    });

    // 13. Enregistrer le billet dans tickets
    await admin.from('tickets').insert({
      booking_id: booking.id,
      qr_code_data: finalRef,
      is_used: false,
    });

    // 14. Créer la notification serveur
    await admin.from('notifications').insert({
      user_id: userId,
      title: `Billet émis avec succès (${finalRef})`,
      message: `Votre réservation pour ${matchedRoute.name} (${matchedComp?.name}) a été confirmée et synchronisée avec le portail d'administration Ticket+.`,
      type: 'booking',
      is_read: false,
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Billet répertorié avec succès dans le système central Ticket+.',
    });
  } catch (err: any) {
    console.error('Erreur API record booking:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur serveur lors de l’enregistrement.' },
      { status: 500 }
    );
  }
}
