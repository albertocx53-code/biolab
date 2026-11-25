import type { MaterialSpec } from '@/engine/visibility/materials';
import { paint } from '@/laboratories/shared/geometry';
import type { MeshDef } from '@/laboratories/shared/types';
import { BASE_COLOR, STRAND_COLOR } from './kit';

/**
 * Colours of the Genetics laboratory, following the usual textbook
 * conventions (A green, T red, G yellow, C blue, U purple; parental DNA blue,
 * new DNA orange, RNA magenta). Every mesh carries baked vertex colours (one
 * merged mesh can show a base, its letter and its backbone), so the materials
 * are white and only set the finish.
 */
export const GENETICS_COLOR: Record<string, string> = {
  dna: STRAND_COLOR.antiga,
  'esqueleto-acucar-fosfato': '#7C93B8',
  fosfato: '#F08C2E',
  desoxirribose: '#9FB6D8',
  ribose: '#C9A2E8',
  adenina: BASE_COLOR.A,
  timina: BASE_COLOR.T,
  guanina: BASE_COLOR.G,
  citosina: BASE_COLOR.C,
  uracila: BASE_COLOR.U,
  'ligacoes-hidrogenio': '#E2E8F0',
  'rna-mensageiro': STRAND_COLOR.rna,
  codon: '#94A3B8',
  'rna-transportador': '#2A9D8F',
  anticodon: '#2A9D8F',
  aminoacido: '#F59E0B',
  histonas: '#E9A0B8',
  'fibra-cromatina': '#D98BA8',
  'cromatide-irma': '#8E6FD1',
  'cromatide-irma-b': '#A68BE0',
  centromero: '#475569',
  cinetocoro: '#0EA5E9',
  telomero: '#F59E0B',
  gene: '#22C55E',
  'fita-molde': STRAND_COLOR.antiga,
  'fita-nova': STRAND_COLOR.nova,
  'primer-rna': STRAND_COLOR.primer,
  helicase: '#14B8A6',
  topoisomerase: '#64748B',
  primase: '#EC4899',
  'dna-polimerase': '#6366F1',
  'dna-ligase': '#84CC16',
  'proteinas-ssb': '#CBD5E1',
  'fita-codificadora': '#94A3B8',
  'rna-polimerase': '#0EA5E9',
  promotor: '#FACC15',
  terminador: '#F43F5E',
  'cap-5': '#F59E0B',
  'cauda-poli-a': BASE_COLOR.A,
  intron: '#94A3B8',
  exon: STRAND_COLOR.rna,
  ribossomo: '#D6B48C',
  'subunidade-menor': '#E3C9A3',
  'subunidade-maior': '#C9A27A',
  polipeptideo: '#F59E0B',
  'fator-de-liberacao': '#F43F5E',
  mutacao: '#F43F5E',
  proteina: '#F59E0B',
};

const FINISH = { color: '#ffffff', vertexColors: true, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.35 };

export const GENETICS_MATERIALS: Record<string, MaterialSpec> = Object.fromEntries(
  Object.keys(GENETICS_COLOR).map((id) => [
    id,
    id === 'cromatide-irma' || id === 'cromatide-irma-b' || id === 'fibra-cromatina' || id === 'histonas'
      ? { ...FINISH, roughness: 0.55, sheen: 0.4, sheenColor: '#F5E9FF', doubleSide: true }
      : id === 'ribossomo' || id === 'subunidade-menor' || id === 'subunidade-maior'
        ? { ...FINISH, roughness: 0.6, clearcoat: 0.15 }
        : FINISH,
  ]),
);

export const GENETICS_FALLBACK: MaterialSpec = FINISH;
export const LEGEND_COLOR: Record<string, string> = GENETICS_COLOR;
export const DEFAULT_OPACITY: Record<string, number> = { 'subunidade-maior': 0.82, 'subunidade-menor': 0.9 };

/** Bakes the structure colour into meshes that have no vertex colours yet. */
export function colorize(meshes: MeshDef[]): MeshDef[] {
  for (const m of meshes) if (!m.geometry.getAttribute('color')) paint(m.geometry, GENETICS_COLOR[m.cls ?? m.structure] ?? '#94A3B8');
  return meshes;
}
