import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('painel mostra os seis laboratórios com status honesto', async ({ page }) => {
  await login(page, 'basico');
  await page.goto('/explorar');
  const cards = page.locator('[data-testid^=lab-card-]');
  await expect(cards).toHaveCount(6);
  for (const t of ['Corpo Humano', 'Plantas', 'Animais', 'Células', 'Genética', 'Microrganismos']) await expect(page.getByRole('heading', { name: t })).toBeVisible();
  for (const slug of ['corpo-humano', 'celulas', 'plantas', 'animais', 'genetica', 'microrganismos']) await expect(page.getByTestId(`lab-card-${slug}`)).toContainText('Disponível');
});

test('Plano Básico não acessa o Studio', async ({ page }) => {
  await login(page, 'basico');
  await page.goto('/studio?v=1&lab=anatomia-humana&estrutura=testis-dir');
  await expect(page.getByTestId('studio-locked')).toBeVisible();
  await expect(page.getByTestId('studio-topic')).toHaveCount(0);
});

test('Plano Completo recebe o tema do Explorer no Studio e vê as aulas que o mostram', async ({ page }) => {
  await login(page, 'completo');
  await page.goto('/studio?v=1&lab=anatomia-humana&estrutura=testis-dir');
  await expect(page.getByTestId('studio-topic')).toContainText('Testículo (lado direito)');
  await expect(page.getByTestId('studio-topic')).toContainText('Espermatogênese');
  await expect(page.getByTestId('studio-picker')).toBeVisible();
  await expect(page.getByText('Mostra o tema').first()).toBeVisible();
});

test('Studio gera slides, atividade, mapa mental, plano e aula emergencial com imagens 3D', async ({ page }) => {
  await login(page, 'completo');
  await page.goto('/studio?lab=celulas');
  await page.getByTestId('studio-lesson-teoria-celular').click();
  await expect(page).toHaveURL(/aula=teoria-celular/);
  // slides: 3D pictures, presentation and PowerPoint
  const preview = page.getByTestId('studio-preview');
  await expect(preview.locator('img[src^="/studio/teoria-celular/"]').first()).toBeVisible();
  await page.getByTestId('studio-present').click();
  await expect(page.getByTestId('studio-presenter')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('studio-presenter')).toHaveCount(0);
  const [download] = await Promise.all([page.waitForEvent('download', { timeout: 90_000 }), page.getByTestId('studio-pptx').click()]);
  expect(download.suggestedFilename()).toMatch(/\.pptx$/);
  // activity: numbered drawing, answer key and another version
  await page.getByTestId('studio-tool-atividades').click();
  await expect(page.getByTestId('studio-activity').locator('svg image[href$="-linhas.png"]').first()).toBeAttached();
  await expect(page.getByTestId('studio-answer-key')).toContainText('Gabarito');
  const before = await page.getByTestId('studio-activity').innerText();
  await page.getByTestId('studio-new-version').click();
  await expect.poll(() => page.getByTestId('studio-activity').innerText()).not.toBe(before);
  // mind map with pictures
  await page.getByTestId('studio-tool-mapas-mentais').click();
  expect(await page.getByTestId('studio-mindmap').locator('image').count()).toBeGreaterThan(3);
  // text documents
  await page.getByTestId('studio-tool-planos-de-aula').click();
  await expect(page.getByTestId('studio-plan')).toContainText('Desenvolvimento');
  await page.getByTestId('studio-tool-aulas-emergenciais').click();
  await expect(page.getByTestId('studio-emergency')).toContainText('Roteiro rápido');
  await expect(page).toHaveURL(/gerador=aulas-emergenciais/);
});

test('o Studio também recebe temas do laboratório de Células', async ({ page }) => {
  await login(page, 'completo');
  await page.goto('/studio?v=1&lab=celulas&estrutura=mitocondria');
  await expect(page.getByTestId('studio-topic')).toContainText('Mitocôndria');
  await expect(page.getByTestId('studio-topic')).toContainText('Respiração celular');
});

test('o Studio também recebe temas do laboratório de Plantas', async ({ page }) => {
  await login(page, 'completo');
  await page.goto('/studio?v=1&lab=plantas&estrutura=xilema');
  await expect(page.getByTestId('studio-topic')).toContainText('Xilema');
  await expect(page.getByTestId('studio-topic')).toContainText('Seiva bruta');
});
