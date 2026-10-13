import { test, expect } from '@playwright/test';

test.describe('5. Tests E2E : Parcours Utilisateur & Pages Voyageur', () => {
  test.describe.configure({ mode: 'serial' });

  test('affiche la landing page d’accueil officielle Ticket+', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.locator('h1')).toContainText(/Voyagez|Ticket\+/i, { timeout: 20000 });
  });

  test('affiche l’espace de réservation avec le formulaire de recherche', async ({ page }) => {
    await page.goto('/fr/accueil', { waitUntil: 'domcontentloaded', timeout: 60000 });
    const form = page.locator('[data-testid="search-form"]').first();
    await expect(form).toBeVisible({ timeout: 15000 });
  });

  test('permet d’accéder à la liste des compagnies partenaires', async ({ page }) => {
    await page.goto('/fr/compagnies', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('h1, h2').first()).toContainText(/Compagnies|Partenaires/i, { timeout: 15000 });
  });

  test('permet d’accéder à la page de consultation de billet', async ({ page }) => {
    await page.goto('/fr/mon-billet', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  });

  test('permet d’accéder à la page de contact et d’assistance', async ({ page }) => {
    await page.goto('/fr/contact', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page.locator('h1, h2').first()).toContainText(/Contact|Assistance/i, { timeout: 15000 });
  });
});
