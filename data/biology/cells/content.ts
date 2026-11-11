/**
 * Curated scientific content (pt-BR) for the Cell Biology laboratory.
 *
 * Original text written for BioLab 3D and checked against OpenStax Biology 2e
 * (CC BY 4.0), chapters 4 (cell structure), 5 (membranes), 7 (cellular
 * respiration), 8 (photosynthesis) and 10 (cell reproduction). Sizes are
 * typical orders of magnitude, not exact values. Every entry still requires
 * review by a qualified Biology educator before commercial release
 * (see docs/SCIENTIFIC_CONTENT.md).
 */
import type { Reference } from '@/data/biology/schema';

export const CELL_REFS = {
  procariontes: { title: 'Biology 2e, 4.2 — Células procarióticas', publisher: 'OpenStax (Rice University)', url: 'https://openstax.org/books/biology-2e/pages/4-2-prokaryotic-cells', license: 'CC BY 4.0' },
  eucariontes: { title: 'Biology 2e, 4.3 — Células eucarióticas', publisher: 'OpenStax (Rice University)', url: 'https://openstax.org/books/biology-2e/pages/4-3-eukaryotic-cells', license: 'CC BY 4.0' },
  endomembranas: { title: 'Biology 2e, 4.4 — Sistema de endomembranas e proteínas', publisher: 'OpenStax (Rice University)', url: 'https://openstax.org/books/biology-2e/pages/4-4-the-endomembrane-system-and-proteins', license: 'CC BY 4.0' },
  livro: { title: 'Biology 2e — caps. 5 (membranas), 7 (respiração), 8 (fotossíntese) e 10 (divisão celular)', publisher: 'OpenStax (Rice University)', url: 'https://openstax.org/details/books/biology-2e', license: 'CC BY 4.0' },
} satisfies Record<string, Reference>;

export interface CellContent {
  name: string;
  scientificName?: string;
  /** English term (stable, used for search and for Studio). */
  en: string;
  category: string;
  parent?: string;
  description: string;
  function: string;
  educational?: string;
  /** Typical real size, shown because every model here is out of scale. */
  size?: string;
  related?: string[];
  topics: string[];
  refs: (keyof typeof CELL_REFS)[];
  /** Extra search words (synonyms used in Brazilian textbooks). */
  aliases?: string[];
}

