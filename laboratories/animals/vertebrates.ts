/**
 * Vertebrate models of the Animals laboratory: a bony fish, a frog and a bird,
 * each with translucent skin over the main organs, plus the comparison of
 * vertebrate hearts. Procedural geometry written by BioLab 3D.
 */
import * as THREE from 'three';
import { ellipsoid, merge, paint, place, tube, wall, type Cut } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ac, limb, loft, organ, plate, smooth, V } from './kit';
import { fish } from './fish';
import { colorize } from './materials';

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

const frogSec = (t: number) => {
  const b = Math.pow(Math.sin(Math.PI * Math.min(1, 0.02 + t * 0.98)), 0.55);
  // body slopes up towards the head (sitting posture)
  return { y: -0.55 + t * 0.95 - 0.25 * Math.sin(Math.PI * t), ry: 0.95 * b * (1 - 0.25 * t), rz: 1.35 * b * (t > 0.7 ? 1 - (t - 0.7) * 0.6 : 1) };
};

/** Exterior of a sitting frog (skin, legs, eyes) built around the origin. */
export function frogExterior(scale = 1) {
  const skin = loft(-2.3, 2.6, frogSec, 90, 40);
  shade(skin, '#4F7A36', '#E4EFC7', -1.2, 0.8);
  const legs: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    // folded hind leg: thigh forward, shank back, long webbed foot forward
    legs.push(organ(0.82, 0.32, 0.32, [-1.1, -0.7, s * 1.3], '#5F8D3F', E(0, s * 0.35, 0.25)));
    legs.push(organ(0.9, 0.3, 0.3, [-0.85, -1.05, s * 1.75], '#6A994E', E(0, s * -0.45, -0.2)));
    legs.push(limb([V(-1.5, -1.25, s * 1.85), V(-0.6, -1.42, s * 2.0), V(0.4, -1.48, s * 2.05)], 0.14, 0.09, '#6A994E'));
    for (let k = 0; k < 5; k++) legs.push(limb([V(0.35, -1.48, s * 2.05), V(0.95 + k * 0.05, -1.5, s * (1.6 + k * 0.22))], 0.04, 0.035, '#5F8D3F'));
    const web = new THREE.CircleGeometry(0.75, 12, -0.6, 1.3);
    web.rotateX(-Math.PI / 2).translate(0.35, -1.49, s * 2.05);
    legs.push(paint(web, '#7FAA5E'));
    // front leg and hand
    legs.push(limb([V(1.4, -0.4, s * 0.9), V(1.75, -0.95, s * 1.05), V(1.9, -1.45, s * 1.1)], 0.13, 0.09, '#6A994E'));
    for (let k = 0; k < 4; k++) legs.push(limb([V(1.9, -1.45, s * 1.1), V(2.25 + k * 0.03, -1.5, s * (0.85 + k * 0.18))], 0.035, 0.03, '#5F8D3F'));
  }
  const legsTone = merge(legs);
  const eyes = merge([
    organ(0.27, 0.27, 0.25, [1.75, 0.62, 0.55], '#C9A227'),
    organ(0.15, 0.17, 0.15, [1.84, 0.66, 0.74], ac('olhos')),
    organ(0.27, 0.27, 0.25, [1.75, 0.62, -0.55], '#C9A227'),
    organ(0.15, 0.17, 0.15, [1.84, 0.66, -0.74], ac('olhos')),
    organ(0.22, 0.22, 0.04, [1.2, 0.25, 1.12], '#8A6B3A'),
    organ(0.22, 0.22, 0.04, [1.2, 0.25, -1.12], '#8A6B3A'),
  ]);
  if (scale !== 1) for (const g of [skin, legsTone, eyes]) g.scale(scale, scale, scale);
  return { skin, legs: legsTone, eyes };
}

