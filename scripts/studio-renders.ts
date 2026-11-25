/**
 * Renders the images used by the Studio (slides, activities, mind maps).
 *
 * For every lesson script it opens the lesson's 3D laboratory in a headless
 * browser, runs each lesson action (open a model, select a structure, play an
 * animation step) and saves:
 *  - a colour render of the 3D scene (webp);
 *  - for model views, a line drawing (png) made from structure-id and depth
 *    passes, plus the screen position of each visible structure, so the Studio
 *    can draw numbered labels for "identify the structures" activities.
 *
 * Usage (dev server running with an access key that has Studio rights):
 *   BIOLAB_URL=http://localhost:3401 BIOLAB_KEY=... tsx scripts/studio-renders.ts [lessonId ...]
 * Output: public/studio/<lessonId>/*.{webp,png} and data/studio/renders.json
 */
import { chromium, type Page } from 'playwright';
import sharp from 'sharp';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { LESSONS, type Lesson, type LessonAction } from '@/data/biology/lessons';
import { LABORATORIES } from '@/data/biology/laboratories';
import type { LabProcess } from '@/laboratories/shared/process';
import { ANIMAL_PROCESSES } from '@/laboratories/animals/processes';
import { CELL_PROCESSES } from '@/laboratories/cells/processes';
import { GENETICS_PROCESSES } from '@/laboratories/genetics/processes';
import { HUMAN_PROCESSES } from '@/laboratories/human/processes';
import { EXTRA_MESHES } from '@/laboratories/human/extra-catalog';
import { MICROBE_PROCESSES } from '@/laboratories/microbes/processes';
import { PLANT_PROCESSES } from '@/laboratories/plants/processes';
import type { StudioImage, StudioRenders, StudioLabel } from '@/data/studio/images';

const PROCESSES: Record<string, Record<string, LabProcess>> = {
  animais: ANIMAL_PROCESSES,
  celulas: CELL_PROCESSES as Record<string, LabProcess>,
  genetica: GENETICS_PROCESSES,
  'anatomia-humana': HUMAN_PROCESSES,
  microrganismos: MICROBE_PROCESSES,
  plantas: PLANT_PROCESSES,
};

const BASE = process.env.BIOLAB_URL ?? 'http://localhost:3401';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public/studio');
const MANIFEST = path.join(ROOT, 'data/studio/renders.json');
const W = 1280;
const H = 800;
const MAX_STEPS = 6;
const DEBUG = !!process.env.STUDIO_DEBUG;
async function timed<T>(label: string, f: () => Promise<T>): Promise<T> {
  const t = Date.now();
  const r = await f();
  if (DEBUG) console.log(`  ${label} ${Date.now() - t}ms`);
  return r;
}

type B = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
declare const window: { __biolab: B };

function accessKey() {
  if (process.env.BIOLAB_KEY) return process.env.BIOLAB_KEY;
  return JSON.parse(readFileSync(path.join(ROOT, '.data/e2e-test-keys.json'), 'utf8')).completo as string;
}

async function ready(page: Page) {
  await page.waitForFunction(() => window.__biolab?.registry?.size() > 3 && !!window.__biolab.three && !!window.__biolab.lesson, null, { timeout: 240_000 });
  // a software GPU cannot keep up with animations: pause the render loop, frames are drawn on demand
  await page.evaluate(() => window.__biolab.three().setFrameloop('never'));
  // only the 3D canvas goes into the pictures (panels, labels and dev overlays hidden)
  await page.addStyleTag({ content: 'body *{visibility:hidden!important} canvas{visibility:visible!important} nextjs-portal{display:none!important}' });
  await page.waitForTimeout(1500);
}

async function reset(page: Page) {
  await page.evaluate(() => {
    const b = window.__biolab;
    b.process?.getState().stop();
    b.viewer.getState().isolate(null);
    b.viewer.getState().select(null);
  });
}

/** Soft studio backdrop behind the (transparent) 3D canvas. */
const BACKDROP = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><radialGradient id="g" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#eef2f6"/><stop offset="1" stop-color="#d9e0e8"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`,
);

