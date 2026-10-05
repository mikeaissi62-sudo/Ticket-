import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/trips/[id]/seats — Récupérer les sièges d'un voyage
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();

    const { data: seats, error } = await supabase
      .from('seats')
      .select('*')
      .eq('trip_id', id)
      .order('seat_number', { ascending: true });

    if (error) {
      console.error('Supabase seats error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ seats: seats || [] });
  } catch (err) {
    console.error('API seats error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}
