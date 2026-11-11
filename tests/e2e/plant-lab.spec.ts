import { expect, test, type Page } from '@playwright/test';
import { login } from './helpers';

type W = Window & { __biolab: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

async function openPlants(page: Page, modelo = 'planta') {
  await page.goto(`/explorar/plantas?modelo=${modelo}`);
  await expect(page.getByTestId('plant-model-title')).toBeVisible({ timeout: 60_000 });
  await page.waitForFunction(() => (window as unknown as W).__biolab?.registry?.size() > 4 && !!(window as unknown as W).__biolab.three, null, { timeout: 60_000 });
  await page.waitForTimeout(400);
}
const reg = (page: Page, id: string, expr: string) =>
  page.evaluate(([id, expr]) => new Function('m', `return ${expr}`)((window as unknown as W).__biolab.registry.get(id)), [id, expr] as const);

test.describe('Laboratório de Plantas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'completo');
  });

  test('planta inteira: estruturas registradas e aviso de fora de escala', async ({ page }) => {
    await openPlants(page);
    await expect(page.getByTestId('plant-model-title')).toHaveText('Planta com flores');
    await expect(page.getByTestId('scale-note')).toContainText('fora de escala');
    const ids = await page.evaluate(() => ['raiz-principal', 'caule', 'limbo', 'flor', 'pericarpo', 'solo'].map((id) => (window as unknown as W).__biolab.registry.has(id)));
    expect(ids.every(Boolean)).toBe(true);
  });

  test('a busca leva ao estômato na folha em corte e o painel mostra o tamanho real', async ({ page }) => {
    await openPlants(page);
    await page.mouse.move(5, 5);
    await page.getByRole('combobox', { name: 'Buscar estrutura da planta' }).fill('estomato');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('plant-model-title')).toHaveText('Folha em corte');
    const panel = page.getByTestId('scientific-panel');
    await expect(panel.locator('#sci-title')).toHaveText('Estômato');
    await expect(panel.getByTestId('structure-facts')).toContainText('µm');
    await expect(page.getByTestId('studio-link')).toHaveAttribute('href', '/studio?v=1&lab=plantas&estrutura=estomato');
  });

  test('da folha da planta inteira para o corte da folha', async ({ page }) => {
    await openPlants(page);
    await page.mouse.move(5, 5);
    await page.getByRole('combobox', { name: 'Buscar estrutura da planta' }).fill('limbo');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('scientific-panel').locator('#sci-title')).toHaveText('Limbo');
    await page.getByTestId('open-detail').click();
    await expect(page.getByTestId('plant-model-title')).toHaveText('Folha em corte');
    await page.getByRole('button', { name: /Voltar à planta com flores/ }).click();
    await expect(page.getByTestId('plant-model-title')).toHaveText('Planta com flores');
  });

  test('transporte de seiva: etapas e aviso de animação esquemática', async ({ page }) => {
    await openPlants(page);
    await page.getByRole('button', { name: 'Transporte de seiva' }).click();
    const player = page.getByTestId('process-player');
    await expect(player.getByTestId('process-step-title')).toHaveText('1. Absorção pela raiz');
    await expect(player).toContainText('tempo comprimido');
    await player.getByRole('button', { name: '3' }).click();
    await expect(player.getByTestId('process-step-title')).toHaveText('3. Seiva elaborada desce pelo floema');
  });

  test('estômatos: as células-guarda se afastam e se aproximam', async ({ page }) => {
    await openPlants(page, 'folha');
    await page.getByRole('button', { name: 'Abertura e fechamento dos estômatos' }).click();
    // jump to the end of each step instead of waiting (software rendering is slow in CI)
    const jump = (step: number) =>
      page.evaluate((step) => {
        const b = (window as unknown as W).__biolab;
        b.process.getState().setStep(step);
        b.process.getState().setPlaying(false);
        b.clock.t = 4.5;
      }, step);
    await jump(0);
    await expect.poll(() => reg(page, 'guarda-dir', 'm.position.x'), { timeout: 20_000 }).toBeGreaterThan(0.03);
    await jump(1);
    await expect.poll(() => reg(page, 'guarda-dir', 'm.position.x'), { timeout: 20_000 }).toBeLessThan(-0.03);
    await page.getByTestId('process-player').getByRole('button', { name: 'Fechar animação' }).click();
    await page.waitForTimeout(300);
    expect(await reg(page, 'guarda-dir', 'm.position.x')).toBe(0);
  });

  test('germinação: a plântula cresce na última etapa', async ({ page }) => {
    await openPlants(page, 'semente');
    const player = page.getByTestId('process-player');
    await expect(player.getByTestId('process-step-title')).toHaveText('1. Embebição');
    expect(await reg(page, 'hipocotilo', 'm.scale.y')).toBeLessThan(0.1);
    await player.getByRole('button', { name: '5' }).click();
    await page.waitForTimeout(7000);
    expect(await reg(page, 'hipocotilo', 'm.scale.y')).toBeGreaterThan(0.95);
    expect(await reg(page, 'radicula', 'm.scale.y')).toBeGreaterThan(0.95);
  });

  test('fecundação: o ovário cresce e volta ao normal ao fechar a animação', async ({ page }) => {
    await openPlants(page, 'flor');
    await page.getByRole('button', { name: 'Fecundação e formação do fruto' }).click();
    await page.getByTestId('process-player').getByRole('button', { name: '4' }).click();
    await page.waitForTimeout(4500);
    expect(await reg(page, 'ovario', 'm.scale.x')).toBeGreaterThan(1.2);
    await page.getByTestId('process-player').getByRole('button', { name: 'Fechar animação' }).click();
    await page.waitForTimeout(300);
    expect(await reg(page, 'ovario', 'm.scale.x')).toBe(1);
  });
});
