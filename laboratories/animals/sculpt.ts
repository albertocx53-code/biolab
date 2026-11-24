/**
 * Sculpting tools for the Animals laboratory: smooth bodies swept along
 * curves, parametric surfaces (wings, shields, fins), value noise for organic
 * relief and per-vertex colour patterns (stripes, spots, mottling).
 * All geometry is generated in code by BioLab 3D.
 */
import * as THREE from 'three';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ------------------------------------------------------------------ noise

function hash(x: number, y: number, z: number) {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const fade = (t: number) => t * t * (3 - 2 * t);

/** Smooth value noise in [0, 1]. */
export function noise3(x: number, y: number, z: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = fade(x - xi);
  const yf = fade(y - yi);
  const zf = fade(z - zi);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
    l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf,
  );
}

/** Fractal noise (sum of octaves) in about [0, 1]. */
export function fbm(p: THREE.Vector3, scale: number, octaves = 3) {
  let a = 0;
  let w = 0.5;
  let f = scale;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    a += w * noise3(p.x * f + o * 17.1, p.y * f - o * 3.7, p.z * f + o * 9.3);
    norm += w;
    w *= 0.5;
    f *= 2.03;
  }
  return a / norm;
}

/** Piecewise profile: smooth steps between [t, value] keys. */
export function pw(t: number, keys: [number, number][]) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      return v0 + (v1 - v0) * k * k * (3 - 2 * k);
    }
  }
  return keys[keys.length - 1][1];
}

// ------------------------------------------------------------------ sweep

export interface SweepSection {
  /** half size along the curve's normal ("up" side) */
  a: number;
  /** half size along the curve's side */
  b: number;
  /** superellipse exponent (2 = ellipse, larger = boxier) */
  sq?: number;
  /** shift of the section centre along the normal */
  off?: number;
}

/**
 * Tube with varying elliptical sections along a smooth curve through
 * `points`. Frames use a fixed `up` hint, so there is no twisting. Ends are
 * closed with rounded caps. Vertex attribute `uv.x` = position along the curve.
 */
