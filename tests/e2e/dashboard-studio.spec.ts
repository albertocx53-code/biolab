import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('painel mostra os seis laboratórios com status honesto', async ({ page }) => {
  await login(page, 'basico');
  await page.goto('/explorar');
  const cards = page.locator('[data-testid^=lab-card-]');
  await expect(cards).toHaveCount(6);
  for (const t of ['Corpo Humano', 'Plantas', 'Animais', 'Células', 'Genética', 'Microrganismos']) await expect(page.getByRole('heading', { name: t })).toBeVisible();
  await expect(page.getByTestId('lab-card-corpo-humano')).toContainText('Disponível');
  await expect(page.getByTestId('lab-card-celulas')).toContainText('Disponível');
  await expect(page.getByTestId('lab-card-plantas')).toContainText('Em breve');
  await page.getByTestId('lab-card-plantas').click();
  await expect(page.getByText('Este laboratório está em desenvolvimento')).toBeVisible();
});

test('Plano Básico não acessa o Studio', async ({ page }) => {
  await login(page, 'basico');
  await page.goto('/studio?v=1&lab=anatomia-humana&estrutura=testis-dir');
  await expect(page.getByTestId('studio-locked')).toBeVisible();
  await expect(page.getByTestId('studio-topic')).toHaveCount(0);
});

test('Plano Completo recebe o tema do Explorer no Studio, sem prometer geradores prontos', async ({ page }) => {
  await login(page, 'completo');
  await page.goto('/studio?v=1&lab=anatomia-humana&estrutura=testis-dir');
  await expect(page.getByTestId('studio-topic')).toContainText('Testículo (lado direito)');
  await expect(page.getByTestId('studio-topic')).toContainText('Espermatogênese');
  await expect(page.getByTestId('studio-status')).toContainText('Geradores em desenvolvimento');
});

test('o Studio também recebe temas do laboratório de Células', async ({ page }) => {
  await login(page, 'completo');
  await page.goto('/studio?v=1&lab=celulas&estrutura=mitocondria');
  await expect(page.getByTestId('studio-topic')).toContainText('Mitocôndria');
  await expect(page.getByTestId('studio-topic')).toContainText('Respiração celular');
});
