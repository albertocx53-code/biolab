import { expect, test, type Page } from '@playwright/test';
import { login } from './helpers';

type W = Window & { __biolab: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

async function openGenetics(page: Page, modelo = 'dna') {
  await page.goto(`/explorar/genetica?modelo=${modelo}`);
  await expect(page.getByTestId('genetics-model-title')).toBeVisible({ timeout: 60_000 });
  await page.waitForFunction(() => (window as unknown as W).__biolab?.registry?.size() > 4 && !!(window as unknown as W).__biolab.three, null, { timeout: 60_000 });
  await page.waitForTimeout(400);
}
const reg = (page: Page, id: string, expr: string) =>
  page.evaluate(([id, expr]) => new Function('m', `return ${expr}`)((window as unknown as W).__biolab.registry.get(id)), [id, expr] as const);

test.describe('Laboratório de Genética', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'completo');
  });

  test('dupla-hélice: estruturas registradas e aviso de fora de escala', async ({ page }) => {
    await openGenetics(page);
    await expect(page.getByTestId('genetics-model-title')).toHaveText('Dupla-hélice de DNA');
    await expect(page.getByTestId('scale-note')).toContainText('fora de escala');
    const ok = await page.evaluate(() => {
      const r = (window as unknown as W).__biolab.registry;
      return r.size() >= 5;
    });
    expect(ok).toBe(true);
  });

  test('a busca por "okazaki" abre a replicação e a ficha da fita nova', async ({ page }) => {
    await openGenetics(page);
    await page.mouse.move(5, 5);
    await page.getByRole('combobox', { name: 'Buscar estrutura ou molécula' }).fill('okazaki');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('genetics-model-title')).toHaveText('Replicação do DNA');
    await expect(page.getByTestId('scientific-panel').locator('#sci-title')).toHaveText('Fita nova de DNA');
  });

  test('tradução: o 3º tRNA aparece na etapa 3', async ({ page }) => {
    await openGenetics(page, 'traducao');
    const player = page.getByTestId('process-player');
    await expect(player).toContainText('tempo comprimido');
    await page.evaluate(() => {
      const b = (window as unknown as W).__biolab;
      b.process.getState().setStep(2);
      b.process.getState().setPlaying(false);
      b.clock.t = 2.5;
    });
    await expect(player.getByTestId('process-step-title')).toHaveText('3. Alongamento: códon GGA (Gly)');
    await expect.poll(() => reg(page, 'trna-2', 'm.scale.x'), { timeout: 20_000 }).toBeGreaterThan(0.5);
  });

  test('quadro de Punnett: Aa × Aa dá 3 : 1 e o diibridismo 9 : 3 : 3 : 1', async ({ page }) => {
    await openGenetics(page);
    await page.getByTestId('tool-punnett').click();
    const tool = page.getByTestId('punnett-tool');
    await expect(tool).toBeVisible();
    await expect(tool.getByTestId('punnett-grid').locator('tbody td')).toHaveCount(4);
    await expect(tool.getByTestId('punnett-phenotypes')).toContainText('Amarela');
    await expect(tool).toContainText('3 : 1');
    await tool.getByTestId('punnett-preset').selectOption('diibridismo');
    await expect(tool.getByTestId('punnett-grid').locator('tbody td')).toHaveCount(16);
    await expect(tool).toContainText('9 : 3 : 3 : 1');
    await tool.getByRole('button', { name: 'Fechar quadro de Punnett' }).click();
    await expect(tool).toBeHidden();
  });

  test('código genético traduz a fita-molde digitada', async ({ page }) => {
    await openGenetics(page);
    await page.getByTestId('tool-codigo').click();
    const tool = page.getByTestId('code-tool');
    await expect(tool.getByTestId('code-protein')).toContainText('Met');
    await tool.getByTestId('code-input').fill('TACAAAACT');
    await expect(tool.getByTestId('code-result')).toContainText('AUGUUUUGA');
    await expect(tool.getByTestId('code-protein')).toContainText('Phe');
  });

  test('roteiro de aula abre o quadro de Punnett', async ({ page }) => {
    await openGenetics(page);
    await page.getByTestId('lessons-toggle').click();
    await expect(page.getByTestId('lessons-panel')).toBeVisible();
    await page.getByTestId('lesson-leis-de-mendel').click();
    await page.locator('[data-testid=lesson-action][data-tool=punnett]').first().click();
    await expect(page.getByTestId('punnett-tool')).toBeVisible();
  });
});
