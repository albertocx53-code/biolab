import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { StructureSchema } from '@/data/biology/schema';
import { MICROBE_CONTENT } from '@/data/biology/microbes/content';
import { MICROBE_CATALOG, MICROBE_MODELS, microbeStructure } from '@/laboratories/microbes/catalog';
import { buildConjugation, buildResistance, OFFSPRING, poseConjugation, poseResistance, RESISTANT } from '@/laboratories/microbes/conjugation';
import { MICROBE_MATERIALS } from '@/laboratories/microbes/materials';
import { buildMicrobeModel, poseBudding, posePhagocytosis, type MicrobeStaticModel } from '@/laboratories/microbes/models';
import { MICROBE_PROCESSES } from '@/laboratories/microbes/processes';
import { buildVirusCycle, poseLysogenic, poseLytic } from '@/laboratories/microbes/viruscycle';
import { formatBig, formatSize, growth, GROUPS, COMPARE_ROWS, SIZE_ITEMS, timesLarger } from '@/laboratories/microbes/tools/data';
import type { MeshDef } from '@/laboratories/shared/types';

describe('Laboratório de Microrganismos — catálogo', () => {
  it('todas as estruturas seguem o esquema e aparecem em algum modelo', () => {
    const all = MICROBE_CATALOG.all();
    expect(all.length).toBeGreaterThan(70);
    for (const s of all) expect(StructureSchema.safeParse(s).success, s.id).toBe(true);
    for (const [id, c] of Object.entries(MICROBE_CONTENT)) {
      for (const r of c.related ?? []) expect(MICROBE_CONTENT[r], `${id} → ${r}`).toBeDefined();
      if (c.parent) expect(MICROBE_CONTENT[c.parent], `${id} ⊂ ${c.parent}`).toBeDefined();
      expect(MICROBE_CATALOG.modelsShowing(id).length, `${id} não aparece em nenhum modelo`).toBeGreaterThan(0);
    }
  });

  it('processos citam estruturas do catálogo e cada modelo aponta processos existentes', () => {
    for (const p of Object.values(MICROBE_PROCESSES)) {
      for (const s of p.structures) expect(MICROBE_CONTENT[s], `${p.id} → ${s}`).toBeDefined();
      expect(p.note).toMatch(/esquemática/);
    }
    for (const m of MICROBE_MODELS) for (const p of m.processes) expect(MICROBE_PROCESSES[p], `${m.id} → ${p}`).toBeDefined();
  });

  it('busca com sinônimos', () => {
    expect(MICROBE_CATALOG.search('fermento', 'bacterias')[0].id).toBe('levedura');
    expect(MICROBE_CATALOG.search('spike', 'bacterias')[0].id).toBe('espicula');
    expect(MICROBE_CATALOG.search('falso pe', 'bacterias')[0].id).toBe('pseudopode');
    expect(MICROBE_CATALOG.search('colera', 'bacterias')[0].id).toBe('vibriao');
    expect(microbeStructure('plasmideo')?.laboratoryId).toBe('microrganismos');
  });
});

const check = (id: string, meshes: MeshDef[], structures: string[]) => {
  const ids = meshes.map((m) => m.id);
  expect(new Set(ids).size, `${id}: ids repetidos`).toBe(ids.length);
  const have = new Set(meshes.map((m) => m.structure));
  for (const s of structures) expect(have.has(s), `${id}: ${s} sem malha`).toBe(true);
  for (const m of meshes) {
    expect(structures, `${id}: ${m.structure} fora da legenda`).toContain(m.structure);
    expect(MICROBE_MATERIALS[m.cls ?? m.structure], `material de ${m.cls ?? m.structure}`).toBeDefined();
    expect(m.geometry.getAttribute('color'), `${m.id} sem cor`).toBeDefined();
    const pos = m.geometry.getAttribute('position');
    expect(pos.count, m.id).toBeGreaterThan(0);
    for (let i = 0; i < pos.count; i += 97) expect(Number.isFinite(pos.getX(i) + pos.getY(i) + pos.getZ(i)), m.id).toBe(true);
  }
};

const registry = (meshes: MeshDef[]) => {
  const map = new Map(meshes.map((m) => [m.id, new THREE.Mesh(m.geometry)]));
  return { map, get: (id: string) => map.get(id) };
};
const visible = (o: THREE.Object3D | undefined) => !!o && o.scale.x > 0.01;
const model = (id: string) => MICROBE_MODELS.find((m) => m.id === id)!;

