import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/trips?from=Cotonou&to=Parakou&date=2026-10-12&passengers=1
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

    // 1. D'abord, chercher les voyages réels planifiés dans la table trips
    const { data: trips, error: tripsError } = await supabase
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
      .eq('route.company.is_active', true)
      .order('departure_time', { ascending: true });

    if (tripsError) {
      console.error('Supabase trips query error:', tripsError);
    }

    // Filtrer par ville de départ et d'arrivée
    const filteredTrips = trips?.filter((trip) => {
      const depCity = trip.route?.departure_station?.city?.toLowerCase();
      const arrCity = trip.route?.arrival_station?.city?.toLowerCase();
      return depCity === from.toLowerCase() && arrCity === to.toLowerCase();
    }) || [];

    if (filteredTrips.length > 0) {
      const formatted = filteredTrips.map(t => {
        const depTime = (t.departure_time || '07:00').substring(0, 5);
        const arrTime = (t.arrival_time || '13:30').substring(0, 5);
        const durationMins = t.route?.duration_minutes || 360;
        const durHours = Math.floor(durationMins / 60);
        const durMins = durationMins % 60;
        const durationStr = `${durHours}h ${durMins > 0 ? `${durMins}m` : '00m'}`;

        return {
          id: t.id,
          companyId: t.route?.company?.id,
          companyName: t.route?.company?.name || 'Compagnie',
          companySlug: t.route?.company?.slug || 'compagnie',
          companySubtitle: t.route?.company?.subtitle || 'Transporteur certifié',
          isPartnerOfficial: t.route?.company?.is_official_partner ?? false,
          rating: t.route?.company?.rating || 4.5,
          price: t.price || t.route?.base_price || 6500,
          departureTime: depTime,
          arrivalTime: arrTime,
          duration: durationStr,
          departureStation: t.route?.departure_station?.name || `Gare ${from}`,
          arrivalStation: t.route?.arrival_station?.name || `Gare ${to}`,
          departureStationId: t.route?.departure_station?.id,
          arrivalStationId: t.route?.arrival_station?.id,
          availableSeats: t.available_seats || 32,
          busType: t.bus?.bus_type || 'Confort',
          features: t.features || t.route?.features || ['ac'],
          isLiveSupabase: true,
        };
      });

      return NextResponse.json(
        { trips: formatted, count: formatted.length, source: 'supabase_trips' },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          },
        }
      );
    }

    // 2. Si aucun voyage daté n'existe encore pour cette date,
    // interroger les horaires réguliers (schedules) en base pour cette route
    const { data: schedules, error: schedError } = await supabase
      .from('schedules')
      .select(`
        id,
        departure_time,
        days_of_week,
        route:routes!inner (
          id,
          name,
          base_price,
          duration_minutes,
          features,
          company:companies!inner (
            id,
            name,
            slug,
            subtitle,
            rating,
            is_active,
            is_official_partner
          ),
          departure_station:stations!routes_departure_station_id_fkey (
            id,
            name,
            city
          ),
          arrival_station:stations!routes_arrival_station_id_fkey (
            id,
            name,
            city
          )
        )
      `)
      .eq('route.company.is_active', true);

    if (schedError) {
      console.error('Supabase schedules query error:', schedError);
      return NextResponse.json({ error: schedError.message }, { status: 500 });
    }

    // Filtrer par ville de départ et d'arrivée
    const matchingSchedules = schedules?.filter((s) => {
      const depCity = s.route?.departure_station?.city?.toLowerCase();
      const arrCity = s.route?.arrival_station?.city?.toLowerCase();
      const matchCity = depCity === from.toLowerCase() && arrCity === to.toLowerCase();
      return matchCity && s.route?.company?.is_active === true;
    }) || [];

    // Formater les départs depuis les horaires réels de Supabase
    const formatted = matchingSchedules.map((s, idx) => {
      const depTime = (s.departure_time || '07:00').substring(0, 5);
      const durationMins = s.route?.duration_minutes || 360;
      const [depH, depM] = depTime.split(':').map(Number);
      const totalDepMins = depH * 60 + depM;
      const totalArrMins = totalDepMins + durationMins;
      const arrH = Math.floor(totalArrMins / 60) % 24;
      const arrM = totalArrMins % 60;
      const arrTime = `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;
      const durHours = Math.floor(durationMins / 60);
      const durRemainMins = durationMins % 60;
      const durationStr = `${durHours}h ${durRemainMins > 0 ? `${durRemainMins}m` : '00m'}`;

      // Simuler des places restantes réalistes pour chaque bus
      const mockSeatsLeft = [14, 23, 8, 31, 19, 5, 27][idx % 7];

      return {
        id: `sched-${s.id}-${date}`,
        companyId: s.route?.company?.id,
        companyName: s.route?.company?.name,
        companySlug: s.route?.company?.slug,
        companySubtitle: s.route?.company?.subtitle || 'Transporteur certifié',
        isPartnerOfficial: s.route?.company?.is_official_partner ?? false,
        rating: s.route?.company?.rating || 4.5,
        price: s.route?.base_price || 6500,
        departureTime: depTime,
        arrivalTime: arrTime,
        duration: durationStr,
        departureStation: s.route?.departure_station?.name || `Gare ${from}`,
        arrivalStation: s.route?.arrival_station?.name || `Gare ${to}`,
        departureStationId: s.route?.departure_station?.id,
        arrivalStationId: s.route?.arrival_station?.id,
        availableSeats: mockSeatsLeft,
        busType: s.route?.features?.includes('vip') ? 'VIP' : 'Confort',
        features: s.route?.features || ['ac', 'wifi'],
        isLiveSupabase: true,
      };
    });

    // Trier par heure de départ
    formatted.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

    return NextResponse.json(
      {
        trips: formatted,
        count: formatted.length,
        source: 'supabase_schedules',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (err) {
    console.error('API trips error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}
