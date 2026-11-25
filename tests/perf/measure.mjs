#!/usr/bin/env node
/**
 * Performance probe for the Human Anatomy lab (production build).
 *   BASE=http://localhost:3100 KEY=BIO3D-... node tests/perf/measure.mjs [--gpu] [--headed]
 * Without --gpu Chromium renders with SwiftShader (CPU): FPS numbers are then a
 * worst-case floor, not representative of school hardware with a real GPU.
 * --headed opens a visible window, the only mode that reliably uses the real GPU.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:3100';
const KEY = process.env.KEY;
const gpu = process.argv.includes('--gpu');
// Headless Chromium falls back to software rendering even with --gpu; `--headed` opens a real window
// (hardware WebGL) for a measurement representative of a classroom computer.
const headed = process.argv.includes('--headed');
const args = gpu || headed ? ['--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

// CHANNEL=msedge|chrome uses the browser installed on the machine (no Playwright download needed)
const browser = await chromium.launch({ args, headless: !headed, channel: process.env.CHANNEL || undefined });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Performance.enable');
let bytes = 0;
const sizes = {};
page.on('response', async (r) => {
  const len = Number(r.headers()['content-length'] ?? 0) || (await r.body().catch(() => Buffer.alloc(0))).length;
  bytes += len;
  if (/\.glb|catalog\.json/.test(r.url())) sizes[r.url().split('/').pop()] = len;
});
await page.request.post(`${BASE}/api/access`, { data: { key: KEY } });

const heap = async () => {
  const { metrics } = await cdp.send('Performance.getMetrics');
  return Math.round(metrics.find((m) => m.name === 'JSHeapUsedSize').value / 1e6);
};
const ready = () =>
  page.waitForFunction(
    () => {
      const b = window.__biolab;
      return b?.registry && b.three && b.registry.size() > 300 && !Object.values(b.viewer.getState().modelState).includes('loading');
    },
    null,
    { timeout: 240000 },
  );

const t0 = Date.now();
await page.goto(`${BASE}/explorar/corpo-humano`, { waitUntil: 'domcontentloaded' });
const tDom = Date.now() - t0;
await ready();
const tScene = Date.now() - t0;
const bytesInitial = bytes;
const heapInitial = await heap();

async function fps(ms = 3000) {
  return page.evaluate(async (ms) => {
    const st = window.__biolab.three();
    let frames = 0;
    const start = performance.now();
    let worst = 0;
    let last = start;
    // the post-processing composer resets gl.info per pass: accumulate one whole frame by hand
    st.gl.info.autoReset = false;
    let calls = 0;
    let triangles = 0;
    await new Promise((res) => {
      const tick = () => {
        const now = performance.now();
        worst = Math.max(worst, now - last);
        last = now;
        frames++;
        calls = st.gl.info.render.calls;
        triangles = st.gl.info.render.triangles;
        st.gl.info.reset();
        st.controls.rotate(0.01, 0, false);
        st.invalidate();
        if (now - start < ms) requestAnimationFrame(tick);
        else res();
      };
      requestAnimationFrame(tick);
    });
    st.gl.info.autoReset = true;
    return { fps: +(frames / (ms / 1000)).toFixed(1), worstFrameMs: Math.round(worst), drawCalls: calls, triangles };
  }, ms);
}
const fpsDefault = await fps();

// interaction latency: search → panel visible
const tSel0 = Date.now();
await page.getByRole('combobox', { name: 'Buscar estrutura anatômica' }).fill('coracao');
await page.keyboard.press('Enter');
await page.getByTestId('scientific-panel').waitFor();
const selectMs = Date.now() - tSel0;

// all systems on
const t1 = Date.now();
await page.evaluate(() => {
  const v = window.__biolab.viewer.getState();
  for (const g of ['muscular', 'vasos', 'nervoso', 'linfatico']) v.setGroupVisible(g, true);
});
await page.waitForFunction(() => window.__biolab.registry.size() > 2000 && !Object.values(window.__biolab.viewer.getState().modelState).includes('loading'), null, { timeout: 240000 });
const tAll = Date.now() - t1;
const fpsAll = await fps();
const heapAll = await heap();

// leave the lab and check memory release
await page.getByRole('link', { name: 'Voltar aos laboratórios' }).click();
await page.waitForURL('**/explorar');
await page.waitForTimeout(3000);
await cdp.send('HeapProfiler.collectGarbage').catch(() => {});
const heapAfterLeave = await heap();
const meshesAfterLeave = await page.evaluate(() => window.__biolab.registry.size());

const out = {
  renderer: headed ? 'GPU do sistema (janela real)' : gpu ? 'Chromium headless (--gpu; costuma cair em software)' : 'SwiftShader (CPU, sem GPU)',
  viewport: '1366x768',
  domContentLoadedMs: tDom,
  firstInteractiveSceneMs: tScene,
  initialDownloadMB: +(bytesInitial / 1e6).toFixed(2),
  assetSizesKB: Object.fromEntries(Object.entries(sizes).map(([k, v]) => [k, Math.round(v / 1e3)])),
  jsHeapInitialMB: heapInitial,
  defaultScene: fpsDefault,
  selectionLatencyMs: selectMs,
  allSystemsLoadMs: tAll,
  allSystems: fpsAll,
  jsHeapAllSystemsMB: heapAll,
  jsHeapAfterLeavingLabMB: heapAfterLeave,
  meshesRegisteredAfterLeaving: meshesAfterLeave,
};
console.log(JSON.stringify(out, null, 2));
await browser.close();
