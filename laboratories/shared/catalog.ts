/**
 * Generic catalog for the procedural laboratories: models, curated content
 * and schema-conformant `Structure` objects. Pure data (no Three.js), so it is
 * shared by the 3D labs and by Studio on the server.
 */
import type { Attribution, Reference, Structure } from '@/data/biology/schema';

type LabId = Structure['laboratoryId'];

export interface LabContent {
  name: string;
  scientificName?: string;
  /** English term (stable, used for search and for Studio). */
  en: string;
  category: string;
  parent?: string;
  description: string;
  function: string;
  educational?: string;
  /** Typical real size, shown because the models are out of scale. */
  size?: string;
  related?: string[];
  topics: string[];
  refs: string[];
  /** Extra search words (synonyms used in Brazilian textbooks). */
  aliases?: string[];
}

export interface LabModelInfo<Id extends string = string> {
  id: Id;
  label: string;
  short: string;
  /** Sidebar row: primary models first, then details/processes. */
  kind: string;
  /** Real size, shown next to the "fora de escala" warning. */
  realSize: string;
  summary: string;
  /** Structures that have meshes in this model, in legend order. */
  structures: string[];
  /** Structure this detailed model zooms into. */
  detailOf?: string;
  processes: string[];
}

export interface LabCatalog<Id extends string = string> {
  labId: LabId;
  models: LabModelInfo<Id>[];
  content: Record<string, LabContent>;
  model(id: string): LabModelInfo<Id> | undefined;
  structure(id: string, modelId?: string): Structure | undefined;
  all(): Structure[];
  modelsShowing(id: string): LabModelInfo<Id>[];
  search(q: string, currentModel: string, limit?: number): Structure[];
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

export function createCatalog<Id extends string>(opts: {
  labId: LabId;
  models: LabModelInfo<Id>[];
  content: Record<string, LabContent>;
  refs: Record<string, Reference>;
  attributions?: Attribution[];
}): LabCatalog<Id> {
  const { labId, models, content, refs } = opts;
  const model = (id: string) => models.find((m) => m.id === id);

  const modelsShowing = (id: string) =>
    models.filter((m) => m.structures.includes(id) || m.detailOf === id || m.structures.some((s) => content[s]?.parent === id));

  function toStructure(id: string, home?: LabModelInfo<Id>): Structure | undefined {
    const c = content[id];
    if (!c) return undefined;
    const m = home ?? models.find((x) => x.structures.includes(id) || x.detailOf === id) ?? modelsShowing(id)[0] ?? models[0];
    return {
      id,
      laboratoryId: labId,
      modelId: m.id,
      parentStructureId: c.parent ?? null,
      namePtBR: c.name,
      scientificName: c.scientificName ?? null,
      sourceName: c.en,
      category: c.category,
      biologicalSystem: m.label,
      description: c.description,
      function: c.function,
      relatedStructures: (c.related ?? []).filter((r) => r in content),
      educationalTopics: c.topics,
      modelMeshIds: [],
      scientificReferences: c.refs.map((r) => refs[r]),
      assetAttributions: opts.attributions ?? [],
      contentReviewed: false,
    };
  }

  const index = Object.entries(content).map(([id, c]) => ({
    id,
    name: normalize(c.name),
    extra: normalize([c.en, c.scientificName ?? '', ...(c.aliases ?? [])].join(' ')),
  }));

  /** Structures visible in the current model come first; others still appear (selecting them switches model). */
  function search(q: string, currentModel: string, limit = 12): Structure[] {
    const n = normalize(q);
    if (n.length < 2) return [];
    const words = n.split(' ');
    const here = model(currentModel);
    const scored: { id: string; score: number }[] = [];
    for (const e of index) {
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

  return {
    labId,
    models,
    content,
    model,
    structure: (id, modelId) => toStructure(id, modelId ? model(modelId) : undefined),
    all: () => Object.keys(content).map((id) => toStructure(id)!),
    modelsShowing,
    search,
  };
}
