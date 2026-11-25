/**
 * Process animations of the Microorganisms laboratory (schematic,
 * time-compressed). Texts in pt-BR, checked against OpenStax Microbiology and
 * Biology 2e (chapters 21 Viruses, 22 Prokaryotes, 23 Protists, 24 Fungi).
 */
import type { LabProcess } from '@/laboratories/shared/process';
import { c } from './kit';

export { processClock, useProcess } from '@/laboratories/shared/process';

const TIME = 'Animação esquemática, com tempo comprimido e fora de escala.';
const L = (id: string, label: string) => ({ color: c(id), label });

export const MICROBE_PROCESSES: Record<string, LabProcess> = {
  'ciclo-litico': {
    id: 'ciclo-litico',
    title: 'Ciclo lítico do bacteriófago',
    structures: ['capsideo', 'dna-viral', 'bainha', 'fibras-cauda', 'parede-bacteriana', 'nucleoide'],
    note: `${TIME} O ciclo inteiro dura cerca de 25 minutos no fago T4 e libera de 100 a 200 novos vírus por bactéria; aqui aparecem só 6.`,
    steps: [
      { title: '1. Adsorção', text: 'O bacteriófago encontra a bactéria e prende as fibras da cauda a receptores específicos da parede celular. Cada vírus só infecta as células que têm o receptor certo.', seconds: 5, legend: [L('capsideo', 'Capsídeo'), L('fibras-cauda', 'Fibras da cauda'), L('parede-bacteriana', 'Parede da bactéria')] },
      { title: '2. Penetração do DNA', text: 'A bainha da cauda se contrai como uma seringa e o DNA viral é injetado no citoplasma. O capsídeo vazio fica do lado de fora.', seconds: 5, legend: [L('bainha', 'Bainha contrátil'), L('dna-viral', 'DNA viral')] },
      { title: '3. Síntese', text: 'O DNA viral assume o comando da célula: o cromossomo da bactéria é degradado e as enzimas e ribossomos dela passam a copiar o DNA do vírus e a fabricar as proteínas do capsídeo e da cauda.', seconds: 6, legend: [L('dna-viral', 'Cópias do DNA viral'), L('nucleoide', 'Cromossomo bacteriano (degradado)')] },
      { title: '4. Montagem', text: 'As peças se juntam sozinhas: o DNA é empacotado dentro de cada capsídeo, e a cauda e as fibras se encaixam. Formam-se dezenas de novos vírus dentro da célula.', seconds: 5, legend: [L('capsideo', 'Novos vírus')] },
      { title: '5. Lise e liberação', text: 'Uma enzima viral (lisozima) rompe a parede da bactéria, que se rompe (lise). Os novos vírus saem e podem infectar outras bactérias.', seconds: 6, legend: [L('parede-bacteriana', 'Parede rompida'), L('capsideo', 'Vírus liberados')] },
    ],
  },
  'ciclo-lisogenico': {
    id: 'ciclo-lisogenico',
    title: 'Ciclo lisogênico',
    structures: ['dna-viral', 'profago', 'nucleoide', 'parede-bacteriana'],
    note: `${TIME} Fagos temperados, como o lambda, escolhem entre o ciclo lítico e o lisogênico conforme as condições da bactéria.`,
    steps: [
      { title: '1. Adsorção e penetração', text: 'Como no ciclo lítico, o fago se prende à bactéria e injeta seu DNA.', seconds: 5, legend: [L('dna-viral', 'DNA viral')] },
      { title: '2. Integração: o prófago', text: 'O DNA viral se fecha em anel e se integra ao cromossomo da bactéria. Integrado, ele se chama prófago e fica "adormecido": não fabrica vírus e a bactéria continua viva.', seconds: 5, legend: [L('profago', 'Prófago'), L('nucleoide', 'Cromossomo bacteriano')] },
      { title: '3. Divisão da bactéria', text: 'A cada fissão binária o prófago é copiado junto com o cromossomo. Assim, todas as bactérias-filhas carregam o vírus.', seconds: 6, legend: [L('profago', 'Prófago nas duas filhas')] },
      { title: '4. Indução: volta ao ciclo lítico', text: 'Um estresse (radiação UV, substâncias químicas) faz o prófago se soltar do cromossomo. Ele começa a fabricar vírus e a célula entra no ciclo lítico.', seconds: 5, legend: [L('profago', 'Prófago se soltando'), L('capsideo', 'Novos capsídeos')] },
    ],
  },
  conjugacao: {
    id: 'conjugacao',
    title: 'Conjugação bacteriana',
    structures: ['pilus-sexual', 'plasmideo', 'parede-bacteriana', 'nucleoide'],
    note: `${TIME} A conjugação não é reprodução: o número de bactérias não aumenta. É uma forma de transferência de genes, e é assim que genes de resistência a antibióticos se espalham.`,
    steps: [
      { title: '1. O pilus sexual se estende', text: 'A bactéria doadora tem um plasmídeo F, com os genes para fazer o pilus sexual. O pilus se estende até a bactéria receptora, que não tem esse plasmídeo.', seconds: 5, legend: [L('pilus-sexual', 'Pilus sexual'), L('plasmideo', 'Plasmídeo')] },
      { title: '2. Contato e ponte', text: 'O pilus se retrai e aproxima as duas células; forma-se uma ponte de conjugação entre os citoplasmas.', seconds: 4, legend: [L('pilus-sexual', 'Ponte de conjugação')] },
      { title: '3. Transferência de uma fita', text: 'O plasmídeo é cortado em uma das fitas e essa fita simples passa para a receptora, enquanto a doadora repõe a fita que saiu.', seconds: 6, legend: [L('plasmideo', 'Fita de DNA transferida')] },
      { title: '4. Síntese da fita complementar', text: 'Na receptora, a fita recebida serve de molde e o plasmídeo se fecha com dupla-fita. Agora as duas células têm o plasmídeo.', seconds: 5, legend: [L('plasmideo', 'Plasmídeo completo')] },
      { title: '5. Duas doadoras', text: 'As células se separam. A receptora virou doadora: pode fazer seu próprio pilus e passar o plasmídeo adiante.', seconds: 5, legend: [L('pilus-sexual', 'Novo pilus')] },
    ],
  },
  resistencia: {
    id: 'resistencia',
    title: 'Seleção de bactérias resistentes',
    structures: ['bacteria-sensivel', 'bacteria-resistente', 'antibiotico', 'placa-de-petri'],
    note: `${TIME} O antibiótico não "cria" a resistência: ele seleciona as bactérias que já eram resistentes por mutação ou por genes recebidos.`,
    steps: [
      { title: '1. Uma população variada', text: 'Em qualquer população de bactérias há variação. Por mutação ou por genes recebidos de outras bactérias (plasmídeos), algumas poucas já são resistentes ao antibiótico.', seconds: 5, legend: [L('bacteria-sensivel', 'Sensíveis'), L('bacteria-resistente', 'Resistentes')] },
      { title: '2. O antibiótico é aplicado', text: 'O antibiótico mata as bactérias sensíveis, por exemplo impedindo que elas façam a parede celular ou as proteínas.', seconds: 6, legend: [L('antibiotico', 'Antibiótico')] },
      { title: '3. Só as resistentes sobrevivem', text: 'Restam as resistentes. Se o tratamento é interrompido antes da hora, ou se o antibiótico é usado sem necessidade, essas sobreviventes ficam com o espaço todo.', seconds: 4, legend: [L('bacteria-resistente', 'Sobreviventes resistentes')] },
      { title: '4. As resistentes se multiplicam', text: 'Por fissão binária as resistentes se multiplicam rapidamente (algumas se dividem a cada 20 minutos) e passam a resistência às filhas.', seconds: 6, legend: [L('bacteria-resistente', 'Nova geração resistente')] },
      { title: '5. O antibiótico não funciona mais', text: 'A nova população é quase toda resistente: aquele antibiótico deixou de funcionar. Por isso só se toma antibiótico com receita, pelo tempo indicado, e nunca para gripe ou resfriado (causados por vírus).', seconds: 6, legend: [L('antibiotico', 'Antibiótico sem efeito')] },
    ],
  },
  brotamento: {
    id: 'brotamento',
    title: 'Brotamento da levedura',
    structures: ['broto', 'nucleo', 'cicatriz-de-brotamento', 'parede-celular-fungica'],
    note: `${TIME} Uma levedura de padaria (Saccharomyces cerevisiae) se divide assim em cerca de 90 minutos.`,
    steps: [
      { title: '1. Surge o broto', text: 'Uma pequena saliência aparece na parede da célula-mãe: é o broto, que vai receber parte do citoplasma.', seconds: 5, legend: [L('broto', 'Broto')] },
      { title: '2. O núcleo se divide', text: 'O núcleo se alonga em direção ao "pescoço" do broto e se divide por mitose; um dos núcleos-filhos entra no broto.', seconds: 5, legend: [L('nucleo', 'Núcleo')] },
      { title: '3. O broto cresce', text: 'O broto cresce e recebe organelas, como mitocôndrias e vacúolo.', seconds: 5, legend: [L('broto', 'Broto crescendo')] },
      { title: '4. Separação', text: 'Uma parede se forma entre as duas células e o broto se solta. Na célula-mãe fica uma cicatriz de brotamento; contando as cicatrizes dá para saber quantas vezes ela já se dividiu.', seconds: 5, legend: [L('cicatriz-de-brotamento', 'Cicatriz de brotamento')] },
    ],
  },
  fagocitose: {
    id: 'fagocitose',
    title: 'Fagocitose na ameba',
    structures: ['pseudopode', 'alimento', 'vacuolo-digestivo', 'vacuolo-contratil'],
    note: `${TIME} Os glóbulos brancos do nosso sangue (macrófagos, neutrófilos) usam o mesmo mecanismo para englobar bactérias.`,
    steps: [
      { title: '1. Os pseudópodes se estendem', text: 'A ameba percebe o alimento (uma alga ou bactéria) e estende pseudópodes ("falsos pés"): o citoplasma flui e empurra a membrana para frente.', seconds: 5, legend: [L('pseudopode', 'Pseudópodes'), L('alimento', 'Alimento')] },
      { title: '2. O alimento é envolvido', text: 'Os pseudópodes contornam a partícula e se fecham em volta dela.', seconds: 5, legend: [L('pseudopode', 'Pseudópodes')] },
      { title: '3. Forma-se o vacúolo digestivo', text: 'A membrana se funde e o alimento fica dentro de uma bolsa, o fagossomo, que se une a lisossomos e vira o vacúolo digestivo.', seconds: 5, legend: [L('vacuolo-digestivo', 'Vacúolo digestivo')] },
      { title: '4. Digestão', text: 'Enzimas dos lisossomos digerem o alimento; as moléculas pequenas passam para o citoplasma. Enquanto isso, o vacúolo contrátil expulsa o excesso de água.', seconds: 5, legend: [L('vacuolo-digestivo', 'Vacúolo digestivo'), L('vacuolo-contratil', 'Vacúolo contrátil')] },
      { title: '5. Eliminação dos resíduos', text: 'O que não foi digerido é eliminado para fora da célula (clasmocitose).', seconds: 5, legend: [L('alimento', 'Resíduos')] },
    ],
  },
};
