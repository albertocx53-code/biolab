/**
 * Grasshopper (Orthoptera, Caelifera) sculpted in code: hypognathous head with
 * compound eyes and segmented antennae, saddle-shaped pronotum, ten-segment
 * abdomen with tympanum and ovipositor, jumping hind legs with the
 * herringbone femur and spined tibia, leathery forewings (tegmina) folded on
 * the near side and both wings spread on the far side.
 * Geometry by BioLab 3D.
 */
import * as THREE from 'three';
import { merge, paint, tube } from '@/laboratories/shared/geometry';
import { presetFor, type BuiltModel, type MeshDef } from '@/laboratories/shared/types';
import { colorize } from './materials';
import { displace, fbm, mix, pw, surface, sweep, vcolor } from './sculpt';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const GREEN = '#6F9A3B';
const DARK = '#3D5A20';
const BELLY = '#CFCB82';
const BROWN = '#6E5130';
const PALE = '#B9C97A';

/** Mottled chitin colour: base green, darker on the back, pale belly, brown flecks. */
function chitin(p: THREE.Vector3, n: THREE.Vector3, extraDark = 0) {
  const belly = Math.max(0, -n.y);
  const back = Math.max(0, n.y);
  const m = fbm(p, 2.2, 3);
  let c = mix(GREEN, BELLY, belly * 0.9);
  c = c.lerp(new THREE.Color(DARK), back * 0.35 + extraDark);
  if (m > 0.62) c.lerp(new THREE.Color(BROWN), (m - 0.62) * 1.8);
  return c;
}

const mirrorZ = (pts: THREE.Vector3[], s: number) => pts.map((p) => V(p.x, p.y, p.z * s));

// ------------------------------------------------------------------ head

function head() {
  const g = sweep(
    [V(3.02, 1.2, 0), V(3.4, 0.7, 0), V(3.7, 0.05, 0), V(3.84, -0.42, 0)],
    (t) => ({ a: pw(t, [[0, 0.5], [0.35, 0.7], [0.75, 0.58], [1, 0.34]]), b: pw(t, [[0, 0.46], [0.35, 0.66], [0.75, 0.52], [1, 0.32]]), sq: 2.2 }),
    { up: V(1, 0, 0), rings: 48, radial: 40 },
  );
  // fastigium ridge and frontal costa: slight relief down the face
  displace(g, (p) => 0.04 * Math.exp(-(p.z * p.z) / 0.01) * (p.x > 3.3 ? 1 : 0));
  return vcolor(g, (p, n) => {
    let c = chitin(p, n);
    // dark post-ocular band running back from the eye
    const band = Math.exp(-((p.y - 0.72) ** 2) / 0.012) * (p.x < 3.4 ? 1 : 0) * Math.min(1, Math.abs(p.z) / 0.4);
    c = c.lerp(new THREE.Color('#3A3A22'), band * 0.7);
    // paler face
    if (n.x > 0.5) c.lerp(new THREE.Color(PALE), (n.x - 0.5) * 0.8);
    return c;
  });
}

function eyes() {
  const parts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    const e = new THREE.SphereGeometry(1, 120, 90);
    e.scale(0.3, 0.42, 0.2).rotateZ(-0.28).translate(3.43, 0.8, s * 0.56);
    vcolor(e, (p) => {
      // vertical stripes, the hexagonal lattice of ommatidia and a dark pseudopupil facing the viewer
      const stripe = 0.5 + 0.5 * Math.sin((p.x - 3.43) * 38 + (p.y - 0.8) * 6);
      const X = p.x * 240;
      const Y = p.y * 240;
      const hex = Math.cos(X) + Math.cos(X / 2 + Y * 0.866) + Math.cos(X / 2 - Y * 0.866);
      const facetEdge = 1 - Math.min(1, Math.max(0, (hex + 0.9) / 1.2));
      const c = mix('#6A4526', '#2B1B0E', stripe * 0.6).lerp(new THREE.Color('#8A6A44'), fbm(p, 14, 2) > 0.7 ? 0.3 : 0);
      c.lerp(new THREE.Color('#1A0F07'), facetEdge * 0.22);
      return c.lerp(new THREE.Color('#0B0603'), Math.exp(-((p.x - 3.45) ** 2 + (p.y - 0.82) ** 2) / 0.004) * 0.7);
    });
    parts.push(e);
    // median ocellus pair above the antennae
    parts.push(paint(new THREE.SphereGeometry(0.045, 12, 8).translate(3.62, 1.12, s * 0.16), '#E8D9A0'));
  }
  parts.push(paint(new THREE.SphereGeometry(0.04, 12, 8).translate(3.78, 0.6, 0), '#E8D9A0'));
  return merge(parts);
}

