/**
 * Lesson scripts for the Cell Biology laboratory (pt-BR). Original text for
 * BioLab 3D, checked against OpenStax Biology 2e (CC BY 4.0), chapters 4–11,
 * 21 and 22. Requires review by a qualified Biology educator before
 * commercial release (see docs/SCIENTIFIC_CONTENT.md).
 */
import type { Lesson } from './types';

const LAB = 'celulas' as const;

export const CELL_LESSONS: Lesson[] = [
  {
    id: 'teoria-celular',
    laboratoryId: LAB,
    unit: 'Citologia',
    title: 'Teoria celular e tipos de célula',
    grade: '1º ano',
    minutes: 50,
    summary: 'O que é uma célula, como ela foi descoberta e as diferenças entre procariontes e eucariontes e entre células animais e vegetais.',
    objectives: [
      'Enunciar os três princípios da teoria celular.',
      'Diferenciar células procarióticas e eucarióticas pela presença de núcleo e de organelas membranosas.',
      'Comparar célula animal e célula vegetal apontando estruturas exclusivas de cada uma.',
      'Relacionar o tamanho das células à relação área/volume.',
    ],
    sections: [
      {
        heading: 'Da descoberta à teoria celular',
        text:
          'Robert Hooke viu "celas" na cortiça em 1665; Leeuwenhoek observou microrganismos vivos; Schleiden (plantas) e Schwann (animais) generalizaram em 1838–39 que todos os seres vivos são feitos de células; Virchow completou: toda célula vem de outra célula. A teoria celular resume: (1) todos os seres vivos são formados por células; (2) a célula é a unidade básica de estrutura e função; (3) toda célula se origina de uma célula preexistente.',
        bullets: ['Exceção discutida: os vírus não têm células e só se reproduzem dentro delas.', 'Tamanhos: bactérias 1–5 µm; células animais 10–30 µm; células vegetais até 100 µm; o óvulo humano (~0,1 mm) é visível a olho nu.'],
      },
      {
        heading: 'Procariontes: a célula sem núcleo',
        text:
          'Bactérias e arqueas têm o DNA solto no citoplasma, numa região chamada nucleoide, e não têm organelas membranosas. Mesmo assim têm ribossomos (menores, 70S), parede celular, membrana plasmática e, muitas vezes, cápsula, flagelos e fímbrias. A respiração acontece na própria membrana plasmática.',
        actions: [
          { label: 'Abrir a bactéria', model: 'procariotica' },
          { label: 'Nucleoide', structure: 'nucleoide' },
          { label: 'Parede bacteriana', structure: 'parede-celular-bacteriana' },
          { label: 'Girar o flagelo', process: 'flagelo' },
        ],
      },
      {
        heading: 'Eucariontes: compartimentos para cada função',
        text:
          'Nas células eucarióticas o DNA fica protegido pelo envoltório nuclear e o citoplasma é dividido em organelas: mitocôndrias para energia, retículo e Golgi para produzir e distribuir proteínas, lisossomos para digestão. Essa compartimentação permite células maiores e mais especializadas.',
        actions: [
          { label: 'Abrir a célula animal', model: 'animal' },
          { label: 'Núcleo', structure: 'nucleo' },
          { label: 'Mitocôndria', structure: 'mitocondria' },
          { label: 'Complexo golgiense', structure: 'complexo-golgiense' },
        ],
      },
      {
        heading: 'Célula animal × célula vegetal',
        text:
          'A célula vegetal tem parede celular de celulose, cloroplastos e um grande vacúolo central; a animal tem centríolos e lisossomos bem desenvolvidos e não tem parede. As duas têm núcleo, mitocôndrias, retículo, Golgi, ribossomos e citoesqueleto. Vale lembrar que fungos têm parede de quitina e também são eucariontes.',
        bullets: ['Só vegetal: parede celular, cloroplastos, vacúolo central, plasmodesmos.', 'Só animal: centríolos, lisossomos típicos, microvilosidades.', 'Nas duas: núcleo, mitocôndria, retículo, Golgi, ribossomos, citoesqueleto, peroxissomos.'],
        actions: [
          { label: 'Abrir a célula vegetal', model: 'vegetal' },
          { label: 'Parede celular', structure: 'parede-celular' },
          { label: 'Vacúolo central', structure: 'vacuolo' },
          { label: 'Cloroplasto', structure: 'cloroplastos' },
        ],
      },
      {
        heading: 'Por que as células são pequenas?',
        text:
          'Tudo que a célula consome e elimina atravessa a membrana. Quando a célula cresce, o volume aumenta mais depressa que a área da superfície, e a membrana deixa de dar conta. Por isso as células se dividem em vez de crescer sem limite, e células absortivas aumentam a área com microvilosidades.',
        actions: [{ label: 'Microvilosidades', structure: 'microvilosidades' }],
      },
    ],
    keyTerms: ['Teoria celular', 'Procarionte', 'Eucarionte', 'Organela', 'Nucleoide', 'Relação área/volume'],
    questions: [
      { q: 'Uma bactéria tem ribossomos? E mitocôndrias?', a: 'Tem ribossomos (70S), mas não tem mitocôndrias nem outras organelas membranosas; a respiração ocorre na membrana plasmática.' },
      { q: 'Qual estrutura permitiria distinguir uma célula vegetal de uma animal ao microscópio óptico?', a: 'A parede celular (e, em tecidos verdes, os cloroplastos; o vacúolo grande também ajuda).' },
      { q: 'Por que um ovo de galinha, apesar de ser uma célula enorme, não contraria a regra do tamanho?', a: 'Quase todo o volume é reserva (gema) metabolicamente pouco ativa; a parte viva é pequena.' },
    ],
    misconceptions: ['"Bactérias não têm parede" — a maioria tem (de peptidoglicano); o que falta é núcleo.', '"Célula vegetal não tem mitocôndria" — tem; ela precisa respirar o dia inteiro, inclusive à noite.'],
    refs: ['bio-4'],
  },
  {
    id: 'membrana-transportes',
    laboratoryId: LAB,
    unit: 'Citologia',
    title: 'Membrana plasmática e transportes',
    grade: '1º ano',
    minutes: 50,
    summary: 'O modelo do mosaico fluido e como as substâncias atravessam a membrana: difusão, osmose, transporte ativo, endocitose e exocitose.',
    objectives: [
      'Descrever a membrana como uma bicamada de fosfolipídios com proteínas (mosaico fluido).',
      'Distinguir transporte passivo (difusão simples, facilitada e osmose) de transporte ativo.',
      'Prever o que acontece com células animais e vegetais em meios hipotônicos, isotônicos e hipertônicos.',
      'Explicar endocitose (fagocitose e pinocitose) e exocitose.',
    ],
    sections: [
      {
        heading: 'Mosaico fluido',
        text:
          'A membrana tem cerca de 7 nm e é formada por duas camadas de fosfolipídios, com as "cabeças" hidrofílicas voltadas para a água e as "caudas" hidrofóbicas no meio. Proteínas flutuam nessa bicamada (por isso "mosaico fluido"): canais, transportadores, receptores e enzimas. Nas células animais o colesterol regula a fluidez e, na face externa, açúcares formam o glicocálix, que identifica a célula.',
        actions: [{ label: 'Membrana plasmática', structure: 'membrana-plasmatica' }],
      },
      {
        heading: 'Transporte passivo: a favor do gradiente, sem gasto de ATP',
        text:
          'Difusão simples: gases (O₂, CO₂) e moléculas pequenas e apolares atravessam direto a bicamada. Difusão facilitada: íons, glicose e aminoácidos passam por canais ou carreadores, ainda a favor do gradiente. Osmose: a água atravessa a membrana (também por aquaporinas) do meio menos concentrado em solutos para o mais concentrado.',
        bullets: ['Meio hipotônico: entra água — hemácia incha e pode estourar (hemólise); célula vegetal fica túrgida.', 'Meio isotônico: não há fluxo líquido.', 'Meio hipertônico: sai água — hemácia murcha (crenação); célula vegetal sofre plasmólise.'],
        actions: [
          { label: 'Abrir a célula vegetal', model: 'vegetal' },
          { label: 'Osmose: turgência e plasmólise', process: 'osmose' },
        ],
      },
      {
        heading: 'Transporte ativo: contra o gradiente, com ATP',
        text:
          'A bomba de sódio e potássio gasta um ATP para expulsar 3 Na⁺ e trazer 2 K⁺, mantendo o interior da célula rico em potássio e pobre em sódio. Isso sustenta o impulso nervoso, a absorção de nutrientes no intestino e o volume celular. Cerca de um terço da energia de uma célula em repouso vai para essa bomba.',
        actions: [{ label: 'Mitocôndria (fonte do ATP)', structure: 'mitocondria' }],
      },
      {
        heading: 'Endocitose e exocitose: transporte em quantidade',
        text:
          'Para partículas grandes a célula dobra a membrana e forma vesículas. Fagocitose: engolfa sólidos (glóbulos brancos comendo bactérias; amebas). Pinocitose: engloba líquidos. Endocitose mediada por receptor: captura moléculas específicas, como o colesterol (LDL). Exocitose: a vesícula se funde à membrana e libera o conteúdo (hormônios, enzimas, neurotransmissores).',
        actions: [
          { label: 'Abrir a célula animal', model: 'animal' },
          { label: 'Vesículas', structure: 'vesiculas' },
          { label: 'Lisossomos', structure: 'lisossomos' },
          { label: 'Secreção de proteínas (exocitose)', process: 'secrecao' },
        ],
      },
    ],
    keyTerms: ['Bicamada lipídica', 'Permeabilidade seletiva', 'Difusão', 'Osmose', 'Hipotônico/hipertônico', 'Bomba de sódio-potássio', 'Fagocitose', 'Exocitose'],
    questions: [
      { q: 'Por que uma salada temperada com sal murcha?', a: 'O sal torna o meio hipertônico; a água sai das células vegetais por osmose (plasmólise).' },
      { q: 'Soro fisiológico é 0,9% de NaCl. O que aconteceria com as hemácias se fosse água pura?', a: 'Entraria água por osmose e elas se romperiam (hemólise).' },
      { q: 'O que diferencia difusão facilitada de transporte ativo, se os dois usam proteínas?', a: 'A direção em relação ao gradiente e o gasto de energia: o ativo vai contra o gradiente e consome ATP.' },
    ],
    misconceptions: ['"Osmose é a água indo para onde tem menos água" — melhor dizer: para onde há mais soluto (menor potencial hídrico).'],
    refs: ['bio-5'],
  },
  {
    id: 'organelas-endomembranas',
    laboratoryId: LAB,
    unit: 'Citologia',
    title: 'Organelas e o sistema de endomembranas',
    grade: '1º ano',
    minutes: 50,
    summary: 'A linha de produção da célula: do ribossomo ao retículo, ao Golgi e às vesículas, mais lisossomos, peroxissomos e vacúolos.',
    objectives: [
      'Identificar as principais organelas e associar cada uma à sua função.',
      'Descrever a rota de uma proteína de exportação (ribossomo → RER → Golgi → vesícula → exocitose).',
      'Explicar o papel dos lisossomos e peroxissomos na digestão e desintoxicação.',
    ],
    sections: [
      {
        heading: 'Ribossomos e retículo endoplasmático rugoso',
        text:
          'Ribossomos são fábricas de proteínas; os livres fazem proteínas para o citosol, os aderidos ao retículo rugoso fazem proteínas de membrana e de exportação. Dentro do retículo a proteína se dobra e recebe os primeiros açúcares. Células secretoras, como as do pâncreas, são cheias de retículo rugoso.',
        actions: [
          { label: 'Ribossomos', structure: 'ribossomos' },
          { label: 'Retículo rugoso', structure: 'reticulo-endoplasmatico-rugoso' },
        ],
      },
      {
        heading: 'Retículo liso',
        text:
          'Sem ribossomos, o retículo liso produz lipídios (fosfolipídios, esteroides como os hormônios sexuais), desintoxica substâncias (fígado, álcool e medicamentos) e armazena cálcio (retículo sarcoplasmático dos músculos).',
        actions: [{ label: 'Retículo liso', structure: 'reticulo-endoplasmatico-liso' }],
      },
      {
        heading: 'Complexo golgiense e vesículas',
        text:
          'Pilha de cisternas achatadas que recebe vesículas do retículo (face cis), modifica, classifica e endereça as proteínas e as despacha (face trans) em vesículas de secreção, lisossomos ou para a membrana. É o "centro de distribuição" da célula; forma também o acrossomo do espermatozoide e a parede das células vegetais.',
        actions: [
          { label: 'Complexo golgiense', structure: 'complexo-golgiense' },
          { label: 'Síntese e secreção de proteínas', process: 'secrecao' },
        ],
      },
      {
        heading: 'Lisossomos, peroxissomos e vacúolos',
        text:
          'Lisossomos são bolsas de enzimas digestivas ácidas: digerem o que a célula engole (heterofagia) e organelas velhas (autofagia). Peroxissomos quebram ácidos graxos e destroem o peróxido de hidrogênio com a catalase. O vacúolo central das plantas armazena água, sais, pigmentos e resíduos, e mantém a turgência.',
        bullets: ['Experimento: água oxigenada borbulha sobre batata ou fígado por causa da catalase.', 'Doenças lisossômicas (ex.: Tay-Sachs) ocorrem quando falta uma enzima e o substrato se acumula.'],
        actions: [
          { label: 'Lisossomos', structure: 'lisossomos' },
          { label: 'Peroxissomos', structure: 'peroxissomos' },
          { label: 'Vacúolo central', structure: 'vacuolo' },
        ],
      },
    ],
    keyTerms: ['Ribossomo', 'Retículo endoplasmático', 'Complexo golgiense', 'Vesícula', 'Lisossomo', 'Peroxissomo', 'Autofagia'],
    questions: [
      { q: 'Uma célula que produz muito hormônio esteroide terá mais retículo rugoso ou liso?', a: 'Liso: esteroides são lipídios.' },
      { q: 'Como uma enzima digestiva produzida no pâncreas chega ao intestino?', a: 'Ribossomo no RER → retículo → vesícula → Golgi → vesícula de secreção → exocitose → ducto pancreático.' },
    ],
    refs: ['bio-4'],
  },
  {
    id: 'nucleo-dna-cromossomos',
    laboratoryId: LAB,
    unit: 'Citologia e Genética',
    title: 'Núcleo, cromatina e cromossomos',
    grade: '1º ano',
    minutes: 50,
    summary: 'Como o DNA é guardado no núcleo, o que são cromatina e cromossomos, e o caminho DNA → RNA → proteína.',
    objectives: [
      'Descrever o envoltório nuclear, os poros, o nucléolo e a cromatina.',
      'Relacionar cromatina e cromossomo como estados da mesma molécula.',
      'Explicar, em linhas gerais, transcrição e tradução.',
      'Interpretar o cariótipo humano (46 cromossomos, 23 pares).',
    ],
    sections: [
      {
        heading: 'O envoltório e os poros',
        text:
          'O núcleo é delimitado por duas membranas, contínuas com o retículo rugoso, atravessadas por milhares de poros. Pelos poros saem RNA mensageiro e subunidades de ribossomos e entram proteínas como as histonas e as enzimas da replicação.',
        actions: [
          { label: 'Envoltório nuclear', structure: 'envoltorio-nuclear' },
          { label: 'Nucléolo', structure: 'nucleolo' },
        ],
      },
      {
        heading: 'Cromatina e cromossomos',
        text:
          'O DNA humano tem cerca de 2 m por célula e cabe num núcleo de 6 µm porque se enrola em histonas (nucleossomos) formando a cromatina. Na interfase ela está frouxa (eucromatina, ativa) ou compacta (heterocromatina). Na divisão, a cromatina se condensa ao máximo e vira cromossomos visíveis, cada um com duas cromátides-irmãs unidas pelo centrômero.',
        actions: [
          { label: 'Cromatina', structure: 'cromatina' },
          { label: 'Ver a condensação na mitose', model: 'mitose' },
        ],
      },
      {
        heading: 'Do gene à proteína',
        text:
          'Transcrição: no núcleo, a RNA-polimerase copia um gene em RNA mensageiro. Tradução: no citoplasma, o ribossomo lê o mRNA de três em três bases (códons) e o RNA transportador traz o aminoácido correspondente. Resultado: uma proteína com a sequência ditada pelo gene. É o "dogma central": DNA → RNA → proteína.',
        actions: [
          { label: 'Abrir a célula animal', model: 'animal' },
          { label: 'Ver a transcrição e a tradução', process: 'secrecao' },
        ],
      },
      {
        heading: 'Cariótipo humano',
        text:
          'As células somáticas humanas têm 46 cromossomos: 22 pares de autossomos e 1 par de cromossomos sexuais (XX ou XY). Os gametas têm 23. Cromossomos homólogos têm os mesmos genes, um de origem materna e outro paterna. Alterações no número (ex.: trissomia do 21) ou na estrutura explicam várias síndromes.',
        actions: [{ label: 'Cromossomos homólogos (meiose)', model: 'meiose' }],
      },
    ],
    keyTerms: ['Envoltório nuclear', 'Poro nuclear', 'Nucléolo', 'Cromatina', 'Histona', 'Cromossomo', 'Cromátide', 'Transcrição', 'Tradução', 'Cariótipo'],
    questions: [
      { q: 'Cromatina e cromossomo são coisas diferentes?', a: 'Não: são estados de condensação da mesma molécula de DNA + proteínas.' },
      { q: 'Onde ocorre a transcrição e onde ocorre a tradução numa célula eucariótica?', a: 'Transcrição no núcleo; tradução nos ribossomos, no citoplasma.' },
    ],
    refs: ['bio-4', 'bio-15'],
  },
  {
    id: 'citoesqueleto-movimento',
    laboratoryId: LAB,
    unit: 'Citologia',
    title: 'Citoesqueleto, cílios e flagelos',
    grade: '1º ano',
    minutes: 40,
    summary: 'A armação interna da célula: microtúbulos, filamentos de actina e intermediários, centríolos e estruturas de movimento.',
    objectives: [
      'Identificar os três tipos de filamento do citoesqueleto e suas funções.',
      'Explicar a função dos centríolos e do centrossomo.',
      'Comparar flagelo bacteriano e flagelo eucariótico.',
    ],
    sections: [
      {
        heading: 'Três tipos de filamento',
        text:
          'Microtúbulos (tubulina, 25 nm) são trilhos para o transporte de vesículas e organelas e formam o fuso da divisão, os cílios e os flagelos. Filamentos de actina (7 nm) ficam sob a membrana, sustentam as microvilosidades e, com a miosina, produzem contração e movimento ameboide. Filamentos intermediários dão resistência mecânica (queratina na pele, laminas no núcleo).',
        actions: [
          { label: 'Citoesqueleto', structure: 'citoesqueleto' },
          { label: 'Microvilosidades', structure: 'microvilosidades' },
        ],
      },
      {
        heading: 'Centríolos e centrossomo',
        text:
          'O par de centríolos (9 trincas de microtúbulos cada) fica no centrossomo, o centro organizador de microtúbulos das células animais. Antes da divisão o centrossomo se duplica e os dois migram para os polos, organizando o fuso. Plantas não têm centríolos e mesmo assim formam o fuso.',
        actions: [
          { label: 'Centríolos', structure: 'centriolos' },
          { label: 'Fuso na mitose', model: 'mitose' },
        ],
      },
      {
        heading: 'Cílios e flagelos',
        text:
          'Nos eucariontes, cílios (curtos, muitos: traqueia, tubas uterinas, paramécio) e flagelos (longos, poucos: espermatozoide) têm o mesmo arranjo 9 + 2 de microtúbulos e se dobram. O flagelo bacteriano é totalmente diferente: um filamento rígido de flagelina girado por um motor na membrana.',
        actions: [
          { label: 'Abrir a bactéria', model: 'procariotica' },
          { label: 'Movimento do flagelo', process: 'flagelo' },
        ],
      },
    ],
    keyTerms: ['Microtúbulo', 'Actina', 'Filamento intermediário', 'Centríolo', 'Centrossomo', 'Cílio', 'Flagelo'],
    questions: [
      { q: 'Por que fumantes tossem mais?', a: 'A fumaça paralisa os cílios da traqueia, que deixam de varrer o muco com partículas; a tosse compensa.' },
      { q: 'Flagelo de bactéria e de espermatozoide são a mesma coisa?', a: 'Não: estruturas e mecanismos diferentes (rotação de flagelina × dobramento de microtúbulos).' },
    ],
    refs: ['bio-4'],
  },
  {
    id: 'ciclo-celular-mitose',
    laboratoryId: LAB,
    unit: 'Divisão celular',
    title: 'Ciclo celular e mitose',
    grade: '1º ano',
    minutes: 50,
    summary: 'As etapas do ciclo celular, as fases da mitose e sua importância no crescimento, na regeneração e no câncer.',
    objectives: [
      'Descrever as etapas da interfase (G1, S, G2) e o que acontece em cada uma.',
      'Reconhecer prófase, metáfase, anáfase e telófase e a citocinese.',
      'Explicar por que as células-filhas da mitose são geneticamente idênticas.',
      'Relacionar a perda do controle do ciclo celular ao câncer.',
    ],
    sections: [
      {
        heading: 'Interfase: a célula se prepara',
        text:
          'G1: crescimento e síntese de proteínas. S: replicação do DNA — cada cromossomo passa a ter duas cromátides-irmãs; o centrossomo também se duplica. G2: últimos preparativos e checagem de erros. A interfase ocupa cerca de 90% do ciclo; neurônios e células musculares saem do ciclo (G0).',
        actions: [
          { label: 'Abrir o modelo de mitose', model: 'mitose' },
          { label: 'Cromatina', structure: 'cromatina' },
        ],
      },
      {
        heading: 'As fases da mitose',
        text:
          'Prófase: a cromatina se condensa, os centrossomos vão para os polos, o fuso se forma e o envoltório nuclear se desfaz. Metáfase: cromossomos alinhados na placa equatorial, presos ao fuso pelos cinetócoros. Anáfase: as cromátides-irmãs se separam e viram cromossomos independentes, puxados para os polos. Telófase: os cromossomos se descondensam e os envoltórios se refazem.',
        bullets: ['Macete: PRÓ-META-ANÁ-TELO ("prometa não telefonar").', 'Lembre: em metáfase o número de cromossomos ainda é 2n com cromátides duplas; na anáfase passa momentaneamente a 4n.'],
        actions: [{ label: 'Mitose passo a passo', process: 'mitose' }],
      },
      {
        heading: 'Citocinese: animal × vegetal',
        text:
          'Na célula animal um anel de actina e miosina estrangula a célula de fora para dentro. Na célula vegetal, que tem parede rígida, vesículas do Golgi se alinham no centro e formam a placa celular, que cresce de dentro para fora até virar uma nova parede.',
        actions: [{ label: 'Citocinese', process: 'mitose' }],
      },
      {
        heading: 'Para que serve e quando dá errado',
        text:
          'Mitose produz duas células geneticamente iguais à mãe: é a base do crescimento, da reposição de células (pele, sangue, intestino), da cicatrização e da reprodução assexuada. Pontos de checagem (G1, G2 e metáfase) interrompem o ciclo se há DNA danificado. Quando genes de controle (como o p53) sofrem mutação, a célula se divide sem freio: é o câncer. Quimioterapia e radioterapia atacam justamente células que se dividem muito.',
      },
    ],
    keyTerms: ['Ciclo celular', 'Interfase', 'Replicação', 'Cromátide-irmã', 'Centrômero', 'Fuso mitótico', 'Placa equatorial', 'Citocinese', 'Ponto de checagem'],
    questions: [
      { q: 'Em que fase do ciclo o DNA é duplicado?', a: 'Na fase S da interfase, antes da mitose.' },
      { q: 'Uma célula humana em metáfase tem quantas cromátides?', a: '92 (46 cromossomos, cada um com duas cromátides).' },
      { q: 'Por que a quimioterapia causa queda de cabelo?', a: 'Ataca células em divisão rápida, como as do folículo piloso, não só as do tumor.' },
    ],
    misconceptions: ['"A duplicação do DNA acontece na prófase" — acontece antes, na fase S.', '"Mitose = divisão celular" — a mitose é a divisão do núcleo; a citocinese divide o citoplasma.'],
    refs: ['bio-10'],
  },
  {
    id: 'meiose-variabilidade',
    laboratoryId: LAB,
    unit: 'Divisão celular',
    title: 'Meiose, gametas e variabilidade',
    grade: '1º ano',
    minutes: 50,
    summary: 'As duas divisões da meiose, o crossing-over, a segregação independente e a formação de gametas.',
    objectives: [
      'Distinguir meiose I (reducional) de meiose II (equacional).',
      'Explicar como crossing-over e segregação independente geram variabilidade.',
      'Comparar mitose e meiose quanto a número de divisões, de células e de cromossomos.',
      'Relacionar erros da meiose a síndromes cromossômicas.',
    ],
    sections: [
      {
        heading: 'Por que reduzir o número de cromossomos',
        text:
          'Na fecundação, dois gametas se unem. Se cada um tivesse 46 cromossomos, o zigoto teria 92 e o número dobraria a cada geração. A meiose produz gametas haploides (n = 23), de modo que o zigoto volta a ser diploide (2n = 46). Ela ocorre só nas células germinativas: nos testículos e nos ovários.',
        actions: [{ label: 'Abrir o modelo de meiose', model: 'meiose' }],
      },
      {
        heading: 'Meiose I: separa os homólogos',
        text:
          'Prófase I é longa e decisiva: os cromossomos homólogos se emparelham (sinapse) formando tétrades, e cromátides de homólogos trocam pedaços — o crossing-over, visível como quiasmas. Na metáfase I os pares se alinham; na anáfase I cada homólogo vai para um polo (as cromátides-irmãs continuam juntas). Resultado: duas células haploides com cromossomos ainda duplicados.',
        actions: [
          { label: 'Cromossomos homólogos', structure: 'cromossomos-homologos' },
          { label: 'Quiasma (crossing-over)', structure: 'quiasma' },
          { label: 'Meiose passo a passo', process: 'meiose' },
        ],
      },
      {
        heading: 'Meiose II: separa as cromátides',
        text: 'Sem nova replicação, cada célula faz uma divisão parecida com a mitose: as cromátides-irmãs se separam na anáfase II. Ao final há quatro células haploides, todas diferentes entre si.',
        bullets: ['Mitose: 1 divisão, 2 células, 2n → 2n, idênticas.', 'Meiose: 2 divisões, 4 células, 2n → n, diferentes.'],
      },
      {
        heading: 'Variabilidade e gametogênese',
        text:
          'Duas fontes de variabilidade: o crossing-over recombina genes dentro do cromossomo, e a orientação ao acaso dos pares na metáfase I (segregação independente) gera 2²³ ≈ 8 milhões de combinações por gameta humano. Na espermatogênese cada meiose rende 4 espermatozoides; na ovogênese, 1 óvulo grande e corpúsculos polares que degeneram. Erros de separação (não disjunção) produzem gametas com cromossomo a mais ou a menos: trissomia do 21 (síndrome de Down), XXY (Klinefelter), X0 (Turner).',
      },
    ],
    keyTerms: ['Haploide/diploide', 'Cromossomos homólogos', 'Sinapse', 'Tétrade', 'Crossing-over', 'Quiasma', 'Segregação independente', 'Não disjunção', 'Gametogênese'],
    questions: [
      { q: 'Em que anáfase as cromátides-irmãs se separam: I ou II?', a: 'Na anáfase II. Na anáfase I separam-se os homólogos.' },
      { q: 'Por que irmãos do mesmo casal são diferentes?', a: 'Crossing-over e segregação independente tornam cada gameta único; gêmeos idênticos vêm de um só zigoto.' },
      { q: 'Uma célula com 2n = 8 entra em meiose. Quantos cromossomos tem cada célula ao final?', a: '4 (n = 4).' },
    ],
    misconceptions: ['"Na meiose o DNA duplica duas vezes" — só uma, antes da meiose I.', '"Meiose produz gametas idênticos" — produz células geneticamente diferentes.'],
    refs: ['bio-11'],
  },
  {
    id: 'respiracao-celular-fermentacao',
    laboratoryId: LAB,
    unit: 'Metabolismo energético',
    title: 'Respiração celular e fermentação',
    grade: '1º ano',
    minutes: 50,
    summary: 'Como a célula extrai energia da glicose: glicólise, ciclo de Krebs e cadeia respiratória na mitocôndria, e as fermentações.',
    objectives: [
      'Escrever a equação geral da respiração aeróbica.',
      'Localizar glicólise, ciclo de Krebs e cadeia respiratória na célula.',
      'Explicar o papel do oxigênio e a produção de ATP por quimiosmose.',
      'Comparar respiração e fermentação lática e alcoólica.',
    ],
    sections: [
      {
        heading: 'ATP: a moeda de energia',
        text:
          'A célula não usa glicose diretamente: ela transfere a energia da glicose para o ATP, que é gasto em transporte ativo, contração, síntese e divisão. Cada ATP é consumido e refeito milhares de vezes por dia.',
        actions: [{ label: 'Mitocôndria', structure: 'mitocondria' }],
      },
      {
        heading: 'Glicólise (citoplasma)',
        text: 'A glicose (6 C) é quebrada em dois piruvatos (3 C), com saldo de 2 ATP e 2 NADH. Não precisa de oxigênio e acontece em todas as células, inclusive bactérias.',
        actions: [{ label: 'Respiração celular na célula', process: 'respiracao' }],
      },
      {
        heading: 'Ciclo de Krebs e cadeia respiratória (mitocôndria)',
        text:
          'Na matriz, o piruvato vira acetil-CoA e entra no ciclo de Krebs, que libera CO₂ e carrega elétrons em NADH e FADH₂. Na membrana interna (cristas), a cadeia respiratória passa esses elétrons até o O₂, formando água, e bombeia H⁺ para o espaço intermembranas. Os H⁺ voltam pela ATP sintase, que gira e produz ATP (quimiosmose). Saldo total: cerca de 30–32 ATP por glicose.',
        bullets: ['Equação: C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O + energia (ATP).', 'O CO₂ que expiramos vem do ciclo de Krebs; a água formada vem da cadeia respiratória.'],
        actions: [
          { label: 'Abrir a mitocôndria em detalhe', model: 'mitocondria' },
          { label: 'Cristas e ATP sintase', structure: 'atp-sintase' },
          { label: 'Respiração na mitocôndria', process: 'respiracao-mito' },
        ],
      },
      {
        heading: 'Fermentação: sem oxigênio',
        text:
          'Sem O₂ a cadeia para e a célula depende só da glicólise (2 ATP). Para continuar, precisa regenerar o NAD⁺: na fermentação lática (músculo em esforço intenso, lactobacilos do iogurte) o piruvato vira lactato; na alcoólica (leveduras do pão, da cerveja e do vinho) vira etanol e CO₂.',
      },
    ],
    keyTerms: ['ATP', 'Glicólise', 'Piruvato', 'Ciclo de Krebs', 'Cadeia respiratória', 'Quimiosmose', 'ATP sintase', 'Fermentação lática', 'Fermentação alcoólica'],
    questions: [
      { q: 'Por que o pão cresce?', a: 'A levedura fermenta açúcares e libera CO₂, que forma bolhas na massa; o álcool evapora no forno.' },
      { q: 'Qual etapa da respiração produz mais ATP?', a: 'A cadeia respiratória com a ATP sintase (fosforilação oxidativa).' },
      { q: 'Uma bactéria faz respiração aeróbica sem mitocôndria. Onde?', a: 'Na membrana plasmática, que faz o papel da membrana interna.' },
    ],
    misconceptions: ['"Respiração celular é a troca de gases nos pulmões" — a troca de gases serve à respiração celular, que ocorre em todas as células.'],
    refs: ['bio-7'],
  },
  {
    id: 'fotossintese',
    laboratoryId: LAB,
    unit: 'Metabolismo energético',
    title: 'Fotossíntese',
    grade: '1º ano',
    minutes: 50,
    summary: 'Como as plantas transformam luz, água e CO₂ em açúcar e oxigênio nos cloroplastos: fase clara e ciclo de Calvin.',
    objectives: [
      'Escrever a equação geral da fotossíntese e localizar suas etapas no cloroplasto.',
      'Explicar o que acontece na fase clara (tilacoides) e na fase química (estroma).',
      'Relacionar fotossíntese e respiração celular.',
      'Discutir fatores que afetam a fotossíntese (luz, CO₂, temperatura, água).',
    ],
    sections: [
      {
        heading: 'O cloroplasto',
        text:
          'Organela de dupla membrana, com um terceiro sistema interno: os tilacoides, empilhados em grana e ligados por lamelas, mergulhados no estroma. A clorofila fica nas membranas dos tilacoides; o estroma tem as enzimas do ciclo de Calvin, DNA próprio e grãos de amido.',
        actions: [
          { label: 'Abrir o cloroplasto em detalhe', model: 'cloroplasto' },
          { label: 'Tilacoides e grana', structure: 'tilacoides' },
          { label: 'Estroma', structure: 'estroma' },
        ],
      },
      {
        heading: 'Fase clara (fotoquímica)',
        text:
          'A clorofila absorve luz (vermelho e azul; reflete o verde). A energia quebra a água (fotólise), liberando O₂, e os elétrons percorrem uma cadeia que bombeia H⁺ e produz ATP; o NADP⁺ recebe os elétrons e vira NADPH.',
        bullets: ['O oxigênio liberado vem da água, não do CO₂.'],
        actions: [{ label: 'Fotossíntese no cloroplasto', process: 'fotossintese-cloro' }],
      },
      {
        heading: 'Ciclo de Calvin (fase química)',
        text:
          'No estroma, a enzima rubisco fixa o CO₂ e, com ATP e NADPH da fase clara, produz trioses que viram glicose, sacarose (transportada pelo floema) e amido (reserva). Não precisa diretamente de luz, mas depende dos produtos dela.',
        bullets: ['Equação: 6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂.'],
        actions: [
          { label: 'Abrir a célula vegetal', model: 'vegetal' },
          { label: 'Fotossíntese na célula', process: 'fotossintese' },
        ],
      },
      {
        heading: 'Fotossíntese e respiração: lados opostos',
        text:
          'A planta respira o tempo todo, nas mitocôndrias, e fotossintetiza só com luz. De dia a fotossíntese supera a respiração (ponto de compensação luminoso) e a planta acumula matéria. Fatores limitantes: intensidade de luz, concentração de CO₂, temperatura e disponibilidade de água (estômatos fechados cortam o CO₂).',
        actions: [{ label: 'Mitocôndria da célula vegetal', structure: 'mitocondria' }],
      },
    ],
    keyTerms: ['Cloroplasto', 'Tilacoide', 'Grana', 'Estroma', 'Clorofila', 'Fotólise da água', 'NADPH', 'Ciclo de Calvin', 'Rubisco', 'Ponto de compensação'],
    questions: [
      { q: 'De onde vem o oxigênio liberado pela planta?', a: 'Da quebra da água na fase clara.' },
      { q: 'A planta respira à noite?', a: 'Sim, respira o tempo todo; só a fotossíntese para.' },
      { q: 'Por que as folhas são verdes?', a: 'A clorofila absorve vermelho e azul e reflete o verde.' },
    ],
    misconceptions: ['"A planta respira CO₂ e solta O₂" — ela fotossintetiza com CO₂ e respira O₂ como nós.', '"A fase escura só ocorre à noite" — ocorre sempre que há ATP e NADPH, principalmente de dia.'],
    refs: ['bio-8'],
  },
  {
    id: 'bacterias',
    laboratoryId: LAB,
    unit: 'Microbiologia',
    title: 'Bactérias: estrutura, reprodução e importância',
    grade: '2º ano',
    minutes: 50,
    summary: 'A célula bacteriana por dentro e por fora, Gram-positivas e Gram-negativas, fissão binária, conjugação, antibióticos e o papel das bactérias na natureza e na saúde.',
    objectives: [
      'Identificar as estruturas da célula bacteriana e suas funções.',
      'Explicar a coloração de Gram pela diferença de parede.',
      'Descrever a fissão binária e as formas de troca de genes (conjugação, transformação, transdução).',
      'Discutir o uso correto de antibióticos e a resistência bacteriana.',
    ],
    sections: [
      {
        heading: 'Anatomia de uma bactéria',
        text:
          'Cápsula (proteção e adesão), parede de peptidoglicano (forma e resistência), membrana plasmática (transporte e respiração), citoplasma com ribossomos 70S, nucleoide com um cromossomo circular, plasmídeos (genes extras, como os de resistência), flagelos (movimento) e fímbrias (adesão). Formas: cocos, bacilos, espirilos e vibriões.',
        actions: [
          { label: 'Abrir a bactéria', model: 'procariotica' },
          { label: 'Cápsula', structure: 'capsula-bacteriana' },
          { label: 'Plasmídeos', structure: 'plasmideos' },
          { label: 'Fímbrias', structure: 'fimbrias' },
        ],
      },
      {
        heading: 'Gram-positivas e Gram-negativas',
        text:
          'Gram-positivas (Staphylococcus, Streptococcus, Lactobacillus) têm parede espessa e retêm o cristal violeta: ficam roxas. Gram-negativas (E. coli, Salmonella, Pseudomonas) têm parede fina entre a membrana plasmática e uma membrana externa com LPS: perdem o roxo e ficam rosa com o contracorante. A membrana externa barra muitos antibióticos.',
        actions: [
          { label: 'Membrana externa', structure: 'membrana-externa' },
          { label: 'Parede bacteriana', structure: 'parede-celular-bacteriana' },
          { label: 'Espaço periplasmático', structure: 'periplasma' },
        ],
      },
      {
        heading: 'Reprodução e troca de genes',
        text:
          'Fissão binária: o cromossomo se replica, a célula se alonga, um septo se forma no meio e surgem duas bactérias iguais — em condições ideais, a cada 20 minutos. Variabilidade vem de mutações e de três mecanismos: conjugação (plasmídeo passa por um pilo sexual), transformação (captura de DNA do meio) e transdução (vírus leva genes de uma bactéria a outra).',
        actions: [
          { label: 'Fissão binária', process: 'fissao' },
          { label: 'Nucleoide', structure: 'nucleoide' },
        ],
      },
      {
        heading: 'Bactérias na vida e na saúde',
        text:
          'Decompositoras e fixadoras de nitrogênio (Rhizobium nas raízes das leguminosas) sustentam os ciclos da matéria; a microbiota intestinal ajuda na digestão e na imunidade; a indústria usa bactérias para iogurte, queijo, vinagre e insulina. Algumas causam doenças (tuberculose, cólera, tétano, pneumonias). Antibióticos atacam estruturas que só a bactéria tem — parede (penicilina), ribossomo 70S (tetraciclina). Usá-los sem necessidade ou interromper o tratamento seleciona bactérias resistentes.',
        actions: [{ label: 'Ribossomos 70S', structure: 'ribossomos-70s' }],
      },
    ],
    keyTerms: ['Peptidoglicano', 'Gram-positiva/negativa', 'Nucleoide', 'Plasmídeo', 'Fissão binária', 'Conjugação', 'Microbiota', 'Resistência a antibióticos'],
    questions: [
      { q: 'Por que antibiótico não funciona contra gripe?', a: 'Gripe é causada por vírus, que não tem parede nem ribossomo próprio; antibióticos agem em estruturas bacterianas.' },
      { q: 'Como uma bactéria pode adquirir resistência sem sofrer mutação?', a: 'Recebendo um plasmídeo com o gene por conjugação (ou por transformação/transdução).' },
      { q: 'Uma bactéria que se divide a cada 20 min, em 4 horas, gera quantas?', a: '2¹² = 4.096 (12 divisões), se nada limitar o crescimento.' },
    ],
    refs: ['bio-22'],
  },
  {
    id: 'virus',
    laboratoryId: LAB,
    unit: 'Microbiologia',
    title: 'Vírus: entre o vivo e o não vivo',
    grade: '2º ano',
    minutes: 40,
    summary: 'Estrutura dos vírus, ciclos lítico e lisogênico, viroses importantes e como vacinas e antivirais funcionam.',
    objectives: ['Descrever a estrutura básica de um vírus.', 'Explicar por que os vírus são parasitas intracelulares obrigatórios.', 'Diferenciar ciclo lítico e lisogênico.', 'Relacionar vacinas à resposta imune.'],
    sections: [
      {
        heading: 'O que é um vírus',
        text:
          'Partícula de 20 a 300 nm formada por material genético (DNA ou RNA) dentro de um capsídeo de proteínas; alguns têm um envelope de membrana roubado da célula hospedeira, com espículas. Não têm células, ribossomos nem metabolismo: só se reproduzem dentro de uma célula viva, usando as máquinas dela. Por isso são discutidos como "limite" da vida.',
        actions: [{ label: 'Compare com a bactéria', model: 'procariotica' }],
      },
      {
        heading: 'Ciclos de replicação',
        text:
          'Ciclo lítico: o vírus adere a receptores da célula, injeta ou libera seu genoma, a célula produz cópias e novas partículas, e se rompe (lise). Ciclo lisogênico: o genoma viral se integra ao DNA da célula (profago/provírus) e é copiado junto com ela por gerações, até ser ativado. O HIV é um retrovírus: usa a transcriptase reversa para copiar seu RNA em DNA e integrá-lo.',
        actions: [{ label: 'Célula hospedeira (ribossomos)', structure: 'ribossomos' }],
      },
      {
        heading: 'Viroses e prevenção',
        text:
          'Gripe, resfriado, dengue, zika, sarampo, caxumba, hepatites, HPV, HIV, covid-19. Vacinas apresentam ao sistema imune um antígeno do vírus (atenuado, inativado, proteína ou mRNA) para gerar anticorpos e memória sem a doença. Antivirais bloqueiam enzimas do vírus (ex.: protease, transcriptase reversa). Antibióticos não têm efeito.',
      },
    ],
    keyTerms: ['Capsídeo', 'Envelope', 'Parasita intracelular obrigatório', 'Ciclo lítico', 'Ciclo lisogênico', 'Retrovírus', 'Vacina'],
    questions: [
      { q: 'Vírus é vivo?', a: 'Depende do critério: tem genes e evolui, mas não tem célula nem metabolismo próprio.' },
      { q: 'Por que precisamos de vacina da gripe todo ano?', a: 'O vírus muta rapidamente (antígenos mudam) e a imunidade dura pouco.' },
    ],
    refs: ['bio-21'],
  },
];
