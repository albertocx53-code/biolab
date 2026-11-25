/**
 * Vertebrate models of the Animals laboratory: a bony fish, a frog and a bird,
 * each with translucent skin over the main organs, plus the comparison of
 * vertebrate hearts. Procedural geometry written by BioLab 3D.
 */
import * as THREE from 'three';
import { ellipsoid, merge, paint, place, tube, wall, type Cut } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ac, limb, loft, organ, plate, smooth, V } from './kit';
import { bird } from './bird';
import { fish } from './fish';
import { frog } from './frog';
import { colorize } from './materials';
import { fbm, mix, sweep, vcolor } from './sculpt';

type Get = (id: string) => THREE.Object3D | undefined;
const E = (x: number, y: number, z: number) => new THREE.Euler(x, y, z);

/** Gut coil: a tube that loops back and forth inside a box. */
export function coil(x0: number, x1: number, y0: number, y1: number, z: number, turns: number, r: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= turns * 16; i++) {
    const s = i / (turns * 16);
    const a = s * turns * Math.PI * 2;
    pts.push(V(x0 + (x1 - x0) * (0.5 + 0.5 * Math.sin(a)), y0 + (y1 - y0) * s, z + Math.cos(a) * 0.12));
  }
  return tube(pts, r, false, turns * 60, 8);
}

export function vertebrae(points: THREE.Vector3[], r: number, every: number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const len = curve.getLength();
  const parts: THREE.BufferGeometry[] = [];
  for (let s = 0; s < len; s += every) {
    const u = s / len;
    const p = curve.getPointAt(u);
    const tan = curve.getTangentAt(u);
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), tan);
    parts.push(place(new THREE.CylinderGeometry(r, r, every * 0.72, 12), p, q));
    // neural spine
    parts.push(place(new THREE.BoxGeometry(every * 0.3, r * 1.6, r * 0.5), p.clone().add(V(0, r * 1.3, 0))));
  }
  return paint(merge(parts), ac('coluna-vertebral'));
}

// ===================================================================== fish

/** Vertical colour gradient (dark back, light belly). */
export function shade(g: THREE.BufferGeometry, top: string, bottom: string, y0: number, y1: number) {
  const p = g.getAttribute('position');
  const a = new THREE.Color(bottom);
  const b = new THREE.Color(top);
  const c = new THREE.Color();
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    c.copy(a).lerp(b, smooth((p.getY(i) - y0) / (y1 - y0)));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

// ===================================================================== frog

// ===================================================================== hearts

/** Each heart is built around x = 0 and then moved to its place in a 2 × 2 grid (fish, amphibian / reptile, bird–mammal). */
const HEART_X = [0, 0, 0, 0];
export const HEART_GRID: [number, number][] = [
  [-2.05, 2.15],
  [2.05, 2.15],
  [-2.05, -2.25],
  [2.05, -2.25],
];
const HCUT: Cut = { center: 0, width: Math.PI * 0.9 };

/** Heart chamber cut open at the front: muscular outside, blood-coloured lining inside. */
function chamber(a: number, b: number, c: number, at: THREE.Vector3, color: string) {
  const g = place(wall(ellipsoid(a, b, c), 0.78, HCUT, [48, 32]), at);
  const blood = new THREE.Color(color);
  return vcolor(g, (p) => {
    const e = Math.hypot((p.x - at.x) / a, (p.y - at.y) / b, (p.z - at.z) / c);
    const outer = smooth((e - 0.84) / 0.1);
    const muscle = mix('#9B3B36', '#B85A4E', fbm(p, 4, 2)).lerp(blood, 0.3);
    return blood.clone().lerp(muscle, outer);
  });
}

/** Blood paths through each heart (venous in, arterial out). */
export function heartPaths() {
  const P = (k: number, pts: [number, number, number][]) => new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => V(HEART_GRID[k][0] + x, HEART_GRID[k][1] + y, z)));
  return {
    venous: [
      P(0, [[-1.1, -1.9, 0], [-0.75, -1.2, 0], [-0.3, 0.3, 0], [0.1, -0.85, 0], [0.75, 0.2, 0], [0.9, 1.9, 0]]),
      P(1, [[-1.3, 1.9, 0], [-0.6, 0.55, 0], [0, -0.75, 0], [0.4, 0.4, 0], [0.3, 1.9, 0]]),
      P(2, [[-1.3, 1.9, 0], [-0.6, 0.55, 0], [-0.3, -0.7, 0], [0.0, 0.4, 0], [-0.2, 1.9, 0]]),
      P(3, [[-1.3, 1.9, 0], [-0.6, 0.55, 0], [-0.55, -0.75, 0], [-0.25, 0.4, 0], [-0.35, 1.9, 0]]),
    ],
    arterial: [
      null,
      P(1, [[1.3, 1.9, 0], [0.6, 0.55, 0], [0.05, -0.75, 0], [0.45, 0.4, 0], [0.4, 1.9, 0]]),
      P(2, [[1.3, 1.9, 0], [0.6, 0.55, 0], [0.45, -0.7, 0], [0.25, 0.4, 0], [0.45, 1.9, 0]]),
      P(3, [[1.3, 1.9, 0], [0.6, 0.55, 0], [0.55, -0.75, 0], [0.25, 0.4, 0], [0.35, 1.9, 0]]),
    ],
  };
}
export const BLOOD_N = 10;

