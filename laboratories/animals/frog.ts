/**
 * Toad (Anura) sculpted in code, sitting: warty brown skin with dark
 * blotches and a pale belly, parotoid glands, golden eyes with horizontal
 * pupils and eyelid ridges, eardrum (tympanum), wide mouth, folded hind legs
 * with long webbed feet and front legs with four fingers. A dissection window
 * on the near flank shows lungs, heart, liver, stomach, intestine, kidneys and
 * the short vertebral column. Geometry by BioLab 3D.
 */
import * as THREE from 'three';
import { merge, paint, tube } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { ac, organ } from './kit';
import { colorize } from './materials';
import { cutWindow, displace, fbm, mix, pw, surface, sweep, vcolor } from './sculpt';
import { coil, vertebrae } from './vertebrates';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const E = (x: number, y: number, z: number) => new THREE.Euler(x, y, z);

const SPINE = [V(-2.25, -0.72, 0), V(-1.4, -0.32, 0), V(-0.2, 0.02, 0), V(1.0, 0.18, 0), V(2.0, 0.2, 0), V(2.68, 0.0, 0)];
const curve = new THREE.CatmullRomCurve3(SPINE, false, 'centripetal');
const secA = (t: number) => pw(t, [[0, 0.25], [0.15, 0.62], [0.4, 0.86], [0.65, 0.76], [0.82, 0.6], [0.95, 0.36], [1, 0.12]]);
const secB = (t: number) => pw(t, [[0, 0.3], [0.15, 0.95], [0.4, 1.28], [0.65, 1.2], [0.82, 1.04], [0.95, 0.58], [1, 0.15]]);

/** Point on the skin at curve parameter t and angle th (0 = top, π/2 = +z side, π = belly). */
function onSkin(t: number, th: number, lift = 0) {
  const p = curve.getPointAt(t);
  const T = curve.getTangentAt(t);
  const side = new THREE.Vector3().crossVectors(T, V(0, 1, 0)).normalize();
  const n = new THREE.Vector3().crossVectors(side, T).normalize();
  return p.addScaledVector(n, Math.cos(th) * (secA(t) + lift)).addScaledVector(side, Math.sin(th) * (secB(t) + lift));
}

const inWindow = (c: THREE.Vector3) => c.z > 0.2 && ((c.x - 0.15) / 1.45) ** 2 + ((c.y + 0.3) / 0.72) ** 2 < 1;

const SKIN = '#8A6E42';
const BLOTCH = '#4C3A22';
const BELLY = '#EDE3C6';

function warts(p: THREE.Vector3) {
  const w = fbm(p, 4.2, 2);
  return Math.max(0, w - 0.56) * 0.35;
}

function skinColour(p: THREE.Vector3, n: THREE.Vector3) {
  const down = Math.max(0, -n.y);
  let c = mix(SKIN, '#9C8150', fbm(p, 1.3, 2));
  const b = fbm(p.clone().add(V(7, 3, 1)), 1.6, 3);
  if (b > 0.58) c.lerp(new THREE.Color(BLOTCH), Math.min(1, (b - 0.58) * 5));
  // wart tips darker and reddish
  const w = warts(p);
  if (w > 0) c.lerp(new THREE.Color('#5A2E1A'), Math.min(1, w * 9));
  // pale belly with grey speckles
  c.lerp(new THREE.Color(BELLY), Math.min(1, down * 1.5));
  if (down > 0.5 && fbm(p, 6, 1) > 0.72) c.lerp(new THREE.Color('#8C8676'), 0.5);
  return c;
}

/** Long tube through joints, used for limbs and digits. */
function limbSweep(pts: THREE.Vector3[], r0: number, r1: number) {
  return sweep(pts, (t) => ({ a: r0 + (r1 - r0) * t, b: (r0 + (r1 - r0) * t) * 1.05 }), { up: V(0, 0, 1), rings: Math.max(16, pts.length * 14), radial: 18 });
}

