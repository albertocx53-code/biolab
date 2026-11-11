/**
 * Educational process animations of the Cell Biology lab (schematic,
 * time-compressed). Texts in pt-BR, checked against OpenStax Biology 2e
 * chapters 4, 5, 7, 8 and 10. Each step lasts `seconds` while playing.
 */
import { create } from 'zustand';

export interface LegendItem {
  color: string;
  label: string;
}
export interface ProcessStep {
  title: string;
  text: string;
  seconds: number;
  legend?: LegendItem[];
}
export interface CellProcess {
  id: string;
  title: string;
  /** Structure ids linked to the process (Studio topics, related panel). */
  structures: string[];
  note: string;
  equation?: string;
  loop?: boolean;
  steps: ProcessStep[];
}

const GLICOSE = { color: '#F59E0B', label: 'Glicose' };
const PIRUVATO = { color: '#EC4899', label: 'Piruvato' };
const O2 = { color: '#2563EB', label: 'O₂' };
const CO2 = { color: '#64748B', label: 'CO₂' };
const ATP = { color: '#EAB308', label: 'ATP' };
const AGUA = { color: '#38BDF8', label: 'Água' };
const LUZ = { color: '#FDE047', label: 'Luz' };
const ACUCAR = { color: '#F97316', label: 'Açúcar' };
const HPLUS = { color: '#DC2626', label: 'H⁺' };

const TIME = 'Animação esquemática, com tempo comprimido e fora de escala.';

