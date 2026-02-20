const { test, expect } = require('@playwright/test');

test.describe('Répertoire Téléphonique', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('affiche le titre de l\'application', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /répertoire téléphonique/i })).toBeVisible();
  });

  test('affiche le formulaire de création', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Dupont', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Jean', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /ajouter/i })).toBeVisible();
  });

  test('peut ajouter un contact', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Dupont', exact: true }).fill('E2ETest');
    await page.getByRole('textbox', { name: 'Jean', exact: true }).fill('Pierre');
    await page.getByRole('textbox', { name: '06 12 34 56 78' }).fill('0698765432');
    await page.getByRole('textbox', { name: 'jean.dupont@email.com' }).fill('pierre.e2e@test.com');
    await page.getByRole('button', { name: /ajouter/i }).click();

    await expect(page.getByText('Pierre E2ETest')).toBeVisible({ timeout: 5000 });
  });
});
