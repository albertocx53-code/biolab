/**
 * Human Anatomy catalog: turns the compact generated catalog
 * (public/models/human/v1/catalog.json) plus curated pt-BR content into
 * schema-conformant `Structure` objects and fast lookup indexes.
 */
import type { CatalogGroup, CatalogMesh, CatalogModel } from '@/engine/types';
import type { Attribution, Structure } from '@/data/biology/schema';
import { HUMAN_CONTENT, REFS, SYSTEM_NOTES, type HumanContent } from '@/data/biology/human/content';
import { EXTRA_BOUNDS, EXTRA_MESHES, EXTRA_MODEL_ID, EXTRA_ORGAN_COMPOSITES, FEMALE_GROUP } from './extra-catalog';

export interface RawHumanCatalog {
  version: number;
  attribution: string[];
  license: string;
  models: CatalogModel[];
  groups: CatalogGroup[];
  meshes: { id: string; m: string; g: string; c: string; n: string; la: string | null; en: string; ctr: [number, number, number]; sz: [number, number, number] }[];
  parents: Record<string, string>;
  composites: { id: string; n: string; la: string | null; g: string; members: string[] }[];
  regions: { id: string; n: string; min: [number, number, number]; max: [number, number, number] }[];
}

export const HUMAN_LAB_ID = 'anatomia-humana' as const;

export const HUMAN_ATTRIBUTIONS: Attribution[] = [
  { text: 'BodyParts3D — The Database Center for Life Science', license: 'CC BY-SA 2.1 JP', url: 'https://lifesciencedb.jp/bp3d/' },
  { text: 'Z-Anatomy — The open source atlas of anatomy', license: 'CC BY-SA 4.0', url: 'https://www.z-anatomy.com/' },
];

export const GROUP_SYSTEM_NAME: Record<string, string> = {
  tegumentar: 'Sistema tegumentar',
  esqueletico: 'Sistema esquelético',
  muscular: 'Sistema muscular',
  fascias: 'Sistema muscular',
  coracao: 'Sistema cardiovascular',
  vasos: 'Sistema cardiovascular',
  nervoso: 'Sistema nervoso',
  respiratorio: 'Sistema respiratório',
  digestorio: 'Sistema digestório',
  urinario: 'Sistema urinário',
  reprodutor: 'Sistema reprodutor',
  [FEMALE_GROUP]: 'Sistema reprodutor',
  endocrino: 'Sistema endócrino',
  linfatico: 'Sistema linfático',
};

export interface Region {
  id: string;
  name: string;
  min: [number, number, number];
  max: [number, number, number];
}

export interface HumanIndex {
  raw: RawHumanCatalog;
  structures: Map<string, Structure>;
  meshInfo: Map<string, CatalogMesh>;
  meshesOf: (structureId: string) => string[];
  structureOfMesh: (meshId: string) => string;
  regions: Region[];
  regionAt: (p: [number, number, number]) => Region | null;
  meshesInRegion: (regionId: string) => string[];
  search: (q: string, limit?: number) => Structure[];
  /** Curated content was available for this structure. */
  hasContent: (structureId: string) => boolean;
}

export const baseId = (id: string) => id.replace(/-(dir|esq)(-\d+)?$/, '');

/**
 * Teaching composites added on top of the generated catalog: whole vessels
 * and valves that the source data only has in pieces. Members that are not
 * in the catalog are ignored, so the list is safe across model versions.
 */
