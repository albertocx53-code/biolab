/**
 * Procedural geometry for the Cell Biology laboratory.
 *
 * Every cell model in this laboratory is generated in code by BioLab 3D
 * (no third-party meshes, so no licence restrictions). Shapes are defined
 * by "star-shaped" distance functions: for a unit direction d, dist(d) is the
 * distance from the shape centre to its surface. That lets one routine build
 * cut-away shells (a wedge removed, like a textbook illustration) and the
 * matching cut faces for any shape: ellipsoids, rounded boxes, capsules…
 *
 * Convention: the cut axis is local +Y; φ = 0 points to +Z (towards the viewer).
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { segs } from '@/engine/performance/quality';

export type DistFn = (d: THREE.Vector3) => number;

/** Deterministic PRNG (mulberry32) so every visit shows the same cell. */
export function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (lo: number, hi: number) => lo + (hi - lo) * next(),
    pick: <T,>(arr: T[]) => arr[Math.floor(next() * arr.length)],
    /** Uniform random unit vector. */
    dir: () => {
      const u = next() * 2 - 1;
      const t = next() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      return new THREE.Vector3(s * Math.cos(t), u, s * Math.sin(t));
    },
  };
}
export type Rng = ReturnType<typeof rng>;

// ---------------------------------------------------------------- shapes

export const ellipsoid =
  (a: number, b: number, c: number): DistFn =>
  (d) =>
    1 / Math.sqrt((d.x / a) ** 2 + (d.y / b) ** 2 + (d.z / c) ** 2);

/** Rounded box (superellipsoid). n = 2 is an ellipsoid, larger n is boxier. */
export const superellipsoid =
  (a: number, b: number, c: number, n: number): DistFn =>
  (d) =>
    1 / Math.pow(Math.abs(d.x / a) ** n + Math.abs(d.y / b) ** n + Math.abs(d.z / c) ** n, 1 / n);

/** Capsule along local Y: half-length of the straight part h, radius r. */
export const capsuleY =
  (h: number, r: number): DistFn =>
  (d) => {
    let lo = 0;
    let hi = h + r + 1e-3;
    for (let i = 0; i < 26; i++) {
      const t = (lo + hi) / 2;
      const py = d.y * t;
      const qy = Math.max(-h, Math.min(h, py));
      const dist = Math.hypot(d.x * t, py - qy, d.z * t);
      if (dist < r) lo = t;
      else hi = t;
    }
    return (lo + hi) / 2;
  };

/** Smooth organic irregularity on top of another shape (low-frequency, deterministic). */
export const wobble =
  (base: DistFn, amp: number, seed = 1): DistFn =>
  (d) => {
    const s = seed * 1.7;
    const n =
      Math.sin(2.1 * d.x + s) * Math.sin(1.7 * d.y + 0.6 * s) * Math.cos(2.3 * d.z - s) +
      0.55 * Math.sin(3.7 * d.x - 1.3 * s + 2.2 * d.z) * Math.cos(3.1 * d.y + s) +
      0.3 * Math.sin(5.3 * d.y + 4.1 * d.z + s);
    return base(d) * (1 + amp * n);
  };

export const scaled =
  (base: DistFn, k: number): DistFn =>
  (d) =>
    base(d) * k;

// ---------------------------------------------------------------- cut-away shells

export interface Cut {
  /** Centre of the removed wedge (radians, 0 = +Z). */
  center: number;
  /** Angular width of the removed wedge (radians). */
  width: number;
}
export const NO_CUT: Cut = { center: 0, width: 0 };

const _d = new THREE.Vector3();
function dirAt(theta: number, phi: number, out = _d) {
  const s = Math.sin(theta);
  return out.set(s * Math.sin(phi), Math.cos(theta), s * Math.cos(phi));
}

/** Point on the surface at spherical angles (θ from +Y, φ from +Z towards +X). */
export function surfacePoint(dist: DistFn, theta: number, phi: number) {
  const d = dirAt(theta, phi, new THREE.Vector3());
  return d.multiplyScalar(dist(d));
}

