/**
 * Everything a Studio generator needs about one lesson, resolved on the
 * server from the lesson scripts, the lab catalogs and the 3D renders.
 * Pure data, passed to the client generators.
 */
import type { StudioImage } from './images';

export interface PackStructure {
  id: string;
  name: string;
  scientificName?: string;
  description?: string;
  function?: string;
}

export interface PackProcess {
  id: string;
  title: string;
  note: string;
  steps: { title: string; text: string }[];
}

/** One picture of a lesson action (a model, a structure or a step of an animation). */
export interface PackFigure {
  label: string;
  image: StudioImage;
  structure?: PackStructure;
  process?: PackProcess;
}

export interface PackSection {
  heading: string;
  text: string;
  bullets: string[];
  figures: PackFigure[];
}

/** A view of a model with numbered structures (for slides and activities). */
export interface PackDiagram {
  image: StudioImage;
  title: string;
  /** How many of the labels are structures this lesson talks about. */
  relevance?: number;
  /** Numbered labels, already chosen and spread out. Positions are fractions of the image. */
  labels: (PackStructure & { n: number; x: number; y: number })[];
}

export interface StudioPack {
  lab: { id: string; slug: string; title: string; accent: string };
  lesson: {
    id: string;
    title: string;
    unit: string;
    grade: string;
    minutes: number;
    summary: string;
    objectives: string[];
    keyTerms: string[];
    questions: { q: string; a: string }[];
    misconceptions: { wrong: string; right: string }[];
    refs: { title: string; publisher: string; url: string; license: string }[];
  };
  cover: StudioImage | null;
  sections: PackSection[];
  diagrams: PackDiagram[];
  /** Structures of the lesson with their content (glossary, quizzes). */
  structures: PackStructure[];
  /** Other structures of the same laboratory (wrong options in quizzes). */
  distractors: PackStructure[];
}

/** Lessons offered in the topic picker. */
export interface StudioLessonCard {
  id: string;
  laboratoryId: string;
  title: string;
  unit: string;
  grade: string;
  minutes: number;
  summary: string;
  thumb: string | null;
}
