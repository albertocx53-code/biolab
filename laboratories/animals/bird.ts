/**
 * Bird (a rock pigeon) sculpted in code: plump grey body with an iridescent
 * green-and-purple neck, small round head with orange eye and white cere,
 * the near wing spread showing coverts with two dark wing bars, secondaries
 * and primaries, the far wing folded, a fanned tail with a dark terminal band
 * and scaly pink feet. A dissection window on the flank shows lungs and air
 * sacs, heart, crop, stomach, gizzard, liver, intestine, kidneys, the keel
 * with flight muscles and the vertebral column. Geometry by BioLab 3D.
 */
import * as THREE from 'three';
import { merge, paint, place, tube } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ac, limb, organ, plate } from './kit';
import { colorize } from './materials';
import { cutWindow, fbm, mix, pw, scaleEdge, surface, sweep, vcolor } from './sculpt';
import { coil, vertebrae } from './vertebrates';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const E = (x: number, y: number, z: number) => new THREE.Euler(x, y, z);

const GREY = '#8E98A8';
const LIGHT = '#B4BCC8';
const DARK = '#2E3038';

const bodyK = (t: number) => Math.pow(Math.sin(Math.PI * Math.pow(Math.min(1, 0.02 + t * 0.98), 0.78)), 0.55);
const inWindow = (c: THREE.Vector3) => c.z > 0.15 && ((c.x - 0.15) / 1.5) ** 2 + ((c.y - 0.1) / 0.72) ** 2 < 1;

/** Soft plumage: overlapping feather tips as faint scallops. */
function plumage(p: THREE.Vector3, base: THREE.Color, size = 0.2) {
  const e = scaleEdge(p.x, p.y + p.z * 0.3, size);
  return base.clone().lerp(new THREE.Color('#5E6676'), e * 0.22).lerp(new THREE.Color('#FFFFFF'), fbm(p, 5, 2) * 0.08);
}

function trunk() {
  const g = sweep([V(-1.95, -0.05, 0), V(1.75, 0.23, 0)], (t) => ({ a: 1.18 * bodyK(t), b: 0.92 * bodyK(t), sq: 2.05 }), { rings: 220, radial: 140 });
  vcolor(g, (p, n) => {
    let c = mix(GREY, LIGHT, Math.max(0, n.y) * 0.6);
    // pale rump above the tail, darker belly
    if (p.x < -1.2 && n.y > 0.3) c = mix(c, '#D9DDE4', 0.6);
    if (n.y < -0.4) c = mix(c, '#7C8594', 0.5);
    // iridescent neck band reaching onto the breast
    const neck = Math.min(1, Math.max(0, (p.x - 0.95) / 0.5)) * Math.min(1, Math.max(0, (p.y + 0.2) / 0.6));
    c.lerp(mix('#3F8F6B', '#7B4A8C', 0.5 + 0.5 * n.z), neck * 0.75);
    return plumage(p, c);
  });
  const rim = cutWindow(g, inWindow, 0.16, '#C98B7E');
  return [g, rim];
}

function neckAndHead() {
  const neck = sweep([V(1.15, 0.45, 0), V(1.7, 0.95, 0), V(2.15, 1.5, 0), V(2.35, 1.8, 0)], (t) => ({ a: pw(t, [[0, 0.6], [0.5, 0.45], [1, 0.36]]), b: pw(t, [[0, 0.52], [0.5, 0.4], [1, 0.33]]) }), { rings: 60, radial: 60 });
  vcolor(neck, (p, n) => {
    // iridescence: green or purple depending on which way the feathers face
    const k = 0.5 + 0.5 * Math.sin(n.z * 2.2 + n.x * 1.5 + p.y * 2);
    return plumage(p, mix('#3E9070', '#8A4E9C', k).lerp(new THREE.Color(GREY), p.y > 1.6 ? (p.y - 1.6) * 3 : 0), 0.12);
  });
  const head = new THREE.SphereGeometry(1, 48, 36);
  head.scale(0.55, 0.47, 0.42).translate(2.52, 1.9, 0);
  vcolor(head, (p, n) => plumage(p, mix('#7E8899', '#98A2B2', Math.max(0, n.y)), 0.1));
  return [neck, head];
}