/** Grid resolution of a shell for the given authored segments and cut (detail-scaled). */
function shellGrid(cut: Cut, seg: [number, number]) {
  const ws = segs(seg[0], 12);
  const hs = segs(seg[1], 8);
  const open = cut.width > 0;
  const phi0 = open ? cut.center + cut.width / 2 : 0;
  const phiLen = open ? Math.PI * 2 - cut.width : Math.PI * 2;
  const cols = open ? Math.max(8, Math.round((ws * phiLen) / (Math.PI * 2))) : ws;
  return { hs, open, phi0, phiLen, cols };
}

/** Number of floats a shell's position attribute takes (see `fillShell`). */
export function shellFloats(cut: Cut, seg: [number, number]) {
  const { hs, cols } = shellGrid(cut, seg);
  return (hs + 1) * (cols + 1) * 3;
}

/** Writes the vertex positions of a shell into `out` at `off`; returns the next offset. */
export function fillShell(out: Float32Array, off: number, dist: DistFn, cut: Cut, seg: [number, number]) {
  const { hs, phi0, phiLen, cols } = shellGrid(cut, seg);
  const d = _d;
  let k = off;
  for (let j = 0; j <= hs; j++) {
    const theta = (j / hs) * Math.PI;
    for (let i = 0; i <= cols; i++) {
      const phi = phi0 + (i / cols) * phiLen;
      dirAt(theta, phi, d);
      const r = dist(d);
      out[k++] = d.x * r;
      out[k++] = d.y * r;
      out[k++] = d.z * r;
    }
  }
  return k;
}

/**
 * Surface shell of a star-shaped solid, with an optional wedge removed.
 * Segment counts follow the active quality profile (see `segs`).
 */
