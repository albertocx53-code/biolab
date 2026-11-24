/**
 * Animated development scenes of the Animals laboratory: early embryonic
 * development (zygote → cleavage → morula → blastula → gastrula with the three
 * germ layers), the metamorphosis of a frog and the complete metamorphosis of
 * a butterfly. Procedural geometry written by BioLab 3D.
 */
import * as THREE from 'three';
import { dots, merge, paint, place, rng, tube } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ac, fibSphere, lathe, latheCutFaces, limb, loft, organ, paintDorsal, plate, smooth, V, type Profile } from './kit';
import { colorize } from './materials';
import { frogExterior } from './frog';
import { fbm, mix, pw, surface, sweep, vcolor } from './sculpt';
import { butterflyBody, butterflyWing, caterpillar, chrysalis, eggs, leaf, leafY, twig } from './butterfly';

type Get = (id: string) => THREE.Object3D | undefined;
const show = (o: THREE.Object3D | undefined, s: number) => o && o.scale.setScalar(Math.max(0.0001, s));

const WEDGE = Math.PI * 0.7;
const PHI0 = WEDGE / 2;
const PHI_LEN = Math.PI * 2 - WEDGE;
const CUTS = [PHI0, PHI0 + PHI_LEN];

// ===================================================================== embryo

const R = 2.2;
const H = 0.34;
const ANIMAL = '#4A3426';
const VEGETAL = '#EADBB4';

function cell(r: number, at: THREE.Vector3) {
  const g = new THREE.SphereGeometry(r, 40, 28);
  place(g, at);
  return g;
}
/** Amphibian egg colours: dark pigmented animal pole, pale yolky vegetal pole, fine mottling. */
const shadeEgg = (g: THREE.BufferGeometry) =>
  vcolor(g, (p) => {
    const k = smooth((p.y + 0.9) / 2.2);
    const c = mix(VEGETAL, ANIMAL, k);
    return c.multiplyScalar(0.93 + 0.12 * fbm(p, 3, 3));
  });
/** Blastomeres pressed together inside the fertilization envelope: the outside rounds off, furrows stay between cells. */
function compact(g: THREE.BufferGeometry, rMax: number) {
  const pos = g.getAttribute('position');
  const q = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    q.fromBufferAttribute(pos, i);
    const l = q.length();
    if (l > rMax) q.multiplyScalar((rMax + (l - rMax) * 0.18) / l);
    pos.setXYZ(i, q.x, q.y, q.z);
  }
  g.computeVertexNormals();
  return g;
}
/** Cell mosaic on a germ-layer surface: each cell a slightly different shade, with darker membranes between them. */
const MOSAIC = fibSphere(150, 1);
function mosaic(g: THREE.BufferGeometry, color: string) {
  const base = new THREE.Color(color);
  return vcolor(g, (p) => {
    const d = p.clone().normalize();
    let b1 = -2;
    let b2 = -2;
    let i1 = 0;
    for (let i = 0; i < MOSAIC.length; i++) {
      const v = MOSAIC[i].dot(d);
      if (v > b1) {
        b2 = b1;
        b1 = v;
        i1 = i;
      } else if (v > b2) b2 = v;
    }
    const edge = 1 - smooth((b1 - b2) / 0.035);
    const shade = 0.9 + 0.16 * (((i1 * 2654435761) >>> 0) % 1000) / 1000;
    return base.clone().multiplyScalar(shade * (1 - 0.35 * edge));
  });
}

/** Gastrula wall for invagination depth d (0..1): ectoderm arc and endoderm (archenteron) band. */
function gastrulaLine(d: number) {
  const lip = Math.PI - 0.3;
  const ecto: [number, number][] = [];
  for (let i = 0; i <= 30; i++) {
    const a = (i / 30) * lip;
    ecto.push([R * Math.sin(a), R * Math.cos(a)]);
  }
  const [lx, ly] = ecto[ecto.length - 1];
  const ra = 0.5;
  const yTop = ly + 0.45 + d * 2.75;
  const endo: [number, number][] = [[lx, ly]];
  for (let i = 1; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2);
    endo.push([ra + (lx - ra) * Math.cos(a), ly + 0.45 * Math.sin(a)]);
  }
  for (let i = 1; i <= 10; i++) endo.push([ra, ly + 0.45 + (i / 10) * (yTop - ly - 0.45)]);
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * (Math.PI / 2);
    endo.push([ra * Math.cos(a), yTop + ra * Math.sin(a)]);
  }
  return { ecto, endo, lip: [lx, ly] as [number, number], yTop, ra };
}

