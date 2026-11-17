/**
 * Schematic mitosis model (2n = 4): mesh definitions plus a pure pose function
 * that places every part for a continuous phase value P
 * (0 interphase · 1 prophase · 2 metaphase · 3 anaphase · 4 telophase · 5 cytokinesis · 6 end).
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import { ellipsoid, inside, merge, paint, rng, scaled, tangle, tube, wall, type Cut, type DistFn } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';

export const MITOSIS_CUT: Cut = { center: 0.35, width: Math.PI / 2 };
const CELL_R = 1.25;
const NUC_R = 0.62;
const POLE = 1.02;

export const MITOSIS_PRESET: CameraPreset = { position: [1.4, 1.55, 6.0], target: [0, -0.5, 0], distance: 6.4, minDistance: 0.3, maxDistance: 14 };

/** Cell outline for a given elongation (0–1) and cleavage pinch (0–1). */
export function cellShape(elong: number, pinch: number): DistFn {
  return (d) => {
    const x2 = d.x * d.x;
    const stretch = 1 + 0.32 * elong * x2;
    const waist = 1 - 0.78 * pinch * Math.pow(1 - x2, 3);
    return CELL_R * stretch * waist;
  };
}

interface Chromosome {
  len: number;
  cls: 'cromatide-irma' | 'cromatide-irma-b';
  prophase: THREE.Vector3;
  tilt: THREE.Quaternion;
  plate: THREE.Vector3; // metaphase position (x = 0)
}

export interface MitosisModel {
  meshes: MeshDef[];
  chromosomes: Chromosome[];
  fibers: { id: string; pole: -1 | 1; target: { chrom: number; side: 'a' | 'b' } | { free: THREE.Vector3 } | { aster: THREE.Vector3 } }[];
  membraneRows: [number, number];
}

const SEG: [number, number] = [72, 40];