export function sweep(points: THREE.Vector3[], section: (t: number) => SweepSection, opts: { up?: THREE.Vector3; rings?: number; radial?: number; caps?: boolean } = {}) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const rings = opts.rings ?? 64;
  const radial = opts.radial ?? 28;
  const upHint = opts.up ?? V(0, 1, 0);
  const caps = opts.caps ?? true;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const capRings = caps ? 4 : 0;
  const rows: { p: THREE.Vector3; n: THREE.Vector3; s: THREE.Vector3; sec: SweepSection; t: number }[] = [];
  const frame = (t: number) => {
    const p = curve.getPointAt(t);
    const T = curve.getTangentAt(t).normalize();
    let side = new THREE.Vector3().crossVectors(T, upHint);
    if (side.lengthSq() < 1e-6) side = new THREE.Vector3().crossVectors(T, V(1, 0, 0));
    side.normalize();
    const n = new THREE.Vector3().crossVectors(side, T).normalize();
    return { p, n, s: side, T };
  };
  // start cap rings (shrinking towards the tip)
  const f0 = frame(0);
  const f1 = frame(1);
  const s0 = section(0);
  const s1 = section(1);
  for (let k = capRings; k >= 1; k--) {
    const a = (k / (capRings + 1)) * (Math.PI / 2);
    const len = Math.min(s0.a, s0.b) * 0.9;
    rows.push({ p: f0.p.clone().addScaledVector(f0.T, -Math.sin(a) * len), n: f0.n, s: f0.s, sec: { ...s0, a: s0.a * Math.cos(a), b: s0.b * Math.cos(a) }, t: 0 });
  }
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const f = frame(t);
    rows.push({ p: f.p, n: f.n, s: f.s, sec: section(t), t });
  }
  for (let k = 1; k <= capRings; k++) {
    const a = (k / (capRings + 1)) * (Math.PI / 2);
    const len = Math.min(s1.a, s1.b) * 0.9;
    rows.push({ p: f1.p.clone().addScaledVector(f1.T, Math.sin(a) * len), n: f1.n, s: f1.s, sec: { ...s1, a: s1.a * Math.cos(a), b: s1.b * Math.cos(a) }, t: 1 });
  }
  if (caps) {
    rows.unshift({ p: f0.p.clone().addScaledVector(f0.T, -Math.min(s0.a, s0.b) * 0.9), n: f0.n, s: f0.s, sec: { ...s0, a: 0, b: 0 }, t: 0 });
    rows.push({ p: f1.p.clone().addScaledVector(f1.T, Math.min(s1.a, s1.b) * 0.9), n: f1.n, s: f1.s, sec: { ...s1, a: 0, b: 0 }, t: 1 });
  }
  for (const r of rows) {
    const e = 2 / (r.sec.sq ?? 2);
    for (let j = 0; j <= radial; j++) {
      const ang = (j / radial) * Math.PI * 2;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const cu = Math.sign(ca) * Math.abs(ca) ** e;
      const sv = Math.sign(sa) * Math.abs(sa) ** e;
      const q = r.p
        .clone()
        .addScaledVector(r.n, cu * r.sec.a + (r.sec.off ?? 0))
        .addScaledVector(r.s, sv * r.sec.b);
      pos.push(q.x, q.y, q.z);
      uv.push(r.t, j / radial);
    }
  }
  // wound so that the normals point outwards
  for (let i = 0; i < rows.length - 1; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ------------------------------------------------------------------ surfaces

/** Open parametric surface f(u, v) over [0,1]², with `uv` kept for colouring. */
export function surface(f: (u: number, v: number) => THREE.Vector3, nu = 48, nv = 24) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= nu; i++)
    for (let j = 0; j <= nv; j++) {
      const p = f(i / nu, j / nv);
      pos.push(p.x, p.y, p.z);
      uv.push(i / nu, j / nv);
    }
  for (let i = 0; i < nu; i++)
    for (let j = 0; j < nv; j++) {
      const a = i * (nv + 1) + j;
      const b = a + nv + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ------------------------------------------------------------------ relief and colour

/** Moves each vertex along its normal by `d(p, n, uv)`. */
export function displace(g: THREE.BufferGeometry, d: (p: THREE.Vector3, n: THREE.Vector3, u: number, v: number) => number) {
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  const p = g.getAttribute('position');
  const n = g.getAttribute('normal');
  const uv = g.getAttribute('uv');
  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    P.fromBufferAttribute(p, i);
    N.fromBufferAttribute(n, i);
    const k = d(P, N, uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
    p.setXYZ(i, P.x + N.x * k, P.y + N.y * k, P.z + N.z * k);
  }
  g.computeVertexNormals();
  return g;
}

/** Sets per-vertex colours from `f(p, n, u, v)`. */
export function vcolor(g: THREE.BufferGeometry, f: (p: THREE.Vector3, n: THREE.Vector3, u: number, v: number) => THREE.Color) {
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  const p = g.getAttribute('position');
  const n = g.getAttribute('normal');
  const uv = g.getAttribute('uv');
  const col = new Float32Array(p.count * 3);
  const P = new THREE.Vector3();
  const N = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    P.fromBufferAttribute(p, i);
    N.fromBufferAttribute(n, i);
    const c = f(P, N, uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

/** Colour helper: mix of hex colours. */
export const mix = (a: string | THREE.Color, b: string | THREE.Color, t: number) => new THREE.Color(a).lerp(new THREE.Color(b), Math.min(1, Math.max(0, t)));

/** Removes the uv attribute so the geometry can be merged with uv-less parts. */
export function dropUv(g: THREE.BufferGeometry) {
  g.deleteAttribute('uv');
  return g;
}

/**
 * Opens a "dissection window" in an indexed surface: removes the faces whose
 * centre satisfies `inside`, and returns a rim that gives the cut edge a
 * thickness of `depth` (towards the inside), painted `rimColor`.
 */
export function cutWindow(g: THREE.BufferGeometry, inside: (c: THREE.Vector3) => boolean, depth: number, rimColor: string) {
  const index = g.getIndex();
  if (!index) throw new Error('cutWindow needs an indexed geometry');
  if (!g.getAttribute('normal')) g.computeVertexNormals();
  const p = g.getAttribute('position');
  const n = g.getAttribute('normal');
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const C = new THREE.Vector3();
  const keep: number[] = [];
  const removedEdges = new Set<string>();
  const keptEdges = new Map<string, [number, number, number]>();
  const key = (a: number, b: number) => (a < b ? `${a}_${b}` : `${b}_${a}`);
  // vertices duplicated along seams share a position key, so the rim follows the true outline
  const posKey = (i: number) => `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
  const canon = new Map<string, number>();
  const id = (i: number) => {
    const k = posKey(i);
    if (!canon.has(k)) canon.set(k, i);
    return canon.get(k)!;
  };
  for (let f = 0; f < index.count; f += 3) {
    const a = index.getX(f);
    const b = index.getX(f + 1);
    const c = index.getX(f + 2);
    A.fromBufferAttribute(p, a);
    B.fromBufferAttribute(p, b);
    C.fromBufferAttribute(p, c);
    const centre = A.clone().add(B).add(C).multiplyScalar(1 / 3);
    const tri: [number, number][] = [
      [a, b],
      [b, c],
      [c, a],
    ];
    if (inside(centre)) {
      for (const [x, y] of tri) removedEdges.add(key(id(x), id(y)));
    } else {
      keep.push(a, b, c);
      for (const [x, y] of tri) {
        const k = key(id(x), id(y));
        const prev = keptEdges.get(k);
        keptEdges.set(k, prev ? [prev[0], prev[1], prev[2] + 1] : [x, y, 1]);
      }
    }
  }
  g.setIndex(keep);
  const rim: number[] = [];
  const rimN: number[] = [];
  const P = new THREE.Vector3();
  const Q = new THREE.Vector3();
  const NP = new THREE.Vector3();
  const NQ = new THREE.Vector3();
  for (const [k, [a, b, count]] of keptEdges) {
    if (count !== 1 || !removedEdges.has(k)) continue;
    P.fromBufferAttribute(p, a);
    Q.fromBufferAttribute(p, b);
    NP.fromBufferAttribute(n, a);
    NQ.fromBufferAttribute(n, b);
    const P2 = P.clone().addScaledVector(NP, -depth);
    const Q2 = Q.clone().addScaledVector(NQ, -depth);
    rim.push(...P.toArray(), ...Q.toArray(), ...Q2.toArray(), ...P.toArray(), ...Q2.toArray(), ...P2.toArray());
    rimN.push(...NP.toArray(), ...NQ.toArray(), ...NQ.toArray(), ...NP.toArray(), ...NQ.toArray(), ...NP.toArray());
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.Float32BufferAttribute(rim, 3));
  // the rim takes the skin's normals so it is lit evenly
  r.setAttribute('normal', new THREE.Float32BufferAttribute(rimN, 3));
  const col = new THREE.Color(rimColor);
  const cols = new Float32Array(rim.length);
  for (let i = 0; i < rim.length; i += 3) cols.set([col.r, col.g, col.b], i);
  r.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return r;
}

/**
 * Overlapping-scale pattern on a diagonal (rhombic) lattice, as on a fish's
 * flank: returns 1 on the arc-shaped free (hind, −x) edge of each scale.
 */
export function scaleEdge(x: number, y: number, size: number) {
  const u = (x + y) / size;
  const v = (x - y) / size;
  const fu = u - Math.floor(u);
  const fv = v - Math.floor(v);
  // local offset from the scale centre, in units of `size`
  const dx = (fu + fv - 1) / 2;
  const dy = (fu - fv) / 2;
  // free edge: arc around a point in front of the centre
  const d = Math.hypot(dx - 0.32, dy);
  return dx < 0.25 ? Math.exp(-(((d - 0.62) / 0.09) ** 2)) : 0;
}
