import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/bookings — Créer une réservation
export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json();
    const {
      trip_id,
      seat_id,
      passenger_first_name,
      passenger_last_name,
      passenger_phone,
      has_baggage = false,
      is_flexible = false,
      total_price,
    } = body;

    // Validation
    if (!trip_id || !seat_id || !passenger_first_name || !passenger_last_name || !passenger_phone || !total_price) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis.' },
        { status: 400 }
      );
    }

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
        passenger_first_name,
        passenger_last_name,
        passenger_phone,
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
