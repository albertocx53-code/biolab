/**
 * Data of the Animals classroom tools: a dichotomous key, a comparison of the
 * animal groups system by system, and a simplified phylogenetic tree.
 * Checked against OpenStax Biology 2e, chapters 27 to 29 (CC BY 4.0).
 */

// ===================================================================== dichotomous key

export interface KeyResult {
  id: string;
  label: string;
  examples: string;
  /** Model of this laboratory that shows the group, if any. */
  model?: string;
  color: string;
}

export interface KeyQuestion {
  id: string;
  text: string;
  hint?: string;
  yes: string;
  no: string;
}

export const KEY_RESULTS: Record<string, KeyResult> = {
  poriferos: { id: 'poriferos', label: 'Poríferos', examples: 'esponjas', model: 'Esponja', color: '#E9A23B' },
  cnidarios: { id: 'cnidarios', label: 'Cnidários', examples: 'hidra, água-viva, coral, anêmona', model: 'Hidra', color: '#8BC34A' },
  equinodermos: { id: 'equinodermos', label: 'Equinodermos', examples: 'estrela-do-mar, ouriço, pepino-do-mar', model: 'Estrela-do-mar', color: '#E76F51' },
  insetos: { id: 'insetos', label: 'Artrópodes: insetos', examples: 'gafanhoto, borboleta, abelha, formiga', model: 'Gafanhoto', color: '#7CB342' },
  aracnideos: { id: 'aracnideos', label: 'Artrópodes: aracnídeos', examples: 'aranha, escorpião, carrapato, ácaro', color: '#6D4C41' },
  miriapodes: { id: 'miriapodes', label: 'Artrópodes: miriápodes', examples: 'centopeia (lacraia), piolho-de-cobra', color: '#A1887F' },
  crustaceos: { id: 'crustaceos', label: 'Artrópodes: crustáceos', examples: 'camarão, caranguejo, tatuzinho-de-jardim', color: '#F4A261' },
  moluscos: { id: 'moluscos', label: 'Moluscos', examples: 'caracol, lesma, mexilhão, polvo, lula', color: '#B08968' },
  anelideos: { id: 'anelideos', label: 'Anelídeos', examples: 'minhoca, sanguessuga, poliquetas', model: 'Minhoca', color: '#C97B84' },
  platelmintos: { id: 'platelmintos', label: 'Platelmintos', examples: 'planária, tênia, esquistossomo', model: 'Planária', color: '#8D6E63' },
  nematodeos: { id: 'nematodeos', label: 'Nematódeos', examples: 'lombriga, ancilóstomo (amarelão), oxiúro', color: '#D4A373' },
  peixes: { id: 'peixes', label: 'Peixes', examples: 'tilápia, tubarão, cavalo-marinho', model: 'Peixe', color: '#7FA7C9' },
  anfibios: { id: 'anfibios', label: 'Anfíbios', examples: 'sapo, rã, perereca, salamandra', model: 'Sapo', color: '#6A994E' },
  aves: { id: 'aves', label: 'Aves', examples: 'pombo, galinha, beija-flor, pinguim', model: 'Ave', color: '#BB9457' },
  mamiferos: { id: 'mamiferos', label: 'Mamíferos', examples: 'ser humano, cão, morcego, baleia', color: '#9C6644' },
  repteis: { id: 'repteis', label: 'Répteis', examples: 'lagarto, cobra, tartaruga, jacaré', color: '#588157' },
};

export const KEY_START = 'tecidos';

