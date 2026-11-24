/**
 * Lesson scripts for the Animals laboratory (pt-BR). Original text for
 * BioLab 3D, checked against OpenStax Biology 2e (CC BY 4.0), chapters 27–29,
 * 40 and 43. Requires review by a qualified Biology educator before
 * commercial release.
 */
import type { Lesson } from './types';

const LAB = 'animais' as const;

export const ANIMAL_LESSONS: Lesson[] = [
  {
    id: 'animais-classificacao',
    laboratoryId: LAB,
    unit: 'Zoologia',
    title: 'Diversidade e classificação dos animais',
    grade: '2º ano',
    minutes: 100,
    summary: 'O que todos os animais têm em comum e os critérios usados para classificá-los: tecidos, simetria, folhetos germinativos, celoma e destino do blastóporo.',
    objectives: [
      'Listar as características comuns a todos os animais.',
      'Diferenciar simetria radial e bilateral e relacionar a simetria bilateral à cefalização.',
      'Classificar os animais em diblásticos e triblásticos, acelomados, pseudocelomados e celomados, protostômios e deuterostômios.',
      'Usar uma chave dicotômica e ler uma árvore filogenética simples.',
    ],
    sections: [
      {
        heading: 'O que é um animal',
        text: 'Animais são eucariontes multicelulares e heterótrofos: obtêm energia comendo outros seres vivos. Não têm parede celular, a maioria se movimenta em alguma fase da vida e quase todos passam por um embrião em forma de blástula. São conhecidas cerca de 1,5 milhão de espécies, e mais de 95% são invertebrados.',
        actions: [
          { label: 'Esponja: o animal mais simples', model: 'esponja' },
          { label: 'Árvore evolutiva', tool: 'arvore' },
        ],
      },
      {
        heading: 'Tecidos e simetria',
        text: 'As esponjas não têm tecidos verdadeiros. Os cnidários têm tecidos e simetria radial: qualquer plano que passe pelo eixo divide o corpo em partes iguais, bom para quem vive fixo ou flutuando. A partir dos platelmintos a simetria é bilateral: há frente e trás, dorso e ventre, e os nervos e órgãos dos sentidos se concentram na cabeça (cefalização).',
        actions: [
          { label: 'Hidra (simetria radial)', model: 'hidra' },
          { label: 'Planária (simetria bilateral)', model: 'planaria' },
          { label: 'Gânglios cerebrais', structure: 'ganglios-cerebrais' },
        ],
      },
      {
        heading: 'Folhetos germinativos e celoma',
        text: 'No embrião se formam camadas de células, os folhetos. Cnidários têm dois (ectoderme e endoderme: diblásticos); os demais têm também a mesoderme (triblásticos). O celoma é a cavidade do corpo revestida por mesoderme: os platelmintos não têm (acelomados), os nematódeos têm um falso celoma (pseudocelomados) e anelídeos, moluscos, artrópodes, equinodermos e cordados têm celoma verdadeiro.',
        actions: [
          { label: 'Animação: os três folhetos', process: 'desenvolvimento-embrionario' },
          { label: 'Mesoderme', structure: 'mesoderme' },
          { label: 'Septos do celoma (minhoca)', structure: 'septos' },
        ],
      },
      {
        heading: 'Protostômios e deuterostômios',
        text: 'Na gastrulação, o blastóporo vira a boca nos protostômios (platelmintos, anelídeos, moluscos, nematódeos, artrópodes) e o ânus nos deuterostômios (equinodermos e cordados). Por isso a estrela-do-mar é mais aparentada conosco do que a minhoca ou o inseto.',
        actions: [
          { label: 'Blastóporo', structure: 'blastoporo' },
          { label: 'Chave de identificação', tool: 'chave' },
          { label: 'Comparar os grupos', tool: 'comparar' },
        ],
      },
    ],
    keyTerms: ['Heterótrofo', 'Simetria radial', 'Simetria bilateral', 'Cefalização', 'Diblástico', 'Triblástico', 'Celoma', 'Protostômio', 'Deuterostômio', 'Chave dicotômica'],
    questions: [
      { q: 'Por que a simetria bilateral costuma vir junto com a cefalização?', a: 'Porque o animal bilateral se desloca com uma ponta à frente; concentrar os órgãos dos sentidos e os nervos nessa ponta permite perceber o ambiente antes do resto do corpo.' },
      { q: 'Qual a diferença entre um animal acelomado e um celomado?', a: 'O acelomado não tem cavidade entre a parede do corpo e o tubo digestório (o espaço é preenchido por tecido); o celomado tem uma cavidade revestida por mesoderme, onde os órgãos ficam suspensos.' },
      { q: 'Por que dizemos que equinodermos e cordados são parentes próximos?', a: 'Porque ambos são deuterostômios: no embrião o blastóporo origina o ânus, uma característica herdada de um ancestral comum.' },
    ],
    misconceptions: ['"Animal é só bicho com pelos" — insetos, esponjas, corais e minhocas também são animais.', '"Esponja é planta" — esponjas são animais heterótrofos, sem parede celular e sem fotossíntese.', '"A árvore evolutiva vai do inferior ao superior" — todos os grupos atuais são igualmente evoluídos; a árvore mostra parentesco.'],
    refs: ['bio-27'],
  },
  {
    id: 'animais-poriferos-cnidarios',
    laboratoryId: LAB,
    unit: 'Zoologia',
    title: 'Poríferos e cnidários',
    grade: '2º ano',
    minutes: 50,
    summary: 'Como uma esponja se alimenta filtrando água e como os cnidários capturam presas com cnidócitos; reprodução por brotamento.',
    objectives: [
      'Descrever o caminho da água na esponja e o papel dos coanócitos.',
      'Identificar as camadas do corpo da hidra e a cavidade gastrovascular.',
      'Explicar o funcionamento dos cnidócitos.',
      'Reconhecer o brotamento como reprodução assexuada.',
    ],
    sections: [
      {
        heading: 'Esponjas: filtradoras',
        text: 'A água entra pelos poros, passa pela espongiocele e sai pelo ósculo. Os coanócitos criam a corrente com seus flagelos e capturam as partículas de alimento, que são digeridas dentro das células. Espículas de calcário ou sílica sustentam o corpo.',
        actions: [
          { label: 'Animação: filtração', process: 'filtracao-esponja' },
          { label: 'Coanócitos', structure: 'coanocitos' },
          { label: 'Ósculo', structure: 'osculo' },
          { label: 'Espículas', structure: 'espiculas' },
        ],
      },
      {
        heading: 'Hidra: tecidos verdadeiros',
        text: 'O corpo da hidra tem epiderme, mesogleia e gastroderme em volta da cavidade gastrovascular, que tem uma só abertura (boca e ânus ao mesmo tempo). Há uma rede nervosa difusa, sem cérebro.',
        actions: [
          { label: 'Abrir a hidra', model: 'hidra' },
          { label: 'Gastroderme', structure: 'gastroderme' },
          { label: 'Mesogleia', structure: 'mesogleia' },
        ],
      },
      {
        heading: 'Cnidócitos',
        text: 'Os tentáculos têm cnidócitos: ao toque, cada um dispara um filamento com veneno que paralisa a presa. É o que provoca a queimadura das águas-vivas e caravelas.',
        bullets: ['Em queimaduras de água-viva: lavar com água do mar ou vinagre, sem esfregar e sem água doce.'],
        actions: [
          { label: 'Cnidócitos', structure: 'cnidocitos' },
          { label: 'Tentáculos', structure: 'tentaculos' },
        ],
      },
      {
        heading: 'Brotamento',
        text: 'Hidras e esponjas podem se reproduzir por brotamento: um broto cresce na lateral, forma boca e tentáculos e se solta, gerando um indivíduo geneticamente igual. Também se reproduzem sexuadamente.',
        actions: [{ label: 'Animação: brotamento da hidra', process: 'brotamento-hidra' }],
      },
    ],
    keyTerms: ['Coanócito', 'Ósculo', 'Espícula', 'Digestão intracelular', 'Cavidade gastrovascular', 'Mesogleia', 'Cnidócito', 'Pólipo', 'Medusa', 'Brotamento'],
    questions: [
      { q: 'Por que se diz que a esponja não tem sistema digestório?', a: 'Porque não há boca, tubo ou cavidade digestória: a digestão acontece dentro das células (coanócitos e amebócitos).' },
      { q: 'O tubo digestório da hidra é completo ou incompleto? Por quê?', a: 'Incompleto: a cavidade gastrovascular tem uma só abertura, que serve para entrada do alimento e saída dos restos.' },
      { q: 'Por que os filhos gerados por brotamento são iguais à mãe?', a: 'Porque se formam por mitose, sem união de gametas, e portanto recebem o mesmo material genético.' },
    ],
    misconceptions: ['"O ósculo é a boca da esponja" — é a saída da água.', '"Coral é pedra ou planta" — corais são colônias de cnidários que produzem um esqueleto calcário.'],
    refs: ['bio-28'],
  },
  {
    id: 'animais-vermes',
    laboratoryId: LAB,
    unit: 'Zoologia',
    title: 'Platelmintos e anelídeos',
    grade: '2º ano',
    minutes: 100,
    summary: 'Dois planos de corpo de vermes: a planária achatada e sem celoma e a minhoca segmentada, com celoma, tubo digestório completo e circulação fechada.',
    objectives: [
      'Relacionar o corpo achatado da planária à ausência de sistemas respiratório e circulatório.',
      'Descrever o tubo digestório incompleto e ramificado da planária e o completo da minhoca.',
      'Explicar a segmentação e o celoma dos anelídeos.',
      'Reconhecer a importância da minhoca para o solo e de platelmintos parasitas para a saúde.',
    ],
    sections: [
      {
        heading: 'Planária: um corpo achatado',
        text: 'Com o corpo fino, o oxigênio chega a todas as células por difusão. O intestino ramificado leva o alimento perto de cada célula. A faringe sai pela boca, no meio do corpo, e os restos voltam pelo mesmo caminho. Protonefrídios com células-flama eliminam o excesso de água.',
        actions: [
          { label: 'Abrir a planária', model: 'planaria' },
          { label: 'Intestino ramificado', structure: 'intestino-ramificado' },
          { label: 'Faringe', structure: 'faringe' },
          { label: 'Protonefrídios', structure: 'protonefridios' },
        ],
      },
      {
        heading: 'Cabeça e sistema nervoso',
        text: 'A planária tem ocelos, aurículas e gânglios cerebrais ligados a dois cordões nervosos em escada. É um dos primeiros animais com cabeça. Ela também regenera o corpo inteiro a partir de um pedaço.',
        actions: [
          { label: 'Ocelos', structure: 'ocelos' },
          { label: 'Cordões nervosos', structure: 'cordoes-nervosos' },
        ],
      },
      {
        heading: 'Minhoca: segmentos e celoma',
        text: 'O corpo da minhoca tem mais de 100 segmentos separados por septos. O celoma cheio de líquido funciona como esqueleto hidrostático: músculos circulares e longitudinais se contraem em ondas e as cerdas ancoram o corpo no solo.',
        actions: [
          { label: 'Abrir a minhoca', model: 'minhoca' },
          { label: 'Septos', structure: 'septos' },
          { label: 'Cerdas', structure: 'cerdas' },
          { label: 'Clitelo', structure: 'clitelo' },
        ],
      },
      {
        heading: 'Os sistemas da minhoca',
        text: 'Tubo digestório completo: faringe, esôfago, papo, moela e intestino até o ânus. Circulação fechada com vaso dorsal, vaso ventral e cinco pares de "corações". Respiração pela pele úmida. Nefrídios em cada segmento. Cordão nervoso ventral com um gânglio por segmento.',
        actions: [
          { label: 'Moela', structure: 'moela' },
          { label: '"Corações"', structure: 'coracoes' },
          { label: 'Cordão nervoso ventral', structure: 'cordao-nervoso-ventral' },
          { label: 'Comparar planária e minhoca', tool: 'comparar' },
        ],
      },
    ],
    keyTerms: ['Acelomado', 'Tubo digestório incompleto', 'Protonefrídio', 'Regeneração', 'Metameria', 'Celoma', 'Esqueleto hidrostático', 'Circulação fechada', 'Nefrídio', 'Clitelo', 'Hermafrodita'],
    questions: [
      { q: 'Por que a planária não precisa de sistema circulatório?', a: 'Porque é achatada: nenhuma célula fica longe da superfície ou do intestino ramificado, e a difusão basta para levar oxigênio e nutrientes.' },
      { q: 'Por que a minhoca morre se a pele seca?', a: 'Porque respira pela pele: as trocas gasosas só acontecem através de uma superfície úmida.' },
      { q: 'A minhoca é hermafrodita. Ela se autofecunda?', a: 'Não: duas minhocas trocam espermatozoides na cópula (fecundação cruzada), o que aumenta a variabilidade genética.' },
    ],
    misconceptions: ['"Minhoca cortada vira duas" — em geral só a parte da frente pode sobreviver e regenerar; a planária é que regenera muito bem.', '"Todo verme é parasita" — planárias e minhocas vivem livres e muitos vermes são úteis.'],
    refs: ['bio-28'],
  },
  {
    id: 'animais-artropodes-equinodermos',
    laboratoryId: LAB,
    unit: 'Zoologia',
    title: 'Artrópodes e equinodermos',
    grade: '2º ano',
    minutes: 100,
    summary: 'O sucesso dos artrópodes (exoesqueleto, patas articuladas, traqueias, metamorfose) e o plano de corpo único dos equinodermos (sistema ambulacral).',
    objectives: [
      'Identificar as partes do corpo de um inseto e diferenciá-lo de aracnídeos e crustáceos.',
      'Relacionar o exoesqueleto às mudas e à respiração por traqueias.',
      'Diferenciar metamorfose completa e incompleta.',
      'Descrever o sistema ambulacral da estrela-do-mar.',
    ],
    sections: [
      {
        heading: 'O corpo de um inseto',
        text: 'Cabeça (antenas, olhos compostos, peças bucais), tórax (três pares de patas e, em geral, dois pares de asas) e abdome. O exoesqueleto de quitina protege e evita a perda de água, mas não cresce: o inseto precisa trocá-lo (muda).',
        actions: [
          { label: 'Gafanhoto', model: 'gafanhoto' },
          { label: 'Olhos compostos', structure: 'olhos-compostos' },
          { label: 'Aparelho bucal', structure: 'aparelho-bucal' },
          { label: 'Patas articuladas', structure: 'patas' },
        ],
      },
      {
        heading: 'Respiração por traqueias',
        text: 'Os espiráculos levam o ar por tubos (traqueias) até as células. O sangue dos insetos não transporta oxigênio, e a circulação é aberta. Crustáceos respiram por brânquias e aranhas por pulmões foliáceos.',
        actions: [
          { label: 'Espiráculos', structure: 'espiraculos' },
          { label: 'Chave: inseto, aranha ou crustáceo?', tool: 'chave' },
        ],
      },
      {
        heading: 'Metamorfose',
        text: 'Na metamorfose completa (borboleta, mosca, besouro) há ovo, larva, pupa e adulto. Na incompleta (gafanhoto, barata) a ninfa já se parece com o adulto e cresce por mudas, ganhando as asas no fim.',
        actions: [
          { label: 'Animação: metamorfose completa', process: 'metamorfose-inseto' },
          { label: 'Pupa', structure: 'pupa' },
        ],
      },
      {
        heading: 'Equinodermos',
        text: 'A estrela-do-mar tem simetria de cinco partes, endoesqueleto de placas calcárias com espinhos e um sistema ambulacral: a água entra pelo madreporito e enche os canais que movem centenas de pés ambulacrais com ventosas.',
        actions: [
          { label: 'Estrela-do-mar', model: 'estrela-do-mar' },
          { label: 'Sistema ambulacral', structure: 'sistema-ambulacral' },
          { label: 'Madreporito', structure: 'madreporito' },
          { label: 'Pés ambulacrais', structure: 'pes-ambulacrais' },
        ],
      },
    ],
    keyTerms: ['Exoesqueleto', 'Quitina', 'Muda (ecdise)', 'Tagmas', 'Olho composto', 'Traqueia', 'Circulação aberta', 'Holometábolo', 'Hemimetábolo', 'Sistema ambulacral'],
    questions: [
      { q: 'Por que um inseto não pode crescer continuamente como nós?', a: 'Porque o exoesqueleto é rígido: o crescimento acontece em etapas, a cada muda, quando o esqueleto velho é trocado por um maior.' },
      { q: 'Como diferenciar uma aranha de um inseto?', a: 'A aranha tem quatro pares de patas, corpo em cefalotórax e abdome e não tem antenas; o inseto tem três pares de patas, corpo em cabeça, tórax e abdome e um par de antenas.' },
      { q: 'Qual a vantagem de larva e adulto comerem coisas diferentes?', a: 'Eles não competem pelo mesmo alimento: a larva cresce comendo folhas e o adulto se alimenta de néctar enquanto se reproduz.' },
    ],
    misconceptions: ['"Aranha é inseto" — é aracnídeo.', '"Estrela-do-mar é peixe" — é um equinodermo, um invertebrado.', '"A pupa está morta ou dormindo" — dentro dela o corpo está sendo reconstruído.'],
    refs: ['bio-28'],
  },
  {
    id: 'animais-vertebrados',
    laboratoryId: LAB,
    unit: 'Zoologia',
    title: 'Vertebrados: sistemas comparados',
    grade: '2º ano',
    minutes: 100,
    summary: 'Peixes, anfíbios e aves comparados sistema a sistema: respiração (brânquias, pulmões e pele, sacos aéreos), circulação (2, 3 e 4 cavidades) e digestão.',
    objectives: [
      'Identificar as características comuns aos vertebrados.',
      'Comparar a respiração de peixes, anfíbios e aves.',
      'Relacionar o número de cavidades do coração ao tipo de circulação e à endotermia.',
      'Reconhecer adaptações dos peixes à água, dos anfíbios à vida dupla e das aves ao voo.',
    ],
    sections: [
      {
        heading: 'Peixes: adaptados à água',
        text: 'Corpo hidrodinâmico, nadadeiras, brânquias com trocas em contracorrente, bexiga natatória para flutuar e linha lateral para sentir vibrações. O coração tem duas cavidades e só recebe sangue pobre em oxigênio.',
        actions: [
          { label: 'Peixe ósseo', model: 'peixe' },
          { label: 'Brânquias', structure: 'branquias' },
          { label: 'Bexiga natatória', structure: 'bexiga-natatoria' },
          { label: 'Linha lateral', structure: 'linha-lateral' },
        ],
      },
      {
        heading: 'Anfíbios: entre a água e a terra',
        text: 'Pulmões simples e pele fina e úmida que também respira. Coração de três cavidades, com mistura parcial do sangue no ventrículo. Ovos sem casca na água e larva aquática.',
        actions: [
          { label: 'Sapo', model: 'sapo' },
          { label: 'Pulmões', structure: 'pulmoes' },
          { label: 'Pele', structure: 'pele-sapo' },
          { label: 'Cloaca', structure: 'cloaca' },
        ],
      },
      {
        heading: 'Aves: adaptadas ao voo',
        text: 'Penas, ossos ocos, quilha com músculos peitorais grandes, bico sem dentes com papo e moela, e pulmões ligados a sacos aéreos que mantêm o ar passando num só sentido. Coração de quatro cavidades e temperatura do corpo constante (endotermia).',
        actions: [
          { label: 'Ave', model: 'ave' },
          { label: 'Sacos aéreos', structure: 'sacos-aereos' },
          { label: 'Quilha', structure: 'quilha' },
          { label: 'Moela', structure: 'moela-ave' },
        ],
      },
      {
        heading: 'Circulação comparada',
        text: 'Peixe: circulação simples (2 cavidades). Anfíbio e maioria dos répteis: circulação dupla incompleta (3 cavidades). Aves e mamíferos: circulação dupla completa (4 cavidades), sem mistura, que sustenta um metabolismo alto.',
        actions: [
          { label: 'Animação: corações comparados', process: 'circulacao-comparada' },
          { label: 'Ventrículo único', structure: 'ventriculo-misto' },
          { label: 'Septo interventricular', structure: 'septo-interventricular' },
          { label: 'Um sistema em todos os grupos', tool: 'comparar' },
        ],
      },
    ],
    keyTerms: ['Coluna vertebral', 'Brânquias', 'Contracorrente', 'Bexiga natatória', 'Respiração cutânea', 'Sacos aéreos', 'Quilha', 'Circulação simples', 'Circulação dupla', 'Endotermia', 'Ectotermia'],
    questions: [
      { q: 'Por que o coração do peixe só tem sangue pobre em oxigênio?', a: 'Porque o sangue sai do coração para as brânquias, onde é oxigenado, e daí segue direto para o corpo, sem voltar ao coração antes.' },
      { q: 'Qual a vantagem do coração de quatro cavidades?', a: 'Não há mistura de sangue: o corpo recebe sangue com o máximo de oxigênio, o que permite metabolismo alto e manter a temperatura do corpo constante.' },
      { q: 'Cite três adaptações das aves ao voo.', a: 'Penas, ossos ocos (pneumáticos), quilha com músculos peitorais grandes, sacos aéreos, ausência de dentes e bexiga urinária.' },
    ],
    misconceptions: ['"Baleia e golfinho são peixes" — são mamíferos: respiram por pulmões e amamentam.', '"Sangue venoso é azul" — é vermelho-escuro; o azul é só convenção dos esquemas.', '"Animal de sangue frio tem sangue frio" — ectotérmicos dependem do ambiente para regular a temperatura, que pode até ser alta.'],
    refs: ['bio-29', 'bio-40'],
  },
  {
    id: 'animais-desenvolvimento',
    laboratoryId: LAB,
    unit: 'Embriologia',
    title: 'Desenvolvimento embrionário e metamorfose',
    grade: '2º ano',
    minutes: 100,
    summary: 'Do zigoto à gástrula com os três folhetos germinativos; o destino de cada folheto; a metamorfose do sapo e a metamorfose completa dos insetos.',
    objectives: [
      'Ordenar as etapas do desenvolvimento: zigoto, clivagem, mórula, blástula e gástrula.',
      'Relacionar cada folheto germinativo aos tecidos que ele origina.',
      'Descrever as mudanças da metamorfose do sapo e o papel dos hormônios.',
      'Diferenciar desenvolvimento direto e indireto.',
    ],
    sections: [
      {
        heading: 'Clivagem, mórula e blástula',
        text: 'O zigoto se divide sem crescer (clivagem): 2, 4, 8 células... até a mórula, maciça. Depois as células se organizam em volta de uma cavidade, a blastocele: é a blástula. No ovo de anfíbio, o polo vegetal tem mais vitelo e células maiores.',
        actions: [
          { label: 'Animação: desenvolvimento', process: 'desenvolvimento-embrionario' },
          { label: 'Mórula', structure: 'morula' },
          { label: 'Blastocele', structure: 'blastocele' },
        ],
      },
      {
        heading: 'Gastrulação e folhetos',
        text: 'Células afundam para dentro (invaginação) e formam o arquêntero, aberto pelo blastóporo. Surgem a ectoderme (pele e sistema nervoso), a endoderme (revestimento do tubo digestório e respiratório) e a mesoderme (músculos, ossos, sangue, coração, rins).',
        actions: [
          { label: 'Ectoderme', structure: 'ectoderme' },
          { label: 'Mesoderme', structure: 'mesoderme' },
          { label: 'Endoderme', structure: 'endoderme' },
          { label: 'Arquêntero', structure: 'arquentero' },
        ],
      },
      {
        heading: 'Metamorfose do sapo',
        text: 'Desenvolvimento indireto: do ovo sai uma larva (girino) muito diferente do adulto. Com o hormônio da tireoide, surgem patas, as brânquias dão lugar aos pulmões, a cauda é reabsorvida e o intestino encurta.',
        actions: [
          { label: 'Animação: metamorfose do sapo', process: 'metamorfose-anfibio' },
          { label: 'Brânquias externas', structure: 'branquias-externas' },
          { label: 'Cauda', structure: 'cauda' },
        ],
      },
      {
        heading: 'Metamorfose dos insetos',
        text: 'Holometábolos (borboleta, mosca, abelha) passam por ovo, larva, pupa e adulto. Hemimetábolos (gafanhoto, barata) passam por ovo, ninfa e adulto. No desenvolvimento direto (aves, mamíferos, répteis) o filhote já nasce parecido com o adulto.',
        actions: [
          { label: 'Animação: metamorfose completa', process: 'metamorfose-inseto' },
          { label: 'Lagarta', structure: 'lagarta' },
          { label: 'Gafanhoto (sem pupa)', model: 'gafanhoto' },
        ],
      },
    ],
    keyTerms: ['Zigoto', 'Clivagem', 'Blastômero', 'Mórula', 'Blástula', 'Blastocele', 'Gastrulação', 'Arquêntero', 'Blastóporo', 'Folhetos germinativos', 'Metamorfose', 'Desenvolvimento indireto'],
    questions: [
      { q: 'Por que a mórula tem o mesmo tamanho do zigoto?', a: 'Porque na clivagem as células se dividem sem crescer: o citoplasma do zigoto é repartido em células cada vez menores.' },
      { q: 'De qual folheto se origina o sistema nervoso? E o coração?', a: 'O sistema nervoso vem da ectoderme; o coração, da mesoderme.' },
      { q: 'Na metamorfose do sapo, por que a cauda "some"?', a: 'Suas células morrem de forma programada (apoptose) e o material é reabsorvido e reaproveitado pelo organismo.' },
    ],
    misconceptions: ['"O girino perde a cauda porque ela cai" — ela é reabsorvida.', '"Cada célula do embrião já é um órgão em miniatura" — os órgãos só se formam depois, a partir dos folhetos.'],
    refs: ['bio-43', 'bio-29'],
  },
];