/** Offsets a centre line on both sides by ±w/2 (2D normals). */
function band(line: [number, number][], w: number) {
  const a: Profile = [];
  const b: Profile = [];
  for (let i = 0; i < line.length; i++) {
    const p = line[Math.max(0, i - 1)];
    const q = line[Math.min(line.length - 1, i + 1)];
    let tx = q[0] - p[0];
    let ty = q[1] - p[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const nx = ty;
    const ny = -tx;
    a.push([Math.max(0.001, line[i][0] + (nx * w) / 2), line[i][1] + (ny * w) / 2]);
    b.push([Math.max(0.001, line[i][0] - (nx * w) / 2), line[i][1] - (ny * w) / 2]);
  }
  return { a, b };
}

function bandMesh(line: [number, number][], w: number, color: string) {
  const { a, b } = band(line, w);
  return paint(merge([lathe(a, 128, PHI0, PHI_LEN), lathe(b, 128, PHI0, PHI_LEN), latheCutFaces(a, b, CUTS)]), color);
}

export const GASTRULA_DEPTHS = [0.15, 0.4, 0.7, 1];

function embryo(): BuiltModel {
  const meshes: MeshDef[] = [];
  const zyg = shadeEgg(cell(R, V(0, 0, 0)));
  {
    // grey crescent opposite the sperm entry point, and the entry point itself
    const col = zyg.getAttribute('color');
    const pos = zyg.getAttribute('position');
    const q = new THREE.Vector3();
    const entry = V(0.4, 1.0, 1.95).normalize();
    for (let i = 0; i < pos.count; i++) {
      q.fromBufferAttribute(pos, i).normalize();
      const c = new THREE.Color(col.getX(i), col.getY(i), col.getZ(i));
      const crescent = Math.exp(-((q.y - 0.05) ** 2) / 0.02) * smooth((-q.z * 0.8 - q.x * 0.6 + 0.2) / 0.5);
      c.lerp(new THREE.Color('#8C8272'), crescent * 0.7);
      c.lerp(new THREE.Color('#1E140E'), Math.exp(-q.distanceToSquared(entry) / 0.004));
      col.setXYZ(i, c.r, c.g, c.b);
    }
  }
  meshes.push({ id: 'em-zigoto', structure: 'zigoto', geometry: zyg });
  // cleavage: 2, 4 and 8 cells (amphibian: smaller cells at the animal pole)
  meshes.push({ id: 'em-c2', structure: 'blastomeros', geometry: shadeEgg(compact(merge([cell(1.6, V(-1.0, 0, 0)), cell(1.6, V(1.0, 0, 0))]), R)) });
  meshes.push({ id: 'em-c4', structure: 'blastomeros', geometry: shadeEgg(compact(merge([-1, 1].flatMap((x) => [-1, 1].map((z) => cell(1.3, V(x * 0.85, 0, z * 0.85))))), R)) });
  meshes.push({
    id: 'em-c8',
    structure: 'blastomeros',
    geometry: shadeEgg(compact(merge([-1, 1].flatMap((x) => [-1, 1].flatMap((z) => [cell(0.98, V(x * 0.78, 0.95, z * 0.78)), cell(1.2, V(x * 0.85, -0.75, z * 0.85))]))), R)),
  });
  const mor = [...fibSphere(36, 1.6), ...fibSphere(8, 0.7)];
  meshes.push({ id: 'em-morula', structure: 'morula', geometry: shadeEgg(compact(merge(mor.map((p, i) => cell((p.y > 0 ? 0.6 : 0.72) + (i % 3) * 0.04, p))), R)) });
  // blastula: one layer of cells around a cavity, cut open
  const bl: THREE.BufferGeometry[] = [];
  for (const p of fibSphere(240, R - 0.15)) {
    const phi = Math.atan2(p.x, p.z);
    if (Math.abs(phi) < PHI0 * 0.9) continue;
    const s = new THREE.SphereGeometry(0.27, 10, 8);
    s.scale(1, 1, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), p.clone().normalize());
    s.scale(1.05, 0.7, 1.05);
    bl.push(place(s, p, q));
  }
  meshes.push({ id: 'em-blastula', structure: 'blastula', geometry: shadeEgg(merge(bl)) });
  const bc: Profile = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI;
    bc.push([(R - 0.5) * Math.sin(a), -(R - 0.5) * Math.cos(a)]);
  }
  meshes.push({ id: 'em-blastocele', structure: 'blastocele', geometry: lathe(bc, 48, PHI0, PHI_LEN) });
  // gastrula at four invagination depths
  GASTRULA_DEPTHS.forEach((d, k) => {
    const g = gastrulaLine(d);
    meshes.push({ id: `em-ecto-${k}`, structure: 'ectoderme', geometry: mosaic(bandMesh(g.ecto, H, ac('ectoderme')), ac('ectoderme')) });
    meshes.push({ id: `em-endo-${k}`, structure: 'endoderme', geometry: mosaic(bandMesh(g.endo, H, ac('endoderme')), ac('endoderme')) });
    const lum: Profile = [[0.001, g.lip[1] + 0.1]];
    for (let i = 0; i <= 10; i++) lum.push([g.ra - H / 2 - 0.02, g.lip[1] + 0.25 + (i / 10) * (g.yTop - g.lip[1] - 0.25)]);
    lum.push([0.001, g.yTop + g.ra - H / 2]);
    meshes.push({ id: `em-arq-${k}`, structure: 'arquentero', geometry: lathe(lum, 40, PHI0, PHI_LEN) });
    meshes.push({ id: `em-bp-${k}`, structure: 'blastoporo', geometry: place(new THREE.TorusGeometry(g.lip[0] - 0.05, 0.12, 10, 48).rotateX(Math.PI / 2), [0, g.lip[1] + 0.05, 0]) });
  });
  // mesoderm: forms between ectoderm and endoderm around the archenteron
  {
    const g = gastrulaLine(1);
    const line: [number, number][] = [];
    for (let i = 0; i <= 14; i++) line.push([g.ra + H / 2 + 0.2, g.lip[1] + 0.6 + (i / 14) * (g.yTop - g.lip[1] - 0.6)]);
    for (let i = 1; i <= 8; i++) {
      const a = (i / 8) * (Math.PI / 2) * 0.85;
      line.push([(g.ra + H / 2 + 0.2) * Math.cos(a), g.yTop + (g.ra + H / 2 + 0.2) * Math.sin(a)]);
    }
    meshes.push({ id: 'em-mesoderme', structure: 'mesoderme', geometry: bandMesh(line, 0.24, ac('mesoderme')) });
  }
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(17.5, [0.7, 0, 0], 0.22, 0.35) };
}

