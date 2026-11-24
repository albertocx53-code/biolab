/**
 * Data and pure functions of the Microorganisms classroom tools (size scale,
 * group comparison and bacterial growth). Shared by the panels and the tests.
 */

export interface SizeItem {
  id: string;
  label: string;
  /** Typical size in micrometres. */
  um: number;
  color: string;
  note: string;
  kind: 'virus' | 'procarionte' | 'eucarionte' | 'referencia';
}

export const SIZE_ITEMS: SizeItem[] = [
  { id: 'proteina', label: 'Proteína (hemoglobina)', um: 0.0065, color: '#94A3B8', note: 'Uma molécula: só vista com técnicas especiais (raios X, crio-microscopia).', kind: 'referencia' },
  { id: 'virus-polio', label: 'Vírus da pólio', um: 0.03, color: '#F15BB5', note: 'Um dos menores vírus humanos: só ao microscópio eletrônico.', kind: 'virus' },
  { id: 'coronavirus', label: 'Coronavírus', um: 0.1, color: '#D62839', note: 'Cerca de 100 nm: menor que o limite do microscópio óptico (0,2 µm).', kind: 'virus' },
  { id: 'fago', label: 'Bacteriófago T4', um: 0.2, color: '#9AACB8', note: 'Cerca de 200 nm de altura.', kind: 'virus' },
  { id: 'bacteria', label: 'Bactéria (E. coli)', um: 2, color: '#5E9C3A', note: 'Cerca de 1 × 2 µm: visível ao microscópio óptico com aumento de 1000×.', kind: 'procarionte' },
  { id: 'levedura', label: 'Levedura', um: 7, color: '#D9B26F', note: 'Cerca de 5–10 µm.', kind: 'eucarionte' },
  { id: 'hemacia', label: 'Hemácia humana', um: 7.5, color: '#E5484D', note: 'Referência do nosso corpo: cerca de 7,5 µm.', kind: 'referencia' },
  { id: 'euglena', label: 'Euglena', um: 50, color: '#2D6A4F', note: 'Cerca de 50 µm.', kind: 'eucarionte' },
  { id: 'cabelo', label: 'Espessura de um fio de cabelo', um: 80, color: '#6B4F3A', note: 'Cerca de 50–100 µm: o limite do que o olho humano consegue ver é perto de 100 µm.', kind: 'referencia' },
  { id: 'paramecio', label: 'Paramécio', um: 200, color: '#457B9D', note: 'Cerca de 200 µm: no limite da visão a olho nu.', kind: 'eucarionte' },
  { id: 'ameba', label: 'Ameba (Amoeba proteus)', um: 500, color: '#7CC6C9', note: 'Até cerca de 0,5 mm: dá para ver como um pontinho.', kind: 'eucarionte' },
  { id: 'esporangio', label: 'Esporângio do bolor', um: 100, color: '#33363F', note: 'Os pontinhos pretos do pão mofado: cerca de 0,1 mm.', kind: 'eucarionte' },
];

/** Limits shown on the ruler. */
export const SIZE_LIMITS = [
  { um: 0.0002, label: 'Microscópio eletrônico' },
  { um: 0.2, label: 'Microscópio óptico' },
  { um: 100, label: 'Olho humano' },
];

/** Human-friendly size: nm below 1 µm, mm above 1000 µm. */
export function formatSize(um: number) {
  const f = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: n < 10 ? 1 : 0 });
  if (um < 1) return `${f(um * 1000)} nm`;
  if (um >= 1000) return `${f(um / 1000)} mm`;
  return `${f(um)} µm`;
}

/** How many times larger a is than b, rounded for the classroom. */
export function timesLarger(a: number, b: number) {
  const k = a / b;
  if (k >= 10) return Math.round(k / 10 ** Math.floor(Math.log10(k) - 1)) * 10 ** Math.floor(Math.log10(k) - 1);
  return Math.round(k * 10) / 10;
}

export interface GroupInfo {
  id: string;
  label: string;
  color: string;
  facts: Record<string, string>;
}

export const COMPARE_ROWS: { id: string; label: string }[] = [
  { id: 'celula', label: 'Tem célula?' },
  { id: 'nucleo', label: 'Núcleo' },
  { id: 'parede', label: 'Parede celular' },
  { id: 'organelas', label: 'Organelas membranosas' },
  { id: 'material', label: 'Material genético' },
  { id: 'nutricao', label: 'Nutrição' },
  { id: 'reproducao', label: 'Reprodução' },
  { id: 'tamanho', label: 'Tamanho típico' },
  { id: 'exemplos', label: 'Exemplos' },
  { id: 'doencas', label: 'Doenças em humanos' },
  { id: 'tratamento', label: 'Tratamento e prevenção' },
];