export const EXTRA_COMPOSITES: RawHumanCatalog['composites'] = [
  { id: 'aorta', n: 'Aorta', la: 'Aorta', g: 'vasos', members: ['ascending-aorta', 'aortic-arch', 'thoracic-aorta', 'abdominal-aorta'] },
  { id: 'veias-cavas', n: 'Veias cavas', la: 'Venae cavae', g: 'vasos', members: ['superior-vena-cava', 'inferior-vena-cava-thoracic-part', 'inferior-vena-cava-abdominal-part'] },
  { id: 'arterias-pulmonares', n: 'Tronco e artérias pulmonares', la: 'Truncus pulmonalis; arteriae pulmonales', g: 'vasos', members: ['pulmonary-trunk', 'bifurcation-of-pulmonary-trunk', 'left-pulmonary-artery', 'right-pulmonary-artery'] },
  { id: 'veias-pulmonares', n: 'Veias pulmonares', la: 'Venae pulmonales', g: 'vasos', members: ['right-superior-pulmonary-vein', 'right-inferior-pulmonary-vein', 'left-superior-pulmonary-vein', 'left-inferior-pulmonary-vein'] },
  { id: 'arterias-coronarias', n: 'Artérias coronárias', la: 'Arteriae coronariae', g: 'vasos', members: ['right-coronary-artery', 'left-coronary-artery', 'right-inferolateral-branch-of-right-coronary-artery'] },
  {
    id: 'grandes-vasos',
    n: 'Grandes vasos do coração',
    la: null,
    g: 'vasos',
    members: [
      'ascending-aorta',
      'aortic-arch',
      'superior-vena-cava',
      'inferior-vena-cava-thoracic-part',
      'pulmonary-trunk',
      'bifurcation-of-pulmonary-trunk',
      'left-pulmonary-artery',
      'right-pulmonary-artery',
      'right-superior-pulmonary-vein',
      'right-inferior-pulmonary-vein',
      'left-superior-pulmonary-vein',
      'left-inferior-pulmonary-vein',
    ],
  },
  { id: 'valva-tricuspide', n: 'Valva tricúspide (atrioventricular direita)', la: 'Valva atrioventricularis dextra', g: 'coracao', members: ['inferior-leaflet-of-right-atrioventricular-valve', 'septal-leaflet-of-right-atrioventricular-valve'] },
  { id: 'valva-mitral', n: 'Valva mitral (atrioventricular esquerda)', la: 'Valva atrioventricularis sinistra', g: 'coracao', members: ['posterior-leaflet-of-left-atrioventricular-valve'] },
  { id: 'valva-aortica', n: 'Valva aórtica', la: 'Valva aortae', g: 'coracao', members: ['left-coronary-leaflet', 'non-coronary-leaflet', 'right-coronary-leaflet'] },
  { id: 'valva-pulmonar', n: 'Valva pulmonar', la: 'Valva trunci pulmonalis', g: 'coracao', members: ['anterior-semilunar-leaflet-of-pulmonary-valve', 'left-semilunar-leaflet-of-pulmonary-valve', 'right-semilunar-leaflet-of-pulmonary-valve'] },
];

/**
 * Adds the organs BioLab models procedurally (kidneys, brain, female
 * reproductive system) to a generated catalog: one extra model, one extra
 * layer and their meshes and teaching composites. Idempotent.
 */
export function withExtraOrgans(input: RawHumanCatalog): RawHumanCatalog {
  if (input.models.some((m) => m.id === EXTRA_MODEL_ID)) return { ...input };
  const ids = new Set(input.meshes.map((m) => m.id));
  const meshes = EXTRA_MESHES.filter((m) => !ids.has(m.id)).map((m) => ({ id: m.id, m: EXTRA_MODEL_ID, g: m.g, c: m.c, n: m.n, la: m.la, en: m.en, ...EXTRA_BOUNDS[m.id] }));
  const male = input.groups.find((g) => g.id === 'reprodutor');
  const groups = input.groups.map((g) => (g.id === 'reprodutor' && !/masculino/i.test(g.name) ? { ...g, name: `${g.name} (masculino)` } : g));
  if (!groups.some((g) => g.id === FEMALE_GROUP))
    groups.push({ id: FEMALE_GROUP, name: 'Sistema reprodutor (feminino)', modelId: EXTRA_MODEL_ID, color: '#D87A9A', defaultVisible: false, defaultOpacity: 1, order: (male?.order ?? 10) + 0.5 });
  groups.sort((a, b) => a.order - b.order);
  const compIds = new Set(input.composites.map((c) => c.id));
  return {
    ...input,
    models: [...input.models, { id: EXTRA_MODEL_ID, url: '', bytes: 0, label: 'Órgãos modelados pelo BioLab 3D' }],
    groups,
    meshes: [...input.meshes, ...meshes],
    composites: [...input.composites, ...EXTRA_ORGAN_COMPOSITES.filter((c) => !compIds.has(c.id))],
  };
}

