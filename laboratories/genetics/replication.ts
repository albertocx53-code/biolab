/**
 * DNA replication at one replication fork, drawn as a flat ladder: the
 * helicase opens the double helix, primase lays RNA primers, DNA polymerase
 * builds the leading strand continuously and the lagging strand in Okazaki
 * fragments, the primers are replaced and DNA ligase seals the nicks. Each
 * daughter molecule keeps one parental strand (semiconservative replication).
 *
 * Phase value P: 0 start · 1 fork open · 2 primers · 3–4 elongation ·
 * 5 primers replaced and nicks sealed · 6 two daughter molecules.
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import { merge, paint, place } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { DNA_PAIR, HALF_RUNG, RNA_FROM_TEMPLATE, SPACING, ladderNucleotide, seq, textGeo, type Base, type StrandKind } from './kit';
import { colorize } from './materials';

export const REPLICATION_SEQUENCE = 'TACGGATCCATGCTAGGCATTC';
const N = REPLICATION_SEQUENCE.length;
export const REPLICATION_PRESET: CameraPreset = { position: [1.3, 0.5, 23], target: [1.0, 0, 0], distance: 23, minDistance: 2, maxDistance: 46 };
const HIDE = 1e-4;
/** Half distance between the two daughter molecules once apart. */
const D = 2.3;

export const xOf = (i: number) => (i - (N - 1) / 2) * SPACING;
const ss = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

/** Okazaki fragments on the lagging strand (index ranges, each built from right to left). */
export const FRAGMENTS: [number, number][] = [
  [0, 3],
  [4, 8],
  [9, 13],
  [14, 18],
  [19, 21],
];
const LEADING_PRIMER = [0, 1];

export interface ReplicationModel {
  meshes: MeshDef[];
}

function nucleotide(id: string, structure: string, base: Base, strand: StrandKind, dir: 1 | -1, label?: { text: string; side: -1 | 1 }): MeshDef {
  let g = ladderNucleotide(base, strand, dir);
  if (label) g = merge([g, paint(place(textGeo(label.text, 0.26, 0.04), [label.side * 0.62, 0, 0.1]), '#1E293B')]);
  return { id, structure, geometry: g };
}

function enzyme(id: string, structure: string, geo: THREE.BufferGeometry): MeshDef {
  return { id, structure, geometry: geo };
}

export function buildReplication(): ReplicationModel {
  const top = seq(REPLICATION_SEQUENCE); // template of the leading strand, 3'→5' from left to right
  const bottom = top.map((b) => DNA_PAIR[b]); // template of the lagging strand, 5'→3'
  const meshes: MeshDef[] = [];
  for (let i = 0; i < N; i++) {
    const end = i === 0 ? -1 : i === N - 1 ? 1 : 0;
    meshes.push(nucleotide(`pt-${i}`, 'fita-molde', top[i], 'antiga', -1, end ? { text: end < 0 ? "3'" : "5'", side: end as -1 | 1 } : undefined));
    meshes.push(nucleotide(`pb-${i}`, 'fita-molde', bottom[i], 'antiga', 1, end ? { text: end < 0 ? "5'" : "3'", side: end as -1 | 1 } : undefined));
    meshes.push(nucleotide(`nl-${i}`, 'fita-nova', DNA_PAIR[top[i]], 'nova', 1, end ? { text: end < 0 ? "5'" : "3'", side: end as -1 | 1 } : undefined));
    meshes.push(nucleotide(`ng-${i}`, 'fita-nova', DNA_PAIR[bottom[i]], 'nova', -1, end ? { text: end < 0 ? "3'" : "5'", side: end as -1 | 1 } : undefined));
  }
  for (const i of LEADING_PRIMER) meshes.push(nucleotide(`pl-${i}`, 'primer-rna', RNA_FROM_TEMPLATE[top[i]], 'primer', 1));
  for (const [, b] of FRAGMENTS) for (const i of [b, b - 1]) meshes.push(nucleotide(`pg-${i}`, 'primer-rna', RNA_FROM_TEMPLATE[bottom[i]], 'primer', -1));

  // enzymes (behind the DNA, so the bases stay readable)
  const hex: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    hex.push(place(new THREE.IcosahedronGeometry(0.36, 2), [0, Math.cos(a) * 0.72, Math.sin(a) * 0.72]));
  }
  meshes.push(enzyme('helicase', 'helicase', merge(hex)));
  meshes.push(enzyme('topoisomerase', 'topoisomerase', place(new THREE.TorusGeometry(0.62, 0.26, 12, 28), [0, 0, 0], new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2))));
  meshes.push(enzyme('primase', 'primase', place(new THREE.IcosahedronGeometry(0.5, 2), [0, 0, 0], undefined, new THREE.Vector3(1, 0.8, 0.8))));
  for (const s of ['lider', 'tardia']) meshes.push(enzyme(`dna-polimerase-${s}`, 'dna-polimerase', place(new THREE.IcosahedronGeometry(0.85, 3), [0, 0, 0], undefined, new THREE.Vector3(1.15, 0.95, 0.8))));
  meshes.push(enzyme('dna-ligase', 'dna-ligase', place(new THREE.IcosahedronGeometry(0.45, 2), [0, 0, 0], undefined, new THREE.Vector3(1, 0.85, 0.85))));
  colorize(meshes);
  return { meshes };
}