const EMBRYO_STAGES = ['em-zigoto', 'em-c2', 'em-c4', 'em-c8', 'em-morula', 'em-blastula', 'em-blastocele'];

/** Embryonic development (6 steps): zygote, cleavage, morula, blastula, gastrulation, germ layers. */
export function poseEmbryo(P: number, get: Get) {
  const step = Math.min(5, Math.floor(P));
  const t = P - step;
  let on: string[];
  if (step === 0) on = ['em-zigoto'];
  else if (step === 1) on = [t < 0.33 ? 'em-c2' : t < 0.66 ? 'em-c4' : 'em-c8'];
  else if (step === 2) on = ['em-morula'];
  else if (step === 3) on = ['em-blastula', 'em-blastocele'];
  else {
    const k = step === 4 ? Math.min(3, Math.floor(t * 4)) : 3;
    on = [`em-ecto-${k}`, `em-endo-${k}`, `em-arq-${k}`, `em-bp-${k}`];
  }
  const all = [...EMBRYO_STAGES, ...GASTRULA_DEPTHS.flatMap((_, k) => [`em-ecto-${k}`, `em-endo-${k}`, `em-arq-${k}`, `em-bp-${k}`])];
  // each new stage "pops" in (cells divide quickly)
  const sub = step === 1 ? (t * 3) % 1 : step === 4 ? (t * 4) % 1 : t;
  const pop = P === 0 ? 1 : 0.9 + 0.1 * smooth(sub * 5);
  for (const id of all) show(get(id), on.includes(id) ? pop : 0);
  show(get('em-mesoderme'), step === 5 ? 0.4 + 0.6 * smooth(t * 1.4) : 0);
}

// ===================================================================== frog metamorphosis

const EGGS_AT = V(0, -0.6, 0);