function hindLeg(s: number) {
  const m = (p: THREE.Vector3) => V(p.x, p.y, p.z * s);
  const hip = m(V(-1.65, -0.45, 0.62));
  const knee = m(V(-0.45, -0.72, 1.62));
  const ankle = m(V(-1.55, -1.12, 1.78));
  const sole = m(V(-0.4, -1.42, 2.02));
  const parts: THREE.BufferGeometry[] = [];
  parts.push(sweep([hip, hip.clone().lerp(knee, 0.5).add(V(0, 0.12, 0)), knee], (t) => ({ a: pw(t, [[0, 0.4], [0.45, 0.42], [1, 0.22]]), b: pw(t, [[0, 0.44], [0.45, 0.46], [1, 0.24]]) }), { up: V(0, 0, 1), rings: 40, radial: 24 }));
  parts.push(sweep([knee, knee.clone().lerp(ankle, 0.5).add(V(0, 0.08, 0)), ankle], (t) => ({ a: pw(t, [[0, 0.22], [0.4, 0.26], [1, 0.14]]), b: pw(t, [[0, 0.22], [0.4, 0.27], [1, 0.14]]) }), { up: V(0, 0, 1), rings: 40, radial: 22 }));
  parts.push(limbSweep([ankle, ankle.clone().lerp(sole, 0.5).add(V(0, -0.05, 0)), sole], 0.14, 0.1));
  // five long toes and the webbing between them
  const lens = [0.55, 0.78, 1.02, 1.28, 0.88];
  const tips: THREE.Vector3[] = [];
  const mids: THREE.Vector3[] = [];
  lens.forEach((L, k) => {
    const a = -0.55 + k * 0.28;
    const dir = V(Math.cos(a), 0, s * Math.sin(a));
    const mid = sole.clone().addScaledVector(dir, L * 0.55).add(V(0, -0.02, 0));
    const tip = sole.clone().addScaledVector(dir, L).add(V(0, -0.04, 0));
    parts.push(limbSweep([sole, mid, tip], 0.075, 0.045));
    parts.push(new THREE.SphereGeometry(0.06, 10, 8).translate(tip.x, tip.y, tip.z));
    tips.push(tip);
    mids.push(mid);
  });
  for (let k = 0; k < 4; k++) {
    const web = surface((u, v) => {
      const a = sole.clone().lerp(tips[k], u * 0.78);
      const b = sole.clone().lerp(tips[k + 1], u * 0.78);
      return a.lerp(b, v).add(V(0, -0.03 - 0.03 * Math.sin(Math.PI * v) * u, 0));
    }, 10, 8);
    parts.push(paint(web, '#B09063'));
  }
  return parts;
}

function frontLeg(s: number) {
  const m = (p: THREE.Vector3) => V(p.x, p.y, p.z * s);
  const shoulder = m(V(1.0, -0.35, 0.8));
  const elbow = m(V(1.12, -0.95, 1.18));
  const wrist = m(V(1.58, -1.4, 1.08));
  const parts: THREE.BufferGeometry[] = [];
  parts.push(sweep([shoulder, shoulder.clone().lerp(elbow, 0.5), elbow], (t) => ({ a: 0.2 - 0.05 * t, b: 0.21 - 0.05 * t }), { up: V(0, 0, 1), rings: 24, radial: 18 }));
  parts.push(sweep([elbow, elbow.clone().lerp(wrist, 0.5), wrist], (t) => ({ a: 0.15 - 0.04 * t, b: 0.16 - 0.04 * t }), { up: V(0, 0, 1), rings: 24, radial: 18 }));
  [0.42, 0.55, 0.62, 0.45].forEach((L, k) => {
    const a = -0.75 + k * 0.42;
    const dir = V(Math.cos(a), 0, s * Math.sin(a));
    const tip = wrist.clone().addScaledVector(dir, L).add(V(0, -0.06, 0));
    parts.push(limbSweep([wrist, wrist.clone().lerp(tip, 0.5).add(V(0, 0.02, 0)), tip], 0.06, 0.04));
    parts.push(new THREE.SphereGeometry(0.05, 10, 8).translate(tip.x, tip.y, tip.z));
  });
  return parts;
}

