/**
 * Genetics catalog: which models exist, which structures each one shows, and
 * schema-conformant `Structure` objects built from the curated content.
 * Pure data (no Three.js), so it is shared by the 3D lab and by Studio on the server.
 */
import type { Structure } from '@/data/biology/schema';
import { GENETICS_CONTENT, GENETICS_REFS } from '@/data/biology/genetics/content';
import { createCatalog, type LabModelInfo } from '@/laboratories/shared/catalog';

export const GENETICS_LAB_ID = 'genetica' as const;

export type GeneticsModelId = 'dna' | 'nucleotideo' | 'rna' | 'cromossomo' | 'replicacao' | 'transcricao' | 'traducao' | 'mutacao';

export interface GeneticsModelInfo extends LabModelInfo<GeneticsModelId> {
  kind: 'molecula' | 'processo';
}

export const GENETICS_MODELS: GeneticsModelInfo[] = [
  {
    id: 'dna',
    label: 'Dupla-hélice de DNA',
    short: 'DNA',
    kind: 'molecula',
    realSize: '2 nm de largura; 0,34 nm entre pares de bases',
    summary: 'Vinte pares de bases de DNA na forma B: duas fitas antiparalelas enroladas para a direita, com sulco maior e sulco menor.',
    structures: ['esqueleto-acucar-fosfato', 'fosfato', 'desoxirribose', 'adenina', 'timina', 'guanina', 'citosina', 'ligacoes-hidrogenio'],
    processes: [],
  },
  {
    id: 'nucleotideo',
    label: 'Nucleotídeos',
    short: 'Nucleotídeos',
    kind: 'molecula',
    realSize: 'cerca de 1 nm cada',
    summary: 'Os quatro nucleotídeos do DNA (purinas em cima, pirimidinas embaixo) e um nucleotídeo de RNA, com ribose e uracila.',
    structures: ['fosfato', 'desoxirribose', 'ribose', 'adenina', 'guanina', 'timina', 'citosina', 'uracila'],
    processes: [],
  },
  {
    id: 'rna',
    label: 'RNA mensageiro e transportador',
    short: 'RNA',
    kind: 'molecula',
    realSize: 'tRNA com cerca de 80 nucleotídeos; mRNA com centenas a milhares',
    summary: 'Um mRNA lido em códons e o tRNA da metionina, com o anticódon pareado ao códon de início AUG.',
    structures: ['rna-mensageiro', 'codon', 'rna-transportador', 'anticodon', 'aminoacido'],
    processes: [],
  },
  {
    id: 'cromossomo',
    label: 'Do DNA ao cromossomo',
    short: 'Cromossomo',
    kind: 'molecula',
    realSize: 'de 2 nm (DNA) a cerca de 1 µm de largura (cromossomo metafásico)',
    summary: 'Os níveis de compactação: dupla-hélice, nucleossomos ("colar de contas"), fibra de cromatina e o cromossomo metafásico com duas cromátides-irmãs.',
    structures: ['dna', 'histonas', 'fibra-cromatina', 'cromatide-irma', 'centromero', 'cinetocoro', 'telomero', 'gene'],
    processes: [],
  },
  {
    id: 'replicacao',
    label: 'Replicação do DNA',
    short: 'Replicação',
    kind: 'processo',
    realSize: 'a forquilha avança cerca de 50 nucleotídeos por segundo nos humanos',
    summary: 'Uma forquilha de replicação: helicase, primase, DNA polimerase nas fitas líder e tardia, fragmentos de Okazaki e DNA ligase.',
    structures: ['fita-molde', 'fita-nova', 'primer-rna', 'helicase', 'topoisomerase', 'primase', 'dna-polimerase', 'dna-ligase'],
    processes: ['replicacao'],
  },
  {
    id: 'transcricao',
    label: 'Transcrição do gene',
    short: 'Transcrição',
    kind: 'processo',
    realSize: 'a RNA polimerase avança cerca de 40 nucleotídeos por segundo',
    summary: 'A RNA polimerase transcreve um gene com promotor, éxons, íntron e terminador; o pré-mRNA recebe cap, cauda poli-A e passa por splicing.',
    structures: ['fita-codificadora', 'fita-molde', 'promotor', 'terminador', 'rna-polimerase', 'rna-mensageiro', 'intron', 'cap-5', 'cauda-poli-a'],
    processes: ['transcricao'],
  },
  {
    id: 'traducao',
    label: 'Tradução no ribossomo',
    short: 'Tradução',
    kind: 'processo',
    realSize: 'ribossomo com cerca de 25 nm; cerca de 5 aminoácidos por segundo',
    summary: 'O ribossomo lê o mRNA AUG UUC GGA AAA UGG UAA e monta a cadeia Met-Phe-Gly-Lys-Trp, com os sítios E, P e A.',
    structures: ['rna-mensageiro', 'codon', 'subunidade-menor', 'subunidade-maior', 'rna-transportador', 'polipeptideo', 'fator-de-liberacao'],
    processes: ['traducao'],
  },
  {
    id: 'mutacao',
    label: 'Mutações gênicas',
    short: 'Mutações',
    kind: 'processo',
    realSize: 'uma única base pode mudar a proteína',
    summary: 'O mesmo trecho do gene da β-globina normal e com substituição, mutação silenciosa, sem sentido, inserção e deleção, com a proteína resultante.',
    structures: ['fita-codificadora', 'fita-molde', 'mutacao', 'proteina'],
    processes: ['mutacao'],
  },
];

export const GENETICS_REPRESENTATION = 'Modelo esquemático, fora de escala';

export const GENETICS_CATALOG = createCatalog({ labId: GENETICS_LAB_ID, models: GENETICS_MODELS, content: GENETICS_CONTENT, refs: GENETICS_REFS });

export function geneticsStructure(id: string, modelId?: string): Structure | undefined {
  return GENETICS_CATALOG.structure(id, modelId);
}
