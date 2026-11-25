/**
 * Translation on a ribosome: the initiator tRNA (Met) binds the start codon,
 * each new tRNA brings its amino acid to the A site, the growing chain is
 * transferred to it (peptide bond), the ribosome moves one codon (translocation)
 * and the empty tRNA leaves from the E site; at the stop codon a release
 * factor frees the polypeptide and the ribosome comes apart.
 *
 * Phase value P: step 0 initiation · steps 1–4 one codon each · step 5 termination.
 */
import * as THREE from 'three';
import type { CameraPreset } from '@/components/3d/CameraRig';
import { merge, paint, place } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { CODON_TABLE, RNA_FROM_TEMPLATE, SPACING, aminoAcidGeo, ladderNucleotide, seq, textGeo, type Base } from './kit';
import { colorize } from './materials';
import { RNA_SEQUENCE, stick } from './models';

export const MRNA = 'GCC' + RNA_SEQUENCE + 'GC';
const START = 3;
const BASES = seq(MRNA);
const N = BASES.length;
export const CODONS = Array.from({ length: RNA_SEQUENCE.length / 3 }, (_, c) => MRNA.slice(START + c * 3, START + c * 3 + 3));
/** Amino acids made (the last codon is a stop codon). */
export const PEPTIDE = CODONS.map((c) => CODON_TABLE[c]).filter((a) => a !== '*');
const HIDE = 1e-4;
const TRNA_Y = 2;
const TIP = new THREE.Vector3(0.55, 4.25, 0.15);

export const TRANSLATION_PRESET: CameraPreset = { position: [0.8999999999999999, 5.0, 23], target: [0.6, 4.5, 0], distance: 23, minDistance: 2, maxDistance: 46 };

const xOf = (i: number) => (i - (N - 1) / 2) * SPACING;
export const codonX = (c: number) => xOf(START + c * 3 + 1);
const ss = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

export interface TranslationModel {
  meshes: MeshDef[];
}

/** Compact tRNA: anticodon (pointing down), stem, folded body and the CCA arm holding the amino acid. */
function compactTrna(anticodonLeftToRight: Base[], color = '#2A9D8F', label?: string) {
  const parts: THREE.BufferGeometry[] = anticodonLeftToRight.map((b, k) => place(ladderNucleotide(b, 'trna', -1), [(k - 1) * SPACING, 0, 0]));
  parts.push(paint(stick(new THREE.Vector3(-SPACING, 0, 0), new THREE.Vector3(-0.35, 0.7, 0), 0.06), color));
  parts.push(paint(stick(new THREE.Vector3(SPACING, 0, 0), new THREE.Vector3(0.35, 0.7, 0), 0.06), color));
  for (const x of [-0.35, 0.35]) parts.push(paint(stick(new THREE.Vector3(x, 0.7, 0), new THREE.Vector3(x, 2.4, 0), 0.07), color));
  for (let y = 0.95; y < 2.4; y += 0.36) parts.push(paint(stick(new THREE.Vector3(-0.35, y, 0), new THREE.Vector3(0.35, y, 0), 0.06, 6), '#9ADBD1'));
  const body = new THREE.IcosahedronGeometry(0.85, 3);
  body.scale(1.05, 0.8, 0.45);
  parts.push(paint(place(body, [0, 3.0, -0.05]), color));
  parts.push(paint(stick(new THREE.Vector3(0.45, 3.5, 0), TIP.clone().add(new THREE.Vector3(0, -0.25, 0)), 0.07), color));
  if (label) parts.push(paint(place(textGeo(label, 0.3, 0.04), [0, 3.0, 0.38]), '#FFFFFF'));
  return merge(parts);
}