/** Tadpole skin: olive-brown back with gold flecks, bronze-white belly. */
function tadpoleSkin(p: THREE.Vector3, n: THREE.Vector3) {
  const back = smooth((n.y + 0.25) / 0.7);
  const c = mix('#D8CDB0', '#3C3A26', back);
  c.lerp(new THREE.Color('#1F1E14'), back * smooth((fbm(p, 4, 3) - 0.55) / 0.1) * 0.7);
  c.lerp(new THREE.Color('#C9A64A'), back * smooth((fbm(p.clone().addScalar(5), 16, 1) - 0.74) / 0.05) * 0.85);
  return c;
}

function tadpoleTail() {
  // pivot at x = 0 (joins the body), tail along −X: muscular axis with dorsal and ventral fins
  const muscle = sweep([V(0.45, 0, 0), V(-1.5, 0.02, 0), V(-3.4, 0.06, 0)], (t) => ({ a: 0.36 * Math.pow(1 - t, 0.8) + 0.015, b: 0.24 * Math.pow(1 - t, 1.1) + 0.012 }), { rings: 90, radial: 20 });
  vcolor(muscle, (p, n) => {
    const c = tadpoleSkin(p, n);
    // chevron muscle blocks (myomeres)
    const ch = Math.abs(Math.sin((p.x + Math.abs(p.y) * 1.2) * 9));
    return c.multiplyScalar(0.9 + 0.12 * ch);
  });
  const finH = (s: number, top: boolean) => (top ? 0.62 : 0.42) * pw(s, [[0, 0], [0.12, 0.35], [0.4, 1], [0.75, 0.75], [1, 0]]);
  const fin = (top: boolean) =>
    surface((u, v) => {
      const x = -0.2 - u * 3.3;
      const base = (top ? 1 : -1) * (0.36 * Math.pow(Math.max(0, 1 - (0.1 - x) / 3.5), 0.8) * 0.6);
      return V(x, 0.04 + base + (top ? 1 : -1) * v * finH(u, top), 0.03 * Math.sin(u * 9) * v);
    }, 70, 14);
  const fins = merge([fin(true), fin(false)].map((g) =>
    vcolor(g, (p, _n, u, v) => {
      const c = mix('#8F8A66', '#C9C3A0', v);
      c.lerp(new THREE.Color('#2E2C1E'), smooth((fbm(p, 6, 2) - 0.6) / 0.08) * 0.6);
      return c.lerp(new THREE.Color('#E6E0C8'), smooth((v - 0.92) / 0.08) * 0.5 * (1 - u * 0.3));
    }),
  ));
  muscle.deleteAttribute('uv');
  return merge([muscle, fins]);
}

function tadpoleBody() {
  const g = sweep([V(-0.45, 0, 0), V(0.7, 0.03, 0), V(2.05, -0.05, 0)], (t) => {
    const k = pw(t, [[0, 0.45], [0.15, 0.85], [0.45, 1], [0.8, 0.86], [1, 0.4]]);
    return { a: 0.66 * k, b: 0.8 * k, off: -0.04 * k };
  }, { rings: 90, radial: 40 });
  vcolor(g, (p, n) => {
    const c = tadpoleSkin(p, n);
    // the coiled gut shows through the belly
    const belly = smooth((-n.y - 0.5) / 0.3);
    const r = Math.hypot(p.x - 0.55, p.z);
    c.lerp(new THREE.Color('#8E7E5A'), belly * Math.pow(Math.abs(Math.sin(r * 22)), 6) * 0.5 * (r < 0.6 ? 1 : 0));
    return c;
  });
  g.deleteAttribute('uv');
  const parts: THREE.BufferGeometry[] = [g];
  for (const s of [1, -1]) {
    // dorsolateral eyes: gold iris, black pupil
    const eye = new THREE.SphereGeometry(0.15, 20, 14);
    vcolor(eye, (p) => {
      const d = Math.hypot(p.y, p.z * s > 0 ? p.x : p.x) / 0.15;
      return p.z * s > 0.06 && d < 0.55 ? new THREE.Color('#0D0D0D') : p.z * s > 0.02 ? new THREE.Color('#B8913A') : new THREE.Color('#2A2A20');
    });
    eye.deleteAttribute('uv');
    parts.push(place(eye, [1.5, 0.3, s * 0.5]));
    parts.push(paint(place(new THREE.SphereGeometry(0.03, 8, 6), [1.97, 0.12, s * 0.16]), '#111111'));
  }
  // oral disc with dark horny jaws, and the spiracle on the left side
  parts.push(paint(place(new THREE.TorusGeometry(0.13, 0.04, 8, 24).rotateY(Math.PI / 2).scale(1, 0.7, 1.2), [1.98, -0.18, 0]), '#5A4E3A'));
  parts.push(paint(place(new THREE.SphereGeometry(0.07, 10, 8).scale(0.4, 0.6, 1.4), [2.02, -0.18, 0]), '#151515'));
  parts.push(paint(sweep([V(0.35, -0.15, 0.6), V(0.15, -0.17, 0.72)], () => ({ a: 0.05, b: 0.05 }), { rings: 6, radial: 10 }), '#4A4632'));
  for (const q of parts) if (q.getAttribute('uv')) q.deleteAttribute('uv');
  return merge(parts);
}

