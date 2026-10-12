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

    // Si aucune notification pour un utilisateur connecté, créer une notification de bienvenue
    if (!notifications || notifications.length === 0) {
      const welcomeNotif = {
        user_id: user.id,
        title: 'Bienvenue sur Ticket+ !',
        message: 'Votre compte est prêt. Réservez vos trajets en bus partout au Bénin en toute sérénité.',
        type: 'system' as const,
        is_read: false,
      };

      const { data: created, error: insertError } = await supabase
        .from('notifications')
        .insert(welcomeNotif)
        .select()
        .single();

      if (!insertError && created) {
        return NextResponse.json({ notifications: [created] });
      }
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
      return NextResponse.json(
        { error: 'Vous devez être connecté.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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