/**
 * Renders one frame by hand (render loop paused) and reads the canvas back.
 * Much faster than a page screenshot while a software GPU is busy animating.
 */
async function grab(page: Page): Promise<Buffer> {
  const url: string = await page.evaluate(() => {
    const st = window.__biolab.three();
    st.setFrameloop('never');
    // let camera moves finish (camera-controls is stepped without drawing), then draw
    for (let i = 0; i < 80; i++) st.controls?.update(0.05);
    // in 'never' mode R3F takes the timestamp in seconds
    const t = st.clock.elapsedTime + 0.5;
    st.advance(t);
    st.advance(t + 1 / 60);
    return st.gl.domElement.toDataURL('image/png');
  });
  return Buffer.from(url.split(',')[1], 'base64');
}

async function shoot(page: Page, file: string) {
  const png = await sharp(await grab(page)).resize(W, H, { fit: 'cover' }).png().toBuffer();
  await sharp(BACKDROP).composite([{ input: png }]).webp({ quality: 82 }).toFile(file);
}

/**
 * Structure pictures: only the meshes the lab focused on stay visible, framed
 * close (like a textbook figure); the scene is restored afterwards.
 */
/** Mesh ids of each body system ("digestorio" → stomach, liver…), from the human catalog. */
const HUMAN_SYSTEMS = (() => {
  const m = new Map<string, string[]>();
  const file = path.join(process.cwd(), 'public/models/human/v1/catalog.json');
  if (!existsSync(file)) return m;
  // the catalog meshes plus the lab's own extra organs (kidneys, female reproductive system…)
  const all = [...(JSON.parse(readFileSync(file, 'utf8')).meshes as { id: string; g: string }[]), ...EXTRA_MESHES];
  for (const x of all) m.set(x.g, [...(m.get(x.g) ?? []), x.id]);
  return m;
})();

async function isolatedShot(page: Page, file: string, focus: string[], withLabels = false): Promise<{ ok: boolean; labels?: StudioLabel[] }> {
  if (focus.length) {
    await page.evaluate(() => {
      const b = window.__biolab;
      b.viewer.getState().command({ type: 'reset' });
    });
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const c = window.__biolab.three().controls;
      for (let i = 0; i < 80; i++) c.update(0.05);
    });
  }
  const ok = await page.evaluate((ids) => {
    const b = window.__biolab;
    const v = b.viewer.getState();
    const box = ids.length ? b.registry.boundsOf(ids) : null;
    if (!box) return false;
    const keep = new Set(ids);
    const hide: Record<string, true> = { ...v.hiddenMeshIds };
    b.registry.forEach((id: string) => {
      if (!keep.has(id)) hide[id] = true;
    });
    (window as any).__studioSaved = v.hiddenMeshIds; // eslint-disable-line @typescript-eslint/no-explicit-any
    b.viewer.setState({ hiddenMeshIds: hide });
    const hidden: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    b.three().scene.traverse((o: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if ((o.isMesh || o.isPoints || o.isLine || o.isSprite) && o.visible && !o.userData?.meshId) {
        o.visible = false;
        hidden.push(o);
      }
    });
    (window as any).__studioHidden = hidden; // eslint-disable-line @typescript-eslint/no-explicit-any
    // keep the model's own 3/4 view (fitToBox would snap to a side view) and move in to fit
    const T = b.THREE;
    const { controls, camera } = b.three();
    const sphere = box.getBoundingSphere(new T.Sphere());
    const dir = camera.position.clone().sub(controls.getTarget(new T.Vector3())).normalize();
    const fov = (camera.fov * Math.PI) / 180;
    const dist = (sphere.radius / Math.sin(fov / 2)) * 1.02;
    const eye = sphere.center.clone().addScaledVector(dir, dist);
    void controls.setLookAt(eye.x, eye.y, eye.z, sphere.center.x, sphere.center.y, sphere.center.z, false);
    return true;
  }, focus);
  if (ok) await page.waitForTimeout(500);
  await shoot(page, file);
  if (ok) await lineArt(await passes(page), file.replace(/\.webp$/, '-linhas.png'));
  const ls = ok && withLabels ? await labels(page) : undefined;
  if (ok)
    await page.evaluate(() => {
      const w = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      for (const o of w.__studioHidden ?? []) o.visible = true;
      w.__biolab.viewer.setState({ hiddenMeshIds: w.__studioSaved ?? {} });
    });
  return { ok, labels: ls };
}

