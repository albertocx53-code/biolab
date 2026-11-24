/**
 * Animals catalog: which models exist, which structures each one shows, and
 * schema-conformant `Structure` objects built from the curated content.
 * Pure data (no Three.js), shared by the 3D lab and by Studio on the server.
 */
import type { Structure } from '@/data/biology/schema';
import { ANIMAL_CONTENT, ANIMAL_REFS } from '@/data/biology/animals/content';
import { createCatalog, type LabModelInfo } from '@/laboratories/shared/catalog';

export const ANIMAL_LAB_ID = 'animais' as const;

export type AnimalModelId =
  | 'esponja'
  | 'hidra'
  | 'planaria'
  | 'minhoca'
  | 'gafanhoto'
  | 'estrela-do-mar'
  | 'peixe'
  | 'sapo'
  | 'ave'
  | 'coracoes'
  | 'embriao'
  | 'metamorfose-sapo'
  | 'metamorfose-borboleta';

export interface AnimalModelInfo extends LabModelInfo<AnimalModelId> {
  kind: 'invertebrado' | 'vertebrado' | 'processo';
}

export const ANIMAL_MODELS: AnimalModelInfo[] = [
  {
    id: 'esponja',
    label: 'Esponja (poríferos)',
    short: 'Esponja',
    kind: 'invertebrado',
    realSize: 'de poucos centímetros a mais de 1 m',
    summary: 'Esponja em forma de vaso, em corte: poros, espongiocele, coanócitos, mesoílo com espículas e amebócitos, e o ósculo por onde sai a água.',
    structures: ['pinacoderme', 'poros', 'mesohilo', 'espiculas', 'amebocitos', 'espongiocele', 'coanocitos', 'osculo', 'rocha', 'corrente-de-agua', 'particulas-alimento'],
    detailOf: 'poriferos',
    processes: ['filtracao-esponja'],
  },
  {
    id: 'hidra',
    label: 'Hidra (cnidários)',
    short: 'Hidra',
    kind: 'invertebrado',
    realSize: 'cerca de 1 cm',
    summary: 'Hidra de água doce em corte: epiderme, mesogleia e gastroderme em volta da cavidade gastrovascular, tentáculos com cnidócitos (um deles ampliado), boca e um broto.',
    structures: ['epiderme', 'mesogleia', 'gastroderme', 'hipostomio', 'tentaculos', 'cnidocitos', 'disco-basal', 'broto-hidra'],
    detailOf: 'cnidarios',
    processes: ['brotamento-hidra'],
  },
  {
    id: 'planaria',
    label: 'Planária (platelmintos)',
    short: 'Planária',
    kind: 'invertebrado',
    realSize: 'de 0,5 a 2 cm',
    summary: 'Planária com o dorso pigmentado e uma janela de dissecação: ocelos, aurículas, faringe, intestino ramificado, gânglios cerebrais com cordões nervosos em escada e protonefrídios.',
    structures: ['corpo-planaria', 'ocelos', 'auriculas', 'faringe', 'intestino-ramificado', 'ganglios-cerebrais', 'cordoes-nervosos', 'protonefridios'],
    detailOf: 'platelmintos',
    processes: [],
  },
  {
    id: 'minhoca',
    label: 'Minhoca (anelídeos)',
    short: 'Minhoca',
    kind: 'invertebrado',
    realSize: 'de 10 a 30 cm',
    summary: 'Minhoca com uma janela de dissecação no flanco: segmentos e septos, clitelo, tubo digestório completo (faringe, esôfago, papo, moela, intestino), vasos e "corações", cordão nervoso ventral e nefrídios.',
    structures: ['parede-minhoca', 'prostomio', 'clitelo', 'cerdas', 'septos', 'faringe-minhoca', 'esofago', 'papo', 'moela', 'intestino', 'vaso-dorsal', 'vaso-ventral', 'coracoes', 'ganglio-cerebral', 'cordao-nervoso-ventral', 'nefridios'],
    detailOf: 'anelideos',
    processes: [],
  },
  {
    id: 'gafanhoto',
    label: 'Gafanhoto (artrópodes: insetos)',
    short: 'Gafanhoto',
    kind: 'invertebrado',
    realSize: 'de 2 a 8 cm',
    summary: 'Inseto com o corpo em cabeça, tórax e abdome: antenas, olhos compostos, aparelho bucal mastigador, três pares de patas (o último saltador), dois pares de asas e espiráculos.',
    structures: ['cabeca', 'antenas', 'olhos-compostos', 'aparelho-bucal', 'torax', 'patas', 'asas', 'abdome', 'espiraculos'],
    detailOf: 'artropodes',
    processes: [],
  },
  {
    id: 'estrela-do-mar',
    label: 'Estrela-do-mar (equinodermos)',
    short: 'Estrela-do-mar',
    kind: 'invertebrado',
    realSize: 'de 10 a 30 cm',
    summary: 'Estrela-do-mar com a face de cima translúcida mostrando o sistema ambulacral: madreporito, canal anelar, canais radiais, ampolas e pés ambulacrais; espinhos e boca na face oral.',
    structures: ['face-aboral', 'espinhos', 'madreporito', 'sistema-ambulacral', 'pes-ambulacrais', 'face-oral', 'boca'],
    detailOf: 'equinodermos',
    processes: [],
  },
  {
    id: 'peixe',
    label: 'Peixe ósseo',
    short: 'Peixe',
    kind: 'vertebrado',
    realSize: 'de 3 cm a mais de 1 m',
    summary: 'Perca com escamas e uma janela de dissecação no flanco: nadadeiras, linha lateral, brânquias, coração de duas cavidades, fígado, estômago, intestino, bexiga natatória, rins, encéfalo e coluna vertebral.',
    structures: ['pele-peixe', 'nadadeiras', 'linha-lateral', 'olhos', 'branquias', 'coracao', 'figado', 'estomago', 'intestino-vertebrado', 'bexiga-natatoria', 'rins', 'encefalo', 'coluna-vertebral'],
    detailOf: 'peixes',
    processes: [],
  },
  {
    id: 'sapo',
    label: 'Sapo (anfíbios)',
    short: 'Sapo',
    kind: 'vertebrado',
    realSize: 'de 2 a 20 cm',
    summary: 'Sapo sentado, de pele verrugosa, com uma janela de dissecação: pulmões simples, coração de três cavidades, fígado, estômago, intestino, rins, cloaca, encéfalo, coluna curta e patas traseiras saltadoras.',
    structures: ['pele-sapo', 'patas-vertebrado', 'olhos', 'encefalo', 'pulmoes', 'coracao', 'figado', 'estomago', 'intestino-vertebrado', 'rins', 'cloaca', 'coluna-vertebral'],
    detailOf: 'anfibios',
    processes: [],
  },
  {
    id: 'ave',
    label: 'Ave',
    short: 'Ave',
    kind: 'vertebrado',
    realSize: 'de 5 cm (beija-flor) a 2,7 m (avestruz)',
    summary: 'Pombo com plumagem e uma janela de dissecação: bico, papo, estômago químico, moela, pulmões com sacos aéreos, coração de quatro cavidades, quilha com músculos peitorais, rins, cloaca e encéfalo.',
    structures: ['penas', 'bico', 'olhos', 'patas-vertebrado', 'encefalo', 'coluna-vertebral', 'quilha', 'musculos-peitorais', 'pulmoes', 'sacos-aereos', 'coracao', 'papo', 'estomago', 'moela-ave', 'figado', 'intestino-vertebrado', 'rins', 'cloaca'],
    detailOf: 'aves',
    processes: [],
  },
  {
    id: 'coracoes',
    label: 'Corações dos vertebrados',
    short: 'Corações',
    kind: 'vertebrado',
    realSize: 'de milímetros a cerca de 30 cm',
    summary: 'Os corações de peixe (2 cavidades), anfíbio (3), réptil (3, septo incompleto) e ave/mamífero (4) lado a lado, abertos na frente, com o sangue passando.',
    structures: ['seio-venoso', 'atrio', 'ventriculo', 'bulbo-arterioso', 'atrio-direito', 'atrio-esquerdo', 'ventriculo-misto', 'septo-incompleto', 'ventriculo-direito', 'ventriculo-esquerdo', 'septo-interventricular', 'sangue-venoso', 'sangue-arterial'],
    detailOf: 'circulacao-comparada',
    processes: ['circulacao-comparada'],
  },
  {
    id: 'embriao',
    label: 'Desenvolvimento embrionário',
    short: 'Embrião',
    kind: 'processo',
    realSize: 'ovo de anfíbio de 1 a 2 mm',
    summary: 'Do zigoto à gástrula: clivagem, mórula, blástula com blastocele, gastrulação com arquêntero e blastóporo, e os três folhetos germinativos.',
    structures: ['zigoto', 'blastomeros', 'morula', 'blastula', 'blastocele', 'ectoderme', 'endoderme', 'mesoderme', 'blastoporo', 'arquentero'],
    detailOf: 'desenvolvimento-embrionario',
    processes: ['desenvolvimento-embrionario'],
  },
  {
    id: 'metamorfose-sapo',
    label: 'Metamorfose do sapo',
    short: 'Metamorfose (sapo)',
    kind: 'processo',
    realSize: 'girino de 1 a 5 cm',
    summary: 'Dos ovos na água ao sapo adulto: girino com brânquias externas, patas traseiras, patas dianteiras e reabsorção da cauda.',
    structures: ['ovos', 'massa-gelatinosa', 'girino', 'branquias-externas', 'cauda', 'patas-traseiras', 'patas-dianteiras', 'sapo', 'agua'],
    detailOf: 'metamorfose',
    processes: ['metamorfose-anfibio'],
  },
  {
    id: 'metamorfose-borboleta',
    label: 'Metamorfose completa',
    short: 'Metamorfose (borboleta)',
    kind: 'processo',
    realSize: 'lagarta de 1 a 5 cm',
    summary: 'Ovo, lagarta, pupa (crisálida) e borboleta adulta abrindo as asas.',
    structures: ['ovo-inseto', 'lagarta', 'pupa', 'borboleta', 'folha-planta', 'galho'],
    detailOf: 'metamorfose-completa',
    processes: ['metamorfose-inseto'],
  },
];

export const ANIMAL_REPRESENTATION = 'Modelo esquemático, fora de escala';

export const ANIMAL_CATALOG = createCatalog({ labId: ANIMAL_LAB_ID, models: ANIMAL_MODELS, content: ANIMAL_CONTENT, refs: ANIMAL_REFS });

export function animalStructure(id: string, modelId?: string): Structure | undefined {
  return ANIMAL_CATALOG.structure(id, modelId);
}