export const GROUPS: GroupInfo[] = [
  {
    id: 'virus',
    label: 'Vírus',
    color: '#D62839',
    facts: {
      celula: 'Não (acelular)',
      nucleo: 'Não',
      parede: 'Não; capsídeo de proteína e, em alguns, envelope de lipídios',
      organelas: 'Não; sem metabolismo próprio',
      material: 'DNA ou RNA, nunca os dois',
      nutricao: 'Nenhuma: parasita intracelular obrigatório',
      reproducao: 'Só dentro de uma célula (ciclos lítico e lisogênico)',
      tamanho: '20–300 nm',
      exemplos: 'Influenza, SARS-CoV-2, HIV, dengue, bacteriófagos',
      doencas: 'Gripe, covid-19, aids, dengue, sarampo, catapora, HPV',
      tratamento: 'Vacinas e antivirais; antibiótico NÃO funciona',
    },
  },
  {
    id: 'bacteria',
    label: 'Bactérias',
    color: '#5E9C3A',
    facts: {
      celula: 'Sim, uma célula procarionte',
      nucleo: 'Não; DNA no nucleoide',
      parede: 'Sim, de peptidoglicano',
      organelas: 'Não; só ribossomos (70S)',
      material: 'DNA circular + plasmídeos',
      nutricao: 'Autótrofas (fotossíntese, quimiossíntese) ou heterótrofas',
      reproducao: 'Fissão binária; trocam genes por conjugação, transformação e transdução',
      tamanho: '0,5–5 µm',
      exemplos: 'E. coli, lactobacilos, cianobactérias, Rhizobium',
      doencas: 'Tuberculose, cólera, tétano, sífilis, leptospirose, pneumonia',
      tratamento: 'Antibióticos (com receita) e vacinas (tétano, BCG); saneamento',
    },
  },
  {
    id: 'fungo',
    label: 'Fungos',
    color: '#D9B26F',
    facts: {
      celula: 'Sim, eucarionte; uni ou pluricelular (hifas)',
      nucleo: 'Sim',
      parede: 'Sim, de quitina',
      organelas: 'Sim (mitocôndrias, vacúolos…)',
      material: 'DNA em cromossomos no núcleo',
      nutricao: 'Heterótrofos por absorção (decompositores, parasitas ou mutualistas)',
      reproducao: 'Esporos, brotamento, fragmentação; também sexuada',
      tamanho: '5 µm (levedura) a vários metros de micélio',
      exemplos: 'Fermento, bolores, cogumelos, orelha-de-pau',
      doencas: 'Micoses de pele e unha, candidíase, histoplasmose',
      tratamento: 'Antifúngicos; manter pele seca e arejada',
    },
  },
  {
    id: 'protozoario',
    label: 'Protozoários',
    color: '#457B9D',
    facts: {
      celula: 'Sim, eucarionte unicelular',
      nucleo: 'Sim (os ciliados têm dois tipos)',
      parede: 'Não; alguns têm película',
      organelas: 'Sim; vacúolos contráteis e digestivos',
      material: 'DNA em cromossomos no núcleo',
      nutricao: 'Heterótrofos (fagocitose, absorção); muitos parasitas',
      reproducao: 'Divisão binária, divisão múltipla; conjugação nos ciliados',
      tamanho: '10–500 µm',
      exemplos: 'Ameba, paramécio, tripanossomo, plasmódio, giárdia',
      doencas: 'Malária, doença de Chagas, leishmaniose, amebíase, giardíase, toxoplasmose',
      tratamento: 'Remédios específicos; combate aos vetores (mosquitos, barbeiro) e saneamento',
    },
  },
  {
    id: 'alga',
    label: 'Algas unicelulares',
    color: '#2D6A4F',
    facts: {
      celula: 'Sim, eucarionte',
      nucleo: 'Sim',
      parede: 'Muitas têm (celulose, sílica nas diatomáceas)',
      organelas: 'Sim, com cloroplastos',
      material: 'DNA em cromossomos no núcleo',
      nutricao: 'Autótrofas (fotossíntese); a euglena é mixotrófica',
      reproducao: 'Divisão binária e também sexuada',
      tamanho: '2–200 µm',
      exemplos: 'Euglena, diatomáceas, dinoflagelados, clorela',
      doencas: 'Não causam infecção; dinoflagelados podem formar a "maré vermelha" tóxica',
      tratamento: '—',
    },
  },
];

/** Bacterial growth: N = N0 · 2^(t / g). */
export function growth(n0: number, generationMin: number, minutes: number) {
  const generations = Math.floor(minutes / generationMin);
  const n = n0 * 2 ** (minutes / generationMin);
  return { generations, n };
}

/** Number in pt-BR, switching to "a × 10^b" for large values. */
export function formatBig(n: number): { mantissa: string; exponent: number | null } {
  if (n < 1e6) return { mantissa: Math.round(n).toLocaleString('pt-BR'), exponent: null };
  const e = Math.floor(Math.log10(n));
  const m = n / 10 ** e;
  return { mantissa: m.toLocaleString('pt-BR', { maximumFractionDigits: 1 }), exponent: e };
}