/** Feathery external gills: three branches per side, each with fine filaments. */
function tadpoleGills() {
  const parts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let k = 0; k < 3; k++) {
      const base = V(0.95 - k * 0.14, 0.12 - k * 0.12, s * 0.7);
      const tip = base.clone().add(V(-0.55, 0.28 - k * 0.14, s * 0.5));
      const mid = base.clone().lerp(tip, 0.5).add(V(0, 0.1, s * 0.05));
      parts.push(sweep([base, mid, tip], (t) => ({ a: 0.05 * (1 - 0.6 * t), b: 0.05 * (1 - 0.6 * t) }), { rings: 16, radial: 8 }));
      const c = new THREE.CatmullRomCurve3([base, mid, tip]);
      for (let j = 1; j < 9; j++) {
        const p = c.getPoint(j / 9);
        for (const side of [1, -1]) {
          const end = p.clone().add(V(-0.1, side * (0.13 - j * 0.008), s * 0.04));
          parts.push(sweep([p, p.clone().lerp(end, 0.5).add(V(-0.02, 0, 0)), end], () => ({ a: 0.018, b: 0.018 }), { rings: 6, radial: 5 }));
        }
      }
    }
  for (const q of parts) q.deleteAttribute('uv');
  return vcolor(merge(parts), (p) => mix('#C9575A', '#F0A3A0', fbm(p, 8, 1)));
}

/** A developing leg: thigh, shank and foot with webbed toes, coloured like the skin. */
function tadpoleLeg(pts: THREE.Vector3[], r: number, toes: number, s: number, spread: number) {
  const parts: THREE.BufferGeometry[] = [sweep(pts, (t) => ({ a: r * (1 - 0.45 * t), b: r * (1 - 0.45 * t) }), { rings: 30, radial: 12 })];
  const end = pts[pts.length - 1];
  const dir = end.clone().sub(pts[pts.length - 2]).normalize();
  const tipPts: THREE.Vector3[] = [];
  for (let k = 0; k < toes; k++) {
    const a = (k / (toes - 1) - 0.5) * spread;
    const d = dir.clone().applyAxisAngle(V(0, 1, 0), a * s).add(V(0, -0.15, 0)).normalize();
    const tip = end.clone().addScaledVector(d, 0.32 + 0.08 * Math.sin((k / (toes - 1)) * Math.PI));
    tipPts.push(tip);
    parts.push(sweep([end, end.clone().lerp(tip, 0.5), tip], (t) => ({ a: r * 0.3 * (1 - 0.3 * t), b: r * 0.3 * (1 - 0.3 * t) }), { rings: 8, radial: 6 }));
  }
  for (const q of parts) q.deleteAttribute('uv');
  return vcolor(merge(parts), (p, n) => tadpoleSkin(p, n));
}

