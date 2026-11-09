import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildHumanIndex, type RawHumanCatalog } from '@/laboratories/human/catalog';
import { StructureSchema } from '@/data/biology/schema';
import { HUMAN_CONTENT } from '@/data/biology/human/content';
import { parseStudioParams, studioUrl } from '@/data/studio/contract';
import { pickDefaultQuality } from '@/engine/performance/quality';

const raw = JSON.parse(readFileSync(path.join(__dirname, '../../public/models/human/v1/catalog.json'), 'utf8')) as RawHumanCatalog;
const idx = buildHumanIndex(raw);

describe('human anatomy catalog', () => {
  it('every structure satisfies the shared schema', () => {
    for (const s of idx.structures.values()) StructureSchema.parse(s);
    expect(idx.structures.size).toBeGreaterThan(2000);
  });
  it('has unique mesh ids and every mesh belongs to a declared group and model', () => {
    const groups = new Set(raw.groups.map((g) => g.id));
    const models = new Set(raw.models.map((m) => m.id));
    const ids = new Set<string>();
    for (const m of raw.meshes) {
      expect(ids.has(m.id)).toBe(false);
      ids.add(m.id);
      expect(groups.has(m.g)).toBe(true);
      expect(models.has(m.m)).toBe(true);
    }
  });
  it('excludes components with non-commercial licences (kidney, inner ear)', () => {
    const bad = raw.meshes.filter((m) => /^(Kidney|Renal pelvis)|cochlea|semicircular|vestibule\b/i.test(m.en));
    expect(bad).toEqual([]);
  });
  it('curated content keys and related links resolve to real structures', () => {
    for (const [key, c] of Object.entries(HUMAN_CONTENT)) {
      const exists = idx.structures.has(key) || idx.structures.has(`${key}-dir`);
      expect(exists, `conteúdo sem estrutura: ${key}`).toBe(true);
      for (const r of c.related ?? []) {
        const ok = idx.structures.has(r) || idx.structures.has(`${r}-dir`);
        expect(ok, `${key} → relacionado inexistente: ${r}`).toBe(true);
      }
    }
  });
  it('maps curated content onto key structures (heart, humerus, testis)', () => {
    expect(idx.structures.get('coracao')?.contentReviewed).toBe(true);
    expect(idx.structures.get('humerus-dir')?.description).toMatch(/braço/);
    const testis = idx.structures.get('testis-esq')!;
    expect(testis.function).toMatch(/espermatozoides/);
    expect(testis.educationalTopics).toContain('Espermatogênese');
    expect(idx.meshesOf('coracao').length).toBeGreaterThan(5);
  });
  it('finds the right arm region from a point on the arm', () => {
    const h = raw.meshes.find((m) => m.id === 'humerus-dir')!;
    expect(idx.regionAt(h.ctr)?.id).toBe('braco-dir');
    const inArm = idx.meshesInRegion('braco-dir');
    expect(inArm).toContain('humerus-dir');
    expect(inArm.some((id) => id.includes('biceps'))).toBe(true);
  });
  it('search is accent-insensitive and ranks exact names first', () => {
    expect(idx.search('umero')[0].namePtBR).toMatch(/^Úmero/);
    expect(idx.search('coração')[0].id).toBe('coracao');
    expect(idx.search('x')).toEqual([]);
  });
});

describe('Explorer → Studio contract', () => {
  it('round-trips a topic reference through the URL', () => {
    const url = studioUrl({ laboratoryId: 'anatomia-humana', structureId: 'testis-dir' });
    const sp = Object.fromEntries(new URL(url, 'http://x').searchParams);
    expect(parseStudioParams(sp)).toEqual({ v: 1, laboratoryId: 'anatomia-humana', structureId: 'testis-dir' });
  });
  it('rejects injected or unknown values', () => {
    expect(parseStudioParams({ v: '1', lab: 'anatomia-humana', estrutura: '<script>' })).toBeNull();
    expect(parseStudioParams({ v: '1', lab: 'astronomia', estrutura: 'sol' })).toBeNull();
  });
});

describe('quality profile detection', () => {
  it('is conservative on weak or software-rendered devices', () => {
    expect(pickDefaultQuality({ gpuRenderer: 'Google SwiftShader' })).toBe('economico');
    expect(pickDefaultQuality({ cores: 4, memoryGB: 8 })).toBe('economico');
    expect(pickDefaultQuality({ cores: 8, memoryGB: 8, gpuRenderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620)' })).toBe('economico');
    expect(pickDefaultQuality({ cores: 8, memoryGB: 8, gpuRenderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics)' })).toBe('equilibrado');
    expect(pickDefaultQuality({ cores: 12, memoryGB: 16, gpuRenderer: 'NVIDIA GeForce RTX 3060' })).toBe('alta');
  });
});
