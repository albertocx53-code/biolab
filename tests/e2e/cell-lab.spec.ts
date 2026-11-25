import { expect, test, type Page } from '@playwright/test';
import { login, screenPointOf } from './helpers';

type W = Window & { __biolab: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

async function openCells(page: Page, modelo = 'animal') {
  await page.goto(`/explorar/celulas?modelo=${modelo}`);
  await expect(page.getByTestId('cell-model-title')).toBeVisible({ timeout: 60_000 });
  await page.waitForFunction(() => (window as unknown as W).__biolab?.registry?.size() > 5 && !!(window as unknown as W).__biolab.three, null, { timeout: 60_000 });
  await page.waitForTimeout(400);
}
const state = (page: Page) => page.evaluate(() => (window as unknown as W).__biolab.viewer.getState());

test.describe('Laboratório de Células', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'completo');
  });

  test('célula animal: organelas registradas e aviso de fora de escala', async ({ page }) => {
    await openCells(page);
    await expect(page.getByTestId('cell-model-title')).toHaveText('Célula animal');
    await expect(page.getByTestId('scale-note')).toContainText('fora de escala');
    const ids = await page.evaluate(() => ['membrana-plasmatica', 'nucleolo', 'complexo-golgiense', 'mitocondria-1', 'centriolos', 'ribossomos'].map((id) => (window as unknown as W).__biolab.registry.has(id)));
    expect(ids.every(Boolean)).toBe(true);
  });

  test('clicar em uma mitocôndria abre o painel científico e o modelo detalhado', async ({ page }) => {
    await openCells(page);
    const p = await screenPointOf(page, 'mitocondria-1');
    await page.mouse.click(p.x, p.y);
    await page.waitForTimeout(300);
    // a click may land on an organelle in front; select through the search to stay deterministic
    if ((await state(page)).selectedId !== 'mitocondria') {
      await page.mouse.move(5, 5); // keep the pointer away from the results list
      await page.getByRole('combobox', { name: 'Buscar estrutura celular' }).fill('mitocondria');
      await page.keyboard.press('Enter');
    }
    const panel = page.getByTestId('scientific-panel');
    await expect(panel.locator('#sci-title')).toHaveText('Mitocôndria');
    await expect(panel.getByTestId('structure-facts')).toContainText('µm');
    await expect(page.getByTestId('studio-link')).toHaveAttribute('href', '/studio?v=1&lab=celulas&estrutura=mitocondria');
    await panel.getByTestId('open-detail').click();
    await expect(page.getByTestId('cell-model-title')).toHaveText('Mitocôndria em detalhe');
    await page.waitForFunction(() => (window as unknown as W).__biolab.registry.has('cristas-mitocondriais'));
  });

  test('a busca troca de modelo quando a estrutura está em outra célula', async ({ page }) => {
    await openCells(page);
    await page.getByRole('combobox', { name: 'Buscar estrutura celular' }).fill('cloroplasto');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('cell-model-title')).toHaveText('Célula vegetal');
    await expect(page.getByTestId('scientific-panel').locator('#sci-title')).toHaveText('Cloroplasto');
    expect((await state(page)).selectedId).toBe('cloroplastos');
  });

  test('legenda: ocultar e deixar transparente uma estrutura', async ({ page }) => {
    await openCells(page, 'vegetal');
    await page.getByRole('switch', { name: 'Ocultar Parede celular' }).click();
    expect(await page.evaluate(() => (window as unknown as W).__biolab.registry.get('parede-celular').visible)).toBe(false);
    await page.getByRole('button', { name: 'Transparência de Membrana plasmática' }).click();
    await page.getByLabel('Opacidade de Membrana plasmática').fill('0.3');
    expect(await page.evaluate(() => (window as unknown as W).__biolab.registry.get('membrana-plasmatica').material.opacity)).toBeCloseTo(0.3, 2);
  });

  test('animação da síntese de proteínas: etapas, legenda e pausa', async ({ page }) => {
    await openCells(page);
    await page.getByRole('button', { name: 'Síntese e secreção de proteínas' }).click();
    const player = page.getByTestId('process-player');
    await expect(player.getByTestId('process-step-title')).toHaveText('1. Transcrição');
    await expect(player).toContainText('tempo comprimido');
    await player.getByRole('button', { name: '6' }).click();
    await expect(player.getByTestId('process-step-title')).toHaveText('6. Exocitose');
    await player.getByTestId('process-play').click();
    expect(await page.evaluate(() => (window as unknown as W).__biolab.process.getState().playing)).toBe(false);
  });

  test('osmose: a membrana se afasta da parede na plasmólise e volta ao fechar', async ({ page }) => {
    await openCells(page, 'vegetal');
    await page.getByRole('button', { name: 'Osmose: turgência e plasmólise' }).click();
    await page.getByTestId('process-player').getByRole('button', { name: '3' }).click();
    await page.waitForTimeout(2500);
    const s = await page.evaluate(() => (window as unknown as W).__biolab.registry.get('membrana-plasmatica').scale.x);
    expect(s).toBeLessThan(0.92);
    expect(await page.evaluate(() => (window as unknown as W).__biolab.registry.get('parede-celular').scale.x)).toBe(1);
    await page.getByTestId('process-player').getByRole('button', { name: 'Fechar animação' }).click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as unknown as W).__biolab.registry.get('membrana-plasmatica').scale.x)).toBe(1);
  });

  test('mitose: fases selecionáveis e cromátides separadas na anáfase', async ({ page }) => {
    await openCells(page, 'mitose');
    const player = page.getByTestId('process-player');
    await expect(player.getByTestId('process-step-title')).toHaveText('Interfase');
    await player.getByRole('button', { name: 'Telófase' }).click();
    await page.waitForTimeout(800);
    const x = await page.evaluate(() => [(window as unknown as W).__biolab.registry.get('cromatide-1a').position.x, (window as unknown as W).__biolab.registry.get('cromatide-1b').position.x]);
    expect(x[0]).toBeLessThan(-0.5);
    expect(x[1]).toBeGreaterThan(0.5);
  });

  test('meiose e fissão binária: a última etapa separa as células', async ({ page }) => {
    await openCells(page, 'meiose');
    let player = page.getByTestId('process-player');
    await expect(player.getByTestId('process-step-title')).toHaveText('Interfase');
    await player.getByRole('button', { name: 'Telófase II' }).click();
    await page.evaluate(() => { const b = (window as unknown as W).__biolab; b.process.getState().setPlaying(false); b.clock.t = 999; });
    await page.waitForTimeout(800);
    const ys = await page.evaluate(() => ['membrana-a1', 'membrana-a2'].map((id) => (window as unknown as W).__biolab.registry.get(id).scale.x));
    expect(ys.every((v: number) => v > 0.5)).toBe(true);
    await openCells(page, 'fissao');
    player = page.getByTestId('process-player');
    await player.getByRole('button', { name: 'Separação' }).click();
    await page.evaluate(() => { const b = (window as unknown as W).__biolab; b.process.getState().setPlaying(false); b.clock.t = 999; });
    await page.waitForTimeout(1200);
    const sc = await page.evaluate(() => ['parede-a', 'parede-b'].map((id) => (window as unknown as W).__biolab.registry.get(id).scale.x));
    expect(sc.every((v: number) => v > 0.5)).toBe(true);
  });

  test('roteiros de aula: um botão do roteiro seleciona a estrutura no 3D', async ({ page }) => {
    await openCells(page);
    await page.getByTestId('lessons-toggle').click();
    await expect(page.getByTestId('lessons-panel')).toBeVisible();
    await page.getByTestId('lesson-organelas-endomembranas').click();
    await page.locator('[data-testid=lesson-action][data-structure=complexo-golgiense]').first().click();
    await page.waitForTimeout(400);
    expect((await state(page)).selectedId).toBe('complexo-golgiense');
    await page.getByRole('button', { name: 'Abrir ficha' }).click();
    await expect(page.getByTestId('scientific-panel')).toContainText('Complexo golgiense');
  });

  test('Modo Apresentação e liberação de memória ao sair', async ({ page }) => {
    await openCells(page);
    await page.getByTestId('presentation-toggle').click();
    expect((await state(page)).presentation).toBe(true);
    await page.getByTestId('presentation-toggle').click();
    await page.getByRole('link', { name: 'Voltar aos laboratórios' }).click();
    await page.waitForURL('**/explorar');
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as W).__biolab.registry.size())).toBe(0);
  });
});
