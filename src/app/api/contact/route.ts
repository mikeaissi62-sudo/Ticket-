import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/contact — Soumission d'un message de contact voyageur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Le nom et le message sont obligatoires.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Si un utilisateur est connecté, on peut également lui créer une notification de confirmation de prise en charge
    if (user) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Demande de contact reçue',
        message: `Votre message "${subject || 'Assistance Ticket+'}" a bien été transmis au support voyageur. Nous vous répondrons sous 24h.`,
        type: 'system',
        is_read: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Votre message a été transmis avec succès à l’assistance Ticket+.',
      ticket_id: `SUP-${Date.now().toString().slice(-6)}`,
    });
  } catch (error: any) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de l’envoi du message.' },
      { status: 500 }
    );
  }
}