export function shell(dist: DistFn, cut: Cut = NO_CUT, seg: [number, number] = [72, 40]): THREE.BufferGeometry {
  const { hs, open, cols } = shellGrid(cut, seg);
  const pos = new Float32Array((hs + 1) * (cols + 1) * 3);
  fillShell(pos, 0, dist, cut, seg);
  const idx: number[] = [];
  const row = cols + 1;
  for (let j = 0; j < hs; j++)
    for (let i = 0; i < cols; i++) {
      const a = j * row + i;
      const b = a + row;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  if (!open) fixSeamNormals(g, row, hs);
  return g;
}

/** Average normals across the φ = 0 / 2π seam of a closed shell. */
function fixSeamNormals(g: THREE.BufferGeometry, row: number, hs: number) {
  const n = g.getAttribute('normal') as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let j = 0; j <= hs; j++) {
    const a = j * row;
    const b = a + row - 1;
    v.set(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize();
    n.setXYZ(a, v.x, v.y, v.z);
    n.setXYZ(b, v.x, v.y, v.z);
  }
}

/**
 * The two flat faces exposed by a wedge cut: the region between an inner
 * shape (or the cut axis) and an outer shape, on both cut planes.
 */
/** Writes the positions of one cut face (2 vertices per row) into `out`; returns the next offset. */
function fillCutFace(out: Float32Array, off: number, outer: DistFn, inner: DistFn | null, phi: number, hs: number) {
  const d = _d;
  let k = off;
  for (let j = 0; j <= hs; j++) {
    const theta = (j / hs) * Math.PI;
    dirAt(theta, phi, d);
    const ro = outer(d);
    out[k++] = d.x * ro;
    out[k++] = d.y * ro;
    out[k++] = d.z * ro;
    if (inner) {
      const ri = inner(d);
      out[k++] = d.x * ri;
      out[k++] = d.y * ri;
      out[k++] = d.z * ri;
    } else {
      out[k++] = 0;
      out[k++] = d.y * ro;
      out[k++] = 0;
    }
  }
  return k;
}

export function cutFaces(outer: DistFn, inner: DistFn | null, cut: Cut, hsAuthored = 40): THREE.BufferGeometry {
  const hs = segs(hsAuthored, 8);
  const faces: THREE.BufferGeometry[] = [];
  for (const phi of [cut.center - cut.width / 2, cut.center + cut.width / 2]) {
    const pos = new Float32Array((hs + 1) * 2 * 3);
    fillCutFace(pos, 0, outer, inner, phi, hs);
    const idx: number[] = [];
    for (let j = 0; j < hs; j++) {
      const a = j * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    faces.push(g);
  }
  return merge(faces);
}

/** Ring face for a thick wall (outer and inner surface of the same shape). */
export function wall(dist: DistFn, kInner: number, cut: Cut, seg: [number, number] = [72, 40]) {
  const inner = scaled(dist, kInner);
  return merge([shell(dist, cut, seg), shell(inner, cut, seg), cutFaces(dist, inner, cut, seg[1])]);
}

/**
 * Rewrites the positions of a geometry built by `wall(...)` for a new shape,
 * without allocating: same vertex order as `wall` (outer shell, inner shell,
 * two cut faces). Returns false when the topology does not match (then the
 * caller should rebuild instead).
 */
export function refillWall(geo: THREE.BufferGeometry, dist: DistFn, kInner: number, cut: Cut, seg: [number, number] = [72, 40]) {
  const attr = geo.getAttribute('position') as THREE.BufferAttribute;
  const out = attr.array as Float32Array;
  const hs = segs(seg[1], 8);
  const expected = shellFloats(cut, seg) * 2 + (hs + 1) * 2 * 3 * 2;
  if (out.length !== expected) return false;
  const inner = scaled(dist, kInner);
  let k = fillShell(out, 0, dist, cut, seg);
  k = fillShell(out, k, inner, cut, seg);
  k = fillCutFace(out, k, dist, inner, cut.center - cut.width / 2, hs);
  fillCutFace(out, k, dist, inner, cut.center + cut.width / 2, hs);
  attr.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  return true;
}

// ---------------------------------------------------------------- helpers

export function merge(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  // mergeGeometries needs identical attribute sets and indexing on every input
  for (const g of geos) {
    for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal' && name !== 'color') g.deleteAttribute(name);
    if (!g.getAttribute('normal')) g.computeVertexNormals();
  }
  const anyIndexed = geos.some((g) => g.index);
  const anyColor = geos.some((g) => g.getAttribute('color'));
  const ready = geos.map((g) => {
    let out = anyIndexed && !g.index ? indexed(g) : g;
    if (anyColor && !out.getAttribute('color')) out = paint(out, '#ffffff');
    return out;
  });
  const m = mergeGeometries(ready, false);
  if (!m) throw new Error('merge failed');
  ready.forEach((g) => g.dispose());
  return m;
}

function indexed(g: THREE.BufferGeometry) {
  const n = g.getAttribute('position').count;
  g.setIndex(Array.from({ length: n }, (_, i) => i));
  return g;
}

/** Bakes a vertex colour into a geometry (for multi-tone merged meshes). */
export function paint(g: THREE.BufferGeometry, color: string | THREE.Color): THREE.BufferGeometry {
  const c = new THREE.Color(color);
  const n = g.getAttribute('position').count;
  const arr = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

/** Applies position/orientation/scale to a geometry (meshes stay at identity). */
export function place(g: THREE.BufferGeometry, pos: THREE.Vector3 | [number, number, number], quat?: THREE.Quaternion, scale?: number | THREE.Vector3) {
  const m = new THREE.Matrix4();
  const p = Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
  const s = scale === undefined ? new THREE.Vector3(1, 1, 1) : typeof scale === 'number' ? new THREE.Vector3(scale, scale, scale) : scale;
  m.compose(p, quat ?? new THREE.Quaternion(), s);
  g.applyMatrix4(m);
  return g;
}

/** Quaternion that rotates local +Y onto the given direction. */
export function alignY(dir: THREE.Vector3, twist = 0) {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  if (twist) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), twist));
  return q;
}

