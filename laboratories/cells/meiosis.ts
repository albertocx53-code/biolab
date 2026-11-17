/**
 * Schematic meiosis model (2n = 4 → four haploid cells): mesh definitions plus
 * a pure pose function for a continuous phase value P
 * (0 interphase · 1 prophase I · 2 metaphase I · 3 anaphase I · 4 telophase I /
 * cytokinesis I · 5 prophase II · 6 metaphase II · 7 anaphase II ·
 * 8 telophase II / cytokinesis II · 9 end).
 *
 * Chromosome c ∈ 0..3: pair = ⌊c/2⌋ (pair 0 long, pair 1 short), origin = c mod 2
 * (0 maternal, red · 1 paternal, blue). Each chromosome has sister chromatids
 * a/b; the tip of every chromatid is a separate mesh in both colours so the
 * crossing-over in prophase I can swap tips between homologues.
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import { ellipsoid, inside, merge, paint, rng, scaled, tangle, tube, wall, type Cut, type DistFn } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { paintMembrane } from './mitosis';

export const MEIOSIS_CUT: Cut = { center: 0.35, width: Math.PI / 2 };
const CELL_R = 1.25;
const NUC_R = 0.6;
const POLE = 1.0;
/** Daughter cells (after meiosis I) sit at ±DX on x; the second division runs along y, so the four cells form a 2 × 2 grid facing the camera. */
const DX = 0.82;
const DZ = 0.6;
const R1 = 0.8; // daughter radius
const R2 = 0.56; // granddaughter radius
const SEG: [number, number] = [64, 36];

export const MEIOSIS_PRESET: CameraPreset = { position: [1.2, 1.9, 6.4], target: [0, -0.45, 0], distance: 6.8, minDistance: 0.3, maxDistance: 15 };

/** Cell outline of radius R, elongated/pinched along `axis` (0–1 each). */
export function meiosisShape(R: number, axis: 'x' | 'y', elong: number, pinch: number): DistFn {
  return (d) => {
    const u = axis === 'x' ? d.x : d.y;
    const u2 = u * u;
    const stretch = 1 + 0.32 * elong * u2;
    const waist = 1 - 0.78 * pinch * Math.pow(1 - u2, 3);
    return R * stretch * waist;
  };
}

interface Chrom {
  pair: 0 | 1;
  origin: 0 | 1;
  len: number;
  prophase: THREE.Vector3;
  tilt: THREE.Quaternion;
}

export interface FiberSpec {
  id: string;
  /** Which spindle this fibre belongs to. */
  stage: 1 | 2;
  cell: 'm' | 'a' | 'b';
  pole: -1 | 1;
  target: { chrom: number; side?: 'a' | 'b' } | { free: THREE.Vector3 } | { aster: THREE.Vector3 };
}

export interface MeiosisModel {
  meshes: MeshDef[];
  chromosomes: Chrom[];
  fibers: FiberSpec[];
}

export const MEIOSIS_MEMBRANES = ['membrana-plasmatica', 'membrana-a', 'membrana-b', 'membrana-a1', 'membrana-a2', 'membrana-b1', 'membrana-b2'] as const;

