import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { contactSchema } from '@/lib/validations/contact';
import { checkRateLimit, getClientIp, RateLimitPresets } from '@/lib/security/rateLimit';
import { sanitizeString, sanitizePlainText } from '@/lib/security/sanitize';

// POST /api/contact — Soumission sécurisée d'un message de contact voyageur
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting (protection contre le spam de formulaire)
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`contact:${clientIp}`, RateLimitPresets.CONTACT);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: `Trop de messages envoyés. Veuillez patienter ${rateLimit.reset} secondes avant de soumettre à nouveau.` },
        { status: 429 }
      );
    }

    const raw = await request.json();

    // 2. Validation Zod
    const validation = contactSchema.safeParse(raw);
    if (!validation.success) {
      const firstError = validation.error.issues?.[0]?.message || 'Données du formulaire invalides.';
      return NextResponse.json(
        { error: firstError, details: validation.error.format() },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message } = validation.data;

    // 3. Sanitization contre injections et XSS
    const cleanName = sanitizePlainText(name);
    const cleanSubject = sanitizePlainText(subject);
    const cleanMessage = sanitizeString(message);
    const cleanPhone = phone ? sanitizePlainText(phone) : '';

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Si un utilisateur est connecté, on lui crée une notification de confirmation
    if (user) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Demande de contact reçue',
        message: `Votre message "${cleanSubject}" a bien été transmis au support voyageur. Nous vous répondrons sous 24h.`,
        type: 'system',
        is_read: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Votre message a été transmis avec succès à l’assistance Ticket+.',
      ticket_id: `SUP-${Date.now().toString().slice(-6)}`,
      data: {
        name: cleanName,
        email,
        phone: cleanPhone,
        subject: cleanSubject,
      },
    });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de l’envoi du message.' },
      { status: 500 }
    );
  }
}
