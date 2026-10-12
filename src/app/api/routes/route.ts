import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/routes — Lister toutes les lignes avec tarifs et compagnies
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: routes, error } = await supabase
      .from('routes')
      .select(`
        *,
        company:companies!inner(*),
        departure_station:stations!routes_departure_station_id_fkey(*),
        arrival_station:stations!routes_arrival_station_id_fkey(*)
      `)
      .eq('company.is_active', true)
      .order('base_price', { ascending: true });

    if (error) {
      console.error('Supabase routes error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count scheduled departures per route
    const { data: schedules } = await supabase
      .from('schedules')
      .select('route_id');

    const departureCounts: Record<string, number> = {};
    if (schedules) {
      for (const s of schedules) {
        departureCounts[s.route_id] = (departureCounts[s.route_id] || 0) + 1;
      }
    }

    const formatted = (routes || []).map(r => ({
      id: r.id,
      from: r.departure_station?.city || 'Cotonou',
      to: r.arrival_station?.city || 'Parakou',
      distance: r.distance_km ? `${r.distance_km} km` : '-- km',
      duration: r.duration_minutes 
        ? `${Math.floor(r.duration_minutes / 60)}h${(r.duration_minutes % 60) > 0 ? (r.duration_minutes % 60).toString().padStart(2, '0') : '00'}`
        : '--',
      price: r.base_price || 0,
      departures: departureCounts[r.id] || 1,
      features: r.features || [],
      company: r.company?.name || 'Compagnie',
      companySlug: r.company?.slug || 'compagnie',
    }));

    return NextResponse.json(
      { routes: formatted, count: formatted.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    console.error('API routes error:', err);
    return NextResponse.json({ error: 'Erreur serveur interne.' }, { status: 500 });
  }
}
