/**
 * Cell Biology catalog: which models exist, which structures each one shows,
 * and schema-conformant `Structure` objects built from the curated content.
 * Pure data (no Three.js), so it is shared by the 3D lab and by Studio on the server.
 */
import type { Attribution, Structure } from '@/data/biology/schema';
import { CELL_CONTENT, CELL_REFS } from '@/data/biology/cells/content';
import { createCatalog, type LabModelInfo } from '@/laboratories/shared/catalog';

export { normalize } from '@/laboratories/shared/catalog';

export const CELL_LAB_ID = 'celulas' as const;

export type CellModelId = 'animal' | 'vegetal' | 'procariotica' | 'mitocondria' | 'cloroplasto' | 'mitose' | 'meiose' | 'fissao';

export interface CellModelInfo extends LabModelInfo<CellModelId> {
  kind: 'celula' | 'detalhe' | 'processo';
}

export const CELL_MODELS: CellModelInfo[] = [
  {
    id: 'animal',
    label: 'Célula animal',
    short: 'Animal',
    kind: 'celula',
    realSize: 'cerca de 10 a 30 µm',
    summary: 'Célula eucariótica sem parede celular, com centríolos e lisossomos.',
    structures: [
      'membrana-plasmatica',
      'microvilosidades',
      'citoplasma',
      'citoesqueleto',
      'nucleo',
      'envoltorio-nuclear',
      'nucleolo',
      'cromatina',
      'reticulo-endoplasmatico-rugoso',
      'reticulo-endoplasmatico-liso',
      'ribossomos',
      'complexo-golgiense',
      'vesiculas',
      'mitocondria',
      'lisossomos',
      'peroxissomos',
      'centriolos',
    ],
    processes: ['secrecao', 'respiracao'],
  },
  {
    id: 'vegetal',
    label: 'Célula vegetal',
    short: 'Vegetal',
    kind: 'celula',
    realSize: 'cerca de 10 a 100 µm',
    summary: 'Célula eucariótica com parede celular, cloroplastos e um grande vacúolo central.',
    structures: [
      'parede-celular',
      'plasmodesmos',
      'membrana-plasmatica',
      'citoplasma',
      'citoesqueleto',
      'vacuolo',
      'tonoplasto',
      'nucleo',
      'envoltorio-nuclear',
      'nucleolo',
      'cromatina',
      'reticulo-endoplasmatico-rugoso',
      'reticulo-endoplasmatico-liso',
      'ribossomos',
      'complexo-golgiense',
      'vesiculas',
      'cloroplastos',
      'amiloplastos',
      'mitocondria',
      'peroxissomos',
    ],
    processes: ['fotossintese', 'osmose', 'respiracao'],
  },
  {
    id: 'procariotica',
    label: 'Célula procariótica (bactéria)',
    short: 'Procariótica',
    kind: 'celula',
    realSize: 'cerca de 1 a 5 µm',
    summary: 'Bacilo Gram-negativo (como Escherichia coli): sem núcleo organizado e sem organelas membranosas, com envoltório de duas membranas.',
    structures: ['capsula-bacteriana', 'membrana-externa', 'periplasma', 'parede-celular-bacteriana', 'membrana-plasmatica', 'citoplasma', 'nucleoide', 'plasmideos', 'ribossomos-70s', 'inclusoes', 'flagelo-bacteriano', 'fimbrias'],
    processes: ['flagelo'],
  },
  {
    id: 'mitocondria',
    label: 'Mitocôndria em detalhe',
    short: 'Mitocôndria',
    kind: 'detalhe',
    realSize: 'cerca de 1 a 10 µm de comprimento',
    summary: 'Modelo ampliado de uma mitocôndria cortada ao meio, mostrando as duas membranas, as cristas e a matriz.',
    structures: ['membrana-mitocondrial-externa', 'espaco-intermembranas', 'membrana-mitocondrial-interna', 'cristas-mitocondriais', 'atp-sintase', 'matriz-mitocondrial', 'dna-mitocondrial'],
    detailOf: 'mitocondria',
    processes: ['respiracao-mito'],
  },
  {
    id: 'cloroplasto',
    label: 'Cloroplasto em detalhe',
    short: 'Cloroplasto',
    kind: 'detalhe',
    realSize: 'cerca de 3 a 10 µm de comprimento',
    summary: 'Modelo ampliado de um cloroplasto cortado, mostrando o envoltório, o estroma e as pilhas de tilacoides (grana).',
    structures: ['envoltorio-cloroplasto', 'estroma', 'tilacoides', 'lamelas-estromais', 'graos-de-amido', 'dna-cloroplasto'],
    detailOf: 'cloroplastos',
    processes: ['fotossintese-cloro'],
  },
  {
    id: 'fissao',
    label: 'Fissão binária (bactéria)',
    short: 'Fissão binária',
    kind: 'processo',
    realSize: 'bacilo de cerca de 2 µm de comprimento',
    summary: 'Bactéria em forma de bastonete se dividindo por fissão binária: replicação do cromossomo circular, alongamento, septo e separação.',
    structures: ['parede-celular-bacteriana', 'membrana-plasmatica', 'nucleoide', 'plasmideos', 'ribossomos-70s'],
    processes: ['fissao'],
  },
  {
    id: 'mitose',
    label: 'Divisão celular (mitose)',
    short: 'Mitose',
    kind: 'processo',
    realSize: 'célula animal de cerca de 10 a 30 µm',
    summary: 'Célula animal simplificada (2n = 4) passando pelas fases da mitose e pela citocinese.',
    structures: ['membrana-plasmatica', 'envoltorio-nuclear', 'cromatina', 'cromatide-irma', 'centromero', 'fuso-mitotico', 'centrossomo'],
    processes: ['mitose'],
  },
  {
    id: 'meiose',
    label: 'Divisão celular (meiose)',
    short: 'Meiose',
    kind: 'processo',
    realSize: 'célula de cerca de 10 a 30 µm',
    summary: 'Célula diploide simplificada (2n = 4) passando pelas duas divisões da meiose, com crossing-over, até formar quatro células haploides.',
    structures: ['membrana-plasmatica', 'envoltorio-nuclear', 'cromatina', 'cromossomos-homologos', 'cromatide-irma', 'quiasma', 'centromero', 'fuso-mitotico', 'centrossomo'],
    processes: ['meiose'],
  },
];

export const CELL_REPRESENTATION = 'Modelo esquemático, fora de escala';

/** All models are original procedural geometry created for BioLab 3D. */
export const CELL_ATTRIBUTIONS: Attribution[] = [];

export const CELL_CATALOG = createCatalog({ labId: CELL_LAB_ID, models: CELL_MODELS, content: CELL_CONTENT, refs: CELL_REFS, attributions: CELL_ATTRIBUTIONS });

export const cellModel = (id: string) => CELL_MODELS.find((m) => m.id === id);

/** Structure as seen from one model (system label and mesh ids filled in by the caller). */
export function cellStructure(id: string, modelId?: string): Structure | undefined {
  return CELL_CATALOG.structure(id, modelId);
}

export function allCellStructures(): Structure[] {
  return CELL_CATALOG.all();
}

/** Models where a structure can be shown (its own meshes, or as a detailed model). */
export function modelsShowing(id: string): CellModelInfo[] {
  return CELL_CATALOG.modelsShowing(id) as CellModelInfo[];
}

/**
 * Searches all cell structures. Structures visible in the current model come
 * first; others still appear (selecting them switches model).
 */
export function searchCells(q: string, currentModel: string, limit = 12): Structure[] {
  return CELL_CATALOG.search(q, currentModel, limit);
}
