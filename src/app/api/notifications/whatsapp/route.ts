import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/notifications/whatsapp — Envoi / génération de billet par WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      ref, 
      from = 'Cotonou', 
      to = 'Parakou', 
      date = '', 
      departure = '07:00', 
      seat = '01', 
      company = 'Confort Lines', 
      name = 'Voyageur', 
      phone = '0154658907', 
      price = 6500,
      station = 'Gare Étoile Rouge'
    } = body;

    const bookingRef = ref && String(ref).startsWith('TK') 
      ? String(ref) 
      : (ref ? `TKP-${ref}` : 'TKP-2026-9812');
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const recipientPhone = cleanPhone.startsWith('229') ? cleanPhone : `229${cleanPhone}`;

    const formattedDate = date 
      ? new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      : 'Date confirmée';

    // Formatage officiel clair et structuré du message WhatsApp Ticket+ Bénin
    const whatsappMessage = `🎫 *E-BILLET OFFICIEL TICKET+ BÉNIN*
━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Réservation confirmée* : *${bookingRef}*
🏢 *Compagnie* : *${company}*
🛣️ *Trajet* : *${from}* ➔ *${to}*
📅 *Date de départ* : ${formattedDate}
⏰ *Départ* : *${departure}* (Présentation 30 min avant)
📍 *Gare d'embarquement* : ${station}
💺 *Siège Réservé* : *N° ${seat} (Fenêtre)*
👤 *Voyageur* : ${name}
💳 *Paiement* : MTN MoMo (Payé)
💰 *Montant* : ${Number(price).toLocaleString('fr-FR')} FCFA

━━━━━━━━━━━━━━━━━━━━━━━━
📲 *Visualiser & Scanner votre QR Code* :
https://ticketplus.bj/fr/mon-billet?ref=${encodeURIComponent(bookingRef)}
━━━━━━━━━━━━━━━━━━━━━━━━
ℹ️ *Bagages* : 1 valise en soute (25 kg) + 1 bagage cabine.
📞 *Assistance Voyageur 24/7* : +229 01 54 65 89 07
Bon voyage avec Ticket+ !`;

    const whatsappUrl = `https://wa.me/${recipientPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    // Enregistrement en base Supabase si l'utilisateur est authentifié
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: `Billet WhatsApp envoyé (${bookingRef})`,
          message: `Votre billet pour ${from} ➔ ${to} (Siège N° ${seat}) a été transmis sur WhatsApp au +${recipientPhone}.`,
          type: 'booking',
          is_read: false,
        });
      }
    } catch (dbErr) {
      console.warn('Notification log DB warning:', dbErr);
    }

    return NextResponse.json({
      success: true,
      booking_reference: bookingRef,
      phone: recipientPhone,
      whatsapp_url: whatsappUrl,
      preview: whatsappMessage,
    });
  } catch (error: any) {
    console.error('WhatsApp API error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération du billet WhatsApp.' },
      { status: 500 }
    );
  }
}
