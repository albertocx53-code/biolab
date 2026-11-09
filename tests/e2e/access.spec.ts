import { expect, test } from '@playwright/test';
import { keys } from './helpers';

test.describe('acesso por chave', () => {
  test('página de entrada em pt-BR, erro amigável e login válido', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Bem-vindo ao BioLab 3D' })).toBeVisible();
    await expect(page.getByText('A Biologia ganha vida na sua aula.').first()).toBeVisible();
    await page.getByLabel('Chave de acesso').fill('BIO3D-AAAAA-AAAAA-AAAAA-AAAAA');
    await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
    await expect(page.locator('#access-error')).toContainText('Não encontramos essa chave');
    await page.getByLabel('Chave de acesso').fill(keys().basico.toLowerCase());
    await page.getByRole('button', { name: 'Entrar na plataforma' }).click();
    await page.waitForURL('**/explorar');
    await expect(page.getByRole('heading', { name: 'O que vamos explorar hoje?' })).toBeVisible();
  });

  test('chave revogada é recusada', async ({ request }) => {
    const r = await request.post('/api/access', { data: { key: keys().revogada }, headers: { 'x-forwarded-for': '10.1.0.1' } });
    expect(r.status()).toBe(403);
    expect((await r.json()).error).toBe('revogada');
  });

  test('rotas protegidas exigem sessão', async ({ page, request }) => {
    await page.goto('/explorar');
    await expect(page).toHaveURL(/\/\?expirada=1/);
    await page.goto('/explorar/corpo-humano');
    await expect(page).toHaveURL(/\/\?expirada=1/);
    expect((await request.get('/api/session')).status()).toBe(401);
  });

  test('cookie forjado não dá acesso', async ({ page, context }) => {
    const forged = Buffer.from(JSON.stringify({ v: 1, sid: 'xxxxxxxxxxxx', kid: 'key_x', tier: 'completo', iat: 0, exp: 9999999999 })).toString('base64url');
    await context.addCookies([{ name: 'biolab_session', value: `${forged}.AAAA`, url: 'http://localhost:3100' }]);
    await page.goto('/explorar');
    await expect(page).toHaveURL(/\/\?expirada=1/);
  });

  test('sessão persiste e sai com "Sair"', async ({ page }) => {
    await page.request.post('/api/access', { data: { key: keys().completo }, headers: { 'x-forwarded-for': '10.1.0.2' } });
    await page.goto('/');
    await expect(page).toHaveURL(/\/explorar$/); // already signed in → straight to dashboard
    const s = await (await page.request.get('/api/session')).json();
    expect(s.tier).toBe('completo');
    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page).toHaveURL(/\/$/);
    expect((await page.request.get('/api/session')).status()).toBe(401);
  });

  test('limita tentativas inválidas (429)', async ({ request }) => {
    const headers = { 'x-forwarded-for': '10.9.9.9' };
    for (let i = 0; i < 5; i++) await request.post('/api/access', { data: { key: 'BIO3D-ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ' }, headers });
    const r = await request.post('/api/access', { data: { key: keys().completo }, headers });
    expect(r.status()).toBe(429);
    expect(r.headers()['retry-after']).toBeTruthy();
  });

  test('a chave secreta nunca aparece no HTML ou nos scripts', async ({ page }) => {
    const bodies: string[] = [];
    page.on('response', async (r) => {
      if (/javascript|html/.test(r.headers()['content-type'] ?? '')) bodies.push(await r.text().catch(() => ''));
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const all = bodies.join('\n');
    expect(all).not.toContain('e2e-only-key-pepper');
    expect(all).not.toContain('e2e-only-session-secret');
  });
});