/** One flight feather: vane on both sides of a shaft, outer vane narrower, rounded tip. */
function feather(base: THREE.Vector3, dir: THREE.Vector3, across: THREE.Vector3, len: number, width: number, col: (u: number, v: number) => THREE.Color, curl = 0.06) {
  const normal = new THREE.Vector3().crossVectors(dir, across).normalize();
  const g = surface((u, v) => {
    const w = width * pw(u, [[0, 0.25], [0.15, 0.85], [0.7, 1], [0.92, 0.7], [1, 0.05]]);
    const side = v < 0.5 ? (v - 0.5) * 2 * 0.62 : (v - 0.5) * 2;
    return base
      .clone()
      .addScaledVector(dir, u * len)
      .addScaledVector(across, side * w)
      .addScaledVector(normal, curl * Math.sin(Math.PI * u) + 0.02 * Math.abs(side));
  }, 90, 14);
  return vcolor(g, (_p, _n, u, v) => {
    const c = col(u, v);
    // pale shaft (rachis) and fine barb lines
    if (Math.abs(v - 0.5) < 0.04) c.lerp(new THREE.Color('#E8EAEE'), 0.5);
    c.lerp(new THREE.Color('#4A505C'), Math.pow(Math.abs(Math.sin((u * 34 + Math.abs(v - 0.5) * 7) * Math.PI)), 10) * 0.28);
    // the vane thins and frays towards its edge
    c.lerp(new THREE.Color('#F2F3F5'), Math.pow(Math.abs(v - 0.5) * 2, 6) * 0.18);
    return c;
  });
}

/** Near wing raised and spread, seen from the side. */
function spreadWing(s: number) {
  const parts: THREE.BufferGeometry[] = [];
  const shoulder = V(0.95, 0.82, s * 0.85);
  const elbow = V(0.05, 1.75, s * 1.12);
  const wrist = V(-0.55, 2.55, s * 1.2);
  const tip = V(-1.0, 3.25, s * 1.25);
  // primaries: from the hand, fanning from up-back to back
  for (let k = 0; k < 10; k++) {
    const f = k / 9;
    const base = tip.clone().lerp(wrist, f);
    const a = 1.15 - f * 0.75;
    const dir = V(-Math.cos(a) * 0.85 - 0.15, Math.sin(a), 0).normalize();
    const len = 2.15 - f * 0.55;
    parts.push(feather(base.clone().add(V(0, 0, s * 0.012 * k)), dir, V(dir.y, -dir.x, 0), len, 0.3, (u) => mix('#7F8796', '#26282E', Math.max(0, u - 0.45) * 1.8), 0.04));
  }
  // secondaries along the forearm, with the dark trailing band
  for (let k = 0; k < 11; k++) {
    const f = k / 10;
    const base = wrist.clone().lerp(elbow, f).lerp(shoulder, f * f * 0.3);
    const dir = V(-0.95, -0.35 - f * 0.25, 0).normalize();
    parts.push(feather(base.clone().add(V(0, 0, s * (0.15 + 0.01 * k))), dir, V(dir.y, -dir.x, 0), 1.35 - f * 0.25, 0.32, (u) => mix('#9AA2B0', '#3A3D46', Math.max(0, u - 0.72) * 3.2), 0.03));
  }
  // coverts: a smooth sheet over the arm with the two black wing bars
  const cov = surface((u, v) => {
    const along = shoulder.clone().lerp(elbow, Math.min(1, u * 2)).lerp(wrist, Math.max(0, u * 2 - 1));
    const width = pw(u, [[0, 0.65], [0.5, 0.85], [1, 0.45]]);
    return along.addScaledVector(V(-0.95, -0.3, 0).normalize(), v * width).add(V(0, 0, s * (0.24 + 0.05 * Math.sin(Math.PI * v))));
  }, 40, 16);
  vcolor(cov, (p, _n, u, v) => {
    let c = mix(LIGHT, GREY, v);
    for (const bar of [0.55, 0.85]) c.lerp(new THREE.Color(DARK), Math.exp(-((v - bar) ** 2) / 0.003) * (u < 0.85 ? 0.9 : 0.2));
    return plumage(p, c, 0.13);
  });
  parts.push(cov);
  // leading edge of the wing (patagium over the bones)
  parts.push(vcolor(tube([shoulder, elbow.clone().add(V(0.1, 0.05, s * 0.2)), wrist.clone().add(V(0.05, 0.05, s * 0.2)), tip.clone().add(V(0, 0, s * 0.1))], 0.055, false, 60, 10), (p) => plumage(p, new THREE.Color(LIGHT), 0.1)));
  return parts;
}