/** The whole model with the structure in full colour and everything else ghosted. */
async function contextShot(page: Page, file: string, ids: string[]) {
  if (!ids.length) return false;
  await page.evaluate((ids) => {
    const v = window.__biolab.viewer.getState();
    v.isolate(ids);
    v.command({ type: 'reset' });
  }, ids);
  await page.waitForTimeout(500);
  // the lab's ghost is almost invisible (good for clicking); a picture needs more context
  await page.evaluate(() => {
    const keep = new Set(window.__biolab.viewer.getState().isolatedMeshIds ?? []);
    window.__biolab.registry.forEach((id: string, m: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const mat = m.material;
      if (!keep.has(id) && mat?.transparent && mat.opacity < 0.1 && !mat.userData.studioOpacity) {
        mat.userData.studioOpacity = mat.opacity;
        mat.opacity = 0.28;
      }
    });
  });
  await shoot(page, file);
  await page.evaluate(() => {
    window.__biolab.registry.forEach((_: string, m: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const mat = m.material;
      if (mat?.userData.studioOpacity) {
        mat.opacity = mat.userData.studioOpacity;
        delete mat.userData.studioOpacity;
      }
    });
    window.__biolab.viewer.getState().isolate(null);
  });
  return true;
}

/** Screen position (in output pixels) of each structure that is visible from the camera. */
async function labels(page: Page): Promise<StudioLabel[]> {
  const raw: { id: string; x: number; y: number; n: number }[] = await page.evaluate(() => {
    const b = window.__biolab;
    const T = b.THREE;
    const { scene, camera, size } = b.three();
    const meshes: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    scene.traverse((o: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!o.isMesh || !o.userData?.meshId) return;
      let v = true;
      for (let p = o; p; p = p.parent) if (!p.visible) v = false;
      const mat = Array.isArray(o.material) ? o.material[0] : o.material;
      if (v && !(mat?.transparent && mat.opacity < 0.35)) meshes.push(o);
    });
    const by = new Map<string, any[]>(); // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const m of meshes) {
      const sid = b.structureOf(m.userData.meshId);
      if (!sid) continue;
      if (!by.has(sid)) by.set(sid, []);
      by.get(sid)!.push(m);
    }
    const ray = new T.Raycaster();
    const v = new T.Vector3();
    const im = new T.Matrix4();
    const out: { id: string; x: number; y: number; n: number }[] = [];
    for (const [sid, list] of by) {
      const pts: { x: number; y: number }[] = [];
      let tried = 0;
      for (const m of list) {
        const pos = m.geometry.attributes.position;
        const inst = m.isInstancedMesh ? Math.min(m.count, 12) : 1;
        const per = Math.max(4, Math.floor(48 / list.length / inst));
        for (let k = 0; k < inst; k++) {
          if (m.isInstancedMesh) m.getMatrixAt(Math.floor((k * m.count) / inst), im);
          for (let j = 0; j < per; j++) {
            const i = Math.floor(((j + 0.5) * pos.count) / per);
            v.fromBufferAttribute(pos, i);
            if (m.isInstancedMesh) v.applyMatrix4(im);
            v.applyMatrix4(m.matrixWorld);
            const dist = v.distanceTo(camera.position);
            const ndc = v.clone().project(camera);
            tried++;
            if (Math.abs(ndc.x) > 0.9 || Math.abs(ndc.y) > 0.88 || ndc.z > 1) continue;
            ray.setFromCamera(new T.Vector2(ndc.x, ndc.y), camera);
            const hit = ray.intersectObjects(meshes, false)[0];
            if (!hit) continue;
            const hs = b.structureOf(hit.object.userData.meshId);
            if (hs === sid && Math.abs(hit.distance - dist) < Math.max(0.08, dist * 0.04)) pts.push({ x: ((ndc.x + 1) / 2) * size.width, y: ((1 - ndc.y) / 2) * size.height });
          }
        }
      }
      if (!pts.length) continue;
      const mx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const my = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const best = pts.reduce((a, p) => ((p.x - mx) ** 2 + (p.y - my) ** 2 < (a.x - mx) ** 2 + (a.y - my) ** 2 ? p : a));
      out.push({ id: sid, x: best.x / size.width, y: best.y / size.height, n: pts.length / Math.max(1, tried) });
    }
    return out;
  });
  return raw.map((l) => ({ id: l.id, x: +l.x.toFixed(4), y: +l.y.toFixed(4), vis: +l.n.toFixed(3) }));
}

