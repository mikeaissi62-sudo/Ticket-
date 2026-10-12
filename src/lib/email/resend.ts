import { Resend } from 'resend';

// Initialisation du client Resend
const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Expéditeur par défaut (onboarding@resend.dev pour les tests, ou votre domaine vérifié)
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Ticket+ Bénin <onboarding@resend.dev>';

export interface BookingEmailProps {
  to: string;
  passengerName: string;
  bookingReference: string;
  companyName: string;
  fromCity: string;
  toCity: string;
  departureStation: string;
  arrivalStation: string;
  date: string;
  departureTime: string;
  seatNumber: string;
  totalPrice: number;
}

/**
 * Envoie un email de confirmation de réservation avec le billet électronique.
 */
export async function sendBookingConfirmationEmail(props: BookingEmailProps) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY non configurée. Email non envoyé pour la réservation:', props.bookingReference);
    return { success: false, error: 'RESEND_API_KEY manquante' };
  }

  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Votre Billet Ticket+</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0F172A; color: #ffffff; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
    .header span { color: #10B981; }
    .badge { display: inline-block; background: #10B981; color: white; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; margin-top: 8px; }
    .content { padding: 24px; }
    .ticket-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .route-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #CBD5E1; padding-bottom: 16px; margin-bottom: 16px; }
    .city-name { font-size: 18px; font-weight: 800; color: #0F172A; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
    .detail-item { margin-bottom: 8px; }
    .detail-label { color: #64748B; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 2px; }
    .detail-value { font-weight: 700; color: #0F172A; }
    .total-price { text-align: right; font-size: 22px; font-weight: 900; color: #10B981; }
    .footer { text-align: center; font-size: 12px; color: #64748B; padding: 20px; border-top: 1px solid #E2E8F0; background: #F8FAFC; }
    .reminder { background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 12px; font-size: 12px; color: #92400E; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ticket<span>+</span> Bénin</h1>
      <div class="badge">Réservation Confirmée</div>
    </div>
    <div class="content">
      <p style="font-size: 15px; margin-top: 0;">Bonjour <strong>${props.passengerName}</strong>,</p>
      <p style="font-size: 14px; color: #475569;">Votre réservation de bus avec <strong>${props.companyName}</strong> a été validée avec succès. Voici les détails de votre voyage :</p>
      
      <div class="ticket-card">
        <div class="route-row">
          <div>
            <div class="city-name">${props.fromCity} ➔ ${props.toCity}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Réf : <strong>${props.bookingReference}</strong></div>
          </div>
          <div class="total-price">${props.totalPrice.toLocaleString('fr-FR')} FCFA</div>
        </div>

        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">Date du départ</div>
            <div class="detail-value">${props.date}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Heure de départ</div>
            <div class="detail-value">${props.departureTime}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Gare de départ</div>
            <div class="detail-value">${props.departureStation}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Siège réservé</div>
            <div class="detail-value">Siège N° ${props.seatNumber}</div>
          </div>
        </div>

        <div class="reminder">
          ⏱️ <strong>Rappel important :</strong> Veuillez vous présenter à la gare au moins <strong>30 minutes</strong> avant le départ muni d'une pièce d'identité valide.
        </div>
      </div>

      <p style="font-size: 13px; color: #64748B; text-align: center;">Vous pouvez également consulter et télécharger votre e-billet à tout moment sur l'application Ticket+ dans la rubrique <strong>"Mon Billet"</strong>.</p>
    </div>
    <div class="footer">
      Ticket+ Bénin — Plateforme officielle de billetterie de bus interurbains.<br>
      Besoin d'aide ? Contactez notre support WhatsApp au <strong>+229 01 54 65 89</strong>.
    </div>
  </div>
</body>
</html>
    `;

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: props.to,
      subject: `Confirmation de votre billet Ticket+ (${props.bookingReference}) - ${props.fromCity} ➔ ${props.toCity}`,
      html: htmlContent,
    });

    return { success: true, data: result };
  } catch (err: any) {
    console.error('[Resend] Erreur envoi email:', err);
    return { success: false, error: err?.message || 'Erreur lors de l’envoi de l’email' };
  }
}