/** Exterior of a sitting toad (skin, legs, eyes). `window` opens the near flank. */
export function frogExterior(scale = 1, opts: { window?: boolean } = {}) {
  const body = sweep(SPINE, (t) => ({ a: secA(t), b: secB(t), sq: 2.3 }), { rings: 200, radial: 120 });
  // parotoid glands behind the eyes, eyelid bulges and warts
  const glands = [1, -1].map((s) => onSkin(0.62, s * 0.72));
  const eyeAt = [1, -1].map((s) => onSkin(0.83, s * 0.62, -0.05));
  displace(body, (p) => {
    let d = warts(p);
    for (const g of glands) d += 0.16 * Math.exp(-((p.x - g.x) ** 2 / 0.12 + (p.y - g.y) ** 2 / 0.03 + (p.z - g.z) ** 2 / 0.03));
    for (const e of eyeAt) d += 0.22 * Math.exp(-p.distanceToSquared(e) / 0.05);
    return d;
  });
  vcolor(body, (p, n) => {
    let c = skinColour(p, n);
    // mouth line along the jaw
    const t = Math.min(1, Math.max(0, (p.x - 1.2) / 1.5));
    const jaw = -0.12 + 0.12 * t;
    if (p.x > 1.25) c.lerp(new THREE.Color('#2B1E12'), Math.exp(-((p.y - jaw) ** 2) / 0.0012) * 0.85);
    // dark stripe from the eye down to the arm
    return c;
  });
  const parts: THREE.BufferGeometry[] = [body];
  if (opts.window) parts.push(cutWindow(body, inWindow, 0.14, '#D98F7E'));
  // eardrums
  for (const s of [1, -1]) {
    const ty = onSkin(0.74, s * 1.05, 0.02);
    const disc = new THREE.SphereGeometry(1, 24, 12);
    disc.scale(0.2, 0.2, 0.04).rotateY(s * 0.25).translate(ty.x, ty.y, ty.z);
    parts.push(vcolor(disc, (p) => mix('#A08458', '#5A4226', Math.min(1, p.distanceTo(ty) / 0.2))));
    // nostrils
    const no = onSkin(0.975, s * 0.35, 0.01);
    parts.push(paint(new THREE.SphereGeometry(0.035, 8, 6).translate(no.x, no.y, no.z), '#1C140C'));
  }
  const legs: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) legs.push(...hindLeg(s), ...frontLeg(s));
  const legsG = merge(legs.map((g) => (g.getAttribute('color') ? g : vcolor(g, (p, n) => skinColour(p, n)))));
  const eyes: THREE.BufferGeometry[] = [];
  for (const [i, s] of [1, -1].entries()) {
    const at = eyeAt[i].clone().add(V(0.02, 0.06, s * 0.04));
    const ball = new THREE.SphereGeometry(0.27, 32, 22);
    ball.translate(at.x, at.y, at.z);
    // golden iris with dark veins and a horizontal pupil facing outwards
    vcolor(ball, (p) => {
      const d = p.clone().sub(at).normalize();
      const out = V(0.25, 0.35, s * 0.9).normalize();
      const k = d.dot(out);
      const right = new THREE.Vector3().crossVectors(out, V(0, 1, 0)).normalize();
      const up = new THREE.Vector3().crossVectors(right, out).normalize();
      const px = d.dot(right);
      const py = d.dot(up);
      let c = mix('#D8A93A', '#8A5A1A', fbm(p, 30, 1));
      if (k > 0.6 && (px / 0.32) ** 2 + (py / 0.13) ** 2 < 1) c = new THREE.Color('#0A0A0A');
      if (k < 0.2) c = new THREE.Color('#5A4A2A');
      return c;
    });
    eyes.push(ball);
  }
  const eyesG = merge(eyes);
  const skin = merge(parts);
  if (scale !== 1) for (const g of [skin, legsG, eyesG]) g.scale(scale, scale, scale);
  return { skin, legs: legsG, eyes: eyesG };
}

