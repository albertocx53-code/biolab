import type { LaboratoryId, LaboratoryStatus } from './schema';

export interface Laboratory {
  id: LaboratoryId;
  slug: string;
  title: string;
  category: string;
  cta: string;
  summary: string;
  status: LaboratoryStatus;
  phase: number;
  accent: string; // CSS color used for the card identity
  plannedContent: string[];
  plannedProcesses: string[];
}

export const LABORATORIES: Laboratory[] = [
  {
    id: 'anatomia-humana',
    slug: 'corpo-humano',
    title: 'Corpo Humano',
    category: 'Anatomia e Fisiologia',
    cta: 'Explorar corpo humano',
    summary: 'Corpo humano em 3D com sistemas anatômicos separados, camadas, seleção de estruturas e painel científico.',
    status: 'disponivel',
    phase: 2,
    accent: '#F472B6',
    plannedContent: ['Sistema tegumentar', 'Sistema esquelético', 'Sistema muscular', 'Sistema nervoso', 'Sistema cardiovascular', 'Sistema respiratório', 'Sistema digestório', 'Sistema urinário', 'Sistema reprodutor', 'Sistema endócrino', 'Sistema linfático'],
    plannedProcesses: [],
  },
  {
    id: 'plantas',
    slug: 'plantas',
    title: 'Plantas',
    category: 'Botânica',
    cta: 'Explorar plantas',
    summary: 'Planta com flores, flor em corte, semente em germinação e cortes de folha, caule e raiz, com transporte de seiva, transpiração e fotossíntese animados.',
    status: 'disponivel',
    phase: 4,
    accent: '#4ADE80',
    plannedContent: ['Planta com flores completa', 'Sistema radicular', 'Caule', 'Folha', 'Flor', 'Fruto', 'Semente'],
    plannedProcesses: ['Fotossíntese', 'Transporte de água', 'Transpiração', 'Polinização', 'Fecundação', 'Germinação', 'Crescimento vegetal'],
  },
  {
    id: 'animais',
    slug: 'animais',
    title: 'Animais',
    category: 'Zoologia',
    cta: 'Explorar animais',
    summary: 'Representantes de mamíferos, aves, répteis, anfíbios, peixes e invertebrados, com anatomia comparada.',
    status: 'planejado',
    phase: 6,
    accent: '#FBBF24',
    plannedContent: ['Mamíferos', 'Aves', 'Répteis', 'Anfíbios (ex.: rã)', 'Peixes', 'Invertebrados'],
    plannedProcesses: ['Classificação', 'Adaptações', 'Fisiologia comparada'],
  },
  {
    id: 'celulas',
    slug: 'celulas',
    title: 'Células',
    category: 'Citologia',
    cta: 'Explorar células',
    summary: 'Célula animal, vegetal e procariótica com organelas selecionáveis, modelos detalhados e animações de processos.',
    status: 'disponivel',
    phase: 3,
    accent: '#22D3EE',
    plannedContent: ['Célula animal', 'Célula vegetal', 'Célula procariótica'],
    plannedProcesses: ['Mitose', 'Meiose', 'Transporte de membrana', 'Osmose', 'Síntese de proteínas', 'Respiração celular', 'Fotossíntese'],
  },
  {
    id: 'genetica',
    slug: 'genetica',
    title: 'Genética',
    category: 'Genética e Biologia Molecular',
    cta: 'Explorar genética',
    summary: 'Dupla-hélice de DNA, RNA, nucleotídeos e cromossomos, com simulações de replicação e expressão gênica.',
    status: 'planejado',
    phase: 5,
    accent: '#818CF8',
    plannedContent: ['DNA (dupla-hélice)', 'RNA', 'Nucleotídeos', 'Cromossomos', 'Genes'],
    plannedProcesses: ['Replicação', 'Transcrição', 'Tradução', 'Mutações'],
  },
  {
    id: 'microrganismos',
    slug: 'microrganismos',
    title: 'Microrganismos',
    category: 'Microbiologia',
    cta: 'Explorar microrganismos',
    summary: 'Bactérias, vírus, fungos e protozoários, distinguindo vírus de organismos celulares.',
    status: 'planejado',
    phase: 7,
    accent: '#A3E635',
    plannedContent: ['Bactérias', 'Vírus', 'Fungos', 'Protozoários'],
    plannedProcesses: ['Fissão binária', 'Crescimento bacteriano', 'Ciclos de replicação viral', 'Reprodução de fungos', 'Interações parasita-hospedeiro'],
  },
];

export const labBySlug = (slug: string) => LABORATORIES.find((l) => l.slug === slug) ?? null;
export const labById = (id: LaboratoryId) => LABORATORIES.find((l) => l.id === id)!;