export const KEY_QUESTIONS: Record<string, KeyQuestion> = {
  tecidos: { id: 'tecidos', text: 'O animal tem tecidos verdadeiros, com órgãos como boca e tubo digestório?', hint: 'Esponjas não têm: são um conjunto de células em volta de canais de água.', yes: 'radial', no: 'poriferos' },
  radial: { id: 'radial', text: 'Tem simetria radial e tentáculos com células urticantes?', yes: 'cnidarios', no: 'vertebras' },
  vertebras: { id: 'vertebras', text: 'Tem coluna vertebral (vértebras) e crânio?', yes: 'respiraAgua', no: 'pentarradial' },
  pentarradial: { id: 'pentarradial', text: 'O adulto tem simetria de cinco partes, espinhos e pés ambulacrais?', yes: 'equinodermos', no: 'exoesqueleto' },
  exoesqueleto: { id: 'exoesqueleto', text: 'Tem exoesqueleto e patas articuladas?', yes: 'tresPares', no: 'concha' },
  tresPares: { id: 'tresPares', text: 'Tem 3 pares de patas e o corpo dividido em cabeça, tórax e abdome?', yes: 'insetos', no: 'quatroPares' },
  quatroPares: { id: 'quatroPares', text: 'Tem 4 pares de patas e não tem antenas?', yes: 'aracnideos', no: 'muitasPatas' },
  muitasPatas: { id: 'muitasPatas', text: 'Tem muitas patas, um ou dois pares em cada segmento do corpo?', hint: 'Se não, deve ter dois pares de antenas e, em geral, respirar por brânquias.', yes: 'miriapodes', no: 'crustaceos' },
  concha: { id: 'concha', text: 'Tem corpo mole, não segmentado, com um pé muscular e, em geral, concha?', yes: 'moluscos', no: 'aneis' },
  aneis: { id: 'aneis', text: 'O corpo é dividido em anéis (segmentos)?', yes: 'anelideos', no: 'achatado' },
  achatado: { id: 'achatado', text: 'O corpo é achatado, como uma fita?', hint: 'Se não, é cilíndrico e afinado nas pontas.', yes: 'platelmintos', no: 'nematodeos' },
  respiraAgua: { id: 'respiraAgua', text: 'Respira por brânquias a vida toda e tem nadadeiras?', yes: 'peixes', no: 'girino' },
  girino: { id: 'girino', text: 'Tem pele úmida, sem escamas, e uma larva aquática (girino)?', yes: 'anfibios', no: 'penas' },
  penas: { id: 'penas', text: 'Tem o corpo coberto de penas?', yes: 'aves', no: 'pelos' },
  pelos: { id: 'pelos', text: 'Tem pelos e glândulas mamárias?', hint: 'Se não, tem a pele seca coberta de escamas.', yes: 'mamiferos', no: 'repteis' },
};

/** Walks the key with a list of answers; returns the current question or the result. */
export function walkKey(answers: boolean[]) {
  let at = KEY_START;
  const path: { q: KeyQuestion; a: boolean }[] = [];
  for (const a of answers) {
    const q = KEY_QUESTIONS[at];
    if (!q) break;
    path.push({ q, a });
    at = a ? q.yes : q.no;
  }
  return { path, question: KEY_QUESTIONS[at] ?? null, result: KEY_RESULTS[at] ?? null };
}

// ===================================================================== comparison

export interface Group {
  id: string;
  label: string;
  color: string;
  facts: Record<string, string>;
}

export const SYSTEMS = [
  { id: 'simetria', label: 'Simetria' },
  { id: 'folhetos', label: 'Folhetos e celoma' },
  { id: 'digestorio', label: 'Digestório' },
  { id: 'respiratorio', label: 'Respiratório' },
  { id: 'circulatorio', label: 'Circulatório' },
  { id: 'excretor', label: 'Excretor' },
  { id: 'nervoso', label: 'Nervoso' },
  { id: 'reproducao', label: 'Reprodução e desenvolvimento' },
] as const;

export type SystemId = (typeof SYSTEMS)[number]['id'];

