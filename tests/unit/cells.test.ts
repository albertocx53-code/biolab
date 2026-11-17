import { describe, expect, it } from 'vitest';
import { StructureSchema } from '@/data/biology/schema';
import { CELL_CONTENT } from '@/data/biology/cells/content';
import { allCellStructures, CELL_MODELS, cellStructure, modelsShowing, searchCells } from '@/laboratories/cells/catalog';
import { buildCellModel } from '@/laboratories/cells/models';
import { buildMitosis, poseMitosis } from '@/laboratories/cells/mitosis';
import { CELL_PROCESSES } from '@/laboratories/cells/processes';
import { CELL_MATERIALS } from '@/laboratories/cells/materials';
import * as THREE from 'three';

describe('Laboratório de Células — catálogo', () => {
  it('todas as estruturas seguem o esquema compartilhado', () => {
    for (const s of allCellStructures()) expect(StructureSchema.safeParse(s).success, s.id).toBe(true);
  });

  it('estruturas relacionadas e "faz parte de" apontam para estruturas existentes', () => {
    for (const [id, c] of Object.entries(CELL_CONTENT)) {
      for (const r of c.related ?? []) expect(CELL_CONTENT[r], `${id} → ${r}`).toBeDefined();
      if (c.parent) expect(CELL_CONTENT[c.parent], `${id} ⊂ ${c.parent}`).toBeDefined();
      expect(modelsShowing(id).length, `${id} não aparece em nenhum modelo`).toBeGreaterThan(0);
    }
  });

  it('processos citam estruturas do catálogo e cada modelo lista processos válidos', () => {
    for (const p of Object.values(CELL_PROCESSES)) for (const s of p.structures) expect(CELL_CONTENT[s], `${p.id} → ${s}`).toBeDefined();
    for (const m of CELL_MODELS) for (const p of m.processes) expect(CELL_PROCESSES[p], `${m.id} → ${p}`).toBeDefined();
  });

  it('busca aceita sinônimos e ignora acentos', () => {
    expect(searchCells('golgi', 'animal')[0].id).toBe('complexo-golgiense');
    expect(searchCells('carioteca', 'animal')[0].id).toBe('envoltorio-nuclear');
    expect(searchCells('mitocondria', 'animal')[0].id).toBe('mitocondria');
    // fora do modelo atual ainda aparece (o laboratório troca de modelo)
    expect(searchCells('cloroplasto', 'animal').map((s) => s.id)).toContain('cloroplastos');
  });

  it('o Studio resolve temas do laboratório de células', () => {
    expect(cellStructure('mitocondria')?.namePtBR).toBe('Mitocôndria');
    expect(cellStructure('nao-existe')).toBeUndefined();
  });
});

describe('Laboratório de Células — modelos 3D procedurais', () => {
  for (const info of CELL_MODELS.filter((m) => m.id !== 'mitose' && m.id !== 'meiose' && m.id !== 'fissao')) {
    it(`${info.label}: cada estrutura listada tem malhas e cada malha tem conteúdo`, () => {
      const built = buildCellModel(info.id as Exclude<typeof info.id, 'mitose' | 'meiose' | 'fissao'>);
      const ids = built.meshes.map((m) => m.id);
      expect(new Set(ids).size).toBe(ids.length);
      const structures = new Set(built.meshes.map((m) => m.structure));
      for (const s of info.structures) expect(structures.has(s), `${info.id}: ${s} sem malha`).toBe(true);
      for (const s of structures) {
        expect(info.structures, `${info.id}: ${s} fora da legenda`).toContain(s);
        expect(CELL_MATERIALS[s], `material de ${s}`).toBeDefined();
      }
      for (const m of built.meshes) {
        const pos = m.geometry.getAttribute('position');
        expect(pos.count, m.id).toBeGreaterThan(0);
        for (let i = 0; i < pos.count; i += 97) expect(Number.isFinite(pos.getX(i) + pos.getY(i) + pos.getZ(i)), m.id).toBe(true);
      }
      built.meshes.forEach((m) => m.geometry.dispose());
    });
  }

  it('mitose: as cromátides-irmãs vão para polos opostos na anáfase', () => {
    const model = buildMitosis();
    const meshes = new Map(model.meshes.map((d) => [d.id, new THREE.Mesh(d.geometry)]));
    const get = (id: string) => meshes.get(id);
    poseMitosis(model, 2.5, get); // metáfase
    expect(Math.abs(get('cromatide-1a')!.position.x)).toBeLessThan(0.1);
    poseMitosis(model, 4.0, get); // fim da anáfase
    expect(get('cromatide-1a')!.position.x).toBeLessThan(-0.6);
    expect(get('cromatide-1b')!.position.x).toBeGreaterThan(0.6);
    poseMitosis(model, 0.2, get); // interfase: núcleo intacto, cromossomos ainda não condensados
    expect(get('envoltorio-nuclear')!.scale.x).toBeCloseTo(1);
    expect(get('cromatide-1a')!.scale.x).toBeLessThan(0.01);
  });
});

