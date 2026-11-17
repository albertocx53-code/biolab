/**
 * Classroom lesson scripts ("roteiros de aula"): the main topics of a
 * high-school Biology course, written for the teacher to present with the
 * 3D laboratories. Each section can point at structures, models and animations
 * of its laboratory, so a click in the script drives the 3D scene.
 */
import type { LaboratoryId } from '@/data/biology/schema';

export interface LessonAction {
  label: string;
  /** Selects a structure of the laboratory (focus + scientific panel). */
  structure?: string;
  /** Starts an animated process. */
  process?: string;
  /** Switches to a model of a procedural laboratory (e.g. 'vegetal'). */
  model?: string;
  /** Shows a layer/system group of the laboratory (e.g. 'nervoso' in the human body). */
  group?: string;
}

export interface LessonSection {
  heading: string;
  text: string;
  /** Short list of facts, examples or steps shown as bullets. */
  bullets?: string[];
  actions?: LessonAction[];
}

export interface Lesson {
  id: string;
  laboratoryId: LaboratoryId;
  /** Curriculum block (e.g. Citologia, Fisiologia humana). */
  unit: string;
  title: string;
  /** Typical year of high school in Brazil. */
  grade: string;
  /** Suggested duration, in minutes. */
  minutes: number;
  summary: string;
  objectives: string[];
  sections: LessonSection[];
  keyTerms: string[];
  /** Questions to ask the class (with a short expected answer). */
  questions: { q: string; a: string }[];
  /** Common misconceptions to address. */
  misconceptions?: string[];
  /** Reference keys (OpenStax books). */
  refs: string[];
}