export function randomQuat(r: Rng) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(0, Math.PI * 2), r.range(0, Math.PI * 2), r.range(0, Math.PI * 2)));
}

/** Many small blobs merged into one mesh (ribosomes, vesicles, granules). */
export function dots(points: THREE.Vector3[], radius: number | ((i: number) => number), detail = 0): THREE.BufferGeometry {
  const base = new THREE.IcosahedronGeometry(1, detail);
  const geos = points.map((p, i) => place(base.clone(), p, undefined, typeof radius === 'number' ? radius : radius(i)));
  base.dispose();
  return merge(geos);
}

/** Smooth tube through points (chromatin, ER tubules, DNA). */
export function tube(points: THREE.Vector3[], radius: number, closed = false, tubular = 0, radial = 6) {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
  return new THREE.TubeGeometry(curve, segs(tubular || points.length * 8, 4), radius, segs(radial, 4), closed);
}

/** Random walk constrained to stay inside a shape (for tangled strands). */
export function tangle(r: Rng, start: THREE.Vector3, steps: number, stepLen: number, inside: (p: THREE.Vector3) => boolean) {
  const pts = [start.clone()];
  let dir = r.dir();
  let p = start.clone();
  for (let i = 0; i < steps; i++) {
    for (let tries = 0; tries < 12; tries++) {
      const nd = dir.clone().add(r.dir().multiplyScalar(0.9)).normalize();
      const np = p.clone().addScaledVector(nd, stepLen);
      if (inside(np)) {
        dir = nd;
        p = np;
        break;
      }
      dir = r.dir();
    }
    pts.push(p.clone());
  }
  return pts;
}

/** True when p (relative to the shape centre) is inside dist scaled by k. */
export function inside(dist: DistFn, p: THREE.Vector3, k = 1) {
  const l = p.length();
  if (l < 1e-6) return true;
  return l < dist(p.clone().divideScalar(l)) * k;
}

/** Angle φ of a point around the Y axis (0 = +Z). */
export const phiOf = (p: THREE.Vector3) => Math.atan2(p.x, p.z);

/** True when the point lies inside the removed wedge. */
export function inWedge(p: THREE.Vector3, cut: Cut) {
  if (!cut.width) return false;
  let a = phiOf(p) - cut.center;
  a = Math.atan2(Math.sin(a), Math.cos(a));
  return Math.abs(a) < cut.width / 2;
}

/**
 * Curved pancake (a Golgi cisterna or an ER sheet): an ellipse in XZ bowed
 * along Y. `bow` is the sag at the rim, `swell` adds rounded rims.
 */
export function cisterna(rx: number, rz: number, thick: number, bow: number, seg = 28) {
  const g = new THREE.SphereGeometry(1, seg, 10);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) * rx;
    const z = p.getZ(i) * rz;
    const rr = (x / rx) ** 2 + (z / rz) ** 2;
    // flattened, with slightly swollen rims (like real cisternae)
    const y = p.getY(i) * thick * (0.75 + 0.6 * rr * rr) - bow * rr;
    p.setXYZ(i, x, y, z);
  }
  g.deleteAttribute('uv');
  g.computeVertexNormals();
  return g;
}

/**
 * Half-cut organelle with internal folds (mitochondrion / chloroplast in a
 * cell): outer + inner envelope with half removed and internal plates.
 */
