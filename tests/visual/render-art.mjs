// Renders the marketing images (hero + dashboard card) from the live lab, with a transparent background.
// Usage: KEY=<chave Completo> BASE=http://localhost:3000 node tests/visual/<script>.mjs <saída>
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:3400';
const out = process.argv[2] ?? 'public/images';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
async function render(name, vp, setup) {
  const p = await b.newPage({ viewport: vp, deviceScaleFactor: 2 });
  await p.addInitScript(() => localStorage.setItem('biolab.quality', 'alta'));
  await p.request.post(BASE + '/api/access', { data: { key: process.env.KEY } });
  await p.goto(BASE + '/explorar/corpo-humano');
  const idle = () => p.waitForFunction(() => window.__biolab?.registry?.size() > 300 && !Object.values(window.__biolab.viewer.getState().modelState).includes('loading'), null, { timeout: 240000 });
  await idle();
  await p.evaluate(setup);
  await p.waitForTimeout(500);
  await idle();
  await p.keyboard.press('h');
  await p.addStyleTag({ content: '.lab-backdrop{display:none!important} html,body{background:transparent!important} button{display:none!important} nextjs-portal{display:none!important}' });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: `${out}/${name}.png`, omitBackground: true, timeout: 180000 });
  await p.close();
}
await render('hero-anatomia', { width: 760, height: 1000 }, () => {
  const v = window.__biolab.viewer.getState();
  v.setGroupVisible('vasos', true);
  v.setLabels(false);
  const c = window.__biolab.three().controls;
  c.setLookAt(1.25, 1.05, 3.1, 0, 0.9, 0, false);
  window.__biolab.three().invalidate();
});
await render('card-anatomia', { width: 640, height: 400 }, () => {
  const v = window.__biolab.viewer.getState();
  v.setGroupVisible('vasos', true);
  v.setLabels(false);
  const c = window.__biolab.three().controls;
  c.setLookAt(0.55, 1.35, 1.25, 0, 1.3, 0, false);
  window.__biolab.three().invalidate();
});
await b.close();
