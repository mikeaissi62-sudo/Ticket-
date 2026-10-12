import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/profile — Récupérer le profil et les statistiques du voyageur connecté
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

    // Récupérer le profil dans la table 'users'
    let { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Si le profil n'existe pas encore dans la table users (inscription récente)
    if (!profile) {
      const defaultProfile = {
        id: user.id,
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        first_name: user.user_metadata?.first_name || user.user_metadata?.firstName || '',
        last_name: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
        role: 'traveler' as const,
        preferences: {
          city: 'Cotonou',
          idType: 'cni',
          notifSms: true,
          notifWhatsapp: true,
          notifEmail: false,
        },
      };

      const { data: createdProfile, error: insertError } = await supabase
        .from('users')
        .upsert(defaultProfile)
        .select()
        .single();

      if (!insertError && createdProfile) {
        profile = createdProfile;
      }
    }

    // Récupérer les statistiques de voyage
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('total_price, status')
      .eq('user_id', user.id);

    let totalTrips = 0;
    let totalSpent = 0;

    if (bookings) {
      totalTrips = bookings.filter(b => b.status !== 'cancelled').length;
      totalSpent = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
    }

    // Compter les notifications non lues
    const { count: unreadNotifs } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
      },
      profile: profile || {
        first_name: '',
        last_name: '',
        phone: '',
        email: user.email || '',
        preferences: {},
      },
      stats: {
        totalTrips,
        totalSpent,
        unreadNotifs: unreadNotifs || 0,
      },
    });
  } catch (err) {
    console.error('API profile GET error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}

// PUT /api/profile — Mettre à jour les informations du voyageur
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      city,
      idType,
      notifSms,
      notifWhatsapp,
      notifEmail,
    } = body;

    const updatedData = {
      first_name: firstName || '',
      last_name: lastName || '',
      phone: phone || '',
      email: email || user.email || '',
      preferences: {
        city: city || 'Cotonou',
        idType: idType || 'cni',
        notifSms: notifSms ?? true,
        notifWhatsapp: notifWhatsapp ?? true,
        notifEmail: notifEmail ?? false,
      },
      updated_at: new Date().toISOString(),
    };

    const { data: updatedProfile, error } = await supabase
      .from('users')
      .update(updatedData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (err) {
    console.error('API profile PUT error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}