/** Blood vessel following a stretch of a blood path (so the animated cells run inside it), tapered and shaded. */
function vessel(curve: THREE.Curve<THREE.Vector3>, t0: number, t1: number, r0: number, r1: number, yCut?: number) {
  let pts = Array.from({ length: 14 }, (_, i) => curve.getPoint(t0 + ((t1 - t0) * i) / 13));
  if (yCut !== undefined) pts = pts.filter((p) => p.y >= yCut);
  return sweep(pts, (t) => ({ a: r0 + (r1 - r0) * t, b: r0 + (r1 - r0) * t }), { up: V(0, 0, 1), rings: 24, radial: 18, caps: false });
}
function vesselShade(g: THREE.BufferGeometry, base: string) {
  const c0 = new THREE.Color(base);
  return vcolor(g, (p, n) => c0.clone().multiplyScalar(0.78 + 0.3 * Math.max(0, n.z) + 0.08 * fbm(p, 6, 1)));
}

function hearts(): BuiltModel {
  const meshes: MeshDef[] = [];
  const blue = '#3A6EA5';
  const red = '#C1121F';
  const purple = '#8E44AD';
  // fish: sinus venosus → atrium → ventricle → bulbus arteriosus (one circuit, venous blood only)
  const f = HEART_X[0];
  meshes.push({ id: 'h0-seio', structure: 'seio-venoso', geometry: chamber(0.55, 0.4, 0.45, V(f - 0.8, -1.1, 0), '#5A7FA8') });
  meshes.push({ id: 'h0-atrio', structure: 'atrio', geometry: chamber(0.75, 0.6, 0.6, V(f - 0.35, 0.35, 0), blue) });
  meshes.push({ id: 'h0-ventriculo', structure: 'ventriculo', geometry: chamber(0.85, 0.7, 0.7, V(f + 0.15, -0.8, 0), '#2F5E8E') });
  meshes.push({ id: 'h0-bulbo', structure: 'bulbo-arterioso', geometry: chamber(0.4, 0.75, 0.4, V(f + 0.75, 0.6, 0), '#7DA3C8') });
  // amphibian: two atria, one ventricle (mixing)
  for (const [k, vColor, vStruct] of [
    [1, purple, 'ventriculo-misto'],
    [2, purple, 'ventriculo-misto'],
  ] as const) {
    const x = HEART_X[k];
    meshes.push({ id: `h${k}-ad`, structure: 'atrio-direito', geometry: chamber(0.7, 0.6, 0.6, V(x - 0.65, 0.6, 0), blue) });
    meshes.push({ id: `h${k}-ae`, structure: 'atrio-esquerdo', geometry: chamber(0.7, 0.6, 0.6, V(x + 0.65, 0.6, 0), red) });
    meshes.push({ id: `h${k}-v`, structure: vStruct, geometry: chamber(1.25, 0.95, 0.8, V(x, -0.75, 0), vColor) });
  }
  // reptile: incomplete septum inside the ventricle
  meshes.push({ id: 'h2-septo', structure: 'septo-incompleto', geometry: paint(place(new THREE.SphereGeometry(1, 24, 16).scale(0.07, 0.48, 0.55), [HEART_X[2], -1.05, -0.05]), '#C96A62') });
  // bird / mammal: four chambers, complete septum
  const m = HEART_X[3];
  meshes.push({ id: 'h3-ad', structure: 'atrio-direito', geometry: chamber(0.7, 0.6, 0.6, V(m - 0.65, 0.6, 0), blue) });
  meshes.push({ id: 'h3-ae', structure: 'atrio-esquerdo', geometry: chamber(0.7, 0.6, 0.6, V(m + 0.65, 0.6, 0), red) });
  meshes.push({ id: 'h3-vd', structure: 'ventriculo-direito', geometry: chamber(0.7, 0.95, 0.75, V(m - 0.58, -0.75, 0), blue) });
  meshes.push({ id: 'h3-ve', structure: 'ventriculo-esquerdo', geometry: chamber(0.75, 1.0, 0.8, V(m + 0.6, -0.78, 0), red) });
  meshes.push({ id: 'h3-septo', structure: 'septo-interventricular', geometry: paint(place(new THREE.SphereGeometry(1, 24, 16).scale(0.09, 1.0, 0.6), [m, -0.8, -0.05]), '#C96A62') });
  // muscular envelope (myocardium) of the three- and four-chambered hearts, cut open at the front like the chambers
  for (const k of [1, 2, 3]) meshes.push({ id: `h${k}-miocardio`, structure: k === 3 ? 'ventriculo-esquerdo' : 'ventriculo-misto', geometry: heartEnvelope(k) });
  // vessels: in (top, sides) and out (top, middle)
  for (const mesh of meshes) {
    const k = Number(mesh.id[1]);
    place(mesh.geometry, [HEART_GRID[k][0], HEART_GRID[k][1], 0]);
  }
  const ves: THREE.BufferGeometry[] = [];
  const vesR: THREE.BufferGeometry[] = [];
  const paths = heartPaths();
  for (let k = 0; k < 4; k++) {
    const vc = paths.venous[k];
    const n = vc.points.length - 1;
    const top = HEART_GRID[k][1] + 1.0;
    ves.push(vessel(vc, 0, 1 / n, 0.15, 0.21), vessel(vc, (n - 1) / n, 1, 0.21, 0.17, top));
    const a = paths.arterial[k];
    if (a) {
      const m = a.points.length - 1;
      vesR.push(vessel(a, 0, 1 / m, 0.15, 0.2), vessel(a, (m - 1) / m, 1, 0.22, 0.18, top));
    }
  }
  meshes.push({ id: 'h-vasos-venosos', structure: 'sangue-venoso', geometry: vesselShade(merge(ves), '#4A78B5') });
  meshes.push({ id: 'h-vasos-arteriais', structure: 'sangue-arterial', geometry: vesselShade(merge(vesR), '#D64545') });
  // blood cells for the animation
  for (let i = 0; i < BLOOD_N; i++) {
    meshes.push({ id: `sv-${i}`, structure: 'sangue-venoso', geometry: paint(new THREE.SphereGeometry(0.11, 10, 8), '#2B59C3') });
    meshes.push({ id: `sa-${i}`, structure: 'sangue-arterial', geometry: paint(new THREE.SphereGeometry(0.11, 10, 8), '#D62828') });
  }
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(19.5, [0.6, 0.25, 0], 0.1, 0) };
}

