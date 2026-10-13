import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/auth/callback
 * Callback pour OAuth (Google, etc.)
 * Supabase redirige ici après l'authentification sociale.
 * Crée le profil voyageur si premier login.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/fr/accueil';

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Les cookies ne peuvent être modifiés que dans un Server Action ou Route Handler
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Vérifier si le profil existe déjà dans la table users
      const admin = createAdminClient();
      const { data: existingProfile } = await admin
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        // Premier login OAuth — créer le profil voyageur
        const metadata = data.user.user_metadata || {};
        const fullName = metadata.full_name || metadata.name || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await (admin.from('users') as any).upsert({
          id: data.user.id,
          email: data.user.email || '',
          phone: metadata.phone || '',
          first_name: firstName,
          last_name: lastName,
          role: 'traveler',
          preferences: {
            city: 'Cotonou',
            idType: 'cni',
            notifSms: true,
            notifWhatsapp: true,
            notifEmail: true,
            auth_method: 'google',
            avatar_url: metadata.avatar_url || '',
          },
          updated_at: new Date().toISOString(),
        });

        // Notification de bienvenue
        await (admin.from('notifications') as any).insert({
          user_id: data.user.id,
          title: 'Bienvenue sur Ticket+ !',
          message: `Bonjour ${firstName} ! Votre compte Google est connecté. Réservez vos trajets en bus au Bénin en toute simplicité.`,
          type: 'system',
          is_read: false,
        });
      }
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // Si pas de code, rediriger vers l'accueil
  return NextResponse.redirect(new URL('/fr', requestUrl.origin));
}