export const CELL_CONTENT: Record<string, CellContent> = {
  // ------------------------------------------------------------ envoltórios
  'membrana-plasmatica': {
    name: 'Membrana plasmática',
    en: 'Plasma membrane',
    category: 'Envoltório celular',
    description:
      'Película finíssima que delimita todas as células. É formada por uma bicamada de fosfolipídios com proteínas inseridas, além de colesterol (nas células animais) e glicídios na face externa (glicocálix). Esse arranjo é descrito pelo modelo do mosaico fluido.',
    function:
      'Controlar o que entra e o que sai da célula (permeabilidade seletiva), por transporte passivo (difusão, osmose), transporte ativo e por endocitose/exocitose. Também participa do reconhecimento entre células e da recepção de sinais.',
    educational:
      'Nas bactérias, a membrana plasmática também abriga as enzimas da respiração celular, já que elas não têm mitocôndrias. Peça aos alunos que comparem esse papel com o das cristas mitocondriais.',
    size: 'Cerca de 7 a 10 nm de espessura',
    related: ['citoplasma', 'parede-celular', 'vesiculas'],
    topics: ['Modelo do mosaico fluido', 'Transporte passivo e ativo', 'Osmose', 'Endocitose e exocitose'],
    refs: ['eucariontes', 'livro'],
    aliases: ['plasmalema', 'membrana celular'],
  },
  citoplasma: {
    name: 'Citoplasma',
    en: 'Cytoplasm',
    category: 'Compartimento celular',
    description:
      'Região entre a membrana plasmática e o núcleo (ou, nas bactérias, todo o interior da célula). É formado pelo citosol — um fluido gelatinoso rico em água, íons, açúcares e proteínas —, pelas organelas e pelo citoesqueleto.',
    function:
      'É o ambiente onde acontecem muitas reações químicas da célula, como a glicólise (primeira etapa da respiração celular) e a síntese de proteínas nos ribossomos livres.',
    size: 'Ocupa a maior parte do volume da célula',
    related: ['membrana-plasmatica', 'ribossomos'],
    topics: ['Citosol', 'Glicólise', 'Organização celular'],
    refs: ['eucariontes', 'procariontes'],
    aliases: ['citosol', 'hialoplasma'],
  },
  'parede-celular': {
    name: 'Parede celular',
    en: 'Plant cell wall',
    category: 'Envoltório celular',
    description:
      'Camada rígida externa à membrana plasmática das células vegetais, formada principalmente por fibras de celulose, além de hemiceluloses e pectinas. É permeável à água e a pequenas moléculas. Canais chamados plasmodesmos atravessam a parede e ligam células vizinhas.',
    function:
      'Dar forma e sustentação à célula e à planta, proteger contra danos mecânicos e impedir que a célula se rompa quando absorve muita água: a parede resiste à pressão de turgor.',
    educational:
      'Bom momento para comparar: fungos também têm parede (de quitina) e bactérias têm parede de peptidoglicano. Só as células animais não têm parede.',
    size: 'De 0,1 µm a vários micrômetros de espessura',
    related: ['membrana-plasmatica', 'vacuolo', 'parede-celular-bacteriana'],
    topics: ['Celulose', 'Turgor e plasmólise', 'Diferenças entre célula animal e vegetal'],
    refs: ['eucariontes'],
    aliases: ['celulose', 'membrana celulósica'],
  },

  // ------------------------------------------------------------ núcleo
  nucleo: {
    name: 'Núcleo',
    scientificName: 'Nucleus',
    en: 'Nucleus',
    category: 'Organela',
    description:
      'Geralmente a maior organela da célula eucariótica. É delimitado pelo envoltório nuclear (carioteca) e contém a cromatina — o DNA associado a proteínas — e um ou mais nucléolos, imersos no nucleoplasma.',
    function:
      'Guardar a informação genética e controlar as atividades da célula: no núcleo o DNA é duplicado (replicação) e transcrito em RNA, que depois sai para o citoplasma e orienta a produção de proteínas.',
    educational:
      'A presença de núcleo organizado é justamente o que separa eucariontes de procariontes. Abra a célula procariótica para mostrar o nucleoide, onde o DNA fica livre no citoplasma.',
    size: 'Cerca de 5 a 10 µm de diâmetro',
    related: ['envoltorio-nuclear', 'nucleolo', 'cromatina', 'nucleoide'],
    topics: ['Eucariontes e procariontes', 'Transcrição', 'Replicação do DNA', 'Cromossomos'],
    refs: ['eucariontes'],
  },
  'envoltorio-nuclear': {
    name: 'Envoltório nuclear (carioteca)',
    en: 'Nuclear envelope',
    category: 'Envoltório do núcleo',
    parent: 'nucleo',
    description:
      'Formado por duas membranas. A membrana externa é contínua com o retículo endoplasmático rugoso. O envoltório é atravessado por poros nucleares, grandes complexos de proteínas.',
    function:
      'Separar o material genético do citoplasma e controlar, pelos poros, a passagem de moléculas: RNA mensageiro e subunidades de ribossomos saem do núcleo; proteínas como as histonas e as enzimas do núcleo entram.',
    size: 'Duas membranas; poros de cerca de 100 nm',
    related: ['nucleo', 'reticulo-endoplasmatico-rugoso'],
    topics: ['Poros nucleares', 'Transcrição', 'Divisão celular'],
    refs: ['eucariontes'],
    aliases: ['carioteca', 'cariomembrana', 'membrana nuclear'],
  },
  nucleolo: {
    name: 'Nucléolo',
    en: 'Nucleolus',
    category: 'Região do núcleo',
    parent: 'nucleo',
    description: 'Região densa do núcleo, sem membrana própria, onde se concentram os genes de RNA ribossômico.',
    function: 'Produzir RNA ribossômico (rRNA) e montar as subunidades dos ribossomos, que depois saem pelos poros nucleares para o citoplasma.',
    size: 'Cerca de 1 a 3 µm',
    related: ['ribossomos', 'nucleo'],
    topics: ['RNA ribossômico', 'Síntese de proteínas'],
    refs: ['eucariontes'],
  },
  cromatina: {
    name: 'Cromatina',
    en: 'Chromatin',
    category: 'Material genético',
    parent: 'nucleo',
    description:
      'Conjunto de filamentos de DNA enrolados em proteínas chamadas histonas. Na interfase fica descondensada, espalhada pelo núcleo; quando a célula vai se dividir, condensa-se e forma os cromossomos visíveis ao microscópio.',
    function: 'Guardar os genes de forma organizada, permitindo que trechos do DNA sejam lidos (transcritos) quando a célula precisa.',
    educational: 'Nas células humanas, a cromatina corresponde a 46 cromossomos (23 pares). Use o modelo de divisão celular para mostrar a condensação.',
    size: 'Fibra de cerca de 10 a 30 nm de espessura',
    related: ['cromossomo', 'nucleo'],
    topics: ['DNA e histonas', 'Cromossomos', 'Ciclo celular'],
    refs: ['eucariontes', 'livro'],
  },

  // ------------------------------------------------------------ endomembranas
  'reticulo-endoplasmatico-rugoso': {
    name: 'Retículo endoplasmático rugoso',
    en: 'Rough endoplasmic reticulum',
    category: 'Organela — sistema de endomembranas',
    description:
      'Rede de bolsas achatadas (cisternas) ligada ao envoltório nuclear, com ribossomos aderidos à face voltada para o citosol, o que lhe dá o aspecto "rugoso" (granuloso) ao microscópio eletrônico.',
    function:
      'Produzir proteínas que serão enviadas para fora da célula (secreção), para a membrana plasmática ou para os lisossomos. Dentro do retículo essas proteínas se dobram e começam a receber açúcares.',
    educational: 'É abundante em células que secretam muita proteína, como as do pâncreas (enzimas digestivas) e os plasmócitos (anticorpos).',
    related: ['ribossomos', 'complexo-golgiense', 'envoltorio-nuclear', 'reticulo-endoplasmatico-liso'],
    topics: ['Síntese de proteínas', 'Sistema de endomembranas', 'Secreção celular'],
    refs: ['endomembranas'],
    aliases: ['reticulo granuloso', 'rer', 'ergastoplasma'],
  },
  'reticulo-endoplasmatico-liso': {
    name: 'Retículo endoplasmático liso',
    en: 'Smooth endoplasmic reticulum',
    category: 'Organela — sistema de endomembranas',
    description: 'Rede de túbulos membranosos contínua com o retículo rugoso, mas sem ribossomos aderidos.',
    function:
      'Produzir lipídios (como fosfolipídios e hormônios esteroides), ajudar a desintoxicar substâncias (muito ativo nas células do fígado) e armazenar íons cálcio — nas células musculares, é o retículo sarcoplasmático.',
    related: ['reticulo-endoplasmatico-rugoso', 'complexo-golgiense'],
    topics: ['Síntese de lipídios', 'Desintoxicação', 'Sistema de endomembranas'],
    refs: ['endomembranas'],
    aliases: ['reticulo agranular', 'rel'],
  },
  'complexo-golgiense': {
    name: 'Complexo golgiense',
    en: 'Golgi apparatus',
    category: 'Organela — sistema de endomembranas',
    description:
      'Pilha de bolsas membranosas achatadas (cisternas). A face cis recebe vesículas vindas do retículo endoplasmático; a face trans, do lado oposto, libera novas vesículas.',
    function:
      'Modificar, separar e empacotar proteínas e lipídios, enviando-os ao destino certo: secreção (exocitose), membrana plasmática ou lisossomos. Nas plantas, também produz polissacarídeos da parede celular.',
    educational: 'Funciona como os "Correios" da célula. No espermatozoide, o complexo golgiense forma o acrossomo, que contém enzimas para atravessar o envoltório do óvulo.',
    size: 'Cisternas de cerca de 1 µm de diâmetro',
    related: ['reticulo-endoplasmatico-rugoso', 'vesiculas', 'lisossomos'],
    topics: ['Secreção celular', 'Sistema de endomembranas', 'Formação de lisossomos'],
    refs: ['endomembranas'],
    aliases: ['complexo de golgi', 'aparelho de golgi', 'golgi', 'dictiossomo'],
  },
  vesiculas: {
    name: 'Vesículas de transporte e de secreção',
    en: 'Transport vesicles',
    category: 'Sistema de endomembranas',
    description: 'Pequenas bolsas delimitadas por membrana que brotam de uma organela e se fundem a outra.',
    function:
      'Transportar substâncias entre o retículo endoplasmático, o complexo golgiense e a membrana plasmática. As vesículas de secreção liberam seu conteúdo fora da célula por exocitose.',
    size: 'Cerca de 50 a 100 nm (as de secreção podem ser maiores)',
    related: ['complexo-golgiense', 'membrana-plasmatica'],
    topics: ['Exocitose', 'Endocitose', 'Secreção celular'],
    refs: ['endomembranas'],
  },
  lisossomos: {
    name: 'Lisossomos',
    en: 'Lysosomes',
    category: 'Organela — sistema de endomembranas',
    description: 'Vesículas formadas no complexo golgiense, cheias de enzimas digestivas que funcionam em meio ácido (pH perto de 5).',
    function:
      'Digerir partículas e moléculas que entram na célula (digestão intracelular) e reciclar organelas velhas ou danificadas (autofagia). Nas células vegetais, essa função é feita principalmente pelo vacúolo.',
    educational: 'Os glóbulos brancos que fagocitam bactérias dependem dos lisossomos para destruí-las.',
    size: 'Cerca de 0,1 a 1 µm',
    related: ['complexo-golgiense', 'vacuolo', 'peroxissomos'],
    topics: ['Digestão intracelular', 'Autofagia', 'Fagocitose'],
    refs: ['endomembranas'],
  },
  peroxissomos: {
    name: 'Peroxissomos',
    en: 'Peroxisomes',
    category: 'Organela',
    description: 'Pequenas vesículas envoltas por uma membrana, contendo enzimas oxidativas, como a catalase.',
    function:
      'Quebrar ácidos graxos e neutralizar substâncias tóxicas, como o álcool. Nessas reações forma-se peróxido de hidrogênio (água oxigenada), que a catalase decompõe em água e gás oxigênio.',
    educational: 'Experimento clássico: água oxigenada borbulha sobre batata ou fígado cru por causa da catalase.',
    size: 'Cerca de 0,1 a 1 µm',
    related: ['lisossomos', 'mitocondria'],
    topics: ['Catalase', 'Desintoxicação', 'Metabolismo de lipídios'],
    refs: ['eucariontes'],
  },
  ribossomos: {
    name: 'Ribossomos',
    en: 'Ribosomes',
    category: 'Estrutura sem membrana',
    description:
      'Pequenos complexos de RNA ribossômico e proteínas, formados por duas subunidades e sem membrana. Ficam livres no citosol ou aderidos ao retículo endoplasmático rugoso e ao envoltório nuclear.',
    function: 'Fazer a tradução: ler o RNA mensageiro e unir aminoácidos na sequência certa para formar proteínas.',
    educational: 'Os ribossomos livres fazem proteínas que ficam no citosol; os aderidos ao retículo fazem proteínas de exportação e de membrana.',
    size: 'Cerca de 25 a 30 nm',
    related: ['reticulo-endoplasmatico-rugoso', 'nucleolo', 'ribossomos-70s'],
    topics: ['Tradução', 'Síntese de proteínas', 'Código genético'],
    refs: ['eucariontes', 'endomembranas'],
  },

  // ------------------------------------------------------------ energia
  mitocondria: {
    name: 'Mitocôndria',
    scientificName: 'Mitochondrion',
    en: 'Mitochondrion',
    category: 'Organela',
    description:
      'Organela com duas membranas: a externa é lisa e a interna forma dobras chamadas cristas. O interior (matriz) contém DNA próprio, circular, e ribossomos. Está presente em praticamente todas as células eucarióticas, inclusive nas vegetais.',
    function:
      'Realizar a respiração celular aeróbica: usando gás oxigênio, oxida moléculas derivadas da glicose e de outros nutrientes e produz a maior parte do ATP, a "moeda de energia" da célula. O ciclo de Krebs ocorre na matriz e a cadeia respiratória, nas cristas.',
    educational:
      'Pela teoria endossimbiótica, as mitocôndrias descendem de bactérias que passaram a viver dentro de outra célula. Células com alto gasto de energia, como as musculares, têm muitas mitocôndrias. Use "Abrir modelo detalhado" para ver cristas e matriz.',
    size: 'Cerca de 0,5 a 1 µm de largura e 1 a 10 µm de comprimento',
    related: ['membrana-mitocondrial-interna', 'cristas-mitocondriais', 'matriz-mitocondrial', 'cloroplastos'],
    topics: ['Respiração celular', 'ATP', 'Teoria endossimbiótica', 'Ciclo de Krebs'],
    refs: ['eucariontes', 'livro'],
    aliases: ['mitocondrias', 'condrioma'],
  },
  cloroplastos: {
    name: 'Cloroplasto',
    scientificName: 'Chloroplastus',
    en: 'Chloroplast',
    category: 'Organela (plastídio)',
    description:
      'Plastídio verde das plantas e algas, com duas membranas. Por dentro há um fluido (estroma) e sacos achatados chamados tilacoides, empilhados em grana. A clorofila fica nas membranas dos tilacoides. Tem DNA e ribossomos próprios.',
    function:
      'Realizar a fotossíntese: capturar a energia da luz e usá-la para produzir açúcares a partir de gás carbônico e água, liberando gás oxigênio.',
    educational:
      'Assim como as mitocôndrias, os cloroplastos provavelmente descendem de bactérias (cianobactérias) englobadas por outra célula. Atenção: células vegetais têm cloroplastos E mitocôndrias.',
    size: 'Cerca de 3 a 10 µm de comprimento',
    related: ['tilacoides', 'estroma', 'mitocondria', 'parede-celular'],
    topics: ['Fotossíntese', 'Clorofila', 'Teoria endossimbiótica'],
    refs: ['eucariontes', 'livro'],
    aliases: ['cloroplastos', 'plastideo', 'cloroplasto'],
  },
  vacuolo: {
    name: 'Vacúolo central',
    en: 'Central vacuole',
    category: 'Organela',
    description:
      'Grande bolsa delimitada por uma membrana chamada tonoplasto, cheia de suco vacuolar (água, íons, açúcares, pigmentos e resíduos). Na célula vegetal madura pode ocupar a maior parte do volume celular.',
    function:
      'Armazenar água e substâncias, manter a pressão de turgor que deixa a planta firme, e digerir moléculas (papel semelhante ao dos lisossomos). Pigmentos como as antocianinas, que colorem flores e frutos, ficam no vacúolo.',
    educational: 'Planta murcha = vacúolos com menos água. Use a animação de osmose para mostrar turgência e plasmólise.',
    size: 'Pode ocupar de 30 % a 80 % do volume da célula',
    related: ['parede-celular', 'lisossomos', 'membrana-plasmatica'],
    topics: ['Osmose', 'Turgor e plasmólise', 'Diferenças entre célula animal e vegetal'],
    refs: ['eucariontes'],
    aliases: ['tonoplasto', 'vacuolos'],
  },
  centriolos: {
    name: 'Centríolos',
    en: 'Centrioles',
    category: 'Estrutura sem membrana',
    description:
      'Par de pequenos cilindros dispostos em ângulo reto, cada um formado por nove trios de microtúbulos. Ficam no centrossomo, perto do núcleo.',
    function:
      'Organizar microtúbulos e originar os corpúsculos basais de cílios e flagelos. Na divisão das células animais, o centrossomo com os centríolos ajuda a organizar o fuso mitótico.',
    educational: 'A maioria das plantas (angiospermas) não tem centríolos e mesmo assim forma o fuso — bom ponto de comparação entre célula animal e vegetal.',
    size: 'Cerca de 0,2 µm de diâmetro e 0,5 µm de comprimento',
    related: ['centrossomo', 'fuso-mitotico'],
    topics: ['Citoesqueleto', 'Cílios e flagelos', 'Divisão celular'],
    refs: ['eucariontes'],
    aliases: ['centrossomo', 'centriolo'],
  },

  // ------------------------------------------------------------ procariontes
  'capsula-bacteriana': {
    name: 'Cápsula',
    en: 'Bacterial capsule',
    category: 'Envoltório externo',
    description: 'Camada externa, geralmente de polissacarídeos, presente em algumas espécies de bactérias.',
    function:
      'Ajudar a bactéria a aderir a superfícies, protegê-la contra a desidratação e dificultar que ela seja englobada pelas células de defesa (fagocitose) — por isso está ligada à capacidade de causar doenças.',
    related: ['parede-celular-bacteriana', 'fimbrias'],
    topics: ['Estrutura bacteriana', 'Fatores de virulência'],
    refs: ['procariontes'],
    aliases: ['glicocalice bacteriano'],
  },
  'parede-celular-bacteriana': {
    name: 'Parede celular bacteriana',
    en: 'Bacterial cell wall',
    category: 'Envoltório celular',
    description:
      'Envoltório rígido formado por peptidoglicano. Nas bactérias Gram-positivas é espesso; nas Gram-negativas é fino e coberto por uma membrana externa. O modelo mostra uma parede genérica, simplificada.',
    function: 'Manter a forma da bactéria e protegê-la de se romper por entrada de água (lise osmótica).',
    educational: 'Antibióticos como a penicilina impedem a formação do peptidoglicano. A coloração de Gram, usada em laboratório, diferencia os dois tipos de parede.',
    related: ['membrana-plasmatica', 'capsula-bacteriana', 'parede-celular'],
    topics: ['Peptidoglicano', 'Gram-positivas e Gram-negativas', 'Antibióticos'],
    refs: ['procariontes'],
    aliases: ['peptidoglicano', 'mureina'],
  },
  nucleoide: {
    name: 'Nucleoide',
    en: 'Nucleoid',
    category: 'Material genético',
    description: 'Região do citoplasma onde fica o cromossomo bacteriano — em geral uma única molécula de DNA circular, muito compactada —, sem envoltório nuclear.',
    function: 'Guardar os genes essenciais da bactéria e controlar suas atividades.',
    educational: 'Compare com o núcleo da célula animal: o DNA existe nos dois casos, mas só nos eucariontes ele está separado por uma membrana.',
    related: ['plasmideos', 'nucleo', 'ribossomos-70s'],
    topics: ['Procariontes', 'DNA circular', 'Eucariontes e procariontes'],
    refs: ['procariontes'],
    aliases: ['cromossomo bacteriano', 'dna bacteriano'],
  },
  plasmideos: {
    name: 'Plasmídeos',
    en: 'Plasmids',
    category: 'Material genético',
    description: 'Pequenas moléculas de DNA circular separadas do cromossomo bacteriano, que se duplicam de forma independente.',
    function:
      'Carregar genes extras, como os de resistência a antibióticos, que podem ser passados a outras bactérias (por exemplo, na conjugação).',
    educational: 'Na biotecnologia, plasmídeos são usados como "vetores" para inserir genes em bactérias — é assim que se produz insulina humana em laboratório.',
    size: 'De cerca de mil a centenas de milhares de pares de bases',
    related: ['nucleoide', 'fimbrias'],
    topics: ['Resistência a antibióticos', 'DNA recombinante', 'Biotecnologia'],
    refs: ['procariontes'],
  },
  'ribossomos-70s': {
    name: 'Ribossomos (70S)',
    en: 'Prokaryotic ribosomes (70S)',
    category: 'Estrutura sem membrana',
    description: 'Ribossomos das bactérias, um pouco menores e diferentes dos ribossomos 80S do citoplasma eucariótico.',
    function: 'Produzir as proteínas da bactéria a partir do RNA mensageiro (tradução).',
    educational: 'Essa diferença permite que alguns antibióticos (como tetraciclinas) bloqueiem os ribossomos bacterianos sem afetar os nossos.',
    size: 'Cerca de 20 nm',
    related: ['ribossomos', 'nucleoide'],
    topics: ['Tradução', 'Antibióticos', 'Procariontes'],
    refs: ['procariontes'],
  },
  'flagelo-bacteriano': {
    name: 'Flagelo bacteriano',
    en: 'Bacterial flagellum',
    category: 'Estrutura de locomoção',
    description: 'Filamento longo e helicoidal de proteína (flagelina), preso a um "motor" giratório na membrana plasmática e na parede.',
    function: 'Locomoção: o flagelo gira como uma hélice, empurrando a bactéria no meio líquido. O motor é movido pelo fluxo de íons (geralmente H⁺) através da membrana.',
    educational: 'O flagelo bacteriano gira; o flagelo de eucariontes (como o do espermatozoide) se dobra e é feito de microtúbulos. São estruturas diferentes com o mesmo nome.',
    size: 'Cerca de 20 nm de espessura e vários micrômetros de comprimento',
    related: ['fimbrias', 'membrana-plasmatica'],
    topics: ['Locomoção bacteriana', 'Procariontes'],
    refs: ['procariontes'],
    aliases: ['flagelo'],
  },
  fimbrias: {
    name: 'Fímbrias e pili',
    en: 'Fimbriae and pili',
    category: 'Apêndices de superfície',
    description: 'Filamentos de proteína curtos e finos que cobrem a superfície de muitas bactérias.',
    function: 'Fixar a bactéria a superfícies e a células do hospedeiro. Um tipo especial, o pilus sexual, conecta duas bactérias na conjugação, quando há troca de plasmídeos.',
    related: ['capsula-bacteriana', 'plasmideos', 'flagelo-bacteriano'],
    topics: ['Adesão', 'Conjugação bacteriana'],
    refs: ['procariontes'],
    aliases: ['pili', 'pilus'],
  },

  // ------------------------------------------------------------ mitocôndria em detalhe
  'membrana-mitocondrial-externa': {
    name: 'Membrana mitocondrial externa',
    en: 'Outer mitochondrial membrane',
    category: 'Membrana da mitocôndria',
    parent: 'mitocondria',
    description: 'Membrana lisa que envolve toda a mitocôndria. Possui proteínas formadoras de canais (porinas).',
    function: 'Delimitar a organela e permitir a passagem de pequenas moléculas, como o piruvato vindo do citoplasma.',
    related: ['membrana-mitocondrial-interna', 'espaco-intermembranas'],
    topics: ['Respiração celular', 'Membranas'],
    refs: ['eucariontes'],
  },
  'membrana-mitocondrial-interna': {
    name: 'Membrana mitocondrial interna',
    en: 'Inner mitochondrial membrane',
    category: 'Membrana da mitocôndria',
    parent: 'mitocondria',
    description: 'Membrana muito seletiva que forma dobras (as cristas). Nela ficam a cadeia transportadora de elétrons e a ATP sintase.',
    function: 'Realizar a cadeia respiratória: os elétrons passam por proteínas da membrana até o oxigênio, formando água, e a energia liberada bombeia H⁺ para o espaço intermembranas.',
    related: ['cristas-mitocondriais', 'atp-sintase', 'espaco-intermembranas'],
    topics: ['Cadeia respiratória', 'Fosforilação oxidativa'],
    refs: ['livro'],
  },
  'cristas-mitocondriais': {
    name: 'Cristas mitocondriais',
    en: 'Mitochondrial cristae',
    category: 'Membrana da mitocôndria',
    parent: 'mitocondria',
    description: 'Dobras da membrana mitocondrial interna voltadas para a matriz.',
    function: 'Aumentar muito a superfície da membrana interna, permitindo mais cadeias respiratórias e mais ATP sintases — e, portanto, mais produção de ATP.',
    educational: 'Paralelo útil: assim como as vilosidades do intestino, as dobras aumentam a área sem aumentar muito o volume.',
    related: ['membrana-mitocondrial-interna', 'atp-sintase', 'matriz-mitocondrial'],
    topics: ['Respiração celular', 'Superfície e função'],
    refs: ['eucariontes'],
  },
  'matriz-mitocondrial': {
    name: 'Matriz mitocondrial',
    en: 'Mitochondrial matrix',
    category: 'Compartimento da mitocôndria',
    parent: 'mitocondria',
    description: 'Espaço interno delimitado pela membrana interna, com um fluido rico em enzimas, DNA mitocondrial e ribossomos.',
    function: 'Abrigar o ciclo de Krebs (ciclo do ácido cítrico), em que os derivados da glicose são oxidados, liberando gás carbônico e transferindo elétrons para a cadeia respiratória.',
    related: ['dna-mitocondrial', 'cristas-mitocondriais'],
    topics: ['Ciclo de Krebs', 'Respiração celular'],
    refs: ['livro'],
  },
  'espaco-intermembranas': {
    name: 'Espaço intermembranas',
    en: 'Intermembrane space',
    category: 'Compartimento da mitocôndria',
    parent: 'mitocondria',
    description: 'Estreito espaço entre as membranas externa e interna.',
    function: 'Acumular os íons H⁺ bombeados pela cadeia respiratória. Quando esses íons voltam para a matriz pela ATP sintase, a energia é usada para formar ATP (quimiosmose).',
    related: ['membrana-mitocondrial-externa', 'membrana-mitocondrial-interna', 'atp-sintase'],
    topics: ['Quimiosmose', 'Fosforilação oxidativa'],
    refs: ['livro'],
  },
  'dna-mitocondrial': {
    name: 'DNA mitocondrial',
    en: 'Mitochondrial DNA',
    category: 'Material genético',
    parent: 'mitocondria',
    description: 'Pequenas moléculas de DNA circular na matriz. Nos seres humanos, tem cerca de 16,5 mil pares de bases e 37 genes.',
    function: 'Codificar alguns componentes da cadeia respiratória e RNAs usados pela própria mitocôndria.',
    educational: 'Em geral, herdamos as mitocôndrias apenas da mãe, o que torna o DNA mitocondrial útil em estudos de ancestralidade.',
    related: ['matriz-mitocondrial', 'nucleoide'],
    topics: ['Herança materna', 'Teoria endossimbiótica'],
    refs: ['eucariontes'],
  },
  'atp-sintase': {
    name: 'ATP sintase',
    en: 'ATP synthase',
    category: 'Complexo de proteínas',
    parent: 'mitocondria',
    description: 'Complexo de proteínas da membrana interna, em forma de "pirulito" voltado para a matriz. No modelo aparece como pequenos botões nas cristas, muito ampliados.',
    function: 'Produzir ATP a partir de ADP e fosfato, usando a energia do fluxo de H⁺ que retorna do espaço intermembranas para a matriz.',
    size: 'Cerca de 10 nm',
    related: ['cristas-mitocondriais', 'espaco-intermembranas'],
    topics: ['Fosforilação oxidativa', 'ATP'],
    refs: ['livro'],
  },

  // ------------------------------------------------------------ cloroplasto em detalhe
  'envoltorio-cloroplasto': {
    name: 'Envoltório do cloroplasto',
    en: 'Chloroplast envelope',
    category: 'Membranas do cloroplasto',
    parent: 'cloroplastos',
    description: 'Dupla membrana (externa e interna) que delimita o cloroplasto.',
    function: 'Separar o cloroplasto do citoplasma e controlar a passagem de substâncias, como açúcares produzidos e íons.',
    related: ['estroma', 'tilacoides'],
    topics: ['Fotossíntese', 'Membranas'],
    refs: ['eucariontes'],
  },
  estroma: {
    name: 'Estroma',
    en: 'Stroma',
    category: 'Compartimento do cloroplasto',
    parent: 'cloroplastos',
    description: 'Fluido interno do cloroplasto, ao redor dos tilacoides, com enzimas, DNA, ribossomos e grãos de amido.',
    function: 'Abrigar o ciclo de Calvin (fase química, ou "escura"): o CO₂ é fixado pela enzima rubisco e transformado em açúcar usando o ATP e o NADPH produzidos nos tilacoides.',
    related: ['tilacoides', 'graos-de-amido', 'dna-cloroplasto'],
    topics: ['Ciclo de Calvin', 'Fixação de carbono', 'Fotossíntese'],
    refs: ['livro'],
  },
  tilacoides: {
    name: 'Tilacoides e grana',
    en: 'Thylakoids and grana',
    category: 'Membranas do cloroplasto',
    parent: 'cloroplastos',
    description: 'Sacos membranosos achatados, empilhados como moedas; cada pilha é um granum (plural: grana). Suas membranas contêm clorofila e outros pigmentos.',
    function:
      'Realizar a fase clara (fotoquímica): a luz é absorvida pela clorofila, a água é quebrada (fotólise), liberando gás oxigênio, e formam-se ATP e NADPH.',
    educational: 'O oxigênio que respiramos vem da quebra da água nos tilacoides, e não do CO₂ — uma confusão comum entre os alunos.',
    related: ['estroma', 'lamelas-estromais'],
    topics: ['Fase clara', 'Fotólise da água', 'Clorofila'],
    refs: ['livro'],
    aliases: ['granum', 'grana', 'tilacoide'],
  },
  'lamelas-estromais': {
    name: 'Lamelas do estroma',
    en: 'Stroma lamellae',
    category: 'Membranas do cloroplasto',
    parent: 'cloroplastos',
    description: 'Tilacoides não empilhados que ligam um granum a outro através do estroma.',
    function: 'Conectar os grana em uma rede contínua de membranas onde também ocorrem etapas da fase clara.',
    related: ['tilacoides', 'estroma'],
    topics: ['Fotossíntese'],
    refs: ['livro'],
  },
  'dna-cloroplasto': {
    name: 'DNA do cloroplasto',
    en: 'Chloroplast DNA',
    category: 'Material genético',
    parent: 'cloroplastos',
    description: 'Moléculas de DNA circular no estroma, semelhantes ao DNA das bactérias.',
    function: 'Codificar parte das proteínas e RNAs do próprio cloroplasto.',
    related: ['estroma', 'dna-mitocondrial'],
    topics: ['Teoria endossimbiótica'],
    refs: ['eucariontes'],
  },
  'graos-de-amido': {
    name: 'Grãos de amido',
    en: 'Starch grains',
    category: 'Inclusão',
    parent: 'cloroplastos',
    description: 'Depósitos de amido no estroma.',
    function: 'Armazenar temporariamente parte do açúcar produzido na fotossíntese.',
    educational: 'O teste do iodo (lugol) em folhas mostra onde houve fotossíntese e acúmulo de amido.',
    related: ['estroma'],
    topics: ['Fotossíntese', 'Reserva de energia'],
    refs: ['livro'],
  },

  // ------------------------------------------------------------ divisão celular
  cromossomo: {
    name: 'Cromossomo duplicado',
    en: 'Duplicated chromosome',
    category: 'Material genético',
    description: 'Cromatina muito condensada. Após a duplicação do DNA na interfase, cada cromossomo é formado por duas cromátides-irmãs idênticas, unidas pelo centrômero.',
    function: 'Permitir que o DNA seja dividido de forma organizada e igual entre as duas células-filhas.',
    educational: 'O modelo mostra apenas 4 cromossomos (2n = 4) para facilitar a visualização; as células humanas têm 46.',
    related: ['cromatide-irma', 'centromero', 'fuso-mitotico', 'cromatina'],
    topics: ['Mitose', 'Ciclo celular', 'Cariótipo'],
    refs: ['livro'],
  },
  'cromatide-irma': {
    name: 'Cromátide-irmã',
    en: 'Sister chromatid',
    category: 'Material genético',
    parent: 'cromossomo',
    description: 'Cada uma das duas cópias idênticas de DNA que formam um cromossomo duplicado.',
    function: 'Na anáfase, as cromátides-irmãs se separam e cada uma vai para um polo da célula, tornando-se um cromossomo da célula-filha.',
    related: ['centromero', 'fuso-mitotico'],
    topics: ['Mitose', 'Anáfase'],
    refs: ['livro'],
  },
  centromero: {
    name: 'Centrômero',
    en: 'Centromere',
    category: 'Região do cromossomo',
    parent: 'cromossomo',
    description: 'Região estreitada onde as duas cromátides-irmãs ficam unidas. Ali se forma o cinetócoro, onde se prendem as fibras do fuso.',
    function: 'Manter as cromátides unidas até a anáfase e servir de ponto de ancoragem para os microtúbulos do fuso.',
    related: ['cromatide-irma', 'fuso-mitotico'],
    topics: ['Mitose', 'Cinetócoro'],
    refs: ['livro'],
  },
  'fuso-mitotico': {
    name: 'Fuso mitótico',
    en: 'Mitotic spindle',
    category: 'Citoesqueleto',
    description: 'Conjunto de microtúbulos que se forma entre os dois polos da célula durante a divisão.',
    function: 'Prender-se aos cromossomos, alinhá-los no plano equatorial (metáfase) e puxar as cromátides-irmãs para os polos opostos (anáfase).',
    related: ['centrossomo', 'centromero', 'centriolos'],
    topics: ['Mitose', 'Citoesqueleto', 'Microtúbulos'],
    refs: ['livro'],
    aliases: ['fuso acromatico', 'fibras do fuso'],
  },
  centrossomo: {
    name: 'Centrossomo',
    en: 'Centrosome',
    category: 'Centro organizador de microtúbulos',
    description: 'Região perto do núcleo que organiza os microtúbulos. Nas células animais contém um par de centríolos. É duplicado antes da divisão.',
    function: 'Na mitose, os dois centrossomos migram para polos opostos e organizam o fuso mitótico.',
    related: ['centriolos', 'fuso-mitotico'],
    topics: ['Mitose', 'Citoesqueleto'],
    refs: ['livro'],
  },
};