export function slicedCapsule(h: number, r: number, outerColor: string, innerColor: string, foldColor: string, folds: 'cristae' | 'grana', r0: Rng) {
  const cut: Cut = { center: 0, width: Math.PI };
  const outer = capsuleY(h, r);
  const inner = scaled(outer, 0.86);
  const parts: THREE.BufferGeometry[] = [
    paint(shell(outer, cut, [28, 22]), outerColor),
    paint(shell(inner, cut, [28, 22]), innerColor),
    paint(cutFaces(outer, inner, cut, 22), outerColor),
  ];
  if (folds === 'cristae') {
    const n = Math.max(3, Math.round((h * 2) / (r * 0.55)));
    for (let i = 0; i < n; i++) {
      const y = -h + ((i + 0.5) / n) * h * 2 + r0.range(-0.1, 0.1) * r;
      const side = i % 2 ? 1 : -1;
      // a half-disc plate across the inner space, alternating sides (shelf-like cristae)
      // half-disc in the remaining (z ≤ 0) half, reaching in from alternating sides
      const plate = new THREE.CircleGeometry(r * 0.84, 18, Math.PI, Math.PI);
      plate.rotateX(Math.PI / 2);
      plate.scale(0.78, 1, 1);
      plate.translate(side * r * 0.2, y, 0);
      parts.push(paint(plate, foldColor));
    }
  } else {
    const stacks = Math.max(3, Math.round((h * 2) / (r * 0.8)));
    for (let i = 0; i < stacks; i++) {
      const y = -h + ((i + 0.5) / stacks) * h * 2;
      const x = r0.range(-0.25, 0.25) * r;
      const z = -r * r0.range(0.2, 0.45);
      const discs = 4 + Math.floor(r0.next() * 3);
      for (let k = 0; k < discs; k++) {
        const disc = new THREE.CylinderGeometry(r * 0.32, r * 0.32, r * 0.09, 16);
        disc.rotateZ(Math.PI / 2);
        disc.translate(x + (k - discs / 2) * r * 0.13, y, z);
        parts.push(paint(disc, foldColor));
      }
    }
  }
  return merge(parts);
}

/** A curved sheet: part of a shape's surface between angle ranges (ER cisternae). */
export function patch(dist: DistFn, theta: [number, number], phi: [number, number], seg: [number, number] = [24, 16], ripple = 0, seed = 0) {
  const ws = segs(seg[0], 6);
  const hs = segs(seg[1], 4);
  const pos: number[] = [];
  const idx: number[] = [];
  const d = new THREE.Vector3();
  for (let j = 0; j <= hs; j++) {
    const t = theta[0] + (j / hs) * (theta[1] - theta[0]);
    for (let i = 0; i <= ws; i++) {
      const p = phi[0] + (i / ws) * (phi[1] - phi[0]);
      dirAt(t, p, d);
      const r = dist(d) * (1 + ripple * Math.sin(7 * p + seed) * Math.sin(5 * t + 2 * seed));
      pos.push(d.x * r, d.y * r, d.z * r);
    }
  }
  const row = ws + 1;
  for (let j = 0; j < hs; j++)
    for (let i = 0; i < ws; i++) {
      const a = j * row + i;
      idx.push(a, a + row, a + 1, a + row, a + row + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Rotation that maps local +Y to `axis` and local +Z as close as possible to `facing`. */
export function basisQuat(axis: THREE.Vector3, facing: THREE.Vector3) {
  const y = axis.clone().normalize();
  let z = facing.clone().addScaledVector(y, -facing.dot(y));
  if (z.lengthSq() < 1e-6) z = new THREE.Vector3(1, 0, 0).addScaledVector(y, -y.x);
  z.normalize();
  const x = new THREE.Vector3().crossVectors(y, z);
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
}

/** Wobbly closed loop (plasmid, circular DNA) in the local XZ plane. */
export function loop(radius: number, r: Rng, n = 14) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const rr = radius * (1 + r.range(-0.18, 0.18));
    return new THREE.Vector3(Math.cos(a) * rr, r.range(-0.15, 0.15) * radius, Math.sin(a) * rr);
  });
}