/** Fork position (x) for the phase P. */
export function forkX(P: number) {
  const start = xOf(0) - 0.9;
  const open = xOf(3) + SPACING * 0.6;
  const end = xOf(N - 1) + 1.2;
  if (P < 1) return start + (open - start) * ss(0, 1, P);
  if (P < 2) return open;
  return open + (end - open) * ss(2, 4, P);
}

/** How far behind the fork the polymerase of the leading strand is. */
const LAG = 1.3;
/** Leading strand: index reached by the polymerase. */
export function leadingReach(P: number) {
  if (P < 2) return -1;
  if (P >= 4) return N - 1;
  const x = forkX(P) - LAG;
  return Math.min(N - 1, Math.floor((x - xOf(0)) / SPACING + 1e-6));
}

/** Lagging strand: for fragment k, the phase at which its primer is laid and how many nucleotides are built. */
export function fragmentState(k: number, P: number) {
  const [a, b] = FRAGMENTS[k];
  // primer when the fork has passed the right end of the fragment
  let primedAt = 1.5;
  if (k > 0) {
    // invert forkX on 2..4: first P where forkX >= x(b) + 0.4
    const target = xOf(b) + 0.4;
    let lo = 2;
    let hi = 4;
    for (let i = 0; i < 30; i++) {
      const m = (lo + hi) / 2;
      if (forkX(m) >= target) hi = m;
      else lo = m;
    }
    primedAt = hi;
  }
  const buildStart = k === 0 ? 2 : primedAt + 0.12;
  const len = b - a + 1;
  const built = P < buildStart ? 0 : Math.min(len, Math.floor(((P - buildStart) / 0.55) * len + 1e-6) + 0);
  return { a, b, primedAt, built: k === FRAGMENTS.length - 1 && P >= 4 ? len : P >= 4.2 ? len : built };
}

