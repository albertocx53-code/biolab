/**
 * Transcription of a small eukaryotic gene, drawn as a flat ladder: RNA
 * polymerase binds the promoter, opens a bubble and builds pre-mRNA 5'→3'
 * against the template strand, releases it at the terminator, and the
 * pre-mRNA is processed (5' cap, poly-A tail, intron removed by splicing).
 *
 * Phase value P: 0 start · 1 polymerase on the promoter · 2 RNA made ·
 * 3 RNA released · 4 processed mRNA · 5 mRNA leaves towards the cytoplasm.
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import { merge, paint, place } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { DNA_PAIR, HALF_RUNG, SPACING, ladderNucleotide, seq, textGeo, type Base } from './kit';
import { colorize } from './materials';

/** Coding strand, 5'→3' from left to right: promoter · exon 1 · intron · exon 2 · terminator. */
export const GENE = { promoter: 'TATA', exon1: 'ATGTTC', intron: 'GTAAAG', exon2: 'GGATAA', terminator: 'GCG' };
const CODING = seq(GENE.promoter + GENE.exon1 + GENE.intron + GENE.exon2 + GENE.terminator);
const N = CODING.length;
const T0 = GENE.promoter.length; // first transcribed base
const NT = GENE.exon1.length + GENE.intron.length + GENE.exon2.length; // transcribed length
const INTRON0 = GENE.exon1.length;
const INTRON1 = INTRON0 + GENE.intron.length; // first base of exon 2 (in RNA indices)
const TAIL = 6;
const HIDE = 1e-4;

export const TRANSCRIPTION_PRESET: CameraPreset = { position: [0.5, 1.9, 27], target: [0.2, 1.4, 0], distance: 27, minDistance: 2, maxDistance: 54 };

const xOf = (i: number) => (i - (N - 1) / 2) * SPACING;
const ss = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);
const toRna = (b: Base): Base => (b === 'T' ? 'U' : b);

export interface TranscriptionModel {
  meshes: MeshDef[];
}

export function buildTranscription(): TranscriptionModel {
  const meshes: MeshDef[] = [];
  const label = (g: THREE.BufferGeometry, text: string, side: -1 | 1) => merge([g, paint(place(textGeo(text, 0.26, 0.04), [side * 0.62, 0, 0.1]), '#1E293B')]);
  for (let i = 0; i < N; i++) {
    let c = ladderNucleotide(CODING[i], 'antiga', -1);
    let t = ladderNucleotide(DNA_PAIR[CODING[i]], 'antiga', 1);
    if (i === 0) {
      c = label(c, "5'", -1);
      t = label(t, "3'", -1);
    }
    if (i === N - 1) {
      c = label(c, "3'", 1);
      t = label(t, "5'", 1);
    }
    meshes.push({ id: `cod-${i}`, structure: 'fita-codificadora', geometry: c });
    meshes.push({ id: `mol-${i}`, structure: 'fita-molde', geometry: t });
  }
  for (let k = 0; k < NT; k++) {
    const intron = k >= INTRON0 && k < INTRON1;
    let g = ladderNucleotide(toRna(CODING[T0 + k]), intron ? 'intron' : 'rna', -1);
    if (k === 0) g = label(g, "5'", -1);
    if (k === NT - 1) g = label(g, "3'", 1);
    meshes.push({ id: `rna-${k}`, structure: intron ? 'intron' : 'rna-mensageiro', geometry: g });
  }
  for (let k = 0; k < TAIL; k++) meshes.push({ id: `polia-${k}`, structure: 'cauda-poli-a', geometry: ladderNucleotide('A', 'rna', -1) });
  // regulatory regions, drawn as bars under the template strand
  const bar = (i0: number, i1: number) => place(new THREE.BoxGeometry((i1 - i0 + 1) * SPACING - 0.1, 0.16, 0.24), [(xOf(i0) + xOf(i1)) / 2, -HALF_RUNG - 0.55, 0]);
  meshes.push({ id: 'promotor', structure: 'promotor', geometry: bar(0, T0 - 1) });
  meshes.push({ id: 'terminador', structure: 'terminador', geometry: bar(N - GENE.terminator.length, N - 1) });
  meshes.push({ id: 'cap-5', structure: 'cap-5', geometry: merge([paint(new THREE.IcosahedronGeometry(0.32, 2), '#F59E0B'), paint(place(textGeo('cap', 0.16, 0.02), [0, 0, 0.31]), '#3B2A00')]) });
  const pol = new THREE.IcosahedronGeometry(1.25, 4);
  pol.scale(1.35, 1.25, 0.9);
  meshes.push({ id: 'rna-polimerase', structure: 'rna-polimerase', geometry: pol });
  colorize(meshes);
  return { meshes };
}

