/**
 * Lesson scripts for the Microorganisms laboratory (pt-BR). Original text for
 * BioLab 3D, checked against OpenStax Biology 2e (CC BY 4.0), chapters 21–24,
 * and OpenStax Microbiology. Requires review by a qualified Biology educator
 * before commercial release.
 */
import type { Lesson } from './types';

const LAB = 'microrganismos' as const;

export const MICROBE_LESSONS: Lesson[] = [
  {
    id: 'virus-ciclos',
    laboratoryId: LAB,
    unit: 'Microbiologia',
    title: 'Vírus: estrutura, reprodução e prevenção',
    grade: '2º ano',
    minutes: 100,
    summary: 'O que são os vírus, por que estão "na fronteira da vida", como se reproduzem (ciclos lítico e lisogênico) e como prevenir as viroses.',
    objectives: [
      'Descrever a estrutura de um vírus: material genético, capsídeo e envelope.',
      'Explicar por que os vírus são parasitas intracelulares obrigatórios.',
      'Diferenciar os ciclos lítico e lisogênico.',
      'Relacionar a estrutura do vírus a medidas de prevenção (vacina, higiene das mãos) e explicar por que antibiótico não trata virose.',
    ],
    sections: [
      {
        heading: 'Estrutura',
        text: 'Um vírus é material genético (DNA ou RNA, nunca os dois) protegido por uma capa de proteína, o capsídeo. Alguns, como o coronavírus e o vírus da gripe, têm por fora um envelope de lipídios com proteínas que se encaixam nos receptores das células.',
        bullets: ['Tamanho: 20 a 300 nm; só visíveis ao microscópio eletrônico.', 'Sabão e álcool 70% destroem o envelope: por isso lavar as mãos funciona.'],
        actions: [
          { label: 'Abrir o coronavírus', model: 'coronavirus' },
          { label: 'Envelope', structure: 'envelope' },
          { label: 'Espícula (proteína S)', structure: 'espicula' },
          { label: 'RNA viral', structure: 'rna-viral' },
          { label: 'Bacteriófago', model: 'bacteriofago' },
          { label: 'Capsídeo', structure: 'capsideo' },
        ],
      },
      {
        heading: 'Ciclo lítico',
        text: 'O fago se prende à bactéria (adsorção), injeta o DNA (penetração), o DNA viral comanda a célula para fabricar peças de vírus (síntese), as peças se juntam (montagem) e a célula se rompe (lise), liberando dezenas de vírus.',
        actions: [
          { label: 'Animação: ciclo lítico', process: 'ciclo-litico' },
          { label: 'Fibras da cauda', structure: 'fibras-cauda' },
          { label: 'Bainha contrátil', structure: 'bainha' },
        ],
      },
      {
        heading: 'Ciclo lisogênico',
        text: 'Em vez de destruir a célula, o DNA viral se integra ao cromossomo (prófago) e passa às células-filhas a cada divisão. Um estresse pode induzir o prófago a sair e iniciar o ciclo lítico. O HIV e o vírus da herpes têm comportamento parecido nas células humanas.',
        actions: [
          { label: 'Animação: ciclo lisogênico', process: 'ciclo-lisogenico' },
          { label: 'Prófago', structure: 'profago' },
        ],
      },
      {
        heading: 'Prevenção e tratamento',
        text: 'Vacinas apresentam ao sistema imune uma parte do vírus (como a espícula) ou o vírus inativado, para que ele produza anticorpos e células de memória. Antivirais atrapalham etapas do ciclo. Antibióticos atingem estruturas de bactérias, que os vírus não têm.',
        actions: [{ label: 'Comparar vírus e bactérias', tool: 'comparar' }],
      },
    ],
    keyTerms: ['Capsídeo', 'Envelope', 'Parasita intracelular obrigatório', 'Bacteriófago', 'Ciclo lítico', 'Ciclo lisogênico', 'Prófago', 'Vacina', 'Retrovírus'],
    questions: [
      { q: 'Por que o médico não receita antibiótico para gripe?', a: 'Porque a gripe é causada por vírus, e antibióticos agem em estruturas de bactérias (parede, ribossomos 70S) que os vírus não têm.' },
      { q: 'Por que os vírus são chamados de parasitas intracelulares obrigatórios?', a: 'Porque não têm metabolismo nem ribossomos: só conseguem se reproduzir usando a maquinaria de uma célula.' },
      { q: 'Qual a diferença entre ciclo lítico e lisogênico?', a: 'No lítico a célula fabrica vírus e se rompe logo; no lisogênico o DNA viral fica integrado ao cromossomo e é passado às filhas sem matar a célula.' },
    ],
    misconceptions: ['"Vírus são bactérias pequenas" — vírus não têm célula; bactérias são células completas.', '"Vacina é tratamento" — vacina previne; quem já está doente precisa de tratamento.'],
    refs: ['bio-21'],
  },
  {
    id: 'bacterias-estrutura',
    laboratoryId: LAB,
    unit: 'Microbiologia',
    title: 'Bactérias: estrutura, formas e reprodução',
    grade: '2º ano',
    minutes: 50,
    summary: 'A célula procarionte, as formas bacterianas, a reprodução por fissão binária e a troca de genes por conjugação.',
    objectives: [
      'Identificar as estruturas de uma bactéria e a função de cada uma.',
      'Reconhecer cocos, bacilos, espirilos e vibriões e os agrupamentos dos cocos.',
      'Calcular o crescimento de uma população por fissão binária.',
      'Explicar a conjugação e o papel dos plasmídeos.',
    ],
    sections: [
      {
        heading: 'A célula procarionte',
        text: 'A bactéria não tem núcleo: o cromossomo circular fica no nucleoide. Por fora da membrana há uma parede de peptidoglicano e, em algumas, uma cápsula. Flagelos permitem nadar; fímbrias, aderir. Plasmídeos levam genes extras.',
        actions: [
          { label: 'Abrir a bactéria', model: 'bacterias' },
          { label: 'Nucleoide', structure: 'nucleoide' },
          { label: 'Parede celular', structure: 'parede-bacteriana' },
          { label: 'Cápsula', structure: 'capsula' },
          { label: 'Plasmídeo', structure: 'plasmideo' },
          { label: 'Flagelo', structure: 'flagelo' },
        ],
      },
      {
        heading: 'Formas',
        text: 'Os cocos são esféricos e podem ficar aos pares (diplococos), em cadeia (estreptococos) ou em cacho (estafilococos). Bacilos são bastonetes, espirilos são espiralados e vibriões têm forma de vírgula.',
        actions: [
          { label: 'Estafilococo', structure: 'estafilococo' },
          { label: 'Estreptococo', structure: 'estreptococo' },
          { label: 'Vibrião (cólera)', structure: 'vibriao' },
        ],
      },
      {
        heading: 'Reprodução e troca de genes',
        text: 'Bactérias se reproduzem por fissão binária: o cromossomo é copiado e a célula se divide em duas iguais. Em condições ideais, E. coli faz isso a cada 20 minutos: crescimento exponencial. A variabilidade vem de mutações e da troca de genes, como na conjugação, em que um plasmídeo passa de uma bactéria a outra pelo pilus sexual.',
        actions: [
          { label: 'Crescimento bacteriano', tool: 'crescimento' },
          { label: 'Animação: conjugação', process: 'conjugacao' },
          { label: 'Pilus sexual', structure: 'pilus-sexual' },
        ],
      },
    ],
    keyTerms: ['Procarionte', 'Nucleoide', 'Plasmídeo', 'Peptidoglicano', 'Coco', 'Bacilo', 'Fissão binária', 'Conjugação'],
    questions: [
      { q: 'Começando com 1 bactéria que se divide a cada 20 min, quantas haverá em 2 horas?', a: '2 h = 6 gerações; 2⁶ = 64 bactérias.' },
      { q: 'A conjugação aumenta o número de bactérias?', a: 'Não: é troca de genes, não reprodução. Ela aumenta a variabilidade.' },
    ],
    misconceptions: ['"Toda bactéria causa doença" — a imensa maioria é inofensiva ou útil (decompositores, microbiota, iogurte).'],
    refs: ['bio-22'],
  },
  {
    id: 'resistencia-antibioticos',
    laboratoryId: LAB,
    unit: 'Microbiologia',
    title: 'Antibióticos e resistência bacteriana',
    grade: '2º ano',
    minutes: 50,
    summary: 'Como os antibióticos funcionam e como o uso errado seleciona bactérias resistentes: seleção natural acontecendo em dias.',
    objectives: [
      'Explicar como os antibióticos atingem as bactérias sem atingir nossas células.',
      'Descrever a seleção de bactérias resistentes como um exemplo de seleção natural.',
      'Relacionar plasmídeos e conjugação à disseminação da resistência.',
      'Propor atitudes de uso responsável de antibióticos.',
    ],
    sections: [
      {
        heading: 'Como funcionam',
        text: 'Antibióticos atacam o que é exclusivo das bactérias: a penicilina impede a construção da parede de peptidoglicano; a tetraciclina trava os ribossomos 70S. Alexander Fleming descobriu a penicilina em 1928, num bolor do gênero Penicillium.',
        actions: [
          { label: 'Parede bacteriana', structure: 'parede-bacteriana' },
          { label: 'Ribossomos', structure: 'ribossomos' },
          { label: 'Bolor (Penicillium e Rhizopus)', model: 'bolor' },
        ],
      },
      {
        heading: 'Seleção das resistentes',
        text: 'Numa população grande, algumas bactérias já são resistentes por mutação ou por genes recebidos. O antibiótico mata as sensíveis, e as resistentes, sem concorrência, se multiplicam. O antibiótico não causa a resistência: ele a seleciona.',
        actions: [
          { label: 'Animação: resistência', process: 'resistencia' },
          { label: 'Bactéria resistente', structure: 'bacteria-resistente' },
          { label: 'Conjugação', process: 'conjugacao' },
        ],
      },
      {
        heading: 'Uso responsável',
        text: 'Tomar antibiótico só com receita, na dose e pelo tempo indicados, não usar sobras nem tratar gripe e resfriado com antibiótico. Hospitais controlam infecções e o uso de antibióticos na criação de animais também é um problema.',
        bullets: ['Debate: por que surgem "superbactérias" em hospitais?'],
      },
    ],
    keyTerms: ['Antibiótico', 'Penicilina', 'Resistência', 'Seleção natural', 'Plasmídeo R', 'Superbactéria'],
    questions: [
      { q: 'Por que parar o antibiótico antes do tempo favorece a resistência?', a: 'Porque morrem primeiro as mais sensíveis; as que sobram (mais resistentes) voltam a se multiplicar.' },
      { q: 'Como uma bactéria que nunca teve contato com o antibiótico pode ser resistente?', a: 'Recebendo um plasmídeo com o gene de resistência de outra bactéria (conjugação) ou por mutação ao acaso.' },
    ],
    misconceptions: ['"O corpo da pessoa fica resistente ao antibiótico" — quem fica resistente são as bactérias.'],
    refs: ['bio-22'],
  },
  {
    id: 'fungos',
    laboratoryId: LAB,
    unit: 'Microbiologia',
    title: 'Fungos: leveduras, bolores e cogumelos',
    grade: '2º ano',
    minutes: 50,
    summary: 'Características do reino Fungi, organização em hifas e micélio, reprodução por esporos e brotamento, fermentação e importância ecológica e econômica.',
    objectives: [
      'Caracterizar os fungos: eucariontes, heterótrofos por absorção, parede de quitina.',
      'Diferenciar levedura (unicelular) de fungos filamentosos (hifas e micélio).',
      'Descrever a reprodução por brotamento e por esporos.',
      'Citar exemplos de importância dos fungos (decomposição, fermentação, antibióticos, micoses).',
    ],
    sections: [
      {
        heading: 'Leveduras e fermentação',
        text: 'A levedura do pão e da cerveja é um fungo unicelular. Sem oxigênio, faz fermentação alcoólica: açúcar → álcool + gás carbônico. Reproduz-se por brotamento: um broto cresce, recebe um núcleo e se solta, deixando uma cicatriz.',
        actions: [
          { label: 'Abrir a levedura', model: 'levedura' },
          { label: 'Animação: brotamento', process: 'brotamento' },
          { label: 'Parede de quitina', structure: 'parede-celular-fungica' },
        ],
      },
      {
        heading: 'Hifas, micélio e esporos',
        text: 'A maioria dos fungos é formada por filamentos, as hifas; o conjunto delas é o micélio. O bolor do pão forma esporângios cheios de esporos, que o ar espalha. O cogumelo é só o corpo de frutificação: o micélio fica no solo.',
        actions: [
          { label: 'Bolor do pão', model: 'bolor' },
          { label: 'Hifas', structure: 'hifas' },
          { label: 'Esporângio', structure: 'esporangio' },
          { label: 'Cogumelo', model: 'cogumelo' },
          { label: 'Lamelas', structure: 'lamelas' },
          { label: 'Micélio', structure: 'micelio' },
        ],
      },
      {
        heading: 'Importância',
        text: 'Com as bactérias, os fungos decompõem a matéria orgânica e reciclam nutrientes. Formam micorrizas com raízes e liquens com algas. Produzem antibióticos, queijos, pão e bebidas. Alguns causam micoses (pé de atleta, candidíase) e outros são venenosos.',
        actions: [{ label: 'Comparar fungos e bactérias', tool: 'comparar' }],
      },
    ],
    keyTerms: ['Quitina', 'Heterótrofo por absorção', 'Hifa', 'Micélio', 'Esporo', 'Brotamento', 'Fermentação', 'Micorriza', 'Líquen'],
    questions: [
      { q: 'Por que o pão cresce com fermento biológico?', a: 'A levedura fermenta o açúcar e libera gás carbônico, que fica preso na massa.' },
      { q: 'Por que fungos não são plantas?', a: 'Não fazem fotossíntese, têm parede de quitina (não celulose) e guardam glicogênio, não amido.' },
    ],
    misconceptions: ['"O cogumelo é o fungo inteiro" — é só o corpo reprodutivo; o fungo é principalmente o micélio.'],
    refs: ['bio-24'],
  },
  {
    id: 'protozoarios',
    laboratoryId: LAB,
    unit: 'Microbiologia',
    title: 'Protozoários e algas unicelulares',
    grade: '2º ano',
    minutes: 50,
    summary: 'Ameba, paramécio e euglena: locomoção, nutrição, osmorregulação e a fronteira entre "protozoário" e "alga"; doenças causadas por protozoários.',
    objectives: [
      'Relacionar pseudópodes, cílios e flagelos à locomoção dos protistas.',
      'Explicar a fagocitose e a digestão intracelular.',
      'Explicar a função do vacúolo contrátil em protistas de água doce.',
      'Citar doenças causadas por protozoários e suas formas de prevenção.',
    ],
    sections: [
      {
        heading: 'Ameba e fagocitose',
        text: 'A ameba se move e captura alimento com pseudópodes. Ela envolve a presa, forma um vacúolo digestivo, digere o alimento e elimina os restos. O vacúolo contrátil expulsa o excesso de água que entra por osmose.',
        actions: [
          { label: 'Abrir a ameba', model: 'ameba' },
          { label: 'Animação: fagocitose', process: 'fagocitose' },
          { label: 'Pseudópode', structure: 'pseudopode' },
          { label: 'Vacúolo contrátil', structure: 'vacuolo-contratil' },
        ],
      },
      {
        heading: 'Paramécio',
        text: 'Coberto de cílios, o paramécio nada rápido e leva bactérias ao sulco oral e ao citóstoma. Tem macronúcleo (controla a célula) e micronúcleo (reprodução) e dois vacúolos contráteis em forma de estrela.',
        actions: [
          { label: 'Abrir o paramécio', model: 'paramecio' },
          { label: 'Cílios', structure: 'cilios' },
          { label: 'Macronúcleo', structure: 'macronucleo' },
          { label: 'Sulco oral', structure: 'sulco-oral' },
        ],
      },
      {
        heading: 'Euglena: alga ou protozoário?',
        text: 'A euglena tem cloroplastos e faz fotossíntese, mas também nada com um flagelo e pode absorver alimento no escuro. O estigma percebe a direção da luz. É um bom exemplo de que os protistas não se dividem facilmente em "algas" e "protozoários".',
        actions: [
          { label: 'Abrir a euglena', model: 'euglena' },
          { label: 'Estigma', structure: 'estigma' },
          { label: 'Cloroplastos', structure: 'cloroplasto' },
        ],
      },
      {
        heading: 'Saúde',
        text: 'Malária (plasmódio, mosquito Anopheles), doença de Chagas (Trypanosoma cruzi, barbeiro), leishmaniose (mosquito-palha), amebíase e giardíase (água e alimentos contaminados) e toxoplasmose (fezes de gato, carne crua). Prevenção: saneamento, água tratada, higiene dos alimentos e controle dos vetores.',
        actions: [{ label: 'Escala de tamanhos', tool: 'escala' }],
      },
    ],
    keyTerms: ['Pseudópode', 'Cílio', 'Flagelo', 'Fagocitose', 'Vacúolo contrátil', 'Osmorregulação', 'Mixotrófico', 'Vetor'],
    questions: [
      { q: 'Por que protozoários marinhos geralmente não têm vacúolo contrátil?', a: 'Porque a água do mar tem concentração de sais parecida com a do citoplasma: quase não entra água por osmose.' },
      { q: 'O que a ameba e um macrófago humano têm em comum?', a: 'Os dois englobam partículas por fagocitose usando pseudópodes.' },
    ],
    refs: ['bio-23'],
  },
  {
    id: 'microbios-e-nos',
    laboratoryId: LAB,
    unit: 'Microbiologia',
    title: 'O mundo microscópico: tamanhos e comparação',
    grade: '1º ano',
    minutes: 50,
    summary: 'Aula de revisão: a escala do invisível (nm, µm, mm), o que separa vírus de bactérias, fungos e protistas, e o crescimento exponencial.',
    objectives: [
      'Converter e comparar tamanhos em nanômetros, micrômetros e milímetros.',
      'Organizar as diferenças entre vírus, bactérias, fungos, protozoários e algas.',
      'Interpretar um gráfico de crescimento exponencial.',
    ],
    sections: [
      {
        heading: 'Do nanômetro ao milímetro',
        text: 'Um coronavírus mede cerca de 100 nm; uma bactéria, 2 µm (20 vezes mais); uma ameba, 0,5 mm (250 vezes mais que a bactéria). O microscópio óptico enxerga até cerca de 0,2 µm; abaixo disso, só o eletrônico.',
        actions: [{ label: 'Escala de tamanhos', tool: 'escala' }],
      },
      {
        heading: 'Quem é quem',
        text: 'Vírus não têm célula; bactérias são procariontes; fungos, protozoários e algas são eucariontes. Use a tabela para comparar dois grupos de cada vez e montar um quadro-resumo com a turma.',
        actions: [
          { label: 'Comparar grupos', tool: 'comparar' },
          { label: 'Bactérias', model: 'bacterias' },
          { label: 'Coronavírus', model: 'coronavirus' },
          { label: 'Levedura', model: 'levedura' },
          { label: 'Paramécio', model: 'paramecio' },
        ],
      },
      {
        heading: 'Crescimento exponencial',
        text: 'Uma bactéria que se divide a cada 20 minutos gera mais de 16 milhões de descendentes em 8 horas. Mude o tempo de geração e observe a curva; na escala logarítmica ela vira uma reta.',
        actions: [{ label: 'Crescimento bacteriano', tool: 'crescimento' }],
      },
    ],
    keyTerms: ['Nanômetro', 'Micrômetro', 'Escala logarítmica', 'Procarionte', 'Eucarionte', 'Crescimento exponencial'],
    questions: [
      { q: 'Quantos micrômetros tem 1 milímetro?', a: '1000 µm.' },
      { q: 'Por que não conseguimos ver um vírus no microscópio óptico da escola?', a: 'Porque ele é menor que o limite de resolução do microscópio óptico (cerca de 0,2 µm).' },
    ],
    refs: ['bio-21', 'bio-22'],
  },
];
