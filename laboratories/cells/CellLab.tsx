'use client';

import { CELL_CONTENT } from '@/data/biology/cells/content';
import { ProceduralLab, type LabScene, type ProceduralLabConfig } from '@/laboratories/shared/ProceduralLab';
import { CELL_CATALOG, CELL_REPRESENTATION, type CellModelId } from './catalog';
import { CELL_FALLBACK, CELL_MATERIALS, DEFAULT_OPACITY, LEGEND_COLOR } from './materials';
import { buildCellModel } from './models';
import { buildMitosis, MITOSIS_PRESET } from './mitosis';
import { MitosisView } from './MitosisView';
import { ProcessLayer } from './ProcessLayer';
import { CELL_PROCESSES } from './processes';

function buildScene(id: string): LabScene {
  if (id === 'mitose') {
    const mitosis = buildMitosis();
    return {
      meshes: mitosis.meshes,
      preset: MITOSIS_PRESET,
      anchors: {},
      render: (p) => <MitosisView model={mitosis} {...p} />,
    };
  }
  const built = buildCellModel(id as Exclude<CellModelId, 'mitose'>);
  return { meshes: built.meshes, preset: built.preset, anchors: built.anchors };
}

const CONFIG: ProceduralLabConfig = {
  catalog: CELL_CATALOG,
  title: 'Células',
  subtitle: 'Citologia',
  testPrefix: 'cell',
  sceneLabel: 'Visualização 3D da célula',
  defaultModel: 'animal',
  modelRows: [
    { kind: 'celula', label: 'Tipo de célula' },
    { kind: 'detalhe|processo', label: 'Modelos detalhados e processos' },
  ],
  representation: CELL_REPRESENTATION,
  searchPlaceholder: 'Buscar estrutura (ex.: mitocôndria)',
  searchLabel: 'Buscar estrutura celular',
  layersLabel: 'Estruturas da célula',
  hint: 'Arraste para girar · role para aproximar · clique em uma organela',
  footer: 'Modelos 3D esquemáticos criados pelo BioLab 3D · textos baseados em OpenStax Biology 2e (CC BY 4.0)',
  materials: CELL_MATERIALS,
  fallback: CELL_FALLBACK,
  legendColor: LEGEND_COLOR,
  defaultOpacity: DEFAULT_OPACITY,
  processes: CELL_PROCESSES,
  buildScene,
  ProcessLayer,
  autoProcess: { mitose: 'mitose' },
  groupName: (id) => (id === 'nucleo' ? 'Núcleo (nucleoplasma)' : CELL_CONTENT[id]?.name),
};

export function CellLab(props: { canUseStudio: boolean; tierLabel: string }) {
  return <ProceduralLab config={CONFIG} {...props} />;
}
