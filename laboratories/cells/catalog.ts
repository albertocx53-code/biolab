/**
 * Cell Biology catalog: which models exist, which structures each one shows,
 * and schema-conformant `Structure` objects built from the curated content.
 * Pure data (no Three.js), so it is shared by the 3D lab and by Studio on the server.
 */
import type { Attribution, Structure } from '@/data/biology/schema';
import { CELL_CONTENT, CELL_REFS } from '@/data/biology/cells/content';

export const CELL_LAB_ID = 'celulas' as const;

export type CellModelId = 'animal' | 'vegetal' | 'procariotica' | 'mitocondria' | 'cloroplasto' | 'mitose';

export interface CellModelInfo {
  id: CellModelId;
  label: string;
  short: string;
  kind: 'celula' | 'detalhe' | 'processo';
  /** Real size, shown next to the "fora de escala" warning. */
  realSize: string;
  summary: string;
  /** Structures that have meshes in this model, in legend order. */
  structures: string[];
  /** Structure this detailed model zooms into (mitochondrion, chloroplast). */
  detailOf?: string;
  processes: string[];
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
      'citoplasma',
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
      'membrana-plasmatica',
      'citoplasma',
      'vacuolo',
      'nucleo',
      'envoltorio-nuclear',
      'nucleolo',
      'cromatina',
      'reticulo-endoplasmatico-rugoso',
      'ribossomos',
      'complexo-golgiense',
      'vesiculas',
      'cloroplastos',
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
    summary: 'Bactéria em forma de bastonete (bacilo): sem núcleo organizado e sem organelas membranosas.',
    structures: ['capsula-bacteriana', 'parede-celular-bacteriana', 'membrana-plasmatica', 'citoplasma', 'nucleoide', 'plasmideos', 'ribossomos-70s', 'flagelo-bacteriano', 'fimbrias'],
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
    id: 'mitose',
    label: 'Divisão celular (mitose)',
    short: 'Mitose',
    kind: 'processo',
    realSize: 'célula animal de cerca de 10 a 30 µm',
    summary: 'Célula animal simplificada (2n = 4) passando pelas fases da mitose e pela citocinese.',
    structures: ['membrana-plasmatica', 'envoltorio-nuclear', 'cromatina', 'cromatide-irma', 'centromero', 'fuso-mitotico', 'centrossomo'],
    processes: ['mitose'],
  },
];

export const cellModel = (id: string) => CELL_MODELS.find((m) => m.id === id);

export const CELL_REPRESENTATION = 'Modelo esquemático, fora de escala';

/** All models are original procedural geometry created for BioLab 3D. */
export const CELL_ATTRIBUTIONS: Attribution[] = [];

function toStructure(id: string, model?: CellModelInfo): Structure | undefined {
  const c = CELL_CONTENT[id];
  if (!c) return undefined;
  const home = model ?? CELL_MODELS.find((m) => m.structures.includes(id) || m.detailOf === id) ?? CELL_MODELS[0];
  return {
    id,
    laboratoryId: CELL_LAB_ID,
    modelId: home.id,
    parentStructureId: c.parent ?? null,
    namePtBR: c.name,
    scientificName: c.scientificName ?? null,
    sourceName: c.en,
    category: c.category,
    biologicalSystem: home.label,
    description: c.description,
    function: c.function,
    relatedStructures: (c.related ?? []).filter((r) => r in CELL_CONTENT),
    educationalTopics: c.topics,
    modelMeshIds: [],
    scientificReferences: c.refs.map((r) => CELL_REFS[r]),
    assetAttributions: CELL_ATTRIBUTIONS,
    contentReviewed: false,
  };
}

/** Structure as seen from one model (system label and mesh ids filled in by the caller). */
export function cellStructure(id: string, modelId?: string): Structure | undefined {
  return toStructure(id, modelId ? cellModel(modelId) : undefined);
}

export function allCellStructures(): Structure[] {
  return Object.keys(CELL_CONTENT).map((id) => toStructure(id)!);
}

/** Models where a structure can be shown (its own meshes, or as a detailed model). */
export function modelsShowing(id: string): CellModelInfo[] {
  return CELL_MODELS.filter((m) => m.structures.includes(id) || m.detailOf === id || m.structures.some((s) => CELL_CONTENT[s]?.parent === id));
}

export function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SEARCH_INDEX = Object.entries(CELL_CONTENT).map(([id, c]) => ({
  id,
  name: normalize(c.name),
  extra: normalize([c.en, c.scientificName ?? '', ...(c.aliases ?? [])].join(' ')),
}));

/**
 * Searches all cell structures. Structures visible in the current model come
 * first; others still appear (selecting them switches model).
 */
export function searchCells(q: string, currentModel: string, limit = 12): Structure[] {
  const n = normalize(q);
  if (n.length < 2) return [];
  const words = n.split(' ');
  const here = cellModel(currentModel);
  const scored: { id: string; score: number }[] = [];
  for (const e of SEARCH_INDEX) {
    const hay = `${e.name} ${e.extra}`;
    if (!words.every((w) => hay.includes(w))) continue;
    let score = e.name.startsWith(n) ? 0 : e.name.includes(n) ? 1 : 2;
    if (!here || !modelsShowing(e.id).some((m) => m.id === here.id)) score += 3;
    scored.push({ id: e.id, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.id.localeCompare(b.id))
    .slice(0, limit)
    .map((s) => {
      const showing = modelsShowing(s.id);
      const inHere = showing.find((m) => m.id === currentModel);
      return toStructure(s.id, inHere ?? showing[0])!;
    });
}