export const GROUPS: Group[] = [
  {
    id: 'poriferos',
    label: 'Poríferos',
    color: '#E9A23B',
    facts: { simetria: 'Sem simetria (ou radial)', folhetos: 'Sem folhetos verdadeiros', digestorio: 'Não tem; digestão dentro dos coanócitos', respiratorio: 'Difusão, com a corrente de água', circulatorio: 'Não tem; a corrente de água distribui', excretor: 'Não tem; difusão para a água', nervoso: 'Não tem', reproducao: 'Brotamento ou sexuada; larva nadante' },
  },
  {
    id: 'cnidarios',
    label: 'Cnidários',
    color: '#8BC34A',
    facts: { simetria: 'Radial', folhetos: 'Diblásticos; sem celoma', digestorio: 'Incompleto: cavidade gastrovascular com uma abertura', respiratorio: 'Difusão pela superfície', circulatorio: 'Não tem', excretor: 'Não tem; difusão', nervoso: 'Rede nervosa difusa', reproducao: 'Brotamento ou sexuada; alternância pólipo–medusa' },
  },
  {
    id: 'platelmintos',
    label: 'Platelmintos',
    color: '#8D6E63',
    facts: { simetria: 'Bilateral', folhetos: 'Triblásticos; acelomados', digestorio: 'Incompleto (sem ânus); ausente nas tênias', respiratorio: 'Difusão (corpo achatado)', circulatorio: 'Não tem', excretor: 'Protonefrídios (células-flama)', nervoso: 'Gânglios cerebrais e cordões em escada', reproducao: 'Hermafroditas; planária regenera' },
  },
  {
    id: 'nematodeos',
    label: 'Nematódeos',
    color: '#D4A373',
    facts: { simetria: 'Bilateral', folhetos: 'Triblásticos; pseudocelomados', digestorio: 'Completo (boca e ânus)', respiratorio: 'Difusão', circulatorio: 'Não tem; o líquido do pseudoceloma distribui', excretor: 'Canais excretores', nervoso: 'Anel nervoso e cordões', reproducao: 'Sexos separados; mudas da cutícula' },
  },
  {
    id: 'anelideos',
    label: 'Anelídeos',
    color: '#C97B84',
    facts: { simetria: 'Bilateral, segmentada', folhetos: 'Triblásticos; celomados (protostômios)', digestorio: 'Completo, com papo e moela', respiratorio: 'Cutânea (poliquetas: parápodes)', circulatorio: 'Fechado, com "corações" e hemoglobina', excretor: 'Nefrídios (um par por segmento)', nervoso: 'Gânglio cerebral e cordão ventral', reproducao: 'Minhoca hermafrodita, fecundação cruzada, casulo' },
  },
  {
    id: 'moluscos',
    label: 'Moluscos',
    color: '#B08968',
    facts: { simetria: 'Bilateral (caramujos torcidos)', folhetos: 'Triblásticos; celomados (protostômios)', digestorio: 'Completo, com rádula (exceto bivalves)', respiratorio: 'Brânquias; pulmão nos caracóis terrestres', circulatorio: 'Aberto (fechado nos polvos e lulas)', excretor: 'Metanefrídios', nervoso: 'Gânglios; encéfalo grande nos polvos', reproducao: 'Sexos separados ou hermafroditas' },
  },
  {
    id: 'artropodes',
    label: 'Artrópodes',
    color: '#7CB342',
    facts: { simetria: 'Bilateral, segmentada', folhetos: 'Triblásticos; celomados (protostômios)', digestorio: 'Completo, peças bucais variadas', respiratorio: 'Traqueias (insetos), brânquias (crustáceos), pulmões foliáceos (aranhas)', circulatorio: 'Aberto (hemolinfa)', excretor: 'Túbulos de Malpighi (insetos), glândulas verdes (crustáceos)', nervoso: 'Gânglios cerebrais e cordão ventral; olhos compostos', reproducao: 'Sexos separados; mudas; metamorfose em muitos insetos' },
  },
  {
    id: 'equinodermos',
    label: 'Equinodermos',
    color: '#E76F51',
    facts: { simetria: 'Pentarradial no adulto, bilateral na larva', folhetos: 'Triblásticos; celomados (deuterostômios)', digestorio: 'Completo (estômago evertido nas estrelas)', respiratorio: 'Pápulas e pés ambulacrais', circulatorio: 'Reduzido; sistema ambulacral', excretor: 'Difusão', nervoso: 'Anel nervoso e nervos radiais, sem cérebro', reproducao: 'Sexos separados; fecundação externa; regeneram braços' },
  },
  {
    id: 'peixes',
    label: 'Peixes',
    color: '#7FA7C9',
    facts: { simetria: 'Bilateral', folhetos: 'Triblásticos; celomados (deuterostômios)', digestorio: 'Completo; ânus ou cloaca', respiratorio: 'Brânquias (contracorrente)', circulatorio: 'Fechado, simples; coração com 2 cavidades', excretor: 'Rins; amônia', nervoso: 'Encéfalo e medula; linha lateral', reproducao: 'Em geral fecundação externa; ovos sem casca' },
  },
  {
    id: 'anfibios',
    label: 'Anfíbios',
    color: '#6A994E',
    facts: { simetria: 'Bilateral', folhetos: 'Triblásticos; celomados (deuterostômios)', digestorio: 'Completo; cloaca', respiratorio: 'Brânquias (girino), pulmões e pele (adulto)', circulatorio: 'Fechado, duplo incompleto; 3 cavidades', excretor: 'Rins; amônia (girino) e ureia (adulto)', nervoso: 'Encéfalo e medula', reproducao: 'Fecundação externa; ovos na água; metamorfose' },
  },
  {
    id: 'repteis',
    label: 'Répteis',
    color: '#588157',
    facts: { simetria: 'Bilateral', folhetos: 'Triblásticos; celomados (deuterostômios)', digestorio: 'Completo; cloaca', respiratorio: 'Pulmões', circulatorio: 'Fechado, duplo incompleto; 4 cavidades nos crocodilos', excretor: 'Rins; ácido úrico', nervoso: 'Encéfalo e medula', reproducao: 'Fecundação interna; ovo com casca e âmnio' },
  },
  {
    id: 'aves',
    label: 'Aves',
    color: '#BB9457',
    facts: { simetria: 'Bilateral', folhetos: 'Triblásticos; celomados (deuterostômios)', digestorio: 'Completo, com papo e moela; cloaca', respiratorio: 'Pulmões com sacos aéreos (fluxo num só sentido)', circulatorio: 'Fechado, duplo completo; 4 cavidades; endotermia', excretor: 'Rins; ácido úrico', nervoso: 'Encéfalo com cerebelo grande', reproducao: 'Fecundação interna; ovo com casca calcária; cuidado parental' },
  },
  {
    id: 'mamiferos',
    label: 'Mamíferos',
    color: '#9C6644',
    facts: { simetria: 'Bilateral', folhetos: 'Triblásticos; celomados (deuterostômios)', digestorio: 'Completo; dentes diferenciados; ânus', respiratorio: 'Pulmões com alvéolos e diafragma', circulatorio: 'Fechado, duplo completo; 4 cavidades; endotermia', excretor: 'Rins; ureia', nervoso: 'Encéfalo grande, com córtex cerebral', reproducao: 'Fecundação interna; quase todos com placenta; amamentação' },
  },
];

