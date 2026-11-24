/**
 * Lesson scripts for the Genetics laboratory (pt-BR). Original text for
 * BioLab 3D, checked against OpenStax Biology 2e (CC BY 4.0), chapters 12–15.
 * Requires review by a qualified Biology educator before commercial release.
 */
import type { Lesson } from './types';

const LAB = 'genetica' as const;

export const GENETICS_LESSONS: Lesson[] = [
  {
    id: 'acidos-nucleicos',
    laboratoryId: LAB,
    unit: 'Genética molecular',
    title: 'Ácidos nucleicos: a estrutura do DNA e do RNA',
    grade: '1º ano',
    minutes: 50,
    summary: 'Do nucleotídeo à dupla-hélice: composição química, pareamento de bases, fitas antiparalelas e as diferenças entre DNA e RNA.',
    objectives: [
      'Identificar as três partes de um nucleotídeo.',
      'Diferenciar purinas e pirimidinas e aplicar as regras de pareamento (A–T, G–C).',
      'Descrever a dupla-hélice: fitas antiparalelas, esqueleto de açúcar-fosfato e ligações de hidrogênio.',
      'Comparar DNA e RNA quanto ao açúcar, às bases, ao número de fitas e à função.',
    ],
    sections: [
      {
        heading: 'O nucleotídeo',
        text: 'Todo ácido nucleico é uma fila de nucleotídeos. Cada um tem um grupo fosfato, uma pentose (desoxirribose no DNA, ribose no RNA) e uma base nitrogenada. As bases com dois anéis são purinas (adenina e guanina); as com um anel são pirimidinas (timina, citosina e uracila).',
        actions: [
          { label: 'Abrir os nucleotídeos', model: 'nucleotideo' },
          { label: 'Fosfato', structure: 'fosfato' },
          { label: 'Desoxirribose', structure: 'desoxirribose' },
          { label: 'Ribose (–OH no carbono 2′)', structure: 'ribose' },
          { label: 'Adenina (purina)', structure: 'adenina' },
          { label: 'Timina (pirimidina)', structure: 'timina' },
        ],
      },
      {
        heading: 'A dupla-hélice',
        text: 'Watson e Crick (1953), com os dados de Rosalind Franklin, descreveram o DNA como duas fitas enroladas em hélice para a direita. O esqueleto de açúcar-fosfato fica por fora e as bases por dentro, pareadas sempre uma purina com uma pirimidina: A com T (duas ligações de hidrogênio) e G com C (três). As fitas são antiparalelas: uma corre de 5′ para 3′ e a outra de 3′ para 5′.',
        bullets: ['Regra de Chargaff: %A = %T e %G = %C.', 'Uma volta completa tem cerca de 10 pares de bases (3,4 nm).', 'A sequência de uma fita determina a da outra (fitas complementares).'],
        actions: [
          { label: 'Dupla-hélice', model: 'dna' },
          { label: 'Esqueleto de açúcar-fosfato', structure: 'esqueleto-acucar-fosfato' },
          { label: 'Ligações de hidrogênio', structure: 'ligacoes-hidrogenio' },
          { label: 'Guanina', structure: 'guanina' },
          { label: 'Citosina', structure: 'citosina' },
        ],
      },
      {
        heading: 'DNA × RNA',
        text: 'O RNA tem ribose, uracila no lugar da timina e, em geral, uma só fita. Há vários tipos: o RNA mensageiro (mRNA) leva a receita da proteína, o transportador (tRNA) traz os aminoácidos e o ribossômico (rRNA) forma o ribossomo.',
        actions: [
          { label: 'Abrir o RNA', model: 'rna' },
          { label: 'Uracila', structure: 'uracila' },
          { label: 'mRNA', structure: 'rna-mensageiro' },
          { label: 'tRNA', structure: 'rna-transportador' },
        ],
      },
    ],
    keyTerms: ['Nucleotídeo', 'Pentose', 'Purina', 'Pirimidina', 'Dupla-hélice', 'Fitas antiparalelas', 'Ligação de hidrogênio', 'Regra de Chargaff'],
    questions: [
      { q: 'Um DNA tem 30% de adenina. Quanto tem de guanina?', a: 'A = T = 30%, então A + T = 60%; sobram 40% para G + C, ou seja, 20% de guanina.' },
      { q: 'Se uma fita tem a sequência 5′-ATGC-3′, qual é a fita complementar?', a: '3′-TACG-5′ (ou, escrita de 5′ para 3′, GCAT).' },
      { q: 'Por que o par G–C é mais difícil de separar que o par A–T?', a: 'Porque G e C fazem três ligações de hidrogênio, e A e T só duas.' },
    ],
    misconceptions: ['"O DNA é formado por proteínas" — é formado por nucleotídeos; no cromossomo ele se associa a proteínas (histonas).', '"RNA é DNA de fita simples" — além de uma fita, ele tem outro açúcar (ribose) e uracila no lugar da timina.'],
    refs: ['bio-14'],
  },
  {
    id: 'replicacao-dna',
    laboratoryId: LAB,
    unit: 'Genética molecular',
    title: 'Replicação do DNA',
    grade: '1º ano',
    minutes: 50,
    summary: 'Como o DNA se copia antes da divisão celular: forquilha, enzimas, fitas contínua e descontínua e o modelo semiconservativo.',
    objectives: [
      'Explicar por que a replicação é semiconservativa.',
      'Relacionar cada enzima (helicase, primase, DNA polimerase, ligase, topoisomerase) à sua função.',
      'Explicar por que uma das fitas é feita em fragmentos de Okazaki.',
    ],
    sections: [
      {
        heading: 'Abrir a dupla-hélice',
        text: 'A replicação começa nas origens de replicação, durante a fase S da interfase. A helicase rompe as ligações de hidrogênio e abre a forquilha; a topoisomerase alivia a torção à frente. A primase coloca um primer de RNA, porque a DNA polimerase só consegue alongar uma fita já iniciada.',
        actions: [
          { label: 'Abrir a replicação', model: 'replicacao' },
          { label: 'Helicase', structure: 'helicase' },
          { label: 'Primer de RNA', structure: 'primer-rna' },
          { label: 'Animação da replicação', process: 'replicacao' },
        ],
      },
      {
        heading: 'Fita contínua e fita descontínua',
        text: 'A DNA polimerase só monta fitas no sentido 5′ → 3′. Como as fitas-molde são antiparalelas, uma fita nova acompanha a forquilha (líder, contínua) e a outra é feita em pedaços no sentido contrário (tardia, descontínua), os fragmentos de Okazaki. Depois os primers viram DNA e a DNA ligase sela as emendas.',
        actions: [
          { label: 'DNA polimerase', structure: 'dna-polimerase' },
          { label: 'Fita nova', structure: 'fita-nova' },
          { label: 'DNA ligase', structure: 'dna-ligase' },
        ],
      },
      {
        heading: 'Semiconservativa',
        text: 'Cada molécula-filha tem uma fita antiga e uma nova. Meselson e Stahl provaram isso em 1958 cultivando bactérias com nitrogênio pesado (¹⁵N) e depois leve (¹⁴N): após uma geração, todo o DNA tinha densidade intermediária.',
        bullets: ['Erro: cerca de 1 a cada bilhão de bases, graças à revisão da polimerase.', 'Aplicações: PCR (testes de covid-19, perícia, paternidade).'],
        actions: [{ label: 'Fita-molde (antiga)', structure: 'fita-molde' }],
      },
    ],
    keyTerms: ['Forquilha de replicação', 'Helicase', 'Primer', 'DNA polimerase', 'Fita líder', 'Fita tardia', 'Fragmentos de Okazaki', 'DNA ligase', 'Semiconservativa'],
    questions: [
      { q: 'Por que se diz que a replicação é semiconservativa?', a: 'Porque cada DNA-filho conserva uma das fitas do DNA original e tem uma fita nova.' },
      { q: 'Por que existem fragmentos de Okazaki?', a: 'Porque a polimerase só trabalha de 5′ para 3′; na fita tardia esse sentido aponta para longe da forquilha, então a fita é feita em pedaços.' },
    ],
    misconceptions: ['"A replicação acontece durante a mitose" — acontece antes, na fase S da interfase.'],
    refs: ['bio-14'],
  },
  {
    id: 'sintese-proteinas',
    laboratoryId: LAB,
    unit: 'Genética molecular',
    title: 'Do gene à proteína: transcrição, tradução e código genético',
    grade: '1º ano',
    minutes: 100,
    summary: 'O dogma central da Biologia Molecular: o DNA é transcrito em RNA, que é traduzido em proteína segundo o código genético.',
    objectives: [
      'Descrever as etapas da transcrição e o processamento do RNA em eucariontes.',
      'Usar a tabela do código genético para traduzir um mRNA.',
      'Explicar o papel do mRNA, do tRNA e do ribossomo na tradução.',
      'Identificar o códon de início e os códons de parada.',
    ],
    sections: [
      {
        heading: 'Transcrição',
        text: 'No núcleo, a RNA polimerase se liga ao promotor, abre o DNA e monta um RNA complementar à fita-molde, de 5′ para 3′, até o terminador. Onde o molde tem A, o RNA recebe U. Nos eucariontes o pré-mRNA ganha um cap na ponta 5′, uma cauda poli-A na 3′ e perde os íntrons (splicing).',
        actions: [
          { label: 'Abrir a transcrição', model: 'transcricao' },
          { label: 'Animação da transcrição', process: 'transcricao' },
          { label: 'RNA polimerase', structure: 'rna-polimerase' },
          { label: 'Promotor', structure: 'promotor' },
          { label: 'Íntron', structure: 'intron' },
        ],
      },
      {
        heading: 'Código genético',
        text: 'O mRNA é lido em trincas, os códons: 64 combinações para 20 aminoácidos. O código é universal (o mesmo em quase todos os seres vivos) e degenerado (vários códons por aminoácido). AUG é o códon de início (metionina); UAA, UAG e UGA são de parada.',
        bullets: ['Atividade: digite a fita-molde TAC CAA GCC TTT ACC ATT no código genético e traduza com a turma.'],
        actions: [
          { label: 'Abrir o código genético', tool: 'codigo' },
          { label: 'Códon', structure: 'codon' },
          { label: 'Anticódon', structure: 'anticodon' },
        ],
      },
      {
        heading: 'Tradução',
        text: 'No citoplasma, o ribossomo se prende ao mRNA no códon AUG. Cada tRNA traz um aminoácido e tem um anticódon que pareia com o códon. O ribossomo une os aminoácidos (ligação peptídica) e anda de códon em códon até um códon de parada, quando o fator de liberação solta a proteína.',
        actions: [
          { label: 'Abrir a tradução', model: 'traducao' },
          { label: 'Animação da tradução', process: 'traducao' },
          { label: 'Ribossomo', structure: 'ribossomo' },
          { label: 'tRNA', structure: 'rna-transportador' },
          { label: 'Polipeptídeo', structure: 'polipeptideo' },
        ],
      },
    ],
    keyTerms: ['Dogma central', 'Transcrição', 'Promotor', 'Splicing', 'Íntron e éxon', 'Códon', 'Anticódon', 'Ribossomo', 'Código genético'],
    questions: [
      { q: 'A fita-molde de um gene é 3′-TAC GGA-5′. Qual o mRNA e os aminoácidos?', a: 'mRNA 5′-AUG CCU-3′ → metionina e prolina.' },
      { q: 'Por que o mesmo DNA está em todas as células, mas elas fazem proteínas diferentes?', a: 'Porque cada tipo de célula transcreve só alguns genes (regulação da expressão gênica).' },
      { q: 'Onde acontece a transcrição e onde acontece a tradução nos eucariontes?', a: 'Transcrição no núcleo; tradução no citoplasma (ribossomos livres ou do retículo rugoso).' },
    ],
    misconceptions: ['"Cada códon tem um único tRNA e cada aminoácido um único códon" — o código é degenerado: a maioria dos aminoácidos tem vários códons.', '"O gene é a proteína" — o gene é um trecho de DNA com a informação; a proteína é o produto.'],
    refs: ['bio-15'],
  },
  {
    id: 'mutacoes',
    laboratoryId: LAB,
    unit: 'Genética molecular',
    title: 'Mutações gênicas',
    grade: '1º ano',
    minutes: 50,
    summary: 'Tipos de mutação pontual e seus efeitos na proteína, com o exemplo da anemia falciforme.',
    objectives: [
      'Diferenciar substituição, inserção e deleção.',
      'Explicar mutação silenciosa, de sentido trocado e sem sentido.',
      'Explicar a mudança da matriz de leitura (frameshift).',
      'Relacionar mutação, variabilidade genética e evolução.',
    ],
    sections: [
      {
        heading: 'Substituições',
        text: 'Trocar uma base pode não mudar nada (silenciosa, graças à degeneração do código), trocar um aminoácido (como na anemia falciforme: GAG → GTG, ácido glutâmico → valina) ou criar um códon de parada (sem sentido), encurtando a proteína.',
        actions: [
          { label: 'Abrir as mutações', model: 'mutacao' },
          { label: 'Animação das mutações', process: 'mutacao' },
          { label: 'Mutação', structure: 'mutacao' },
          { label: 'Proteína', structure: 'proteina' },
        ],
      },
      {
        heading: 'Inserções e deleções',
        text: 'Ganhar ou perder uma base desloca a leitura de três em três a partir daquele ponto: todos os códons seguintes mudam (frameshift) e, em geral, a proteína perde a função. Inserir ou retirar três bases tira ou acrescenta só um aminoácido.',
        actions: [{ label: 'Código genético', tool: 'codigo' }],
      },
      {
        heading: 'Causas e consequências',
        text: 'Mutações surgem de erros na replicação ou de agentes mutagênicos (radiação UV, raios X, substâncias do cigarro). Nas células do corpo podem levar ao câncer; nas que formam gametas passam aos filhos. São a fonte original da variabilidade sobre a qual age a seleção natural.',
      },
    ],
    keyTerms: ['Mutação pontual', 'Substituição', 'Inserção', 'Deleção', 'Frameshift', 'Mutação silenciosa', 'Mutação sem sentido', 'Agente mutagênico'],
    questions: [
      { q: 'Por que uma deleção de uma base costuma ser mais grave que uma substituição?', a: 'Porque desloca a matriz de leitura e muda todos os aminoácidos seguintes, não só um.' },
      { q: 'Toda mutação é prejudicial?', a: 'Não: muitas são neutras ou silenciosas, e algumas trazem vantagem (fonte da evolução).' },
    ],
    misconceptions: ['"Mutações sempre passam para os filhos" — só as que ocorrem em células que formam gametas.'],
    refs: ['bio-15'],
  },
  {
    id: 'cromossomos-genes',
    laboratoryId: LAB,
    unit: 'Genética',
    title: 'Cromossomos, genes e alelos',
    grade: '3º ano',
    minutes: 50,
    summary: 'Como o DNA se compacta até o cromossomo, o que são genes, alelos, homólogos, cariótipo e cromátides-irmãs.',
    objectives: [
      'Descrever os níveis de compactação do DNA.',
      'Identificar centrômero, cromátides-irmãs, telômeros e cinetocoro.',
      'Diferenciar cromátides-irmãs de cromossomos homólogos.',
      'Conceituar gene, lócus, alelo, genótipo e fenótipo.',
    ],
    sections: [
      {
        heading: 'Do DNA ao cromossomo',
        text: 'O DNA se enrola em histonas formando nucleossomos ("colar de contas"), que se enrolam numa fibra de cromatina; antes da divisão, a cromatina se condensa ainda mais e forma o cromossomo metafásico, com duas cromátides-irmãs unidas pelo centrômero.',
        actions: [
          { label: 'Abrir o cromossomo', model: 'cromossomo' },
          { label: 'Histonas e nucleossomos', structure: 'histonas' },
          { label: 'Fibra de cromatina', structure: 'fibra-cromatina' },
          { label: 'Cromátides-irmãs', structure: 'cromatide-irma' },
          { label: 'Centrômero', structure: 'centromero' },
          { label: 'Telômeros', structure: 'telomero' },
        ],
      },
      {
        heading: 'Genes e alelos',
        text: 'Gene é o trecho do DNA com a informação de um RNA/proteína; o lugar dele no cromossomo é o lócus. Cromossomos homólogos (um da mãe, outro do pai) têm os mesmos genes nos mesmos lócus, mas podem ter versões diferentes, os alelos. Dois alelos iguais: homozigoto; diferentes: heterozigoto.',
        bullets: ['Humanos: 46 cromossomos, 22 pares de autossomos e 1 par sexual (XX ou XY).', 'Genótipo: os alelos; fenótipo: a característica observada (genótipo + ambiente).'],
        actions: [
          { label: 'Gene (lócus)', structure: 'gene' },
          { label: 'Quadro de Punnett', tool: 'punnett' },
        ],
      },
    ],
    keyTerms: ['Nucleossomo', 'Cromatina', 'Cromátides-irmãs', 'Centrômero', 'Telômero', 'Lócus', 'Alelo', 'Homozigoto', 'Heterozigoto', 'Cariótipo'],
    questions: [
      { q: 'Cromátides-irmãs podem ter alelos diferentes de um gene?', a: 'Não (salvo mutação ou crossing-over): são cópias idênticas feitas na replicação.' },
      { q: 'Quantos cromossomos tem um gameta humano?', a: '23, um de cada par (célula haploide).' },
    ],
    refs: ['bio-13'],
  },
  {
    id: 'leis-de-mendel',
    laboratoryId: LAB,
    unit: 'Genética',
    title: 'Leis de Mendel e padrões de herança',
    grade: '3º ano',
    minutes: 100,
    summary: 'Monoibridismo e diibridismo com o quadro de Punnett, e padrões além de Mendel: dominância incompleta, codominância, alelos múltiplos (ABO) e herança ligada ao X.',
    objectives: [
      'Aplicar a 1ª lei de Mendel (segregação) e montar um quadro de Punnett.',
      'Calcular proporções genotípicas e fenotípicas (3 : 1 e 1 : 2 : 1).',
      'Aplicar a 2ª lei (segregação independente) e obter 9 : 3 : 3 : 1.',
      'Resolver problemas de grupos sanguíneos ABO e de daltonismo.',
    ],
    sections: [
      {
        heading: '1ª lei: segregação dos fatores',
        text: 'Mendel cruzou ervilhas puras amarelas (AA) e verdes (aa): a geração F1 foi toda amarela (Aa). Cruzando a F1 entre si (Aa × Aa), reapareceu o verde na proporção 3 amarelas : 1 verde. Cada indivíduo tem dois alelos para cada característica, que se separam na formação dos gametas: cada gameta leva só um.',
        actions: [{ label: 'Quadro de Punnett: Aa × Aa', tool: 'punnett' }],
      },
      {
        heading: '2ª lei: segregação independente',
        text: 'Genes em cromossomos diferentes se separam de forma independente. AaBb (amarela e lisa) × AaBb dá 16 combinações e a proporção 9 : 3 : 3 : 1. Na célula, isso corresponde à orientação ao acaso dos pares de homólogos na metáfase I da meiose.',
        actions: [{ label: 'Diibridismo no quadro', tool: 'punnett' }],
      },
      {
        heading: 'Além de Mendel',
        text: 'Dominância incompleta: o heterozigoto é intermediário (maravilha VB rosa). Codominância e alelos múltiplos: no sistema ABO, Iᴬ e Iᴮ se expressam juntos (tipo AB) e dominam i. Herança ligada ao X: o daltonismo e a hemofilia aparecem mais em homens, que têm um só X.',
        bullets: ['Pais Iᴬi × Iᴮi podem ter filhos A, B, AB e O.', 'Mãe portadora (XᴰXᵈ) × pai normal: metade dos meninos pode ser daltônica.'],
        actions: [
          { label: 'Quadro de Punnett', tool: 'punnett' },
          { label: 'Gene (lócus)', structure: 'gene' },
        ],
      },
    ],
    keyTerms: ['Monoibridismo', 'Diibridismo', 'Dominante', 'Recessivo', 'Homozigoto', 'Heterozigoto', 'Proporção 3 : 1', 'Proporção 9 : 3 : 3 : 1', 'Codominância', 'Alelos múltiplos', 'Herança ligada ao X'],
    questions: [
      { q: 'Um casal Aa × Aa tem 4 filhos. Obrigatoriamente 3 terão o fenótipo dominante?', a: 'Não: 3/4 é a probabilidade para cada filho; em famílias pequenas o resultado varia.' },
      { q: 'Um homem tipo AB pode ser pai de uma criança tipo O?', a: 'Não: ele não tem o alelo i para transmitir.' },
      { q: 'Por que o daltonismo é mais comum em homens?', a: 'Porque o gene está no X; o homem tem um só X, então um alelo recessivo já se manifesta.' },
    ],
    misconceptions: ['"O alelo dominante é o mais comum na população" — dominância não tem relação com frequência.', '"O filho herda mais do pai ou da mãe" — recebe metade dos cromossomos de cada (o DNA das mitocôndrias vem só da mãe).'],
    refs: ['bio-12', 'bio-13'],
  },
];