/** Renders flat passes (structure ids, depth, transparent silhouettes) and returns them as PNG data URLs. */
async function passes(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const b = window.__biolab;
    const T = b.THREE;
    const { scene, camera, gl } = b.three();
    const saved: [any, any, boolean][] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    const ids = new Map<string, number>();
    const opaque: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    const glassy: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    scene.traverse((o: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!(o.isMesh || o.isPoints || o.isLine || o.isSprite)) return;
      saved.push([o, o.material, o.visible]);
      if (!o.isMesh || !o.userData?.meshId || !o.visible) {
        o.visible = false;
        return;
      }
      const mat = Array.isArray(o.material) ? o.material[0] : o.material;
      (mat?.transparent && mat.opacity < 0.6 ? glassy : opaque).push(o);
    });
    const hash = (s: string) => {
      let h = 2166136261;
      for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
      return h >>> 0;
    };
    const bg = scene.background;
    const fog = scene.fog;
    scene.background = new T.Color(0, 0, 0);
    scene.fog = null;
    const shots: string[] = [];
    const render = () => {
      gl.setRenderTarget(null);
      gl.render(scene, camera);
      shots.push(gl.domElement.toDataURL('image/png'));
    };
    // 1) structure ids (flat colour per structure)
    for (const o of opaque) {
      const sid = b.structureOf(o.userData.meshId) ?? o.userData.meshId;
      if (!ids.has(sid)) ids.set(sid, hash(sid));
      const h = ids.get(sid)!;
      const side = (Array.isArray(o.material) ? o.material[0] : o.material)?.side ?? T.FrontSide;
      o.material = new T.MeshBasicMaterial({ color: new T.Color(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255), toneMapped: false, side });
    }
    for (const o of glassy) o.visible = false;
    render();
    // 2) depth (normals packed as colour, used for creases and silhouettes)
    for (const o of opaque) o.material = new T.MeshNormalMaterial({ side: o.material.side });
    render();
    // 3) transparent shells only (their outline)
    for (const o of opaque) o.visible = false;
    for (const o of glassy) {
      o.visible = true;
      o.material = new T.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: T.DoubleSide });
    }
    render();
    for (const [o, m, vis] of saved) {
      o.material = m;
      o.visible = vis;
    }
    scene.background = bg;
    scene.fog = fog;
    return shots;
  });
}

