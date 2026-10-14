import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/notifications — Récupérer les notifications de l'utilisateur connecté
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

    // Récupérer les notifications de l'utilisateur
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Notifications fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ notifications: notifications || [] });
  } catch (err) {
    console.error('API notifications GET error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}

// POST /api/notifications — Créer une notification de réservation ou système
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { title, message, type = 'booking', booking_ref } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Titre et message requis.' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json({
        success: true,
        notification: {
          id: `notif-${Date.now()}`,
          title,
          message,
          type,
          booking_ref,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      });
    }

    const { data: created, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title,
        message,
        type,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: true,
        notification: {
          id: `notif-${Date.now()}`,
          title,
          message,
          type,
          booking_ref,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ success: true, notification: created }, { status: 201 });
  } catch (err) {
    console.error('API notifications POST error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la notification.' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications — Marquer comme lu
export async function PATCH(request: NextRequest) {
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
    const { id, all, is_read = true } = body;

    if (all) {
      // Marquer toutes comme lues pour cet utilisateur
      const { error } = await supabase
        .from('notifications')
        .update({ is_read })
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (id) {
      // Marquer une notification spécifique
      const { error } = await supabase
        .from('notifications')
        .update({ is_read })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Paramètre id ou all requis.' },
      { status: 400 }
    );
  } catch (err) {
    console.error('API notifications PATCH error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications — Supprimer une notification
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, message: 'Notification supprimée localement.' });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    if (all === 'true') {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Toutes les notifications ont été supprimées.' });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Identifiant de notification manquant.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API notifications DELETE error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur interne.' },
      { status: 500 }
    );
  }
}
