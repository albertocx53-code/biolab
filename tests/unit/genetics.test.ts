import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { StructureSchema } from '@/data/biology/schema';
import { GENETICS_CONTENT } from '@/data/biology/genetics/content';
import { GENETICS_CATALOG, GENETICS_MODELS, geneticsStructure } from '@/laboratories/genetics/catalog';
import { CODON_TABLE, translate } from '@/laboratories/genetics/kit';
import { GENETICS_MATERIALS } from '@/laboratories/genetics/materials';
import { buildGeneticsModel, type GeneticsStaticModel } from '@/laboratories/genetics/models';
import { buildMutations, MUTATION_VARIANTS, poseMutations, proteinOf } from '@/laboratories/genetics/mutation';
import { GENETICS_PROCESSES } from '@/laboratories/genetics/processes';
import { buildReplication, poseReplication } from '@/laboratories/genetics/replication';
import { buildTranscription, poseTranscription } from '@/laboratories/genetics/transcription';
import { buildTranslation, PEPTIDE, poseTranslation } from '@/laboratories/genetics/translation';
import { DIHYBRID, GENE_PRESETS, cross, ratio } from '@/laboratories/genetics/heredity';
import { readSequence } from '@/laboratories/genetics/tools/CodeTool';
import type { MeshDef } from '@/laboratories/shared/types';

describe('Laboratório de Genética — catálogo', () => {
  it('todas as estruturas seguem o esquema e aparecem em algum modelo', () => {
    const all = GENETICS_CATALOG.all();
    expect(all.length).toBeGreaterThan(40);
    for (const s of all) expect(StructureSchema.safeParse(s).success, s.id).toBe(true);
    for (const [id, c] of Object.entries(GENETICS_CONTENT)) {
      for (const r of c.related ?? []) expect(GENETICS_CONTENT[r], `${id} → ${r}`).toBeDefined();
      if (c.parent) expect(GENETICS_CONTENT[c.parent], `${id} ⊂ ${c.parent}`).toBeDefined();
      expect(GENETICS_CATALOG.modelsShowing(id).length, `${id} não aparece em nenhum modelo`).toBeGreaterThan(0);
    }
  });

  it('processos citam estruturas do catálogo e cada modelo de processo tem o seu', () => {
    for (const p of Object.values(GENETICS_PROCESSES)) {
      for (const s of p.structures) expect(GENETICS_CONTENT[s], `${p.id} → ${s}`).toBeDefined();
      expect(p.note).toMatch(/esquemática/);
    }
    for (const m of GENETICS_MODELS) for (const p of m.processes) expect(GENETICS_PROCESSES[p], `${m.id} → ${p}`).toBeDefined();
  });

  it('busca com sinônimos dos livros brasileiros', () => {
    expect(GENETICS_CATALOG.search('okazaki', 'dna')[0].id).toBe('fita-nova');
    expect(GENETICS_CATALOG.search('trinca', 'dna')[0].id).toBe('codon');
    expect(GENETICS_CATALOG.search('pontes de hidrogenio', 'dna')[0].id).toBe('ligacoes-hidrogenio');
    expect(GENETICS_CATALOG.search('anemia falciforme', 'dna')[0].id).toBe('mutacao');
    expect(geneticsStructure('helicase')?.laboratoryId).toBe('genetica');
  });
});

