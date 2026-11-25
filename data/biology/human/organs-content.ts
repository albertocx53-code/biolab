import type { HumanContent } from './content';

/**
 * Texts (pt-BR) for the organs that BioLab 3D models itself: kidneys, brain
 * and the female reproductive system. Original wording, checked against
 * OpenStax Anatomy and Physiology 2e and Biology 2e.
 */
export const ORGAN_CONTENT: Record<string, HumanContent> = {
  // ------------------------------------------------------------ Rins
  rins: {
    category: 'Par de órgãos',
    description:
      'Dois órgãos em forma de feijão, de cerca de 11 cm, situados na parede posterior do abdome, um de cada lado da coluna, atrás do peritônio (retroperitoneais). O rim direito fica um pouco mais baixo que o esquerdo por causa do fígado. Sobre cada rim fica uma glândula suprarrenal.',
    function:
      'Filtrar o sangue e formar a urina: eliminam ureia e outros resíduos, regulam a quantidade de água e de sais (sódio, potássio), o pH e a pressão arterial, e produzem hormônios como a eritropoetina, que estimula a produção de hemácias.',
    educational:
      'Os rins recebem cerca de 20 a 25% do sangue bombeado pelo coração e filtram em torno de 180 litros de plasma por dia, mas quase tudo é reabsorvido: sobra 1 a 2 litros de urina. Use o botão "Corte do rim" para ver o córtex, as pirâmides da medula e a pelve renal.',
    related: ['rim-esq', 'rim-dir', 'ureter', 'urinary-bladder', 'suprarenal-gland', 'abdominal-aorta'],
    topics: ['Sistema urinário', 'Excreção', 'Homeostase', 'Néfron'],
    refs: ['apOrgans', 'bio2e'],
  },
  rim: {
    category: 'Órgão',
    description:
      'Órgão em forma de feijão com uma borda lateral convexa e uma borda medial côncava, o hilo renal, por onde entram a artéria renal e saem a veia renal e o ureter. Por dentro tem três regiões: o córtex (externo), a medula, organizada em pirâmides, e a pelve renal, que coleta a urina.',
    function: 'Formar a urina a partir do sangue, ajustando a eliminação de água, sais e resíduos às necessidades do corpo.',
    educational:
      'A unidade funcional do rim é o néfron (cerca de 1 milhão por rim), microscópico demais para aparecer no modelo: o glomérulo e a cápsula renal ficam no córtex, e as alças de Henle e os ductos coletores descem pelas pirâmides da medula.',
    related: ['cortex-renal-esq', 'medula-renal-esq', 'pelve-renal-esq', 'ureter', 'suprarenal-gland'],
    topics: ['Sistema urinário', 'Excreção', 'Néfron'],
    refs: ['apOrgans'],
  },
  'cortex-renal': {
    category: 'Região do rim',
    description:
      'Camada externa do rim, de cor castanho-avermelhada, logo abaixo da cápsula renal. Avança entre as pirâmides formando as colunas renais.',
    function:
      'Abriga os glomérulos e as cápsulas renais (de Bowman), onde o sangue é filtrado, e os túbulos contorcidos, onde grande parte da água, da glicose e dos sais filtrados é reabsorvida.',
    educational:
      'Filtração, reabsorção e secreção são as três etapas da formação da urina. A glicose que aparece na urina de uma pessoa com diabetes não controlado indica que a reabsorção nos túbulos foi ultrapassada.',
    related: ['medula-renal-esq', 'pelve-renal-esq', 'rim-esq'],
    topics: ['Sistema urinário', 'Néfron', 'Filtração glomerular'],
    refs: ['apOrgans'],
  },
  'medula-renal': {
    category: 'Região do rim',
    description:
      'Parte interna do rim, formada por 8 a 18 pirâmides renais em forma de cone. A base de cada pirâmide fica voltada para o córtex e o ápice, a papila renal, aponta para o seio renal.',
    function:
      'Contém as alças de Henle e os ductos coletores, que concentram a urina retirando água dela. A urina sai pelas papilas e cai nos cálices menores.',
    educational: 'O aspecto estriado das pirâmides vem dos túbulos e ductos paralelos. O hormônio antidiurético (ADH) age nos ductos coletores e aumenta a reabsorção de água.',
    related: ['cortex-renal-esq', 'pelve-renal-esq', 'rim-esq'],
    topics: ['Sistema urinário', 'Néfron', 'Concentração da urina'],
    refs: ['apOrgans'],
  },
  'pelve-renal': {
    category: 'Via urinária',
    description:
      'Cavidade em forma de funil no seio renal. Recebe os cálices maiores, que por sua vez reúnem os cálices menores encaixados nas papilas, e se continua com o ureter na saída do hilo.',
    function: 'Coletar a urina que sai das pirâmides e conduzi-la ao ureter, que a leva à bexiga por movimentos peristálticos.',
    related: ['medula-renal-esq', 'ureter', 'urinary-bladder'],
    topics: ['Sistema urinário', 'Vias urinárias'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Encéfalo
  encefalo: {
    category: 'Órgão do sistema nervoso central',
    description:
      'Parte do sistema nervoso central contida no crânio. Divide-se em cérebro (dois hemisférios), diencéfalo (tálamo e hipotálamo), cerebelo e tronco encefálico (mesencéfalo, ponte e bulbo), que se continua com a medula espinal. Pesa cerca de 1,4 kg.',
    function:
      'Receber e interpretar as informações dos sentidos, controlar os movimentos voluntários e o equilíbrio, regular funções vitais como respiração e batimentos cardíacos, e sediar a memória, a linguagem, as emoções e o raciocínio.',
    educational:
      'O encéfalo é protegido pelo crânio, pelas meninges e pelo líquido cefalorraquidiano (líquor), produzido nos ventrículos. Tem cerca de 86 bilhões de neurônios e consome aproximadamente 20% do oxigênio do corpo. Use "Corte do encéfalo" para ver as estruturas internas.',
    related: ['cerebro', 'cerebelo', 'tronco-encefalico', 'diencefalo', 'cranio', 'adenohypophysis'],
    topics: ['Sistema nervoso central', 'Neurônios', 'Encéfalo'],
    refs: ['apOrgans', 'bio2e'],
  },
  cerebro: {
    category: 'Parte do encéfalo',
    description:
      'A maior parte do encéfalo (telencéfalo), formada por dois hemisférios separados pela fissura longitudinal e unidos pelo corpo caloso. A superfície, o córtex cerebral (substância cinzenta), é dobrada em giros e sulcos; por baixo dele fica a substância branca.',
    function: 'Processar as informações sensoriais, planejar e comandar os movimentos voluntários, e realizar as funções mais complexas: linguagem, memória, aprendizagem, raciocínio e consciência.',
    educational:
      'Os giros e sulcos triplicam a área do córtex sem aumentar o volume da cabeça. Cada hemisfério controla principalmente o lado oposto do corpo: um AVC no hemisfério esquerdo pode paralisar o lado direito.',
    related: ['hemisferio-cerebral-esq', 'hemisferio-cerebral-dir', 'corpo-caloso', 'encefalo'],
    topics: ['Sistema nervoso central', 'Córtex cerebral'],
    refs: ['apOrgans', 'bio2e'],
  },
  'hemisferio-cerebral': {
    category: 'Parte do cérebro',
    description:
      'Metade do cérebro, dividida em lobos pelos sulcos principais: o sulco central separa o lobo frontal do parietal e o sulco lateral separa o lobo temporal dos lobos frontal e parietal. O lobo occipital fica atrás.',
    function: 'Cada hemisfério recebe as sensações e controla os movimentos principalmente do lado oposto do corpo; algumas funções predominam em um lado, como a linguagem, em geral no hemisfério esquerdo.',
    related: ['lobo-frontal', 'lobo-parietal', 'lobo-temporal', 'lobo-occipital', 'corpo-caloso'],
    topics: ['Sistema nervoso central', 'Córtex cerebral', 'Lobos cerebrais'],
    refs: ['apOrgans'],
  },
  'lobo-frontal': {
    category: 'Lobo cerebral',
    description: 'Lobo anterior de cada hemisfério, à frente do sulco central e acima do sulco lateral. É o maior lobo do cérebro.',
    function:
      'Planejamento, tomada de decisão, controle do comportamento e da atenção (córtex pré-frontal); comando dos movimentos voluntários (córtex motor primário, no giro pré-central) e produção da fala (área de Broca, em geral no lado esquerdo).',
    educational: 'O córtex pré-frontal é uma das últimas regiões a amadurecer, o que ajuda a explicar mudanças de comportamento na adolescência.',
    related: ['lobo-parietal', 'lobo-temporal', 'corpo-caloso'],
    topics: ['Sistema nervoso central', 'Lobos cerebrais', 'Movimento voluntário'],
    refs: ['apOrgans'],
  },
  'lobo-parietal': {
    category: 'Lobo cerebral',
    description: 'Lobo situado atrás do sulco central e acima do sulco lateral, entre os lobos frontal e occipital.',
    function:
      'Receber e interpretar as sensações do corpo (tato, temperatura, dor, posição), no córtex somatossensorial do giro pós-central, e integrar essas informações com a visão para orientar o corpo no espaço.',
    related: ['lobo-frontal', 'lobo-occipital', 'lobo-temporal'],
    topics: ['Sistema nervoso central', 'Lobos cerebrais', 'Sentidos'],
    refs: ['apOrgans'],
  },
  'lobo-temporal': {
    category: 'Lobo cerebral',
    description: 'Lobo lateral e inferior de cada hemisfério, abaixo do sulco lateral, na altura das orelhas.',
    function:
      'Audição (córtex auditivo), compreensão da linguagem (área de Wernicke, em geral no lado esquerdo) e memória: na sua face interna ficam o hipocampo e a amígdala, ligados à formação de memórias e às emoções.',
    related: ['lobo-frontal', 'lobo-parietal', 'lobo-occipital'],
    topics: ['Sistema nervoso central', 'Lobos cerebrais', 'Audição', 'Memória'],
    refs: ['apOrgans'],
  },
  'lobo-occipital': {
    category: 'Lobo cerebral',
    description: 'Lobo posterior de cada hemisfério, na nuca, sobre o cerebelo.',
    function: 'Visão: o córtex visual primário recebe os sinais dos olhos (via nervo óptico e tálamo) e as áreas vizinhas reconhecem formas, cores e movimentos.',
    educational: 'Por isso uma pancada forte na nuca pode fazer a pessoa "ver estrelas" ou perder parte da visão, mesmo com os olhos intactos.',
    related: ['lobo-parietal', 'lobo-temporal', 'cerebelo'],
    topics: ['Sistema nervoso central', 'Lobos cerebrais', 'Visão'],
    refs: ['apOrgans'],
  },
  'corpo-caloso': {
    category: 'Substância branca',
    description: 'Grande faixa curva de fibras nervosas (substância branca) no fundo da fissura longitudinal, ligando os dois hemisférios. Aparece em forma de "C" deitado no corte sagital.',
    function: 'Permitir a troca de informações entre os hemisférios direito e esquerdo, para que o cérebro funcione de forma integrada.',
    related: ['hemisferio-cerebral-esq', 'ventriculo-lateral', 'talamo'],
    topics: ['Sistema nervoso central', 'Substância branca'],
    refs: ['apOrgans'],
  },
  'ventriculo-lateral': {
    category: 'Cavidade do encéfalo',
    description: 'Cavidade em forma de "C" dentro de cada hemisfério cerebral, cheia de líquido cefalorraquidiano. Comunica-se com o terceiro ventrículo, entre os tálamos, e daí com o quarto ventrículo, entre o tronco encefálico e o cerebelo.',
    function: 'Nos ventrículos, os plexos corioides produzem o líquido cefalorraquidiano (líquor), que circula ao redor do encéfalo e da medula, amortecendo impactos e levando nutrientes.',
    educational: 'O líquor é colhido por punção lombar para diagnosticar meningite. O acúmulo de líquor nos ventrículos causa a hidrocefalia.',
    related: ['corpo-caloso', 'talamo', 'encefalo'],
    topics: ['Sistema nervoso central', 'Líquido cefalorraquidiano'],
    refs: ['apOrgans'],
  },
  diencefalo: {
    category: 'Parte do encéfalo',
    description: 'Região central do encéfalo, entre os hemisférios cerebrais e o tronco encefálico, formada principalmente pelo tálamo e pelo hipotálamo (e pela epífise).',
    function: 'Retransmitir as informações sensoriais ao córtex (tálamo) e controlar a homeostase e o sistema endócrino (hipotálamo).',
    related: ['talamo', 'hipotalamo', 'pineal-gland', 'adenohypophysis'],
    topics: ['Sistema nervoso central', 'Homeostase'],
    refs: ['apOrgans'],
  },
  talamo: {
    category: 'Parte do diencéfalo',
    description: 'Par de massas ovais de substância cinzenta no centro do encéfalo, um de cada lado do terceiro ventrículo.',
    function: 'Estação de retransmissão: quase todas as informações sensoriais (exceto o olfato) passam pelo tálamo antes de chegar ao córtex cerebral. Também participa do controle do sono, da vigília e da atenção.',
    related: ['hipotalamo', 'corpo-caloso', 'ventriculo-lateral'],
    topics: ['Sistema nervoso central', 'Sentidos'],
    refs: ['apOrgans'],
  },
  hipotalamo: {
    category: 'Parte do diencéfalo',
    description: 'Pequena região abaixo do tálamo, no assoalho do terceiro ventrículo, ligada à hipófise por uma haste (infundíbulo).',
    function:
      'Centro da homeostase: controla a temperatura do corpo, a fome, a sede, o sono e as emoções, comanda o sistema nervoso autônomo e regula a hipófise, ligando o sistema nervoso ao endócrino. Produz o ADH e a ocitocina.',
    educational: 'Apesar de ter o tamanho de uma amêndoa, o hipotálamo controla a "glândula mestra" (hipófise) por meio de hormônios liberadores e inibidores.',
    related: ['adenohypophysis', 'neurohypophysis', 'talamo'],
    topics: ['Sistema nervoso central', 'Sistema endócrino', 'Homeostase'],
    refs: ['apOrgans', 'bio2e'],
  },
  cerebelo: {
    category: 'Parte do encéfalo',
    description: 'Órgão situado atrás do tronco encefálico e abaixo dos lobos occipitais, com dois hemisférios unidos pelo verme. Sua superfície tem dobras finas e paralelas, as folhas do cerebelo.',
    function: 'Coordenar os movimentos, manter o equilíbrio e a postura e participar do aprendizado motor (andar de bicicleta, escrever, tocar um instrumento).',
    educational: 'O álcool afeta o cerebelo; por isso a pessoa embriagada perde o equilíbrio e a coordenação. No corte, a substância branca do cerebelo forma um desenho ramificado chamado árvore da vida.',
    related: ['tronco-encefalico', 'ponte', 'lobo-occipital'],
    topics: ['Sistema nervoso central', 'Equilíbrio', 'Coordenação motora'],
    refs: ['apOrgans'],
  },
  'tronco-encefalico': {
    category: 'Parte do encéfalo',
    description: 'Parte do encéfalo que liga o cérebro à medula espinal, formada (de cima para baixo) pelo mesencéfalo, pela ponte e pelo bulbo. Dele saem 10 dos 12 pares de nervos cranianos.',
    function: 'Conduzir as informações entre o encéfalo e a medula e controlar funções vitais automáticas: respiração, frequência cardíaca, pressão arterial, deglutição, tosse e vômito.',
    educational: 'Lesões no tronco encefálico são muito graves porque atingem centros vitais. A morte encefálica é diagnosticada pela ausência das funções do tronco encefálico.',
    related: ['mesencefalo', 'ponte', 'bulbo', 'cerebelo'],
    topics: ['Sistema nervoso central', 'Funções vitais', 'Nervos cranianos'],
    refs: ['apOrgans'],
  },
  mesencefalo: {
    category: 'Parte do tronco encefálico',
    description: 'Porção superior do tronco encefálico, logo abaixo do diencéfalo.',
    function: 'Participa dos reflexos visuais e auditivos (por exemplo, virar a cabeça na direção de um som) e do controle dos movimentos; contém a substância negra, que produz dopamina.',
    educational: 'A perda dos neurônios da substância negra causa a doença de Parkinson.',
    related: ['ponte', 'bulbo', 'talamo'],
    topics: ['Sistema nervoso central', 'Reflexos'],
    refs: ['apOrgans'],
  },
  ponte: {
    category: 'Parte do tronco encefálico',
    description: 'Porção média do tronco encefálico, que forma uma saliência arredondada na frente, entre o mesencéfalo e o bulbo.',
    function: 'Ligar o cérebro ao cerebelo (feixes de fibras) e participar, com o bulbo, do controle do ritmo respiratório.',
    related: ['mesencefalo', 'bulbo', 'cerebelo'],
    topics: ['Sistema nervoso central', 'Respiração'],
    refs: ['apOrgans'],
  },
  bulbo: {
    category: 'Parte do tronco encefálico',
    description: 'Porção inferior do tronco encefálico (medula oblonga), que se continua com a medula espinal na altura do forame magno do crânio.',
    function: 'Abriga os centros que controlam a respiração, os batimentos cardíacos e a pressão arterial, além de reflexos como tosse, espirro, deglutição e vômito. Nele as fibras motoras se cruzam (decussação das pirâmides).',
    educational: 'O cruzamento das fibras no bulbo explica por que cada hemisfério cerebral controla o lado oposto do corpo.',
    related: ['ponte', 'mesencefalo'],
    topics: ['Sistema nervoso central', 'Funções vitais'],
    refs: ['apOrgans'],
  },

  // ------------------------------------------------------------ Sistema reprodutor feminino
  'sistema-reprodutor-feminino': {
    category: 'Sistema de órgãos',
    description:
      'Formado pelos ovários (gônadas), pelas tubas uterinas, pelo útero e pela vagina, na pelve, além da vulva (órgãos externos). O útero fica entre a bexiga, à frente, e o reto, atrás.',
    function: 'Produzir os ovócitos e os hormônios sexuais femininos, receber os espermatozoides, abrigar a fecundação e o desenvolvimento do embrião e do feto, e permitir o parto.',
    educational:
      'Neste laboratório você pode alternar entre o sistema reprodutor masculino e o feminino (botão "Ver sistema feminino"), já que o modelo do corpo é um só. Os ovários e o útero mudam ao longo do ciclo menstrual, de cerca de 28 dias, controlado pelos hormônios FSH e LH da hipófise.',
    related: ['utero', 'ovario', 'tuba-uterina', 'vagina', 'urinary-bladder'],
    topics: ['Sistema reprodutor feminino', 'Ciclo menstrual', 'Reprodução humana'],
    refs: ['apOrgans', 'bio2e'],
  },
  ovario: {
    category: 'Órgão (gônada feminina)',
    description: 'Par de órgãos ovais, do tamanho de uma amêndoa, situados de cada lado do útero, junto às paredes da pelve, presos por ligamentos. No interior ficam os folículos ovarianos, cada um com um ovócito.',
    function:
      'Produzir os gametas femininos (ovogênese) e os hormônios estrogênio e progesterona. A cada ciclo, em geral um folículo amadurece e libera o ovócito secundário (ovulação), por volta do 14º dia.',
    educational:
      'Diferente da espermatogênese, a ovogênese começa antes do nascimento e fica parada na prófase I da meiose até a puberdade. Após a ovulação, o folículo vira o corpo-lúteo, que produz progesterona.',
    related: ['tuba-uterina', 'utero', 'adenohypophysis'],
    topics: ['Sistema reprodutor feminino', 'Ovogênese', 'Hormônios sexuais', 'Ciclo menstrual'],
    refs: ['apOrgans', 'bio2e'],
  },
  'tuba-uterina': {
    category: 'Órgão (ducto)',
    description: 'Tubo de cerca de 10 cm que sai de cada lado do fundo do útero em direção ao ovário. A extremidade livre se abre em forma de funil (infundíbulo), com prolongamentos em franja, as fímbrias, que envolvem o ovário.',
    function: 'Captar o ovócito liberado na ovulação e conduzi-lo ao útero, por cílios e contrações da parede. É na tuba (na ampola) que normalmente ocorre a fecundação.',
    educational: 'Quando o embrião se implanta na tuba em vez do útero ocorre a gravidez ectópica, uma emergência médica. A laqueadura, método contraceptivo definitivo, interrompe as tubas.',
    related: ['ovario', 'utero'],
    topics: ['Sistema reprodutor feminino', 'Fecundação'],
    refs: ['apOrgans'],
  },
  utero: {
    category: 'Órgão',
    description:
      'Órgão muscular oco em forma de pera invertida, com cerca de 7 cm, situado entre a bexiga e o reto e normalmente inclinado para a frente, sobre a bexiga. Tem fundo, corpo e colo. A parede tem três camadas: perimétrio, miométrio (músculo liso) e endométrio (mucosa interna).',
    function:
      'Receber e nutrir o embrião, que se implanta no endométrio, e abrigar o feto durante a gestação; no parto, o miométrio se contrai para expulsá-lo. Se não há gravidez, a camada funcional do endométrio descama na menstruação.',
    educational: 'Durante a gravidez o útero aumenta muitas vezes de tamanho. As contrações do parto são estimuladas pela ocitocina, liberada pela neuro-hipófise.',
    related: ['colo-do-utero', 'tuba-uterina', 'ovario', 'vagina', 'urinary-bladder'],
    topics: ['Sistema reprodutor feminino', 'Ciclo menstrual', 'Gestação'],
    refs: ['apOrgans', 'bio2e'],
  },
  'colo-do-utero': {
    category: 'Parte do útero',
    description: 'Porção inferior e estreita do útero, que se projeta na parte superior da vagina. É atravessada pelo canal cervical.',
    function: 'Comunicar o útero com a vagina; produz um muco que muda ao longo do ciclo (mais fluido na ovulação, facilitando a passagem dos espermatozoides) e se dilata no parto.',
    educational: 'O exame preventivo (Papanicolau) coleta células do colo do útero para detectar cedo alterações causadas pelo HPV. A vacina contra o HPV previne a maioria dos casos de câncer de colo do útero.',
    related: ['utero', 'vagina'],
    topics: ['Sistema reprodutor feminino', 'Saúde da mulher', 'ISTs'],
    refs: ['apOrgans'],
  },
  vulva: {
    category: 'Órgão genital externo',
    description: 'Conjunto dos órgãos genitais externos femininos: monte do púbis, grandes lábios, pequenos lábios, clitóris e vestíbulo, onde se abrem a uretra e a vagina.',
    function: 'Proteger a entrada da vagina e da uretra; o clitóris, rico em terminações nervosas, é o principal órgão da excitação sexual feminina.',
    educational: 'O clitóris se forma a partir do mesmo tecido embrionário que, no sexo masculino, origina a glande do pênis. Na vulva a uretra se abre à frente da vagina, por isso as duas saídas são separadas na mulher.',
    related: ['vagina', 'urinary-bladder'],
    topics: ['Sistema reprodutor feminino', 'Anatomia externa'],
    refs: ['apOrgans'],
  },
  mama: {
    category: 'Órgão',
    description: 'Estrutura sobre o músculo peitoral maior formada pela glândula mamária, por tecido adiposo e por ligamentos de sustentação, recoberta pela pele. No centro ficam a aréola e a papila mamária (mamilo).',
    function: 'Produzir e liberar o leite que alimenta o recém-nascido (lactação).',
    educational: 'As mamas se desenvolvem na puberdade pela ação do estrogênio. A produção de leite é estimulada pela prolactina e a saída dele pela ocitocina, liberada quando o bebê suga. O autoexame e a mamografia ajudam a detectar cedo o câncer de mama.',
    related: ['glandula-mamaria', 'areola', 'sternocostal-head-of-pectoralis-major-muscle', 'adenohypophysis'],
    topics: ['Sistema reprodutor feminino', 'Lactação', 'Saúde da mulher'],
    refs: ['apOrgans'],
  },
  'pele-mama': {
    category: 'Pele',
    description: 'Pele que recobre a mama, com a aréola e a papila mamária no centro.',
    function: 'Proteger a glândula mamária e o tecido adiposo da mama.',
    related: ['mama-esq', 'areola', 'glandula-mamaria'],
    topics: ['Sistema tegumentar', 'Sistema reprodutor feminino'],
    refs: ['apOrgans'],
  },
  areola: {
    category: 'Pele',
    description: 'Área circular pigmentada no centro da mama, com a papila mamária (mamilo) no meio. Tem pequenas glândulas que formam saliências (tubérculos de Montgomery).',
    function: 'A papila mamária recebe as aberturas dos ductos lactíferos, por onde o leite sai durante a amamentação.',
    related: ['glandula-mamaria', 'mama-esq'],
    topics: ['Sistema reprodutor feminino', 'Lactação'],
    refs: ['apOrgans'],
  },
  'glandula-mamaria': {
    category: 'Glândula',
    description: 'Glândula sudorípara modificada, formada por 15 a 20 lobos dispostos em raio ao redor da papila. Cada lobo tem lóbulos com alvéolos que produzem leite e é drenado por um ducto lactífero, que se dilata (seio lactífero) antes de se abrir no mamilo.',
    function: 'Produzir leite durante a lactação, sob o comando da prolactina, e liberá-lo pelo reflexo de ejeção, comandado pela ocitocina.',
    educational: 'No modelo aparecem os lobos (rosados) e os ductos que convergem para o mamilo; o tecido adiposo que os envolve não é mostrado para que a glândula fique visível. Homens também têm glândulas mamárias, mas rudimentares.',
    related: ['mama-esq', 'areola', 'adenohypophysis', 'neurohypophysis'],
    topics: ['Sistema reprodutor feminino', 'Lactação', 'Hormônios'],
    refs: ['apOrgans', 'bio2e'],
  },
  vagina: {
    category: 'Órgão (canal)',
    description: 'Canal muscular e elástico de 8 a 10 cm que vai do colo do útero à vulva, entre a uretra (à frente) e o reto (atrás).',
    function: 'Receber o pênis e o sêmen na relação sexual, dar passagem ao fluxo menstrual e formar o canal de parto.',
    educational: 'O pH ácido da vagina, mantido por bactérias do gênero Lactobacillus, protege contra infecções.',
    related: ['colo-do-utero', 'utero'],
    topics: ['Sistema reprodutor feminino', 'Reprodução humana'],
    refs: ['apOrgans'],
  },
};
