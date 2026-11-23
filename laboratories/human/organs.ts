/**
 * Organs that are missing from the exported Z-Anatomy body (licence reasons, see
 * docs/MODEL_LICENSES.md) modelled procedurally by BioLab 3D: kidneys, brain
 * and the female reproductive system. Everything here is original geometry,
 * placed with the catalog's own landmarks (renal vessels, ureters, skull,
 * spinal cord, bladder and pelvis) so it sits where a teacher expects it.
 *
 * Coordinates are the body's: metres, +Y up, +Z anterior, +X the body's left
 * (`-esq`), -X the body's right (`-dir`).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export { EXTRA_MODEL_ID, FEMALE_GROUP, EXTRA_MESHES, EXTRA_ORGAN_COMPOSITES } from './extra-catalog';

/** Landmarks used to place the organs (taken from the catalog, metres). */
export const LANDMARKS = {
  kidneyLeft: new THREE.Vector3(0.063, 1.108, -0.02),
  kidneyRightOffset: new THREE.Vector3(0.008, -0.014, 0.008),
  brain: new THREE.Vector3(0, 1.645, -0.012),
  uterus: new THREE.Vector3(0, 0.9, -0.022),
};

// ---------------------------------------------------------------- generic surface tools

type Implicit = (p: THREE.Vector3) => number;