const check = (id: string, meshes: MeshDef[], structures: string[]) => {
  const ids = meshes.map((m) => m.id);
  expect(new Set(ids).size, `${id}: ids repetidos`).toBe(ids.length);
  const have = new Set(meshes.map((m) => m.structure));
  for (const s of structures) expect(have.has(s), `${id}: ${s} sem malha`).toBe(true);
  for (const m of meshes) {
    expect(structures, `${id}: ${m.structure} fora da legenda`).toContain(m.structure);
    expect(GENETICS_MATERIALS[m.cls ?? m.structure], `material de ${m.cls ?? m.structure}`).toBeDefined();
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

describe('Laboratório de Genética — modelos 3D', () => {
  for (const info of GENETICS_MODELS.filter((m) => m.kind === 'molecula')) {
    it(`${info.label}: cada parte da legenda tem malha colorida e válida`, () => {
      check(info.id, buildGeneticsModel(info.id as GeneticsStaticModel).meshes, info.structures);
    });
  }
  const model = (id: string) => GENETICS_MODELS.find((m) => m.id === id)!;

  it('replicação: forquilha abre, fitas novas crescem e cada filha tem uma fita antiga e uma nova', () => {
    const rep = buildReplication();
    check('replicacao', rep.meshes, model('replicacao').structures);
    const { get } = registry(rep.meshes);
    poseReplication(0, get);
    expect(visible(get('nl-10'))).toBe(false);
    poseReplication(3.5, get);
    expect(visible(get('nl-5'))).toBe(true); // leading strand made behind the fork
    expect(visible(get('helicase'))).toBe(true);
    poseReplication(6, get);
    for (let i = 0; i < 22; i++) {
      expect(visible(get(`nl-${i}`)), `líder ${i}`).toBe(true);
      expect(visible(get(`ng-${i}`)), `tardia ${i}`).toBe(true);
    }
    expect(visible(get('pg-3'))).toBe(false); // primers replaced
    // daughters apart: the old top strand is above the new leading strand
    expect(get('pt-5')!.position.y).toBeGreaterThan(get('nl-5')!.position.y);
    expect(get('nl-5')!.position.y).toBeGreaterThan(get('ng-5')!.position.y);
  });

  it('transcrição: o RNA cresce, é liberado e perde o íntron', () => {
    const tr = buildTranscription();
    check('transcricao', tr.meshes, model('transcricao').structures);
    const { get } = registry(tr.meshes);
    poseTranscription(0.5, get);
    expect(visible(get('rna-0'))).toBe(false);
    poseTranscription(1.6, get);
    expect(visible(get('rna-3'))).toBe(true);
    poseTranscription(5, get);
    expect(visible(get('rna-8'))).toBe(false); // intron removed
    expect(visible(get('cap-5'))).toBe(true);
    expect(visible(get('polia-5'))).toBe(true);
    // exons joined: last base of exon 1 next to the first of exon 2
    expect(get('rna-12')!.position.x - get('rna-5')!.position.x).toBeCloseTo(0.62, 2);
  });

  it('tradução: a cadeia Met-Phe-Gly-Lys-Trp cresce e é liberada', () => {
    expect(PEPTIDE.join('')).toBe('MFGKW');
    const tl = buildTranslation();
    check('traducao', tl.meshes, model('traducao').structures);
    const { get } = registry(tl.meshes);
    poseTranslation(0.95, get);
    expect(visible(get('trna-0'))).toBe(true);
    expect(visible(get('trna-1'))).toBe(false);
    poseTranslation(2.5, get);
    expect(visible(get('trna-2'))).toBe(true);
    poseTranslation(6, get);
    expect(visible(get('trna-4'))).toBe(false);
    expect(visible(get('aa-4'))).toBe(true);
  });

  it('mutações: cada passo mostra só a sua versão do gene', () => {
    const mu = buildMutations();
    check('mutacao', mu.meshes, model('mutacao').structures);
    const { get } = registry(mu.meshes);
    poseMutations(1.5, get);
    expect(visible(get('cod-1'))).toBe(true);
    expect(visible(get('cod-0'))).toBe(false);
    expect(visible(get('mutacao-1'))).toBe(true);
    expect(MUTATION_VARIANTS).toHaveLength(GENETICS_PROCESSES.mutacao.steps.length);
  });
});

describe('Genética — código genético, mutações e cruzamentos', () => {
  it('código genético padrão', () => {
    expect(Object.keys(CODON_TABLE)).toHaveLength(64);
    expect(CODON_TABLE.AUG).toBe('M');
    expect(CODON_TABLE.UUU).toBe('F');
    expect(CODON_TABLE.UGG).toBe('W');
    expect(['UAA', 'UAG', 'UGA'].every((c) => CODON_TABLE[c] === '*')).toBe(true);
    expect(Object.values(CODON_TABLE).filter((a) => a === '*')).toHaveLength(3);
    expect(new Set(Object.values(CODON_TABLE).filter((a) => a !== '*')).size).toBe(20);
    expect(translate('AUGUUCGGAAAAUGGUAA')).toBe('MFGKW');
  });

  it('efeito de cada mutação na proteína', () => {
    const p = (id: string) => proteinOf(MUTATION_VARIANTS.find((v) => v.id === id)!.coding).join('');
    expect(p('normal')).toBe('LTPEEK');
    expect(p('falciforme')).toBe('LTPVEK');
    expect(p('silenciosa')).toBe('LTPEEK');
    expect(p('sem-sentido')).toBe('LTPEE*');
    expect(p('insercao')).toBe('LTPGGE');
    expect(p('delecao')).toBe('LTPRR');
  });

  it('tradutor de sequências: fita-molde TAC… vira AUG…', () => {
    const r = readSequence('TACCAAGCCTTTACCATT', 'molde', true);
    expect(r.mrna).toBe('AUGGUUCGGAAAUGGUAA');
    expect(r.codons.map((c) => c.aa).join('')).toBe('MVRKW*');
    expect(readSequence('ccATGtaa', 'codificadora', true).codons.map((c) => c.aa).join('')).toBe('M*');
    expect(readSequence('GGG', 'mrna', true).noStart).toBe(true);
  });

  it('quadro de Punnett: proporções clássicas', () => {
    const preset = (id: string) => GENE_PRESETS.find((p) => p.id === id)!;
    const mono = cross([preset('ervilha-cor')], [['A', 'a']], [['A', 'a']]);
    expect(ratio(mono.genotypes.map((g) => g.count))).toBe('2 : 1 : 1');
    expect(mono.phenotypes.map((p) => [p.label, p.count])).toEqual([
      ['Amarela', 3],
      ['Verde', 1],
    ]);
    const di = cross([...DIHYBRID.genes], [['A', 'a'], ['B', 'b']], [['A', 'a'], ['B', 'b']]);
    expect(di.total).toBe(16);
    expect(ratio(di.phenotypes.map((p) => p.count))).toBe('9 : 3 : 3 : 1');
    const abo = cross([preset('abo')], [['Iᴬ', 'i']], [['Iᴮ', 'i']]);
    expect(abo.phenotypes.map((p) => p.label).sort()).toEqual(['Tipo A', 'Tipo AB', 'Tipo B', 'Tipo O']);
    const flor = cross([preset('maravilha')], [['V', 'B']], [['V', 'B']]);
    expect(flor.phenotypes.find((p) => p.label === 'Rosa')!.count).toBe(2);
    const dalt = cross([preset('daltonismo')], [['Xᴰ', 'Xᵈ']], [['Xᴰ', 'Y']]);
    expect(dalt.phenotypes.find((p) => p.label === 'Menino daltônico')!.count).toBe(1);
    expect(dalt.phenotypes.find((p) => p.label === 'Menina daltônica')).toBeUndefined();
  });
});