export function buildMeiosis(): MeiosisModel {
  const r = rng(91);
  const meshes: MeshDef[] = [];
  meshes.push({ id: 'membrana-plasmatica', structure: 'membrana-plasmatica', geometry: paintMembrane(wall(meiosisShape(CELL_R, 'x', 0, 0), 0.975, MEIOSIS_CUT, SEG), SEG[1]) });
  for (const id of ['membrana-a', 'membrana-b']) meshes.push({ id, structure: 'membrana-plasmatica', geometry: paintMembrane(wall(meiosisShape(R1, 'y', 0, 0), 0.97, MEIOSIS_CUT, SEG), SEG[1]) });
  for (const id of ['membrana-a1', 'membrana-a2', 'membrana-b1', 'membrana-b2']) meshes.push({ id, structure: 'membrana-plasmatica', geometry: paintMembrane(wall(meiosisShape(R2, 'y', 0, 0), 0.965, MEIOSIS_CUT, SEG), SEG[1]) });

  const nd = ellipsoid(NUC_R, NUC_R * 0.92, NUC_R);
  const env = (radius: number) => paint(wall(scaled(nd, radius / NUC_R), 0.93, MEIOSIS_CUT, [40, 24]), '#8C6BC4');
  meshes.push({ id: 'envoltorio-nuclear', structure: 'envoltorio-nuclear', geometry: env(NUC_R) });
  for (const id of ['envoltorio-a', 'envoltorio-b']) meshes.push({ id, structure: 'envoltorio-nuclear', geometry: env(0.38) });
  for (const id of ['envoltorio-a1', 'envoltorio-a2', 'envoltorio-b1', 'envoltorio-b2']) meshes.push({ id, structure: 'envoltorio-nuclear', geometry: env(0.26) });

  const strands: THREE.BufferGeometry[] = [];
  for (let s = 0; s < 4; s++) {
    const pts = tangle(r, r.dir().multiplyScalar(NUC_R * 0.4), 60, NUC_R * 0.1, (p) => inside(nd, p, 0.85));
    strands.push(tube(pts, 0.012, false, pts.length * 5, 5));
  }
  meshes.push({ id: 'cromatina', structure: 'cromatina', geometry: merge(strands) });

  const chromosomes: Chrom[] = [0, 1, 2, 3].map((c) => ({
    pair: (c >> 1) as 0 | 1,
    origin: (c & 1) as 0 | 1,
    len: c < 2 ? 0.36 : 0.22,
    prophase: r.dir().multiplyScalar(NUC_R * r.range(0.25, 0.5)),
    tilt: new THREE.Quaternion().setFromEuler(new THREE.Euler(r.range(0, 3), r.range(0, 3), r.range(0, 3))),
  }));
  chromosomes.forEach((c, i) => {
    const cls = c.origin ? 'cromatide-irma-b' : 'cromatide-irma';
    for (const side of ['a', 'b'] as const) {
      // body (centromere to the lower tip) + swappable upper tip in both colours
      const body = new THREE.CapsuleGeometry(0.045, c.len * 0.62, 6, 12);
      body.translate(0, -c.len * 0.19, 0);
      meshes.push({ id: `cromatide-${i + 1}${side}`, structure: 'cromossomos-homologos', cls, geometry: body });
      for (const col of ['r', 'b'] as const) {
        const tip = new THREE.CapsuleGeometry(0.045, c.len * 0.3, 6, 12);
        tip.translate(0, c.len * 0.35, 0);
        meshes.push({ id: `ponta-${i + 1}${side}-${col}`, structure: 'cromatide-irma', cls: col === 'r' ? 'cromatide-irma' : 'cromatide-irma-b', geometry: tip });
      }
      meshes.push({ id: `centromero-${i + 1}${side}`, structure: 'centromero', geometry: new THREE.IcosahedronGeometry(0.058, 2) });
    }
  });
  for (const p of [1, 2]) meshes.push({ id: `quiasma-${p}`, structure: 'quiasma', geometry: new THREE.TorusGeometry(0.075, 0.016, 8, 24) });

  const centro = () => {
    const c1 = new THREE.CylinderGeometry(0.032, 0.032, 0.11, 12);
    const c2 = new THREE.CylinderGeometry(0.032, 0.032, 0.11, 12);
    c2.rotateX(Math.PI / 2);
    c2.translate(0, -0.045, 0.045);
    return merge([c1, c2]);
  };
  for (const id of ['centrossomo-a', 'centrossomo-b', 'centrossomo-a1', 'centrossomo-a2', 'centrossomo-b1', 'centrossomo-b2']) meshes.push({ id, structure: 'centrossomo', geometry: centro() });

  const fibers: FiberSpec[] = [];
  // meiosis I: one kinetochore fibre per chromosome (sister kinetochores face the same pole)
  chromosomes.forEach((c, i) => {
    const pole = (c.pair === 0 ? (c.origin ? 1 : -1) : c.origin ? -1 : 1) as -1 | 1;
    fibers.push({ id: `fuso1-k${i + 1}`, stage: 1, cell: 'm', pole, target: { chrom: i } });
  });
  for (let i = 0; i < 6; i++) {
    const pole = (i % 2 ? 1 : -1) as -1 | 1;
    const a = (i / 6) * Math.PI * 2;
    fibers.push({ id: `fuso1-p${i + 1}`, stage: 1, cell: 'm', pole, target: { free: new THREE.Vector3(-pole * 0.18, Math.cos(a) * 0.36, Math.sin(a) * 0.36) } });
  }
  for (let i = 0; i < 8; i++) {
    const pole = (i % 2 ? 1 : -1) as -1 | 1;
    const a = (i / 8) * Math.PI * 2;
    fibers.push({ id: `fuso1-a${i + 1}`, stage: 1, cell: 'm', pole, target: { aster: new THREE.Vector3(pole * 0.75, Math.cos(a), Math.sin(a)).normalize() } });
  }
  // meiosis II: in each daughter cell, a fibre per chromatid (spindle along z)
  for (const cell of ['a', 'b'] as const) {
    chromosomes.forEach((_, i) => {
      fibers.push({ id: `fuso2-${cell}-k${i + 1}a`, stage: 2, cell, pole: -1, target: { chrom: i, side: 'a' } });
      fibers.push({ id: `fuso2-${cell}-k${i + 1}b`, stage: 2, cell, pole: 1, target: { chrom: i, side: 'b' } });
    });
    for (let i = 0; i < 4; i++) {
      const pole = (i % 2 ? 1 : -1) as -1 | 1;
      const a = (i / 4) * Math.PI * 2 + 0.4;
      fibers.push({ id: `fuso2-${cell}-p${i + 1}`, stage: 2, cell, pole, target: { free: new THREE.Vector3(Math.cos(a) * 0.22, Math.sin(a) * 0.22, -pole * 0.12) } });
    }
  }
  for (const f of fibers) {
    const g = new THREE.CylinderGeometry(0.009, 0.009, 1, 5);
    g.translate(0, 0.5, 0);
    meshes.push({ id: f.id, structure: 'fuso-mitotico', geometry: g });
  }
  return { meshes, chromosomes, fibers };
}

