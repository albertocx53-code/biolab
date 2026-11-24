'use client';

import { ProceduralLab, type LabScene, type ProceduralLabConfig } from '@/laboratories/shared/ProceduralLab';
import { PoseView, type PoseFn } from '@/laboratories/shared/PoseView';
import type { BuiltModel } from '@/laboratories/shared/types';
import { ANIMAL_CATALOG, ANIMAL_REPRESENTATION, type AnimalModelId } from './catalog';
import { buildDevelopment, poseButterfly, poseEmbryo, poseFrogMeta } from './development';
import { buildInvertebrate, poseFiltration, poseHydraBud, type InvertebrateModel } from './invertebrates';
import { ANIMAL_FALLBACK, ANIMAL_MATERIALS, DEFAULT_OPACITY, LEGEND_COLOR } from './materials';
import { ANIMAL_PROCESSES } from './processes';
import { CompareTool, KeyTool, TreeTool } from './tools/AnimalTools';
import { buildVertebrate, poseHearts, type VertebrateModel } from './vertebrates';

interface PoseScene {
  build: () => BuiltModel;
  poses: Record<string, PoseFn>;
  probe: string;
}

/** Scenes with animated poses (the process scenes and the static models that have a process). */
const POSE_SCENES: Record<string, PoseScene> = {
  esponja: { build: () => buildInvertebrate('esponja'), poses: { 'filtracao-esponja': poseFiltration }, probe: 'agua-0' },
  hidra: { build: () => buildInvertebrate('hidra'), poses: { 'brotamento-hidra': poseHydraBud }, probe: 'hy-broto' },
  coracoes: { build: () => buildVertebrate('coracoes'), poses: { 'circulacao-comparada': poseHearts }, probe: 'sv-0' },
  embriao: { build: () => buildDevelopment('embriao'), poses: { 'desenvolvimento-embrionario': poseEmbryo }, probe: 'em-zigoto' },
  'metamorfose-sapo': { build: () => buildDevelopment('metamorfose-sapo'), poses: { 'metamorfose-anfibio': poseFrogMeta }, probe: 'mf-girino' },
  'metamorfose-borboleta': { build: () => buildDevelopment('metamorfose-borboleta'), poses: { 'metamorfose-inseto': poseButterfly }, probe: 'mb-lagarta' },
};

const VERTEBRATES = new Set(['peixe', 'sapo', 'ave', 'coracoes']);

function buildScene(id: string): LabScene {
  const sc = POSE_SCENES[id];
  if (sc) {
    const model = sc.build();
    return {
      meshes: model.meshes,
      preset: model.preset,
      anchors: {},
      render: (p) => <PoseView modelId={id} processes={ANIMAL_PROCESSES} poses={sc.poses} meshes={model.meshes} probe={sc.probe} {...p} />,
    };
  }
  const built = VERTEBRATES.has(id) ? buildVertebrate(id as VertebrateModel) : buildInvertebrate(id as InvertebrateModel);
  return { meshes: built.meshes, preset: built.preset, anchors: built.anchors };
}

/** No extra particles: every process is drawn by its own scene (PoseView). */
function ProcessLayer() {
  return null;
}

const CONFIG: ProceduralLabConfig = {
  catalog: ANIMAL_CATALOG,
  title: 'Animais',
  subtitle: 'Diversidade, anatomia comparada e desenvolvimento',
  testPrefix: 'animals',
  sceneLabel: 'Visualização 3D de animais',
  defaultModel: 'minhoca',
  modelRows: [
    { kind: 'invertebrado', label: 'Invertebrados' },
    { kind: 'vertebrado', label: 'Vertebrados' },
    { kind: 'processo', label: 'Desenvolvimento' },
  ],
  representation: ANIMAL_REPRESENTATION,
  searchPlaceholder: 'Buscar (ex.: brânquias, celoma)',
  searchLabel: 'Buscar estrutura ou grupo animal',
  layersLabel: 'Partes do modelo',
  hint: 'Arraste para girar · role para aproximar · clique em uma parte',
  footer: 'Modelos 3D esquemáticos criados pelo BioLab 3D · textos baseados em OpenStax Biology 2e (CC BY 4.0)',
  materials: ANIMAL_MATERIALS,
  fallback: ANIMAL_FALLBACK,
  legendColor: LEGEND_COLOR,
  defaultOpacity: DEFAULT_OPACITY,
  processes: ANIMAL_PROCESSES,
  buildScene,
  ProcessLayer,
  autoProcess: { coracoes: 'circulacao-comparada', embriao: 'desenvolvimento-embrionario', 'metamorfose-sapo': 'metamorfose-anfibio', 'metamorfose-borboleta': 'metamorfose-inseto' },
  tools: [
    { id: 'chave', label: 'Chave de identificação', icon: 'branch', render: (close) => <KeyTool onClose={close} /> },
    { id: 'comparar', label: 'Comparar grupos', icon: 'table', render: (close) => <CompareTool onClose={close} /> },
    { id: 'arvore', label: 'Árvore evolutiva', icon: 'tree', render: (close) => <TreeTool onClose={close} /> },
  ],
};

export function AnimalLab(props: { canUseStudio: boolean; tierLabel: string }) {
  return <ProceduralLab config={CONFIG} {...props} />;
}

export type { AnimalModelId };
