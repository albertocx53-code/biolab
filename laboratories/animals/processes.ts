/**
 * Process animations of the Animals laboratory (schematic, time-compressed).
 * Texts in pt-BR, checked against OpenStax Biology 2e (chapters 27 to 29,
 * 40.1 and 43.6).
 */
import type { LabProcess } from '@/laboratories/shared/process';
import { ac } from './kit';

export { processClock, useProcess } from '@/laboratories/shared/process';

const TIME = 'Animação esquemática, com tempo comprimido e fora de escala.';
const L = (id: string, label: string) => ({ color: ac(id), label });

export const ANIMAL_PROCESSES: Record<string, LabProcess> = {
  'filtracao-esponja': {
    id: 'filtracao-esponja',
    title: 'Filtração na esponja',
    structures: ['poros', 'espongiocele', 'coanocitos', 'osculo', 'corrente-de-agua', 'particulas-alimento'],
    note: `${TIME} Uma esponja do tamanho de um dedo filtra cerca de 20 litros de água por dia.`,
    steps: [
      { title: '1. A água entra pelos poros', text: 'Os flagelos dos coanócitos batem sem parar e criam uma corrente: a água entra por milhares de poros na parede do corpo, trazendo alimento e oxigênio.', seconds: 6, legend: [L('corrente-de-agua', 'Corrente de água'), L('poros', 'Poros')] },
      { title: '2. Os coanócitos capturam o alimento', text: 'No átrio (espongiocele), os coanócitos prendem bactérias e partículas no colarinho e as englobam por fagocitose. A digestão é intracelular e os amebócitos distribuem os nutrientes.', seconds: 6, legend: [L('coanocitos', 'Coanócitos'), L('particulas-alimento', 'Partículas de alimento')] },
      { title: '3. A água sai pelo ósculo', text: 'A água filtrada, com gás carbônico e excretas, sai pelo ósculo, a abertura no alto da esponja. Não há boca, tubo digestório, nervos nem músculos: a esponja não tem tecidos verdadeiros.', seconds: 6, legend: [L('osculo', 'Ósculo'), L('corrente-de-agua', 'Água que sai')] },
    ],
  },
  'brotamento-hidra': {
    id: 'brotamento-hidra',
    title: 'Brotamento da hidra',
    structures: ['broto-hidra', 'epiderme', 'gastroderme', 'tentaculos'],
    note: `${TIME} Em boas condições uma hidra forma um broto novo a cada dois ou três dias.`,
    steps: [
      { title: '1. Surge uma saliência', text: 'Células da parede do corpo se multiplicam por mitose e formam uma saliência na lateral da hidra. A cavidade gastrovascular continua dentro dela.', seconds: 5, legend: [L('broto-hidra', 'Broto')] },
      { title: '2. O broto cresce', text: 'O broto se alonga e se alimenta pela cavidade da mãe, que é contínua com a dele.', seconds: 5, legend: [L('broto-hidra', 'Broto crescendo')] },
      { title: '3. Tentáculos e boca', text: 'Na ponta do broto se formam a boca e um anel de tentáculos com cnidócitos: o broto já pode capturar presas sozinho.', seconds: 5, legend: [L('tentaculos', 'Tentáculos do broto')] },
      { title: '4. Separação', text: 'A base do broto se estrangula, ele se solta e se fixa no substrato pelo disco basal. É reprodução assexuada: a nova hidra é geneticamente igual à mãe.', seconds: 5, legend: [L('broto-hidra', 'Nova hidra')] },
    ],
  },
  'circulacao-comparada': {
    id: 'circulacao-comparada',
    title: 'Circulação comparada dos vertebrados',
    structures: ['atrio', 'ventriculo', 'atrio-direito', 'atrio-esquerdo', 'ventriculo-misto', 'ventriculo-direito', 'ventriculo-esquerdo', 'sangue-venoso', 'sangue-arterial'],
    note: `${TIME} Azul = sangue pobre em oxigênio; vermelho = sangue rico em oxigênio; roxo = mistura. Como nos livros, o lado direito do coração aparece à esquerda da tela.`,
    steps: [
      { title: '1. Peixe: 2 cavidades, circulação simples', text: 'O sangue passa uma só vez pelo coração a cada volta: seio venoso → átrio → ventrículo → bulbo arterioso → brânquias → corpo. Pelo coração só passa sangue pobre em oxigênio.', seconds: 7, legend: [L('atrio', 'Átrio'), L('ventriculo', 'Ventrículo'), L('sangue-venoso', 'Sangue venoso')] },
      { title: '2. Anfíbio: 3 cavidades, circulação dupla incompleta', text: 'Dois átrios recebem o sangue do corpo (direito) e dos pulmões (esquerdo), mas há um só ventrículo, onde os dois sangues se misturam em parte. A pele úmida também faz trocas gasosas.', seconds: 7, legend: [L('atrio-direito', 'Átrio direito'), L('atrio-esquerdo', 'Átrio esquerdo'), L('ventriculo-misto', 'Ventrículo único')] },
      { title: '3. Réptil: septo incompleto', text: 'Na maioria dos répteis o ventrículo tem um septo parcial, que diminui a mistura. Os crocodilianos já têm quatro cavidades separadas.', seconds: 7, legend: [L('septo-incompleto', 'Septo incompleto'), L('sangue-arterial', 'Sangue arterial')] },
      { title: '4. Ave e mamífero: 4 cavidades, circulação dupla completa', text: 'O septo separa totalmente o lado direito (sangue venoso, vai aos pulmões) do esquerdo (sangue arterial, vai ao corpo). Sem mistura, chega mais oxigênio às células: isso sustenta a endotermia (temperatura do corpo constante).', seconds: 7, legend: [L('ventriculo-direito', 'Ventrículo direito'), L('ventriculo-esquerdo', 'Ventrículo esquerdo'), L('septo-interventricular', 'Septo completo')] },
    ],
  },
  'desenvolvimento-embrionario': {
    id: 'desenvolvimento-embrionario',
    title: 'Desenvolvimento embrionário',
    structures: ['zigoto', 'blastomeros', 'morula', 'blastula', 'blastocele', 'ectoderme', 'endoderme', 'mesoderme', 'blastoporo', 'arquentero'],
    note: `${TIME} O modelo segue um anfíbio: o polo animal (escuro, em cima) tem pouco vitelo e células menores; o polo vegetal (claro, embaixo) tem mais vitelo.`,
    steps: [
      { title: '1. Zigoto', text: 'A fecundação une o espermatozoide ao óvulo e forma o zigoto, a primeira célula do novo indivíduo, com metade dos cromossomos de cada genitor.', seconds: 5, legend: [L('zigoto', 'Zigoto')] },
      { title: '2. Clivagem', text: 'O zigoto passa por mitoses rápidas sem crescer: 2, 4, 8 células… Cada célula (blastômero) fica menor a cada divisão.', seconds: 7, legend: [L('blastomeros', 'Blastômeros')] },
      { title: '3. Mórula', text: 'Com 16 a 32 células o embrião parece uma amora: é a mórula, ainda maciça e do mesmo tamanho do zigoto.', seconds: 5, legend: [L('morula', 'Mórula')] },
      { title: '4. Blástula', text: 'As células se organizam numa camada em volta de uma cavidade cheia de líquido, a blastocele. Esse estágio é a blástula (nos mamíferos, blastocisto).', seconds: 6, legend: [L('blastula', 'Blastoderme'), L('blastocele', 'Blastocele')] },
      { title: '5. Gastrulação', text: 'Um grupo de células afunda para dentro (invaginação), como um dedo empurrando uma bola murcha. Forma-se o arquêntero, o intestino primitivo, que se abre para fora pelo blastóporo.', seconds: 8, legend: [L('arquentero', 'Arquêntero'), L('blastoporo', 'Blastóporo')] },
      { title: '6. Os três folhetos germinativos', text: 'A gástrula tem ectoderme (origina pele e sistema nervoso), endoderme (revestimento do tubo digestório e respiratório) e mesoderme (músculos, ossos, sangue, coração, rins). Nos protostômios (minhoca, inseto) o blastóporo vira boca; nos deuterostômios (estrela-do-mar, vertebrados) vira ânus.', seconds: 8, legend: [L('ectoderme', 'Ectoderme'), L('mesoderme', 'Mesoderme'), L('endoderme', 'Endoderme')] },
    ],
  },
  'metamorfose-anfibio': {
    id: 'metamorfose-anfibio',
    title: 'Metamorfose do sapo',
    structures: ['ovos', 'massa-gelatinosa', 'girino', 'branquias-externas', 'cauda', 'patas-traseiras', 'patas-dianteiras', 'sapo'],
    note: `${TIME} Em muitas espécies o ciclo leva de 6 a 12 semanas e é controlado pelo hormônio da tireoide (tiroxina).`,
    steps: [
      { title: '1. Ovos na água', text: 'A fecundação é externa: a fêmea solta os óvulos na água e o macho os fecunda. Os ovos não têm casca; ficam protegidos por uma massa gelatinosa.', seconds: 5, legend: [L('ovos', 'Ovos'), L('massa-gelatinosa', 'Massa gelatinosa')] },
      { title: '2. Girino com brânquias externas', text: 'Eclode o girino: vive na água, nada com a cauda, come algas e respira por brânquias que no começo ficam do lado de fora.', seconds: 6, legend: [L('girino', 'Girino'), L('branquias-externas', 'Brânquias externas')] },
      { title: '3. Patas traseiras', text: 'As brânquias ficam cobertas por uma dobra de pele (brânquias internas) e surgem as patas traseiras. Os pulmões começam a se formar.', seconds: 6, legend: [L('patas-traseiras', 'Patas traseiras')] },
      { title: '4. Patas dianteiras e cauda reabsorvida', text: 'Aparecem as patas dianteiras. A cauda é reabsorvida (suas células morrem de forma programada e o material é reaproveitado), o intestino encurta e a boca se alarga.', seconds: 6, legend: [L('patas-dianteiras', 'Patas dianteiras'), L('cauda', 'Cauda encolhendo')] },
      { title: '5. Sapo adulto', text: 'O jovem sapo sai da água: respira por pulmões e pela pele e passa a comer insetos. Por depender da água para se reproduzir, os anfíbios vivem perto de ambientes úmidos.', seconds: 6, legend: [L('sapo', 'Sapo adulto')] },
    ],
  },
  'metamorfose-inseto': {
    id: 'metamorfose-inseto',
    title: 'Metamorfose completa (borboleta)',
    structures: ['ovo-inseto', 'lagarta', 'pupa', 'borboleta'],
    note: `${TIME} Na metamorfose incompleta (gafanhoto, barata, percevejo) não há pupa: do ovo sai uma ninfa parecida com o adulto, que cresce por mudas.`,
    steps: [
      { title: '1. Ovo', text: 'A borboleta põe os ovos na planta de que a larva vai se alimentar.', seconds: 5, legend: [L('ovo-inseto', 'Ovos')] },
      { title: '2. Larva (lagarta)', text: 'A lagarta come e cresce muito. Como o exoesqueleto não estica, ela troca de "pele" várias vezes (mudas, controladas pelo hormônio ecdisona).', seconds: 6, legend: [L('lagarta', 'Lagarta')] },
      { title: '3. Pupa (crisálida)', text: 'A lagarta para de comer, se prende a um galho e forma a pupa. Parece parada, mas por dentro está tudo mudando.', seconds: 5, legend: [L('pupa', 'Pupa')] },
      { title: '4. Metamorfose dentro da pupa', text: 'Grande parte dos tecidos da larva é desmontada e grupos de células guardados desde o embrião (discos imaginais) formam asas, antenas, pernas longas e olhos compostos.', seconds: 6, legend: [L('pupa', 'Pupa em transformação')] },
      { title: '5. Adulto (imago)', text: 'A borboleta sai, bombeia líquido para as asas e espera secar antes de voar. Larva e adulto comem coisas diferentes (folhas × néctar) e não competem entre si.', seconds: 7, legend: [L('borboleta', 'Borboleta adulta')] },
    ],
  },
};
