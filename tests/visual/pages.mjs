import { chromium } from 'playwright';
// Usage: KEY=<chave Completo> BASE=http://localhost:3000 node tests/visual/<script>.mjs <saída>
const [,, dir] = process.argv;
const BASE = process.env.BASE ?? 'http://localhost:3400';
const b = await chromium.launch();
for (const [name, vp] of [['desk', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const p = await b.newPage({ viewport: vp });
  await p.goto(BASE + '/');
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${dir}/landing-${name}.png`, fullPage: true });
  await p.request.post(BASE + '/api/access', { data: { key: process.env.KEY } });
  await p.goto(BASE + '/explorar');
  await p.waitForTimeout(800);
  await p.screenshot({ path: `${dir}/dash-${name}.png`, fullPage: true });
  await p.close();
}
await b.close();