/** Far wing folded against the body. */
function foldedWing(s: number) {
  const parts: THREE.BufferGeometry[] = [];
  const coverts = plate([[1.35, 0.75], [0.4, 0.95], [-0.9, 0.7], [-1.5, 0.2], [-0.8, -0.3], [0.6, -0.35], [1.3, 0.1]], 0.07);
  parts.push(vcolor(coverts, (p) => {
    let c = new THREE.Color(GREY);
    for (const bx of [-0.2, -0.75]) c.lerp(new THREE.Color(DARK), Math.exp(-((p.x - bx - 0.25 * p.y) ** 2) / 0.006) * 0.9);
    return c;
  }));
  for (let k = 0; k < 7; k++) {
    const base = V(-0.6 + k * 0.12, 0.25 - k * 0.075, 0);
    parts.push(feather(base, V(-1, -0.15 + k * 0.03, 0).normalize(), V(0, 0, 1).cross(V(-1, 0, 0)).normalize(), 1.6 - k * 0.07, 0.3, (u) => mix('#7F8796', '#26282E', Math.max(0, u - 0.45) * 1.8), 0.0));
  }
  const w = merge(parts);
  w.rotateX(0.12);
  if (s < 0) w.scale(1, 1, -1);
  w.translate(0, 0.08, s * 1.0);
  return w;
}

function tail() {
  const parts: THREE.BufferGeometry[] = [];
  for (let k = -5; k <= 5; k++) {
    const a = k * 0.06;
    const dir = V(-Math.cos(a) * 0.98, -0.18, Math.sin(a)).normalize();
    parts.push(feather(V(-1.75, 0.18 + Math.abs(k) * 0.004, k * 0.05), dir, V(0, 0, 1).applyAxisAngle(V(0, 1, 0), a), 1.75 - Math.abs(k) * 0.03, 0.36, (u) => mix('#8E98A8', '#7A8394', u).lerp(new THREE.Color('#1E2026'), u > 0.8 ? 0.9 : 0), 0.0));
  }
  return parts;
}