function antennae() {
  const parts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) {
    const pts = mirrorZ([V(3.66, 1.0, 0.22), V(3.98, 1.55, 0.38), V(4.18, 2.25, 0.62), V(4.0, 2.95, 0.95), V(3.62, 3.4, 1.2)], s);
    const segs = 22;
    const g = sweep(pts, (t) => {
      const r = t < 0.06 ? 0.075 : 0.05 - 0.02 * t;
      const f = (t * segs) % 1;
      const k = 1 - 0.22 * Math.pow(Math.abs(Math.cos(Math.PI * f)), 10);
      return { a: r * k, b: r * k };
    }, { up: V(0, 0, 1), rings: 220, radial: 10 });
    vcolor(g, (_p, _n, u) => mix('#5B7A2E', '#3B2A18', u));
    parts.push(g);
  }
  return merge(parts);
}

function mouthparts() {
  const parts: THREE.BufferGeometry[] = [];
  const labrum = new THREE.SphereGeometry(1, 24, 16);
  labrum.scale(0.1, 0.2, 0.22).translate(3.92, -0.52, 0);
  parts.push(paint(labrum, '#B48A52'));
  for (const s of [1, -1]) {
    const mand = new THREE.SphereGeometry(1, 20, 14);
    mand.scale(0.15, 0.17, 0.11).rotateZ(0.3).translate(3.82, -0.58, s * 0.19);
    parts.push(paint(mand, '#3A2616'));
    // maxillary palp (outer) and labial palp (inner), each three segments
    for (const [z, len] of [
      [0.3, 1],
      [0.12, 0.7],
    ] as const) {
      const pts = [V(3.74, -0.58, s * z), V(3.93, -0.85 * len - 0.05, s * (z + 0.04)), V(3.86, -1.02 * len - 0.1, s * (z + 0.06))];
      const g = sweep(pts, (t) => {
        const k = 1 - 0.3 * Math.pow(Math.abs(Math.cos(Math.PI * t * 3)), 12);
        return { a: 0.04 * k, b: 0.04 * k };
      }, { up: V(0, 0, 1), rings: 40, radial: 10 });
      parts.push(paint(g, '#A88A5C'));
    }
  }
  return merge(parts);
}

// ------------------------------------------------------------------ thorax

const THETA = 2.15;
function pronotumPoint(u: number, v: number) {
  const th = (v * 2 - 1) * THETA;
  const a = Math.abs(th) / THETA;
  const xf = 3.0 - 0.08 * a;
  const xb = 1.05 - 0.62 * Math.cos(th) ** 2 + 0.55 * a ** 2.5;
  const x = xf + (xb - xf) * u;
  const keel = 0.06 * Math.exp(-(th * th) / 0.012);
  const saddle = 1 - 0.07 * Math.sin(Math.PI * u);
  const ry = (0.84 + 0.06 * u) * saddle + keel;
  const rz = (0.74 + 0.08 * u) * saddle;
  const cy = 0.46 - 0.04 * u;
  return V(x, cy + ry * Math.cos(th), rz * Math.sin(th));
}

function thorax() {
  const core = sweep([V(3.05, 0.42, 0), V(2.0, 0.4, 0), V(0.85, 0.33, 0)], (t) => ({ a: 0.6 - 0.05 * t, b: 0.56 }), { rings: 30, radial: 32 });
  vcolor(core, (p, n) => chitin(p, n));
  const shield = surface(pronotumPoint, 44, 72);
  vcolor(shield, (p, n, u, v) => {
    const th = Math.abs((v * 2 - 1) * THETA);
    let c = chitin(p, n);
    // dark lateral band and pale keel
    if (th > 1.15 && th < 1.65) c.lerp(new THREE.Color('#3B4A22'), 0.55);
    if (th < 0.08) c.lerp(new THREE.Color(PALE), 0.5);
    // three transverse sulci
    for (const s of [0.3, 0.5, 0.68]) c.lerp(new THREE.Color('#3A4A20'), Math.exp(-((u - s) ** 2) / 0.00012) * 0.5);
    return c;
  });
  // rim so the shield edge has some thickness
  const rim: THREE.BufferGeometry[] = [];
  const edge = (f: (k: number) => THREE.Vector3) => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 40; k++) pts.push(f(k / 40));
    rim.push(paint(tube(pts, 0.035, false, 80, 6), '#55712C'));
  };
  edge((k) => pronotumPoint(0, k));
  edge((k) => pronotumPoint(1, k));
  edge((k) => pronotumPoint(k, 0));
  edge((k) => pronotumPoint(k, 1));
  return merge([core, shield, ...rim]);
}

