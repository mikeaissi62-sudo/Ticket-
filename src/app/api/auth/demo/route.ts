import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/auth/demo — Prépare et authentifie le compte voyageur démo avec email pré-confirmé
export async function POST() {
  try {
    const admin = createAdminClient();
    const demoEmail = 'voyageur.demo@ticketplus.bj';
    const demoPassword = 'TicketPlus2026!';

    // Rechercher si l'utilisateur existe déjà
    const { data: usersList, error: listError } = await admin.auth.admin.listUsers();
    let userId: string | null = null;

    if (!listError && usersList?.users) {
      const existingUser = usersList.users.find(u => u.email?.toLowerCase() === demoEmail.toLowerCase());
      if (existingUser) {
        userId = existingUser.id;
        // S'assurer que le mot de passe est synchronisé et l'email confirmé
        await admin.auth.admin.updateUserById(existingUser.id, {
          password: demoPassword,
          email_confirm: true,
        });
      }
    }

    if (!userId) {
      // Créer le compte démo pré-confirmé (sans envoi d'email, évite le rate limit SMTP)
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          first_name: 'Koffi',
          last_name: 'Dossou',
          phone: '01 64 28 90',
        },
      });

      if (createError) {
        console.error('Error creating demo user:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      userId = newUser.user.id;
    }

    // Synchroniser dans la table publique 'users'
    if (userId) {
      await (admin.from('users') as any).upsert({
        id: userId,
        email: demoEmail,
        phone: '01 64 28 90',
        first_name: 'Koffi',
        last_name: 'Dossou',
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

      // S'assurer que le voyageur démo a des notifications d'exemple
      const { data: existingNotifs } = await admin
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (!existingNotifs || existingNotifs.length === 0) {
        await (admin.from('notifications') as any).insert([
          {
            user_id: userId,
            title: 'Bienvenue sur Ticket+ !',
            message: 'Votre compte voyageur démo est actif. Explorez toutes les fonctionnalités.',
            type: 'system',
            is_read: true,
          },
          {
            user_id: userId,
            title: 'Départ confirmé : Cotonou ➔ Parakou',
            message: 'Votre bus Confort Lines partira à 07h00. Présentez-vous 30min avant au guichet.',
            type: 'booking',
            is_read: false,
          },
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      email: demoEmail,
      password: demoPassword,
    });
  } catch (err: any) {
    console.error('API demo auth error:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur lors de la configuration du compte démo.' },
      { status: 500 }
    );
  }
}
