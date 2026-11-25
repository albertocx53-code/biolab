/**
 * Builds the Studio material pack of a lesson on the server: lesson script +
 * catalog content of its structures + process steps + 3D renders.
 */
import 'server-only';
import { LESSONS, LESSON_REFS, lessonById, type Lesson } from '@/data/biology/lessons';
import { LABORATORIES } from '@/data/biology/laboratories';
import type { LaboratoryId, Structure } from '@/data/biology/schema';
import type { StudioImage, StudioRenders } from '@/data/studio/images';
import type { PackDiagram, PackFigure, PackProcess, PackStructure, StudioLessonCard, StudioPack } from '@/data/studio/pack';
import rendersJson from '@/data/studio/renders.json';
import { resolveTopic } from '@/services/content/topics';
import { capitalize } from '@/lib/studio/util';
import type { LabProcess } from '@/laboratories/shared/process';
import { ANIMAL_PROCESSES } from '@/laboratories/animals/processes';
import { CELL_PROCESSES } from '@/laboratories/cells/processes';
import { GENETICS_PROCESSES } from '@/laboratories/genetics/processes';
import { HUMAN_PROCESSES } from '@/laboratories/human/processes';
import { MICROBE_PROCESSES } from '@/laboratories/microbes/processes';
import { PLANT_PROCESSES } from '@/laboratories/plants/processes';

const RENDERS = rendersJson as unknown as StudioRenders;

const PROCESSES: Record<string, Record<string, LabProcess>> = {
  animais: ANIMAL_PROCESSES,
  celulas: CELL_PROCESSES as Record<string, LabProcess>,
  genetica: GENETICS_PROCESSES,
  'anatomia-humana': HUMAN_PROCESSES,
  microrganismos: MICROBE_PROCESSES,
  plantas: PLANT_PROCESSES,
};

export function lessonCards(): StudioLessonCard[] {
  return LESSONS.map((l) => ({
    id: l.id,
    laboratoryId: l.laboratoryId,
    title: l.title,
    unit: l.unit,
    grade: l.grade,
    minutes: l.minutes,
    summary: l.summary,
    thumb: RENDERS[l.id]?.cover.src ?? null,
  }));
}

/** Lessons whose script shows the given structure (topic sent from a laboratory). */
export function lessonsShowing(lab: LaboratoryId, structureId: string): string[] {
  const base = structureId.replace(/-(dir|esq)(-\d+)?$/, '');
  return LESSONS.filter((l) => l.laboratoryId === lab && l.sections.some((s) => s.actions?.some((a) => a.structure === structureId || a.structure === base))).map((l) => l.id);
}

const cache = new Map<string, PackStructure | null>();

async function structureInfo(lab: LaboratoryId, id: string): Promise<PackStructure | null> {
  const key = `${lab}:${id}`;
  if (cache.has(key)) return cache.get(key)!;
  let s: Structure | null = await resolveTopic({ v: 1, laboratoryId: lab, structureId: id });
  if (!s && lab === 'anatomia-humana') s = await resolveTopic({ v: 1, laboratoryId: lab, structureId: `${id}-dir` });
  const info: PackStructure | null = s
    ? {
        id,
        name: s.namePtBR,
        scientificName: s.scientificName ?? undefined,
        description: s.description ?? undefined,
        function: s.function ?? undefined,
      }
    : null;
  cache.set(key, info);
  return info;
}

function processInfo(lab: LaboratoryId, id: string): PackProcess | undefined {
  const p = PROCESSES[lab]?.[id];
  return p ? { id: p.id, title: p.title, note: p.note, steps: p.steps.map((s) => ({ title: s.title, text: s.text })) } : undefined;
}

/** Picks up to `max` well spread, named structures of a render for numbered labels. */
/** "Rim (lado esquerdo)" → "Rim": a figure names the organ, not the side. */
const noSide = (name: string) => name.replace(/\s*\(lado (direito|esquerdo)\)/i, '');

async function diagram(lab: LaboratoryId, image: StudioImage, title: string, prefer: Set<string>, max = 8): Promise<PackDiagram | null> {
  if (!image.labels?.length) return null;
  // a dense model (the whole human body has hundreds of parts): only the parts this lesson talks about
  const dense = image.labels.length > 80;
  const preferNames = new Set<string>();
  for (const id of prefer) {
    const info = await structureInfo(lab, id);
    if (info) preferNames.add(noSide(info.name).toLowerCase());
  }
  const cands: { info: PackStructure; x: number; y: number; score: number; of?: string }[] = [];
  for (const l of image.labels) {
    if (l.vis < 0.04 || l.x < 0.05 || l.x > 0.95 || l.y < 0.06 || l.y > 0.94) continue;
    const byId = prefer.has(l.id) || prefer.has(l.id.replace(/-(dir|esq)(-\d+)?$/, ''));
    const info = await structureInfo(lab, l.id);
    if (!info) continue;
    // the lesson may name a part by its group ("pulmões") while the picture labels each piece
    const nm = noSide(info.name).toLowerCase();
    const preferred = byId || preferNames.has(nm);
    // "Lobo médio do pulmão direito" belongs to "Pulmão direito"
    const related = dense && !preferred ? [...preferNames].find((n) => n.length >= 5 && nm.includes(n)) : undefined;
    if (dense && !preferred && !related) continue;
    cands.push({ info, x: l.x, y: l.y, score: (preferred ? 1 : related ? 0.7 : 0) + Math.min(l.vis, 0.6), of: related });
  }
  cands.sort((a, b) => b.score - a.score);
  const picked: typeof cands = [];
  const names = new Set<string>();
  for (const c of cands) {
    const name = noSide(c.info.name).toLowerCase();
    // one piece per organ (not five branches of the same nerve)
    if (names.has(name) || (c.of && names.has(`of:${c.of}`))) continue;
    if (picked.some((p) => Math.hypot((p.x - c.x) * 1.6, p.y - c.y) < (dense ? 0.035 : 0.11))) continue;
    picked.push(c);
    names.add(name);
    if (c.of) names.add(`of:${c.of}`);
    if (picked.length >= max) break;
  }
  if (picked.length < 3) return null;
  // number them clockwise from the top, like a textbook figure
  const cx = picked.reduce((s, p) => s + p.x, 0) / picked.length;
  const cy = picked.reduce((s, p) => s + p.y, 0) / picked.length;
  picked.sort((a, b) => ang(a) - ang(b));
  function ang(p: { x: number; y: number }) {
    const t = Math.atan2((p.x - cx) * 1.6, -(p.y - cy));
    return t < 0 ? t + 2 * Math.PI : t;
  }
  return { image, title, relevance: picked.filter((p) => p.score >= 1).length, labels: picked.map((p, i) => ({ ...p.info, name: noSide(p.info.name), n: i + 1, x: p.x, y: p.y })) };
}

