import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { StructureSchema } from '@/data/biology/schema';
import { PLANT_CONTENT } from '@/data/biology/plants/content';
import { PLANT_CATALOG, PLANT_MODELS, plantStructure } from '@/laboratories/plants/catalog';
import { buildPlantModel } from '@/laboratories/plants/models';
import { buildSeed } from '@/laboratories/plants/germination';
import { PLANT_PROCESSES } from '@/laboratories/plants/processes';
import { PLANT_MATERIALS } from '@/laboratories/plants/materials';

describe('Laboratório de Plantas — catálogo', () => {
  it('todas as estruturas seguem o esquema compartilhado', () => {
    const all = PLANT_CATALOG.all();
    expect(all.length).toBeGreaterThan(45);
    for (const s of all) expect(StructureSchema.safeParse(s).success, s.id).toBe(true);
  });

  it('relações apontam para estruturas existentes e toda estrutura aparece em algum modelo', () => {
    for (const [id, c] of Object.entries(PLANT_CONTENT)) {
      for (const r of c.related ?? []) expect(PLANT_CONTENT[r], `${id} → ${r}`).toBeDefined();
      if (c.parent) expect(PLANT_CONTENT[c.parent], `${id} ⊂ ${c.parent}`).toBeDefined();
      expect(PLANT_CATALOG.modelsShowing(id).length, `${id} não aparece em nenhum modelo`).toBeGreaterThan(0);
    }
  });

  it('processos citam estruturas do catálogo e cada modelo lista processos válidos', () => {
    for (const p of Object.values(PLANT_PROCESSES)) {
      for (const s of p.structures) expect(PLANT_CONTENT[s], `${p.id} → ${s}`).toBeDefined();
      expect(p.note).toMatch(/esquemática/);
    }
    for (const m of PLANT_MODELS) for (const p of m.processes) expect(PLANT_PROCESSES[p], `${m.id} → ${p}`).toBeDefined();
  });

  it('busca aceita sinônimos usados nos livros brasileiros e ignora acentos', () => {
    expect(PLANT_CATALOG.search('estomato', 'folha')[0].id).toBe('estomato');
    expect(PLANT_CATALOG.search('seiva bruta', 'planta')[0].id).toBe('xilema');
    expect(PLANT_CATALOG.search('liber', 'planta')[0].id).toBe('floema');
    expect(PLANT_CATALOG.search('caliptra', 'planta')[0].id).toBe('coifa');
    expect(PLANT_CATALOG.search('polen', 'planta')[0].id).toBe('graos-de-polen');
  });

  it('o Studio resolve temas do laboratório de plantas', () => {
    expect(plantStructure('xilema')?.namePtBR).toBe('Xilema');
    expect(plantStructure('xilema')?.laboratoryId).toBe('plantas');
    expect(plantStructure('nao-existe')).toBeUndefined();
  });
});

const checkMeshes = (id: string, meshes: { id: string; structure: string; cls?: string; geometry: THREE.BufferGeometry }[], structures: string[]) => {
  const ids = meshes.map((m) => m.id);
  expect(new Set(ids).size).toBe(ids.length);
  const have = new Set(meshes.map((m) => m.structure));
  for (const s of structures) expect(have.has(s), `${id}: ${s} sem malha`).toBe(true);
  for (const m of meshes) {
    expect(structures, `${id}: ${m.structure} fora da legenda`).toContain(m.structure);
    expect(PLANT_MATERIALS[m.cls ?? m.structure], `material de ${m.cls ?? m.structure}`).toBeDefined();
    const pos = m.geometry.getAttribute('position');
    expect(pos.count, m.id).toBeGreaterThan(0);
    for (let i = 0; i < pos.count; i += 61) expect(Number.isFinite(pos.getX(i) + pos.getY(i) + pos.getZ(i)), m.id).toBe(true);
  }
  meshes.forEach((m) => m.geometry.dispose());
};

describe('Laboratório de Plantas — modelos 3D procedurais', () => {
  for (const info of PLANT_MODELS.filter((m) => m.id !== 'semente')) {
    it(`${info.label}: cada estrutura da legenda tem malha, com material e coordenadas válidas`, () => {
      const built = buildPlantModel(info.id as Exclude<typeof info.id, 'semente'>);
      checkMeshes(info.id, built.meshes, info.structures);
    });
  }

  it('germinação: a radícula cresce, o hipocótilo levanta os cotilédones e o tegumento cai', () => {
    const seed = buildSeed();
    const meshes = new Map(seed.meshes.map((m) => [m.id, new THREE.Mesh(m.geometry)]));
    const get = (id: string) => meshes.get(id);
    seed.pose(0, get);
    const root0 = get('radicula')!.scale.y;
    seed.pose(1, get); // closed and sown
    const cot0 = get('cotiledone-b')!.position.y;
    seed.pose(5, get);
    expect(get('radicula')!.scale.y).toBeGreaterThan(root0 * 5);
    expect(get('cotiledone-b')!.position.y).toBeGreaterThan(cot0 + 1);
    expect(get('tegumento-a')!.position.y).toBeLessThan(get('cotiledone-b')!.position.y - 1);
    expect(get('plumula')!.scale.x).toBeGreaterThan(3);
    checkMeshes('semente', seed.meshes, PLANT_MODELS.find((m) => m.id === 'semente')!.structures);
  });
});
