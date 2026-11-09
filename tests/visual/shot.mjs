import { chromium } from 'playwright';
// Usage: KEY=<chave Completo> BASE=http://localhost:3000 node tests/visual/<script>.mjs <saída>
const [,, out, mode='default'] = process.argv;
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const quality = process.env.Q ?? 'alta';
await p.addInitScript(([q, th]) => { try { localStorage.setItem('biolab.quality', q); if (th) localStorage.setItem('biolab.labTheme', th); } catch {} }, [quality, process.env.THEME ?? '']);
await p.request.post((process.env.BASE ?? 'http://localhost:3400') + '/api/access', { data: { key: process.env.KEY } });
await p.goto((process.env.BASE ?? 'http://localhost:3400') + '/explorar/corpo-humano');
await p.waitForFunction(() => window.__biolab?.registry?.size() > 300 && !Object.values(window.__biolab.viewer.getState().modelState).includes('loading'), null, { timeout: 120000 });
if (mode === 'skin') {
  await p.getByRole('button', { name: 'Pele', exact: true }).click();
}
if (mode === 'heart') {
  await p.getByRole('combobox', { name: 'Buscar estrutura anatômica' }).fill('coracao');
  await p.keyboard.press('Enter');
}
if (mode === 'skeleton') {
  await p.getByRole('button', { name: 'Esqueleto', exact: true }).click();
}
if (mode === 'muscle') {
  await p.evaluate(() => { const v = window.__biolab.viewer.getState(); v.setGroupVisible('muscular', true); v.setGroupVisible('tegumentar', false); });
  await p.waitForFunction(() => !Object.values(window.__biolab.viewer.getState().modelState).includes('loading'), null, { timeout: 120000 });
}
await p.waitForFunction(() => !Object.values(window.__biolab.viewer.getState().modelState).includes('loading'), null, { timeout: 120000 });
await p.waitForTimeout(3000);
await p.screenshot({ path: out, timeout: 120000 });
await b.close();