const ss = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);
const Y = new THREE.Vector3(0, 1, 0);
const HIDE = 1e-4;

/** Which chromosome goes to which daughter cell after meiosis I. */
export const cellOf = (c: Chrom): 'a' | 'b' => ((c.pair === 0 ? c.origin : 1 - c.origin) ? 'b' : 'a');
const cellX = (cell: 'a' | 'b') => (cell === 'a' ? -DX : DX);

/** Writes the pose for phase P into the registered meshes. */
export function poseMeiosis(model: MeiosisModel, P: number, get: (id: string) => THREE.Mesh | undefined) {
  const set = (id: string, pos: THREE.Vector3, quat: THREE.Quaternion | null, scale: number | THREE.Vector3) => {
    const m = get(id);
    if (!m) return;
    m.position.copy(pos);
    if (quat) m.quaternion.copy(quat);
    if (typeof scale === 'number') m.scale.setScalar(Math.max(scale, HIDE));
    else m.scale.copy(scale);
    m.updateMatrixWorld();
  };
  const O = new THREE.Vector3();

  // ---- membranes: mother until cytokinesis I, two daughters until cytokinesis II, then four
  const splitI = P >= 4.85;
  const splitII = P >= 8.92;
  set('membrana-plasmatica', O, null, splitI ? HIDE : 1);
  for (const cell of ['a', 'b'] as const) {
    set(`membrana-${cell}`, new THREE.Vector3(cellX(cell), 0, 0), null, splitI && !splitII ? 1 : HIDE);
    for (const k of [1, 2]) set(`membrana-${cell}${k}`, new THREE.Vector3(cellX(cell), k === 1 ? -DZ : DZ, 0), null, splitII ? 1 : HIDE);
  }

  // ---- nuclear envelopes and chromatin
  const envBreak = ss(1.3, 1.9, P);
  set('envoltorio-nuclear', O, null, 1 - envBreak);
  set('cromatina', O, null, 1 - ss(0.8, 1.35, P));
  const reformI = ss(4.0, 4.7, P) * (1 - ss(5.1, 5.6, P));
  for (const cell of ['a', 'b'] as const) set(`envoltorio-${cell}`, new THREE.Vector3(cellX(cell) * 0.95, 0, 0), null, reformI);
  const reformII = ss(8.0, 8.8, P);
  for (const cell of ['a', 'b'] as const) for (const k of [1, 2]) set(`envoltorio-${cell}${k}`, new THREE.Vector3(cellX(cell), (k === 1 ? -DZ : DZ) * 0.95, 0), null, reformII);

  // ---- centrosomes: migrate to the x poles in prophase I, then to the z poles of each daughter in prophase II
  const migI = ss(0.9, 1.9, P);
  const toCell = ss(4.2, 4.9, P);
  const migII = ss(5.0, 5.9, P);
  const stretchI = 1 + 0.16 * ss(3, 4, P);
  for (const cell of ['a', 'b'] as const) {
    const side = cell === 'a' ? -1 : 1;
    const a = THREE.MathUtils.lerp(Math.PI / 2 + side * 0.15, side < 0 ? Math.PI : 0, migI);
    const radius = THREE.MathUtils.lerp(NUC_R + 0.12, POLE, migI);
    const pI = new THREE.Vector3(Math.cos(a) * radius * stretchI, Math.sin(a) * radius, 0);
    const home = new THREE.Vector3(cellX(cell), 0, 0.35);
    const pos = pI.lerp(home, toCell);
    // the single centrosome duplicates: the pair appears in front of the nucleus and migrates to ±y
    const stretchII = 1 + 0.18 * ss(7, 8, P);
    for (const k of [1, 2]) {
      const dy = (k === 1 ? -1 : 1) * THREE.MathUtils.lerp(0.06, DZ * 0.95 * stretchII, migII);
      const p = pos.clone();
      p.y += dy;
      p.z = THREE.MathUtils.lerp(pos.z, 0, migII);
      set(`centrossomo-${cell}${k}`, p, null, k === 1 || migII > 0 ? 1 : HIDE);
    }
    set(`centrossomo-${cell}`, pos, null, HIDE); // kept for legacy ids (not drawn)
  }
  const poleI = (side: -1 | 1) => get(`centrossomo-${side < 0 ? 'a' : 'b'}1`)?.position.clone() ?? new THREE.Vector3(side * POLE, 0, 0);
  const poleII = (cell: 'a' | 'b', side: -1 | 1) => get(`centrossomo-${cell}${side < 0 ? 1 : 2}`)?.position.clone() ?? new THREE.Vector3(cellX(cell), side * DZ, 0);

  // ---- chromosomes
  const condense = ss(0.85, 1.5, P);
  const synapsis = ss(1.35, 1.85, P); // homologues pair up
  const toPlateI = ss(1.9, 2.3, P);
  const sepI = ss(3.0, 4.0, P);
  const settleI = ss(4.0, 4.9, P);
  const toPlateII = ss(5.9, 6.4, P);
  const sepII = ss(7.0, 8.0, P);
  const decondense = ss(8.3, 9.0, P);
  const crossed = ss(1.55, 1.75, P); // moment of the exchange
  const chiasma = ss(1.5, 1.75, P) * (1 - ss(3.0, 3.4, P));
  const thick = condense * (1 - 0.55 * decondense);

  model.chromosomes.forEach((c, i) => {
    const cell = cellOf(c);
    const cx = cellX(cell);
    const pairY = c.pair === 0 ? 0.3 : -0.3; // bivalent position on the metaphase I plate
    // homologues side by side along x at the plate; which side depends on the pair (independent assortment)
    const homX = (cell === 'a' ? -1 : 1) * 0.075;
    const pairPos = new THREE.Vector3(homX * 0.6, pairY, 0); // synapsis: close together
    const plateI = new THREE.Vector3(homX, pairY, 0);
    // after anaphase I the chromosome sits in its daughter cell; in metaphase II it aligns on that cell's plate (z = 0)
    const restI = new THREE.Vector3(cx * 0.9, pairY * 0.6, (c.pair === 0 ? 1 : -1) * 0.12);
    // metaphase II plate is the y = 0 plane of each daughter: chromosomes lie flat, one pair in front of the other
    const plateII = new THREE.Vector3(cx, 0.02, c.pair === 0 ? 0.2 : -0.2);

    let base = c.prophase.clone().lerp(pairPos, synapsis).lerp(plateI, toPlateI);
    base = base.lerp(restI, sepI);
    base = base.lerp(plateII, toPlateII);
    const qProphase = c.tilt;
    const qPlate = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), c.origin ? 0.1 : -0.1);
    const qPlateII = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2 + (c.pair === 0 ? 0.12 : -0.12));
    const q = qProphase.clone().slerp(qPlate, Math.max(synapsis, toPlateI)).slerp(qPlateII, toPlateII);

    for (const side of ['a', 'b'] as const) {
      const sgn = side === 'a' ? -1 : 1;
      const pos = base.clone();
      // sisters side by side along z (meiosis I), then along y (meiosis II) — the pair splits along y in anaphase II
      const sisterDir = new THREE.Vector3(0, 0, sgn * 0.052).lerp(new THREE.Vector3(0, sgn * 0.052, 0), toPlateII);
      const sisterOffset = sisterDir.applyQuaternion(q.clone().slerp(new THREE.Quaternion(), Math.max(toPlateI, toPlateII)));
      pos.add(sisterOffset);
      const targetII = new THREE.Vector3(plateII.x, sgn * DZ * 0.8, plateII.z * 0.6);
      pos.lerp(targetII, sepII);
      const sc = new THREE.Vector3(thick, Math.max(thick, HIDE), thick);
      set(`cromatide-${i + 1}${side}`, pos, q, sc);
      set(`centromero-${i + 1}${side}`, pos, null, thick);
      // crossing-over: the inner chromatid of each homologue (side 'b' of maternal, side 'a' of paternal) swaps its tip
      const swaps = (c.origin === 0 && side === 'b') || (c.origin === 1 && side === 'a');
      const ownColor = c.origin ? 'b' : 'r';
      const otherColor = c.origin ? 'r' : 'b';
      const showOther = swaps ? crossed : 0;
      set(`ponta-${i + 1}${side}-${ownColor}`, pos, q, new THREE.Vector3(thick, thick * (1 - showOther) + HIDE, thick));
      set(`ponta-${i + 1}${side}-${otherColor}`, pos, q, new THREE.Vector3(thick, thick * showOther + HIDE, thick));
    }
  });
  // chiasmata: rings at the crossing point of each bivalent while the homologues are joined
  for (const pair of [0, 1] as const) {
    const y = (pair === 0 ? 0.3 : -0.3) + (pair === 0 ? 0.36 : 0.22) * 0.33;
    const pos = new THREE.Vector3(0, y, 0);
    const qq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    set(`quiasma-${pair + 1}`, pos, qq, chiasma);
  }

  // ---- spindles
  const spindleI = ss(1.4, 2.0, P) * (1 - ss(4.0, 4.5, P));
  const spindleII = ss(5.6, 6.2, P) * (1 - ss(8.0, 8.5, P));
  for (const f of model.fibers) {
    const vis = f.stage === 1 ? spindleI : spindleII;
    const from = f.stage === 1 ? poleI(f.pole) : poleII(f.cell as 'a' | 'b', f.pole);
    let to: THREE.Vector3;
    if ('chrom' in f.target) {
      const side = f.target.side ?? (f.stage === 1 ? 'a' : 'a');
      const m = get(`centromero-${f.target.chrom + 1}${side}`);
      to = m ? m.position.clone() : from.clone();
      if (f.stage === 1 && !f.target.side) {
        const mb = get(`centromero-${f.target.chrom + 1}b`);
        if (mb) to.lerp(mb.position, 0.5);
      }
      // only fibres of this cell's chromosomes exist in meiosis II
      if (f.stage === 2 && cellOf(model.chromosomes[f.target.chrom]) !== f.cell) {
        set(f.id, from, null, HIDE);
        continue;
      }
    } else if ('aster' in f.target) {
      to = from.clone().addScaledVector(f.target.aster, 0.2);
    } else {
      to = f.target.free.clone();
      if (f.stage === 2) {
        to.set(to.x, to.z, to.y).add(new THREE.Vector3(cellX(f.cell as 'a' | 'b'), 0, 0));
        to.y += -f.pole * 0.1 * sepII;
      } else to.x += -f.pole * 0.12 * sepI;
    }
    const dir = to.clone().sub(from);
    const len = Math.max(dir.length() * vis, HIDE);
    set(f.id, from, new THREE.Quaternion().setFromUnitVectors(Y, dir.normalize()), new THREE.Vector3(vis || HIDE, len, vis || HIDE));
  }
}

/** Shape of every membrane mesh for phase P (only the ones that change). */
export function meiosisMembraneShapes(P: number): Record<string, DistFn> {
  return {
    'membrana-plasmatica': meiosisShape(CELL_R, 'x', ss(3, 4.4, P), ss(4.3, 4.85, P)),
    'membrana-a': meiosisShape(R1, 'y', ss(7, 8.4, P), ss(8.4, 8.92, P)),
    'membrana-b': meiosisShape(R1, 'y', ss(7, 8.4, P), ss(8.4, 8.92, P)),
  };
}

/** Rewrites a membrane geometry in place (same topology as `wall`). */
export function deformMeiosisMembrane(geo: THREE.BufferGeometry, shape: DistFn, kInner: number) {
  const fresh = wall(shape, kInner, MEIOSIS_CUT, SEG);
  const src = fresh.getAttribute('position');
  const dst = geo.getAttribute('position') as THREE.BufferAttribute;
  (dst.array as Float32Array).set(src.array as Float32Array);
  dst.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  geo.computeBoundingSphere();
  fresh.dispose();
}