// ------------------------------------------------------------------ abdomen

const ABD_SEGS = 10;
const abdPts = [V(1.0, 0.3, 0), V(-0.4, 0.24, 0), V(-2.0, 0.12, 0), V(-3.2, 0.1, 0), V(-3.8, 0.22, 0)];
const abdSec = (t: number) => ({ a: 0.6 * (1 - 0.5 * t ** 1.6), b: 0.54 * (1 - 0.55 * t ** 1.6), sq: 2.3 });
const segPhase = (u: number) => (u * ABD_SEGS) / 0.96;

function abdomen() {
  const g = sweep(abdPts, abdSec, { rings: 200, radial: 40 });
  // grooves between the segments
  displace(g, (_p, _n, u) => (u > 0 && u < 0.96 ? -0.045 * Math.pow(Math.abs(Math.cos(Math.PI * segPhase(u))), 14) : 0));
  vcolor(g, (p, n, u) => {
    let c = chitin(p, n);
    const f = segPhase(u) % 1;
    // darker hind margin of each tergite
    if (n.y > -0.2) c.lerp(new THREE.Color('#2F4019'), Math.max(0, f - 0.72) * 2.2);
    return c;
  });
  const extra: THREE.BufferGeometry[] = [];
  // tympanum (hearing organ) on the first abdominal segment
  for (const s of [1, -1]) {
    const ty = new THREE.SphereGeometry(1, 24, 16);
    ty.scale(0.17, 0.13, 0.035).translate(0.72, 0.36, s * 0.55);
    vcolor(ty, (p) => mix('#E5D6A5', '#5A4630', Math.min(1, ((p.x - 0.72) ** 2 / 0.029 + (p.y - 0.36) ** 2 / 0.017) * 1.3)));
    extra.push(ty);
  }
  // ovipositor: two dorsal and two ventral valves; short cerci
  for (const s of [1, -1]) {
    for (const up of [1, -1]) {
      const pts = [V(-3.78, 0.22 + up * 0.08, s * 0.07), V(-4.05, 0.22 + up * 0.16, s * 0.08), V(-4.25, 0.22 + up * 0.26, s * 0.06)];
      extra.push(paint(sweep(pts, (t) => ({ a: 0.055 * (1 - 0.7 * t), b: 0.04 * (1 - 0.6 * t) }), { up: V(0, 0, 1), rings: 16, radial: 10 }), '#5E4426'));
    }
    extra.push(paint(sweep([V(-3.7, 0.38, s * 0.12), V(-3.92, 0.46, s * 0.2)], (t) => ({ a: 0.035 * (1 - 0.8 * t), b: 0.035 * (1 - 0.8 * t) }), { rings: 8, radial: 8 }), '#7A6440'));
  }
  return merge([g, ...extra]);
}

function spiracles() {
  const curve = new THREE.CatmullRomCurve3(abdPts, false, 'centripetal');
  const parts: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 8; k++) {
    const u = (k + 0.45) / ABD_SEGS * 0.96;
    const p = curve.getPointAt(u);
    const s = abdSec(u);
    for (const side of [1, -1]) {
      const d = new THREE.SphereGeometry(1, 12, 8);
      d.scale(0.05, 0.035, 0.03).translate(p.x, p.y - s.a * 0.2, side * s.b * 0.97);
      parts.push(paint(d, '#2A1D10'));
    }
  }
  // thoracic spiracles under the pronotum edge
  for (const side of [1, -1]) parts.push(paint(new THREE.SphereGeometry(1, 12, 8).scale(0.05, 0.035, 0.03).translate(1.05, 0.05, side * 0.58), '#2A1D10'));
  return merge(parts);
}

// ------------------------------------------------------------------ legs

