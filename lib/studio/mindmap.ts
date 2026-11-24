/**
 * Mind map of a lesson: the lesson in the centre (3D picture), one branch per
 * part of the lesson with its own 3D picture or drawing and short leaves.
 */
import type { PackFigure, StudioPack } from '@/data/studio/pack';
import { clip, sentences } from './util';

export interface MindBranch {
  heading: string;
  image?: { src: string; line?: string };
  leaves: string[];
}

export interface MindMap {
  title: string;
  center?: { src: string; line?: string };
  terms: string[];
  branches: MindBranch[];
}

export const BRANCH_COLORS = ['#0e7490', '#7c3aed', '#c2410c', '#15803d', '#be185d', '#1d4ed8', '#a16207', '#4d7c0f'];

function pick(figs: PackFigure[]): MindBranch['image'] {
  // prefer a whole model (rich picture), then an isolated structure, both with a line drawing
  const f = figs.find((x) => x.image.line && x.image.kind === 'model') ?? figs.find((x) => x.image.line) ?? figs[0];
  return f ? { src: f.image.src, line: f.image.line } : undefined;
}

export function buildMindMap(pack: StudioPack): MindMap {
  const views = [...pack.diagrams.map((d) => ({ src: d.image.src, line: d.image.line })), ...(pack.cover ? [{ src: pack.cover.src, line: pack.cover.line }] : [])];
  const branches = pack.sections.slice(0, 8).map((s, i) => {
    const names = [...new Set(s.figures.map((f) => f.structure?.name).filter((n): n is string => !!n))];
    const pool = s.bullets.length ? s.bullets : names.length ? names : sentences(s.text);
    return { heading: s.heading, image: pick(s.figures) ?? views[i % Math.max(1, views.length)], leaves: pool.slice(0, 3).map((t) => clip(t.replace(/\.$/, ''), 70)) };
  });
  const d = pack.diagrams[0];
  return {
    title: pack.lesson.title,
    center: pack.cover ? { src: pack.cover.src, line: pack.cover.line } : d ? { src: d.image.src, line: d.image.line } : undefined,
    terms: pack.lesson.keyTerms.slice(0, 8),
    branches,
  };
}
