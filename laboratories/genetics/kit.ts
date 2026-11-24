/**
 * Molecular building blocks for the Genetics laboratory: base colours and
 * pairing rules, 3D letters, and the "ladder" nucleotide used by the process
 * animations (replication, transcription, translation, mutations).
 */
import * as THREE from 'three';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import fontData from 'three/examples/fonts/helvetiker_bold.typeface.json';
import { merge, paint, place } from '@/laboratories/shared/geometry';

export type Base = 'A' | 'T' | 'G' | 'C' | 'U';

/** Structure id of each nitrogenous base. */
export const BASE_STRUCT: Record<Base, string> = { A: 'adenina', T: 'timina', G: 'guanina', C: 'citosina', U: 'uracila' };

/** Textbook colours: adenine green, thymine red, guanine yellow, cytosine blue, uracil purple. */
export const BASE_COLOR: Record<Base, string> = { A: '#2FA84F', T: '#E5484D', G: '#F2B90F', C: '#2F6FDB', U: '#9B5DE5' };
const LETTER_COLOR: Record<Base, string> = { A: '#FFFFFF', T: '#FFFFFF', G: '#3B2A00', C: '#FFFFFF', U: '#FFFFFF' };

/** DNA complementary base. */
export const DNA_PAIR: Record<Base, Base> = { A: 'T', T: 'A', G: 'C', C: 'G', U: 'A' };
/** RNA base transcribed from a DNA template base. */
export const RNA_FROM_TEMPLATE: Record<Base, Base> = { A: 'U', T: 'A', G: 'C', C: 'G', U: 'A' };

export const isPurine = (b: Base) => b === 'A' || b === 'G';

/** Strand colours: parental DNA, newly made DNA, RNA, RNA primer. */
export const STRAND_COLOR = { antiga: '#5B7DB1', nova: '#E8833A', rna: '#C04ABC', primer: '#D93A6B', intron: '#94A3B8', trna: '#2A9D8F' } as const;
export type StrandKind = keyof typeof STRAND_COLOR;

let font: Font | null = null;

/** Flat 3D text (letters on bases, 5'/3' ends, amino acid names), centred on the origin, facing +Z. */
export function textGeo(text: string, size: number, depth = size * 0.18): THREE.BufferGeometry {
  font ??= new Font(fontData as unknown as ConstructorParameters<typeof Font>[0]);
  const g = new TextGeometry(text, { font, size, depth, curveSegments: 3, bevelEnabled: false });
  g.computeBoundingBox();
  const b = g.boundingBox!;
  g.translate(-(b.min.x + b.max.x) / 2, -(b.min.y + b.max.y) / 2, -(b.min.z + b.max.z) / 2);
  return g;
}

/** Spacing between neighbouring nucleotides in the ladder diagrams. */
export const SPACING = 0.62;
/** Distance from a backbone to the middle of the base pair. */
export const HALF_RUNG = 1.0;
const GAP = 0.09;

function darker(color: string, k = 0.72) {
  return new THREE.Color(color).multiplyScalar(k);
}

/**
 * One nucleotide of a ladder diagram, at the origin of its backbone: phosphate
 * (left), pentose (centre), base pointing along `dir` (+1 up, -1 down) towards
 * the partner strand, with its letter on the front face. Purines are longer
 * than pyrimidines, so A–T and G–C rungs have the same total length.
 */
export function ladderNucleotide(base: Base, strand: StrandKind, dir: 1 | -1, letter = true): THREE.BufferGeometry {
  const sc = STRAND_COLOR[strand];
  const parts: THREE.BufferGeometry[] = [];
  // backbone link to the next nucleotide and the phosphate between them
  const link = new THREE.CylinderGeometry(0.055, 0.055, SPACING, 8);
  link.rotateZ(Math.PI / 2);
  parts.push(paint(link, sc));
  parts.push(paint(place(new THREE.IcosahedronGeometry(0.13, 1), [-SPACING / 2, 0, 0]), darker(sc)));
  // pentose (pentagon)
  const sugar = new THREE.CylinderGeometry(0.17, 0.17, 0.12, 5);
  sugar.rotateX(Math.PI / 2);
  parts.push(paint(sugar, sc));
  // base slab
  const len = (HALF_RUNG - 0.14 - GAP) * (isPurine(base) ? 1.18 : 0.82);
  const slab = new THREE.BoxGeometry(0.34, len, 0.12);
  const cy = dir * (0.14 + len / 2);
  parts.push(paint(place(slab, [0, cy, 0]), BASE_COLOR[base]));
  if (letter) parts.push(paint(place(textGeo(base, 0.22, 0.03), [0, cy, 0.07]), LETTER_COLOR[base]));
  return merge(parts);
}

