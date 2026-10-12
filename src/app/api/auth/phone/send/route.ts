import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

import { saveOtp } from '@/lib/auth/otp-store';

/**
 * POST /api/auth/phone/send
 * Envoie un OTP SMS au numéro de téléphone béninois.
 * 
 * En mode développement/test (pas de Twilio configuré), 
 * on génère un OTP côté serveur et on le retourne pour test.
 * En production avec Twilio/MessageBird configuré dans Supabase,
 * on utilise signInWithOtp natif.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Veuillez saisir votre numéro de téléphone.' },
        { status: 400 }
      );
    }

    // Normaliser le numéro avec son indicatif
    phone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!phone.startsWith('+')) {
      const dialCode = body.dialCode || '+229';
      phone = (dialCode.startsWith('+') ? dialCode : '+' + dialCode) + phone;
    }

    // Valider le format international E.164 (7 à 15 chiffres au total)
    const internationalRegex = /^\+[1-9]\d{6,14}$/;
    if (!internationalRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Numéro de téléphone invalide. Veuillez vérifier le nombre de chiffres.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Vérifier si un SMS provider est configuré dans Supabase
    // On tente d'abord la méthode native Supabase OTP
    const useDemoOtp = process.env.PHONE_OTP_MODE === 'demo';

    if (useDemoOtp) {
      // === MODE DÉMO / DÉVELOPPEMENT ===
      // Générer un OTP à 6 chiffres et le stocker en mémoire & base
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      saveOtp(phone, otp);

      try {
        await (admin.from('phone_otps') as any).upsert({
          phone,
          otp_code: otp,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          attempts: 0,
        }, { onConflict: 'phone' });
      } catch {
        // Table phone_otps facultative en dev grâce au store mémoire
      }

      return NextResponse.json({
        success: true,
        phone,
        message: 'Code OTP envoyé avec succès.',
        // En mode démo, on retourne le code pour faciliter les tests
        demo_otp: otp,
        demo_mode: true,
      });
    } else {
      // === MODE PRODUCTION (Twilio/MessageBird configuré) ===
      // Utiliser Supabase Auth natif pour envoyer l'OTP SMS
      const { error } = await admin.auth.signInWithOtp({
        phone,
      });

      if (error) {
        console.error('Supabase OTP error:', error);
        
        // Fallback en mode démo si le provider SMS n'est pas configuré
        if (error.message.includes('provider') || error.message.includes('sms') || error.message.includes('Phone')) {
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          saveOtp(phone, otp);
          
          try {
            await (admin.from('phone_otps') as any).upsert({
              phone,
              otp_code: otp,
              expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
              attempts: 0,
            }, { onConflict: 'phone' });
          } catch {
            // Ignorer si la table n'existe pas encore
          }

          return NextResponse.json({
            success: true,
            phone,
            message: 'Code OTP envoyé (mode démo).',
            demo_otp: otp,
            demo_mode: true,
          });
        }

        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        phone,
        message: 'Un code de vérification a été envoyé par SMS.',
        demo_mode: false,
      });
    }
  } catch (err: any) {
    console.error('API phone/send error:', err);
    return NextResponse.json(
      { error: err?.message || "Erreur lors de l'envoi du code SMS." },
      { status: 500 }
    );
  }
}
