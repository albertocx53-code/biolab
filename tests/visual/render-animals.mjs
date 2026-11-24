// Renders the dashboard card image of the Animals lab, with a transparent background.
// Usage: KEY=<chave Completo> BASE=http://localhost:3000 node tests/visual/render-animals.mjs <saída>
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:3400';
const out = process.argv[2] ?? 'public/images';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 640, height: 400 }, deviceScaleFactor: 2 });
await p.addInitScript(() => localStorage.setItem('biolab.quality', 'equilibrado'));
await p.request.post(BASE + '/api/access', { data: { key: process.env.KEY } });
await p.goto(BASE + '/explorar/animais?modelo=peixe');
await p.waitForFunction(() => window.__biolab?.registry?.size() > 5 && window.__biolab.three, null, { timeout: 240000 });
await p.evaluate(() => {
  window.__biolab.viewer.getState().setLabels(false);
  window.__biolab.three().controls.setLookAt(2.6, 2.2, 11.2, -0.2, 0.1, 0, false);
  window.__biolab.three().invalidate();
});
await p.keyboard.press('h');
await p.addStyleTag({ content: '.lab-backdrop{display:none!important} html,body{background:transparent!important} button{display:none!important} nextjs-portal{display:none!important}' });
await p.waitForTimeout(5000);
await p.screenshot({ path: `${out}/card-animais.png`, omitBackground: true, timeout: 180000 });
await b.close();
