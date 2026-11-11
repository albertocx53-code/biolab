/**
 * Process animations of the Plants lab (schematic, time-compressed). Texts in
 * pt-BR, checked against OpenStax Biology 2e chapters 8, 30 and 32.
 */
import type { LabProcess } from '@/laboratories/shared/process';

const AGUA = { color: '#38BDF8', label: 'Água e sais minerais (seiva bruta)' };
const VAPOR = { color: '#BAE6FD', label: 'Vapor de água' };
const ACUCAR = { color: '#F97316', label: 'Açúcares (seiva elaborada)' };
const LUZ = { color: '#FDE047', label: 'Luz' };
const CO2 = { color: '#64748B', label: 'CO₂' };
const O2 = { color: '#2563EB', label: 'O₂' };
const POLEN = { color: '#F59E0B', label: 'Grãos de pólen' };

const TIME = 'Animação esquemática, com tempo comprimido e fora de escala.';
const PHOTO = '6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂';

export const PLANT_PROCESSES: Record<string, LabProcess> = {
  // ---------------------------------------------------------------- planta inteira
  transporte: {
    id: 'transporte',
    title: 'Transporte de seiva',
    structures: ['xilema', 'floema', 'raiz', 'caule', 'folha', 'raiz-principal', 'raizes-laterais', 'nervuras'],
    note: `${TIME} Cada esfera representa muitas moléculas.`,
    steps: [
      { title: '1. Absorção pela raiz', text: 'A água e os sais minerais do solo entram pelas raízes, principalmente pelos pelos absorventes.', seconds: 5, legend: [AGUA] },
      { title: '2. Seiva bruta sobe pelo xilema', text: 'A seiva bruta sobe pelos vasos do xilema da raiz, do caule e das nervuras até as folhas. Ela é puxada pela transpiração nas folhas (teoria da coesão-tensão).', seconds: 6, legend: [AGUA] },
      { title: '3. Seiva elaborada desce pelo floema', text: 'Nas folhas, a fotossíntese produz açúcares. Dissolvidos em água, eles formam a seiva elaborada, que o floema leva para as partes que consomem ou guardam açúcar: raízes, frutos, flores e brotos.', seconds: 6, legend: [ACUCAR] },
      { title: '4. Os dois fluxos juntos', text: 'Os dois transportes acontecem ao mesmo tempo: o xilema leva água para cima e o floema leva açúcar para onde ele é necessário.', seconds: 6, legend: [AGUA, ACUCAR] },
    ],
  },
  transpiracao: {
    id: 'transpiracao',
    title: 'Transpiração',
    structures: ['limbo', 'folha', 'estomato', 'xilema'],
    note: `${TIME} Uma única planta de milho pode perder mais de 200 litros de água em uma estação de crescimento.`,
    steps: [
      { title: '1. Água chega às folhas', text: 'A seiva bruta chega às folhas pelo xilema das nervuras.', seconds: 4, legend: [AGUA] },
      { title: '2. Vapor sai pelos estômatos', text: 'A água evapora dentro da folha e o vapor sai pelos estômatos abertos. Mais de 90% da água que a planta absorve é perdida assim.', seconds: 5, legend: [VAPOR] },
      { title: '3. A transpiração puxa a água', text: 'A saída de vapor "puxa" a coluna de água do xilema, de forma contínua, desde a raiz. Em dias quentes, secos e com vento, a transpiração aumenta.', seconds: 5, legend: [AGUA, VAPOR] },
    ],
  },
  fotossintese: {
    id: 'fotossintese',
    title: 'Fotossíntese',
    structures: ['limbo', 'folha', 'cloroplastos', 'estomato'],
    note: `${TIME} A fotossíntese acontece dentro dos cloroplastos das células da folha; aqui as setas mostram só o que entra e o que sai.`,
    equation: PHOTO,
    steps: [
      { title: '1. Luz', text: 'A luz do sol é absorvida pela clorofila, nos cloroplastos das folhas.', seconds: 4, legend: [LUZ] },
      { title: '2. Entrada de CO₂ e água', text: 'O gás carbônico do ar entra pelos estômatos e a água chega pelo xilema.', seconds: 5, legend: [CO2, AGUA] },
      { title: '3. Saída de O₂', text: 'A água é quebrada pela energia da luz e o oxigênio é liberado para o ar pelos estômatos.', seconds: 4, legend: [O2] },
      { title: '4. Açúcar para a planta toda', text: 'Os açúcares produzidos vão pelo floema para a planta toda, onde são usados na respiração celular ou guardados como amido.', seconds: 5, legend: [ACUCAR] },
    ],
  },

  // ---------------------------------------------------------------- flor
  polinizacao: {
    id: 'polinizacao',
    title: 'Polinização',
    structures: ['antera', 'graos-de-polen', 'estigma', 'petalas'],
    note: `${TIME} O pólen pode vir da mesma flor (autopolinização) ou de outra planta da mesma espécie (polinização cruzada).`,
    steps: [
      { title: '1. Liberação do pólen', text: 'As anteras maduras se abrem e liberam os grãos de pólen.', seconds: 4, legend: [POLEN] },
      { title: '2. Transporte', text: 'Insetos, aves, morcegos, o vento ou a água levam o pólen. Polinizadores são atraídos pelas cores e pelo perfume das pétalas e pelo néctar.', seconds: 5, legend: [POLEN] },
      { title: '3. Pólen no estigma', text: 'O pólen fica preso no estigma pegajoso de uma flor da mesma espécie. Isso é a polinização.', seconds: 4, legend: [POLEN] },
    ],
  },
  fecundacao: {
    id: 'fecundacao',
    title: 'Fecundação e formação do fruto',
    structures: ['estigma', 'estilete', 'ovario', 'ovulos', 'fruto', 'semente'],
    note: `${TIME} Na natureza, o tubo polínico leva de horas a dias para chegar ao óvulo.`,
    steps: [
      { title: '1. Germinação do pólen', text: 'No estigma, o grão de pólen absorve água e forma o tubo polínico.', seconds: 4 },
      { title: '2. Tubo polínico', text: 'O tubo polínico cresce por dentro do estilete até o óvulo, levando dois núcleos espermáticos (gametas masculinos).', seconds: 5 },
      { title: '3. Dupla fecundação', text: 'Um núcleo espermático se une à oosfera e forma o zigoto (2n), que vira o embrião. O outro se une aos dois núcleos polares e forma o endosperma (3n), tecido de reserva.', seconds: 6, legend: [{ color: '#EC4899', label: 'Gametas masculinos' }] },
      { title: '4. Fruto e sementes', text: 'Depois da fecundação, as pétalas e os estames murcham, o ovário cresce e forma o fruto e cada óvulo fecundado se transforma em uma semente.', seconds: 5 },
    ],
  },

  // ---------------------------------------------------------------- semente
  germinacao: {
    id: 'germinacao',
    title: 'Germinação do feijão',
    structures: ['semente', 'radicula', 'hipocotilo', 'cotiledones', 'plumula', 'tegumento'],
    note: `${TIME} Na realidade, um feijão leva cerca de 5 a 10 dias para chegar a esta fase.`,
    steps: [
      { title: '1. Embebição', text: 'A semente fechada é plantada. Com água, temperatura adequada e oxigênio, ela absorve água, incha e o embrião volta a crescer.', seconds: 5, legend: [AGUA] },
      { title: '2. Saída da radícula', text: 'A radícula rompe o tegumento e é a primeira estrutura a sair. Ela cresce para baixo (gravitropismo).', seconds: 5 },
      { title: '3. Crescimento da raiz', text: 'A radícula forma a raiz principal, que se ramifica em raízes laterais e começa a absorver água e sais minerais.', seconds: 5 },
      { title: '4. Hipocótilo em gancho', text: 'O hipocótilo cresce dobrado em forma de gancho, abre caminho pelo solo sem ferir a plúmula e puxa os cotilédones para fora da terra (germinação epígea).', seconds: 6 },
      { title: '5. Plântula', text: 'O hipocótilo se endireita, o tegumento cai, os cotilédones se abrem e as primeiras folhas se expandem e começam a fazer fotossíntese.', seconds: 6 },
    ],
  },

  // ---------------------------------------------------------------- folha
  'fotossintese-folha': {
    id: 'fotossintese-folha',
    title: 'Fotossíntese na folha',
    structures: ['parenquima-palicadico', 'parenquima-lacunoso', 'cloroplastos', 'estomato', 'xilema', 'floema'],
    note: `${TIME} Cada esfera representa muitas moléculas.`,
    equation: PHOTO,
    steps: [
      { title: '1. Luz', text: 'A luz atravessa a cutícula e a epiderme superior, que são transparentes, e é absorvida pelos cloroplastos, principalmente no parênquima paliçádico.', seconds: 5, legend: [LUZ] },
      { title: '2. CO₂ entra pelos estômatos', text: 'O gás carbônico do ar entra pelos estômatos e se espalha pelos espaços de ar do parênquima lacunoso até as células.', seconds: 5, legend: [CO2] },
      { title: '3. Água vem do xilema', text: 'A água chega pelo xilema da nervura e passa de célula em célula até o mesofilo.', seconds: 5, legend: [AGUA] },
      { title: '4. O₂ sai e o açúcar vai para o floema', text: 'O oxigênio produzido sai pelos estômatos. Os açúcares são levados ao floema da nervura e dali para o resto da planta.', seconds: 6, legend: [O2, ACUCAR] },
    ],
  },
  'transpiracao-folha': {
    id: 'transpiracao-folha',
    title: 'Transpiração na folha',
    structures: ['estomato', 'celulas-guarda', 'xilema', 'parenquima-lacunoso'],
    note: TIME,
    steps: [
      { title: '1. Água sai do xilema', text: 'A água sai do xilema da nervura e molha as paredes das células do mesofilo.', seconds: 5, legend: [AGUA] },
      { title: '2. Evaporação', text: 'Nas paredes das células, a água evapora para os espaços de ar do parênquima lacunoso.', seconds: 5, legend: [VAPOR] },
      { title: '3. Saída pelos estômatos', text: 'O vapor de água sai da folha pelos estômatos abertos. Essa perda puxa mais água do xilema.', seconds: 5, legend: [VAPOR] },
    ],
  },
  estomatos: {
    id: 'estomatos',
    title: 'Abertura e fechamento dos estômatos',
    structures: ['estomato', 'celulas-guarda'],
    note: `${TIME} O movimento das células-guarda está exagerado para ficar visível.`,
    steps: [
      { title: '1. Estômato aberto', text: 'Com luz e água disponível, as células-guarda acumulam íons potássio, absorvem água por osmose e ficam túrgidas e curvadas: o ostíolo se abre.', seconds: 5, legend: [AGUA] },
      { title: '2. Estômato fechado', text: 'À noite ou com falta de água (a planta produz o hormônio ácido abscísico), as células-guarda perdem água, ficam flácidas e se encostam: o ostíolo se fecha.', seconds: 5 },
      { title: '3. Equilíbrio', text: 'Abrir os estômatos permite a entrada de CO₂ para a fotossíntese, mas faz a planta perder água. A planta equilibra as duas coisas ao longo do dia.', seconds: 5 },
    ],
  },

  // ---------------------------------------------------------------- caule
  'transporte-caule': {
    id: 'transporte-caule',
    title: 'Seiva no caule',
    structures: ['xilema', 'floema', 'cambio-vascular'],
    note: TIME,
    steps: [
      { title: '1. Xilema: seiva bruta sobe', text: 'Pelos vasos do xilema, mais perto do centro, a água e os sais minerais sobem da raiz para as folhas.', seconds: 5, legend: [AGUA] },
      { title: '2. Floema: seiva elaborada', text: 'Pelo floema, mais perto da casca, os açúcares produzidos nas folhas descem para as raízes ou vão para frutos e brotos.', seconds: 5, legend: [ACUCAR] },
      { title: '3. Câmbio vascular', text: 'Entre os dois, o câmbio vascular produz mais xilema e mais floema a cada ano, e o caule engrossa.', seconds: 5, legend: [AGUA, ACUCAR] },
    ],
  },

  // ---------------------------------------------------------------- raiz
  absorcao: {
    id: 'absorcao',
    title: 'Absorção de água pela raiz',
    structures: ['pelos-absorventes', 'cortex', 'endoderme', 'xilema'],
    note: TIME,
    steps: [
      { title: '1. Pelos absorventes', text: 'A água do solo entra nos pelos absorventes por osmose, junto com sais minerais dissolvidos.', seconds: 5, legend: [AGUA] },
      { title: '2. Pelo córtex', text: 'A água atravessa o córtex, passando pelas paredes e pelo interior das células, em direção ao centro da raiz.', seconds: 5, legend: [AGUA] },
      { title: '3. Endoderme', text: 'Na endoderme, as estrias de Caspary bloqueiam o caminho pelas paredes: a água e os sais precisam passar por dentro das células, que selecionam o que entra.', seconds: 5, legend: [AGUA] },
      { title: '4. Subida pelo xilema', text: 'No cilindro central, a água entra no xilema e sobe para o caule como seiva bruta.', seconds: 5, legend: [AGUA] },
    ],
  },
};
