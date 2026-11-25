import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

export const keys = () => JSON.parse(readFileSync('.data/e2e-test-keys.json', 'utf8')) as { basico: string; completo: string; revogada: string };

let ipCounter = 10;
/** Each test gets its own client IP so the failed-attempt limiter does not leak between tests. */
export async function login(page: Page, tier: 'basico' | 'completo') {
  const res = await page.request.post('/api/access', { data: { key: keys()[tier] }, headers: { 'x-forwarded-for': `10.0.0.${ipCounter++}` } });
  if (!res.ok()) throw new Error(`login falhou: ${res.status()}`);
}

type BiolabWindow = Window & { __biolab?: { registry: { size(): number; get(id: string): unknown }; viewer: { getState(): Record<string, unknown> }; three?: () => unknown } };

export async function openHumanLab(page: Page) {
  await page.goto('/explorar/corpo-humano');
  await page.waitForFunction(
    () => {
      const b = (window as BiolabWindow).__biolab;
      if (!b?.registry || !b.three || b.registry.size() < 300) return false;
      const st = b.viewer.getState().modelState as Record<string, string>;
      if (st.tegumentar !== 'ready' || st.coracao !== 'ready') return false;
      return !Object.values(st).includes('loading');
    },
    null,
    { timeout: 90_000 },
  );
}

/** Screen position of a mesh centre (for real pointer clicks on the 3D canvas). */
export async function screenPointOf(page: Page, meshId: string) {
  return page.evaluate((id) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b = (window as any).__biolab;
    const st = b.three();
    const m = b.registry.get(id);
    m.geometry.computeBoundingBox();
    const c = m.geometry.boundingBox.getCenter(new m.position.constructor()).applyMatrix4(m.matrixWorld);
    const v = c.project(st.camera);
    const r = st.gl.domElement.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }, meshId);
}