/** Multi-octave organic irregularity (large lobes plus fine ripples), deterministic. */
export const wobble2 =
  (base: DistFn, amp: number, seed = 1, fine = 0.3): DistFn =>
  (d) => {
    const s = seed * 2.3;
    const n1 =
      Math.sin(1.9 * d.x + s) * Math.sin(1.6 * d.y + 0.7 * s) * Math.cos(2.2 * d.z - s) +
      0.6 * Math.sin(3.4 * d.x - 1.1 * s + 2.0 * d.z) * Math.cos(2.9 * d.y + s) +
      0.35 * Math.sin(5.1 * d.y + 3.8 * d.z + s);
    const n2 = Math.sin(9.3 * d.x + 2 * s) * Math.sin(8.1 * d.y - s) * Math.cos(10.7 * d.z + s) + 0.5 * Math.sin(13.1 * d.x + 11.3 * d.z - s) * Math.cos(12.7 * d.y + 2 * s);
    return base(d) * (1 + amp * (n1 + fine * n2));
  };

/**
 * Short rounded protrusions standing on the surface of a shape (microvilli,
 * pili, surface granules). Skips the removed wedge so the cut stays clean.
 */
export function bumps(r: Rng, dist: DistFn, count: number, len: [number, number], radius: number, avoid: Cut | null, keep?: (d: THREE.Vector3) => boolean): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count * 4 && parts.length < count; i++) {
    const d = r.dir();
    const p = d.clone().multiplyScalar(dist(d));
    if (avoid && inWedge(p, avoid)) continue;
    if (keep && !keep(d)) continue;
    const l = r.range(len[0], len[1]);
    const g = new THREE.CapsuleGeometry(radius, l, 3, 7);
    parts.push(place(g, p.clone().addScaledVector(d, l / 2 - radius * 0.5), alignY(d)));
  }
  return merge(parts);
}

/** Capsule bent along an arc (curved mitochondria, bacilli): length 2h, radius r, bend in radians. */
export function bentCapsule(h: number, r: number, bend: number, seg = 10, radial = 12): THREE.BufferGeometry {
  const pts: THREE.Vector3[] = [];
  const n = 24;
  const R = bend > 1e-3 ? (2 * h) / bend : Infinity;
  for (let i = 0; i <= n; i++) {
    const t = i / n - 0.5;
    if (!Number.isFinite(R)) pts.push(new THREE.Vector3(0, t * 2 * h, 0));
    else {
      const a = t * bend;
      pts.push(new THREE.Vector3(R * (1 - Math.cos(a)), R * Math.sin(a), 0));
    }
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom');
  const tubeG = new THREE.TubeGeometry(curve, seg * 2, r, radial, false);
  const capA = new THREE.SphereGeometry(r, radial, 8);
  const capB = new THREE.SphereGeometry(r, radial, 8);
  place(capA, pts[0]);
  place(capB, pts[n]);
  return merge([tubeG, capA, capB]);
}

/** Thin filaments following the inner surface of a shape (cortical actin / cortical microtubules). */
export function corticalFilaments(r: Rng, dist: DistFn, k: number, count: number, length: number, radius: number, avoid: Cut | null): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < count * 3 && parts.length < count; i++) {
    const d = r.dir();
    const start = d.clone().multiplyScalar(dist(d) * k);
    if (avoid && inWedge(start, avoid)) continue;
    // walk along a random tangent direction, re-projected on the surface each step
    let dir = r.dir();
    dir.addScaledVector(d, -dir.dot(d)).normalize();
    const pts = [start.clone()];
    let p = start.clone();
    const steps = 8;
    let ok = true;
    for (let s = 0; s < steps; s++) {
      p = p.clone().addScaledVector(dir, length / steps);
      const n = p.clone().normalize();
      p = n.multiplyScalar(dist(n) * k);
      if (avoid && inWedge(p, avoid)) {
        ok = false;
        break;
      }
      dir.addScaledVector(n, -dir.dot(n)).normalize();
      pts.push(p.clone());
    }
    if (!ok || pts.length < 4) continue;
    parts.push(tube(pts, radius, false, 24, 4));
  }
  return merge(parts);
}