/** Position of the RNA polymerase along the DNA. */
export function polymeraseX(P: number) {
  const start = xOf(0) - 3.5;
  const promoter = xOf(T0) - 0.2;
  const end = xOf(T0 + NT - 1) + 0.4;
  if (P < 1) return start + (promoter - start) * ss(0, 1, P);
  if (P < 2) return promoter + (end - promoter) * ((P - 1) / 1);
  return end + (xOf(N - 1) + 0.6 - end) * ss(2, 2.4, P);
}

/** Index (RNA) of the last nucleotide added. */
export function rnaMade(P: number) {
  if (P < 1) return -1;
  const x = polymeraseX(P);
  return Math.min(NT - 1, Math.floor((x - xOf(T0)) / SPACING + 1e-6));
}

export function poseTranscription(P: number, get: (id: string) => THREE.Object3D | undefined) {
  const px = polymeraseX(P);
  const release = ss(2.2, 2.9, P); // polymerase and RNA leave the DNA
  const bubbleOn = 1 - release;
  const open = (x: number) => 1.4 * bubbleOn * Math.exp(-(((x - px) / 1.25) ** 4)) * (P >= 0.7 ? 1 : ss(0.4, 0.7, P));
  const set = (id: string, x: number, y: number, z: number, s = 1) => {
    const m = get(id);
    if (!m) return;
    m.position.set(x, y, z);
    m.scale.setScalar(Math.max(HIDE, s));
  };
  for (let i = 0; i < N; i++) {
    const o = open(xOf(i));
    set(`cod-${i}`, xOf(i), HALF_RUNG + o, 0);
    set(`mol-${i}`, xOf(i), -HALF_RUNG - o, 0);
  }
  set('promotor', 0, 0, 0);
  set('terminador', 0, 0, 0);
  // polymerase: behind the bubble, leaves upwards after the terminator
  set('rna-polimerase', px, 0.1 + 3.5 * release, -0.9, ss(0, 0.35, P) * (1 - ss(2.5, 2.9, P)));

  // RNA: paired with the template inside the bubble, then peeling off upwards and to the front
  const made = rnaMade(P);
  const splice = ss(3.1, 3.8, P); // intron loops out and exons join
  const mature = ss(4, 5, P);
  const lineY = 3.4 + 1.6 * mature;
  for (let k = 0; k < NT; k++) {
    const id = `rna-${k}`;
    const intron = k >= INTRON0 && k < INTRON1;
    if (k > made) {
      set(id, 0, 0, 0, 0);
      continue;
    }
    const xj = xOf(T0 + k);
    const d = px - xj;
    // while being made
    const pairedY = -HALF_RUNG - open(xj) + 2 * HALF_RUNG;
    const peel = ss(1.0, 2.2, d);
    let x = xj;
    let y = pairedY + peel * (Math.min(Math.max(d - 1.0, 0), 4.5) * 0.75 + 0.6);
    let z = 0.95 * peel;
    // released: a straight pre-mRNA above the DNA
    const lx = (k - (NT - 1) / 2) * SPACING;
    x += (lx - x) * release;
    y += (lineY - y) * release;
    z += (0.6 - z) * release;
    let s = 1;
    if (intron) {
      // lariat: the intron loops up and is removed
      const a = ((k - INTRON0 + 0.5) / (INTRON1 - INTRON0)) * Math.PI;
      const loopX = (INTRON0 + INTRON1 - 1) / 2;
      const lcx = (loopX - (NT - 1) / 2) * SPACING;
      x += (lcx - Math.cos(a) * 1.2 - x) * splice;
      y += (lineY + 0.9 + Math.sin(a) * 1.1 - y) * splice;
      s = 1 - ss(3.6, 3.95, P);
    } else if (k >= INTRON1) {
      x -= (INTRON1 - INTRON0) * SPACING * splice;
    }
    // the mature mRNA is centred
    if (!intron) x += (INTRON1 - INTRON0) * SPACING * 0.5 * splice;
    set(id, x, y, z, s);
  }
  // 5' cap and poly-A tail are added during processing
  const capOn = ss(3, 3.3, P);
  const x0 = (0 - (NT - 1) / 2) * SPACING + (INTRON1 - INTRON0) * SPACING * 0.5 * splice;
  set('cap-5', x0 - 0.75, lineY - 0.05, 0.7, capOn);
  const xEnd = (NT - 1 - (NT - 1) / 2) * SPACING - (INTRON1 - INTRON0) * SPACING * 0.5 * splice;
  for (let k = 0; k < TAIL; k++) {
    const on = ss(3.3 + k * 0.08, 3.45 + k * 0.08, P);
    set(`polia-${k}`, xEnd + (k + 1) * SPACING, lineY, 0.6, on);
  }
}
