import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/trips?from=Cotonou&to=Parakou&date=2026-10-05&passengers=1
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const date = searchParams.get('date');
  const passengers = parseInt(searchParams.get('passengers') || '1');

  if (!from || !to || !date) {
    return NextResponse.json(
      { error: 'Les paramètres from, to et date sont requis.' },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // Query trips with route and company details
    const { data: trips, error } = await supabase
      .from('trips')
      .select(`
        *,
        route:routes!inner(
          *,
          company:companies!inner(*),
          departure_station:stations!routes_departure_station_id_fkey(*),
          arrival_station:stations!routes_arrival_station_id_fkey(*)
        ),
        bus:buses(*)
      `)
      .eq('trip_date', date)
      .gte('available_seats', passengers)
      .eq('status', 'scheduled')
      .order('departure_time', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter by city names (case-insensitive)
    const filtered = trips?.filter((trip) => {
      const depCity = trip.route?.departure_station?.city?.toLowerCase();
      const arrCity = trip.route?.arrival_station?.city?.toLowerCase();
      return depCity === from.toLowerCase() && arrCity === to.toLowerCase();
    }) || [];

    return NextResponse.json({ trips: filtered, count: filtered.length });
  } catch (err) {
    console.error('API trips error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}