export function bird(): BuiltModel {
  const meshes: MeshDef[] = [];
  const feathers = merge([...trunk(), ...neckAndHead(), ...spreadWing(1), foldedWing(-1), ...tail()]);
  meshes.push({ id: 'av-penas', structure: 'penas', geometry: feathers });
  // beak: dark, with the white fleshy cere at its base
  meshes.push({
    id: 'av-bico',
    structure: 'bico',
    geometry: merge([
      paint(place(new THREE.ConeGeometry(0.11, 0.5, 18).scale(1, 1, 0.8).rotateZ(-Math.PI / 2 - 0.15), [3.18, 1.8, 0]), '#3A3436'),
      paint(place(new THREE.ConeGeometry(0.09, 0.42, 18).scale(1, 1, 0.8).rotateZ(-Math.PI / 2 + 0.05), [3.13, 1.71, 0]), '#4A4446'),
      paint(new THREE.SphereGeometry(1, 20, 14).scale(0.16, 0.1, 0.13).translate(2.98, 1.86, 0), '#EDEAE4'),
    ]),
  });
  const eyes: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    const at = V(2.68, 1.98, s * 0.36);
    const ball = new THREE.SphereGeometry(1, 24, 16).scale(0.12, 0.12, 0.07).translate(at.x, at.y, at.z);
    eyes.push(vcolor(ball, (p) => (Math.hypot(p.x - at.x, p.y - at.y) < 0.055 ? new THREE.Color('#0A0A0A') : mix('#F08A24', '#C0501A', Math.hypot(p.x - at.x, p.y - at.y) / 0.12))));
    eyes.push(paint(new THREE.TorusGeometry(0.125, 0.025, 8, 24).translate(at.x, at.y, at.z + s * 0.01), '#9AA0A8'));
  }
  meshes.push({ id: 'av-olhos', structure: 'olhos', geometry: merge(eyes) });
  const legs: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    legs.push(limb([V(-0.05, -0.85, s * 0.42), V(0.2, -1.5, s * 0.45), V(0.0, -2.35, s * 0.45)], 0.09, 0.06, '#C9707A'));
    for (const d of [V(0.55, 0, 0.25), V(0.62, 0, 0), V(0.55, 0, -0.25), V(-0.42, 0, 0)]) {
      const end = V(0.0, -2.42, s * 0.45).add(d.clone().setZ(d.z * s));
      legs.push(limb([V(0.0, -2.35, s * 0.45), end], 0.04, 0.03, '#C9707A'));
      legs.push(paint(place(new THREE.ConeGeometry(0.03, 0.12, 8).rotateZ(-Math.PI / 2), end.clone().add(d.clone().setZ(d.z * s).normalize().multiplyScalar(0.05))), '#2A2226'));
    }
  }
  meshes.push({ id: 'av-patas', structure: 'patas-vertebrado', geometry: merge(legs) });
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
  meshes.push({ id: 'av-papo', structure: 'papo', geometry: organ(0.26, 0.24, 0.26, [1.85, 0.92, 0.05], ac('papo')) });
  meshes.push({ id: 'av-esofago', structure: 'estomago', geometry: merge([paint(tube([V(2.95, 1.8, 0), V(2.4, 1.65, 0.05), V(2.05, 1.25, 0.1), V(1.85, 0.95, 0.14), V(1.5, 0.6, 0.12), V(1.0, 0.3, 0.1)], 0.06, false, 40, 8), ac('estomago')), organ(0.32, 0.16, 0.16, [0.75, 0.2, 0.1], ac('estomago'), E(0, 0, 0.35))]) });
  meshes.push({ id: 'av-moela', structure: 'moela-ave', geometry: organ(0.38, 0.34, 0.3, [0.2, -0.15, 0.08], ac('moela-ave')) });
  meshes.push({ id: 'av-figado', structure: 'figado', geometry: merge([organ(0.5, 0.22, 0.3, [0.85, -0.25, 0.34], ac('figado'), E(0, 0, -0.25)), organ(0.5, 0.22, 0.3, [0.85, -0.25, -0.34], ac('figado'), E(0, 0, -0.25))]) });
  meshes.push({ id: 'av-intestino', structure: 'intestino-vertebrado', geometry: merge([paint(coil(-1.2, -0.35, -0.15, -0.5, 0.0, 3, 0.065), ac('intestino-vertebrado')), paint(tube([V(-1.2, -0.45, 0), V(-1.6, -0.35, 0), V(-1.85, -0.25, 0)], 0.075, false, 10, 8), ac('intestino-vertebrado'))]) });
  meshes.push({ id: 'av-rins', structure: 'rins', geometry: merge([organ(0.55, 0.1, 0.14, [-0.85, 0.52, 0.18], ac('rins'), E(0, 0, 0.08)), organ(0.55, 0.1, 0.14, [-0.85, 0.52, -0.18], ac('rins'), E(0, 0, 0.08))]) });
  meshes.push({ id: 'av-cloaca', structure: 'cloaca', geometry: organ(0.15, 0.15, 0.16, [-1.92, -0.22, 0], ac('cloaca')) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(19, [-0.3, 1.25, 0], 0.15, 0.12) };
}
