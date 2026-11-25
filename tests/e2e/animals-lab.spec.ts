import { expect, test, type Page } from '@playwright/test';
import { login } from './helpers';

type W = Window & { __biolab: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

async function openAnimals(page: Page, modelo = 'minhoca') {
  await page.goto(`/explorar/animais?modelo=${modelo}`);
  await expect(page.getByTestId('animals-model-title')).toBeVisible({ timeout: 60_000 });
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

test.describe('Laboratório de Animais', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'completo');
  });

  test('minhoca: estruturas registradas e aviso de fora de escala', async ({ page }) => {
    await openAnimals(page);
    await expect(page.getByTestId('animals-model-title')).toHaveText('Minhoca (anelídeos)');
    await expect(page.getByTestId('scale-note')).toContainText('fora de escala');
    const ids = await page.evaluate(() => ['ew-parede', 'ew-clitelo', 'ew-moela', 'ew-coracoes', 'ew-cordao', 'ew-nefridios'].map((id) => (window as unknown as W).__biolab.registry.has(id)));
    expect(ids.every(Boolean)).toBe(true);
  });

  test('a busca por "guelras" abre o peixe e a ficha das brânquias', async ({ page }) => {
    await openAnimals(page);
    await page.mouse.move(5, 5);
    await page.getByRole('combobox', { name: 'Buscar estrutura ou grupo animal' }).fill('guelras');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('animals-model-title')).toHaveText('Peixe ósseo');
    await expect(page.getByTestId('scientific-panel').locator('#sci-title')).toHaveText('Brânquias');
  });

  test('embrião: na última etapa aparecem os três folhetos', async ({ page }) => {
    await openAnimals(page, 'embriao');
    const player = page.getByTestId('process-player');
    await expect(player).toContainText('tempo comprimido');
    await jump(page, 5, 6);
    await expect(player.getByTestId('process-step-title')).toHaveText('6. Os três folhetos germinativos');
    await expect.poll(() => reg(page, 'em-mesoderme', 'm.scale.x'), { timeout: 20_000 }).toBeGreaterThan(0.5);
    expect(await reg(page, 'em-zigoto', 'm.scale.x')).toBeLessThan(0.01);
  });

  test('metamorfose do sapo: a cauda encolhe e o sapo aparece', async ({ page }) => {
    await openAnimals(page, 'metamorfose-sapo');
    await jump(page, 3, 5.5);
    await expect.poll(() => reg(page, 'mf-cauda', 'm.scale.x'), { timeout: 20_000 }).toBeLessThan(0.4);
    await jump(page, 4, 5.5);
    await expect.poll(() => reg(page, 'mf-sapo', 'm.scale.x'), { timeout: 20_000 }).toBeGreaterThan(0.8);
  });

  test('ferramentas: chave de identificação, comparação e árvore', async ({ page }) => {
    await openAnimals(page);
    await page.getByTestId('tool-chave').click();
    await page.getByTestId('key-yes').click(); // tecidos verdadeiros
    await page.getByTestId('key-no').click(); // não é radial
    await page.getByTestId('key-no').click(); // sem vértebras
    await page.getByTestId('key-no').click(); // não é equinodermo
    await page.getByTestId('key-no').click(); // sem exoesqueleto
    await page.getByTestId('key-no').click(); // não é molusco
    await page.getByTestId('key-yes').click(); // segmentado
    await expect(page.getByTestId('key-result')).toContainText('Anelídeos');
    await page.getByRole('button', { name: 'Fechar chave de identificação' }).click();
    await page.getByTestId('tool-comparar').click();
    await page.getByTestId('compare-mode-sistema').click();
    await page.getByTestId('compare-system-circulatorio').click();
    await expect(page.getByTestId('compare-system-table')).toContainText('4 cavidades');
    await page.getByRole('button', { name: 'Fechar comparação' }).click();
    await page.getByTestId('tool-arvore').click();
    await page.getByTestId('tree-innovation-amnio').click();
    await expect(page.getByTestId('tree-detail')).toContainText('Ovo amniótico');
  });

  test('roteiro de aula abre a animação da circulação comparada', async ({ page }) => {
    await openAnimals(page);
    await page.getByTestId('lessons-toggle').click();
    await page.getByTestId('lesson-animais-vertebrados').click();
    await page.locator('[data-testid=lesson-action][data-process=circulacao-comparada]').first().click();
    await expect(page.getByTestId('animals-model-title')).toHaveText('Corações dos vertebrados');
    await expect(page.getByTestId('process-player')).toContainText('Circulação comparada');
  });
});
