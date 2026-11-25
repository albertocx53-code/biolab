/**
 * Lesson scripts for the Plants laboratory (pt-BR). Original text for
 * BioLab 3D, checked against OpenStax Biology 2e (CC BY 4.0), chapters 30–32.
 * Requires review by a qualified Biology educator before commercial release.
 */
import type { Lesson } from './types';

const LAB = 'plantas' as const;

export const PLANT_LESSONS: Lesson[] = [
  {
    id: 'organografia-vegetal',
    laboratoryId: LAB,
    unit: 'Botânica',
    title: 'Órgãos da planta: raiz, caule, folha, flor, fruto e semente',
    grade: '2º ano',
    minutes: 50,
    summary: 'A organização do corpo de uma angiosperma: a função de cada órgão vegetativo e reprodutivo e os tecidos que os formam.',
    objectives: [
      'Identificar os órgãos vegetativos e reprodutivos de uma angiosperma.',
      'Descrever as zonas da raiz e a função dos pelos absorventes.',
      'Reconhecer nós, entrenós e gemas no caule e explicar o crescimento.',
      'Relacionar a estrutura interna da folha à fotossíntese e às trocas gasosas.',
      'Nomear as partes da flor e explicar a origem do fruto e da semente.',
    ],
    sections: [
      {
        heading: 'Raiz',
        text:
          'Fixa a planta e absorve água e sais. Da ponta para cima: coifa (protege o meristema), zona meristemática (divisão), zona de alongamento (crescimento) e zona pilífera, com pelos absorventes que multiplicam a área de absorção. Por dentro: epiderme, córtex, endoderme (controla a entrada de água, com as estrias de Caspary), periciclo (origem das raízes laterais) e cilindro vascular com xilema e floema. Raízes pivotantes (feijão, cenoura) × fasciculadas (milho, gramíneas); raízes tuberosas (mandioca, batata-doce) armazenam reservas.',
        actions: [
          { label: 'Abrir a raiz', model: 'raiz' },
          { label: 'Coifa', structure: 'coifa' },
          { label: 'Pelos absorventes', structure: 'pelos-absorventes' },
          { label: 'Endoderme', structure: 'endoderme' },
          { label: 'Absorção de água', process: 'absorcao' },
        ],
      },
      {
        heading: 'Caule',
        text:
          'Sustenta folhas e flores e liga raiz e folhas pelos vasos condutores. Tem nós (onde saem folhas e gemas axilares) e entrenós; a gema apical cresce em altura (crescimento primário) e inibe as axilares (dominância apical, por isso podar faz a planta "encher"). Em eudicotiledôneas os feixes vasculares ficam em anel, com o câmbio entre xilema e floema produzindo madeira (crescimento secundário e anéis anuais); em monocotiledôneas ficam espalhados. Caules modificados: tubérculo (batata), rizoma (gengibre), bulbo (cebola), gavinha, espinho.',
        actions: [
          { label: 'Abrir o caule', model: 'caule' },
          { label: 'Xilema', structure: 'xilema' },
          { label: 'Floema', structure: 'floema' },
          { label: 'Câmbio vascular', structure: 'cambio-vascular' },
          { label: 'Gema apical', structure: 'gema-apical' },
          { label: 'Transporte no caule', process: 'transporte-caule' },
        ],
      },
      {
        heading: 'Folha',
        text:
          'Órgão da fotossíntese e das trocas gasosas. Limbo, pecíolo e nervuras (feixes de xilema e floema). Por dentro: cutícula impermeável sobre a epiderme superior; parênquima paliçádico (células alongadas cheias de cloroplastos, onde ocorre a maior parte da fotossíntese); parênquima lacunoso (espaços de ar que facilitam a difusão de gases); epiderme inferior com estômatos, cada um formado por duas células-guarda que abrem e fecham o ostíolo.',
        actions: [
          { label: 'Abrir a folha', model: 'folha' },
          { label: 'Parênquima paliçádico', structure: 'parenquima-palicadico' },
          { label: 'Parênquima lacunoso', structure: 'parenquima-lacunoso' },
          { label: 'Estômato', structure: 'estomato' },
          { label: 'Cutícula', structure: 'cuticula' },
          { label: 'Fotossíntese na folha', process: 'fotossintese-folha' },
        ],
      },
      {
        heading: 'Flor',
        text:
          'Órgão reprodutor das angiospermas, sobre o receptáculo. De fora para dentro: sépalas (cálice, protegem o botão), pétalas (corola, atraem polinizadores), estames (androceu: filete + antera, que produz o pólen) e carpelos/pistilo (gineceu: estigma, estilete e ovário com óvulos). Flores podem ser hermafroditas ou unissexuais; cores, perfume e néctar são adaptações à polinização por insetos, aves ou vento.',
        actions: [
          { label: 'Abrir a flor', model: 'flor' },
          { label: 'Sépalas', structure: 'sepalas' },
          { label: 'Pétalas', structure: 'petalas' },
          { label: 'Antera', structure: 'antera' },
          { label: 'Estigma', structure: 'estigma' },
          { label: 'Ovário e óvulos', structure: 'ovario' },
        ],
      },
      {
        heading: 'Fruto e semente',
        text:
          'Depois da fecundação, o ovário vira o fruto (pericarpo: epicarpo, mesocarpo e endocarpo) e cada óvulo vira uma semente. O fruto protege e dispersa as sementes (vento, água, animais). A semente tem tegumento, embrião (radícula, hipocótilo, plúmula) e reserva (endosperma ou cotilédones). Falsos frutos (maçã, caju, morango) vêm de outras partes da flor.',
        actions: [
          { label: 'Fruto na planta', structure: 'pericarpo' },
          { label: 'Abrir a semente', model: 'semente' },
          { label: 'Embrião', structure: 'embriao' },
          { label: 'Cotilédones', structure: 'cotiledones' },
          { label: 'Tegumento', structure: 'tegumento' },
        ],
      },
    ],
    keyTerms: ['Coifa', 'Pelo absorvente', 'Endoderme', 'Nó e entrenó', 'Gema apical', 'Câmbio', 'Parênquima paliçádico', 'Estômato', 'Androceu', 'Gineceu', 'Pericarpo', 'Cotilédone'],
    questions: [
      { q: 'Batata é raiz ou caule?', a: 'Caule (tubérculo): tem gemas, os "olhos", de onde brotam novas plantas. Já a batata-doce é raiz.' },
      { q: 'Por que podar a ponta de uma planta a deixa mais ramificada?', a: 'Remove a gema apical e acaba a dominância apical; as gemas axilares brotam.' },
      { q: 'Tomate é fruto ou legume?', a: 'Botanicamente é fruto: vem do ovário e tem sementes.' },
    ],
    misconceptions: ['"Raízes absorvem alimento do solo" — absorvem água e sais; o alimento (açúcar) a planta produz nas folhas.'],
    refs: ['bio-30'],
  },
  {
    id: 'fisiologia-vegetal',
    laboratoryId: LAB,
    unit: 'Botânica',
    title: 'Fisiologia vegetal: transporte, transpiração e fotossíntese',
    grade: '2º ano',
    minutes: 50,
    summary: 'Como a água sobe da raiz até as folhas, como os açúcares são distribuídos e como os estômatos controlam a transpiração e a entrada de CO₂.',
    objectives: [
      'Explicar a absorção de água pela raiz por osmose.',
      'Descrever a subida da seiva bruta pela teoria da coesão-tensão.',
      'Explicar o transporte da seiva elaborada no floema (fonte → dreno).',
      'Relacionar a abertura dos estômatos à luz, à água e ao CO₂.',
    ],
    sections: [
      {
        heading: 'Absorção pela raiz',
        text:
          'Os pelos absorventes captam água por osmose (o interior da raiz é mais concentrado que a solução do solo) e sais minerais por transporte ativo. A água atravessa o córtex por fora das células (apoplasto) ou por dentro (simplasto) até a endoderme, onde as estrias de Caspary obrigam tudo a passar pelas membranas, que selecionam o que entra no xilema.',
        actions: [
          { label: 'Abrir a raiz', model: 'raiz' },
          { label: 'Absorção de água (animação)', process: 'absorcao' },
          { label: 'Zona pilífera', structure: 'zona-pilifera' },
        ],
      },
      {
        heading: 'Seiva bruta: coesão-tensão',
        text:
          'O xilema é formado por células mortas (traqueídes e elementos de vaso), tubos contínuos da raiz às folhas. A água evapora nas folhas (transpiração) e puxa a coluna de água, que não se rompe porque as moléculas de água são coesas (pontes de hidrogênio) e aderem à parede do vaso. Assim uma árvore de 100 m ergue água sem gastar energia. A pressão positiva da raiz (gutação) ajuda pouco.',
        actions: [
          { label: 'Planta inteira', model: 'planta' },
          { label: 'Transporte de seiva (animação)', process: 'transporte' },
          { label: 'Transpiração (animação)', process: 'transpiracao' },
        ],
      },
      {
        heading: 'Seiva elaborada: do açúcar para onde é preciso',
        text:
          'O floema (células vivas: elementos de tubo crivado e células companheiras) leva a sacarose produzida nas folhas (fonte) para raízes, frutos, sementes e brotos (drenos). Hipótese do fluxo de pressão: o açúcar é carregado no floema na fonte, a água entra por osmose, a pressão sobe e a seiva flui até o dreno, onde o açúcar é retirado. Anelar o caule (tirar a casca com o floema) mata a raiz de fome.',
        actions: [
          { label: 'Abrir o caule', model: 'caule' },
          { label: 'Floema', structure: 'floema' },
          { label: 'Transporte no caule (animação)', process: 'transporte-caule' },
        ],
      },
      {
        heading: 'Estômatos: o dilema da planta',
        text:
          'Abrir estômatos permite a entrada de CO₂ para a fotossíntese, mas perde água. As células-guarda ficam túrgidas e abrem o poro com luz e água abundante (entrada de K⁺ e água); fecham no escuro, na seca (hormônio ácido abscísico) ou com CO₂ interno alto. Plantas de ambientes secos têm estômatos em criptas, cutícula grossa e folhas pequenas; cactos abrem estômatos à noite (CAM).',
        actions: [
          { label: 'Abrir a folha', model: 'folha' },
          { label: 'Abertura dos estômatos (animação)', process: 'estomatos' },
          { label: 'Células-guarda', structure: 'celulas-guarda' },
          { label: 'Transpiração na folha', process: 'transpiracao-folha' },
        ],
      },
      {
        heading: 'Fotossíntese e hormônios vegetais',
        text:
          'A folha recebe luz, CO₂ (pelos estômatos) e água (pelo xilema) e produz açúcar e O₂ nos cloroplastos do mesofilo. O crescimento é regulado por hormônios: auxina (alongamento, fototropismo, dominância apical), giberelina (crescimento do caule, germinação), citocinina (divisão celular), etileno (amadurecimento dos frutos: a maçã madura amadurece as outras) e ácido abscísico (dormência, fecha estômatos).',
        actions: [
          { label: 'Fotossíntese na folha (animação)', process: 'fotossintese-folha' },
          { label: 'Cloroplastos do mesofilo', structure: 'cloroplastos' },
        ],
      },
    ],
    keyTerms: ['Osmose', 'Apoplasto/simplasto', 'Estrias de Caspary', 'Xilema', 'Coesão-tensão', 'Floema', 'Fonte e dreno', 'Célula-guarda', 'Ácido abscísico', 'Auxina', 'Etileno'],
    questions: [
      { q: 'Por que regar com água salgada mata a planta?', a: 'O solo fica hipertônico e a raiz perde água por osmose em vez de absorver.' },
      { q: 'Quem gasta energia para subir a seiva bruta?', a: 'Ninguém: a transpiração puxa a coluna de água passivamente.' },
      { q: 'Por que colocar uma banana madura junto das verdes apressa o amadurecimento?', a: 'Ela libera etileno, hormônio gasoso do amadurecimento.' },
    ],
    refs: ['bio-30', 'bio-31'],
  },
  {
    id: 'reproducao-vegetal',
    laboratoryId: LAB,
    unit: 'Botânica',
    title: 'Reprodução das angiospermas e germinação',
    grade: '2º ano',
    minutes: 50,
    summary: 'Polinização, dupla fecundação, formação de fruto e semente, dispersão e germinação, com os grandes grupos de plantas em perspectiva.',
    objectives: [
      'Situar as angiospermas entre briófitas, pteridófitas e gimnospermas.',
      'Diferenciar polinização e fecundação e descrever a dupla fecundação.',
      'Explicar a origem do fruto, da semente e do endosperma.',
      'Descrever as etapas da germinação e os fatores que a controlam.',
    ],
    sections: [
      {
        heading: 'Os grupos de plantas',
        text:
          'Briófitas (musgos): sem vasos, pequenas, dependem de água para a fecundação. Pteridófitas (samambaias): com vasos, sem sementes, esporos na face inferior das folhas. Gimnospermas (pinheiros): sementes nuas em cones, polinização pelo vento. Angiospermas: flores, frutos e sementes; o grupo mais diverso (250 mil espécies), com monocotiledôneas (milho, grama, orquídeas) e eudicotiledôneas (feijão, rosa, ipê).',
        actions: [{ label: 'Planta com flores', model: 'planta' }],
      },
      {
        heading: 'Polinização',
        text:
          'É a transferência do pólen da antera até o estigma. Pode ser pelo vento (anemofilia: flores pequenas, sem cor, muito pólen, como gramíneas), por insetos (entomofilia: abelhas, borboletas; cores, perfume, néctar), por aves (beija-flor: flores vermelhas tubulares) ou morcegos. Autopolinização × polinização cruzada, que aumenta a variabilidade. Sem polinizadores, não há maçã, café, maracujá nem cacau.',
        actions: [
          { label: 'Abrir a flor', model: 'flor' },
          { label: 'Polinização (animação)', process: 'polinizacao' },
          { label: 'Grãos de pólen', structure: 'graos-de-polen' },
          { label: 'Estigma', structure: 'estigma' },
        ],
      },
      {
        heading: 'Dupla fecundação',
        text:
          'No estigma o grão de pólen germina e forma o tubo polínico, que desce pelo estilete até o óvulo levando dois núcleos espermáticos. Um fecunda a oosfera e forma o zigoto (2n, o embrião); o outro se une aos dois núcleos polares e forma o endosperma (3n), a reserva. É exclusiva das angiospermas. O óvulo vira semente e o ovário vira fruto.',
        actions: [
          { label: 'Fecundação (animação)', process: 'fecundacao' },
          { label: 'Estilete', structure: 'estilete' },
          { label: 'Óvulos', structure: 'ovulos' },
        ],
      },
      {
        heading: 'Semente, dispersão e germinação',
        text:
          'A semente fica dormente até encontrar água, oxigênio e temperatura adequada (algumas precisam de luz ou de passar pelo fogo ou pelo tubo digestório de um animal). Germinação: a semente embebe água, as enzimas mobilizam as reservas, a radícula rompe o tegumento e forma a raiz, o hipocótilo se ergue e a plúmula forma as primeiras folhas; até lá o embrião vive dos cotilédones ou do endosperma.',
        actions: [
          { label: 'Abrir a semente', model: 'semente' },
          { label: 'Germinação (animação)', process: 'germinacao' },
          { label: 'Radícula', structure: 'radicula' },
          { label: 'Plúmula', structure: 'plumula' },
        ],
      },
    ],
    keyTerms: ['Briófita', 'Pteridófita', 'Gimnosperma', 'Angiosperma', 'Polinização', 'Tubo polínico', 'Dupla fecundação', 'Endosperma', 'Dormência', 'Germinação'],
    questions: [
      { q: 'Qual a diferença entre polinização e fecundação?', a: 'Polinização é o pólen chegar ao estigma; fecundação é a união dos gametas no óvulo.' },
      { q: 'Por que o endosperma é triploide?', a: 'Vem da união de um núcleo espermático (n) com dois núcleos polares (n + n).' },
      { q: 'O que uma semente precisa para germinar?', a: 'Água, oxigênio e temperatura adequada (às vezes luz).' },
    ],
    refs: ['bio-32', 'bio-26'],
  },
];
