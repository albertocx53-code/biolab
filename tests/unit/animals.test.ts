import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { StructureSchema } from '@/data/biology/schema';
import { ANIMAL_CONTENT } from '@/data/biology/animals/content';
import { ANIMAL_CATALOG, ANIMAL_MODELS, animalStructure } from '@/laboratories/animals/catalog';
import { buildDevelopment, GASTRULA_DEPTHS, poseButterfly, poseEmbryo, poseFrogMeta } from '@/laboratories/animals/development';
import { buildInvertebrate, poseFiltration, poseHydraBud, type InvertebrateModel } from '@/laboratories/animals/invertebrates';
import { ANIMAL_MATERIALS } from '@/laboratories/animals/materials';
import { ANIMAL_PROCESSES } from '@/laboratories/animals/processes';
import { buildVertebrate, poseHearts, type VertebrateModel } from '@/laboratories/animals/vertebrates';
import { allInnovations, GROUPS, KEY_QUESTIONS, KEY_RESULTS, KEY_START, layoutTree, SYSTEMS, TREE, walkKey } from '@/laboratories/animals/tools/data';
import type { MeshDef } from '@/laboratories/shared/types';

describe('Laboratório de Animais — catálogo', () => {
  it('todas as estruturas seguem o esquema e aparecem em algum modelo', () => {
    const all = ANIMAL_CATALOG.all();
    expect(all.length).toBeGreaterThan(110);
    for (const s of all) expect(StructureSchema.safeParse(s).success, s.id).toBe(true);
    for (const [id, c] of Object.entries(ANIMAL_CONTENT)) {
      for (const r of c.related ?? []) expect(ANIMAL_CONTENT[r], `${id} → ${r}`).toBeDefined();
      expect(ANIMAL_CATALOG.modelsShowing(id).length, `${id} não aparece em nenhum modelo`).toBeGreaterThan(0);
    }
    for (const m of ANIMAL_MODELS) for (const s of m.structures) expect(ANIMAL_CONTENT[s], `${m.id} → ${s}`).toBeDefined();
  });

  it('processos citam estruturas do catálogo e cada modelo aponta processos existentes', () => {
    for (const p of Object.values(ANIMAL_PROCESSES)) {
      for (const s of p.structures) expect(ANIMAL_CONTENT[s], `${p.id} → ${s}`).toBeDefined();
      expect(p.note).toMatch(/esquemática/);
    }
    for (const m of ANIMAL_MODELS) for (const p of m.processes) expect(ANIMAL_PROCESSES[p], `${m.id} → ${p}`).toBeDefined();
  });

  it('busca com sinônimos', () => {
    expect(ANIMAL_CATALOG.search('guelras', 'minhoca')[0].id).toBe('branquias');
    expect(ANIMAL_CATALOG.search('celulas flama', 'minhoca')[0].id).toBe('protonefridios');
    expect(ANIMAL_CATALOG.search('crisalida', 'minhoca')[0].id).toBe('pupa');
    expect(ANIMAL_CATALOG.search('celenterados', 'minhoca')[0].id).toBe('cnidarios');
    expect(animalStructure('clitelo')?.laboratoryId).toBe('animais');
  });
});

