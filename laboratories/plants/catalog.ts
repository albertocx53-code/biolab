/**
 * Plants (Botany) catalog: models, structures per model and schema-conformant
 * `Structure` objects. Pure data (no Three.js), shared with Studio on the server.
 */
import type { Structure } from '@/data/biology/schema';
import { PLANT_CONTENT, PLANT_REFS } from '@/data/biology/plants/content';
import { createCatalog, type LabModelInfo } from '@/laboratories/shared/catalog';

export const PLANT_LAB_ID = 'plantas' as const;

export type PlantModelId = 'planta' | 'flor' | 'semente' | 'folha' | 'caule' | 'raiz';

export interface PlantModelInfo extends LabModelInfo<PlantModelId> {
  kind: 'organismo' | 'detalhe';
}

export const PLANT_MODELS: PlantModelInfo[] = [
  {
    id: 'planta',
    label: 'Planta com flores',
    short: 'Planta',
    kind: 'organismo',
    realSize: 'uma planta de feijão tem cerca de 30 a 60 cm de altura',
    summary: 'Eudicotiledônea genérica (como um feijoeiro): raiz pivotante, caule com nós e gemas, folhas, flor e um fruto aberto ao meio.',
    structures: ['solo', 'raiz-principal', 'raizes-laterais', 'caule', 'nos', 'gema-apical', 'gemas-axilares', 'peciolo', 'limbo', 'nervuras', 'flor', 'pericarpo', 'semente'],
    processes: ['transporte', 'transpiracao', 'fotossintese'],
  },
  {
    id: 'flor',
    label: 'Flor completa',
    short: 'Flor',
    kind: 'organismo',
    realSize: 'flores de cerca de 1 a 10 cm são comuns',
    summary: 'Flor completa e hermafrodita, com uma parte das pétalas e o ovário cortados para mostrar o interior.',
    structures: ['pedunculo', 'receptaculo', 'sepalas', 'petalas', 'filete', 'antera', 'graos-de-polen', 'estigma', 'estilete', 'ovario', 'ovulos'],
    detailOf: 'flor',
    processes: ['polinizacao', 'fecundacao'],
  },
  {
    id: 'semente',
    label: 'Semente e germinação',
    short: 'Semente',
    kind: 'organismo',
    realSize: 'semente de feijão com cerca de 1 a 1,5 cm',
    summary: 'Semente de feijão aberta ao meio, com o embrião e os dois cotilédones. Use a animação para ver a germinação.',
    structures: ['solo', 'tegumento', 'cotiledones', 'radicula', 'hipocotilo', 'plumula'],
    detailOf: 'semente',
    processes: ['germinacao'],
  },
  {
    id: 'folha',
    label: 'Folha em corte',
    short: 'Folha',
    kind: 'detalhe',
    realSize: 'a folha tem cerca de 0,2 a 0,5 mm de espessura',
    summary: 'Bloco de uma folha cortada, visto ao microscópio: epidermes, mesofilo, nervura (xilema e floema) e estômatos.',
    structures: ['cuticula', 'epiderme-superior', 'parenquima-palicadico', 'cloroplastos', 'parenquima-lacunoso', 'xilema', 'floema', 'epiderme-inferior', 'celulas-guarda'],
    detailOf: 'folha',
    processes: ['fotossintese-folha', 'transpiracao-folha', 'estomatos'],
  },
  {
    id: 'caule',
    label: 'Caule em corte',
    short: 'Caule',
    kind: 'detalhe',
    realSize: 'caule jovem de poucos milímetros de diâmetro',
    summary: 'Trecho de caule jovem de eudicotiledônea cortado, com os feixes vasculares dispostos em anel.',
    structures: ['epiderme', 'cortex', 'floema', 'cambio-vascular', 'xilema', 'medula'],
    detailOf: 'caule',
    processes: ['transporte-caule'],
  },
  {
    id: 'raiz',
    label: 'Ponta da raiz',
    short: 'Raiz',
    kind: 'detalhe',
    realSize: 'a ponta da raiz tem cerca de 1 mm de diâmetro',
    summary: 'Ponta de raiz com as zonas de crescimento e, no alto, um corte mostrando os tecidos internos.',
    structures: ['coifa', 'zona-meristematica', 'zona-de-alongamento', 'pelos-absorventes', 'epiderme', 'cortex', 'endoderme', 'periciclo', 'xilema', 'floema'],
    detailOf: 'raiz',
    processes: ['absorcao'],
  },
];

export const PLANT_REPRESENTATION = 'Modelo esquemático, fora de escala';

export const PLANT_CATALOG = createCatalog({ labId: PLANT_LAB_ID, models: PLANT_MODELS, content: PLANT_CONTENT, refs: PLANT_REFS });

export const plantModel = (id: string) => PLANT_MODELS.find((m) => m.id === id);

export function plantStructure(id: string, modelId?: string): Structure | undefined {
  return PLANT_CATALOG.structure(id, modelId);
}
