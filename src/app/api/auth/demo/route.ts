import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/auth/demo — Prépare et authentifie un compte démo (traveler, partner ou admin)
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryRole = url.searchParams.get('role');
    const body = await req.json().catch(() => ({}));
    const roleCandidate = (queryRole || body?.role || '').toLowerCase();
    const requestedRole: 'traveler' | 'partner' | 'admin' =
      ['traveler', 'partner', 'admin'].includes(roleCandidate) ? (roleCandidate as any) : 'traveler';

    const admin = createAdminClient();

    let demoEmail = 'voyageur.demo@ticketplus.bj';
    let firstName = 'Koffi';
    let lastName = 'Dossou';

    if (requestedRole === 'partner') {
      demoEmail = 'partner.demo@ticketplus.bj';
      firstName = 'Confort';
      lastName = 'Lines Partner';
    } else if (requestedRole === 'admin') {
      demoEmail = 'admin.demo@ticketplus.bj';
      firstName = 'Super';
      lastName = 'Administrateur';
    }

    const demoPassword = 'TicketPlus2026!';

    // Rechercher si l'utilisateur existe déjà
    const { data: usersList, error: listError } = await admin.auth.admin.listUsers();
    let userId: string | null = null;

    if (!listError && usersList?.users) {
      const existingUser = usersList.users.find(
        (u) => u.email?.toLowerCase() === demoEmail.toLowerCase()
      );
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
      // Créer le compte démo pré-confirmé
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone: '01 64 28 90',
        },
      });

      if (createError) {
        console.error('Error creating demo user:', createError);
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      userId = newUser.user.id;
    }

    // Synchroniser dans la table publique 'users' avec le rôle spécifié
    if (userId) {
      await (admin.from('users') as any).upsert({
        id: userId,
        email: demoEmail,
        phone: '01 64 28 90',
        first_name: firstName,
        last_name: lastName,
        role: requestedRole,
        preferences: {
          city: 'Cotonou',
          idType: 'cni',
          notifSms: true,
          notifWhatsapp: true,
          notifEmail: false,
        },
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      email: demoEmail,
      password: demoPassword,
      role: requestedRole,
    });
  } catch (err: any) {
    console.error('API demo auth error:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur lors de la configuration du compte démo.' },
      { status: 500 }
    );
  }
}
