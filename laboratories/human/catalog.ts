/**
 * Human Anatomy catalog: turns the compact generated catalog
 * (public/models/human/v1/catalog.json) plus curated pt-BR content into
 * schema-conformant `Structure` objects and fast lookup indexes.
 */
import type { CatalogGroup, CatalogMesh, CatalogModel } from '@/engine/types';
import type { Attribution, Structure } from '@/data/biology/schema';
import { HUMAN_CONTENT, REFS, SYSTEM_NOTES, type HumanContent } from '@/data/biology/human/content';

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

export function buildHumanIndex(raw: RawHumanCatalog): HumanIndex {
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
      assetAttributions: HUMAN_ATTRIBUTIONS,
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