/** Two-tone membrane colour (outer darker, inner lighter) baked as vertex colours; survives in-place deformation. */
export function paintMembrane(g: THREE.BufferGeometry, hs = SEG[1]) {
  const pos = g.getAttribute('position');
  const n = pos.count;
  const arr = new Float32Array(n * 3);
  const outer = new THREE.Color('#DFA384');
  const inner = new THREE.Color('#F4D6C2');
  // `wall` merges outer shell, inner shell, then cut faces: the first half of the shell vertices is the outer surface
  const shellCount = Math.floor((n - (hs + 1) * 4) / 2);
  for (let i = 0; i < n; i++) {
    const c = i < shellCount ? outer : i < shellCount * 2 ? inner : outer;
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

export function buildMitosis(): MitosisModel {
  const r = rng(77);
  const meshes: MeshDef[] = [];
  const shape = cellShape(0, 0);
  meshes.push({ id: 'membrana-plasmatica', structure: 'membrana-plasmatica', geometry: paintMembrane(wall(shape, 0.975, MITOSIS_CUT, SEG)) });

  const nd = ellipsoid(NUC_R, NUC_R * 0.92, NUC_R);
  const env = (radius: number) => paint(wall(scaled(nd, radius / NUC_R), 0.93, MITOSIS_CUT, [48, 28]), '#8C6BC4');
  meshes.push({ id: 'envoltorio-nuclear', structure: 'envoltorio-nuclear', geometry: env(NUC_R) });
  meshes.push({ id: 'envoltorio-nuclear-a', structure: 'envoltorio-nuclear', geometry: env(0.4) });
  meshes.push({ id: 'envoltorio-nuclear-b', structure: 'envoltorio-nuclear', geometry: env(0.4) });

  const strands: THREE.BufferGeometry[] = [];
  for (let s = 0; s < 4; s++) {
    const pts = tangle(r, r.dir().multiplyScalar(NUC_R * 0.4), 60, NUC_R * 0.1, (p) => inside(nd, p, 0.85));
    strands.push(tube(pts, 0.012, false, pts.length * 5, 5));
  }
  meshes.push({ id: 'cromatina', structure: 'cromatina', geometry: merge(strands) });

  const lens = [0.34, 0.34, 0.2, 0.2];
  const PLATE: [number, number][] = [
    [0.3, -0.24],
    [0.3, 0.26],
    [-0.3, -0.22],
    [-0.3, 0.24],
  ];
  const chromosomes: Chromosome[] = lens.map((len, i) => ({
    len,
    cls: i % 2 ? 'cromatide-irma-b' : 'cromatide-irma',
    prophase: r.dir().multiplyScalar(NUC_R * r.range(0.25, 0.5)),
    tilt: new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(0, 3), r.range(0, 3), r.range(0, 3))),
    plate: new THREE.Vector3(0, PLATE[i][0], PLATE[i][1]),
  }));
  chromosomes.forEach((c, i) => {
    for (const side of ['a', 'b'] as const) {
      const g = new THREE.CapsuleGeometry(0.045, c.len, 6, 12);
      meshes.push({ id: `cromatide-${i + 1}${side}`, structure: 'cromatide-irma', cls: c.cls, geometry: g });
      meshes.push({ id: `centromero-${i + 1}${side}`, structure: 'centromero', geometry: new THREE.IcosahedronGeometry(0.058, 2) });
    }
  });

  // centrosomes: a pair of centrioles each
  for (const side of ['a', 'b'] as const) {
    const parts: THREE.BufferGeometry[] = [];
    const c1 = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12);
    const c2 = new THREE.CylinderGeometry(0.035, 0.035, 0.12, 12);
    c2.rotateX(Math.PI / 2);
    c2.translate(0, -0.05, 0.05);
    parts.push(c1, c2);
    meshes.push({ id: `centrossomo-${side}`, structure: 'centrossomo', geometry: merge(parts) });
  }

  // spindle fibres: unit cylinders stretched between two points each frame
  const fibers: MitosisModel['fibers'] = [];
  chromosomes.forEach((_, i) => {
    fibers.push({ id: `fuso-k${i + 1}a`, pole: -1, target: { chrom: i, side: 'a' } });
    fibers.push({ id: `fuso-k${i + 1}b`, pole: 1, target: { chrom: i, side: 'b' } });
  });
  for (let i = 0; i < 6; i++) {
    const pole = (i % 2 ? 1 : -1) as -1 | 1;
    const a = (i / 6) * Math.PI * 2;
    fibers.push({ id: `fuso-p${i + 1}`, pole, target: { free: new THREE.Vector3(-pole * 0.18, Math.cos(a) * 0.38, Math.sin(a) * 0.38) } });
  }
  for (let i = 0; i < 10; i++) {
    const pole = (i % 2 ? 1 : -1) as -1 | 1;
    const a = (i / 10) * Math.PI * 2;
    fibers.push({ id: `fuso-a${i + 1}`, pole, target: { aster: new THREE.Vector3(pole * 0.75, Math.cos(a), Math.sin(a)).normalize() } });
  }
  for (const f of fibers) {
    const g = new THREE.CylinderGeometry(0.009, 0.009, 1, 5);
    g.translate(0, 0.5, 0);
    meshes.push({ id: f.id, structure: 'fuso-mitotico', geometry: g });
  }
  return { meshes, chromosomes, fibers, membraneRows: SEG };
}

const ss = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);
const Y = new THREE.Vector3(0, 1, 0);
const _q = new THREE.Quaternion();