// ===================================================================== phylogenetic tree

export interface Innovation {
  id: string;
  label: string;
  text: string;
}

export interface TreeNode {
  id: string;
  label?: string;
  color?: string;
  /** Innovation that appears on the branch leading to this node. */
  innovation?: Innovation;
  children?: TreeNode[];
}

const leaf = (id: string, innovation?: Innovation): TreeNode => ({ id, label: KEY_RESULTS[id]?.label.replace('Artrópodes: ', '') ?? id, color: KEY_RESULTS[id]?.color, innovation });
const inv = (id: string, label: string, text: string): Innovation => ({ id, label, text });

export const TREE: TreeNode = {
  id: 'animais',
  innovation: inv('multicelular', 'Multicelularidade e heterotrofia', 'Todos os animais são eucariontes multicelulares, heterótrofos (comem outros seres vivos), sem parede celular e passam por uma fase embrionária de blástula.'),
  children: [
    leaf('poriferos'),
    {
      id: 'eumetazoa',
      innovation: inv('tecidos', 'Tecidos verdadeiros', 'Células organizadas em tecidos (epitélios, nervos, músculos). A partir daqui os animais têm boca e cavidade digestória.'),
      children: [
        leaf('cnidarios', inv('cnidocitos', 'Cnidócitos', 'Células urticantes, exclusivas dos cnidários.')),
        {
          id: 'bilateria',
          innovation: inv('bilateral', 'Simetria bilateral e três folhetos', 'Corpo com lado direito e esquerdo, cabeça com concentração de nervos (cefalização) e mesoderme, o terceiro folheto, que forma músculos e órgãos.'),
          children: [
            {
              id: 'protostomia',
              innovation: inv('protostomia', 'Protostomia', 'No embrião o blastóporo origina a boca. O cordão nervoso fica na face ventral.'),
              children: [
                {
                  id: 'lophotrochozoa',
                  children: [
                    leaf('platelmintos'),
                    {
                      id: 'mol-ane',
                      innovation: inv('celoma', 'Celoma e tubo digestório completo', 'Cavidade do corpo revestida por mesoderme e tubo digestório com boca e ânus (os platelmintos perderam o celoma ou nunca o tiveram).'),
                      children: [leaf('moluscos', inv('concha', 'Pé muscular, manto e concha', 'Corpo mole com pé, massa visceral e manto, que produz a concha.')), leaf('anelideos', inv('aneis', 'Segmentação (metameria)', 'Corpo dividido em segmentos repetidos, separados por septos.'))],
                    },
                  ],
                },
                {
                  id: 'ecdysozoa',
                  innovation: inv('muda', 'Cutícula e muda (ecdise)', 'O revestimento externo não cresce: para crescer, o animal troca a cutícula ou o exoesqueleto.'),
                  children: [leaf('nematodeos'), leaf('insetos', inv('exoesqueleto', 'Exoesqueleto de quitina e patas articuladas', 'Esqueleto externo rígido e apêndices articulados: o grupo com mais espécies do planeta.'))],
                },
              ],
            },
            {
              id: 'deuterostomia',
              innovation: inv('deuterostomia', 'Deuterostomia', 'No embrião o blastóporo origina o ânus e a boca se forma depois. Equinodermos e cordados são parentes mais próximos do que parecem.'),
              children: [
                leaf('equinodermos', inv('ambulacral', 'Sistema ambulacral', 'Canais de água que movem os pés ambulacrais; endoesqueleto de placas calcárias.')),
                {
                  id: 'vertebrados',
                  innovation: inv('vertebras', 'Notocorda, crânio e vértebras', 'Cordados têm notocorda, tubo nervoso dorsal, fendas faríngeas e cauda; nos vertebrados a notocorda é substituída pela coluna vertebral.'),
                  children: [
                    leaf('peixes', inv('mandibulas', 'Mandíbulas e nadadeiras pares', 'Mandíbulas permitiram morder e capturar presas maiores; nadadeiras pares deram mais controle do nado.')),
                    {
                      id: 'tetrapodes',
                      innovation: inv('tetrapodes', 'Quatro membros e pulmões', 'Membros com dedos e pulmões permitiram a vida na terra. O ovo ainda precisa de água.'),
                      children: [
                        leaf('anfibios'),
                        {
                          id: 'amniotas',
                          innovation: inv('amnio', 'Ovo amniótico', 'Ovo com âmnio, casca e reservas, que não seca fora da água: a independência da água para reproduzir.'),
                          children: [
                            leaf('mamiferos', inv('pelos', 'Pelos e glândulas mamárias', 'Pelos isolam o calor (endotermia) e o leite alimenta os filhotes.')),
                            { id: 'sauropsida', children: [leaf('repteis'), leaf('aves', inv('penas', 'Penas e voo', 'As aves descendem de dinossauros: penas, ossos ocos, quilha e sacos aéreos são adaptações ao voo.'))] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export interface LaidNode {
  node: TreeNode;
  x: number;
  y: number;
  parent?: LaidNode;
}

/** Cladogram layout: leaves aligned at the right, internal nodes by depth. */
export function layoutTree(root: TreeNode, dx: number, dy: number, leafX: number) {
  const out: LaidNode[] = [];
  let row = 0;
  function walk(n: TreeNode, depth: number, parent?: LaidNode): LaidNode {
    const me: LaidNode = { node: n, x: n.children ? depth * dx : leafX, y: 0, parent };
    if (n.children) {
      const kids = n.children.map((c) => walk(c, depth + 1, me));
      me.y = (kids[0].y + kids[kids.length - 1].y) / 2;
    } else {
      me.y = row++ * dy;
    }
    out.push(me);
    return me;
  }
  walk(root, 0);
  return { nodes: out, rows: row };
}

export function allInnovations(root: TreeNode = TREE): Innovation[] {
  const list: Innovation[] = [];
  const walk = (n: TreeNode) => {
    if (n.innovation) list.push(n.innovation);
    n.children?.forEach(walk);
  };
  walk(root);
  return list;
}
