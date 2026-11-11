/**
 * Procedural shapes for the Plants laboratory: blades (leaves, petals,
 * sepals), tapered stems and roots, and annular sectors for tissue
 * cross-sections. All original geometry created for BioLab 3D.
 */
import * as THREE from 'three';

/** Grid surface from a parametric function (u, v in [0, 1]). Double-sided materials are used. */
export function surface(fn: (u: number, v: number, out: THREE.Vector3) => void, us = 24, vs = 12) {
  const pos: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  for (let j = 0; j <= vs; j++)
    for (let i = 0; i <= us; i++) {
      fn(i / us, j / vs, p);
      pos.push(p.x, p.y, p.z);
    }
  const row = us + 1;
  for (let j = 0; j < vs; j++)
    for (let i = 0; i < us; i++) {
      const a = j * row + i;
      idx.push(a, a + row, a + 1, a + row, a + row + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export interface BladeOpts {
  length: number;
  width: number;
  /** Bend of the midrib (positive bends down, towards -Y). */
  droop?: number;
  /** Cupping across the blade (positive lifts the margins). */
  cup?: number;
  /** Outline: 0 = ovate leaf, 1 = rounded petal (wide near the tip). */
  shape?: 'leaf' | 'petal' | 'sepal';
  /** Tip twist (rad). */
  twist?: number;
}

/**
 * Blade lying along +Z from the origin, facing +Y. `at(u, s)` gives a point
 * at fraction u of the length and s in [-1, 1] across the width.
 */
export function blade(o: BladeOpts) {
  const droop = o.droop ?? 0;
  const cup = o.cup ?? 0;
  const half = (u: number) => {
    if (o.shape === 'petal') return o.width * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.62 + 0.05)), 1.2) * Math.min(1, u * 4 + 0.15);
    if (o.shape === 'sepal') return o.width * Math.sin(Math.PI * u) ** 0.8 * (1 - 0.45 * u);
    return o.width * Math.pow(Math.sin(Math.PI * u), 0.85) * (1 - 0.25 * u);
  };
  const at = (u: number, s: number, out = new THREE.Vector3()) => {
    const w = half(u);
    const z = u * o.length;
    const x = s * w;
    const y = -droop * u * u * o.length + cup * s * s * w;
    const tw = (o.twist ?? 0) * u;
    return out.set(x * Math.cos(tw), y + x * Math.sin(tw) * 0.3, z);
  };
  const geo = surface((u, v, out) => at(u, v * 2 - 1, out), 26, 10);
  return { geo, at };
}

/** Tube with varying radius along a curve (stems, roots, filaments). */
export function taper(points: THREE.Vector3[], r0: number, r1: number, segs = 0, radial = 8, capEnd = true) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const n = segs || Math.max(8, points.length * 6);
  const frames = curve.computeFrenetFrames(n, false);
  const pos: number[] = [];
  const idx: number[] = [];
  const p = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    curve.getPointAt(t, p);
    const r = THREE.MathUtils.lerp(r0, r1, t);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      pos.push(p.x + r * (c * N.x + s * B.x), p.y + r * (c * N.y + s * B.y), p.z + r * (c * N.z + s * B.z));
    }
  }
  const row = radial + 1;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * row + j;
      idx.push(a, a + row, a + 1, a + row, a + row + 1, a + 1);
    }
  if (capEnd) {
    // rounded-ish tip: a centre vertex slightly beyond the last ring
    const last = curve.getPointAt(1);
    const tan = curve.getTangentAt(1);
    const tip = last.clone().addScaledVector(tan, r1 * 1.2);
    const ti = pos.length / 3;
    pos.push(tip.x, tip.y, tip.z);
    const base = n * row;
    for (let j = 0; j < radial; j++) idx.push(base + j, ti, base + j + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * Closed annular sector along Y: r in [r0, r1], angle in [a0, a1] (rad, from
 * +Z towards +X), y in [y0, y1]. r0 = 0 gives a pie slice.
 */
export function sector(r0: number, r1: number, a0: number, a1: number, y0: number, y1: number, seg = 0) {
  const n = seg || Math.max(3, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 64));
  const geos: THREE.BufferGeometry[] = [];
  const P = (r: number, a: number, y: number) => new THREE.Vector3(r * Math.sin(a), y, r * Math.cos(a));
  const quad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, pos: number[]) => {
    pos.push(...a.toArray(), ...b.toArray(), ...c.toArray(), ...a.toArray(), ...c.toArray(), ...d.toArray());
  };
  const pos: number[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = a0 + ((a1 - a0) * i) / n;
    const t1 = a0 + ((a1 - a0) * (i + 1)) / n;
    // outer wall
    quad(P(r1, t0, y0), P(r1, t1, y0), P(r1, t1, y1), P(r1, t0, y1), pos);
    // inner wall
    if (r0 > 0) quad(P(r0, t1, y0), P(r0, t0, y0), P(r0, t0, y1), P(r0, t1, y1), pos);
    // top and bottom
    quad(P(r0, t0, y1), P(r1, t0, y1), P(r1, t1, y1), P(r0, t1, y1), pos);
    quad(P(r0, t1, y0), P(r1, t1, y0), P(r1, t0, y0), P(r0, t0, y0), pos);
  }
  // radial end faces
  quad(P(r0, a0, y0), P(r1, a0, y0), P(r1, a0, y1), P(r0, a0, y1), pos);
  quad(P(r1, a1, y0), P(r0, a1, y0), P(r0, a1, y1), P(r1, a1, y1), pos);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  geos.push(g);
  return g;
}

/** Angular range left after removing a wedge of `width` centred on `center`. */
export function keptRange(center: number, width: number): [number, number] {
  return [center + width / 2, center + Math.PI * 2 - width / 2];
}

/** Clips [a0, a1] (any winding) to the kept range; null when fully removed. */
export function clipArc(a0: number, a1: number, kept: [number, number]): [number, number] | null {
  const TAU = Math.PI * 2;
  let s = a0;
  while (s < kept[0]) s += TAU;
  while (s >= kept[0] + TAU) s -= TAU;
  const e = s + (a1 - a0);
  const lo = Math.max(s, kept[0]);
  const hi = Math.min(e, kept[1]);
  return hi - lo > 1e-3 ? [lo, hi] : null;
}

/** Rounded box cell (superellipsoid) as a closed surface. */
export function roundBox(a: number, b: number, c: number, n = 4, seg: [number, number] = [14, 10]) {
  const [us, vs] = seg;
  return surface(
    (u, v, out) => {
      const phi = u * Math.PI * 2;
      const th = v * Math.PI;
      const d = new THREE.Vector3(Math.sin(th) * Math.sin(phi), Math.cos(th), Math.sin(th) * Math.cos(phi));
      const k = 1 / Math.pow(Math.abs(d.x / a) ** n + Math.abs(d.y / b) ** n + Math.abs(d.z / c) ** n, 1 / n);
      out.copy(d).multiplyScalar(k);
    },
    us,
    vs,
  );
}