async function decode(url: string) {
  const { data, info } = await sharp(Buffer.from(url.split(',')[1], 'base64'))
    .resize(W, H, { fit: 'cover', kernel: 'nearest' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/** Line drawing: boundaries between structures, creases and silhouettes, in black on white. */
async function lineArt(urls: string[], file: string) {
  const [idP, nP, gP] = await Promise.all(urls.map(decode));
  const { w, h } = idP;
  const out = Buffer.alloc(w * h, 255);
  const at = (b: Buffer, x: number, y: number, c: number) => b[(y * w + x) * 3 + c];
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      let edge = 0;
      // structure boundaries / silhouette
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
        let d = 0;
        for (let c = 0; c < 3; c++) d += Math.abs(at(idP.data, x + dx, y + dy, c) - at(idP.data, x, y, c));
        if (d > 24) edge = Math.max(edge, 1);
      }
      // creases: normal discontinuities (threshold high to ignore surface texture)
      let nd = 0;
      for (const [dx, dy] of [[1, 0], [0, 1]]) {
        let d = 0;
        for (let c = 0; c < 3; c++) d += (at(nP.data, x + dx, y + dy, c) - at(nP.data, x - dx, y - dy, c)) ** 2;
        nd = Math.max(nd, Math.sqrt(d));
      }
      if (nd > 150) edge = Math.max(edge, 0.55);
      // transparent shells
      if (Math.abs(at(gP.data, x + 1, y, 0) - at(gP.data, x - 1, y, 0)) + Math.abs(at(gP.data, x, y + 1, 0) - at(gP.data, x, y - 1, 0)) > 200) edge = Math.max(edge, 0.8);
      if (edge) out[y * w + x] = Math.round(255 * (1 - edge));
    }
  // thicken slightly (min filter) for print
  const thick = Buffer.from(out);
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const m = Math.min(out[i], out[i + 1], out[i + w], out[i + 1 + w]);
      thick[i] = m;
    }
  await sharp(thick, { raw: { width: w, height: h, channels: 1 } }).png({ compressionLevel: 9, palette: true, colours: 8 }).toFile(file);
}

function caption(a: LessonAction, lesson: Lesson, step?: { title: string }) {
  return step ? `${a.label} — ${step.title}` : a.label || lesson.title;
}

async function renderLesson(page: Page, lesson: Lesson): Promise<StudioRenders[string]> {
  const dir = path.join(OUT, lesson.id);
  mkdirSync(dir, { recursive: true });
  const rel = (f: string) => `/studio/${lesson.id}/${f}`;
  const slug = LABORATORIES.find((l) => l.id === lesson.laboratoryId)?.slug ?? lesson.laboratoryId;
  await page.goto(`${BASE}/explorar/${slug}`);
  await ready(page);

  const diagram = async (name: string, cap: string, kind: StudioImage['kind'], refId?: string): Promise<StudioImage> => {
    await timed('shoot', () => shoot(page, path.join(dir, `${name}.webp`)));
    const ls = await timed('labels', () => labels(page));
    const pp = await timed('passes', () => passes(page));
    await timed('lineart', () => lineArt(pp, path.join(dir, `${name}-linhas.png`)));
    return { src: rel(`${name}.webp`), line: rel(`${name}-linhas.png`), w: W, h: H, caption: cap, kind, ref: refId, model: await page.evaluate(() => window.__biolab.model()), labels: ls };
  };

  const cover = await diagram('capa', lesson.title, 'model');
  const actions: Record<string, StudioImage[]> = {};
  const procs = PROCESSES[lesson.laboratoryId] ?? {};
  for (const [si, sec] of lesson.sections.entries()) {
    for (const [ai, a] of (sec.actions ?? []).entries()) {
      if (a.tool && !a.structure && !a.model && !a.process) continue;
      const key = `${si}-${ai}`;
      await reset(page);
      await page.evaluate((act) => window.__biolab.lesson(act), a as never);
      await page.waitForTimeout(a.model || a.group ? 3500 : 2200);
      await timed('ready', () => ready(page));
      if (a.process && procs[a.process]) {
        const proc = procs[a.process];
        const n = Math.min(proc.steps.length, MAX_STEPS);
        const list: StudioImage[] = [];
        for (let s = 0; s < n; s++) {
          const idx = n === proc.steps.length ? s : Math.round((s * (proc.steps.length - 1)) / (n - 1));
          await page.evaluate(
            ([step, t]) => {
              const p = window.__biolab.process.getState();
              p.setStep(step);
              p.setPlaying(false);
              window.__biolab.clock.t = t;
            },
            [idx, proc.steps[idx].seconds] as const,
          );
          await page.waitForTimeout(1400);
          const f = `${key}-p${idx}.webp`;
          await shoot(page, path.join(dir, f));
          list.push({ src: rel(f), w: W, h: H, caption: caption(a, lesson, proc.steps[idx]), kind: 'process', ref: a.process, step: idx, model: await page.evaluate(() => window.__biolab.model()) });
        }
        actions[key] = list;
      } else if (a.model && !a.structure) {
        actions[key] = [await diagram(key, caption(a, lesson), 'model', a.model)];
      } else {
        const model: string = await page.evaluate(() => window.__biolab.model());
        if (a.structure) {
          // meshes the lab focused on when the structure was selected
          const focus: string[] = await page.evaluate(() => {
            const cmd = window.__biolab.viewer.getState().camera?.cmd;
            return cmd?.type === 'focus' ? cmd.meshIds : [];
          });
          const iso = (await timed('isolated', () => isolatedShot(page, path.join(dir, `${key}.webp`), focus))).ok;
          const ctx = await timed('context', () => contextShot(page, path.join(dir, `${key}-ctx.webp`), focus));
          actions[key] = [{ src: rel(`${key}.webp`), line: iso ? rel(`${key}-linhas.png`) : undefined, context: ctx ? rel(`${key}-ctx.webp`) : undefined, w: W, h: H, caption: caption(a, lesson), kind: 'structure', ref: a.structure, model }];
        } else {
          // a whole system (e.g. the digestive system): numbered diagram + line drawing.
          // In the human body the lab keeps the other organs and vessels around it, so the
          // system is isolated and framed on its own (otherwise it is a small figure in a crowd).
          const sys = lesson.laboratoryId === 'anatomia-humana' && a.group ? HUMAN_SYSTEMS.get(a.group) ?? [] : [];
          const iso = sys.length ? await timed('isolated', () => isolatedShot(page, path.join(dir, `${key}.webp`), sys, true)) : { ok: false };
          actions[key] = iso.ok
            ? [{ src: rel(`${key}.webp`), line: rel(`${key}-linhas.png`), w: W, h: H, caption: caption(a, lesson), kind: 'group', ref: a.group, model, labels: iso.labels }]
            : [await diagram(key, caption(a, lesson), 'group', a.group)];
        }
      }
    }
  }
  return { cover, actions };
}

