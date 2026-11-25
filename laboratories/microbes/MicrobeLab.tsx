'use client';

import { ProceduralLab, type LabScene, type ProceduralLabConfig } from '@/laboratories/shared/ProceduralLab';
import { PoseView, type PoseFn } from '@/laboratories/shared/PoseView';
import type { CameraPreset } from '@/components/3d/CameraRig';
import type { MeshDef } from '@/laboratories/shared/types';
import { MICROBE_CATALOG, MICROBE_REPRESENTATION, type MicrobeModelId } from './catalog';
import { buildConjugation, buildResistance, CONJUGATION_PRESET, poseConjugation, poseResistance, RESISTANCE_PRESET } from './conjugation';
import { DEFAULT_OPACITY, LEGEND_COLOR, MICROBE_FALLBACK, MICROBE_MATERIALS } from './materials';
import { buildMicrobeModel, poseBudding, posePhagocytosis, type MicrobeStaticModel } from './models';
import { MICROBE_PROCESSES } from './processes';
import { CompareTool, GrowthTool, ScaleTool } from './tools/MicrobeTools';
import { buildVirusCycle, poseLysogenic, poseLytic, VIRUS_CYCLE_PRESET } from './viruscycle';

interface PoseScene {
  build: () => { meshes: MeshDef[]; preset?: CameraPreset };
  preset?: CameraPreset;
  poses: Record<string, PoseFn>;
  probe: string;
}

/** Scenes with animated poses: the process scenes and the static models that have a process. */
const POSE_SCENES: Record<string, PoseScene> = {
  'ciclo-viral': { build: buildVirusCycle, preset: VIRUS_CYCLE_PRESET, poses: { 'ciclo-litico': poseLytic, 'ciclo-lisogenico': poseLysogenic }, probe: 'bac-parede' },
  conjugacao: { build: buildConjugation, preset: CONJUGATION_PRESET, poses: { conjugacao: poseConjugation }, probe: 'pilus' },
  resistencia: { build: buildResistance, preset: RESISTANCE_PRESET, poses: { resistencia: poseResistance }, probe: 'agar' },
  levedura: { build: () => buildMicrobeModel('levedura'), poses: { brotamento: poseBudding }, probe: 'broto' },
  ameba: { build: () => buildMicrobeModel('ameba'), poses: { fagocitose: posePhagocytosis }, probe: 'am-alimento' },
};

function buildScene(id: string): LabScene {
  const sc = POSE_SCENES[id];
  if (sc) {
    const model = sc.build();
    return {
      meshes: model.meshes,
      preset: sc.preset ?? model.preset!,
      anchors: {},
      render: (p) => <PoseView modelId={id} processes={MICROBE_PROCESSES} poses={sc.poses} meshes={model.meshes} probe={sc.probe} {...p} />,
    };
  }
  const built = buildMicrobeModel(id as MicrobeStaticModel);
  return { meshes: built.meshes, preset: built.preset, anchors: built.anchors };
}

/** No extra particles: every process is drawn by its own scene (PoseView). */
function ProcessLayer() {
  return null;
}

const CONFIG: ProceduralLabConfig = {
  catalog: MICROBE_CATALOG,
  title: 'Microrganismos',
  subtitle: 'Vírus, bactérias, fungos e protistas',
  testPrefix: 'microbes',
  sceneLabel: 'Visualização 3D de microrganismos',
  defaultModel: 'bacterias',
  modelRows: [
    { kind: 'procarionte', label: 'Bactérias e vírus' },
    { kind: 'fungo', label: 'Fungos' },
    { kind: 'protista', label: 'Protozoários e algas' },
    { kind: 'processo', label: 'Processos' },
  ],
  representation: MICROBE_REPRESENTATION,
  searchPlaceholder: 'Buscar (ex.: flagelo, hifa)',
  searchLabel: 'Buscar estrutura ou microrganismo',
  layersLabel: 'Partes do modelo',
  hint: 'Arraste para girar · role para aproximar · clique em uma parte',
  footer: 'Modelos 3D esquemáticos criados pelo BioLab 3D · textos baseados em OpenStax Biology 2e e Microbiology (CC BY 4.0)',
  materials: MICROBE_MATERIALS,
  fallback: MICROBE_FALLBACK,
  legendColor: LEGEND_COLOR,
  defaultOpacity: DEFAULT_OPACITY,
  processes: MICROBE_PROCESSES,
  buildScene,
  ProcessLayer,
  autoProcess: { 'ciclo-viral': 'ciclo-litico', conjugacao: 'conjugacao', resistencia: 'resistencia' },
  tools: [
    { id: 'escala', label: 'Escala de tamanhos', icon: 'ruler', render: (close) => <ScaleTool onClose={close} /> },
    { id: 'comparar', label: 'Comparar', icon: 'table', render: (close) => <CompareTool onClose={close} /> },
    { id: 'crescimento', label: 'Crescimento bacteriano', icon: 'chart', render: (close) => <GrowthTool onClose={close} /> },
  ],
};

export function MicrobeLab(props: { canUseStudio: boolean; tierLabel: string }) {
  return <ProceduralLab config={CONFIG} {...props} />;
}

export type { MicrobeModelId };