const HEART_PARTS = [
  ['h0-seio', 'h0-atrio', 'h0-ventriculo', 'h0-bulbo'],
  ['h1-ad', 'h1-ae', 'h1-v', 'h1-miocardio'],
  ['h2-ad', 'h2-ae', 'h2-v', 'h2-septo', 'h2-miocardio'],
  ['h3-ad', 'h3-ae', 'h3-vd', 'h3-ve', 'h3-septo', 'h3-miocardio'],
];

/** Heart-shaped muscular wall: broad base with two atrial bulges, tapering to the apex; coronary vessels on the surface. */
function heartEnvelope(k: number) {
  const dist = (d: THREE.Vector3) => {
    const base = ellipsoid(1.55, 1.55, 1.02)(d);
    const apex = d.y < 0 ? 1 + 0.32 * d.y * d.y - 0.18 * Math.abs(d.x) * (-d.y) : 1;
    const lobes = d.y > 0 ? 1 + 0.08 * Math.abs(Math.sin(2 * Math.atan2(d.x, d.y))) : 1;
    return base * apex * lobes;
  };
  const g = wall(dist, 0.9, HCUT, [72, 48]);
  g.translate(0, -0.35, 0);
  const groove = k === 3 ? 0.18 : 0.28;
  return vcolor(g, (p, n) => {
    let c = mix('#8E2F2F', '#B4524A', fbm(p, 2.5, 2));
    // coronary groove with fat and the interventricular branch running to the apex
    const ring = Math.exp(-((p.y - groove + 0.35) ** 2) / 0.01);
    c.lerp(new THREE.Color('#E8C77A'), ring * 0.55);
    const lad = Math.exp(-((p.x - 0.15 + 0.2 * (p.y + 0.4)) ** 2) / 0.004) * (p.y < groove - 0.3 ? 1 : 0) * (n.z < -0.2 ? 1 : 0.6);
    c.lerp(new THREE.Color('#D23A3A'), lad * 0.8);
    const vein = Math.exp(-(((p.x + 0.55) * 0.9 + 0.15 * Math.sin(p.y * 4)) ** 2) / 0.003) * (p.y < groove - 0.3 ? 1 : 0);
    c.lerp(new THREE.Color('#4A5E9A'), vein * 0.6);
    return c;
  });
}

