/**
 * Bony fish (a perch-like teleost) sculpted in code: deep, laterally
 * compressed body covered in overlapping scales, dark vertical bars, golden
 * flanks and pale belly, lips, large eyes, spiny and soft dorsal fins,
 * forked tail, anal, pelvic and pectoral fins with rays. A dissection window
 * on the near flank shows the gills, heart, liver, stomach, intestine, swim
 * bladder, kidney, brain and the vertebral column with ribs.
 * Geometry by BioLab 3D.
 */
import * as THREE from 'three';
import { merge, paint, tube } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ac, organ } from './kit';
import { colorize } from './materials';
import { cutWindow, fbm, mix, pw, scaleEdge, surface, sweep, vcolor } from './sculpt';
import { coil, vertebrae } from './vertebrates';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const E = (x: number, y: number, z: number) => new THREE.Euler(x, y, z);

const X0 = -3.5;
const X1 = 4.1;
const tOf = (x: number) => (x - X0) / (X1 - X0);
const halfH = (t: number) => pw(t, [[0, 0.3], [0.1, 0.36], [0.3, 0.95], [0.5, 1.32], [0.68, 1.35], [0.84, 1.05], [0.95, 0.58], [1, 0.2]]);
const halfW = (t: number) => pw(t, [[0, 0.13], [0.12, 0.17], [0.4, 0.52], [0.6, 0.66], [0.8, 0.6], [0.93, 0.38], [1, 0.12]]);
const centre = (t: number) => pw(t, [[0, 0.05], [0.5, 0.1], [0.85, 0.05], [1, -0.15]]);
const top = (x: number) => centre(tOf(x)) + halfH(tOf(x));
const bottom = (x: number) => centre(tOf(x)) - halfH(tOf(x));

/** Dissection window on the near (+z) flank. */
const inWindow = (c: THREE.Vector3) => c.z > 0 && ((c.x - 0.45) / 2.45) ** 2 + ((c.y + 0.02) / 1.02) ** 2 < 1;
const BARS = [2.25, 1.35, 0.45, -0.45, -1.35, -2.25];

function skin() {
  const g = sweep([V(X0, 0, 0), V(X1, 0, 0)], (t) => ({ a: halfH(t), b: halfW(t), sq: 2.15, off: centre(t) }), { rings: 380, radial: 220 });
  vcolor(g, (p) => {
    const t = tOf(p.x);
    const h = (p.y - centre(t)) / halfH(t);
    let c = mix('#F3EFE2', '#C9A646', (h + 0.55) / 0.5);
    c = c.lerp(new THREE.Color('#4A5A2C'), Math.min(1, Math.max(0, (h - 0.25) / 0.45)));
    // dark vertical bars, fading towards the belly
    let bar = 0;
    for (const bx of BARS) bar = Math.max(bar, Math.exp(-((p.x - bx - 0.15 * h) ** 2) / 0.035));
    c.lerp(new THREE.Color('#26301A'), bar * 0.55 * Math.min(1, Math.max(0, (h + 0.3) / 0.6)));
    if (p.x < 2.7) {
      const e = scaleEdge(p.x, p.y, 0.26);
      // scales: dark free edge, light centre (the head is scaleless)
      c.lerp(new THREE.Color('#2A2614'), e * 0.42);
      c.lerp(new THREE.Color('#FFF4D0'), (1 - e) * 0.14);
    }
    // lateral line
    const ll = Math.exp(-((h - 0.42) ** 2) / 0.0012);
    if (p.x < 3.0) c.lerp(new THREE.Color('#3A3A26'), ll * 0.6);
    // gill cover (operculum) edge
    const op = Math.exp(-((p.x - (2.72 - 0.28 * h * h)) ** 2) / 0.0015) * (h < 0.7 ? 1 : 0);
    c.lerp(new THREE.Color('#2B2615'), op * 0.7);
    // cheek and snout slightly darker, fine mottling
    if (p.x > 2.8 && h > -0.2) c.lerp(new THREE.Color('#5B5A30'), 0.25);
    const m = fbm(p, 3, 2);
    if (m > 0.6) c.lerp(new THREE.Color('#3B3A22'), (m - 0.6) * 0.8);
    return c;
  });
  const rim = cutWindow(g, inWindow, 0.12, '#E2A08F');
  // lips, mouth slit and nostrils
  const head: THREE.BufferGeometry[] = [];
  for (const y of [-0.11, -0.26]) {
    const pts: THREE.Vector3[] = [];
    for (let k = -6; k <= 6; k++) {
      const x = 4.08 - Math.abs(k) * 0.07;
      pts.push(V(x, y - Math.abs(k) * 0.006, Math.sign(k) * halfW(tOf(x)) * 0.97));
    }
    head.push(paint(tube(pts, 0.035, false, 60, 8), '#8E7444'));
  }
  head.push(paint(new THREE.SphereGeometry(1, 20, 12).scale(0.14, 0.05, 0.22).translate(4.0, -0.185, 0), '#1E1510'));
  for (const s of [1, -1]) head.push(paint(new THREE.SphereGeometry(0.035, 10, 8).translate(3.86, 0.24, s * 0.21), '#1B1B12'));
  return merge([g, rim, ...head]);
}

