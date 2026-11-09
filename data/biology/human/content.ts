/**
 * Curated scientific content (pt-BR) for the Human Anatomy laboratory.
 *
 * Written for BioLab 3D (original text) and checked against the references
 * listed per entry. Keys are structure ids; side-specific meshes ("-dir"/"-esq")
 * fall back to their base key. Structures without an entry show only their
 * anatomical name, Latin name and system — clearly flagged in the UI as
 * "conteúdo em elaboração". Entries still require review by a qualified
 * Biology educator before commercial release (see SCIENTIFIC_CONTENT.md).
 */
import type { Reference } from '@/data/biology/schema';

export interface HumanContent {
  category: string;
  description: string;
  function: string;
  /** Extra classroom-oriented explanation. */
  educational?: string;
  related?: string[]; // structure ids
  topics: string[];
  refs: (keyof typeof REFS)[];
}

export const REFS = {
  apOrgans: { title: 'Anatomy and Physiology 2e — OpenStax', publisher: 'OpenStax (Rice University)', url: 'https://openstax.org/details/books/anatomy-and-physiology-2e', license: 'CC BY 4.0' },
  bio2e: { title: 'Biology 2e — OpenStax', publisher: 'OpenStax (Rice University)', url: 'https://openstax.org/details/books/biology-2e', license: 'CC BY 4.0' },
  ta2: { title: 'Terminologia Anatomica (TA2)', publisher: 'Federative International Programme for Anatomical Terminology (FIPAT)', url: 'https://fipat.library.dal.ca/ta2/' },
} satisfies Record<string, Reference>;