export const CELL_PROCESSES: Record<string, CellProcess> = {
  secrecao: {
    id: 'secrecao',
    title: 'Síntese e secreção de proteínas',
    structures: ['nucleo', 'ribossomos', 'reticulo-endoplasmatico-rugoso', 'complexo-golgiense', 'vesiculas', 'membrana-plasmatica'],
    note: `${TIME} Acompanhe o caminho de uma proteína de exportação, como uma enzima digestiva ou um hormônio.`,
    steps: [
      { title: '1. Transcrição', text: 'No núcleo, um gene do DNA é copiado em uma molécula de RNA mensageiro (mRNA).', seconds: 4, legend: [{ color: '#D946EF', label: 'mRNA' }] },
      { title: '2. Saída do núcleo', text: 'O mRNA atravessa um poro do envoltório nuclear e chega ao citoplasma.', seconds: 3.5, legend: [{ color: '#D946EF', label: 'mRNA' }] },
      { title: '3. Tradução no retículo rugoso', text: 'Ribossomos aderidos ao retículo endoplasmático rugoso leem o mRNA e produzem a proteína, que entra no retículo e se dobra.', seconds: 4, legend: [{ color: '#EAB308', label: 'Proteína' }] },
      { title: '4. Vesícula de transporte', text: 'A proteína sai do retículo dentro de uma vesícula e segue para a face cis do complexo golgiense.', seconds: 3.5, legend: [{ color: '#EAB308', label: 'Proteína' }] },
      { title: '5. Complexo golgiense', text: 'No complexo golgiense a proteína é modificada (por exemplo, recebe açúcares), separada e empacotada em uma vesícula de secreção na face trans.', seconds: 4, legend: [{ color: '#EAB308', label: 'Proteína' }] },
      { title: '6. Exocitose', text: 'A vesícula de secreção se funde à membrana plasmática e libera a proteína para fora da célula.', seconds: 4, legend: [{ color: '#EAB308', label: 'Proteína' }] },
    ],
  },
  respiracao: {
    id: 'respiracao',
    title: 'Respiração celular',
    structures: ['mitocondria', 'citoplasma', 'membrana-plasmatica'],
    note: `${TIME} Cada esfera representa muitas moléculas.`,
    equation: 'C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + energia (ATP)',
    steps: [
      { title: '1. Glicólise', text: 'A glicose entra na célula e, no citoplasma, é quebrada em duas moléculas de piruvato, gerando um pouco de ATP. Não precisa de oxigênio.', seconds: 5, legend: [GLICOSE, PIRUVATO, ATP] },
      { title: '2. Entrada na mitocôndria', text: 'O piruvato e o gás oxigênio (O₂) entram nas mitocôndrias.', seconds: 5, legend: [PIRUVATO, O2] },
      { title: '3. Ciclo de Krebs', text: 'Na matriz mitocondrial, os derivados do piruvato são oxidados no ciclo de Krebs e o carbono sai na forma de gás carbônico (CO₂).', seconds: 5, legend: [CO2] },
      { title: '4. Cadeia respiratória', text: 'Nas cristas, a cadeia respiratória usa o O₂ (que vira água) e a ATP sintase produz a maior parte do ATP: cerca de 30 a 32 por glicose, no total.', seconds: 6, legend: [ATP, O2] },
    ],
  },
  'respiracao-mito': {
    id: 'respiracao-mito',
    title: 'Respiração celular na mitocôndria',
    structures: ['matriz-mitocondrial', 'cristas-mitocondriais', 'atp-sintase', 'espaco-intermembranas'],
    note: `${TIME} H⁺ = íons hidrogênio (prótons).`,
    equation: 'C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + energia (ATP)',
    steps: [
      { title: '1. Entrada', text: 'O piruvato (vindo da glicólise, no citoplasma) e o O₂ atravessam as membranas e chegam à matriz.', seconds: 5, legend: [PIRUVATO, O2] },
      { title: '2. Ciclo de Krebs', text: 'Na matriz, o ciclo de Krebs oxida os derivados do piruvato, libera CO₂ e carrega elétrons em moléculas transportadoras (NADH e FADH₂).', seconds: 5, legend: [CO2] },
      { title: '3. Bombeamento de H⁺', text: 'Na membrana interna, a cadeia respiratória passa os elétrons até o O₂, formando água, e usa essa energia para bombear H⁺ da matriz para o espaço intermembranas.', seconds: 5, legend: [HPLUS] },
      { title: '4. ATP sintase', text: 'Os H⁺ voltam para a matriz através da ATP sintase, que usa esse fluxo para formar ATP a partir de ADP e fosfato (quimiosmose).', seconds: 6, legend: [HPLUS, ATP] },
    ],
  },
  fotossintese: {
    id: 'fotossintese',
    title: 'Fotossíntese',
    structures: ['cloroplastos', 'membrana-plasmatica', 'parede-celular'],
    note: `${TIME} A fotossíntese não é visível diretamente numa folha comum: este é um modelo explicativo.`,
    equation: '6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂',
    steps: [
      { title: '1. Absorção de luz', text: 'A luz é absorvida pela clorofila, nas membranas dos tilacoides dos cloroplastos.', seconds: 5, legend: [LUZ] },
      { title: '2. Quebra da água', text: 'A energia da luz quebra moléculas de água (fotólise). Forma-se ATP e NADPH, e o oxigênio é liberado como O₂.', seconds: 5, legend: [AGUA, O2] },
      { title: '3. Entrada de CO₂', text: 'O gás carbônico entra na célula e chega ao estroma dos cloroplastos, onde é fixado no ciclo de Calvin.', seconds: 5, legend: [CO2] },
      { title: '4. Produção de açúcar', text: 'Com ATP e NADPH, o ciclo de Calvin produz açúcares, usados na respiração celular (nas mitocôndrias) ou armazenados como amido.', seconds: 6, legend: [ACUCAR] },
    ],
  },
  'fotossintese-cloro': {
    id: 'fotossintese-cloro',
    title: 'Fotossíntese no cloroplasto',
    structures: ['tilacoides', 'estroma'],
    note: TIME,
    equation: '6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂',
    steps: [
      { title: '1. Fase clara (tilacoides)', text: 'A clorofila dos tilacoides absorve luz. A água é quebrada e libera O₂; formam-se ATP e NADPH.', seconds: 6, legend: [LUZ, AGUA, O2] },
      { title: '2. Fase química (estroma)', text: 'No estroma, o ciclo de Calvin fixa o CO₂ (enzima rubisco) usando o ATP e o NADPH.', seconds: 5, legend: [CO2] },
      { title: '3. Açúcar', text: 'O açúcar produzido sai para o citoplasma ou é guardado como grãos de amido.', seconds: 5, legend: [ACUCAR] },
    ],
  },
  osmose: {
    id: 'osmose',
    title: 'Osmose: turgência e plasmólise',
    structures: ['vacuolo', 'membrana-plasmatica', 'parede-celular'],
    note: `${TIME} A água atravessa a membrana do meio menos concentrado para o mais concentrado em solutos.`,
    steps: [
      { title: '1. Meio hipotônico — célula túrgida', text: 'Em água pura, a água entra por osmose, o vacúolo fica cheio e a membrana empurra a parede celular: a célula fica firme (túrgida).', seconds: 5, legend: [AGUA] },
      { title: '2. Meio hipertônico — água sai', text: 'Numa solução muito concentrada (por exemplo, água com sal), a água sai do vacúolo e do citoplasma para o meio.', seconds: 5, legend: [AGUA] },
      { title: '3. Plasmólise', text: 'O vacúolo encolhe e a membrana plasmática se afasta da parede, que mantém sua forma. A planta murcha.', seconds: 4, legend: [] },
      { title: '4. Deplasmólise', text: 'De volta à água pura, a água entra novamente e a célula recupera a turgência.', seconds: 5, legend: [AGUA] },
    ],
  },
  flagelo: {
    id: 'flagelo',
    title: 'Movimento do flagelo',
    structures: ['flagelo-bacteriano', 'membrana-plasmatica'],
    note: `${TIME} Na realidade o flagelo pode girar centenas de vezes por segundo.`,
    loop: true,
    steps: [{ title: 'Flagelo em rotação', text: 'Um motor de proteínas na base do flagelo, movido pelo fluxo de íons H⁺ através da membrana, faz o filamento girar como uma hélice e empurra a bactéria.', seconds: 8 }],
  },
  mitose: {
    id: 'mitose',
    title: 'Mitose e citocinese',
    structures: ['cromossomo', 'fuso-mitotico', 'centrossomo', 'envoltorio-nuclear'],
    note: `${TIME} Modelo com 2n = 4 cromossomos (vermelho: origem materna; azul: origem paterna).`,
    steps: [
      { title: 'Interfase', text: 'A célula cresce e duplica seu DNA (fase S). A cromatina está descondensada dentro do núcleo; o centrossomo também é duplicado. Não é uma fase da mitose.', seconds: 4 },
      { title: 'Prófase', text: 'A cromatina se condensa e os cromossomos ficam visíveis, cada um com duas cromátides-irmãs. Os centrossomos migram para os polos e o fuso começa a se formar; o envoltório nuclear se desfaz.', seconds: 5 },
      { title: 'Metáfase', text: 'Os cromossomos, presos às fibras do fuso pelos centrômeros, alinham-se no plano equatorial (placa metafásica).', seconds: 4 },
      { title: 'Anáfase', text: 'As cromátides-irmãs se separam e são puxadas para polos opostos. A célula se alonga.', seconds: 4 },
      { title: 'Telófase', text: 'Os cromossomos chegam aos polos e se descondensam; um novo envoltório nuclear se forma em volta de cada conjunto.', seconds: 4 },
      { title: 'Citocinese', text: 'O citoplasma se divide: nas células animais, um anel contrátil estrangula a célula ao meio, originando duas células-filhas geneticamente iguais.', seconds: 5 },
    ],
  },
};

/** Shared clock for the active process (UI reads id/step; the 3D layer reads progress). */
export interface ProcessState {
  id: string | null;
  step: number;
  playing: boolean;
  start(id: string, playing?: boolean): void;
  stop(): void;
  setStep(step: number): void;
  setPlaying(p: boolean): void;
}
export const useProcess = create<ProcessState>((set) => ({
  id: null,
  step: 0,
  playing: false,
  start: (id, playing = true) => {
    processClock.t = 0;
    set({ id, step: 0, playing });
  },
  stop: () => set({ id: null, step: 0, playing: false }),
  setStep: (step) => {
    processClock.t = 0;
    set({ step });
  },
  setPlaying: (playing) => set({ playing }),
}));

/** Seconds elapsed in the current step (mutable, advanced every frame while playing). */
export const processClock = { t: 0 };