function eyes() {
  const parts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    const z = s * halfW(tOf(3.42)) * 0.86;
    const iris = new THREE.SphereGeometry(1, 32, 20);
    iris.scale(0.27, 0.27, 0.1).translate(3.42, 0.22, z);
    vcolor(iris, (p) => {
      const r = Math.hypot(p.x - 3.42, p.y - 0.22) / 0.27;
      return mix('#E5C25A', '#7A5A1E', r).lerp(new THREE.Color('#C8C8C0'), r > 0.92 ? 0.6 : 0);
    });
    parts.push(iris);
    parts.push(paint(new THREE.SphereGeometry(1, 24, 16).scale(0.14, 0.14, 0.07).translate(3.43, 0.22, z + s * 0.05), ac('olhos')));
  }
  return merge(parts);
}

// ------------------------------------------------------------------ fins

interface FinOpts {
  base: (u: number) => THREE.Vector3;
  dir: (u: number) => THREE.Vector3;
  len: (u: number) => number;
  rays: number;
  scallop: number;
  from: string;
  to: string;
  spot?: (u: number, v: number) => number;
}

function fin(o: FinOpts) {
  const g = surface((u, v) => {
    const L = o.len(u) * (1 - o.scallop * (0.5 - 0.5 * Math.cos(2 * Math.PI * u * o.rays)) * v * v);
    return o.base(u).addScaledVector(o.dir(u), L * v);
  }, Math.max(24, o.rays * 6), 18);
  return vcolor(g, (_p, _n, u, v) => {
    let c = mix(o.from, o.to, v);
    const ray = Math.pow(Math.abs(Math.cos(Math.PI * u * o.rays)), 18);
    c.lerp(new THREE.Color('#4A4530'), ray * 0.25 * (0.3 + 0.7 * v));
    if (o.spot) c.lerp(new THREE.Color('#15140E'), o.spot(u, v));
    return c;
  });
}

function spines(o: FinOpts, count: number) {
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k <= count; k++) {
    const u = k / o.rays;
    const b = o.base(u);
    const tip = b.clone().addScaledVector(o.dir(u), o.len(u) * 1.06);
    parts.push(paint(tube([b, tip], 0.022, false, 6, 5), '#E9E3C8'));
  }
  return parts;
}