function frogMeta(): BuiltModel {
  const r = rng(31);
  const meshes: MeshDef[] = [];
  const pond = surface((u, v) => {
    const r = 3.4 * v;
    const a = u * Math.PI * 2;
    return V(Math.cos(a) * r * 1.15, -1.9 + 0.035 * Math.sin(r * 7) * Math.exp(-r * 0.4), Math.sin(a) * r);
  }, 96, 40);
  vcolor(pond, (p, _n, _u, v) => mix('#3E8FA8', '#9FD6E0', v * 0.8 + 0.2 * fbm(p, 1.5, 2)));
  pond.deleteAttribute('uv');
  meshes.push({ id: 'mf-agua', structure: 'agua', geometry: pond });
  // egg mass: dark eggs inside jelly capsules
  const jelly: THREE.Vector3[] = [];
  for (let i = 0; i < 400 && jelly.length < 46; i++) {
    const p = V(r.range(-1.8, 1.8), r.range(-0.7, 0.7), r.range(-1.3, 1.3));
    if (p.x * p.x / 3.2 + p.y * p.y / 0.5 + p.z * p.z / 1.7 > 1) continue;
    if (jelly.every((q) => q.distanceTo(p) > 0.52)) jelly.push(p);
  }
  meshes.push({ id: 'mf-gel', structure: 'massa-gelatinosa', geometry: dots(jelly, 0.31, 2) });
  meshes.push({ id: 'mf-ovos', structure: 'ovos', geometry: paintDorsal(merge(jelly.map((p) => place(new THREE.SphereGeometry(0.13, 12, 8), p))), '#1B1B1E', '#D9C6A5', -0.1, 0.1) });
  // tadpole (built at the origin, head towards +X)
  meshes.push({ id: 'mf-girino', structure: 'girino', geometry: tadpoleBody() });
  meshes.push({ id: 'mf-cauda', structure: 'cauda', geometry: tadpoleTail() });
  meshes.push({ id: 'mf-branquias', structure: 'branquias-externas', geometry: tadpoleGills() });
  const hind: THREE.BufferGeometry[] = [];
  const front: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    hind.push(tadpoleLeg([V(-0.1, -0.3, s * 0.45), V(-0.5, -0.55, s * 0.9), V(-0.15, -0.78, s * 1.05), V(-0.6, -0.9, s * 1.2)], 0.13, 5, s, 1.1));
    front.push(tadpoleLeg([V(1.05, -0.3, s * 0.62), V(1.3, -0.75, s * 0.98), V(1.65, -1.0, s * 1.05)], 0.1, 4, s, 0.9));
  }
  meshes.push({ id: 'mf-patas-tras', structure: 'patas-traseiras', geometry: merge(hind) });
  meshes.push({ id: 'mf-patas-diant', structure: 'patas-dianteiras', geometry: merge(front) });
  const ext = frogExterior(0.82);
  meshes.push({ id: 'mf-sapo', structure: 'sapo', geometry: merge([ext.skin, ext.legs, ext.eyes]) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(14, [0.6, 0, 0], 0.32, 0.45) };
}

const TADPOLE = ['mf-girino', 'mf-cauda', 'mf-branquias', 'mf-patas-tras', 'mf-patas-diant'];

/** Frog metamorphosis (5 steps): eggs, tadpole with external gills, hind legs, front legs and tail resorption, young frog. */
export function poseFrogMeta(P: number, get: Get) {
  const step = Math.min(4, Math.floor(P));
  const t = P - step;
  show(get('mf-ovos'), step === 0 ? 1 : step === 1 ? 1 - smooth(t * 3) : 0);
  show(get('mf-gel'), step === 0 ? 1 : step === 1 ? 1 - smooth(t * 3) : 0);
  for (const id of ['mf-ovos', 'mf-gel']) get(id)?.position.copy(EGGS_AT);
  const size = step === 0 ? 0 : step === 1 ? 0.45 + 0.4 * smooth(t) : step === 2 ? 0.85 + 0.15 * smooth(t) : step === 3 ? 1 : 1 - smooth(t * 1.6);
  const swim = Math.sin(P * 9) * 0.28 * (step < 4 ? 1 : 0);
  const bob = Math.sin(P * 4) * 0.08;
  for (const id of TADPOLE) {
    const o = get(id);
    if (!o) continue;
    o.position.set(0.3, 0.1 + bob, 0);
    o.rotation.set(0, 0, 0);
    show(o, size);
  }
  const tail = get('mf-cauda');
  if (tail) {
    tail.rotation.set(0, swim, 0);
    const keep = step < 3 ? 1 : step === 3 ? 1 - 0.8 * smooth(t) : 0.2;
    tail.scale.set(Math.max(0.0001, size * keep), Math.max(0.0001, size * (0.6 + 0.4 * keep)), Math.max(0.0001, size));
  }
  show(get('mf-branquias'), step === 1 ? size : step === 2 ? size * (1 - smooth(t * 1.5)) : 0);
  show(get('mf-patas-tras'), step < 2 ? 0 : step === 2 ? size * (0.3 + 0.7 * smooth(t)) : size);
  show(get('mf-patas-diant'), step < 3 ? 0 : step === 3 ? size * (0.5 + 0.5 * smooth(t * 1.2)) : size);
  const frog = get('mf-sapo');
  if (frog) {
    // the young frog climbs out beside the last tadpole stage, then grows
    frog.position.set(3.0 - 2.8 * smooth(t * 1.4), 0.05, 0);
    show(frog, step === 4 ? 0.55 + 0.45 * smooth(t * 1.6) : 0);
  }
}

