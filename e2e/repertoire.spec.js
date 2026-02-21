const { test, expect } = require('@playwright/test');

test.describe('Répertoire Téléphonique - CRUD', () => {
  test('affiche la page et le formulaire', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Répertoire Téléphonique');
    await expect(page.locator('input[name="nom"]')).toBeVisible();
  });

  test('crée un nouveau contact', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[name="nom"]').fill('Dupont');
    await page.locator('input[name="prenom"]').fill('Jean');
    await page.locator('input[name="telephone"]').fill('0612345678');
    await page.locator('input[name="email"]').fill('jean.dupont@test.fr');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.locator('text=Dupont')).toBeVisible({ timeout: 5000 });
  });

  test('supprime un contact', async ({ page }) => {
    await page.goto('/');
    await page.locator('input[name="nom"]').fill('ASupprimer');
    await page.locator('input[name="prenom"]').fill('Test');
    await page.locator('input[name="telephone"]').fill('0699999999');
    await page.locator('input[name="email"]').fill('supprimer@test.fr');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.locator('text=ASupprimer')).toBeVisible({ timeout: 5000 });
    page.on('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Supprimer' }).first().click();
    await expect(page.locator('text=ASupprimer')).not.toBeVisible({ timeout: 3000 });
  });
});
