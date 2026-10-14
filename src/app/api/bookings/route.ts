import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createBookingSchema } from '@/lib/validations/booking';
import { sanitizePlainText, sanitizeBeninPhone } from '@/lib/security/sanitize';
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/security/rateLimit';

// POST /api/bookings — Créer une réservation
export async function POST(request: NextRequest) {
  try {
    // 0. Protection contre le brute-force / spam
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`booking:${clientIp}`, RateLimitPresets.PUBLIC_API);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Trop de requêtes. Veuillez patienter ${rateLimit.reset} secondes.` },
        { status: 429 }
      );
    }

    const supabase = await createClient();

    // Vérifier l'authentification
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour réserver.' },
        { status: 401 }
      );
    }

    const rawBody = await request.json();
    const validation = createBookingSchema.safeParse(rawBody);

    if (!validation.success) {
      const firstError = validation.error.issues?.[0]?.message || 'Données de réservation invalides.';
      return NextResponse.json(
        { error: firstError, details: validation.error.format() },
        { status: 400 }
      );
    }

    const {
      trip_id,
      seat_id,
      passenger_first_name,
      passenger_last_name,
      passenger_phone,
      has_baggage = false,
      is_flexible = false,
      total_price,
    } = validation.data;

    const sanitizedFirstName = sanitizePlainText(passenger_first_name);
    const sanitizedLastName = sanitizePlainText(passenger_last_name);
    const sanitizedPhone = sanitizeBeninPhone(passenger_phone);

    // Vérifier que le siège est disponible
    const { data: seat, error: seatError } = await supabase
      .from('seats')
      .select('status')
      .eq('id', seat_id)
      .single();

    if (seatError || !seat) {
      return NextResponse.json(
        { error: 'Siège introuvable.' },
        { status: 404 }
      );
    }

    if (seat.status !== 'available') {
      return NextResponse.json(
        { error: 'Ce siège n\'est plus disponible. Veuillez en choisir un autre.' },
        { status: 409 }
      );
    }

    // Créer la réservation (le trigger SQL génère automatiquement booking_reference)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        trip_id,
        seat_id,
        passenger_first_name: sanitizedFirstName,
        passenger_last_name: sanitizedLastName,
        passenger_phone: sanitizedPhone,
        has_baggage,
        is_flexible,
        total_price,
        status: 'pending',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Erreur lors de la création de la réservation.' },
        { status: 500 }
      );
    }

    // Marquer le siège comme réservé
    const { error: updateSeatError } = await supabase
      .from('seats')
      .update({ status: 'reserved' })
      .eq('id', seat_id);

    if (updateSeatError) {
      console.error('Seat update error:', updateSeatError);
      // Rollback booking if seat update fails
      await supabase.from('bookings').delete().eq('id', booking.id);
      return NextResponse.json(
        { error: 'Erreur lors de la réservation du siège.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err) {
    console.error('API bookings error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}

// GET /api/bookings — Lister les réservations de l'utilisateur connecté
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté.' },
        { status: 401 }
      );
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trip:trips(
          *,
          route:routes(
            *,
            company:companies(*),
            departure_station:stations!routes_departure_station_id_fkey(*),
            arrival_station:stations!routes_arrival_station_id_fkey(*)
          ),
          bus:buses(*)
        ),
        seat:seats(*),
        payment:payments(*),
        ticket:tickets(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Bookings fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (err) {
    console.error('API bookings GET error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings — Supprimer un billet de l'historique
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ref = searchParams.get('ref') || searchParams.get('reference');

    if (!id && !ref) {
      return NextResponse.json(
        { error: 'ID ou référence de réservation requis.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Si utilisateur connecté, supprimer ou archiver dans la BDD
    if (user) {
      let query = supabase.from('bookings').delete().eq('user_id', user.id);
      if (id) {
        query = query.eq('id', id);
      } else if (ref) {
        query = query.eq('booking_reference', ref);
      }
      await query;
    }

    return NextResponse.json({ success: true, message: 'Billet supprimé de l’historique.' });
  } catch (err: any) {
    console.error('API bookings DELETE error:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de la suppression.' },
      { status: 500 }
    );
  }
}