export function frog(): BuiltModel {
  const meshes: MeshDef[] = [];
  const ext = frogExterior(1, { window: true });
  meshes.push({ id: 'sa-pele', structure: 'pele-sapo', geometry: ext.skin });
  meshes.push({ id: 'sa-patas', structure: 'patas-vertebrado', geometry: ext.legs });
  meshes.push({ id: 'sa-olhos', structure: 'olhos', geometry: ext.eyes });
  meshes.push({ id: 'sa-encefalo', structure: 'encefalo', geometry: merge([organ(0.32, 0.13, 0.15, [1.55, 0.42, 0], ac('encefalo')), organ(0.13, 0.11, 0.13, [1.92, 0.4, 0.1], ac('encefalo')), organ(0.13, 0.11, 0.13, [1.92, 0.4, -0.1], ac('encefalo'))]) });
  meshes.push({ id: 'sa-pulmoes', structure: 'pulmoes', geometry: merge([organ(0.72, 0.3, 0.32, [0.4, 0.05, 0.55], ac('pulmoes'), E(0, 0.2, -0.2)), organ(0.72, 0.3, 0.32, [0.4, 0.05, -0.55], ac('pulmoes'), E(0, -0.2, -0.2))]) });
  meshes.push({ id: 'sa-coracao', structure: 'coracao', geometry: merge([organ(0.3, 0.32, 0.3, [1.2, -0.45, 0.1], ac('coracao')), organ(0.16, 0.14, 0.15, [1.35, -0.16, 0.25], '#3A6EA5'), organ(0.16, 0.14, 0.15, [1.35, -0.16, -0.05], '#C1121F')]) });
  meshes.push({ id: 'sa-figado', structure: 'figado', geometry: merge([organ(0.55, 0.22, 0.45, [0.6, -0.55, 0.45], ac('figado'), E(0, 0, -0.15)), organ(0.55, 0.22, 0.45, [0.6, -0.55, -0.42], ac('figado'), E(0, 0, -0.15)), organ(0.4, 0.2, 0.25, [0.75, -0.62, 0], ac('figado'))]) });
  meshes.push({ id: 'sa-estomago', structure: 'estomago', geometry: paint(tube([V(1.1, -0.22, 0.25), V(0.5, -0.2, 0.7), V(-0.15, -0.42, 0.62), V(-0.35, -0.65, 0.3)], 0.17, false, 30, 10), ac('estomago')) });
  meshes.push({ id: 'sa-intestino', structure: 'intestino-vertebrado', geometry: merge([paint(coil(-1.0, -0.25, -0.8, -1.0, 0.25, 3, 0.08), ac('intestino-vertebrado')), paint(tube([V(-1.0, -0.86, 0), V(-1.5, -0.74, 0), V(-1.95, -0.78, 0)], 0.13, false, 12, 8), ac('intestino-vertebrado'))]) });
  meshes.push({ id: 'sa-rins', structure: 'rins', geometry: merge([organ(0.5, 0.1, 0.16, [-0.75, -0.12, 0.25], ac('rins')), organ(0.5, 0.1, 0.16, [-0.75, -0.12, -0.25], ac('rins'))]) });
  meshes.push({ id: 'sa-cloaca', structure: 'cloaca', geometry: organ(0.18, 0.18, 0.2, [-2.12, -0.78, 0], ac('cloaca')) });
  meshes.push({ id: 'sa-coluna', structure: 'coluna-vertebral', geometry: merge([vertebrae([V(1.3, 0.38, 0), V(0, 0.32, 0), V(-0.85, 0.1, 0)], 0.07, 0.24), paint(tube([V(-0.85, 0.1, 0), V(-1.9, -0.42, 0)], 0.05, false, 8, 8), ac('coluna-vertebral'))]) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(13.5, [-0.4, -0.35, 0], 0.3, 0.55) };
}
