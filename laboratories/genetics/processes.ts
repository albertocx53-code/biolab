/**
 * Process animations of the Genetics laboratory (schematic, time-compressed).
 * Texts in pt-BR, checked against OpenStax Biology 2e chapters 14 (DNA
 * structure and replication), 15 (genes and proteins) and 12–13 (Mendel and
 * inheritance). Each step lasts `seconds` while playing.
 */
import type { LabProcess } from '@/laboratories/shared/process';
import { BASE_COLOR, STRAND_COLOR } from './kit';

export { processClock, useProcess } from '@/laboratories/shared/process';

const TIME = 'Animação esquemática, com tempo comprimido e fora de escala.';
const OLD = { color: STRAND_COLOR.antiga, label: 'Fita antiga (molde)' };
const NEW = { color: STRAND_COLOR.nova, label: 'Fita nova' };
const PRIMER = { color: STRAND_COLOR.primer, label: 'Primer de RNA' };
const RNA = { color: STRAND_COLOR.rna, label: 'RNA' };
const BASES = [
  { color: BASE_COLOR.A, label: 'A (adenina)' },
  { color: BASE_COLOR.T, label: 'T (timina)' },
  { color: BASE_COLOR.G, label: 'G (guanina)' },
  { color: BASE_COLOR.C, label: 'C (citosina)' },
];
const U = { color: BASE_COLOR.U, label: 'U (uracila)' };