export const HUMAN_CONTENT: Record<string, HumanContent> = {
  // ------------------------------------------------------------ Cardiovascular
  coracao: {
    category: 'Órgão',
    description:
      'Órgão muscular oco localizado no mediastino, entre os pulmões, com o ápice voltado para baixo e para a esquerda. Possui quatro câmaras: dois átrios, que recebem o sangue, e dois ventrículos, que o bombeiam. Valvas cardíacas garantem que o sangue circule em um único sentido.',
    function:
      'Bombear o sangue continuamente por dois circuitos: a circulação pulmonar (lado direito → pulmões, para trocas gasosas) e a circulação sistêmica (lado esquerdo → todos os tecidos do corpo).',
    educational:
      'Uma boa sequência em sala: siga o caminho de uma gota de sangue — veias cavas → átrio direito → ventrículo direito → tronco pulmonar → pulmões → veias pulmonares → átrio esquerdo → ventrículo esquerdo → aorta.',
    related: ['pulmonary-trunk', 'ascending-aorta', 'superior-vena-cava', 'pulmao-direito', 'pulmao-esquerdo'],
    topics: ['Sistema cardiovascular', 'Circulação pulmonar e sistêmica', 'Ciclo cardíaco', 'Valvas cardíacas'],
    refs: ['apOrgans'],
  },
  'left-ventricle': {
    category: 'Câmara cardíaca',
    description: 'Câmara inferior esquerda do coração. Tem a parede muscular (miocárdio) mais espessa de todas as câmaras.',
    function: 'Recebe sangue oxigenado do átrio esquerdo e o impulsiona para a aorta, que o distribui a todo o corpo (circulação sistêmica).',
    educational: 'A parede mais espessa do ventrículo esquerdo está relacionada à maior pressão necessária para levar o sangue a todo o corpo.',
    related: ['coracao', 'left-atrium', 'ascending-aorta'],
    topics: ['Sistema cardiovascular', 'Circulação sistêmica'],
    refs: ['apOrgans'],
  },
  'right-ventricle': {
    category: 'Câmara cardíaca',
    description: 'Câmara inferior direita do coração, com parede mais fina que a do ventrículo esquerdo.',
    function: 'Recebe sangue pouco oxigenado do átrio direito e o impulsiona para o tronco pulmonar, em direção aos pulmões (circulação pulmonar).',
    related: ['coracao', 'right-atrium', 'pulmonary-trunk'],
    topics: ['Sistema cardiovascular', 'Circulação pulmonar'],
    refs: ['apOrgans'],
  },
  'left-atrium': {
    category: 'Câmara cardíaca',
    description: 'Câmara superior esquerda do coração, que recebe as veias pulmonares.',
    function: 'Recebe o sangue oxigenado que retorna dos pulmões e o envia ao ventrículo esquerdo através da valva atrioventricular esquerda (mitral).',
    related: ['coracao', 'left-ventricle'],
    topics: ['Sistema cardiovascular', 'Circulação pulmonar'],
    refs: ['apOrgans'],
  },
  'right-atrium': {
    category: 'Câmara cardíaca',
    description: 'Câmara superior direita do coração, que recebe as veias cavas superior e inferior e o seio coronário.',
    function: 'Recebe o sangue pouco oxigenado que retorna do corpo e o envia ao ventrículo direito através da valva atrioventricular direita (tricúspide). Na sua parede está o nó sinoatrial, marca-passo natural do coração.',
    related: ['coracao', 'right-ventricle', 'superior-vena-cava'],
    topics: ['Sistema cardiovascular', 'Circulação sistêmica', 'Sistema de condução do coração'],
    refs: ['apOrgans'],
  },
  'pulmonary-trunk': {
    category: 'Vaso sanguíneo (artéria)',
    description: 'Grande artéria que sai do ventrículo direito e se divide nas artérias pulmonares direita e esquerda.',
    function: 'Conduz sangue pouco oxigenado do coração aos pulmões. É uma artéria que transporta sangue pobre em oxigênio — artérias são definidas pelo sentido do fluxo (saem do coração), não pelo teor de oxigênio.',
    related: ['coracao', 'right-ventricle'],
    topics: ['Circulação pulmonar', 'Artérias e veias'],
    refs: ['apOrgans'],
  },
  'ascending-aorta': {
    category: 'Vaso sanguíneo (artéria)',
    description: 'Primeira porção da aorta, a maior artéria do corpo, que emerge do ventrículo esquerdo. Dela partem as artérias coronárias.',
    function: 'Conduz o sangue oxigenado do ventrículo esquerdo para o arco da aorta e, daí, para toda a circulação sistêmica.',
    related: ['coracao', 'left-ventricle', 'thoracic-aorta'],
    topics: ['Circulação sistêmica', 'Artérias e veias'],
    refs: ['apOrgans'],
  },
  'thoracic-aorta': {
    category: 'Vaso sanguíneo (artéria)',
    description: 'Porção descendente da aorta situada no tórax, à esquerda da coluna vertebral.',
    function: 'Distribui sangue oxigenado para estruturas da parede torácica e órgãos do tórax e continua como aorta abdominal após atravessar o diafragma.',
    related: ['ascending-aorta', 'abdominal-aorta', 'diaphragm'],
    topics: ['Circulação sistêmica'],
    refs: ['apOrgans'],
  },
  'abdominal-aorta': {
    category: 'Vaso sanguíneo (artéria)',
    description: 'Continuação da aorta abaixo do diafragma, até sua divisão nas artérias ilíacas comuns.',
    function: 'Fornece sangue oxigenado aos órgãos abdominais e, por suas ramificações, aos membros inferiores.',
    related: ['thoracic-aorta'],
    topics: ['Circulação sistêmica'],
    refs: ['apOrgans'],
  },
  'superior-vena-cava': {
    category: 'Vaso sanguíneo (veia)',
    description: 'Grande veia formada pela união das veias braquiocefálicas, que desemboca no átrio direito.',
    function: 'Devolve ao coração o sangue pouco oxigenado da cabeça, do pescoço, dos membros superiores e da parte superior do tronco.',
    related: ['right-atrium', 'coracao'],
    topics: ['Circulação sistêmica', 'Artérias e veias'],
    refs: ['apOrgans'],
  },
  'brachial-artery': {
    category: 'Vaso sanguíneo (artéria)',
    description: 'Principal artéria do braço, continuação da artéria axilar. Percorre a face medial do braço e se divide em artérias radial e ulnar na região do cotovelo.',
    function: 'Irriga os músculos e estruturas do braço. É a artéria comprimida pelo manguito na medida usual da pressão arterial.',
    related: ['humerus', 'long-head-of-biceps-brachii'],
    topics: ['Circulação sistêmica', 'Pressão arterial'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Respiratory
  'pulmao-direito': {
    category: 'Órgão',
    description: 'Pulmão situado à direita do coração, dividido em três lobos (superior, médio e inferior) por duas fissuras. É mais largo e um pouco mais curto que o esquerdo.',
    function: 'Realizar as trocas gasosas: o oxigênio do ar alveolar passa para o sangue e o gás carbônico do sangue passa para o ar, que é eliminado na expiração.',
    educational: 'As trocas gasosas acontecem nos alvéolos, estruturas microscópicas que não são visíveis neste modelo macroscópico.',
    related: ['pulmao-esquerdo', 'trachea', 'arvore-bronquica', 'diaphragm', 'coracao'],
    topics: ['Sistema respiratório', 'Trocas gasosas', 'Ventilação pulmonar'],
    refs: ['apOrgans'],
  },
  'pulmao-esquerdo': {
    category: 'Órgão',
    description: 'Pulmão situado à esquerda, dividido em dois lobos (superior e inferior). Apresenta a incisura cardíaca, um recorte que acomoda o coração.',
    function: 'Realizar as trocas gasosas entre o ar e o sangue, assim como o pulmão direito.',
    educational: 'Compare os dois pulmões: o esquerdo tem dois lobos e o direito tem três. A diferença está relacionada ao espaço ocupado pelo coração.',
    related: ['pulmao-direito', 'trachea', 'arvore-bronquica', 'coracao'],
    topics: ['Sistema respiratório', 'Trocas gasosas'],
    refs: ['apOrgans'],
  },
  'arvore-bronquica': {
    category: 'Conjunto de vias aéreas',
    description: 'Sistema ramificado de tubos formado pelos brônquios principais, lobares e segmentares, que se dividem sucessivamente dentro dos pulmões.',
    function: 'Conduzir o ar da traqueia até as regiões mais profundas dos pulmões, onde ocorrem as trocas gasosas.',
    related: ['trachea', 'pulmao-direito', 'pulmao-esquerdo'],
    topics: ['Sistema respiratório', 'Vias aéreas'],
    refs: ['apOrgans'],
  },
  trachea: {
    category: 'Órgão (via aérea)',
    description: 'Tubo de cerca de 10 a 12 cm, reforçado por anéis de cartilagem em forma de "C", que vai da laringe até a divisão nos brônquios principais.',
    function: 'Conduzir o ar entre a laringe e os brônquios. Seus anéis cartilaginosos mantêm a via aberta, e o revestimento com muco e cílios ajuda a reter e remover partículas.',
    related: ['arvore-bronquica', 'oesophagus', 'thyroid-cartilage'],
    topics: ['Sistema respiratório', 'Vias aéreas'],
    refs: ['apOrgans'],
  },
  diaphragm: {
    category: 'Músculo',
    description: 'Músculo em forma de cúpula que separa a cavidade torácica da cavidade abdominal.',
    function: 'Principal músculo da respiração: ao contrair, desce e aumenta o volume do tórax, fazendo o ar entrar nos pulmões (inspiração). Ao relaxar, volta à forma de cúpula (expiração em repouso).',
    related: ['pulmao-direito', 'pulmao-esquerdo', 'liver'],
    topics: ['Sistema respiratório', 'Mecânica da respiração', 'Sistema muscular'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Digestive
  liver: {
    category: 'Órgão (glândula)',
    description: 'Maior glândula do corpo, localizada principalmente no quadrante superior direito do abdome, logo abaixo do diafragma.',
    function: 'Produz a bile (que ajuda na digestão das gorduras), armazena glicogênio, participa do metabolismo de nutrientes, produz proteínas do plasma e transforma substâncias tóxicas para que sejam eliminadas.',
    related: ['gallbladder', 'stomach', 'duodenum', 'diaphragm'],
    topics: ['Sistema digestório', 'Glândulas anexas', 'Metabolismo'],
    refs: ['apOrgans'],
  },
  gallbladder: {
    category: 'Órgão',
    description: 'Pequeno órgão em forma de pera localizado na face inferior do fígado.',
    function: 'Armazena e concentra a bile produzida pelo fígado e a libera no duodeno durante a digestão, especialmente de alimentos gordurosos.',
    related: ['liver', 'duodenum', 'bile-duct'],
    topics: ['Sistema digestório', 'Digestão de lipídios'],
    refs: ['apOrgans'],
  },
  stomach: {
    category: 'Órgão',
    description: 'Porção dilatada do tubo digestório entre o esôfago e o duodeno, situada na parte superior esquerda do abdome.',
    function: 'Armazena temporariamente o alimento, mistura-o com o suco gástrico (ácido clorídrico e enzimas como a pepsina) e inicia a digestão das proteínas, formando o quimo.',
    related: ['oesophagus', 'duodenum', 'liver', 'pancreas'],
    topics: ['Sistema digestório', 'Digestão química e mecânica'],
    refs: ['apOrgans'],
  },
  oesophagus: {
    category: 'Órgão',
    description: 'Tubo muscular que liga a faringe ao estômago, passando pelo tórax atrás da traqueia e atravessando o diafragma.',
    function: 'Conduz o alimento até o estômago por meio de contrações musculares coordenadas (peristaltismo).',
    related: ['stomach', 'trachea', 'diaphragm'],
    topics: ['Sistema digestório', 'Peristaltismo'],
    refs: ['apOrgans'],
  },
  pancreas: {
    category: 'Órgão (glândula mista)',
    description: 'Glândula alongada situada atrás do estômago, com a cabeça encaixada na curvatura do duodeno.',
    function: 'Tem função dupla: exócrina, produzindo o suco pancreático com enzimas digestivas lançadas no duodeno; e endócrina, produzindo hormônios como a insulina e o glucagon, que regulam a glicose no sangue.',
    related: ['duodenum', 'stomach', 'liver'],
    topics: ['Sistema digestório', 'Sistema endócrino', 'Regulação da glicemia'],
    refs: ['apOrgans'],
  },
  duodenum: {
    category: 'Órgão (intestino delgado)',
    description: 'Primeira porção do intestino delgado, em forma de "C", que recebe o quimo vindo do estômago.',
    function: 'Recebe a bile e o suco pancreático; é onde grande parte da digestão química dos alimentos acontece.',
    related: ['stomach', 'pancreas', 'gallbladder', 'jejunum'],
    topics: ['Sistema digestório', 'Digestão química'],
    refs: ['apOrgans'],
  },
  'intestino-delgado': {
    category: 'Órgão',
    description: 'Porção mais longa do tubo digestório, formada por duodeno, jejuno e íleo. Neste modelo estão representados o duodeno e o jejuno.',
    function: 'Completar a digestão e absorver a maior parte dos nutrientes, graças à enorme superfície interna formada por pregas, vilosidades e microvilosidades.',
    educational: 'Vilosidades e microvilosidades são estruturas microscópicas e não aparecem neste modelo.',
    related: ['duodenum', 'jejunum', 'intestino-grosso', 'stomach'],
    topics: ['Sistema digestório', 'Absorção de nutrientes'],
    refs: ['apOrgans'],
  },
  'intestino-grosso': {
    category: 'Órgão',
    description: 'Porção final do tubo digestório, formada pelo ceco (com o apêndice vermiforme), colos ascendente, transverso, descendente e sigmoide, reto e canal anal. As tênias são faixas de músculo longitudinal na sua parede.',
    function: 'Absorver água e sais minerais, formar e armazenar as fezes. Abriga a microbiota intestinal, que participa da produção de algumas vitaminas.',
    related: ['intestino-delgado', 'vermiform-appendix'],
    topics: ['Sistema digestório', 'Microbiota intestinal'],
    refs: ['apOrgans'],
  },
  tongue: {
    category: 'Órgão muscular',
    description: 'Órgão muscular da cavidade oral, recoberto por mucosa com papilas, onde estão os botões gustativos.',
    function: 'Participa da mastigação e da deglutição, movimentando o alimento; percepção do paladar; e articulação das palavras na fala.',
    related: ['glandulas-salivares', 'oesophagus'],
    topics: ['Sistema digestório', 'Sentidos (paladar)'],
    refs: ['apOrgans'],
  },
  'glandulas-salivares': {
    category: 'Glândulas',
    description: 'Três pares de glândulas salivares maiores: parótidas, submandibulares e sublinguais.',
    function: 'Produzem a saliva, que umedece o alimento e contém a amilase salivar, enzima que inicia a digestão do amido na boca.',
    related: ['tongue'],
    topics: ['Sistema digestório', 'Digestão do amido'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Urinary
  'urinary-bladder': {
    category: 'Órgão',
    description: 'Órgão muscular oco e distensível localizado na pelve.',
    function: 'Armazena temporariamente a urina produzida pelos rins e conduzida pelos ureteres, até sua eliminação pela uretra (micção).',
    educational: 'Os rins não estão incluídos nesta versão do modelo por restrição de licença do arquivo 3D original (uso não comercial). Uma versão própria está prevista.',
    related: ['ureter', 'urethra', 'prostate'],
    topics: ['Sistema urinário', 'Excreção'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Reproductive (male)
  testis: {
    category: 'Órgão (gônada masculina)',
    description:
      'Par de órgãos ovais localizados no escroto, fora da cavidade abdominal. Internamente, são divididos em lóbulos que contêm os túbulos seminíferos. Sobre a borda posterior de cada testículo fica o epidídimo.',
    function:
      'Produzir os espermatozoides (espermatogênese, nos túbulos seminíferos) e o hormônio testosterona (pelas células intersticiais de Leydig), responsável pelas características sexuais secundárias masculinas.',
    educational:
      'A espermatogênese acontece em escala microscópica, dentro dos túbulos seminíferos, e não é visível neste modelo macroscópico. A posição dos testículos no escroto mantém uma temperatura um pouco abaixo da corporal, favorável à produção de espermatozoides. A produção de testosterona é estimulada pelo LH, hormônio da hipófise.',
    related: ['epididymis', 'ductus-deferens', 'seminal-gland', 'prostate', 'adenohypophysis'],
    topics: ['Sistema reprodutor masculino', 'Espermatogênese', 'Hormônios sexuais', 'Gametogênese'],
    refs: ['apOrgans', 'bio2e'],
  },
  epididymis: {
    category: 'Órgão (ducto)',
    description: 'Ducto longo e muito enovelado que se apoia sobre a borda posterior do testículo.',
    function: 'Armazena os espermatozoides e é o local onde eles completam sua maturação, adquirindo capacidade de movimento. Continua-se com o ducto deferente.',
    related: ['testis', 'ductus-deferens'],
    topics: ['Sistema reprodutor masculino', 'Espermatogênese'],
    refs: ['apOrgans'],
  },
  'ductus-deferens': {
    category: 'Órgão (ducto)',
    description: 'Ducto muscular que sai do epidídimo, sobe pelo funículo espermático, entra na pelve e se une ao ducto da glândula seminal formando o ducto ejaculatório.',
    function: 'Transportar os espermatozoides do epidídimo até a uretra durante a ejaculação, por meio de contrações peristálticas.',
    related: ['epididymis', 'seminal-gland', 'prostate'],
    topics: ['Sistema reprodutor masculino'],
    refs: ['apOrgans'],
  },
  'seminal-gland': {
    category: 'Glândula',
    description: 'Par de glândulas localizadas atrás da bexiga urinária (também chamadas vesículas seminais).',
    function: 'Produzem a maior parte do volume do sêmen: um líquido rico em frutose, que fornece energia aos espermatozoides.',
    related: ['ductus-deferens', 'prostate', 'urinary-bladder'],
    topics: ['Sistema reprodutor masculino'],
    refs: ['apOrgans'],
  },
  prostate: {
    category: 'Glândula',
    description: 'Glândula do tamanho aproximado de uma noz, situada logo abaixo da bexiga, envolvendo o início da uretra.',
    function: 'Produz um líquido que compõe parte do sêmen e contribui para a mobilidade e a proteção dos espermatozoides.',
    related: ['urinary-bladder', 'seminal-gland', 'ductus-deferens'],
    topics: ['Sistema reprodutor masculino', 'Saúde do homem'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Endocrine
  'thyroid-gland': {
    category: 'Glândula endócrina',
    description: 'Glândula em forma de borboleta localizada na parte anterior do pescoço, abaixo da laringe, com dois lobos unidos por um istmo.',
    function: 'Produz os hormônios tireoidianos (T3 e T4), que regulam o metabolismo do corpo, e a calcitonina, que participa da regulação do cálcio no sangue. Depende de iodo para produzir seus hormônios.',
    related: ['trachea', 'thyroid-cartilage', 'adenohypophysis'],
    topics: ['Sistema endócrino', 'Metabolismo', 'Iodo na alimentação'],
    refs: ['apOrgans'],
  },
  'suprarenal-gland': {
    category: 'Glândula endócrina',
    description: 'Par de glândulas situadas sobre o polo superior de cada rim (também chamadas glândulas adrenais).',
    function: 'O córtex produz hormônios como o cortisol e a aldosterona; a medula produz adrenalina e noradrenalina, liberadas em situações de estresse (resposta de "luta ou fuga").',
    related: ['pancreas'],
    topics: ['Sistema endócrino', 'Resposta ao estresse'],
    refs: ['apOrgans'],
  },
  adenohypophysis: {
    category: 'Glândula endócrina',
    description: 'Porção anterior da hipófise, pequena glândula ligada à base do encéfalo.',
    function: 'Produz hormônios que controlam outras glândulas, como o TSH (tireoide), o ACTH (suprarrenais), o FSH e o LH (gônadas), além do hormônio do crescimento (GH) e da prolactina.',
    related: ['neurohypophysis', 'thyroid-gland', 'testis'],
    topics: ['Sistema endócrino', 'Regulação hormonal'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Lymphatic
  spleen: {
    category: 'Órgão linfoide',
    description: 'Órgão situado no quadrante superior esquerdo do abdome, atrás do estômago e protegido pelas costelas inferiores.',
    function: 'Filtra o sangue, removendo hemácias velhas ou danificadas, e participa da defesa do organismo, abrigando linfócitos que respondem a microrganismos presentes no sangue.',
    related: ['stomach', 'pancreas'],
    topics: ['Sistema linfático', 'Sistema imunitário'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Skeletal
  humerus: {
    category: 'Osso longo',
    description:
      'Único osso do braço. Sua extremidade proximal (cabeça do úmero) articula-se com a escápula, formando a articulação do ombro; a extremidade distal articula-se com o rádio e a ulna, formando a articulação do cotovelo.',
    function:
      'Sustenta o braço e serve de alavanca e ponto de fixação para músculos como o deltoide, o bíceps braquial (indiretamente, pelo movimento do antebraço), o braquial e o tríceps braquial, permitindo os movimentos do ombro e do cotovelo.',
    educational: 'Relação anatômica importante: o nervo radial contorna a face posterior do úmero, e o nervo ulnar passa atrás do epicôndilo medial (o "osso da sorte" do cotovelo).',
    related: ['scapula', 'radius', 'ulna', 'radial-nerve', 'ulnar-nerve', 'long-head-of-biceps-brachii'],
    topics: ['Sistema esquelético', 'Membro superior', 'Articulações', 'Alavancas no corpo humano'],
    refs: ['apOrgans'],
  },
  radius: {
    category: 'Osso longo',
    description: 'Osso lateral do antebraço (do lado do polegar, na posição anatômica). É mais largo na extremidade distal, onde se articula com os ossos do carpo.',
    function: 'Forma, com a ulna, o esqueleto do antebraço. Gira ao redor da ulna nos movimentos de pronação e supinação (virar a palma da mão para baixo e para cima) e participa da articulação do punho.',
    related: ['ulna', 'humerus', 'mao-dir', 'mao-esq'],
    topics: ['Sistema esquelético', 'Membro superior', 'Pronação e supinação'],
    refs: ['apOrgans'],
  },
  ulna: {
    category: 'Osso longo',
    description: 'Osso medial do antebraço (do lado do dedo mínimo). Sua extremidade proximal forma o olécrano, a ponta do cotovelo.',
    function: 'Forma a principal articulação do cotovelo com o úmero e dá estabilidade ao antebraço, servindo de eixo para a rotação do rádio.',
    related: ['radius', 'humerus', 'ulnar-nerve'],
    topics: ['Sistema esquelético', 'Membro superior', 'Articulações'],
    refs: ['apOrgans'],
  },
  scapula: {
    category: 'Osso plano',
    description: 'Osso triangular e plano localizado na parte posterior do tórax (a "omoplata").',
    function: 'Conecta o membro superior ao tronco, junto com a clavícula. Sua cavidade glenoidal articula-se com a cabeça do úmero, e muitos músculos do ombro se fixam nela.',
    related: ['humerus', 'clavicle'],
    topics: ['Sistema esquelético', 'Cíngulo do membro superior'],
    refs: ['apOrgans'],
  },
  clavicle: {
    category: 'Osso longo',
    description: 'Osso em forma de "S" alongado, horizontal, entre o esterno e a escápula.',
    function: 'Funciona como uma escora que mantém o membro superior afastado do tronco, permitindo grande amplitude de movimento do ombro, e transmite forças do membro superior ao esqueleto axial.',
    related: ['scapula', 'esterno'],
    topics: ['Sistema esquelético', 'Cíngulo do membro superior'],
    refs: ['apOrgans'],
  },
  femur: {
    category: 'Osso longo',
    description: 'Osso da coxa, o mais longo e resistente do corpo humano. A cabeça do fêmur articula-se com o osso do quadril; a extremidade distal articula-se com a tíbia e a patela, formando o joelho.',
    function: 'Sustenta o peso do corpo na posição em pé e durante a locomoção e serve de fixação para músculos potentes da coxa.',
    related: ['hip-bone', 'tibia', 'patella', 'rectus-femoris-muscle', 'sciatic-nerve'],
    topics: ['Sistema esquelético', 'Membro inferior', 'Locomoção'],
    refs: ['apOrgans'],
  },
  tibia: {
    category: 'Osso longo',
    description: 'Osso medial e mais robusto da perna (a "canela").',
    function: 'Transmite o peso do corpo do fêmur para o pé e participa das articulações do joelho e do tornozelo.',
    related: ['femur', 'fibula', 'patella'],
    topics: ['Sistema esquelético', 'Membro inferior'],
    refs: ['apOrgans'],
  },
  fibula: {
    category: 'Osso longo',
    description: 'Osso fino e lateral da perna, paralelo à tíbia.',
    function: 'Não sustenta peso significativo; serve de fixação muscular e forma a parte lateral da articulação do tornozelo, dando-lhe estabilidade.',
    related: ['tibia'],
    topics: ['Sistema esquelético', 'Membro inferior'],
    refs: ['apOrgans'],
  },
  patella: {
    category: 'Osso sesamoide',
    description: 'Osso triangular localizado na frente do joelho (a "rótula"), envolvido pelo tendão do músculo quadríceps femoral.',
    function: 'Protege a articulação do joelho e aumenta a eficiência mecânica do quadríceps na extensão da perna.',
    related: ['femur', 'tibia', 'rectus-femoris-muscle'],
    topics: ['Sistema esquelético', 'Articulação do joelho'],
    refs: ['apOrgans'],
  },
  'hip-bone': {
    category: 'Osso plano/irregular',
    description: 'Osso formado pela fusão de três ossos (ílio, ísquio e púbis). Os dois ossos do quadril, com o sacro, formam a pelve óssea.',
    function: 'Transmite o peso do tronco aos membros inferiores, protege órgãos pélvicos e possui o acetábulo, cavidade onde se encaixa a cabeça do fêmur.',
    related: ['femur', 'sacrum'],
    topics: ['Sistema esquelético', 'Pelve'],
    refs: ['apOrgans'],
  },
  mandible: {
    category: 'Osso',
    description: 'Osso da mandíbula, o maior e mais forte osso da face, e o único osso do crânio com articulação móvel (articulação temporomandibular).',
    function: 'Sustenta os dentes inferiores e permite a mastigação e a fala, com os movimentos de abrir, fechar e deslizar a boca.',
    related: ['cranio', 'dentes'],
    topics: ['Sistema esquelético', 'Mastigação'],
    refs: ['apOrgans'],
  },
  cranio: {
    category: 'Conjunto de ossos',
    description: 'Conjunto de ossos da cabeça, dividido em neurocrânio (que envolve o encéfalo) e viscerocrânio (ossos da face). Os ossos do neurocrânio são unidos por suturas.',
    function: 'Protege o encéfalo e os órgãos dos sentidos, dá forma à face e serve de fixação para músculos da mastigação e da expressão facial.',
    related: ['mandible', 'coluna-vertebral'],
    topics: ['Sistema esquelético', 'Esqueleto axial'],
    refs: ['apOrgans'],
  },
  'coluna-vertebral': {
    category: 'Conjunto de ossos',
    description: 'Eixo do corpo formado por vértebras cervicais (7), torácicas (12) e lombares (5), além do sacro e do cóccix. Apresenta curvaturas naturais que vistas de lado lembram um "S".',
    function: 'Sustenta o tronco e a cabeça, protege a medula espinal no canal vertebral e permite movimentos de flexão, extensão e rotação do tronco.',
    related: ['cranio', 'caixa-toracica', 'sacrum'],
    topics: ['Sistema esquelético', 'Esqueleto axial', 'Postura'],
    refs: ['apOrgans'],
  },
  'caixa-toracica': {
    category: 'Conjunto de ossos e cartilagens',
    description: 'Estrutura formada por 12 pares de costelas, cartilagens costais, esterno e vértebras torácicas.',
    function: 'Protege o coração, os pulmões e grandes vasos e participa da respiração, movimentando-se com a ação dos músculos intercostais e do diafragma.',
    related: ['esterno', 'coracao', 'pulmao-direito', 'pulmao-esquerdo', 'diaphragm'],
    topics: ['Sistema esquelético', 'Mecânica da respiração'],
    refs: ['apOrgans'],
  },
  esterno: {
    category: 'Osso plano',
    description: 'Osso plano e alongado no centro do tórax, formado por manúbrio, corpo e processo xifoide.',
    function: 'Fixa as cartilagens costais das costelas superiores e protege o coração. Serve de referência para a compressão torácica nas manobras de reanimação.',
    related: ['caixa-toracica', 'clavicle', 'coracao'],
    topics: ['Sistema esquelético', 'Primeiros socorros'],
    refs: ['apOrgans'],
  },
  'mao-dir': {
    category: 'Conjunto de ossos',
    description: 'Esqueleto da mão: 8 ossos do carpo (punho), 5 metacarpais (palma) e 14 falanges (dedos).',
    function: 'Permite movimentos finos e precisos, como a pinça entre polegar e indicador, essenciais para manipular objetos.',
    related: ['radius', 'ulna'],
    topics: ['Sistema esquelético', 'Membro superior'],
    refs: ['apOrgans'],
  },
  dentes: {
    category: 'Órgãos',
    description: 'Neste modelo estão representados incisivos, caninos, pré-molares e os dois primeiros molares de cada hemiarcada.',
    function: 'Cortar (incisivos), perfurar e rasgar (caninos) e triturar (pré-molares e molares) o alimento — a digestão mecânica que começa na boca.',
    related: ['mandible', 'tongue'],
    topics: ['Sistema digestório', 'Digestão mecânica', 'Saúde bucal'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Muscular
  'long-head-of-biceps-brachii': {
    category: 'Músculo esquelético',
    description: 'Uma das duas cabeças do músculo bíceps braquial, na face anterior do braço. Origina-se acima da cavidade glenoidal da escápula; o músculo se insere no rádio.',
    function: 'O bíceps braquial flexiona o cotovelo e é o principal supinador do antebraço (vira a palma da mão para cima).',
    educational: 'Bíceps e tríceps formam um par antagonista: enquanto um contrai, o outro relaxa.',
    related: ['humerus', 'radius', 'long-head-of-triceps-brachii', 'brachialis-muscle'],
    topics: ['Sistema muscular', 'Músculos antagonistas', 'Membro superior'],
    refs: ['apOrgans'],
  },
  'long-head-of-triceps-brachii': {
    category: 'Músculo esquelético',
    description: 'Cabeça do tríceps braquial, músculo da face posterior do braço com três cabeças (longa, lateral e medial), que se insere no olécrano da ulna.',
    function: 'Estende o cotovelo (antagonista do bíceps braquial); a cabeça longa também auxilia movimentos do ombro.',
    related: ['humerus', 'ulna', 'long-head-of-biceps-brachii'],
    topics: ['Sistema muscular', 'Músculos antagonistas'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Nervous
  'sciatic-nerve': {
    category: 'Nervo',
    description: 'Maior e mais espesso nervo do corpo. Sai da pelve, desce pela parte posterior da coxa e se divide nos nervos tibial e fibular comum.',
    function: 'Leva comandos motores para músculos da parte posterior da coxa, da perna e do pé, e conduz a sensibilidade de grande parte da perna e do pé.',
    related: ['femur', 'gluteus-maximus-muscle'],
    topics: ['Sistema nervoso periférico', 'Nervos espinais'],
    refs: ['apOrgans'],
  },
  'ulnar-nerve': {
    category: 'Nervo',
    description: 'Nervo do membro superior que passa atrás do epicôndilo medial do úmero, no cotovelo.',
    function: 'Inerva músculos do antebraço e da mão responsáveis por movimentos finos dos dedos, e a sensibilidade do dedo mínimo e de parte do anular. Uma batida no cotovelo, onde ele é superficial, causa o conhecido "choque".',
    related: ['humerus', 'ulna'],
    topics: ['Sistema nervoso periférico', 'Membro superior'],
    refs: ['apOrgans'],
  },
  'radial-nerve': {
    category: 'Nervo',
    description: 'Nervo que contorna a face posterior do úmero e desce pela região lateral do antebraço.',
    function: 'Inerva os músculos extensores do braço (tríceps) e do antebraço, permitindo estender o cotovelo, o punho e os dedos.',
    related: ['humerus', 'long-head-of-triceps-brachii'],
    topics: ['Sistema nervoso periférico', 'Membro superior'],
    refs: ['apOrgans'],
  },
  'median-nerve': {
    category: 'Nervo',
    description: 'Nervo que percorre a parte central do antebraço e passa pelo túnel do carpo, no punho.',
    function: 'Inerva músculos flexores do antebraço e músculos do polegar, e a sensibilidade de grande parte da palma. Sua compressão no punho causa a síndrome do túnel do carpo.',
    related: ['humerus', 'mao-dir'],
    topics: ['Sistema nervoso periférico', 'Membro superior'],
    refs: ['apOrgans'],
  },
  'vagus-nerve-x': {
    category: 'Nervo craniano (X)',
    description: 'Décimo par de nervos cranianos. Sai do tronco encefálico e desce pelo pescoço até o tórax e o abdome.',
    function: 'Principal nervo da divisão parassimpática: reduz a frequência cardíaca, estimula a digestão e controla músculos da faringe e da laringe.',
    related: ['coracao', 'stomach'],
    topics: ['Sistema nervoso autônomo', 'Nervos cranianos'],
    refs: ['apOrgans'],
  },
  pele: {
    category: 'Órgão (sistema tegumentar)',
    description:
      'Maior órgão do corpo, formado pela epiderme e pela derme. Neste modelo, a pele é representada como uma superfície contínua e semitransparente, para permitir a visão das estruturas internas.',
    function: 'Proteger contra agentes do ambiente, perda de água e microrganismos; participar da regulação da temperatura; perceber estímulos (tato, dor, temperatura); e produzir vitamina D com a luz solar.',
    educational: 'Clique em uma região do corpo (por exemplo, o braço) para ver as estruturas daquela região camada por camada.',
    related: [],
    topics: ['Sistema tegumentar', 'Termorregulação'],
    refs: ['apOrgans'],
  },
};

/** Generic per-system notes for structures that do not yet have curated text. */
export const SYSTEM_NOTES: Record<string, string> = {
  tegumentar: 'Parte do sistema tegumentar, que protege o corpo e participa da regulação da temperatura.',
  esqueletico: 'Parte do sistema esquelético, que sustenta o corpo, protege órgãos e, com os músculos, permite os movimentos.',
  muscular: 'Parte do sistema muscular: músculos e tendões que produzem os movimentos do corpo.',
  fascias: 'Tecido conjuntivo associado aos músculos e articulações: fáscias envolvem e separam músculos, ligamentos unem ossos e bolsas sinoviais reduzem o atrito.',
  coracao: 'Parte do coração, órgão central do sistema cardiovascular.',
  vasos: 'Vaso sanguíneo do sistema cardiovascular. Artérias levam o sangue do coração aos tecidos; veias o trazem de volta.',
  nervoso: 'Parte do sistema nervoso periférico ou dos órgãos dos sentidos.',
  respiratorio: 'Parte do sistema respiratório, responsável pela condução do ar e pelas trocas gasosas.',
  digestorio: 'Parte do sistema digestório, responsável pela digestão dos alimentos e pela absorção de nutrientes.',
  urinario: 'Parte do sistema urinário, que forma, armazena e elimina a urina.',
  reprodutor: 'Parte do sistema reprodutor masculino.',
  endocrino: 'Parte do sistema endócrino, formado por glândulas que liberam hormônios no sangue.',
  linfatico: 'Parte do sistema linfático, que participa da defesa do organismo e do retorno de líquidos ao sangue.',
};

// Side-agnostic composites share the same text.
HUMAN_CONTENT['mao-esq'] = HUMAN_CONTENT['mao-dir'];
