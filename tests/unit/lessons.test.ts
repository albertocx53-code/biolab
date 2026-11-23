import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { LESSON_REFS, LESSONS, lessonsFor } from '@/data/biology/lessons';
import { CELL_CATALOG } from '@/laboratories/cells/catalog';
import { CELL_PROCESSES } from '@/laboratories/cells/processes';
import { PLANT_CATALOG } from '@/laboratories/plants/catalog';
import { PLANT_PROCESSES } from '@/laboratories/plants/processes';
import { buildHumanIndex, type RawHumanCatalog } from '@/laboratories/human/catalog';
import { HUMAN_PROCESSES } from '@/laboratories/human/processes';

const raw = JSON.parse(readFileSync(path.join(__dirname, '../../public/models/human/v1/catalog.json'), 'utf8')) as RawHumanCatalog;
const human = buildHumanIndex(raw);
const humanGroups = new Set(human.raw.groups.map((g) => g.id));

describe('lesson scripts', () => {
  it('have unique ids and complete content', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of LESSONS) {
      expect(l.objectives.length).toBeGreaterThan(1);
      expect(l.sections.length).toBeGreaterThan(1);
      expect(l.questions.length).toBeGreaterThan(0);
      expect(l.keyTerms.length).toBeGreaterThan(2);
      for (const r of l.refs) expect(LESSON_REFS[r], `${l.id}: ref ${r}`).toBeDefined();
    }
    expect(lessonsFor('celulas').length).toBeGreaterThanOrEqual(10);
    expect(lessonsFor('anatomia-humana').length).toBeGreaterThanOrEqual(8);
    expect(lessonsFor('plantas').length).toBeGreaterThanOrEqual(2);
  });

  it('only point at structures, models and processes that exist in each laboratory', () => {
    for (const l of LESSONS) {
      for (const sec of l.sections) {
        for (const a of sec.actions ?? []) {
          const where = `${l.id} › ${sec.heading} › ${a.label}`;
          if (l.laboratoryId === 'celulas') {
            if (a.structure) expect(CELL_CATALOG.content[a.structure], where).toBeDefined();
            if (a.model) expect(CELL_CATALOG.model(a.model), where).toBeDefined();
            if (a.process) expect(CELL_PROCESSES[a.process as keyof typeof CELL_PROCESSES], where).toBeDefined();
            expect(a.group, where).toBeUndefined();
          } else if (l.laboratoryId === 'plantas') {
            if (a.structure) expect(PLANT_CATALOG.content[a.structure], where).toBeDefined();
            if (a.model) expect(PLANT_CATALOG.model(a.model), where).toBeDefined();
            if (a.process) expect(PLANT_PROCESSES[a.process as keyof typeof PLANT_PROCESSES], where).toBeDefined();
          } else {
            if (a.structure) expect(human.structures.has(a.structure) || human.structures.has(`${a.structure}-dir`), where).toBe(true);
            if (a.process) expect(HUMAN_PROCESSES[a.process], where).toBeDefined();
            if (a.group) expect(humanGroups.has(a.group), where).toBe(true);
            expect(a.model, where).toBeUndefined();
          }
        }
      }
    }
  });
});