export function buildTranslation(): TranslationModel {
  const meshes: MeshDef[] = [];
  BASES.forEach((b, i) => {
    let g = ladderNucleotide(b, 'rna', 1);
    if (i === 0) g = merge([g, paint(place(textGeo("5'", 0.26, 0.04), [-0.62, 0, 0.1]), '#6B1D66')]);
    if (i === N - 1) g = merge([g, paint(place(textGeo("3'", 0.26, 0.04), [0.62, 0, 0.1]), '#6B1D66')]);
    meshes.push({ id: `mrna-${i}`, structure: 'rna-mensageiro', geometry: g });
  });
  // codon brackets
  CODONS.forEach((_, c) => {
    const x0 = xOf(START + c * 3) - SPACING * 0.42;
    const x1 = xOf(START + c * 3 + 2) + SPACING * 0.42;
    const tone = c === CODONS.length - 1 ? '#F43F5E' : c % 2 ? '#64748B' : '#94A3B8';
    meshes.push({ id: `codon-${c}`, structure: 'codon', geometry: merge([paint(place(new THREE.BoxGeometry(x1 - x0, 0.12, 0.2), [(x0 + x1) / 2, -0.42, 0]), tone), ...[x0, x1].map((x) => paint(place(new THREE.BoxGeometry(0.08, 0.3, 0.2), [x, -0.3, 0]), tone))]) });
  });
  // one tRNA per sense codon, with its amino acid
  PEPTIDE.forEach((aa, c) => {
    const codon = seq(CODONS[c]);
    // the anticodon pairs antiparallel: under the codon, left to right, are the complements of its bases
    const anti = codon.map((b) => RNA_FROM_TEMPLATE[b === 'U' ? 'T' : b] as Base);
    meshes.push({ id: `trna-${c}`, structure: 'rna-transportador', geometry: compactTrna(anti) });
    meshes.push({ id: `aa-${c}`, structure: 'polipeptideo', geometry: aminoAcidGeo(aa, 0.38) });
  });
  // release factor (shaped like a tRNA, it recognises the stop codon)
  const rf = new THREE.IcosahedronGeometry(0.9, 3);
  rf.scale(0.85, 1.9, 0.5);
  meshes.push({ id: 'fator-de-liberacao', structure: 'fator-de-liberacao', geometry: merge([paint(place(rf, [0, 1.7, 0]), '#F43F5E'), paint(place(textGeo('FL', 0.34, 0.04), [0, 2.1, 0.47]), '#FFFFFF')]) });
  // ribosome: small subunit under the mRNA, large subunit (with the E, P and A sites) behind the tRNAs
  const small = new THREE.IcosahedronGeometry(1, 4);
  small.scale(3.0, 0.95, 1.5);
  meshes.push({ id: 'subunidade-menor', structure: 'subunidade-menor', geometry: place(small, [0, -0.75, -0.2]) });
  const large = new THREE.IcosahedronGeometry(1, 4);
  large.scale(3.4, 2.3, 1.7);
  const sites = (['E', 'P', 'A'] as const).map((s, k) => paint(place(textGeo(s, 0.55, 0.05), [(k - 1) * 3 * SPACING, 5.6, 0.2]), '#5B4630'));
  meshes.push({ id: 'subunidade-maior', structure: 'subunidade-maior', geometry: merge([paint(place(large, [0, 3.4, -1.75]), '#C9A27A'), ...sites]) });
  colorize(meshes);
  return { meshes };
}

/** Codon under the P site. */
export function pSite(P: number) {
  if (P < 1) return 0;
  const s = Math.min(5, Math.floor(P));
  const u = P - s;
  if (s >= 5) return 4;
  return s - 1 + ss(0.55, 0.85, u);
}

/** Index of the tRNA holding the growing chain, and how far the chain has moved towards the next one. */
function chainHolder(P: number): { from: number; to: number; k: number } {
  const s = Math.min(5, Math.floor(P));
  const u = P - s;
  if (s === 0) return { from: 0, to: 0, k: 0 };
  if (s >= 5) return { from: 4, to: 4, k: 0 };
  return { from: s - 1, to: s, k: ss(0.35, 0.55, u) };
}

