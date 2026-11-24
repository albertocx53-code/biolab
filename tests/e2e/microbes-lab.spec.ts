import { expect, test, type Page } from '@playwright/test';
import { login } from './helpers';

type W = Window & { __biolab: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

async function openMicrobes(page: Page, modelo = 'bacterias') {
  await page.goto(`/explorar/microrganismos?modelo=${modelo}`);
  await expect(page.getByTestId('microbes-model-title')).toBeVisible({ timeout: 60_000 });
  await page.waitForFunction(() => (window as unknown as W).__biolab?.registry?.size() > 3 && !!(window as unknown as W).__biolab.three, null, { timeout: 60_000 });
  await page.waitForTimeout(400);
}
const reg = (page: Page, id: string, expr: string) =>
  page.evaluate(([id, expr]) => new Function('m', `return ${expr}`)((window as unknown as W).__biolab.registry.get(id)), [id, expr] as const);
const jump = (page: Page, step: number, t: number) =>
  page.evaluate(
    ([step, t]) => {
      const b = (window as unknown as W).__biolab;
      b.process.getState().setStep(step);
      b.process.getState().setPlaying(false);
      b.clock.t = t;
    },
    [step, t] as const,
  );

test.describe('Laboratório de Microrganismos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'completo');
  });

  test('bactéria: estruturas registradas e aviso de fora de escala', async ({ page }) => {
    await openMicrobes(page);
    await expect(page.getByTestId('microbes-model-title')).toHaveText('Bactérias: estrutura e formas');
    await expect(page.getByTestId('scale-note')).toContainText('fora de escala');
    const ids = await page.evaluate(() => ['b-parede', 'b-nucleoide', 'b-plasmideos', 'b-flagelo', 'forma-estafilococo'].map((id) => (window as unknown as W).__biolab.registry.has(id)));
    expect(ids.every(Boolean)).toBe(true);
  });

  test('a busca por "spike" abre o coronavírus e a ficha da espícula', async ({ page }) => {
    await openMicrobes(page);
    await page.mouse.move(5, 5);
    await page.getByRole('combobox', { name: 'Buscar estrutura ou microrganismo' }).fill('spike');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('microbes-model-title')).toHaveText('Coronavírus (SARS-CoV-2)');
    await expect(page.getByTestId('scientific-panel').locator('#sci-title')).toHaveText('Espícula (proteína S)');
  });

  test('ciclo lítico: na última etapa a bactéria se rompe', async ({ page }) => {
    await openMicrobes(page, 'ciclo-viral');
    const player = page.getByTestId('process-player');
    await expect(player).toContainText('tempo comprimido');
    await jump(page, 4, 5);
    await expect(player.getByTestId('process-step-title')).toHaveText('5. Lise e liberação');
    await expect.poll(() => reg(page, 'bac-parede', 'm.scale.x'), { timeout: 20_000 }).toBeLessThan(0.01);
    await expect.poll(() => reg(page, 'frag-0', 'm.scale.x'), { timeout: 20_000 }).toBeGreaterThan(0.5);
  });

  test('resistência: as bactérias sensíveis somem depois do antibiótico', async ({ page }) => {
    await openMicrobes(page, 'resistencia');
    await jump(page, 2, 2);
    await expect.poll(() => reg(page, 'bac-0', 'm.scale.x'), { timeout: 20_000 }).toBeLessThan(0.01);
    expect(await reg(page, 'bac-3', 'm.scale.x')).toBeGreaterThan(0.5);
  });

  test('ferramentas: escala, comparação e crescimento', async ({ page }) => {
    await openMicrobes(page);
    await page.getByTestId('tool-escala').click();
    await expect(page.getByTestId('scale-ratio')).toContainText('250 vezes');
    await page.getByRole('button', { name: 'Fechar escala de tamanhos' }).click();
    await page.getByTestId('tool-comparar').click();
    await expect(page.getByTestId('compare-table')).toContainText('acelular');
    await page.getByRole('button', { name: 'Fechar comparação' }).click();
    await page.getByTestId('tool-crescimento').click();
    await page.getByTestId('growth-hours').fill('2');
    await expect(page.getByTestId('growth-result')).toContainText('64 bactérias');
  });

  test('roteiro de aula abre a animação do ciclo lisogênico', async ({ page }) => {
    await openMicrobes(page);
    await page.getByTestId('lessons-toggle').click();
    await page.getByTestId('lesson-virus-ciclos').click();
    await page.locator('[data-testid=lesson-action][data-process=ciclo-lisogenico]').first().click();
    await expect(page.getByTestId('microbes-model-title')).toHaveText('Ciclos do bacteriófago');
    await expect(page.getByTestId('process-player')).toContainText('Ciclo lisogênico');
  });
});
