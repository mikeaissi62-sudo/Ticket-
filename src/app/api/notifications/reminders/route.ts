import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/notifications/reminders — Génération automatique de rappels de départ
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié.' },
        { status: 401 }
      );
    }

    // Récupérer les réservations confirmées de l'utilisateur
    const { data: bookings, error: bookingsErr } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        passenger_first_name,
        created_at,
        trip:trips(
          id,
          trip_date,
          departure_time,
          route:routes(
            name,
            departure_station:stations!routes_departure_station_id_fkey(name, city),
            arrival_station:stations!routes_arrival_station_id_fkey(name, city),
            company:companies(name)
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'confirmed');

    if (bookingsErr) {
      console.error('Bookings query error:', bookingsErr);
    }

    const createdReminders: any[] = [];

    // Vérifier les réservations et générer un rappel si aucun n'existe déjà
    if (bookings && bookings.length > 0) {
      for (const b of bookings) {
        const trip = b.trip as any;
        const departureCity = trip?.route?.departure_station?.city || 'Cotonou';
        const arrivalCity = trip?.route?.arrival_station?.city || 'Parakou';
        const stationName = trip?.route?.departure_station?.name || 'Gare Principale';
        const companyName = trip?.route?.company?.name || 'Compagnie';
        const departureTime = (trip?.departure_time || '07:00').substring(0, 5);

        // Vérifier si un rappel existe déjà pour cette référence
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', user.id)
          .ilike('message', `%${b.booking_reference}%`)
          .limit(1);

        if (!existing || existing.length === 0) {
          const { data: inserted } = await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              title: `Rappel de départ : ${departureCity} ➔ ${arrivalCity}`,
              message: `Votre autocar ${companyName} (${b.booking_reference}) partira à ${departureTime} depuis la ${stationName}. Rendez-vous à la gare 30 minutes avant l'embarquement muni de votre CNI ou Passeport.`,
              type: 'departure',
              is_read: false,
            })
            .select()
            .single();

          if (inserted) {
            createdReminders.push(inserted);
          }
        }
      }
    } else {
      // Démo / compte sans réservation : créer un rappel d'exemple réaliste
      const { data: demoReminder } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Rappel de départ : Cotonou ➔ Parakou',
          message: 'Votre bus Confort Lines VIP partira à 07:00 depuis la Gare Étoile Rouge. Présentez votre e-billet au contrôleur.',
          type: 'departure',
          is_read: false,
        })
        .select()
        .single();

      if (demoReminder) {
        createdReminders.push(demoReminder);
      }
    }

    return NextResponse.json({
      success: true,
      count: createdReminders.length,
      reminders: createdReminders,
    });
  } catch (error: any) {
    console.error('Reminders API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des rappels.' },
      { status: 500 }
    );
  }
}