function splitMisconception(m: string): { wrong: string; right: string } {
  const r = /^\s*["“](.+?)["”]\s*[—–-]\s*(.+)$/.exec(m);
  return r ? { wrong: r[1].trim(), right: r[2].trim() } : { wrong: m, right: '' };
}

export async function buildPack(lessonId: string): Promise<StudioPack | null> {
  const lesson: Lesson | undefined = lessonById(lessonId);
  if (!lesson) return null;
  const lab = LABORATORIES.find((l) => l.id === lesson.laboratoryId)!;
  const renders = RENDERS[lesson.id];
  const labId = lesson.laboratoryId;

  const used = new Set<string>();
  for (const s of lesson.sections) for (const a of s.actions ?? []) if (a.structure) used.add(a.structure);

  const sections = [];
  const diagrams: PackDiagram[] = [];
  if (renders?.cover) {
    const d = await diagram(labId, renders.cover, lesson.title, used);
    if (d) diagrams.push(d);
  }
  for (const [si, sec] of lesson.sections.entries()) {
    const figures: PackFigure[] = [];
    for (const [ai, a] of (sec.actions ?? []).entries()) {
      const imgs = renders?.actions[`${si}-${ai}`];
      if (!imgs?.length) continue;
      const structure = a.structure ? ((await structureInfo(labId, a.structure)) ?? undefined) : undefined;
      const process = a.process ? processInfo(labId, a.process) : undefined;
      if (process) {
        figures.push({ label: a.label, image: imgs[0], process });
        for (const img of imgs.slice(1)) figures.push({ label: a.label, image: img, process });
      } else {
        figures.push({ label: a.label, image: imgs[0], structure });
        if ((a.model || a.group) && imgs[0].labels?.length && !diagrams.some((d) => d.image.src === imgs[0].src || (a.model && d.image.model === imgs[0].model && d.image.kind === 'model'))) {
          const d = await diagram(labId, imgs[0], capitalize(a.label.replace(/^Abrir (a |o )?/i, '')), used);
          if (d) diagrams.push(d);
        }
      }
    }
    sections.push({ heading: sec.heading, text: sec.text, bullets: sec.bullets ?? [], figures });
  }

  // the diagrams that show what this lesson is about come first; the lab's opening model
  // (e.g. the earthworm in a lesson on vertebrates) is dropped when a better one exists
  const capa = diagrams[0]?.image === renders?.cover ? diagrams.shift() : undefined;
  diagrams.sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
  if (capa) {
    const rel = (d: PackDiagram) => d.relevance ?? 0;
    if (!diagrams.length || (rel(capa) > 0 && rel(capa) > rel(diagrams[0]))) diagrams.unshift(capa);
    else if (rel(capa) > 0) diagrams.push(capa);
  }

  const structures: PackStructure[] = [];
  for (const id of used) {
    const info = await structureInfo(labId, id);
    if (info && !structures.some((s) => s.name === info.name)) structures.push(info);
  }
  const others = new Set<string>();
  for (const l of LESSONS) if (l.laboratoryId === labId && l.id !== lesson.id) for (const s of l.sections) for (const a of s.actions ?? []) if (a.structure && !used.has(a.structure)) others.add(a.structure);
  const distractors: PackStructure[] = [];
  for (const id of others) {
    const info = await structureInfo(labId, id);
    if (info && !structures.some((s) => s.name === info.name) && !distractors.some((s) => s.name === info.name)) distractors.push(info);
  }

  return {
    lab: { id: lab.id, slug: lab.slug, title: lab.title, accent: lab.accent },
    lesson: {
      id: lesson.id,
      title: lesson.title,
      unit: lesson.unit,
      grade: lesson.grade,
      minutes: lesson.minutes,
      summary: lesson.summary,
      objectives: lesson.objectives,
      keyTerms: lesson.keyTerms,
      questions: lesson.questions,
      misconceptions: (lesson.misconceptions ?? []).map(splitMisconception),
      refs: lesson.refs.map((r) => LESSON_REFS[r]).filter(Boolean),
    },
    cover: renders?.cover ?? null,
    sections,
    diagrams,
    structures,
    distractors,
  };
}