function segment(pts: THREE.Vector3[], sec: (t: number) => { a: number; b: number }, color: (p: THREE.Vector3, n: THREE.Vector3, u: number, v: number) => THREE.Color, rings = 40) {
  const g = sweep(pts, sec, { up: V(0, 0, 1), rings, radial: 20 });
  return vcolor(g, color);
}

function tarsus(from: THREE.Vector3, to: THREE.Vector3) {
  const parts: THREE.BufferGeometry[] = [];
  const dir = to.clone().sub(from);
  const lens = [0.38, 0.22, 0.4];
  let at = from.clone();
  lens.forEach((l, i) => {
    const b = at.clone().addScaledVector(dir, l);
    const r = 0.055 - i * 0.008;
    parts.push(segment([at, at.clone().lerp(b, 0.5).add(V(0, 0.01, 0)), b], (t) => ({ a: r * (1 - 0.25 * t), b: r * (1 - 0.25 * t) }), () => new THREE.Color('#7A8A44'), 12));
    // adhesive pad under each tarsomere
    parts.push(paint(new THREE.SphereGeometry(1, 12, 8).scale(dir.length() * l * 0.35, 0.025, 0.045).translate(...at.clone().lerp(b, 0.5).add(V(0, -r * 0.8, 0)).toArray()), '#D9CFA0'));
    at = b;
  });
  // pair of claws and the arolium between them
  for (const s of [1, -1]) {
    const tip = at.clone().add(dir.clone().normalize().multiplyScalar(0.12)).add(V(0, -0.05, s * 0.04));
    parts.push(paint(sweep([at, at.clone().lerp(tip, 0.6).add(V(0, 0.02, 0)), tip], (t) => ({ a: 0.022 * (1 - 0.8 * t), b: 0.018 * (1 - 0.8 * t) }), { up: V(0, 0, 1), rings: 8, radial: 8 }), '#2A1D10'));
  }
  parts.push(paint(new THREE.SphereGeometry(0.035, 10, 8).translate(...at.clone().add(dir.clone().normalize().multiplyScalar(0.05)).toArray()), '#E8DDB0'));
  return parts;
}

function spines(pts: THREE.Vector3[], from: number, to: number, count: number, out: THREE.Vector3, len: number) {
  const curve = new THREE.CatmullRomCurve3(pts);
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count; i++) {
    const t = from + ((to - from) * i) / (count - 1);
    const p = curve.getPointAt(t);
    const T = curve.getTangentAt(t);
    const d = out.clone().multiplyScalar(0.8).addScaledVector(T, 0.6).normalize();
    for (const lateral of [-0.05, 0.05]) {
      const base = p.clone().add(V(0, 0, lateral));
      parts.push(paint(sweep([base, base.clone().addScaledVector(d, len)], (k) => ({ a: 0.022 * (1 - 0.85 * k), b: 0.022 * (1 - 0.85 * k) }), { rings: 4, radial: 6, caps: false }), mix('#E8DCC0', '#1E140A', 0.3)));
    }
  }
  return parts;
}