function contentFor(id: string): HumanContent | undefined {
  return HUMAN_CONTENT[id] ?? HUMAN_CONTENT[baseId(id)];
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

export function buildHumanIndex(input: RawHumanCatalog): HumanIndex {
  const raw = withExtraOrgans(input);
  const known = new Set(raw.meshes.map((m) => m.id));
  const existing = new Set(raw.composites.map((c) => c.id));
  const extra = EXTRA_COMPOSITES.map((c) => ({ ...c, members: c.members.filter((m) => known.has(m)) })).filter((c) => c.members.length && !existing.has(c.id));
  raw.composites = [...raw.composites, ...extra];
  const modelled = new Set(EXTRA_MESHES.map((m) => m.id));
  const structures = new Map<string, Structure>();
  const meshInfo = new Map<string, CatalogMesh>();
  const members = new Map<string, string[]>();
  const meshIds = new Set(raw.meshes.map((m) => m.id));
  const compositeIds = new Set(raw.composites.map((c) => c.id));

  const resolveRelated = (ids: string[] | undefined): string[] =>
    (ids ?? [])
      .map((r) => (meshIds.has(r) || compositeIds.has(r) ? r : meshIds.has(`${r}-dir`) ? `${r}-dir` : null))
      .filter((r): r is string => !!r);

  const make = (id: string, name: string, latin: string | null, en: string, group: string, parent: string | null, meshes: string[], fallbackCategory: string): Structure => {
    const c = contentFor(id);
    return {
      id,
      laboratoryId: HUMAN_LAB_ID,
      modelId: raw.meshes.find((m) => m.id === meshes[0])?.m ?? group,
      parentStructureId: parent,
      namePtBR: name,
      scientificName: latin,
      sourceName: en,
      category: c?.category ?? fallbackCategory,
      biologicalSystem: GROUP_SYSTEM_NAME[group] ?? group,
      description: c?.description ?? null,
      function: c?.function ?? null,
      relatedStructures: resolveRelated(c?.related),
      educationalTopics: c?.topics ?? [GROUP_SYSTEM_NAME[group] ?? group],
      modelMeshIds: meshes,
      scientificReferences: (c?.refs ?? []).map((r) => REFS[r]),
      assetAttributions: meshes.every((m) => modelled.has(m)) ? [] : HUMAN_ATTRIBUTIONS,
      contentReviewed: !!c,
    };
  };

  for (const m of raw.meshes) {
    meshInfo.set(m.id, { id: m.id, modelId: m.m, group: m.g, material: m.c, center: m.ctr, size: m.sz });
    structures.set(m.id, make(m.id, m.n, m.la, m.en, m.g, raw.parents[m.id] ?? null, [m.id], 'Estrutura anatômica'));
    members.set(m.id, [m.id]);
  }
  for (const c of raw.composites) {
    structures.set(c.id, make(c.id, c.n, c.la, c.n, c.g, null, c.members, 'Conjunto de estruturas'));
    members.set(c.id, c.members);
  }

  const regions: Region[] = raw.regions.map((r) => ({ id: r.id, name: r.n, min: r.min, max: r.max }));
  const vol = (r: Region) => (r.max[0] - r.min[0]) * (r.max[1] - r.min[1]) * (r.max[2] - r.min[2]);
  const inside = (r: Region, p: readonly number[]) => p.every((v, i) => v >= r.min[i] && v <= r.max[i]);

  const regionMeshCache = new Map<string, string[]>();
  const searchable = [...structures.values()].map((s) => ({ s, key: normalize(`${s.namePtBR} ${s.scientificName ?? ''} ${s.sourceName}`) }));

  return {
    raw,
    structures,
    meshInfo,
    meshesOf: (id) => members.get(id) ?? (id.startsWith('regiao:') ? [] : []),
    structureOfMesh: (meshId) => meshId,
    regions,
    regionAt: (p) => {
      const hits = regions.filter((r) => inside(r, p)).sort((a, b) => vol(a) - vol(b));
      return hits[0] ?? null;
    },
    meshesInRegion: (regionId) => {
      let v = regionMeshCache.get(regionId);
      if (!v) {
        const r = regions.find((x) => x.id === regionId);
        v = r ? raw.meshes.filter((m) => m.g !== 'tegumentar' && inside(r, m.ctr)).map((m) => m.id) : [];
        regionMeshCache.set(regionId, v);
      }
      return v;
    },
    search: (q, limit = 30) => {
      const n = normalize(q);
      if (n.length < 2) return [];
      const terms = n.split(' ');
      const scored: { s: Structure; score: number }[] = [];
      for (const { s, key } of searchable) {
        if (!terms.every((t) => key.includes(t))) continue;
        const name = normalize(s.namePtBR);
        let score = 0;
        if (name === n) score += 100;
        if (name.startsWith(n)) score += 50;
        if (s.contentReviewed) score += 20;
        if (!s.parentStructureId && s.modelMeshIds.length > 1) score += 10;
        score -= name.length / 10;
        scored.push({ s, score });
      }
      return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.s);
    },
    hasContent: (id) => !!contentFor(id),
  };
}

export const SYSTEM_NOTE = (group: string) => SYSTEM_NOTES[group] ?? null;