describe('Laboratório de Células — meiose', () => {
  it('homólogos se separam na anáfase I e cromátides-irmãs só na anáfase II', async () => {
    const { buildMeiosis, poseMeiosis, cellOf } = await import('@/laboratories/cells/meiosis');
    const model = buildMeiosis();
    const meshes = new Map(model.meshes.map((d) => [d.id, new THREE.Mesh(d.geometry)]));
    const get = (id: string) => meshes.get(id);
    poseMeiosis(model, 2.6, get); // metáfase I: bivalentes na placa (x ≈ 0)
    for (let i = 1; i <= 4; i++) expect(Math.abs(get(`cromatide-${i}a`)!.position.x), `crom ${i}`).toBeLessThan(0.12);
    poseMeiosis(model, 4.0, get); // fim da anáfase I: homólogos em polos opostos, irmãs juntas
    const sideOf = (i: number) => Math.sign(get(`cromatide-${i}a`)!.position.x);
    expect(sideOf(1)).not.toBe(sideOf(2));
    expect(sideOf(3)).not.toBe(sideOf(4));
    expect(get('cromatide-1a')!.position.distanceTo(get('cromatide-1b')!.position)).toBeLessThan(0.15);
    expect(sideOf(1) < 0 ? 'a' : 'b').toBe(cellOf(model.chromosomes[0]));
    poseMeiosis(model, 8.0, get); // fim da anáfase II: irmãs separadas em y dentro de cada célula
    expect(get('cromatide-1a')!.position.y).toBeLessThan(-0.3);
    expect(get('cromatide-1b')!.position.y).toBeGreaterThan(0.3);
    expect(Math.sign(get('cromatide-1a')!.position.x)).toBe(sideOf(1));
    // crossing-over trocou a ponta de uma cromátide de cada homólogo
    poseMeiosis(model, 2.2, get);
    expect(get('ponta-1b-b')!.scale.y).toBeGreaterThan(0.5); // cromátide materna com ponta azul
    expect(get('ponta-2a-r')!.scale.y).toBeGreaterThan(0.5); // cromátide paterna com ponta vermelha
    poseMeiosis(model, 0.5, get);
    expect(get('ponta-1b-b')!.scale.y).toBeLessThan(0.01);
    // quatro células ao final
    poseMeiosis(model, 9, get);
    expect(get('membrana-a1')!.scale.x).toBe(1);
    expect(get('membrana-plasmatica')!.scale.x).toBeLessThan(0.01);
  });
});

describe('fissão binária', () => {
  it('duplica o nucleoide, afasta as cópias e termina com duas células', async () => {
    const { buildFission, poseFission } = await import('@/laboratories/cells/fission');
    const model = buildFission();
    const meshes = new Map(model.meshes.map((m) => [m.id, new THREE.Mesh(m.geometry)]));
    const get = (id: string) => meshes.get(id);
    poseFission(0, get);
    expect(get('nucleoide-b')!.scale.x).toBeLessThan(0.01);
    expect(get('parede-a')!.scale.x).toBeLessThan(0.01);
    poseFission(2.5, get);
    expect(get('nucleoide-b')!.scale.x).toBeCloseTo(1, 2);
    expect(get('nucleoide-a')!.position.y - get('nucleoide-b')!.position.y).toBeGreaterThan(1);
    poseFission(4, get);
    expect(get('parede-celular-bacteriana')!.scale.x).toBeLessThan(0.01);
    expect(get('parede-a')!.position.y).toBeGreaterThan(0.9);
    expect(get('parede-b')!.position.y).toBeLessThan(-0.9);
    const structures = new Set(model.meshes.map((m) => m.structure));
    for (const s of CELL_MODELS.find((m) => m.id === 'fissao')!.structures) expect(structures.has(s), `fissao: ${s} sem malha`).toBe(true);
  });
});