/** Radius along direction d where the implicit function crosses 0 (inside < 0). */
function radiusAlong(f: Implicit, d: THREE.Vector3, rMax: number) {
  let lo = 0;
  let hi = rMax;
  const p = new THREE.Vector3();
  for (let i = 0; i < 26; i++) {
    const mid = (lo + hi) / 2;
    if (f(p.copy(d).multiplyScalar(mid)) < 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Closed star-shaped surface around the local origin: an implicit shape plus a
 * radial displacement (folds, grooves). Returns an indexed geometry with smooth normals.
 */
function starSurface(f: Implicit, rMax: number, seg: [number, number], displace?: (p: THREE.Vector3, d: THREE.Vector3) => number) {
  const [ws, hs] = seg;
  const pos: number[] = [];
  const idx: number[] = [];
  const d = new THREE.Vector3();
  const p = new THREE.Vector3();
  for (let j = 0; j <= hs; j++) {
    const theta = (j / hs) * Math.PI;
    for (let i = 0; i <= ws; i++) {
      const phi = (i / ws) * Math.PI * 2;
      const s = Math.sin(theta);
      d.set(s * Math.sin(phi), Math.cos(theta), s * Math.cos(phi));
      let r = radiusAlong(f, d, rMax);
      if (displace) r -= displace(p.copy(d).multiplyScalar(r), d);
      pos.push(d.x * r, d.y * r, d.z * r);
    }
  }
  const row = ws + 1;
  for (let j = 0; j < hs; j++)
    for (let i = 0; i < ws; i++) {
      const a = j * row + i;
      const b = a + row;
      if (j > 0) idx.push(a, b, a + 1);
      if (j < hs - 1) idx.push(a + 1, b, b + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  // seams (φ = 0 / 2π and the poles) share positions: weld normals by merging duplicate vertices
  const welded = weld(g);
  welded.computeVertexNormals();
  return welded;
}

function weld(g: THREE.BufferGeometry) {
  const pos = g.getAttribute('position');
  const map = new Map<string, number>();
  const remap: number[] = [];
  const out: number[] = [];
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(6)},${pos.getY(i).toFixed(6)},${pos.getZ(i).toFixed(6)}`;
    let k = map.get(key);
    if (k === undefined) {
      k = out.length / 3;
      map.set(key, k);
      out.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    }
    remap.push(k);
  }
  const index = g.getIndex()!;
  const idx: number[] = [];
  for (let i = 0; i < index.count; i += 3) {
    const a = remap[index.getX(i)];
    const b = remap[index.getX(i + 1)];
    const c = remap[index.getX(i + 2)];
    if (a !== b && b !== c && a !== c) idx.push(a, b, c);
  }
  const w = new THREE.BufferGeometry();
  w.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  w.setIndex(idx);
  g.dispose();
  return w;
}

/** Splits an indexed geometry into parts by a label computed at each face centroid (normals kept). */
function splitByLabel(g: THREE.BufferGeometry, label: (centroid: THREE.Vector3) => string) {
  const pos = g.getAttribute('position');
  const nor = g.getAttribute('normal');
  const index = g.getIndex()!;
  const parts = new Map<string, { map: Map<number, number>; pos: number[]; nor: number[]; idx: number[] }>();
  const c = new THREE.Vector3();
  for (let i = 0; i < index.count; i += 3) {
    const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
    c.set(0, 0, 0);
    for (const v of ids) c.add(new THREE.Vector3(pos.getX(v), pos.getY(v), pos.getZ(v)));
    c.divideScalar(3);
    const key = label(c);
    let part = parts.get(key);
    if (!part) parts.set(key, (part = { map: new Map(), pos: [], nor: [], idx: [] }));
    for (const v of ids) {
      let k = part.map.get(v);
      if (k === undefined) {
        k = part.pos.length / 3;
        part.map.set(v, k);
        part.pos.push(pos.getX(v), pos.getY(v), pos.getZ(v));
        part.nor.push(nor.getX(v), nor.getY(v), nor.getZ(v));
      }
      part.idx.push(k);
    }
  }
  const out = new Map<string, THREE.BufferGeometry>();
  for (const [key, part] of parts) {
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.Float32BufferAttribute(part.pos, 3));
    pg.setAttribute('normal', new THREE.Float32BufferAttribute(part.nor, 3));
    pg.setIndex(part.idx);
    out.set(key, pg);
  }
  return out;
}

/** Mirror across the body's mid-sagittal plane (x → −x), keeping faces outward. */
export function mirrorX(g: THREE.BufferGeometry) {
  const m = g.clone();
  m.applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1));
  const index = m.getIndex();
  if (index) {
    const arr = index.array as Uint32Array | Uint16Array;
    for (let i = 0; i < arr.length; i += 3) {
      const t = arr[i + 1];
      arr[i + 1] = arr[i + 2];
      arr[i + 2] = t;
    }
    index.needsUpdate = true;
  }
  m.computeVertexNormals();
  return m;
}

/**
 * Makes a midline structure out of two closed halves with flat medial faces,
 * so a mid-sagittal cut shows a solid face instead of a hollow shell.
 */
function midlineHalves(g: THREE.BufferGeometry, gap = 0.0006) {
  const left = g.clone();
  const pos = left.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) if (pos.getX(i) < gap) pos.setX(i, gap);
  left.computeVertexNormals();
  const both = mergeAll([left, mirrorX(left)]);
  g.dispose();
  return both;
}

function tubeAlong(points: THREE.Vector3[], radius: number | ((t: number) => number), segs = 64, radial = 12) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const r = typeof radius === 'number' ? () => radius : radius;
  // variable-radius tube: sweep circles along the curve's frames
  const frames = curve.computeFrenetFrames(segs, false);
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const c = curve.getPointAt(t);
    const rad = r(t);
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const n = frames.normals[i].clone().multiplyScalar(Math.cos(a)).add(frames.binormals[i].clone().multiplyScalar(Math.sin(a)));
      pos.push(c.x + n.x * rad, c.y + n.y * rad, c.z + n.z * rad);
    }
  }
  const row = radial + 1;
  for (let i = 0; i < segs; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * row + j;
      idx.push(a, a + row, a + 1, a + 1, a + row, a + row + 1);
    }
  // end caps
  const capStart = pos.length / 3;
  const s = curve.getPointAt(0);
  pos.push(s.x, s.y, s.z);
  const capEnd = capStart + 1;
  const e = curve.getPointAt(1);
  pos.push(e.x, e.y, e.z);
  for (let j = 0; j < radial; j++) {
    idx.push(capStart, j + 1, j);
    idx.push(capEnd, segs * row + j, segs * row + j + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function ellipsoidGeo(half: [number, number, number], seg: [number, number] = [32, 20]) {
  const g = new THREE.SphereGeometry(1, seg[0], seg[1]);
  g.scale(...half);
  return g;
}

function mergeAll(geos: THREE.BufferGeometry[]) {
  const ready = geos.map((g) => {
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name);
    if (!g.getIndex()) g.setIndex(Array.from({ length: g.getAttribute('position').count }, (_, i) => i));
    if (!g.getAttribute('normal')) g.computeVertexNormals();
    return g;
  });
  const m = mergeGeometries(ready, false);
  if (!m) throw new Error('merge failed');
  return m;
}

const smooth = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);
const gauss = (x: number, s: number) => Math.exp(-((x / s) ** 2));

// ---------------------------------------------------------------- kidneys

/** Left kidney in its own frame: +X lateral, +Y up (long axis), +Z anterior; hilum on −X. */
function kidneyLocal() {
  const A = 0.026;
  const B = 0.05;
  const C = 0.017;
  const bean: Implicit = (p) => {
    const hilum = 1.1 * gauss(p.y, 0.02) * gauss(p.z, 0.011) * smooth(0, 0.6, -p.x / A);
    return (p.x / A) ** 2 + (p.y / B) ** 2 + (p.z / C) ** 2 - 1 + hilum;
  };
  const cortex = starSurface(bean, 0.08, [64, 48], (p) => 0.0004 * Math.sin(p.y * 900) * Math.sin(p.z * 700));

  // medulla: renal pyramids, bases under the cortex, apices (papillae) towards the sinus
  const sinus = new THREE.Vector3(-0.008, 0, 0);
  const pyr: THREE.BufferGeometry[] = [];
  const papillae: THREE.Vector3[] = [];
  const angles = [-62, -40, -18, 4, 26, 48, 68];
  for (const [k, deg] of angles.entries()) {
    const a = THREE.MathUtils.degToRad(deg);
    for (const z of k % 2 ? [-0.006, 0.006] : [0]) {
      const base = new THREE.Vector3(Math.cos(a) * A * 0.72, Math.sin(a) * B * 0.74, z);
      const apex = sinus.clone().lerp(base, 0.42).setZ(z * 0.5);
      const h = base.distanceTo(apex);
      const cone = new THREE.ConeGeometry(0.0085, h, 14, 1);
      // ConeGeometry points to +Y with its centre at mid-height
      const dir = apex.clone().sub(base).normalize();
      cone.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir));
      cone.translate(...base.clone().lerp(apex, 0.5).toArray());
      pyr.push(cone);
      papillae.push(apex);
    }
  }
  const medulla = mergeAll(pyr);

  // pelvis: funnel leaving the hilum + major and minor calyces cupping each papilla
  const hilumOut = new THREE.Vector3(-A * 1.0, -0.012, 0.004);
  const pelvisCentre = new THREE.Vector3(-0.012, -0.002, 0);
  const parts: THREE.BufferGeometry[] = [ellipsoidGeo([0.009, 0.013, 0.006]).translate(pelvisCentre.x, pelvisCentre.y, pelvisCentre.z)];
  parts.push(tubeAlong([pelvisCentre, pelvisCentre.clone().lerp(hilumOut, 0.6), hilumOut, hilumOut.clone().add(new THREE.Vector3(-0.004, -0.02, 0.002))], (t) => 0.0055 - 0.002 * t, 24, 12));
  for (const major of [1, -1]) {
    const mc = pelvisCentre.clone().add(new THREE.Vector3(0.004, major * 0.018, 0));
    parts.push(tubeAlong([pelvisCentre, mc], 0.004, 12, 10));
    for (const papilla of papillae.filter((q) => (major > 0 ? q.y > -0.004 : q.y <= -0.004))) {
      const cup = papilla.clone().lerp(pelvisCentre, 0.12);
      parts.push(tubeAlong([mc, mc.clone().lerp(cup, 0.5), cup], (t) => 0.0026 + 0.0016 * t * t, 12, 10));
    }
  }
  const pelvis = mergeAll(parts);
  return { cortex, medulla, pelvis };
}

function buildKidneys(out: Map<string, THREE.BufferGeometry>) {
  const k = kidneyLocal();
  // upper pole tilted medially, hilum turned anteromedially
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.55, 0.2, 'YZX'));
  const m = new THREE.Matrix4().compose(LANDMARKS.kidneyLeft, q, new THREE.Vector3(1, 1, 1));
  const shift = new THREE.Matrix4().makeTranslation(LANDMARKS.kidneyRightOffset.x, LANDMARKS.kidneyRightOffset.y, LANDMARKS.kidneyRightOffset.z);
  for (const [name, g] of [
    ['cortex-renal', k.cortex],
    ['medula-renal', k.medulla],
    ['pelve-renal', k.pelvis],
  ] as const) {
    g.applyMatrix4(m);
    out.set(`${name}-esq`, g);
    out.set(`${name}-dir`, mirrorX(g).applyMatrix4(shift));
  }
}

// ---------------------------------------------------------------- brain

const GYRUS = 2 * Math.PI / 0.021;
const FOLD_DIRS = [new THREE.Vector3(0.82, 0.31, 0.48), new THREE.Vector3(-0.27, 0.9, 0.34), new THREE.Vector3(0.41, -0.52, 0.75), new THREE.Vector3(0.6, 0.6, -0.53)].map((v) => v.normalize().multiplyScalar(GYRUS));

/** Central sulcus (z as a function of height) and lateral sulcus (height as a function of z), hemisphere-local. */
const centralZ = (y: number) => 0.012 - 0.34 * (y + 0.008);
const lateralY = (z: number) => -0.012 + (0.034 - z) * 0.2;

function hemisphereLocal(side: 1 | -1) {
  const a = 0.03;
  const c = 0.082;
  // the medial face (towards the midline) is flat; a pocket leaves room for the diencephalon
  const f: Implicit = (p) => {
    const lat = p.x * side; // > 0 lateral
    const nx = lat > 0 ? 2 : 5;
    const top = 0.056;
    const temporalDrop = 0.012 * gauss(p.z - 0.008, 0.034) * smooth(-0.4, 0.4, lat / a);
    const occipitalRise = 0.012 * smooth(-0.035, -0.07, p.z);
    const bottom = 0.04 + temporalDrop - occipitalRise;
    const b = p.y > 0 ? top : bottom;
    const pocket = 1.6 * gauss(lat + a, 0.012) * gauss(p.y + 0.014, 0.018) * gauss(p.z + 0.004, 0.028);
    return Math.abs(p.x / a) ** nx + (p.y / b) ** 2 + (p.z / c) ** 2 - 1 + pocket;
  };
  const displace = (p: THREE.Vector3) => {
    const lat = p.x * side;
    const medialFace = smooth(-0.6 * a, -0.85 * a, lat);
    let n = 0;
    for (const [i, k] of FOLD_DIRS.entries()) n += Math.sin(k.dot(p) + i * 1.7);
    const gyri = 0.0032 * Math.exp(-((n / 0.55) ** 2)) * (1 - 0.6 * medialFace);
    const lateralSulcus = 0.0065 * gauss(p.y - lateralY(p.z), 0.0032) * smooth(0.04, 0.03, p.z) * smooth(-0.045, -0.035, p.z) * smooth(0, 0.5, lat / a);
    const centralSulcus = 0.004 * gauss(p.z - centralZ(p.y), 0.0026) * smooth(-0.005, 0.005, p.y - lateralY(p.z)) * (1 - medialFace);
    return gyri + lateralSulcus + centralSulcus;
  };
  const geo = starSurface(f, 0.12, [220, 150], displace);
  const lobe = (p: THREE.Vector3) => {
    if (p.z < -0.056 + 0.12 * p.y) return 'lobo-occipital';
    if (p.y < lateralY(p.z) && p.z < 0.05 && p.z > -0.05 && (p.x * side > -0.4 * a || p.y < -0.025)) return 'lobo-temporal';
    if (p.z > centralZ(p.y)) return 'lobo-frontal';
    return 'lobo-parietal';
  };
  return splitByLabel(geo, lobe);
}

function cerebellumLocal() {
  const f: Implicit = (p) => (p.x / 0.05) ** 2 + (p.y / 0.024) ** 2 + (p.z / 0.03) ** 2 - 1 + 0.25 * gauss(p.x, 0.007) * smooth(0, -0.02, p.z);
  return starSurface(f, 0.08, [140, 90], (p) => {
    // folia: thin transverse ridges, gently curved, fading towards the midline notch
    const folia = 0.5 + 0.5 * Math.sin(Math.atan2(p.y, -p.z) * 52 + (p.x * p.x) * 900);
    return 0.0007 * folia;
  });
}

function buildBrain(out: Map<string, THREE.BufferGeometry>) {
  const B = LANDMARKS.brain;
  for (const [side, suffix] of [
    [1, 'esq'],
    [-1, 'dir'],
  ] as const) {
    const parts = hemisphereLocal(side);
    const cx = side * (0.003 + 0.03);
    for (const [name, g] of parts) {
      g.translate(B.x + cx, B.y, B.z);
      out.set(`${name}-${suffix}`, g);
    }
  }
  out.set('cerebelo', midlineHalves(cerebellumLocal().translate(B.x, B.y - 0.052, B.z - 0.046)));

  // brainstem: one smooth column from the diencephalon to the top of the spinal cord
  // (≈ y 1.545, z −0.046), split by height into midbrain, pons and medulla
  const stemPts = [
    [0, -0.004, -0.004],
    [0, -0.028, -0.012],
    [0, -0.056, -0.014],
    [0, -0.08, -0.024],
    [0, -0.1, -0.034],
  ].map(([x, y, z]) => new THREE.Vector3(B.x + x, B.y + y, B.z + z));
  const stem = tubeAlong(stemPts, (t) => 0.0105 + 0.0055 * gauss(t - 0.5, 0.13) - 0.004 * smooth(0.6, 1, t), 72, 28);
  // the pons bulges forwards
  const sp = stem.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < sp.count; i++) {
    const y = sp.getY(i) - B.y;
    const z = sp.getZ(i) - (B.z - 0.014);
    if (z > 0) sp.setZ(i, sp.getZ(i) + 0.005 * gauss(y + 0.056, 0.012) * Math.min(1, z / 0.008));
  }
  stem.computeVertexNormals();
  const stemParts = splitByLabel(stem, (c) => (c.y > B.y - 0.04 ? 'mesencefalo' : c.y > B.y - 0.07 ? 'ponte' : 'bulbo'));
  for (const [name, g] of stemParts) out.set(name, midlineHalves(g));

  // deep structures (seen in the sagittal cut)
  const cc = tubeAlong(
    [new THREE.Vector3(0, 0.002, 0.03), new THREE.Vector3(0, 0.016, 0.016), new THREE.Vector3(0, 0.02, -0.006), new THREE.Vector3(0, 0.014, -0.028), new THREE.Vector3(0, 0.004, -0.036)].map((v) => v.add(B)),
    (t) => 0.0042 + 0.0018 * gauss(t - 1, 0.12) + 0.0012 * gauss(t, 0.1),
    60,
    16,
  );
  // widen the band across the midline (it joins the two hemispheres)
  cc.applyMatrix4(new THREE.Matrix4().makeTranslation(-B.x, 0, 0)).applyMatrix4(new THREE.Matrix4().makeScale(2.6, 1, 1)).applyMatrix4(new THREE.Matrix4().makeTranslation(B.x, 0, 0));
  out.set('corpo-caloso', midlineHalves(cc));
  const thal = ellipsoidGeo([0.0075, 0.008, 0.013], [28, 18]).translate(B.x + 0.0085, B.y - 0.008, B.z - 0.01);
  out.set('talamo-esq', thal);
  out.set('talamo-dir', mirrorX(thal));
  out.set('hipotalamo', midlineHalves(ellipsoidGeo([0.006, 0.0055, 0.008], [24, 16]).translate(B.x, B.y - 0.022, B.z + 0.006)));
  const vent = tubeAlong(
    [
      [0.006, 0.006, 0.03],
      [0.0055, 0.011, 0.008],
      [0.007, 0.009, -0.018],
      [0.016, -0.004, -0.03],
      [0.023, -0.019, -0.014],
      [0.025, -0.026, 0.01],
    ].map(([x, y, z]) => new THREE.Vector3(B.x + x, B.y + y, B.z + z)),
    (t) => 0.0034 - 0.0012 * t,
    64,
    12,
  );
  out.set('ventriculo-lateral-esq', vent);
  out.set('ventriculo-lateral-dir', mirrorX(vent));
}

// ---------------------------------------------------------------- female reproductive system

function buildFemale(out: Map<string, THREE.BufferGeometry>) {
  const U = LANDMARKS.uterus;
  // anteverted, anteflexed uterus lying over the bladder: fundus forwards and up
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.95, 0, 0));
  const m = new THREE.Matrix4().compose(U, q, new THREE.Vector3(1, 1, 1));
  const pear: Implicit = (p) => {
    const w = 0.011 + 0.014 * smooth(-0.03, 0.022, p.y);
    return (p.x / w) ** 2 + (p.y / 0.033) ** 2 + (p.z / 0.0135) ** 2 - 1;
  };
  out.set('utero', starSurface(pear, 0.06, [64, 48]).applyMatrix4(m));
  const cervixTop = new THREE.Vector3(0, -0.026, 0).applyMatrix4(m);
  const cervixEnd = new THREE.Vector3(0, -0.05, 0.002).applyMatrix4(m);
  out.set('colo-do-utero', tubeAlong([cervixTop, cervixTop.clone().lerp(cervixEnd, 0.5), cervixEnd], (t) => 0.0085 - 0.0015 * t, 24, 18));
  // vagina: from the cervix downwards and forwards to the vestibule
  out.set(
    'vagina',
    tubeAlong([cervixEnd.clone().add(new THREE.Vector3(0, 0.004, -0.002)), new THREE.Vector3(0, 0.845, -0.03), new THREE.Vector3(0, 0.815, -0.012), new THREE.Vector3(0, 0.79, 0.006)], (t) => 0.0085 + 0.0015 * t, 40, 18),
  );

  // left ovary and uterine tube (the right side is the mirror image)
  const cornu = new THREE.Vector3(0.022, 0.024, 0).applyMatrix4(m);
  const ovaryC = new THREE.Vector3(0.048, U.y - 0.008, U.z - 0.014);
  const ovary = ellipsoidGeo([0.0095, 0.016, 0.0085], [28, 20]);
  ovary.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, 0.35)));
  ovary.translate(ovaryC.x, ovaryC.y, ovaryC.z);
  const tubePts = [
    cornu,
    cornu.clone().add(new THREE.Vector3(0.012, 0.002, -0.003)),
    new THREE.Vector3(0.042, cornu.y + 0.002, ovaryC.z + 0.008),
    new THREE.Vector3(0.06, ovaryC.y + 0.016, ovaryC.z),
    new THREE.Vector3(0.064, ovaryC.y + 0.004, ovaryC.z - 0.01),
    new THREE.Vector3(0.058, ovaryC.y - 0.006, ovaryC.z - 0.014),
  ];
  const tube = [tubeAlong(tubePts, (t) => 0.0022 + 0.0038 * t ** 3, 80, 12)];
  // fimbriae: finger-like fringes around the infundibulum, reaching towards the ovary
  const end = tubePts[tubePts.length - 1];
  const dir = end.clone().sub(tubePts[tubePts.length - 2]).normalize();
  const basis = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const off = new THREE.Vector3(Math.cos(a) * 0.004, 0, Math.sin(a) * 0.004).applyQuaternion(basis);
    const tip = end.clone().add(off.clone().multiplyScalar(1.8)).addScaledVector(dir, 0.009 + 0.002 * Math.sin(i * 2.3));
    tube.push(tubeAlong([end.clone().add(off), end.clone().add(off.clone().multiplyScalar(1.4)).addScaledVector(dir, 0.005), tip], (t) => 0.0012 - 0.0005 * t, 10, 6));
  }
  const tubeGeo = mergeAll(tube);
  out.set('ovario-esq', ovary);
  out.set('ovario-dir', mirrorX(ovary));
  out.set('tuba-uterina-esq', tubeGeo);
  out.set('tuba-uterina-dir', mirrorX(tubeGeo));
}

/** Builds every extra organ, in body coordinates. Heavy (brain folds): call once per lab visit. */
export function buildExtraOrgans(): Map<string, THREE.BufferGeometry> {
  const out = new Map<string, THREE.BufferGeometry>();
  buildKidneys(out);
  buildBrain(out);
  buildFemale(out);
  return out;
}

/** Approximate centre and size of each extra mesh, for the catalog (computed from the geometry). */
export function measure(geos: Map<string, THREE.BufferGeometry>) {
  const out = new Map<string, { ctr: [number, number, number]; sz: [number, number, number] }>();
  for (const [id, g] of geos) {
    g.computeBoundingBox();
    const b = g.boundingBox!;
    const c = b.getCenter(new THREE.Vector3());
    const s = b.getSize(new THREE.Vector3());
    const r = (v: number) => Math.round(v * 1000) / 1000;
    out.set(id, { ctr: [r(c.x), r(c.y), r(c.z)], sz: [r(s.x), r(s.y), r(s.z)] });
  }
  return out;
}
