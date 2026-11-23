import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { buildHumanIndex, type RawHumanCatalog } from '@/laboratories/human/catalog';
import { EXTRA_BOUNDS, EXTRA_MESHES, EXTRA_ORGAN_COMPOSITES, FEMALE_GROUP } from '@/laboratories/human/extra-catalog';
import { buildExtraOrgans, measure } from '@/laboratories/human/organs';
import { HUMAN_MATERIALS } from '@/laboratories/human/materials';

const raw = JSON.parse(readFileSync(path.join(__dirname, '../../public/models/human/v1/catalog.json'), 'utf8')) as RawHumanCatalog;
const idx = buildHumanIndex(raw);
const geos = buildExtraOrgans();

describe('organs modelled by BioLab (kidneys, brain, female reproductive system)', () => {
  it('builds a closed, non-empty geometry for every catalog entry', () => {
    for (const m of EXTRA_MESHES) {
      const g = geos.get(m.id);
      expect(g, m.id).toBeDefined();
      expect(g!.getIndex()!.count, m.id).toBeGreaterThan(100);
      const pos = g!.getAttribute('position').array as Float32Array;
      expect(pos.every(Number.isFinite), m.id).toBe(true);
      expect(HUMAN_MATERIALS[m.c], `material ${m.c}`).toBeDefined();
    }
    expect(geos.size).toBe(EXTRA_MESHES.length);
  });

  it('keeps the catalog bounds in sync with the geometry', () => {
    for (const [id, b] of measure(geos)) {
      const e = EXTRA_BOUNDS[id];
      expect(e, id).toBeDefined();
      for (let i = 0; i < 3; i++) {
        expect(Math.abs(e.ctr[i] - b.ctr[i]), `${id} ctr`).toBeLessThan(0.002);
        expect(Math.abs(e.sz[i] - b.sz[i]), `${id} sz`).toBeLessThan(0.002);
      }
    }
  });

  it('sits at the right landmarks of the body', () => {
    const box = (id: string) => new THREE.Box3().setFromBufferAttribute(geos.get(id)!.getAttribute('position') as THREE.BufferAttribute);
    // kidneys around the intrarenal vessels, left one higher than the right one
    const kl = box('cortex-renal-esq').getCenter(new THREE.Vector3());
    const kr = box('cortex-renal-dir').getCenter(new THREE.Vector3());
    expect(kl.x).toBeGreaterThan(0.04);
    expect(kr.x).toBeLessThan(-0.04);
    expect(kl.y).toBeGreaterThan(kr.y);
    expect(box('cortex-renal-esq').containsPoint(new THREE.Vector3(0.062, 1.11, -0.018))).toBe(true);
    // brain inside the skull, above the pituitary
    const brain = new THREE.Box3();
    for (const id of idx.meshesOf('encefalo')) brain.union(box(id));
    expect(brain.max.y).toBeLessThan(1.72);
    expect(brain.min.y).toBeLessThan(1.56); // brainstem reaches the spinal cord
    expect(Math.abs(brain.max.x + brain.min.x)).toBeLessThan(0.002); // symmetric
    // uterus above the bladder, ovaries lateral
    expect(box('utero').getCenter(new THREE.Vector3()).y).toBeGreaterThan(0.86);
    expect(box('ovario-esq').getCenter(new THREE.Vector3()).x).toBeGreaterThan(0.03);
  });

  it('joins the catalog: layer, composites, content and no external attribution', () => {
    expect(idx.raw.groups.find((g) => g.id === FEMALE_GROUP)?.defaultVisible).toBe(false);
    expect(idx.raw.groups.find((g) => g.id === 'reprodutor')?.name).toMatch(/masculino/);
    for (const c of EXTRA_ORGAN_COMPOSITES) expect(idx.meshesOf(c.id).length, c.id).toBe(c.members.length);
    for (const id of ['rins', 'rim-esq', 'cortex-renal-dir', 'encefalo', 'cerebelo', 'lobo-frontal-esq', 'hipotalamo', 'utero', 'ovario-dir', 'tuba-uterina-esq']) {
      const s = idx.structures.get(id)!;
      expect(s.contentReviewed, id).toBe(true);
      expect(s.assetAttributions, id).toEqual([]);
    }
    expect(idx.search('cerebelo')[0].id).toBe('cerebelo');
    expect(idx.search('utero')[0].id).toBe('utero');
  });
});
