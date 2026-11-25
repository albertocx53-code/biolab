/**
 * Gene mutations and their effect on the protein: the same stretch of a gene
 * (coding strand 5'→3', with the template below) in six versions — normal,
 * substitution that changes one amino acid (sickle-cell anaemia), silent
 * substitution, nonsense substitution (premature stop), insertion and
 * deletion (both shifting the reading frame). One step per version.
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import { merge, paint, place } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { CODON_TABLE, DNA_PAIR, HALF_RUNG, SPACING, aminoAcidGeo, ladderNucleotide, seq } from './kit';
import { colorize } from './materials';
import { stick } from './models';

export interface MutationVariant {
  id: string;
  coding: string;
  /** Changed (or inserted) positions of the coding strand; for a deletion, where the base was. */
  marks: number[];
  deletion?: boolean;
}

/** Part of the β-globin gene (codons 3 to 8 of the protein: Leu-Thr-Pro-Glu-Glu-Lys). */
export const NORMAL = 'CTGACTCCTGAGGAGAAG';
export const MUTATION_VARIANTS: MutationVariant[] = [
  { id: 'normal', coding: NORMAL, marks: [] },
  { id: 'falciforme', coding: 'CTGACTCCTGTGGAGAAG', marks: [10] },
  { id: 'silenciosa', coding: 'CTGACTCCTGAAGAGAAG', marks: [11] },
  { id: 'sem-sentido', coding: 'CTGACTCCTGAGGAGTAG', marks: [15] },
  { id: 'insercao', coding: 'CTGACTCCTGGAGGAGAAG', marks: [9] },
  { id: 'delecao', coding: 'CTGACTCCTAGGAGAAG', marks: [9], deletion: true },
];

const HIDE = 1e-4;
const AA_Y = 3.6;
export const MUTATION_PRESET: CameraPreset = { position: [1.2, 1.7, 19], target: [0.9, 1.2, 0], distance: 19, minDistance: 2, maxDistance: 38 };
const xOf = (i: number) => (i - 8.5) * SPACING;

/** Amino acids read from a coding strand (one-letter codes; '*' = stop, reading ends there). */
export function proteinOf(coding: string): string[] {
  const mrna = coding.replace(/T/g, 'U');
  const out: string[] = [];
  for (let i = 0; i + 3 <= mrna.length; i += 3) {
    const aa = CODON_TABLE[mrna.slice(i, i + 3)];
    out.push(aa);
    if (aa === '*') break;
  }
  return out;
}

export interface MutationModel {
  meshes: MeshDef[];
}

export function buildMutations(): MutationModel {
  const meshes: MeshDef[] = [];
  MUTATION_VARIANTS.forEach((v, s) => {
    const bases = seq(v.coding);
    const cod: THREE.BufferGeometry[] = [];
    const tem: THREE.BufferGeometry[] = [];
    bases.forEach((b, i) => {
      cod.push(place(ladderNucleotide(b, 'antiga', -1), [xOf(i), HALF_RUNG, 0]));
      tem.push(place(ladderNucleotide(DNA_PAIR[b], 'antiga', 1), [xOf(i), -HALF_RUNG, 0]));
    });
    // reading frame: one bracket per codon above the coding strand
    for (let c = 0; c * 3 + 2 < bases.length; c++) {
      const x0 = xOf(c * 3) - SPACING * 0.42;
      const x1 = xOf(c * 3 + 2) + SPACING * 0.42;
      const tone = c % 2 ? '#64748B' : '#94A3B8';
      cod.push(paint(place(new THREE.BoxGeometry(x1 - x0, 0.1, 0.18), [(x0 + x1) / 2, HALF_RUNG + 0.42, 0]), tone));
      for (const x of [x0, x1]) cod.push(paint(place(new THREE.BoxGeometry(0.07, 0.26, 0.18), [x, HALF_RUNG + 0.32, 0]), tone));
    }
    meshes.push({ id: `cod-${s}`, structure: 'fita-codificadora', geometry: merge(cod) });
    meshes.push({ id: `mol-${s}`, structure: 'fita-molde', geometry: merge(tem) });
    // protein: one amino acid above each codon, linked by peptide bonds
    const prot = proteinOf(v.coding);
    const aa: THREE.BufferGeometry[] = [];
    prot.forEach((a, c) => {
      const x = xOf(c * 3 + 1);
      aa.push(place(aminoAcidGeo(a, 0.44), [x, AA_Y, 0]));
      if (c > 0 && a !== '*') aa.push(paint(stick(new THREE.Vector3(xOf(c * 3 - 2) + 0.44, AA_Y, 0), new THREE.Vector3(x - 0.44, AA_Y, 0), 0.08), '#F59E0B'));
    });
    meshes.push({ id: `prot-${s}`, structure: 'proteina', geometry: merge(aa) });
    // mark: a red frame around the changed base pair (a red bar where a base was deleted)
    if (v.marks.length) {
      const parts: THREE.BufferGeometry[] = [];
      for (const i of v.marks) {
        const x = v.deletion ? xOf(i) - SPACING / 2 : xOf(i);
        if (v.deletion) parts.push(place(new THREE.BoxGeometry(0.1, 2 * HALF_RUNG + 0.9, 0.3), [x, 0, 0.1]));
        else {
          const w = SPACING * 0.5;
          const h = HALF_RUNG + 0.45;
          const c = [new THREE.Vector3(x - w, -h, 0.2), new THREE.Vector3(x + w, -h, 0.2), new THREE.Vector3(x + w, h, 0.2), new THREE.Vector3(x - w, h, 0.2)];
          for (let k = 0; k < 4; k++) parts.push(stick(c[k], c[(k + 1) % 4], 0.05));
        }
      }
      meshes.push({ id: `mutacao-${s}`, structure: 'mutacao', geometry: merge(parts) });
    }
  });
  colorize(meshes);
  return { meshes };
}

/** Shows the version of step `P` (a short pop when it appears). */
export function poseMutations(P: number, get: (id: string) => THREE.Object3D | undefined) {
  const s = Math.min(MUTATION_VARIANTS.length - 1, Math.max(0, Math.floor(P)));
  const u = P - s;
  MUTATION_VARIANTS.forEach((v, k) => {
    const on = k === s;
    for (const id of [`cod-${k}`, `mol-${k}`, `prot-${k}`]) {
      const m = get(id);
      if (m) m.scale.setScalar(on ? 1 : HIDE);
    }
    const mark = get(`mutacao-${k}`);
    if (mark) {
      const pulse = 1 + 0.12 * Math.sin(Math.min(1, u * 1.5) * Math.PI * 3) * (1 - Math.min(1, u * 1.5));
      mark.scale.setScalar(on ? pulse : HIDE);
      // keep the pulse centred on the mark
      const box = (mark as THREE.Mesh).geometry?.boundingBox;
      if (box) {
        const c = box.getCenter(new THREE.Vector3());
        mark.position.copy(c.multiplyScalar(1 - (on ? pulse : 1)));
      }
    }
    void v;
  });
}
