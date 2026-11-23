import { expect, test } from '@playwright/test';
import { login, openHumanLab, screenPointOf } from './helpers';

test.describe('Laboratório Corpo Humano', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'completo');
    await openHumanLab(page);
  });

  test('carrega o modelo com sistemas separados e camadas sob demanda', async ({ page }) => {
    const loaded = await page.evaluate(() => (window as any).__biolab.viewer.getState().modelState);
    // abre na camada muscular (como um atlas); pele e nervos só carregam quando pedidos
    expect(loaded).toMatchObject({ esqueletico: 'ready', visceral: 'ready', coracao: 'ready', muscular: 'ready' });
    expect(loaded.nervoso).toBeUndefined();
    await page.getByRole('switch', { name: 'Mostrar Sistema nervoso (nervos)' }).click();
    await page.waitForFunction(() => (window as any).__biolab.viewer.getState().modelState.nervoso === 'ready', null, { timeout: 60_000 });
    expect(await page.evaluate(() => (window as any).__biolab.registry.size())).toBeGreaterThan(1200);
  });

  test('controle de profundidade: pele → músculos → esqueleto → órgãos', async ({ page }) => {
    const vis = () => page.evaluate(() => { const s = (window as any).__biolab.viewer.getState(); return [s.groupVisible.tegumentar, s.groupVisible.muscular, s.groupVisible.esqueletico]; });
    // com a pele opaca os músculos (totalmente cobertos) não são desenhados
    await page.getByRole('button', { name: 'Pele', exact: true }).click();
    expect(await vis()).toEqual([true, false, true]);
    await page.getByRole('button', { name: 'Músculos', exact: true }).click();
    expect(await vis()).toEqual([false, true, true]);
    await page.getByRole('button', { name: 'Esqueleto', exact: true }).click();
    expect(await vis()).toEqual([false, false, true]);
    await page.getByRole('button', { name: 'Órgãos', exact: true }).click();
    expect(await vis()).toEqual([false, false, false]);
  });

  test('clique no coração seleciona a estrutura e abre o painel científico', async ({ page }) => {
    await page.getByRole('button', { name: 'Órgãos', exact: true }).click();
    const p = await screenPointOf(page, 'left-ventricle');
    await page.mouse.click(p.x, p.y);
    const panel = page.getByTestId('scientific-panel');
    await expect(panel).toBeVisible();
    await expect(panel.locator('#sci-title')).toHaveText(/Ventrículo/);
    await panel.getByText('Faz parte de:').getByRole('button', { name: 'Coração' }).click();
    await expect(panel.locator('#sci-title')).toHaveText('Coração');
    await expect(panel).toContainText('circulação pulmonar');
    expect(await page.evaluate(() => (window as any).__biolab.viewer.getState().selectedId)).toBe('coracao');
  });

  test('coração e circulação: vasos visíveis, corte do coração e animação do sangue', async ({ page }) => {
    expect(await page.evaluate(() => (window as any).__biolab.viewer.getState().groupVisible.vasos)).toBe(true);
    await page.getByRole('button', { name: 'Ver coração e vasos' }).click();
    await page.waitForTimeout(500);
    const st = await page.evaluate(() => (window as any).__biolab.viewer.getState());
    expect(st.groupVisible.coracao && st.groupVisible.vasos).toBe(true);
    expect(st.groupOpacity.respiratorio).toBeLessThan(0.5);
    await page.getByRole('button', { name: 'Corte do coração' }).click();
    await expect(page.getByRole('button', { name: 'Fechar o coração' })).toBeVisible();
    await page.getByRole('button', { name: /Caminho do sangue/ }).click();
    await expect(page.getByTestId('process-player')).toBeVisible();
    await page.getByTestId('process-player').getByRole('button', { name: 'Fechar animação' }).click();
  });

  test('rins, encéfalo e sistema feminino modelados pelo BioLab: cortes, troca de sistema e ficha', async ({ page }) => {
    const bl = () => page.evaluate(() => { const b = (window as any).__biolab; const s = b.viewer.getState(); return { has: ['cortex-renal-esq', 'lobo-frontal-esq', 'cerebelo', 'utero'].every((id) => b.registry.has(id)), m: s.groupVisible.reprodutor, f: s.groupVisible['reprodutor-feminino'], n: s.groupVisible.nervoso }; });
    await page.waitForFunction(() => (window as any).__biolab.registry.has('utero'), null, { timeout: 30_000 });
    expect((await bl()).has).toBe(true);
    await page.getByTestId('kidney-cut').click();
    await expect(page.getByRole('button', { name: 'Fechar os rins' })).toBeVisible();
    await page.getByTestId('brain-cut').click();
    await expect(page.getByRole('button', { name: 'Fechar o encéfalo' })).toBeVisible();
    expect((await bl()).n).toBe(true);
    // feminino e masculino se alternam
    expect((await bl()).f).toBe(false);
    await page.getByTestId('toggle-sex').click();
    await page.waitForTimeout(300);
    expect(await bl()).toMatchObject({ f: true, m: false });
    await page.getByTestId('toggle-sex').click();
    await page.waitForTimeout(300);
    expect(await bl()).toMatchObject({ f: false, m: true });
    // a ficha do útero vem do conteúdo próprio
    await page.getByRole('combobox', { name: 'Buscar estrutura anatômica' }).fill('utero');
    await page.keyboard.press('Enter');
    const panel = page.getByTestId('scientific-panel');
    await expect(panel.locator('#sci-title')).toHaveText('Útero');
    await expect(panel).toContainText('endométrio');
    expect(await bl()).toMatchObject({ f: true, m: false });
  });

  test('roteiros de aula: um botão do roteiro mostra um sistema e seleciona um órgão', async ({ page }) => {
    await page.getByTestId('lessons-toggle').click();
    await expect(page.getByTestId('lessons-panel')).toBeVisible();
    await page.getByTestId('lesson-sistema-digestorio').click();
    await page.locator('[data-testid=lesson-action][data-structure=stomach]').first().click();
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as any).__biolab.viewer.getState().selectedId)).toBe('stomach');
  });

  test('busca, foco, isolamento e ligação com o Studio', async ({ page }) => {
    await page.getByRole('combobox', { name: 'Buscar estrutura anatômica' }).fill('testiculo');
    await page.keyboard.press('Enter');
    const panel = page.getByTestId('scientific-panel');
    await expect(panel.locator('#sci-title')).toHaveText('Testículo (lado direito)');
    await expect(panel).toContainText('Espermatogênese');
    await panel.getByRole('button', { name: 'Isolar' }).click();
    expect(await page.evaluate(() => (window as any).__biolab.viewer.getState().isolatedMeshIds)).toEqual(['testis-dir']);
    await expect(page.getByTestId('studio-link')).toHaveAttribute('href', '/studio?v=1&lab=anatomia-humana&estrutura=testis-dir');
  });

  test('clique no braço abre a região e revela os ossos', async ({ page }) => {
    await page.getByRole('button', { name: 'Pele', exact: true }).click();
    await page.waitForFunction(() => (window as any).__biolab.viewer.getState().modelState.tegumentar === 'ready', null, { timeout: 60_000 });
    await page.waitForTimeout(300);
    const p = await screenPointOf(page, 'humerus-dir');
    await page.mouse.click(p.x - 10, p.y);
    const region = page.getByTestId('region-panel');
    await expect(region.locator('#region-title')).toHaveText('Braço direito');
    await region.getByRole('tab', { name: /Ossos/ }).click();
    await region.getByRole('button', { name: 'Úmero (lado direito)' }).click();
    await expect(page.getByTestId('scientific-panel').locator('#sci-title')).toHaveText('Úmero (lado direito)');
    await page.getByTestId('scientific-panel').getByRole('button', { name: 'Fechar painel' }).click();
    await region.getByRole('tab', { name: /Músculos/ }).click();
    await page.waitForFunction(() => (window as any).__biolab.viewer.getState().modelState.muscular === 'ready', null, { timeout: 60_000 });
    await expect(region.getByRole('button', { name: /bíceps braquial/ }).first()).toBeVisible();
  });

  test('camadas: ocultar sistema e transparência', async ({ page }) => {
    await page.getByRole('switch', { name: 'Ocultar Sistema esquelético' }).click();
    const visible = await page.evaluate(() => (window as any).__biolab.registry.get('humerus-dir').visible);
    expect(visible).toBe(false);
    await page.getByRole('button', { name: 'Transparência de Sistema digestório' }).click();
    await page.getByLabel('Opacidade de Sistema digestório').fill('0.3');
    const op = await page.evaluate(() => (window as any).__biolab.registry.get('liver').material.opacity);
    expect(op).toBeCloseTo(0.3, 2);
  });

  test('câmera: vistas, reinício e zoom', async ({ page }) => {
    const pos = () => page.evaluate(() => (window as any).__biolab.three().camera.position.toArray().map((v: number) => +v.toFixed(2)));
    const start = await pos();
    await page.getByRole('button', { name: 'Costas' }).click();
    await page.waitForTimeout(1200);
    const back = await pos();
    expect(back[2]).toBeLessThan(0);
    await page.keyboard.press('r');
    await page.waitForTimeout(2500);
    const reset = await pos();
    reset.forEach((v: number, i: number) => expect(v).toBeCloseTo(start[i], 1));
    await page.getByRole('button', { name: 'Aproximar' }).click();
    await page.waitForTimeout(1000);
    await expect(page.getByLabel('Nível de zoom')).not.toHaveText('100%');
  });

  test('Modo Apresentação: tela limpa, textos maiores e atalhos', async ({ page }) => {
    await page.getByTestId('presentation-toggle').click();
    expect(await page.evaluate(() => (window as any).__biolab.viewer.getState().presentation)).toBe(true);
    await expect(page.getByTestId('layers-panel')).toHaveCount(0);
    await expect(page.locator('[data-presentation=true]')).toHaveCount(1);
    await page.keyboard.press('h');
    await expect(page.getByRole('button', { name: /Mostrar interface/ })).toBeVisible();
    await page.keyboard.press('h');
    await page.getByTestId('presentation-toggle').click();
    expect(await page.evaluate(() => (window as any).__biolab.viewer.getState().presentation)).toBe(false);
  });

  test('libera a memória dos modelos ao sair do laboratório', async ({ page }) => {
    await page.getByRole('link', { name: 'Voltar aos laboratórios' }).click();
    await page.waitForURL('**/explorar');
    await page.waitForTimeout(2500);
    const left = await page.evaluate(() => (window as any).__biolab.registry.size());
    expect(left).toBe(0);
  });
});
