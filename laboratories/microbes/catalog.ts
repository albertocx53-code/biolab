/**
 * Microorganisms catalog: which models exist, which structures each one shows,
 * and schema-conformant `Structure` objects built from the curated content.
 * Pure data (no Three.js), shared by the 3D lab and by Studio on the server.
 */
import type { Structure } from '@/data/biology/schema';
import { MICROBE_CONTENT, MICROBE_REFS } from '@/data/biology/microbes/content';
import { createCatalog, type LabModelInfo } from '@/laboratories/shared/catalog';

export const MICROBE_LAB_ID = 'microrganismos' as const;

export type MicrobeModelId =
  | 'bacterias'
  | 'bacteriofago'
  | 'coronavirus'
  | 'levedura'
  | 'bolor'
  | 'cogumelo'
  | 'ameba'
  | 'paramecio'
  | 'euglena'
  | 'ciclo-viral'
  | 'conjugacao'
  | 'resistencia';

export interface MicrobeModelInfo extends LabModelInfo<MicrobeModelId> {
  kind: 'procarionte' | 'fungo' | 'protista' | 'processo';
}

export const MICROBE_MODELS: MicrobeModelInfo[] = [
  {
    id: 'bacterias',
    label: 'Bactérias: estrutura e formas',
    short: 'Bactérias',
    kind: 'procarionte',
    realSize: 'de 0,5 a 5 µm',
    summary: 'Um bacilo em corte (cápsula, parede, membrana, nucleoide, plasmídeos, ribossomos, fímbrias e flagelo) e as formas mais comuns: cocos, diplococos, estreptococos, estafilococos, bacilos, espirilos e vibriões.',
    structures: ['capsula', 'parede-bacteriana', 'membrana-plasmatica', 'citoplasma', 'nucleoide', 'ribossomos', 'plasmideo', 'fimbrias', 'flagelo', 'coco', 'diplococo', 'estreptococo', 'estafilococo', 'bacilo', 'espirilo', 'vibriao'],
    detailOf: 'bacteria',
    processes: [],
  },
  {
    id: 'bacteriofago',
    label: 'Bacteriófago T4',
    short: 'Bacteriófago',
    kind: 'procarionte',
    realSize: 'cerca de 200 nm de altura',
    summary: 'Vírus que infecta bactérias: cabeça icosaédrica aberta mostrando o DNA, colar, bainha contrátil, placa basal e fibras da cauda, pousado na parede de uma bactéria.',
    structures: ['capsideo', 'dna-viral', 'colar', 'bainha', 'placa-basal', 'fibras-cauda', 'parede-bacteriana'],
    detailOf: 'bacteriofago',
    processes: [],
  },
  {
    id: 'coronavirus',
    label: 'Coronavírus (SARS-CoV-2)',
    short: 'Coronavírus',
    kind: 'procarionte',
    realSize: 'cerca de 100 nm de diâmetro',
    summary: 'Vírus envelopado em corte: envelope de lipídios com espículas (proteína S), proteínas M e E, e o RNA enrolado nas proteínas N (nucleocapsídeo).',
    structures: ['envelope', 'espicula', 'proteina-m', 'proteina-e', 'nucleocapsideo', 'rna-viral'],
    detailOf: 'coronavirus',
    processes: [],
  },
  {
    id: 'levedura',
    label: 'Levedura (fermento)',
    short: 'Levedura',
    kind: 'fungo',
    realSize: 'cerca de 5–10 µm',
    summary: 'Célula de Saccharomyces cerevisiae em corte com parede de quitina, núcleo, vacúolo e mitocôndrias, formando um broto; ao lado, outras leveduras.',
    structures: ['parede-celular-fungica', 'membrana-plasmatica', 'nucleo', 'vacuolo', 'mitocondria', 'broto', 'cicatriz-de-brotamento'],
    detailOf: 'levedura',
    processes: ['brotamento'],
  },
  {
    id: 'bolor',
    label: 'Bolor-preto-do-pão',
    short: 'Bolor',
    kind: 'fungo',
    realSize: 'hifas de 5–10 µm; esporângios de cerca de 100 µm',
    summary: 'Rhizopus sobre uma fatia de pão: hifas, rizoides, esporangióforos e esporângios (um aberto, com a columela e os esporos).',
    structures: ['substrato', 'hifas', 'rizoides', 'esporangioforo', 'esporangio', 'columela', 'esporos'],
    detailOf: 'bolor',
    processes: [],
  },
  {
    id: 'cogumelo',
    label: 'Cogumelo e micélio',
    short: 'Cogumelo',
    kind: 'fungo',
    realSize: 'cogumelo de 5 a 20 cm; hifas com micrômetros de largura',
    summary: 'Cogumelo com um quarto recortado para mostrar as lamelas, sobre um bloco de solo com o micélio; esporos caindo do chapéu.',
    structures: ['pileo', 'lamelas', 'estipe', 'anel', 'volva', 'basidiosporos', 'micelio', 'solo'],
    detailOf: 'cogumelo',
    processes: [],
  },
  {
    id: 'ameba',
    label: 'Ameba',
    short: 'Ameba',
    kind: 'protista',
    realSize: 'cerca de 250–750 µm',
    summary: 'Ameba em corte com pseudópodes, núcleo, vacúolo contrátil e vacúolos digestivos, prestes a englobar uma alga por fagocitose.',
    structures: ['membrana-ameba', 'pseudopode', 'endoplasma', 'nucleo', 'vacuolo-contratil', 'vacuolo-digestivo', 'alimento'],
    detailOf: 'ameba',
    processes: ['fagocitose'],
  },
  {
    id: 'paramecio',
    label: 'Paramécio',
    short: 'Paramécio',
    kind: 'protista',
    realSize: 'cerca de 50–300 µm',
    summary: 'Paramécio em corte: cílios, sulco oral, citóstoma, macronúcleo, micronúcleo, vacúolos contráteis em estrela, vacúolos digestivos, tricocistos e citoprocto.',
    structures: ['pelicula', 'cilios', 'sulco-oral', 'citostoma', 'macronucleo', 'micronucleo', 'vacuolo-contratil', 'vacuolo-digestivo', 'tricocistos', 'citoprocto'],
    detailOf: 'paramecio',
    processes: [],
  },
  {
    id: 'euglena',
    label: 'Euglena',
    short: 'Euglena',
    kind: 'protista',
    realSize: 'cerca de 50 µm',
    summary: 'Euglena em corte: flagelo, reservatório, estigma, vacúolo contrátil, núcleo, cloroplastos e grãos de paramilo.',
    structures: ['pelicula-euglena', 'flagelo-eucarioto', 'reservatorio', 'estigma', 'vacuolo-contratil', 'nucleo', 'cloroplasto', 'paramilo'],
    detailOf: 'euglena',
    processes: [],
  },
  {
    id: 'ciclo-viral',
    label: 'Ciclos do bacteriófago',
    short: 'Ciclos virais',
    kind: 'processo',
    realSize: 'bactéria de cerca de 2 µm; fago de 0,2 µm',
    summary: 'Um bacteriófago infecta uma bactéria: ciclo lítico (a célula se rompe e libera novos vírus) e ciclo lisogênico (o DNA viral vira prófago).',
    structures: ['parede-bacteriana', 'membrana-plasmatica', 'nucleoide', 'ribossomos', 'capsideo', 'bainha', 'placa-basal', 'dna-viral', 'profago'],
    detailOf: 'ciclo-litico',
    processes: ['ciclo-litico', 'ciclo-lisogenico'],
  },
  {
    id: 'conjugacao',
    label: 'Conjugação bacteriana',
    short: 'Conjugação',
    kind: 'processo',
    realSize: 'bactérias de cerca de 2 µm',
    summary: 'Uma bactéria doadora passa uma cópia do plasmídeo para a receptora pelo pilus sexual.',
    structures: ['parede-bacteriana', 'membrana-plasmatica', 'nucleoide', 'ribossomos', 'plasmideo', 'pilus-sexual'],
    processes: ['conjugacao'],
  },
  {
    id: 'resistencia',
    label: 'Resistência a antibióticos',
    short: 'Resistência',
    kind: 'processo',
    realSize: 'placa de Petri de cerca de 9 cm; bactérias ampliadas',
    summary: 'Uma população de bactérias numa placa de Petri recebe antibiótico: as sensíveis morrem e as resistentes se multiplicam.',
    structures: ['placa-de-petri', 'antibiotico', 'bacteria-sensivel', 'bacteria-resistente'],
    processes: ['resistencia'],
  },
];

export const MICROBE_REPRESENTATION = 'Modelo esquemático, fora de escala';

export const MICROBE_CATALOG = createCatalog({ labId: MICROBE_LAB_ID, models: MICROBE_MODELS, content: MICROBE_CONTENT, refs: MICROBE_REFS });

export function microbeStructure(id: string, modelId?: string): Structure | undefined {
  return MICROBE_CATALOG.structure(id, modelId);
}
