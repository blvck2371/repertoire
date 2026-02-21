const { test, expect } = require('@playwright/test');

test.describe('Répertoire Téléphonique - CRUD', () => {
  test('affiche la page et le formulaire', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Répertoire Téléphonique');
    await expect(page.getByLabel('Nom')).toBeVisible();
  });

  test('crée un nouveau contact', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nom').fill('Dupont');
    await page.getByLabel('Prénom').fill('Jean');
    await page.getByLabel('Téléphone').fill('0612345678');
    await page.getByLabel('Email').fill('jean.dupont@test.fr');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.locator('text=Dupont')).toBeVisible({ timeout: 5000 });
  });

  test('supprime un contact', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Nom').fill('ASupprimer');
    await page.getByLabel('Prénom').fill('Test');
    await page.getByLabel('Téléphone').fill('0699999999');
    await page.getByLabel('Email').fill('supprimer@test.fr');
    await page.getByRole('button', { name: 'Ajouter' }).click();
    await expect(page.locator('text=ASupprimer')).toBeVisible({ timeout: 5000 });
    page.on('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Supprimer' }).first().click();
    await expect(page.locator('text=ASupprimer')).not.toBeVisible({ timeout: 3000 });
  });
});
