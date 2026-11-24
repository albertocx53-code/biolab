import type { LaboratoryId } from '@/data/biology/schema';
import { CELL_LESSONS } from './cells';
import { HUMAN_LESSONS } from './human';
import { PLANT_LESSONS } from './plants';
import { GENETICS_LESSONS } from './genetics';
import type { Lesson } from './types';

export type { Lesson, LessonAction, LessonSection } from './types';

/** Open textbooks used to check the lesson scripts (keys used in `Lesson.refs`). */
export const LESSON_REFS: Record<string, { title: string; publisher: string; url: string; license: string }> = {
  'bio-4': ref('Biology 2e, cap. 4 — Estrutura celular', 'biology-2e/pages/4-introduction'),
  'bio-5': ref('Biology 2e, cap. 5 — Estrutura e função das membranas', 'biology-2e/pages/5-introduction'),
  'bio-7': ref('Biology 2e, cap. 7 — Respiração celular', 'biology-2e/pages/7-introduction'),
  'bio-8': ref('Biology 2e, cap. 8 — Fotossíntese', 'biology-2e/pages/8-introduction'),
  'bio-10': ref('Biology 2e, cap. 10 — Reprodução celular', 'biology-2e/pages/10-introduction'),
  'bio-11': ref('Biology 2e, cap. 11 — Meiose e reprodução sexuada', 'biology-2e/pages/11-introduction'),
  'bio-12': ref('Biology 2e, cap. 12 — Experimentos de Mendel e herança', 'biology-2e/pages/12-introduction'),
  'bio-13': ref('Biology 2e, cap. 13 — Genética moderna da herança', 'biology-2e/pages/13-introduction'),
  'bio-14': ref('Biology 2e, cap. 14 — DNA: estrutura e função', 'biology-2e/pages/14-introduction'),
  'bio-15': ref('Biology 2e, cap. 15 — Genes e proteínas', 'biology-2e/pages/15-introduction'),
  'bio-21': ref('Biology 2e, cap. 21 — Vírus', 'biology-2e/pages/21-introduction'),
  'bio-22': ref('Biology 2e, cap. 22 — Procariontes', 'biology-2e/pages/22-introduction'),
  'bio-26': ref('Biology 2e, cap. 26 — Plantas com sementes', 'biology-2e/pages/26-introduction'),
  'bio-30': ref('Biology 2e, cap. 30 — Forma e fisiologia das plantas', 'biology-2e/pages/30-introduction'),
  'bio-31': ref('Biology 2e, cap. 31 — Nutrição do solo e das plantas', 'biology-2e/pages/31-introduction'),
  'bio-32': ref('Biology 2e, cap. 32 — Reprodução das plantas', 'biology-2e/pages/32-introduction'),
  'ap-7': ref('Anatomy and Physiology 2e, cap. 7 — Esqueleto axial', 'anatomy-and-physiology-2e/pages/7-introduction'),
  'ap-10': ref('Anatomy and Physiology 2e, cap. 10 — Tecido muscular', 'anatomy-and-physiology-2e/pages/10-introduction'),
  'ap-12': ref('Anatomy and Physiology 2e, cap. 12 — Sistema nervoso e tecido nervoso', 'anatomy-and-physiology-2e/pages/12-introduction'),
  'ap-13': ref('Anatomy and Physiology 2e, cap. 13 — Anatomia do sistema nervoso', 'anatomy-and-physiology-2e/pages/13-introduction'),
  'ap-14': ref('Anatomy and Physiology 2e, cap. 14 — Sistema nervoso somático', 'anatomy-and-physiology-2e/pages/14-introduction'),
  'ap-17': ref('Anatomy and Physiology 2e, cap. 17 — Sistema endócrino', 'anatomy-and-physiology-2e/pages/17-introduction'),
  'ap-19': ref('Anatomy and Physiology 2e, cap. 19 — Sistema cardiovascular: o coração', 'anatomy-and-physiology-2e/pages/19-introduction'),
  'ap-20': ref('Anatomy and Physiology 2e, cap. 20 — Vasos sanguíneos e circulação', 'anatomy-and-physiology-2e/pages/20-introduction'),
  'ap-21': ref('Anatomy and Physiology 2e, cap. 21 — Sistema linfático e imune', 'anatomy-and-physiology-2e/pages/21-introduction'),
  'ap-22': ref('Anatomy and Physiology 2e, cap. 22 — Sistema respiratório', 'anatomy-and-physiology-2e/pages/22-introduction'),
  'ap-23': ref('Anatomy and Physiology 2e, cap. 23 — Sistema digestório', 'anatomy-and-physiology-2e/pages/23-introduction'),
  'ap-25': ref('Anatomy and Physiology 2e, cap. 25 — Sistema urinário', 'anatomy-and-physiology-2e/pages/25-introduction'),
  'ap-27': ref('Anatomy and Physiology 2e, cap. 27 — Sistema reprodutor', 'anatomy-and-physiology-2e/pages/27-introduction'),
  'ap-28': ref('Anatomy and Physiology 2e, cap. 28 — Desenvolvimento e herança', 'anatomy-and-physiology-2e/pages/28-introduction'),
};

function ref(title: string, path: string) {
  return { title, publisher: 'OpenStax (Rice University)', url: `https://openstax.org/books/${path}`, license: 'CC BY 4.0' };
}

export const LESSONS: Lesson[] = [...CELL_LESSONS, ...HUMAN_LESSONS, ...PLANT_LESSONS, ...GENETICS_LESSONS];

export function lessonsFor(lab: LaboratoryId): Lesson[] {
  return LESSONS.filter((l) => l.laboratoryId === lab);
}

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