const check = (id: string, meshes: MeshDef[], structures: string[]) => {
  const ids = meshes.map((m) => m.id);
  expect(new Set(ids).size, `${id}: ids repetidos`).toBe(ids.length);
  const have = new Set(meshes.map((m) => m.structure));
  for (const s of structures) expect(have.has(s), `${id}: ${s} sem malha`).toBe(true);
  for (const m of meshes) {
    expect(structures, `${id}: ${m.structure} fora da legenda`).toContain(m.structure);
    expect(ANIMAL_MATERIALS[m.cls ?? m.structure], `material de ${m.cls ?? m.structure}`).toBeDefined();
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
const model = (id: string) => ANIMAL_MODELS.find((m) => m.id === id)!;
const INV = ['esponja', 'hidra', 'planaria', 'minhoca', 'gafanhoto', 'estrela-do-mar'];
const VERT = ['peixe', 'sapo', 'ave', 'coracoes'];

describe('Laboratório de Animais — modelos 3D', () => {
  for (const id of INV) it(`${id}: cada parte da legenda tem malha colorida e válida`, () => check(id, buildInvertebrate(id as InvertebrateModel).meshes, model(id).structures));
  for (const id of VERT) it(`${id}: cada parte da legenda tem malha colorida e válida`, () => check(id, buildVertebrate(id as VertebrateModel).meshes, model(id).structures));
  for (const id of ['embriao', 'metamorfose-sapo', 'metamorfose-borboleta'] as const)
    it(`${id}: cada parte da legenda tem malha colorida e válida`, () => check(id, buildDevelopment(id).meshes, model(id).structures));

  it('filtração: a água entra pelos poros e sai pelo ósculo; o alimento é digerido', () => {
    const { get } = registry(buildInvertebrate('esponja').meshes);
    poseFiltration(0.6, get);
    expect(visible(get('agua-0'))).toBe(true);
    const y0 = get('agua-0')!.position.y;
    poseFiltration(2.5, get);
    expect(get('agua-0')!.position.y).toBeGreaterThan(y0);
    expect(visible(get('alim-0'))).toBe(false);
  });

  it('brotamento da hidra: o broto cresce, ganha tentáculos e se solta', () => {
    const { get } = registry(buildInvertebrate('hidra').meshes);
    poseHydraBud(0.5, get);
    expect(visible(get('hy-broto-tent'))).toBe(false);
    const x0 = get('hy-broto')!.position.x;
    poseHydraBud(2.9, get);
    expect(visible(get('hy-broto-tent'))).toBe(true);
    poseHydraBud(3.95, get);
    expect(get('hy-broto')!.position.x).toBeGreaterThan(x0 + 1);
  });

  it('circulação comparada: o peixe só tem sangue venoso; os outros recebem os dois', () => {
    const { get } = registry(buildVertebrate('coracoes').meshes);
    poseHearts(0.5, get);
    expect(visible(get('sv-0'))).toBe(true);
    expect(visible(get('sa-0'))).toBe(false);
    poseHearts(3.5, get);
    expect(visible(get('sa-0'))).toBe(true);
  });

  it('embrião: zigoto → clivagem → mórula → blástula → gástrula com mesoderme', () => {
    const { get } = registry(buildDevelopment('embriao').meshes);
    poseEmbryo(0, get);
    expect(visible(get('em-zigoto'))).toBe(true);
    expect(visible(get('em-c2'))).toBe(false);
    poseEmbryo(1.1, get);
    expect(visible(get('em-c2'))).toBe(true);
    poseEmbryo(1.9, get);
    expect(visible(get('em-c8'))).toBe(true);
    poseEmbryo(3.5, get);
    expect(visible(get('em-blastula'))).toBe(true);
    poseEmbryo(4.95, get);
    expect(visible(get(`em-endo-${GASTRULA_DEPTHS.length - 1}`))).toBe(true);
    expect(visible(get('em-mesoderme'))).toBe(false);
    poseEmbryo(5.9, get);
    expect(visible(get('em-mesoderme'))).toBe(true);
  });

  it('metamorfose do sapo: ovos, girino com brânquias, patas, cauda reabsorvida, sapo', () => {
    const { get } = registry(buildDevelopment('metamorfose-sapo').meshes);
    poseFrogMeta(0.5, get);
    expect(visible(get('mf-ovos'))).toBe(true);
    expect(visible(get('mf-girino'))).toBe(false);
    poseFrogMeta(1.8, get);
    expect(visible(get('mf-branquias'))).toBe(true);
    poseFrogMeta(2.9, get);
    expect(visible(get('mf-patas-tras'))).toBe(true);
    poseFrogMeta(3.95, get);
    expect(get('mf-cauda')!.scale.x).toBeLessThan(0.4);
    poseFrogMeta(4.95, get);
    expect(visible(get('mf-sapo'))).toBe(true);
    expect(visible(get('mf-girino'))).toBe(false);
  });

  it('metamorfose completa: ovo, lagarta, pupa e borboleta abrindo as asas', () => {
    const { get } = registry(buildDevelopment('metamorfose-borboleta').meshes);
    poseButterfly(0.5, get);
    expect(visible(get('mb-ovos'))).toBe(true);
    poseButterfly(1.6, get);
    expect(visible(get('mb-lagarta'))).toBe(true);
    poseButterfly(3.5, get);
    expect(visible(get('mb-pupa'))).toBe(true);
    expect(visible(get('mb-asa-e'))).toBe(false);
    poseButterfly(4.75, get);
    expect(visible(get('mb-asa-e'))).toBe(true);
    expect(Math.abs(get('mb-asa-e')!.rotation.x)).toBeLessThan(0.6);
  });
});

describe('Laboratório de Animais — ferramentas de aula', () => {
  it('a chave dicotômica chega a todos os grupos e não tem pontas soltas', () => {
    const reached = new Set<string>();
    const walk = (id: string, depth: number) => {
      expect(depth).toBeLessThan(15);
      if (KEY_RESULTS[id]) return void reached.add(id);
      const q = KEY_QUESTIONS[id];
      expect(q, id).toBeDefined();
      walk(q.yes, depth + 1);
      walk(q.no, depth + 1);
    };
    walk(KEY_START, 0);
    expect([...reached].sort()).toEqual(Object.keys(KEY_RESULTS).sort());
    expect(walkKey([false]).result?.id).toBe('poriferos');
    expect(walkKey([true, false, true, false, false, false, true]).result?.id).toBe('mamiferos');
    expect(walkKey([true, false, false, false, false, false, true]).result?.id).toBe('anelideos');
  });

  it('a comparação tem todos os sistemas para todos os grupos', () => {
    for (const g of GROUPS) for (const s of SYSTEMS) expect(g.facts[s.id], `${g.id}.${s.id}`).toBeTruthy();
  });

  it('a árvore tem um lugar para cada grupo da chave e novidades únicas', () => {
    const { nodes, rows } = layoutTree(TREE, 20, 20, 200);
    expect(rows).toBe(Object.keys(KEY_RESULTS).length - 3); // aracnídeos, miriápodes e crustáceos ficam no ramo dos artrópodes
    const leaves = nodes.filter((n) => !n.node.children);
    for (const l of leaves) expect(KEY_RESULTS[l.node.id], l.node.id).toBeDefined();
    const inv = allInnovations();
    expect(new Set(inv.map((i) => i.id)).size).toBe(inv.length);
  });
});
