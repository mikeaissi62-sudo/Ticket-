import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyStoredOtp } from '@/lib/auth/otp-store';

/**
 * POST /api/auth/phone/verify
 * Vérifie le code OTP et connecte l'utilisateur.
 * 
 * Si le provider SMS Supabase est actif, utilise verifyOtp natif.
 * Sinon, vérifie contre le store mémoire / table phone_otps (mode démo).
 * Crée automatiquement un profil voyageur si nouveau.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre numéro et le code reçu.' },
        { status: 400 }
      );
    }

    // Normaliser le numéro avec son indicatif
    phone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!phone.startsWith('+')) {
      const dialCode = body.dialCode || '+229';
      phone = (dialCode.startsWith('+') ? dialCode : '+' + dialCode) + phone;
    }

    otp = otp.replace(/\s/g, '');

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'Le code doit contenir 6 chiffres.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Vérification dans le store mémoire
    const memoryCheck = verifyStoredOtp(phone, otp);
    let isValidOtp = memoryCheck.valid;

    // 2. Si pas trouvé en mémoire, vérifier dans la table phone_otps
    if (!isValidOtp) {
      try {
        const { data: otpRecord } = await (admin
          .from('phone_otps') as any)
          .select('*')
          .eq('phone', phone)
          .maybeSingle();

        if (otpRecord && otpRecord.otp_code === otp && new Date(otpRecord.expires_at) > new Date()) {
          isValidOtp = true;
          await (admin.from('phone_otps') as any).delete().eq('phone', phone);
        }
      } catch {
        // Table optionnelle
      }
    }

    if (isValidOtp) {
      // OTP valide !
      // Chercher un utilisateur existant avec ce numéro de téléphone (format international ou local)
      const localPhone = phone.replace(/^\+\d{1,4}/, '');
      const { data: existingProfile } = await (admin
        .from('users') as any)
        .select('id, email, first_name, last_name, phone')
        .or(`phone.eq.${phone},phone.eq.${localPhone}`)
        .maybeSingle();

      if (existingProfile) {
        // Utilisateur existant — générer un lien magique ou connecter directement
        // On utilise le service role pour générer un token
        const { data: userData } = await admin.auth.admin.getUserById(existingProfile.id);
        
        if (userData?.user) {
          // Générer un magic link token pour auto-login
          const tempEmail = userData.user.email || `${phone.replace('+', '')}@phone.ticketplus.bj`;
          const tempPassword = `PhoneOTP_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          
          // Mettre à jour le mot de passe temporairement pour auto-login
          await admin.auth.admin.updateUserById(existingProfile.id, {
            password: tempPassword,
          });

          return NextResponse.json({
            success: true,
            email: tempEmail,
            password: tempPassword,
            isNew: false,
            profile: {
              firstName: existingProfile.first_name,
              lastName: existingProfile.last_name,
            },
          });
        }
      }

      // Nouvel utilisateur — créer le compte
      const syntheticEmail = `${phone.replace('+', '')}@phone.ticketplus.bj`;
      const tempPassword = `PhoneOTP_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email: syntheticEmail,
        password: tempPassword,
        email_confirm: true,
        phone,
        phone_confirm: true,
        user_metadata: {
          phone,
          auth_method: 'phone_otp',
        },
      });

      if (createError) {
        // Si l'utilisateur existe déjà avec cet email synthétique
        if (createError.message.includes('already') || createError.message.includes('exists')) {
          const { data: usersList } = await admin.auth.admin.listUsers();
          const existingUser = usersList?.users?.find(u => u.email === syntheticEmail);
          
          if (existingUser) {
            await admin.auth.admin.updateUserById(existingUser.id, { password: tempPassword });
            
            return NextResponse.json({
              success: true,
              email: syntheticEmail,
              password: tempPassword,
              isNew: false,
            });
          }
        }
        
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      // Créer le profil voyageur
      await (admin.from('users') as any).upsert({
        id: newUser.user.id,
        email: syntheticEmail,
        phone: phone,
        first_name: '',
        last_name: '',
        role: 'traveler',
        preferences: {
          city: 'Cotonou',
          idType: 'cni',
          notifSms: true,
          notifWhatsapp: true,
          notifEmail: false,
          auth_method: 'phone_otp',
        },
        updated_at: new Date().toISOString(),
      });

      // Notification de bienvenue
      await (admin.from('notifications') as any).insert({
        user_id: newUser.user.id,
        title: 'Bienvenue sur Ticket+ !',
        message: 'Votre compte est prêt. Vous pouvez maintenant réserver vos trajets en bus partout au Bénin.',
        type: 'system',
        is_read: false,
      });

      return NextResponse.json({
        success: true,
        email: syntheticEmail,
        password: tempPassword,
        isNew: true,
      });

    } else {
      // Essayer la vérification native Supabase (provider SMS actif)
      const { data, error } = await admin.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        return NextResponse.json(
          { error: 'Code incorrect ou expiré. Veuillez réessayer.' },
          { status: 400 }
        );
      }

      if (data.user) {
        // Vérifier si le profil existe dans la table users
        const { data: existingProfile } = await admin
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          // Créer le profil voyageur
          await (admin.from('users') as any).upsert({
            id: data.user.id,
            email: data.user.email || '',
            phone: phone,
            first_name: '',
            last_name: '',
            role: 'traveler',
            preferences: {
              city: 'Cotonou',
              notifSms: true,
              notifWhatsapp: true,
              notifEmail: false,
              auth_method: 'phone_otp',
            },
            updated_at: new Date().toISOString(),
          });

          await (admin.from('notifications') as any).insert({
            user_id: data.user.id,
            title: 'Bienvenue sur Ticket+ !',
            message: 'Votre compte est prêt. Réservez vos trajets en bus au Bénin.',
            type: 'system',
            is_read: false,
          });
        }
      }

      return NextResponse.json({
        success: true,
        native: true,
        user: data.user,
        session: data.session,
      });
    }
  } catch (err: any) {
    console.error('API phone/verify error:', err);
    return NextResponse.json(
      { error: err?.message || 'Erreur lors de la vérification du code.' },
      { status: 500 }
    );
  }
}
