'use client';

import { ProceduralLab, type LabScene, type ProceduralLabConfig } from '@/laboratories/shared/ProceduralLab';
import { PLANT_CATALOG, PLANT_REPRESENTATION, type PlantModelId } from './catalog';
import { buildSeed } from './germination';
import { GerminationView } from './GerminationView';
import { PLANT_FALLBACK, PLANT_LEGEND, PLANT_MATERIALS, PLANT_OPACITY } from './materials';
import { buildPlantModel } from './models';
import { ProcessLayer } from './ProcessLayer';
import { PLANT_PROCESSES } from './processes';

function buildScene(id: string): LabScene {
  if (id === 'semente') {
    const seed = buildSeed();
    return { meshes: seed.meshes, preset: seed.preset, anchors: seed.anchors, render: (p) => <GerminationView model={seed} {...p} /> };
  }
  const built = buildPlantModel(id as Exclude<PlantModelId, 'semente'>);
  return { meshes: built.meshes, preset: built.preset, anchors: built.anchors };
}

const CONFIG: ProceduralLabConfig = {
  catalog: PLANT_CATALOG,
  title: 'Plantas',
  subtitle: 'Botânica',
  testPrefix: 'plant',
  sceneLabel: 'Visualização 3D da planta',
  defaultModel: 'planta',
  modelRows: [
    { kind: 'organismo', label: 'Planta, flor e semente' },
    { kind: 'detalhe', label: 'Órgãos em corte' },
  ],
  representation: PLANT_REPRESENTATION,
  searchPlaceholder: 'Buscar estrutura (ex.: estômato)',
  searchLabel: 'Buscar estrutura da planta',
  layersLabel: 'Estruturas da planta',
  hint: 'Arraste para girar · role para aproximar · clique em uma estrutura',
  footer: 'Modelos 3D esquemáticos criados pelo BioLab 3D · textos baseados em OpenStax Biology 2e (CC BY 4.0)',
  materials: PLANT_MATERIALS,
  fallback: PLANT_FALLBACK,
  legendColor: PLANT_LEGEND,
  defaultOpacity: PLANT_OPACITY,
  processes: PLANT_PROCESSES,
  buildScene,
  ProcessLayer,
  autoProcess: { semente: 'germinacao' },
};

export function PlantLab(props: { canUseStudio: boolean; tierLabel: string }) {
  return <ProceduralLab config={CONFIG} {...props} />;
}
