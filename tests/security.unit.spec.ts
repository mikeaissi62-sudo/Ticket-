import { test, expect } from '@playwright/test';
import { sanitizeString, sanitizePlainText, sanitizeBeninPhone } from '../src/lib/security/sanitize';
import { checkRateLimit } from '../src/lib/security/rateLimit';
import { createBookingSchema } from '../src/lib/validations/booking';
import { initiatePaymentSchema, refundPaymentSchema } from '../src/lib/validations/payment';
import { contactSchema } from '../src/lib/validations/contact';

test.describe('1. Tests Unitaires : Assainissement des données (Sanitization)', () => {
  test('supprime les balises script et balises HTML malveillantes', () => {
    const maliciousInput = '<script>alert("XSS")</script>Bonjour <b>Ticket+</b>';
    const cleaned = sanitizeString(maliciousInput);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('</script>');
    expect(cleaned).not.toContain('<b>');
  });

  test('nettoie le texte simple sans altérer les noms et prénoms légitimes', () => {
    const name = 'Aïssi Jean-Baptiste';
    const cleaned = sanitizePlainText(name);
    expect(cleaned).toBe('Aïssi Jean-Baptiste');
  });

  test('normalise les numéros béninois dans tous les formats usuels', () => {
    expect(sanitizeBeninPhone('97 12 34 56')).toBe('22997123456');
    expect(sanitizeBeninPhone('+229 97 12 34 56')).toBe('22997123456');
    expect(sanitizeBeninPhone('01 97 12 34 56')).toBe('22997123456');
    expect(sanitizeBeninPhone('22997123456')).toBe('22997123456');
  });
});

test.describe('2. Tests Unitaires : Rate Limiting (Fenêtre Glissante)', () => {
  test('autorise les requêtes dans la limite configurée et bloque le surplus', () => {
    const testIp = `test-ip-${Date.now()}`;
    const opts = { limit: 3, windowSeconds: 2 };

    // 3 requêtes autorisées
    const req1 = checkRateLimit(testIp, opts);
    const req2 = checkRateLimit(testIp, opts);
    const req3 = checkRateLimit(testIp, opts);

    expect(req1.success).toBe(true);
    expect(req2.success).toBe(true);
    expect(req3.success).toBe(true);
    expect(req3.remaining).toBe(0);

    // 4ème requête bloquée
    const req4 = checkRateLimit(testIp, opts);
    expect(req4.success).toBe(false);
    expect(req4.remaining).toBe(0);
    expect(req4.reset).toBeGreaterThan(0);
  });
});

test.describe('3. Tests Unitaires : Schémas Zod', () => {
  test('valide une réservation conforme et rejette un téléphone non béninois', () => {
    const validBooking = {
      trip_id: 'trip-123',
      seat_id: 'seat-456',
      passenger_first_name: 'Koffi',
      passenger_last_name: 'Mensah',
      passenger_phone: '22997123456',
      total_price: 8500,
      is_flexible: true,
      has_baggage: false,
    };

    const result = createBookingSchema.safeParse(validBooking);
    expect(result.success).toBe(true);

    const invalidPhone = { ...validBooking, passenger_phone: '123' };
    const invalidResult = createBookingSchema.safeParse(invalidPhone);
    expect(invalidResult.success).toBe(false);
  });

  test('valide une demande de paiement Mobile Money et rejette un provider inconnu', () => {
    const validPayment = {
      booking_id: 'BK-001',
      provider: 'mtn_momo',
      phone: '22997123456',
      amount: 7500,
    };

    const res = initiatePaymentSchema.safeParse(validPayment);
    expect(res.success).toBe(true);

    const invalidProvider = { ...validPayment, provider: 'crypto_wallet' };
    const resInvalid = initiatePaymentSchema.safeParse(invalidProvider);
    expect(resInvalid.success).toBe(false);
  });

  test('valide une demande de remboursement avec déduction des frais de 300 FCFA', () => {
    const refund = {
      booking_reference: 'TK-BEN-123456',
      reason: 'Empêchement de dernière minute',
    };

    const res = refundPaymentSchema.safeParse(refund);
    expect(res.success).toBe(true);
  });

  test('valide le formulaire de contact', () => {
    const validContact = {
      name: 'Adéola Bio',
      email: 'adeola@example.com',
      subject: 'Question sur les horaires',
      message: 'Bonjour, à quelle heure part le premier bus pour Parakou ?',
    };

    const res = contactSchema.safeParse(validContact);
    expect(res.success).toBe(true);

    const invalidEmail = { ...validContact, email: 'pas-un-email' };
    const resInvalid = contactSchema.safeParse(invalidEmail);
    expect(resInvalid.success).toBe(false);
  });
});