/** Writes the pose for phase P into the registered meshes. */
export function poseMitosis(model: MitosisModel, P: number, get: (id: string) => THREE.Mesh | undefined) {
  const set = (id: string, pos: THREE.Vector3, quat: THREE.Quaternion | null, scale: number | THREE.Vector3) => {
    const m = get(id);
    if (!m) return;
    m.position.copy(pos);
    if (quat) m.quaternion.copy(quat);
    if (typeof scale === 'number') m.scale.setScalar(Math.max(scale, 1e-4));
    else m.scale.copy(scale);
    m.updateMatrixWorld();
  };
  const origin = new THREE.Vector3();

  // nucleus: visible in interphase, breaks down during prophase
  const envBreak = ss(1.45, 1.95, P);
  set('envoltorio-nuclear', origin, null, 1 - envBreak);
  set('cromatina', origin, null, 1 - ss(0.85, 1.4, P));
  const reform = ss(4.0, 4.8, P);
  const split = ss(3.0, 4.0, P);
  const poleX = POLE * 0.76;
  set('envoltorio-nuclear-a', new THREE.Vector3(-poleX, 0, 0), null, reform);
  set('envoltorio-nuclear-b', new THREE.Vector3(poleX, 0, 0), null, reform);

  // centrosomes: start together above the nucleus, migrate to the poles in prophase
  const migrate = ss(0.9, 1.9, P);
  for (const side of [-1, 1] as const) {
    const a = THREE.MathUtils.lerp(Math.PI / 2 + side * 0.15, side < 0 ? Math.PI : 0, migrate);
    const radius = THREE.MathUtils.lerp(NUC_R + 0.12, POLE, migrate);
    const anaphaseStretch = 1 + 0.16 * ss(3, 4, P);
    set(`centrossomo-${side < 0 ? 'a' : 'b'}`, new THREE.Vector3(Math.cos(a) * radius * anaphaseStretch, Math.sin(a) * radius, 0), null, 1);
  }
  const poleAt = (side: -1 | 1) => get(`centrossomo-${side < 0 ? 'a' : 'b'}`)?.position.clone() ?? new THREE.Vector3(side * POLE, 0, 0);

  // chromosomes
  const condense = ss(0.9, 1.6, P);
  const toPlate = ss(1.6, 2.2, P);
  const decondense = ss(4.2, 5.0, P);
  model.chromosomes.forEach((c, i) => {
    const base = c.prophase.clone().lerp(c.plate, toPlate);
    const qProphase = c.tilt;
    const qPlate = _q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), i % 2 ? 0.12 : -0.12).clone();
    const q = qProphase.clone().slerp(qPlate, toPlate);
    const thick = condense * (1 - decondense);
    for (const side of ['a', 'b'] as const) {
      const sgn = side === 'a' ? -1 : 1;
      const pos = base.clone();
      // sister chromatids side by side (along x at the plate), then pulled apart
      const offset = new THREE.Vector3(sgn * 0.055, 0, 0).applyQuaternion(q.clone().slerp(new THREE.Quaternion(), toPlate));
      pos.add(offset);
      const target = new THREE.Vector3(sgn * (POLE * 0.74), c.plate.y * 0.6, c.plate.z * 0.6);
      pos.lerp(target, split);
      const sc = new THREE.Vector3(thick, Math.max(thick, 1e-4) * (1 - 0.3 * decondense), thick);
      set(`cromatide-${i + 1}${side}`, pos, q, sc);
      set(`centromero-${i + 1}${side}`, pos, null, thick);
    }
  });

  // spindle: grows in prometaphase, kinetochore fibres shorten in anaphase, gone in telophase
  const spindle = ss(1.4, 2.0, P) * (1 - ss(4.0, 4.6, P));
  for (const f of model.fibers) {
    const from = poleAt(f.pole);
    let to: THREE.Vector3;
    if ('chrom' in f.target) {
      const m = get(`centromero-${f.target.chrom + 1}${f.target.side}`);
      to = m ? m.position.clone() : origin.clone();
    } else if ('aster' in f.target) {
      to = from.clone().addScaledVector(f.target.aster, 0.2);
    } else {
      to = f.target.free.clone();
      if (Math.abs(to.x) < 0.5) to.x += -f.pole * 0.12 * split; // polar fibres slide apart
    }
    const dir = to.clone().sub(from);
    const len = Math.max(dir.length() * spindle, 1e-4);
    set(f.id, from, new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize()), new THREE.Vector3(spindle || 1e-4, len, spindle || 1e-4));
  }
}

/** Membrane shape for phase P. */
export function membraneShape(P: number) {
  return cellShape(THREE.MathUtils.smoothstep(P, 3, 4.4), THREE.MathUtils.smoothstep(P, 4.4, 6));
}

/** Rewrites the membrane geometry in place (same topology as `wall`). */
export function deformMembrane(geo: THREE.BufferGeometry, shape: DistFn) {
  const fresh = wall(shape, 0.975, MITOSIS_CUT, SEG);
  const src = fresh.getAttribute('position');
  const dst = geo.getAttribute('position') as THREE.BufferAttribute;
  (dst.array as Float32Array).set(src.array as Float32Array);
  dst.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  fresh.dispose();
}