function sortKeys(m: StudioRenders): StudioRenders {
  return Object.fromEntries(Object.entries(m).sort(([a], [b]) => a.localeCompare(b)));
}

async function main() {
  const only = process.argv.slice(2);
  const manifest: StudioRenders = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  // tsx (esbuild) wraps named functions with __name(); define it inside the page too.
  await ctx.addInitScript('globalThis.__name = (f) => f;');
  // best quality (antialiasing + contact shadows) for the pictures
  await ctx.addInitScript("try { localStorage.setItem('biolab.quality', 'alta') } catch {}");
  const r = await ctx.request.post(`${BASE}/api/access`, { data: { key: accessKey() } });
  if (!r.ok()) console.log(`(sem login por chave: ${r.status()} — ok se o site estiver em acesso livre)`);
  // STUDIO_SKIP_DONE=1 resumes an interrupted run (lessons already in the manifest are kept)
  const queue = LESSONS.filter((l) => (!only.length || only.includes(l.id) || only.includes(l.laboratoryId)) && !(process.env.STUDIO_SKIP_DONE && manifest[l.id]));
  const workers = Number(process.env.STUDIO_WORKERS ?? 2);
  await Promise.all(
    Array.from({ length: workers }, async () => {
      const page = await ctx.newPage();
      for (let lesson = queue.shift(); lesson; lesson = queue.shift()) {
        const t0 = Date.now();
        try {
          manifest[lesson.id] = await renderLesson(page, lesson);
          writeFileSync(MANIFEST, JSON.stringify(sortKeys(manifest), null, 1) + '\n');
          console.log(`${lesson.id} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
        } catch (e) {
          console.log(`${lesson.id} FAILED: ${(e as Error).message.split('\n')[0]}`);
        }
      }
      await page.close();
    }),
  );
  await browser.close();
}

void main();
