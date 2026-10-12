import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/companies — Lister toutes les compagnies actives
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        *,
        stations(id, name, city, latitude, longitude),
        routes(id, name, base_price, duration_minutes, features)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Companies fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { companies: companies || [] },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (err) {
    console.error('API companies error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}
