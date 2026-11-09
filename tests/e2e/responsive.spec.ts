import { expect, test } from '@playwright/test';
import { login, openHumanLab } from './helpers';

test('layout em celular: entrada, painel e laboratório sem rolagem horizontal', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Entrar na plataforma' })).toBeVisible();
  await login(page, 'basico');
  await page.goto('/explorar');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await openHumanLab(page);
  await expect(page.getByRole('button', { name: 'Camadas' })).toBeVisible();
  await page.getByRole('button', { name: 'Camadas' }).click();
  await expect(page.getByTestId('layers-panel')).toBeVisible();
});