/** Length of the base slab of a ladder nucleotide (for placing hydrogen bonds). */
export function slabEnd(base: Base) {
  return 0.14 + (HALF_RUNG - 0.14 - GAP) * (isPurine(base) ? 1.18 : 0.82);
}

/** Bases of a sequence string. */
export const seq = (s: string) => s.replace(/[^ATGCU]/g, '').split('') as Base[];

/** The standard genetic code (mRNA codon → amino acid, 3-letter pt-BR abbreviation as in textbooks). */
export const CODON_TABLE: Record<string, string> = (() => {
  const bases = 'UCAG';
  const aa =
    'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
  const out: Record<string, string> = {};
  let i = 0;
  for (const a of bases) for (const b of bases) for (const c of bases) out[a + b + c] = aa[i++];
  return out;
})();

/** One-letter amino acid code → name and abbreviation. */
export const AMINO_ACIDS: Record<string, { abbr: string; name: string; color: string }> = {
  A: { abbr: 'Ala', name: 'Alanina', color: '#94A3B8' },
  R: { abbr: 'Arg', name: 'Arginina', color: '#3B82F6' },
  N: { abbr: 'Asn', name: 'Asparagina', color: '#2DD4BF' },
  D: { abbr: 'Asp', name: 'Ácido aspártico', color: '#EF4444' },
  C: { abbr: 'Cys', name: 'Cisteína', color: '#EAB308' },
  E: { abbr: 'Glu', name: 'Ácido glutâmico', color: '#DC2626' },
  Q: { abbr: 'Gln', name: 'Glutamina', color: '#14B8A6' },
  G: { abbr: 'Gly', name: 'Glicina', color: '#CBD5E1' },
  H: { abbr: 'His', name: 'Histidina', color: '#6366F1' },
  I: { abbr: 'Ile', name: 'Isoleucina', color: '#22C55E' },
  L: { abbr: 'Leu', name: 'Leucina', color: '#16A34A' },
  K: { abbr: 'Lys', name: 'Lisina', color: '#2563EB' },
  M: { abbr: 'Met', name: 'Metionina', color: '#F59E0B' },
  F: { abbr: 'Phe', name: 'Fenilalanina', color: '#84CC16' },
  P: { abbr: 'Pro', name: 'Prolina', color: '#A3A3A3' },
  S: { abbr: 'Ser', name: 'Serina', color: '#F472B6' },
  T: { abbr: 'Thr', name: 'Treonina', color: '#EC4899' },
  W: { abbr: 'Trp', name: 'Triptofano', color: '#65A30D' },
  Y: { abbr: 'Tyr', name: 'Tirosina', color: '#D946EF' },
  V: { abbr: 'Val', name: 'Valina', color: '#10B981' },
  '*': { abbr: 'Stop', name: 'Códon de parada', color: '#111827' },
};

/** Translates an mRNA string (from its first base) into one-letter amino acids, stopping at the first stop codon (not included). */
export function translate(mrna: string): string {
  let out = '';
  for (let i = 0; i + 3 <= mrna.length; i += 3) {
    const aa = CODON_TABLE[mrna.slice(i, i + 3)];
    if (!aa || aa === '*') break;
    out += aa;
  }
  return out;
}

/** Amino acid ball with its abbreviation on the front. */
export function aminoAcidGeo(code: string, radius = 0.34): THREE.BufferGeometry {
  const info = AMINO_ACIDS[code] ?? AMINO_ACIDS.G;
  const ball = paint(new THREE.IcosahedronGeometry(radius, 2), info.color);
  const dark = ['G', 'C', 'A', 'P', 'Y'].includes(code) ? '#1F2937' : '#FFFFFF';
  const label = paint(place(textGeo(info.abbr, radius * 0.52, 0.02), [0, 0, radius * 0.93]), dark);
  return merge([ball, label]);
}