let PATHS: ReturnType<typeof heartPaths> | null = null;

/** Compared circulation (4 steps): fish, amphibian, reptile, bird/mammal; blood flows through the focused heart. */
export function poseHearts(P: number, get: Get) {
  PATHS ??= heartPaths();
  const step = Math.min(3, Math.floor(P));
  const t = P - step;
  for (let k = 0; k < 4; k++) {
    const focus = k === step;
    // the heart in focus comes forward; the others shrink a little around their own centre
    const k4 = P > 0 ? smooth(Math.min(1, t * 4)) : 0;
    const z = focus ? 0.6 * k4 : 0;
    const s = focus || P === 0 ? 1 : 1 - 0.18 * (step === 0 && t < 0.25 ? k4 : 1);
    const [gx, gy] = HEART_GRID[k];
    for (const id of HEART_PARTS[k]) {
      const o = get(id);
      if (!o) continue;
      o.scale.setScalar(s);
      o.position.set(gx * (1 - s), gy * (1 - s), z);
    }
  }
  for (let i = 0; i < BLOOD_N; i++) {
    const u = (t * 1.6 + i / BLOOD_N) % 1;
    const sv = get(`sv-${i}`);
    const sa = get(`sa-${i}`);
    const run = P > 0;
    const z = 0.6;
    if (sv) {
      const p = PATHS.venous[step].getPoint(u);
      sv.position.set(p.x, p.y, p.z + z);
      sv.scale.setScalar(run ? 1 : 0.0001);
    }
    if (sa) {
      const path = PATHS.arterial[step];
      if (!path || !run) sa.scale.setScalar(0.0001);
      else {
        const p = path.getPoint((u + 0.5 / BLOOD_N) % 1);
        sa.position.set(p.x, p.y, p.z + z);
        sa.scale.setScalar(1);
      }
    }
  }
}

export type VertebrateModel = 'peixe' | 'sapo' | 'ave' | 'coracoes';

export function buildVertebrate(id: VertebrateModel): BuiltModel {
  switch (id) {
    case 'peixe':
      return fish();
    case 'sapo':
      return frog();
    case 'ave':
      return bird();
    case 'coracoes':
      return hearts();
  }
}