export function poseTranslation(P: number, get: (id: string) => THREE.Object3D | undefined) {
  const set = (id: string, p: THREE.Vector3, s = 1) => {
    const m = get(id);
    if (!m) return;
    m.position.copy(p);
    m.scale.setScalar(Math.max(HIDE, s));
  };
  const s = Math.min(5, Math.floor(P));
  const u = P - s;
  for (let i = 0; i < N; i++) set(`mrna-${i}`, new THREE.Vector3(xOf(i), 0, 0));
  CODONS.forEach((_, c) => set(`codon-${c}`, new THREE.Vector3(0, 0, 0)));

  // ribosome
  const rx = THREE.MathUtils.lerp(codonX(0), codonX(4), pSite(P) / 4);
  const assemble = s === 0 ? ss(0.55, 0.9, u) : 1;
  const apart = s === 5 ? ss(0.6, 1, u) : 0;
  set('subunidade-menor', new THREE.Vector3(rx - 3 * (1 - (s === 0 ? ss(0, 0.4, u) : 1)), -2.5 * apart, 0), s === 0 ? ss(0, 0.3, u) : 1 - apart);
  set('subunidade-maior', new THREE.Vector3(rx, 4 * (1 - assemble) + 3 * apart, 0), (s === 0 ? ss(0.5, 0.75, u) : 1) * (1 - apart));

  // tRNAs: enter the A site (P site for the initiator), stay paired with their codon, leave from the E site
  const tipOf = (c: number) => tripPos(c).add(TIP);
  function tripPos(c: number) {
    const paired = new THREE.Vector3(codonX(c), TRNA_Y, 0);
    const enter = new THREE.Vector3(codonX(c) + 2.8, TRNA_Y + 6, 0.6);
    const leave = new THREE.Vector3(codonX(c) - 3.2, TRNA_Y + 6, 0.6);
    const inStep = c; // step in which it arrives
    let k = 0;
    if (s > inStep) k = 1;
    else if (s === inStep) k = c === 0 ? ss(0.1, 0.55, u) : ss(0, 0.35, u);
    const p = enter.clone().lerp(paired, k);
    // departure: one step later, after the translocation (the last one leaves at termination)
    const outStep = c + 1;
    const out = s > outStep ? 1 : s === outStep ? (c === PEPTIDE.length - 1 ? ss(0.45, 0.85, u) : ss(0.85, 1, u)) : 0;
    return p.lerp(leave, out);
  }
  PEPTIDE.forEach((_, c) => {
    const p = tripPos(c);
    const arrived = s > c || (s === c && u > 0) || (c === 0 && P > 0.05);
    const gone = s > c + 1 || (s === c + 1 && u > 0.99);
    set(`trna-${c}`, p, arrived && !gone ? 1 : 0);
  });

  // amino acids: each rides on its tRNA; the chain hangs from the tRNA in the P site
  const h = chainHolder(P);
  const chainAt = (holder: number, j: number) => {
    const k = holder - j; // 0 = the amino acid of the holder
    return tipOf(holder).add(new THREE.Vector3(-0.42 * k, 0.62 * k + (k % 2 ? 0.1 : 0), 0.25));
  };
  const released = s === 5 ? ss(0.3, 0.75, u) : 0;
  PEPTIDE.forEach((_, j) => {
    let p: THREE.Vector3;
    if (j > h.to) p = tipOf(j); // still alone on its own tRNA
    else if (j === h.to && h.k < 1 && h.from !== h.to) p = tipOf(j); // the new amino acid waits on its tRNA
    else if (h.from === h.to) p = chainAt(h.to, j);
    else p = chainAt(h.from, j).lerp(chainAt(h.to, j), h.k);
    if (released > 0) p.add(new THREE.Vector3(-1.5 * released, 3.2 * released, 0.6 * released));
    const trnaVisible = s > j || (s === j && u > 0) || (j === 0 && P > 0.05);
    set(`aa-${j}`, p, trnaVisible ? 1 : 0);
  });

  // release factor at the stop codon
  const rfIn = s === 5 ? ss(0, 0.3, u) * (1 - ss(0.75, 1, u)) : 0;
  set('fator-de-liberacao', new THREE.Vector3(codonX(5) + 2.5 * (1 - ss(0, 0.3, u)), TRNA_Y - 1.0 + 5 * (1 - ss(0, 0.3, u)), 0.2), rfIn);
}