describe('Laboratório de Microrganismos — modelos 3D', () => {
  for (const info of MICROBE_MODELS.filter((m) => m.kind !== 'processo')) {
    it(`${info.label}: cada parte da legenda tem malha colorida e válida`, () => {
      check(info.id, buildMicrobeModel(info.id as MicrobeStaticModel).meshes, info.structures);
    });
  }

  it('ciclo lítico: o fago pousa, injeta o DNA, novos vírus se formam e a bactéria se rompe', () => {
    const sc = buildVirusCycle();
    check('ciclo-viral', sc.meshes, model('ciclo-viral').structures);
    const { get } = registry(sc.meshes);
    poseLytic(0, get);
    expect(visible(get('novo-0-cabeca'))).toBe(false);
    expect(visible(get('bac-parede'))).toBe(true);
    poseLytic(3.5, get);
    expect(visible(get('novo-0-cabeca'))).toBe(true);
    poseLytic(4.9, get);
    expect(visible(get('bac-parede'))).toBe(false);
    expect(visible(get('frag-0'))).toBe(true);
    expect(get('novo-0-cabeca')!.position.length()).toBeGreaterThan(2);
  });

  it('ciclo lisogênico: o prófago aparece e as duas filhas o carregam', () => {
    const { get } = registry(buildVirusCycle().meshes);
    poseLysogenic(1.9, get);
    expect(visible(get('profago'))).toBe(true);
    poseLysogenic(2.9, get);
    expect(visible(get('filha-a-profago'))).toBe(true);
    expect(visible(get('filha-b-profago'))).toBe(true);
    expect(visible(get('bac-parede'))).toBe(false);
  });

  it('conjugação: o pilus se estende e a receptora termina com o plasmídeo', () => {
    const sc = buildConjugation();
    check('conjugacao', sc.meshes, model('conjugacao').structures);
    const { get } = registry(sc.meshes);
    poseConjugation(0.9, get);
    expect(get('pilus')!.scale.x).toBeGreaterThan(0.5);
    expect(visible(get('receptora-plasmideo'))).toBe(false);
    poseConjugation(2.5, get);
    expect(visible(get('fita-2'))).toBe(true);
    poseConjugation(4.9, get);
    expect(visible(get('receptora-plasmideo'))).toBe(true);
  });

  it('resistência: as sensíveis morrem e só as resistentes se multiplicam', () => {
    const sc = buildResistance();
    check('resistencia', sc.meshes, model('resistencia').structures);
    const { get } = registry(sc.meshes);
    poseResistance(0.5, get);
    expect(visible(get('bac-0'))).toBe(true);
    poseResistance(2.5, get);
    expect(visible(get('bac-0'))).toBe(false);
    expect(visible(get(`bac-${RESISTANT[0]}`))).toBe(true);
    expect(visible(get('filha-0'))).toBe(false);
    poseResistance(4.5, get);
    expect(visible(get(`filha-${OFFSPRING - 1}`))).toBe(true);
  });

  it('brotamento e fagocitose', () => {
    const lv = registry(buildMicrobeModel('levedura').meshes);
    poseBudding(0.2, lv.get);
    const small = lv.get('broto')!.scale.x;
    poseBudding(3.9, lv.get);
    expect(lv.get('broto')!.scale.x).toBeGreaterThan(small * 2);
    expect(visible(lv.get('broto-nucleo'))).toBe(true);
    const am = registry(buildMicrobeModel('ameba').meshes);
    posePhagocytosis(0.5, am.get);
    expect(visible(am.get('am-fagossomo'))).toBe(false);
    posePhagocytosis(2.5, am.get);
    expect(visible(am.get('am-fagossomo'))).toBe(true);
    expect(am.get('am-alimento')!.position.x).toBeLessThan(3.5);
  });
});

describe('Microrganismos — ferramentas de aula', () => {
  it('escala de tamanhos', () => {
    expect(formatSize(0.1)).toBe('100 nm');
    expect(formatSize(2)).toBe('2 µm');
    expect(formatSize(500)).toBe('500 µm');
    expect(timesLarger(500, 2)).toBe(250);
    expect(timesLarger(2, 0.1)).toBe(20);
    expect(SIZE_ITEMS.find((s) => s.id === 'coronavirus')!.um).toBeLessThan(SIZE_ITEMS.find((s) => s.id === 'bacteria')!.um);
  });

  it('comparação: cada grupo responde todas as linhas', () => {
    for (const g of GROUPS) for (const r of COMPARE_ROWS) expect(g.facts[r.id], `${g.id}.${r.id}`).toBeTruthy();
    expect(GROUPS.find((g) => g.id === 'virus')!.facts.tratamento).toMatch(/NÃO/);
  });

  it('crescimento bacteriano: N = N0 · 2^n', () => {
    expect(growth(1, 20, 60)).toEqual({ generations: 3, n: 8 });
    expect(growth(10, 30, 120).n).toBe(160);
    const f = formatBig(growth(1, 20, 8 * 60).n);
    expect(f.exponent).toBe(7);
    expect(f.mantissa).toBe('1,7');
  });
});