function fins() {
  const parts: THREE.BufferGeometry[] = [];
  const spiny: FinOpts = {
    base: (u) => {
      const x = 1.9 - 2.1 * u;
      return V(x, top(x) - 0.05, 0);
    },
    dir: () => V(-0.32, 1, 0).normalize(),
    len: (u) => pw(u, [[0, 0.45], [0.15, 1.05], [0.42, 0.95], [0.85, 0.45], [1, 0.3]]),
    rays: 12,
    scallop: 0.24,
    from: '#9A9A72',
    to: '#6E6A48',
    spot: (u, v) => (u > 0.72 && v > 0.35 ? 0.7 * Math.min(1, (u - 0.72) * 6) : 0),
  };
  parts.push(fin(spiny), ...spines(spiny, 12));
  parts.push(
    fin({
      base: (u) => {
        const x = -0.35 - 1.95 * u;
        return V(x, top(x) - 0.05, 0);
      },
      dir: () => V(-0.5, 1, 0).normalize(),
      len: (u) => pw(u, [[0, 0.7], [0.3, 0.85], [1, 0.32]]),
      rays: 15,
      scallop: 0.06,
      from: '#9A9A72',
      to: '#7A7350',
    }),
  );
  // forked tail
  parts.push(
    fin({
      base: (u) => V(-3.42, centre(0) - 0.27 + 0.56 * u, 0),
      dir: (u) => {
        const a = (u - 0.5) * 1.3;
        return V(-Math.cos(a), Math.sin(a), 0);
      },
      len: (u) => 2.05 - 0.9 * Math.exp(-(((u - 0.5) / 0.19) ** 2)),
      rays: 19,
      scallop: 0.04,
      from: '#A59F6E',
      to: '#6E6644',
    }),
  );
  // anal fin (orange in perch)
  const anal: FinOpts = {
    base: (u) => {
      const x = -1.2 - 1.15 * u;
      return V(x, bottom(x) + 0.05, 0);
    },
    dir: () => V(-0.55, -1, 0).normalize(),
    len: (u) => pw(u, [[0, 0.65], [0.3, 0.78], [1, 0.35]]),
    rays: 10,
    scallop: 0.08,
    from: '#E0A04A',
    to: '#C5622E',
  };
  parts.push(fin(anal), ...spines(anal, 2));
  for (const s of [1, -1]) {
    // pelvic fins under the chest
    parts.push(
      fin({
        base: (u) => {
          const x = 1.6 - 0.4 * u;
          return V(x, bottom(x) + 0.1, s * 0.2);
        },
        dir: () => V(-0.62, -0.72, s * 0.3).normalize(),
        len: (u) => pw(u, [[0, 0.95], [1, 0.55]]),
        rays: 6,
        scallop: 0.08,
        from: '#E0A04A',
        to: '#C5622E',
      }),
    );
    // pectoral fins behind the gill cover
    const z = s * (halfW(tOf(2.3)) + 0.03);
    parts.push(
      fin({
        base: (u) => V(2.3 - 0.06 * u, -0.5 + 0.38 * u, z),
        dir: (u) => {
          const a = -0.5 + 0.55 * u;
          return V(-Math.cos(a), Math.sin(a), s * 0.32).normalize();
        },
        len: (u) => pw(u, [[0, 0.75], [0.55, 1.15], [1, 0.95]]),
        rays: 12,
        scallop: 0.05,
        from: '#D8B36A',
        to: '#B98E45',
      }),
    );
  }
  return merge(parts);
}

function lateralLine() {
  const parts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (let i = 0; i <= 56; i++) {
      const x = 2.75 - (i / 56) * 6.05;
      const t = tOf(x);
      const p = V(x, centre(t) + 0.42 * halfH(t), s * halfW(t) * 0.995);
      if (s > 0 && inWindow(p)) continue;
      parts.push(paint(new THREE.SphereGeometry(0.022, 8, 6).translate(p.x, p.y, p.z), '#3A3826'));
    }
  return merge(parts);
}

// ------------------------------------------------------------------ organs

function gills() {
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 4; k++) {
    const x = 2.55 - k * 0.18;
    for (const s of [1, -1]) {
      const arc: THREE.Vector3[] = [];
      for (let i = 0; i <= 12; i++) {
        const a = -1.2 + (i / 12) * 2.2;
        arc.push(V(x - Math.cos(a) * 0.1, Math.sin(a) * 0.62 - 0.1, s * (0.16 + Math.cos(a) * 0.22)));
      }
      parts.push(paint(tube(arc, 0.04, false, 30, 6), '#E8D8C8'));
      // feathery gill filaments
      for (let i = 1; i < 12; i++)
        for (const d of [-1, 1]) parts.push(paint(tube([arc[i], arc[i].clone().add(V(-0.22, d * 0.03, s * 0.12))], 0.018, false, 2, 4), mix(ac('branquias'), '#9E1B2A', (k % 2) * 0.3)));
    }
  }
  return merge(parts);
}

