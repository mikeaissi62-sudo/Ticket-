import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/auth/register — Inscription avec confirmation immédiate (sans rate limit email)
export async function POST(request: NextRequest) {
  try {
    const admin = createAdminClient();
    const body = await request.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires.' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const { data: usersList } = await admin.auth.admin.listUsers();
    const existing = usersList?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (existing) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà. Veuillez vous connecter.' },
        { status: 409 }
      );
    }

    // Créer le compte pré-confirmé
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
      },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Insérer dans la table publique 'users'
    await (admin.from('users') as any).upsert({
      id: newUser.user.id,
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      role: 'traveler',
      preferences: {
        city: 'Cotonou',
        idType: 'cni',
        notifSms: true,
        notifWhatsapp: true,
        notifEmail: false,
      },
      updated_at: new Date().toISOString(),
    });

    // Créer une notification de bienvenue
    await (admin.from('notifications') as any).insert({
      user_id: newUser.user.id,
      title: 'Bienvenue sur Ticket+ !',
      message: 'Votre compte est prêt. Réservez vos trajets en bus partout au Bénin en toute sérénité.',
      type: 'system',
      is_read: false,
    });

    return NextResponse.json({
      success: true,
      email,
      password,
    });
  } catch (err: any) {
    console.error('API register error:', err);
    return NextResponse.json(
      { error: err?.message || "Erreur lors de l'inscription." },
      { status: 500 }
    );
  }
}
