'use client';

import { ProceduralLab, type LabScene, type ProceduralLabConfig } from '@/laboratories/shared/ProceduralLab';
import { GENETICS_CATALOG, GENETICS_REPRESENTATION, type GeneticsModelId } from './catalog';
import { DEFAULT_OPACITY, GENETICS_FALLBACK, GENETICS_MATERIALS, LEGEND_COLOR } from './materials';
import { buildGeneticsModel, type GeneticsStaticModel } from './models';
import { buildMutations, MUTATION_PRESET, poseMutations } from './mutation';
import { PoseView } from './PoseView';
import { GENETICS_PROCESSES } from './processes';
import { buildReplication, poseReplication, REPLICATION_PRESET } from './replication';
import { buildTranscription, poseTranscription, TRANSCRIPTION_PRESET } from './transcription';
import { buildTranslation, poseTranslation, TRANSLATION_PRESET } from './translation';
import { CodeTool } from './tools/CodeTool';
import { PunnettTool } from './tools/PunnettTool';

const PROCESS_SCENES = {
  replicacao: { build: buildReplication, pose: poseReplication, preset: REPLICATION_PRESET, probe: 'pt-0' },
  transcricao: { build: buildTranscription, pose: poseTranscription, preset: TRANSCRIPTION_PRESET, probe: 'cod-0' },
  traducao: { build: buildTranslation, pose: poseTranslation, preset: TRANSLATION_PRESET, probe: 'mrna-0' },
  mutacao: { build: buildMutations, pose: poseMutations, preset: MUTATION_PRESET, probe: 'cod-0' },
} as const;

function buildScene(id: string): LabScene {
  if (id in PROCESS_SCENES) {
    const sc = PROCESS_SCENES[id as keyof typeof PROCESS_SCENES];
    const model = sc.build();
    return {
      meshes: model.meshes,
      preset: sc.preset,
      anchors: {},
      render: (p) => <PoseView modelId={id} processId={id} meshes={model.meshes} pose={sc.pose} probe={sc.probe} {...p} />,
    };
  }
  const built = buildGeneticsModel(id as GeneticsStaticModel);
  return { meshes: built.meshes, preset: built.preset, anchors: built.anchors };
}

/** No extra particles: every process here is drawn by its own scene (PoseView). */
function ProcessLayer() {
  return null;
}

const CONFIG: ProceduralLabConfig = {
  catalog: GENETICS_CATALOG,
  title: 'Genética',
  subtitle: 'Genética e Biologia Molecular',
  testPrefix: 'genetics',
  sceneLabel: 'Visualização 3D de moléculas e processos genéticos',
  defaultModel: 'dna',
  modelRows: [
    { kind: 'molecula', label: 'Moléculas e cromossomo' },
    { kind: 'processo', label: 'Processos' },
  ],
  representation: GENETICS_REPRESENTATION,
  searchPlaceholder: 'Buscar (ex.: códon, helicase)',
  searchLabel: 'Buscar estrutura ou molécula',
  layersLabel: 'Partes do modelo',
  hint: 'Arraste para girar · role para aproximar · clique em uma parte',
  footer: 'Modelos 3D esquemáticos criados pelo BioLab 3D · textos baseados em OpenStax Biology 2e (CC BY 4.0) · letras em Helvetiker (MAGENTA Ltd., licença livre)',
  materials: GENETICS_MATERIALS,
  fallback: GENETICS_FALLBACK,
  legendColor: LEGEND_COLOR,
  defaultOpacity: DEFAULT_OPACITY,
  processes: GENETICS_PROCESSES,
  buildScene,
  ProcessLayer,
  autoProcess: { replicacao: 'replicacao', transcricao: 'transcricao', traducao: 'traducao', mutacao: 'mutacao' },
  tools: [
    { id: 'punnett', label: 'Quadro de Punnett', icon: 'grid', render: (close) => <PunnettTool onClose={close} /> },
    { id: 'codigo', label: 'Código genético', icon: 'dna', render: (close) => <CodeTool onClose={close} /> },
  ],
};

export function GeneticsLab(props: { canUseStudio: boolean; tierLabel: string }) {
  return <ProceduralLab config={CONFIG} {...props} />;
}

export type { GeneticsModelId };