function frog(): BuiltModel {
  const meshes: MeshDef[] = [];
  const ext = frogExterior();
  meshes.push({ id: 'sa-pele', structure: 'pele-sapo', geometry: ext.skin });
  meshes.push({ id: 'sa-patas', structure: 'patas-vertebrado', geometry: ext.legs });
  meshes.push({ id: 'sa-olhos', structure: 'olhos', geometry: ext.eyes });
  meshes.push({ id: 'sa-encefalo', structure: 'encefalo', geometry: merge([organ(0.32, 0.13, 0.15, [1.55, 0.45, 0], ac('encefalo')), organ(0.13, 0.11, 0.13, [1.92, 0.43, 0.1], ac('encefalo')), organ(0.13, 0.11, 0.13, [1.92, 0.43, -0.1], ac('encefalo'))]) });
  meshes.push({ id: 'sa-pulmoes', structure: 'pulmoes', geometry: merge([organ(0.72, 0.3, 0.3, [0.45, 0.15, 0.5], ac('pulmoes'), E(0, 0.2, -0.2)), organ(0.72, 0.3, 0.3, [0.45, 0.15, -0.5], ac('pulmoes'), E(0, -0.2, -0.2))]) });
  meshes.push({ id: 'sa-coracao', structure: 'coracao', geometry: merge([organ(0.3, 0.32, 0.3, [1.2, -0.35, 0], ac('coracao')), organ(0.16, 0.14, 0.15, [1.35, -0.06, 0.15], '#3A6EA5'), organ(0.16, 0.14, 0.15, [1.35, -0.06, -0.15], '#C1121F')]) });
  meshes.push({ id: 'sa-figado', structure: 'figado', geometry: merge([organ(0.55, 0.22, 0.45, [0.6, -0.45, 0.42], ac('figado'), E(0, 0, -0.15)), organ(0.55, 0.22, 0.45, [0.6, -0.45, -0.42], ac('figado'), E(0, 0, -0.15)), organ(0.4, 0.2, 0.25, [0.75, -0.52, 0], ac('figado'))]) });
  meshes.push({ id: 'sa-estomago', structure: 'estomago', geometry: paint(tube([V(1.1, -0.15, 0.25), V(0.5, -0.1, 0.62), V(-0.15, -0.35, 0.55), V(-0.35, -0.6, 0.25)], 0.17, false, 30, 10), ac('estomago')) });
  meshes.push({ id: 'sa-intestino', structure: 'intestino-vertebrado', geometry: merge([paint(coil(-1.0, -0.25, -0.75, -0.95, 0.05, 3, 0.08), ac('intestino-vertebrado')), paint(tube([V(-1.0, -0.82, 0), V(-1.5, -0.7, 0), V(-1.85, -0.75, 0)], 0.13, false, 12, 8), ac('intestino-vertebrado'))]) });
  meshes.push({ id: 'sa-rins', structure: 'rins', geometry: merge([organ(0.5, 0.1, 0.16, [-0.75, -0.05, 0.25], ac('rins')), organ(0.5, 0.1, 0.16, [-0.75, -0.05, -0.25], ac('rins'))]) });
  meshes.push({ id: 'sa-cloaca', structure: 'cloaca', geometry: organ(0.18, 0.18, 0.2, [-2.05, -0.78, 0], ac('cloaca')) });
  meshes.push({ id: 'sa-coluna', structure: 'coluna-vertebral', geometry: merge([vertebrae([V(1.3, 0.35, 0), V(0, 0.25, 0), V(-0.85, 0.05, 0)], 0.07, 0.24), paint(tube([V(-0.85, 0.05, 0), V(-1.9, -0.45, 0)], 0.05, false, 8, 8), ac('coluna-vertebral'))]) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(13, [-0.6, -0.3, 0], 0.35, 0.65) };
}

// ===================================================================== bird

const birdSec = (t: number) => {
  // egg-shaped trunk, deepest at the breast (front third)
  const b = Math.pow(Math.sin(Math.PI * Math.pow(Math.min(1, 0.02 + t * 0.98), 0.78)), 0.55);
  return { y: -0.05 + 0.28 * t, ry: 1.18 * b, rz: 0.92 * b };
};

/** One feather: a slim vane in the XZ plane, pointing along -x from the origin. */
function feather(len: number, width: number) {
  return plate([[0, 0], [-len * 0.3, width * 0.5], [-len * 0.85, width * 0.45], [-len, 0], [-len * 0.85, -width * 0.45], [-len * 0.3, -width * 0.5]], 0.035, 6);
}

/** Folded wing on one side: coverts as a smooth plate plus separate primary feathers. */
function foldedWing(s: number) {
  const parts: THREE.BufferGeometry[] = [];
  const coverts = plate([[1.35, 0.75], [0.4, 0.95], [-0.9, 0.7], [-1.5, 0.2], [-0.8, -0.3], [0.6, -0.35], [1.3, 0.1]], 0.07);
  parts.push(shade(coverts, '#6B4E2E', '#A27B4F', -0.3, 0.9));
  // wing bar of pale coverts
  parts.push(paint(tube([V(0.9, 0.05, 0.05), V(0.0, 0.0, 0.05), V(-0.9, 0.12, 0.05)], 0.06, false, 16, 6), '#E8D8B8'));
  for (let k = 0; k < 7; k++) {
    const f = feather(1.6 - k * 0.07, 0.34);
    f.rotateX(Math.PI / 2).rotateZ(0.18 - k * 0.05);
    f.translate(-0.7 + k * 0.12, 0.25 - k * 0.075, -0.02 * k);
    parts.push(paint(f, k % 2 ? '#3F2E1C' : '#55402A'));
  }
  const w = merge(parts);
  // follow the side of the trunk and mirror for the left wing
  w.rotateX(0.12);
  if (s < 0) w.scale(1, 1, -1);
  w.translate(0, 0.08, s * 1.0);
  return w;
}

function bird(): BuiltModel {
  const meshes: MeshDef[] = [];
  const body = loft(-1.95, 1.75, birdSec, 80, 40);
  const neck = loft(1.15, 2.3, (t) => ({ y: 0.5 + 1.25 * smooth(t), ry: 0.62 - 0.22 * t, rz: 0.46 - 0.12 * t }), 30, 24);
  const head = organ(0.58, 0.5, 0.46, [2.5, 1.92, 0], '#ffffff');
  shade(body, '#8C6A43', '#F0E4CC', -0.9, 1.0);
  shade(neck, '#8C6A43', '#F0E4CC', 0.6, 1.6);
  shade(head, '#7A5A36', '#E9DCC2', 1.6, 2.4);
  const tail: THREE.BufferGeometry[] = [];
  for (let k = -3; k <= 3; k++) {
    const f = feather(1.75 - Math.abs(k) * 0.08, 0.4);
    f.rotateX(Math.PI / 2).rotateY(k * 0.11).rotateZ(-0.18);
    f.translate(-1.65, 0.3, k * 0.045);
    tail.push(paint(f, Math.abs(k) % 2 ? '#4A3622' : '#6B4E2E'));
  }
  const feathers = merge([body, neck, head, ...tail, foldedWing(1), foldedWing(-1)]);
  meshes.push({ id: 'av-penas', structure: 'penas', geometry: feathers });
  meshes.push({ id: 'av-bico', structure: 'bico', geometry: merge([place(new THREE.ConeGeometry(0.17, 0.62, 18).scale(1, 1, 0.8).rotateZ(-Math.PI / 2 - 0.12), [3.25, 1.84, 0]), place(new THREE.ConeGeometry(0.13, 0.5, 18).scale(1, 1, 0.8).rotateZ(-Math.PI / 2 + 0.1), [3.18, 1.72, 0])]) });
  meshes.push({ id: 'av-olhos', structure: 'olhos', geometry: merge([organ(0.13, 0.13, 0.05, [2.72, 2.05, 0.4], '#F2C14E'), organ(0.08, 0.08, 0.05, [2.74, 2.05, 0.43], ac('olhos')), organ(0.13, 0.13, 0.05, [2.72, 2.05, -0.4], '#F2C14E'), organ(0.08, 0.08, 0.05, [2.74, 2.05, -0.43], ac('olhos'))]) });
  const legs: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    // thigh is hidden in the body; only the scaly tarsus and the toes show
    legs.push(limb([V(-0.05, -0.85, s * 0.42), V(0.25, -1.55, s * 0.45), V(0.0, -2.45, s * 0.45)], 0.1, 0.06, '#D98E2B'));
    for (const d of [V(0.55, 0, 0.25), V(0.62, 0, 0), V(0.55, 0, -0.25), V(-0.42, 0, 0)]) legs.push(limb([V(0.0, -2.45, s * 0.45), V(0.0, -2.52, s * 0.45).add(d.clone().setZ(d.z * s))], 0.04, 0.03, '#D98E2B'));
  }
  meshes.push({ id: 'av-patas', structure: 'patas-vertebrado', geometry: paint(merge(legs), '#E09F3E') });
  // skeleton: keel of the sternum and the vertebral column (long flexible neck)
  meshes.push({ id: 'av-quilha', structure: 'quilha', geometry: place(plate([[0.2, 0], [1.25, 0.15], [0.95, -0.55], [0.2, -0.75], [-0.6, -0.3]], 0.05), [0.05, -0.45, 0]) });
  meshes.push({ id: 'av-musculos', structure: 'musculos-peitorais', geometry: merge([organ(0.75, 0.34, 0.2, [0.45, -0.6, 0.3], ac('musculos-peitorais'), E(0.25, 0, -0.18)), organ(0.75, 0.34, 0.2, [0.45, -0.6, -0.3], ac('musculos-peitorais'), E(-0.25, 0, -0.18))]) });
  meshes.push({ id: 'av-coluna', structure: 'coluna-vertebral', geometry: vertebrae([V(2.25, 1.75, 0), V(1.95, 1.25, 0), V(1.55, 0.95, 0), V(0.8, 0.88, 0), V(-0.6, 0.78, 0), V(-1.7, 0.62, 0), V(-2.0, 0.5, 0)], 0.055, 0.16) });
  meshes.push({ id: 'av-encefalo', structure: 'encefalo', geometry: merge([organ(0.24, 0.2, 0.18, [2.45, 2.05, 0.13], ac('encefalo')), organ(0.24, 0.2, 0.18, [2.45, 2.05, -0.13], ac('encefalo')), organ(0.13, 0.11, 0.13, [2.2, 1.95, 0], ac('encefalo'))]) });
  // respiratory: small rigid lungs against the back, air sacs in front and behind
  meshes.push({ id: 'av-pulmoes', structure: 'pulmoes', geometry: merge([organ(0.55, 0.2, 0.2, [0.55, 0.55, 0.32], ac('pulmoes'), E(0, 0, 0.1)), organ(0.55, 0.2, 0.2, [0.55, 0.55, -0.32], ac('pulmoes'), E(0, 0, 0.1))]) });
  meshes.push({
    id: 'av-sacos',
    structure: 'sacos-aereos',
    geometry: merge([
      organ(0.2, 0.2, 0.16, [1.6, 0.95, 0.2], ac('sacos-aereos')),
      organ(0.2, 0.2, 0.16, [1.6, 0.95, -0.2], ac('sacos-aereos')),
      organ(0.26, 0.22, 0.3, [1.55, 0.3, 0], ac('sacos-aereos')),
      organ(0.4, 0.26, 0.22, [-0.05, 0.4, 0.5], ac('sacos-aereos')),
      organ(0.4, 0.26, 0.22, [-0.05, 0.4, -0.5], ac('sacos-aereos')),
      organ(0.6, 0.3, 0.26, [-1.0, 0.1, 0.48], ac('sacos-aereos')),
      organ(0.6, 0.3, 0.26, [-1.0, 0.1, -0.48], ac('sacos-aereos')),
    ]),
  });
  meshes.push({ id: 'av-coracao', structure: 'coracao', geometry: merge([organ(0.3, 0.4, 0.3, [1.2, -0.1, 0], ac('coracao'), E(0, 0, -0.35)), organ(0.15, 0.13, 0.14, [1.38, 0.24, 0.15], '#3A6EA5'), organ(0.15, 0.13, 0.14, [1.38, 0.24, -0.15], '#C1121F')]) });
  meshes.push({ id: 'av-papo', structure: 'papo', geometry: organ(0.3, 0.26, 0.3, [1.85, 0.95, 0.14], ac('papo')) });
  meshes.push({ id: 'av-esofago', structure: 'estomago', geometry: merge([paint(tube([V(2.95, 1.8, 0), V(2.4, 1.65, 0.05), V(2.05, 1.25, 0.1), V(1.85, 0.95, 0.14), V(1.5, 0.6, 0.12), V(1.0, 0.3, 0.1)], 0.06, false, 40, 8), ac('estomago')), organ(0.32, 0.16, 0.16, [0.75, 0.2, 0.1], ac('estomago'), E(0, 0, 0.35))]) });
  meshes.push({ id: 'av-moela', structure: 'moela-ave', geometry: organ(0.38, 0.34, 0.3, [0.2, -0.15, 0.08], ac('moela-ave')) });
  meshes.push({ id: 'av-figado', structure: 'figado', geometry: merge([organ(0.5, 0.22, 0.3, [0.85, -0.25, 0.34], ac('figado'), E(0, 0, -0.25)), organ(0.5, 0.22, 0.3, [0.85, -0.25, -0.34], ac('figado'), E(0, 0, -0.25))]) });
  meshes.push({ id: 'av-intestino', structure: 'intestino-vertebrado', geometry: merge([paint(coil(-1.2, -0.35, -0.15, -0.5, 0.0, 3, 0.065), ac('intestino-vertebrado')), paint(tube([V(-1.2, -0.45, 0), V(-1.6, -0.35, 0), V(-1.85, -0.25, 0)], 0.075, false, 10, 8), ac('intestino-vertebrado'))]) });
  meshes.push({ id: 'av-rins', structure: 'rins', geometry: merge([organ(0.55, 0.1, 0.14, [-0.85, 0.52, 0.18], ac('rins'), E(0, 0, 0.08)), organ(0.55, 0.1, 0.14, [-0.85, 0.52, -0.18], ac('rins'), E(0, 0, 0.08))]) });
  meshes.push({ id: 'av-cloaca', structure: 'cloaca', geometry: organ(0.15, 0.15, 0.16, [-1.92, -0.22, 0], ac('cloaca')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(13.5, [-0.4, 0.05, 0], 0.15, 0.3) };
}

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

function chamber(a: number, b: number, c: number, at: THREE.Vector3, color: string) {
  return paint(place(wall(ellipsoid(a, b, c), 0.78, HCUT, [36, 24]), at), color);
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
  meshes.push({ id: 'h2-septo', structure: 'septo-incompleto', geometry: place(new THREE.BoxGeometry(0.1, 0.9, 1.0), [HEART_X[2], -1.0, -0.05]) });
  // bird / mammal: four chambers, complete septum
  const m = HEART_X[3];
  meshes.push({ id: 'h3-ad', structure: 'atrio-direito', geometry: chamber(0.7, 0.6, 0.6, V(m - 0.65, 0.6, 0), blue) });
  meshes.push({ id: 'h3-ae', structure: 'atrio-esquerdo', geometry: chamber(0.7, 0.6, 0.6, V(m + 0.65, 0.6, 0), red) });
  meshes.push({ id: 'h3-vd', structure: 'ventriculo-direito', geometry: chamber(0.7, 0.95, 0.75, V(m - 0.58, -0.75, 0), blue) });
  meshes.push({ id: 'h3-ve', structure: 'ventriculo-esquerdo', geometry: chamber(0.75, 1.0, 0.8, V(m + 0.6, -0.78, 0), red) });
  meshes.push({ id: 'h3-septo', structure: 'septo-interventricular', geometry: place(new THREE.BoxGeometry(0.12, 1.9, 1.1), [m, -0.75, -0.05]) });
  // vessels: in (top, sides) and out (top, middle)
  for (const mesh of meshes) {
    const k = Number(mesh.id[1]);
    place(mesh.geometry, [HEART_GRID[k][0], HEART_GRID[k][1], 0]);
  }
  const ves: THREE.BufferGeometry[] = [];
  const vesR: THREE.BufferGeometry[] = [];
  const paths = heartPaths();
  for (let k = 0; k < 4; k++) {
    const v = paths.venous[k].points;
    ves.push(tube([v[0], v[1]], 0.16, false, 8, 10), tube([v[v.length - 2].clone().setY(1.0), v[v.length - 1]], 0.16, false, 8, 10));
    const a = paths.arterial[k];
    if (a) vesR.push(tube([a.points[0], a.points[1]], 0.16, false, 8, 10), tube([a.points[a.points.length - 2].clone().setY(1.0), a.points[a.points.length - 1]], 0.16, false, 8, 10));
  }
  meshes.push({ id: 'h-vasos-venosos', structure: 'sangue-venoso', geometry: paint(merge(ves), '#4A78B5') });
  meshes.push({ id: 'h-vasos-arteriais', structure: 'sangue-arterial', geometry: paint(merge(vesR), '#D64545') });
  // blood cells for the animation
  for (let i = 0; i < BLOOD_N; i++) {
    meshes.push({ id: `sv-${i}`, structure: 'sangue-venoso', geometry: paint(new THREE.SphereGeometry(0.11, 10, 8), '#2B59C3') });
    meshes.push({ id: `sa-${i}`, structure: 'sangue-arterial', geometry: paint(new THREE.SphereGeometry(0.11, 10, 8), '#D62828') });
  }
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(17, [0.6, -0.1, 0], 0.1, 0) };
}

const HEART_PARTS = [
  ['h0-seio', 'h0-atrio', 'h0-ventriculo', 'h0-bulbo'],
  ['h1-ad', 'h1-ae', 'h1-v'],
  ['h2-ad', 'h2-ae', 'h2-v', 'h2-septo'],
  ['h3-ad', 'h3-ae', 'h3-vd', 'h3-ve', 'h3-septo'],
];

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