export function fish(): BuiltModel {
  const meshes: MeshDef[] = [];
  meshes.push({ id: 'pe-pele', structure: 'pele-peixe', geometry: skin() });
  meshes.push({ id: 'pe-nadadeiras', structure: 'nadadeiras', geometry: fins() });
  meshes.push({ id: 'pe-linha-lateral', structure: 'linha-lateral', geometry: lateralLine() });
  meshes.push({ id: 'pe-olhos', structure: 'olhos', geometry: eyes() });
  meshes.push({ id: 'pe-branquias', structure: 'branquias', geometry: gills() });
  meshes.push({ id: 'pe-coracao', structure: 'coracao', geometry: merge([organ(0.25, 0.2, 0.2, [2.05, -0.75, 0], ac('coracao')), organ(0.22, 0.17, 0.18, [1.85, -0.52, 0], '#6D597A'), paint(tube([V(2.2, -0.7, 0), V(2.45, -0.55, 0), V(2.6, -0.4, 0)], 0.07, false, 10, 8), '#C9A6B8')]) });
  meshes.push({ id: 'pe-figado', structure: 'figado', geometry: organ(0.75, 0.32, 0.45, [1.35, -0.45, 0.05], ac('figado'), E(0, 0, -0.2)) });
  meshes.push({ id: 'pe-estomago', structure: 'estomago', geometry: organ(0.55, 0.26, 0.3, [0.65, -0.35, -0.12], ac('estomago'), E(0, 0, 0.15)) });
  meshes.push({ id: 'pe-intestino', structure: 'intestino-vertebrado', geometry: merge([paint(coil(-1.4, 0.2, -0.85, -0.55, 0, 3, 0.09), ac('intestino-vertebrado')), paint(tube([V(-1.4, -0.6, 0), V(-1.9, -0.85, 0), V(-2.15, -0.95, 0)], 0.08, false, 12, 8), ac('intestino-vertebrado'))]) });
  meshes.push({ id: 'pe-bexiga', structure: 'bexiga-natatoria', geometry: organ(1.6, 0.36, 0.34, [-0.4, 0.22, 0], ac('bexiga-natatoria'), E(0, 0, -0.04)) });
  meshes.push({ id: 'pe-rins', structure: 'rins', geometry: organ(1.9, 0.09, 0.13, [0.0, 0.55, 0], ac('rins')) });
  meshes.push({ id: 'pe-encefalo', structure: 'encefalo', geometry: merge([organ(0.15, 0.1, 0.1, [3.45, 0.42, 0], ac('encefalo')), organ(0.14, 0.1, 0.13, [3.2, 0.46, 0], ac('encefalo')), organ(0.15, 0.1, 0.1, [2.95, 0.46, 0], ac('encefalo'))]) });
  const spinePts = [V(-3.3, 0.08, 0), V(-1.5, 0.58, 0), V(1.0, 0.72, 0), V(2.75, 0.6, 0)];
  const ribs: THREE.BufferGeometry[] = [vertebrae(spinePts, 0.065, 0.19)];
  for (let x = -1.6; x < 1.8; x += 0.28)
    for (const s of [1, -1]) {
      const w = halfW(tOf(x));
      ribs.push(paint(tube([V(x, 0.68, s * 0.06), V(x - 0.05, 0.1, s * w * 0.8), V(x - 0.15, -0.6, s * w * 0.62)], 0.018, false, 12, 4), ac('coluna-vertebral')));
    }
  // fin rays' supports along the back (pterygiophores)
  for (let x = -2.2; x < 1.9; x += 0.17) ribs.push(paint(tube([V(x, top(x) - 0.1, 0), V(x + 0.05, 0.78, 0)], 0.014, false, 4, 4), ac('coluna-vertebral')));
  meshes.push({ id: 'pe-coluna', structure: 'coluna-vertebral', geometry: merge(ribs) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(16, [-0.9, 0.2, 0], 0.15, 0.22) };
}
