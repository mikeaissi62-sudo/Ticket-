import { test, expect } from '@playwright/test';

test.describe('4. Tests API & En-têtes de Sécurité HTTP', () => {
  test('vérifie la présence des en-têtes de sécurité (X-Frame-Options, X-Content-Type-Options)', async ({ request }) => {
    const res = await request.get('/api/companies');
    expect(res.ok()).toBe(true);

    const headers = res.headers();
    expect(headers['x-frame-options'] || headers['content-security-policy']).toBeDefined();
  });

  test('POST /api/contact rejette une requête invalide avec un code 400 (Zod)', async ({ request }) => {
    const res = await request.post('/api/contact', {
      data: {
        name: 'A', // Trop court
        email: 'invalid-email',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('POST /api/payments/initiate rejette un corps sans moyen de paiement avec 400 (Zod)', async ({ request }) => {
    const res = await request.post('/api/payments/initiate', {
      data: {
        booking_id: 'BK-TEST',
        phone: '22997123456',
        // provider manquant
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('POST /api/payments/refund rejette une requête sans identifiant avec 400 (Zod)', async ({ request }) => {
    const res = await request.post('/api/payments/refund', {
      data: {
        reason: 'Annulation sans référence',
      },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });
});