function legs() {
  const parts: THREE.BufferGeometry[] = [];
  const legColor = (p: THREE.Vector3, n: THREE.Vector3) => chitin(p, n, 0.05);
  for (const s of [1, -1]) {
    const m = (pts: THREE.Vector3[]) => mirrorZ(pts, s);
    // ---- front and middle legs: coxa, femur, tibia, tarsus
    for (const L of [
      { cox: V(2.35, -0.22, 0.4), knee: V(2.58, -0.98, 0.84), foot: V(2.3, -1.76, 0.96), toe: V(2.78, -1.98, 1.0) },
      { cox: V(1.45, -0.22, 0.44), knee: V(1.32, -1.0, 0.97), foot: V(0.86, -1.78, 1.14), toe: V(1.28, -1.98, 1.22) },
    ]) {
      const [cox, knee, foot, toe] = m([L.cox, L.knee, L.foot, L.toe]);
      parts.push(paint(new THREE.SphereGeometry(1, 16, 12).scale(0.17, 0.2, 0.15).translate(cox.x, cox.y, cox.z), PALE));
      parts.push(segment([cox, cox.clone().lerp(knee, 0.5).add(V(0.04, 0, 0)), knee], (t) => ({ a: 0.09 - 0.02 * t, b: 0.13 - 0.04 * t }), legColor, 24));
      parts.push(segment([knee, knee.clone().lerp(foot, 0.5), foot], (t) => ({ a: 0.06 - 0.01 * t, b: 0.065 - 0.012 * t }), (p, n) => chitin(p, n, 0.1), 24));
      parts.push(...spines([knee, knee.clone().lerp(foot, 0.5), foot], 0.25, 0.9, 4, V(-1, 0, 0), 0.08));
      parts.push(...tarsus(foot, toe.clone().sub(foot).multiplyScalar(1 / 1.0).add(foot)));
    }
    // ---- jumping hind leg
    const coxa = m([V(0.82, -0.18, 0.46)])[0];
    parts.push(paint(new THREE.SphereGeometry(1, 16, 12).scale(0.2, 0.22, 0.17).translate(coxa.x, coxa.y, coxa.z), PALE));
    const femur = m([V(0.78, -0.08, 0.64), V(-0.2, 0.36, 0.8), V(-1.2, 0.76, 0.86), V(-1.95, 0.98, 0.88)]);
    parts.push(
      segment(
        femur,
        (t) => {
          const h = pw(t, [[0, 0.26], [0.18, 0.43], [0.55, 0.34], [0.88, 0.19], [1, 0.15]]);
          return { a: h * 0.5, b: h };
        },
        (p, n, u, v) => {
          // herringbone (chevron) pattern of the muscle attachments on the outer face
          const ch = (u * 11 + 2.4 * Math.abs(Math.sin(Math.PI * 2 * v))) % 1;
          let c = chitin(p, n);
          if (ch < 0.13 && u > 0.08 && u < 0.86) c = c.lerp(new THREE.Color('#33461C'), 0.65);
          // dark upper ridge band
          if (n.y > 0.75) c.lerp(new THREE.Color('#2E3E18'), 0.4);
          return c;
        },
        90,
      ),
    );
    // knee (genicular lobes): dark
    const knee = femur[3];
    parts.push(paint(new THREE.SphereGeometry(1, 18, 12).scale(0.17, 0.16, 0.13).translate(knee.x - 0.04, knee.y - 0.02, knee.z), '#2B2214'));
    // tibia folded under the femur down to the ground, with two rows of spines
    const tib = m([V(-1.98, 0.88, 0.92), V(-1.2, -0.25, 0.96), V(-0.1, -1.86, 1.0)]);
    parts.push(segment(tib, (t) => ({ a: 0.065 - 0.012 * t, b: 0.075 - 0.015 * t }), (p, n, u) => mix(chitin(p, n), '#A9583A', Math.max(0, u - 0.2) * 1.1), 60));
    parts.push(...spines(tib, 0.22, 0.95, 9, V(-1, -0.15, 0).normalize(), 0.13));
    // apical spurs
    for (const z of [-0.05, 0.05]) {
      const b = tib[2].clone().add(V(0, 0.02, z * s));
      parts.push(paint(sweep([b, b.clone().add(V(-0.18, -0.06, 0))], (k) => ({ a: 0.025 * (1 - 0.8 * k), b: 0.025 * (1 - 0.8 * k) }), { rings: 4, radial: 6 }), '#3A2A16'));
    }
    parts.push(...tarsus(tib[2].clone().add(V(0, -0.04, 0)), m([V(-0.98, -2.0, 1.04)])[0]));
  }
  return merge(parts);
}

// ------------------------------------------------------------------ wings

/** Near-side forewing (tegmen) folded and wrapped over the side of the body. */
function tegmenFolded(s: number) {
  const f = (u: number, v: number) => {
    const x = 1.5 - u * 5.85;
    const w = pw(u, [[0, 0.42], [0.18, 0.95], [0.75, 0.82], [0.93, 0.5], [1, 0.08]]);
    const th = pw(u, [[0, 0.5], [0.4, 0.62], [1, 0.62]]) + (v - 0.5) * w;
    const R = 0.86 - 0.26 * u;
    const cy = 0.42 - 0.27 * u;
    return V(x, cy + R * Math.cos(th), s * R * Math.sin(th));
  };
  const g = surface(f, 90, 18);
  return vcolor(g, (p, _n, u, v) => {
    let c = mix('#8DA455', '#A18A55', u * 0.6);
    if (v < 0.18) c = mix(c, '#BFD08A', 0.5); // paler costal edge
    const vein = Math.pow(Math.abs(Math.sin(v * Math.PI * 8)), 24) + 0.6 * Math.pow(Math.abs(Math.sin(u * Math.PI * 34)), 30);
    c.lerp(new THREE.Color('#4E5A2C'), Math.min(1, vein) * 0.45);
    const spot = fbm(p, 3.2, 2);
    if (spot > 0.64 && u > 0.35) c.lerp(new THREE.Color('#4A3820'), (spot - 0.64) * 3);
    return c;
  });
}