/** Places every part for the phase P (0–6). `get` returns the registered mesh of an id. */
export function poseReplication(P: number, get: (id: string) => THREE.Object3D | undefined) {
  const fx = forkX(P);
  const apart = D + 0.8 * ss(5, 6, P);
  const sepAt = (x: number) => ss(0, 2.4, fx - x);
  const show = (id: string, on: boolean, x: number, y: number, z = 0) => {
    const m = get(id);
    if (!m) return;
    m.position.set(x, y, z);
    m.scale.setScalar(on ? 1 : HIDE);
  };
  const lead = leadingReach(P);
  const primersGone = ss(4.1, 4.7, P); // primers replaced by DNA during step 5
  for (let i = 0; i < N; i++) {
    const x = xOf(i);
    const s = sepAt(x) * apart;
    const yT = HALF_RUNG + s;
    const yB = -HALF_RUNG - s;
    show(`pt-${i}`, true, x, yT);
    show(`pb-${i}`, true, x, yB);
    // leading strand (pairs with the top template)
    const isLeadPrimer = LEADING_PRIMER.includes(i);
    const leadOn = isLeadPrimer ? P >= 4.4 : i <= lead;
    show(`nl-${i}`, leadOn, x, yT - 2 * HALF_RUNG);
    if (isLeadPrimer) show(`pl-${i}`, P >= 1.3 && primersGone < 0.5, x, yT - 2 * HALF_RUNG, 0.01);
  }
  // lagging strand, fragment by fragment
  FRAGMENTS.forEach((_, k) => {
    const f = fragmentState(k, P);
    for (let i = f.a; i <= f.b; i++) {
      const x = xOf(i);
      const s = sepAt(x) * apart;
      const y = -HALF_RUNG - s + 2 * HALF_RUNG;
      const isPrimer = i === f.b || i === f.b - 1;
      const builtHere = f.b - i < f.built;
      if (isPrimer) {
        show(`pg-${i}`, P >= f.primedAt && primersGone < 0.5, x, y, 0.01);
        show(`ng-${i}`, primersGone >= 0.5, x, y);
      } else show(`ng-${i}`, builtHere && P >= f.primedAt, x, y);
    }
  });

  // enzymes
  const enz = (id: string, on: number, x: number, y: number, z = -0.55) => {
    const m = get(id);
    if (!m) return;
    m.position.set(x, y, z);
    m.scale.setScalar(Math.max(HIDE, on));
  };
  const gone = 1 - ss(5, 5.5, P);
  enz('helicase', ss(0, 0.4, P) * gone, fx - 0.15, 0, -0.2);
  enz('topoisomerase', ss(0, 0.5, P) * gone * (fx < xOf(N - 1) - 0.4 ? 1 : 1 - ss(3.7, 4, P)), Math.min(fx + 2.2, xOf(N - 1) + 0.6), 0, -0.2);
  // primase visits each new primer for a short time
  let primX = xOf(1);
  let primY = 0;
  let primOn = P >= 1 && P < 2 ? ss(1, 1.3, P) : 0;
  if (P >= 1 && P < 2) {
    primX = P < 1.5 ? xOf(0.5) : xOf(FRAGMENTS[0][1] - 0.5);
    primY = P < 1.5 ? -HALF_RUNG * 0.1 + HALF_RUNG + sepAt(xOf(0)) * apart - 2 * HALF_RUNG : -HALF_RUNG - sepAt(xOf(FRAGMENTS[0][1])) * apart + 2 * HALF_RUNG;
  }
  FRAGMENTS.forEach((_, k) => {
    if (k === 0) return;
    const f = fragmentState(k, P);
    if (P >= f.primedAt - 0.12 && P < f.primedAt + 0.12) {
      primOn = 1;
      primX = xOf(f.b - 0.5);
      primY = -HALF_RUNG - sepAt(xOf(f.b)) * apart + 2 * HALF_RUNG;
    }
  });
  enz('primase', primOn, primX, primY - 0.6);
  // polymerase of the leading strand rides behind the fork
  const leadX = xOf(Math.max(0, lead)) + SPACING * 0.5;
  enz('dna-polimerase-lider', P >= 2 ? gone : 0, leadX, HALF_RUNG + sepAt(leadX) * apart - 1.2);
  // polymerase of the lagging strand: on the fragment being built
  let lagOn = 0;
  let lagX = xOf(0);
  let lagY = 0;
  FRAGMENTS.forEach((_, k) => {
    const f = fragmentState(k, P);
    const len = f.b - f.a + 1;
    if (f.built > 0 && f.built < len + 1 && P >= f.primedAt && P < 4.25 && (f.built < len || k === FRAGMENTS.length - 1)) {
      lagOn = 1;
      lagX = xOf(f.b - Math.min(f.built, len - 1));
      lagY = -HALF_RUNG - sepAt(lagX) * apart + 1.2;
    }
  });
  enz('dna-polimerase-tardia', lagOn * gone, lagX, lagY);
  // ligase seals the nicks between fragments one after the other during step 5
  const nicks = FRAGMENTS.slice(1).map(([a]) => a - 0.5);
  nicks.unshift(1.5); // leading strand: primer replaced, then sealed
  const u = (P - 4.3) / 0.7;
  const k = Math.min(nicks.length - 1, Math.max(0, Math.floor(u * nicks.length)));
  const nx = xOf(nicks[k]);
  const onLead = k === 0;
  const ny = onLead ? HALF_RUNG + sepAt(nx) * apart - 2 * HALF_RUNG - 0.9 : -HALF_RUNG - sepAt(nx) * apart + 2 * HALF_RUNG + 0.9;
  enz('dna-ligase', u > 0 && u < 1 ? 1 : 0, nx, ny);
}