// ===================================================================== butterfly metamorphosis

const TWIG_Y = 3.1;

function butterflyMeta(): BuiltModel {
  const meshes: MeshDef[] = [];
  meshes.push({ id: 'mb-folha', structure: 'folha-planta', geometry: leaf() });
  meshes.push({ id: 'mb-galho', structure: 'galho', geometry: twig(TWIG_Y) });
  meshes.push({ id: 'mb-ovos', structure: 'ovo-inseto', geometry: eggs() });
  meshes.push({ id: 'mb-lagarta', structure: 'lagarta', geometry: caterpillar() });
  meshes.push({ id: 'mb-pupa', structure: 'pupa', geometry: chrysalis() });
  meshes.push({ id: 'mb-corpo', structure: 'borboleta', geometry: butterflyBody() });
  meshes.push({ id: 'mb-asa-e', structure: 'borboleta', geometry: butterflyWing(1) });
  meshes.push({ id: 'mb-asa-d', structure: 'borboleta', geometry: butterflyWing(-1) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(15, [0.5, 0.6, 0], 0.25, 0.4) };
}

/** Complete metamorphosis (5 steps): egg, larva, pupa, metamorphosis inside the pupa, adult. */
export function poseButterfly(P: number, get: Get) {
  const step = Math.min(4, Math.floor(P));
  const t = P - step;
  show(get('mb-ovos'), step === 0 ? 1 : step === 1 ? 1 - smooth(t * 4) : 0);
  const cat = get('mb-lagarta');
  if (cat) {
    const grow = step === 1 ? 0.35 + 0.65 * smooth(t) : step === 2 ? 1 - smooth(t * 1.4) : 0;
    const x = step === 1 ? -2.2 + 3.0 * smooth(t) : 0.8;
    cat.position.set(x, leafY(x, 0.3) + 0.42 * grow + Math.abs(Math.sin(P * 10)) * 0.04 * (step === 1 ? 1 : 0), 0.3);
    cat.rotation.set(0, 0, 0);
    show(cat, step === 0 ? 0 : grow);
  }
  const pupa = get('mb-pupa');
  if (pupa) {
    pupa.position.set(0.4, TWIG_Y - 0.1, -0.5);
    pupa.rotation.set(0, 0, step === 3 ? Math.sin(t * Math.PI * 6) * 0.08 : 0);
    show(pupa, step < 2 ? 0 : step === 2 ? smooth((t - 0.3) * 1.6) : step === 3 ? 1 : 1 - 0.7 * smooth(t * 2.5));
  }
  const adult = step === 4 ? 0.35 + 0.65 * smooth(t * 1.8) : 0;
  const open = step === 4 ? smooth((t - 0.45) * 2.2) : 0;
  const flap = step === 4 && t > 0.8 ? Math.sin((t - 0.8) * 30) * 0.25 : 0;
  const a = 1.45 - 1.15 * open + flap;
  // once the wings are dry it turns its back to the viewer, showing the upper side of the wings
  const tilt = 1.05 * open;
  const at = V(0.4 + 0.3 * open, TWIG_Y - 2.0 - 0.15 * open, -0.5 + 1.6 * open);
  for (const [id, rx] of [['mb-corpo', tilt], ['mb-asa-e', tilt - a], ['mb-asa-d', tilt + a]] as const) {
    const o = get(id);
    if (!o) continue;
    o.position.copy(at);
    o.rotation.set(rx, 0, 0.15);
    show(o, adult);
  }
}

export function buildDevelopment(id: 'embriao' | 'metamorfose-sapo' | 'metamorfose-borboleta'): BuiltModel {
  if (id === 'embriao') return embryo();
  if (id === 'metamorfose-sapo') return frogMeta();
  return butterflyMeta();
}