/** Far-side wings spread for flight: tegmen raised and the fan-shaped hind wing open. */
function wingsSpread(s: number) {
  const base = V(1.35, 1.02, s * 0.25);
  // raised forewing
  const dir = V(-0.85, 0.32, s * -0.5).normalize();
  const wDir = new THREE.Vector3().crossVectors(dir, V(0, 1, 0)).normalize().multiplyScalar(-s);
  const teg = surface((u, v) => {
    const w = pw(u, [[0, 0.36], [0.18, 0.78], [0.78, 0.7], [0.95, 0.38], [1, 0.05]]);
    return base
      .clone()
      .addScaledVector(dir, u * 5.0)
      .addScaledVector(wDir, (v - 0.5) * w)
      .add(V(0, -0.12 * Math.sin(Math.PI * v), 0));
  }, 70, 14);
  vcolor(teg, (p, _n, u, v) => {
    let c = mix('#8DA455', '#A18A55', u * 0.6);
    const vein = Math.pow(Math.abs(Math.sin(v * Math.PI * 8)), 24) + 0.6 * Math.pow(Math.abs(Math.sin(u * Math.PI * 34)), 30);
    c.lerp(new THREE.Color('#4E5A2C'), Math.min(1, vein) * 0.45);
    const spot = fbm(p, 3.2, 2);
    if (spot > 0.64 && u > 0.35) c.lerp(new THREE.Color('#4A3820'), (spot - 0.64) * 3);
    return c;
  });
  // hind wing: fan with pleats, yellow base, dark band and smoky margin
  const hb = V(1.1, 0.98, s * 0.4);
  const a0 = Math.atan2(s * 1, 0.2);
  const a1 = Math.atan2(s * 0.05, -1);
  const fan = surface((u, v) => {
    const a = a0 + (a1 - a0) * v;
    const L = pw(v, [[0, 2.7], [0.35, 3.05], [0.8, 2.75], [1, 2.2]]) * u;
    const pleat = 0.08 * u * (2 * Math.abs(((v * 15) % 1) - 0.5) - 0.5);
    return hb.clone().add(V(Math.cos(a) * L, pleat + 0.42 * u * u, Math.sin(a) * L));
  }, 40, 90);
  vcolor(fan, (_p, _n, u, v) => {
    let c = mix('#F0D35B', '#E9C24A', v);
    c.lerp(new THREE.Color('#2E2416'), Math.exp(-((u - 0.68) ** 2) / 0.006) * 0.85);
    if (u > 0.78) c.lerp(new THREE.Color('#C9C2B0'), 0.6);
    const vein = Math.pow(Math.abs(Math.cos(Math.PI * v * 15)), 30);
    c.lerp(new THREE.Color('#5A4A2A'), vein * 0.6);
    return c;
  });
  return [teg, fan];
}

// ------------------------------------------------------------------ model

export function grasshopper(): BuiltModel {
  const meshes: MeshDef[] = [];
  meshes.push({ id: 'gh-cabeca', structure: 'cabeca', geometry: head() });
  meshes.push({ id: 'gh-olhos', structure: 'olhos-compostos', geometry: eyes() });
  meshes.push({ id: 'gh-antenas', structure: 'antenas', geometry: antennae() });
  meshes.push({ id: 'gh-boca', structure: 'aparelho-bucal', geometry: mouthparts() });
  meshes.push({ id: 'gh-torax', structure: 'torax', geometry: thorax() });
  meshes.push({ id: 'gh-abdome', structure: 'abdome', geometry: abdomen() });
  meshes.push({ id: 'gh-espiraculos', structure: 'espiraculos', geometry: spiracles() });
  meshes.push({ id: 'gh-patas', structure: 'patas', geometry: legs() });
  meshes.push({ id: 'gh-asas', structure: 'asas', geometry: merge([tegmenFolded(1), ...wingsSpread(-1)]) });
  return { meshes: colorize(meshes), anchors: {}, preset: presetFor(17, [-0.3, 0.4, 0], 0.3, 0.5) };
}
