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

test('laboratório de Células em celular: sem rolagem horizontal e menu de modelos', async ({ page }) => {
  await login(page, 'basico');
  await page.goto('/explorar/celulas');
  await expect(page.getByRole('button', { name: 'Modelos' })).toBeVisible({ timeout: 60_000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Modelos' }).click();
  await expect(page.getByTestId('cell-model-title')).toBeVisible();
  await page.getByRole('radio', { name: 'Vegetal' }).click();
  await expect(page.getByTestId('cell-model-title')).toHaveText('Célula vegetal');
});

test('laboratório de Plantas em celular: sem rolagem horizontal e menu de modelos', async ({ page }) => {
  await login(page, 'basico');
  await page.goto('/explorar/plantas');
  await expect(page.getByRole('button', { name: 'Modelos' })).toBeVisible({ timeout: 60_000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.getByRole('button', { name: 'Modelos' }).click();
  await page.getByRole('radio', { name: 'Flor' }).click();
  await expect(page.getByTestId('plant-model-title')).toHaveText('Flor completa');
});

test('Studio em celular: geradores em faixa, folha e mapa mental sem rolagem horizontal', async ({ page }) => {
  await login(page, 'completo');
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.goto('/studio?aula=teoria-celular');
  const slides = page.getByTestId('studio-tool-slides');
  const activity = page.getByTestId('studio-tool-atividades');
  await expect(slides).toBeVisible();
  // the five generators share one row instead of filling the first screen
  expect(Math.abs((await slides.boundingBox())!.y - (await activity.boundingBox())!.y)).toBeLessThan(4);
  expect(await overflow()).toBeLessThanOrEqual(1);
  await activity.click();
  await expect(page.getByTestId('studio-activity')).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(1);
  await page.getByTestId('studio-tool-mapas-mentais').click();
  await expect(page.getByTestId('studio-mindmap')).toBeVisible();
  expect(await overflow()).toBeLessThanOrEqual(1);
});