export const GENETICS_PROCESSES: Record<string, LabProcess> = {
  replicacao: {
    id: 'replicacao',
    title: 'Replicação do DNA',
    structures: ['fita-molde', 'fita-nova', 'helicase', 'topoisomerase', 'primase', 'primer-rna', 'dna-polimerase', 'dna-ligase'],
    note: `${TIME} A dupla-hélice aparece "achatada" como uma escada para mostrar os pareamentos. Numa célula humana há milhares de forquilhas trabalhando ao mesmo tempo.`,
    namedSteps: false,
    steps: [
      {
        title: '1. A helicase abre a dupla-hélice',
        text: 'Na origem de replicação, a helicase rompe as ligações de hidrogênio entre as bases e separa as duas fitas, formando a forquilha de replicação. À frente dela, a topoisomerase alivia a torção da molécula.',
        seconds: 4,
        legend: [OLD, { color: '#14B8A6', label: 'Helicase' }, { color: '#64748B', label: 'Topoisomerase' }],
      },
      {
        title: '2. A primase coloca os primers',
        text: 'A DNA polimerase não começa uma fita do zero: precisa de um pequeno trecho inicial. A primase fabrica esse primer, um pedaço curto de RNA pareado com o molde.',
        seconds: 4,
        legend: [OLD, PRIMER, { color: '#EC4899', label: 'Primase' }],
      },
      {
        title: '3. Fita contínua (fita líder)',
        text: 'A DNA polimerase lê o molde e encaixa nucleotídeos complementares (A com T, G com C), sempre no sentido 5′ → 3′ da fita nova. Numa das fitas ela acompanha a forquilha sem parar: é a fita líder (contínua).',
        seconds: 6,
        legend: [OLD, NEW, { color: '#6366F1', label: 'DNA polimerase' }, ...BASES],
      },
      {
        title: '4. Fita descontínua: fragmentos de Okazaki',
        text: 'Na outra fita, o sentido 5′ → 3′ aponta para longe da forquilha. Por isso ela é feita em pedaços (fragmentos de Okazaki), cada um começando num novo primer, à medida que a forquilha abre mais DNA: é a fita tardia (descontínua).',
        seconds: 6,
        legend: [OLD, NEW, PRIMER],
      },
      {
        title: '5. Primers trocados e fragmentos unidos',
        text: 'Os primers de RNA são removidos e substituídos por DNA. A DNA ligase une os fragmentos, fechando as falhas do esqueleto de açúcar-fosfato.',
        seconds: 5,
        legend: [NEW, PRIMER, { color: '#84CC16', label: 'DNA ligase' }],
      },
      {
        title: '6. Duas moléculas iguais: replicação semiconservativa',
        text: 'Resultam duas moléculas de DNA idênticas à original. Cada uma tem uma fita antiga (que serviu de molde) e uma fita nova: por isso a replicação é chamada de semiconservativa (experimento de Meselson e Stahl, 1958).',
        seconds: 5,
        legend: [OLD, NEW],
      },
    ],
  },
  transcricao: {
    id: 'transcricao',
    title: 'Transcrição e processamento do RNA',
    structures: ['fita-molde', 'fita-codificadora', 'rna-polimerase', 'promotor', 'terminador', 'rna-mensageiro', 'intron', 'cap-5', 'cauda-poli-a'],
    note: `${TIME} Gene eucariótico simplificado: promotor, éxon 1, íntron, éxon 2 e terminador. Acontece no núcleo.`,
    steps: [
      {
        title: '1. Iniciação: a RNA polimerase se liga ao promotor',
        text: 'A RNA polimerase (com fatores de transcrição) reconhece o promotor, uma sequência do DNA antes do gene (como o TATA box), e abre a dupla-hélice no início do gene.',
        seconds: 4,
        legend: [{ color: '#0EA5E9', label: 'RNA polimerase' }, { color: '#FACC15', label: 'Promotor' }],
      },
      {
        title: '2. Alongamento: o RNA é montado',
        text: 'A polimerase percorre a fita-molde e une nucleotídeos de RNA complementares, no sentido 5′ → 3′. No RNA não existe timina: no lugar dela entra a uracila (U pareia com A). Atrás da polimerase o DNA volta a se fechar e o RNA se solta.',
        seconds: 9,
        legend: [OLD, RNA, U, { color: '#94A3B8', label: 'Íntron' }],
      },
      {
        title: '3. Término: o RNA é liberado',
        text: 'Ao passar pelo terminador, a polimerase se solta do DNA e libera o RNA recém-feito (pré-mRNA). O DNA continua inteiro e pode ser transcrito de novo.',
        seconds: 4,
        legend: [{ color: '#F43F5E', label: 'Terminador' }, RNA],
      },
      {
        title: '4. Processamento: capacete, cauda e splicing',
        text: 'Nos eucariontes o pré-mRNA é modificado: ganha um capacete (cap) na ponta 5′ e uma cauda poli-A na ponta 3′, e os íntrons são retirados enquanto os éxons são unidos (splicing). O splicing alternativo permite que um gene produza mais de uma proteína.',
        seconds: 6,
        legend: [{ color: '#F59E0B', label: 'Cap 5′' }, { color: BASE_COLOR.A, label: 'Cauda poli-A' }, { color: '#94A3B8', label: 'Íntron (removido)' }],
      },
      {
        title: '5. mRNA maduro',
        text: 'O RNA mensageiro maduro sai do núcleo pelos poros do envoltório nuclear e vai ao citoplasma, onde será traduzido pelos ribossomos. Este mRNA tem os códons AUG UUC GGA UAA.',
        seconds: 4,
        legend: [RNA],
      },
    ],
  },
  traducao: {
    id: 'traducao',
    title: 'Tradução: síntese de proteínas',
    structures: ['rna-mensageiro', 'codon', 'rna-transportador', 'ribossomo', 'subunidade-menor', 'subunidade-maior', 'polipeptideo', 'fator-de-liberacao'],
    note: `${TIME} mRNA AUG UUC GGA AAA UGG UAA → Met-Phe-Gly-Lys-Trp. Acontece no citoplasma (ou no retículo endoplasmático rugoso).`,
    steps: [
      {
        title: '1. Iniciação',
        text: 'A subunidade menor do ribossomo se prende ao mRNA e encontra o códon de início, AUG. O tRNA iniciador, com o anticódon UAC e trazendo metionina (Met), pareia com ele. Então a subunidade maior se encaixa: o tRNA fica no sítio P.',
        seconds: 5,
        legend: [RNA, { color: '#2A9D8F', label: 'tRNA' }, { color: '#D6B48C', label: 'Ribossomo' }],
      },
      {
        title: '2. Alongamento: códon UUC (Phe)',
        text: 'Um tRNA com o anticódon complementar (AAG) chega ao sítio A trazendo fenilalanina. O ribossomo liga a metionina à fenilalanina (ligação peptídica) e anda um códon (translocação): o tRNA vazio passa ao sítio E e sai.',
        seconds: 5,
      },
      { title: '3. Alongamento: códon GGA (Gly)', text: 'O ciclo se repete: chega o tRNA da glicina ao sítio A, a cadeia é transferida para ele e o ribossomo avança mais um códon. A cadeia cresce saindo por um túnel da subunidade maior.', seconds: 5 },
      { title: '4. Alongamento: códon AAA (Lys)', text: 'Entra a lisina. Cada códon (trinca de bases do mRNA) corresponde a um aminoácido, segundo o código genético. Vários ribossomos podem traduzir o mesmo mRNA ao mesmo tempo (polissomo).', seconds: 5 },
      { title: '5. Alongamento: códon UGG (Trp)', text: 'Entra o triptofano. A sequência de aminoácidos, determinada pela sequência de códons, define a forma e a função da proteína.', seconds: 5 },
      {
        title: '6. Término: códon de parada UAA',
        text: 'Nenhum tRNA reconhece os códons de parada (UAA, UAG, UGA). Um fator de liberação ocupa o sítio A, a cadeia de aminoácidos é solta e as subunidades do ribossomo se separam. A proteína então se dobra na sua forma final.',
        seconds: 6,
        legend: [{ color: '#F43F5E', label: 'Fator de liberação' }, { color: '#F59E0B', label: 'Polipeptídeo' }],
      },
    ],
  },
  mutacao: {
    id: 'mutacao',
    title: 'Mutações gênicas e seus efeitos',
    namedSteps: true,
    structures: ['fita-codificadora', 'fita-molde', 'mutacao', 'proteina', 'codon'],
    note: `${TIME} Trecho do gene da β-globina (fita codificadora, 5′ → 3′). Cada esfera é o aminoácido de um códon.`,
    steps: [
      { title: 'Normal', text: 'DNA: CTG ACT CCT GAG GAG AAG. Proteína: Leu-Thr-Pro-Glu-Glu-Lys (trecho da β-globina, parte da hemoglobina).', seconds: 5 },
      {
        title: 'Substituição',
        text: 'Uma base trocada (A → T) muda o códon GAG para GTG: o ácido glutâmico (Glu) vira valina (Val). Essa única troca causa a anemia falciforme: a hemoglobina se agrupa e as hemácias ficam em forma de foice.',
        seconds: 6,
      },
      { title: 'Silenciosa', text: 'GAG → GAA: o códon muda, mas continua codificando ácido glutâmico. Como o código genético é degenerado (vários códons para o mesmo aminoácido), a proteína fica igual.', seconds: 5 },
      { title: 'Sem sentido', text: 'AAG → TAG: o códon da lisina vira um códon de parada (UAG no mRNA). A tradução termina antes e a proteína sai incompleta, geralmente sem função.', seconds: 5 },
      {
        title: 'Inserção',
        text: 'Uma base a mais (G) desloca a leitura de três em três: todos os códons seguintes mudam (mutação de mudança de matriz de leitura, ou frameshift). A proteína muda a partir desse ponto: Leu-Thr-Pro-Gly-Gly-Glu.',
        seconds: 6,
      },
      { title: 'Deleção', text: 'Uma base a menos também desloca a matriz de leitura: CTG ACT CCT AGG AGA AG… → Leu-Thr-Pro-Arg-Arg. Inserções e deleções de três bases não causam frameshift (tiram ou põem um aminoácido).', seconds: 6 },
    ],
  },
};
