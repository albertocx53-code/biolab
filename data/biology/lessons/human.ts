/**
 * Lesson scripts for the Human Body laboratory (pt-BR). Original text for
 * BioLab 3D, checked against OpenStax Anatomy and Physiology 2e (CC BY 4.0).
 * Requires review by a qualified Biology educator before commercial release.
 *
 * Structure ids are mesh or composite ids of the human catalog
 * (public/models/human/v1/catalog.json); `group` ids are the anatomical
 * systems of the layers panel.
 */
import type { Lesson } from './types';

const LAB = 'anatomia-humana' as const;

export const HUMAN_LESSONS: Lesson[] = [
  {
    id: 'sistema-cardiovascular',
    laboratoryId: LAB,
    unit: 'Fisiologia humana',
    title: 'Sistema cardiovascular: coração e circulação',
    grade: '2º ano',
    minutes: 50,
    summary: 'Anatomia do coração, o caminho do sangue nas circulações pulmonar e sistêmica, o ciclo cardíaco, artérias, veias e capilares.',
    objectives: [
      'Localizar as quatro câmaras e as quatro valvas do coração.',
      'Descrever o trajeto do sangue pelas circulações pulmonar e sistêmica.',
      'Explicar sístole e diástole e o que a pressão arterial mede.',
      'Diferenciar artérias, veias e capilares pela estrutura e função.',
    ],
    sections: [
      {
        heading: 'O coração por fora e por dentro',
        text:
          'Órgão muscular do tamanho de um punho, no mediastino, entre os pulmões, com o ápice voltado para a esquerda. Tem quatro câmaras: dois átrios (recebem sangue) e dois ventrículos (bombeiam). O lado direito recebe sangue venoso e o manda aos pulmões; o lado esquerdo recebe sangue arterial e o manda ao corpo, por isso sua parede é mais grossa. O miocárdio é irrigado pelas artérias coronárias.',
        actions: [
          { label: 'Ver coração e vasos', process: 'circulacao' },
          { label: 'Coração', structure: 'coracao' },
          { label: 'Ventrículo esquerdo', structure: 'left-ventricle' },
          { label: 'Átrio direito', structure: 'right-atrium' },
          { label: 'Artérias coronárias', structure: 'arterias-coronarias' },
        ],
      },
      {
        heading: 'Valvas: sentido único',
        text:
          'Entre átrio e ventrículo ficam as valvas atrioventriculares: tricúspide (direita) e mitral ou bicúspide (esquerda), presas por cordas tendíneas aos músculos papilares, que impedem que elas virem ao contrário. Na saída dos ventrículos ficam as valvas semilunares: pulmonar e aórtica. O "tum-tá" do batimento é o fechamento delas: primeiro as atrioventriculares, depois as semilunares.',
        actions: [
          { label: 'Valva tricúspide', structure: 'valva-tricuspide' },
          { label: 'Valva mitral', structure: 'valva-mitral' },
          { label: 'Valva aórtica', structure: 'valva-aortica' },
          { label: 'Valva pulmonar', structure: 'valva-pulmonar' },
        ],
      },
      {
        heading: 'Circulação pulmonar e sistêmica',
        text:
          'Pequena circulação: ventrículo direito → tronco e artérias pulmonares (sangue venoso) → capilares dos pulmões (troca gasosa) → veias pulmonares (sangue arterial) → átrio esquerdo. Grande circulação: ventrículo esquerdo → aorta → artérias → capilares de todos os tecidos → veias → veias cavas → átrio direito. Note que as artérias pulmonares são as únicas artérias com sangue pobre em O₂.',
        bullets: ['Artéria: leva sangue para fora do coração (não necessariamente arterial).', 'Veia: traz sangue para o coração (não necessariamente venoso).'],
        actions: [
          { label: 'Caminho do sangue (animação)', process: 'circulacao' },
          { label: 'Aorta', structure: 'aorta' },
          { label: 'Veias cavas', structure: 'veias-cavas' },
          { label: 'Artérias pulmonares', structure: 'arterias-pulmonares' },
          { label: 'Veias pulmonares', structure: 'veias-pulmonares' },
        ],
      },
      {
        heading: 'Ciclo cardíaco e pressão arterial',
        text:
          'Diástole: o coração relaxa e se enche. Sístole atrial: os átrios se contraem e completam o enchimento dos ventrículos. Sístole ventricular: os ventrículos se contraem, as valvas AV se fecham e o sangue é ejetado. O ritmo nasce no nó sinoatrial (marca-passo natural) e é conduzido pelo nó atrioventricular e pelo feixe de His. A pressão arterial 120/80 mmHg é a pressão máxima na sístole e a mínima na diástole.',
        actions: [{ label: 'Ciclo cardíaco (animação)', process: 'ciclo-cardiaco' }],
      },
      {
        heading: 'Vasos sanguíneos',
        text:
          'Artérias têm parede espessa e elástica para suportar a pressão; arteríolas regulam o fluxo; capilares têm parede de uma célula só e é neles que ocorrem as trocas; vênulas e veias têm parede fina, válvulas e dependem da contração dos músculos ao redor para o retorno venoso. Doenças: hipertensão, aterosclerose (placas de gordura), infarto (obstrução de coronária) e AVC.',
        actions: [
          { label: 'Mostrar todos os vasos', group: 'vasos' },
          { label: 'Artéria braquial (onde se mede a pressão)', structure: 'brachial-artery' },
          { label: 'Aorta torácica', structure: 'thoracic-aorta' },
        ],
      },
    ],
    keyTerms: ['Átrio', 'Ventrículo', 'Valva atrioventricular', 'Valva semilunar', 'Circulação pulmonar', 'Circulação sistêmica', 'Sístole', 'Diástole', 'Nó sinoatrial', 'Capilar'],
    questions: [
      { q: 'Que vaso leva sangue venoso para fora do coração?', a: 'A artéria pulmonar.' },
      { q: 'Por que a parede do ventrículo esquerdo é mais grossa?', a: 'Ele bombeia para o corpo inteiro, contra pressão maior.' },
      { q: 'O que significa 120/80?', a: 'Pressão sistólica de 120 mmHg e diastólica de 80 mmHg.' },
    ],
    misconceptions: ['"Artéria sempre carrega sangue arterial" — as pulmonares carregam sangue venoso.', '"O sangue venoso é azul" — é vermelho-escuro; as veias parecem azuladas pela pele.'],
    refs: ['ap-19', 'ap-20'],
  },
  {
    id: 'sistema-respiratorio',
    laboratoryId: LAB,
    unit: 'Fisiologia humana',
    title: 'Sistema respiratório',
    grade: '2º ano',
    minutes: 50,
    summary: 'Vias aéreas, pulmões, mecânica da ventilação, hematose e o transporte de gases.',
    objectives: [
      'Nomear as estruturas das vias aéreas na ordem em que o ar passa.',
      'Explicar inspiração e expiração pelo diafragma e pelos músculos intercostais.',
      'Descrever a hematose nos alvéolos e o transporte de O₂ e CO₂ no sangue.',
      'Relacionar a respiração ao controle do pH do sangue.',
    ],
    sections: [
      {
        heading: 'O caminho do ar',
        text:
          'Fossas nasais (filtram, aquecem e umedecem) → faringe (compartilhada com o digestório) → laringe (cordas vocais; a epiglote fecha a entrada ao engolir) → traqueia (anéis de cartilagem em C) → brônquios → bronquíolos → alvéolos. Cílios e muco varrem partículas para fora.',
        actions: [
          { label: 'Mostrar sistema respiratório', group: 'respiratorio' },
          { label: 'Traqueia', structure: 'trachea' },
          { label: 'Epiglote', structure: 'epiglottis' },
          { label: 'Árvore brônquica', structure: 'arvore-bronquica' },
        ],
      },
      {
        heading: 'Pulmões',
        text:
          'O pulmão direito tem três lobos e o esquerdo dois (dá lugar ao coração). Cada pulmão tem cerca de 300 milhões de alvéolos, somando uma superfície de troca de 70 m², envolvidos por capilares. A pleura, com uma película de líquido, permite que os pulmões deslizem na caixa torácica.',
        actions: [
          { label: 'Pulmão direito', structure: 'pulmao-direito' },
          { label: 'Pulmão esquerdo', structure: 'pulmao-esquerdo' },
          { label: 'Lobo superior do pulmão direito', structure: 'superior-lobe-of-right-lung' },
        ],
      },
      {
        heading: 'Ventilação: diafragma e intercostais',
        text:
          'Inspiração: o diafragma se contrai e desce, os intercostais externos erguem as costelas, o tórax aumenta, a pressão interna cai e o ar entra. Expiração em repouso: músculos relaxam, o tórax diminui e o ar sai (passivo). O ritmo é comandado pelo bulbo, que responde sobretudo ao CO₂ no sangue, não à falta de O₂.',
        actions: [
          { label: 'Diafragma', structure: 'diaphragm' },
          { label: 'Intercostais externos', structure: 'external-intercostal-muscles-dir' },
          { label: 'Caixa torácica', structure: 'caixa-toracica' },
        ],
      },
      {
        heading: 'Hematose e transporte de gases',
        text:
          'Nos alvéolos o O₂ se difunde para o sangue e o CO₂ para o ar. O O₂ viaja ligado à hemoglobina das hemácias; o CO₂ vai principalmente como bicarbonato no plasma, o que torna a respiração um regulador do pH: reter CO₂ acidifica o sangue, hiperventilar alcaliniza. Monóxido de carbono ocupa o lugar do O₂ na hemoglobina.',
        bullets: ['Ar inspirado: 21% O₂, 0,04% CO₂. Ar expirado: 16% O₂, 4% CO₂.', 'Doenças: asma (bronquíolos estreitam), pneumonia, enfisema (alvéolos destruídos), tuberculose, câncer de pulmão.'],
        actions: [{ label: 'Artérias pulmonares', structure: 'arterias-pulmonares' }],
      },
    ],
    keyTerms: ['Faringe', 'Laringe', 'Epiglote', 'Traqueia', 'Brônquio', 'Alvéolo', 'Diafragma', 'Hematose', 'Hemoglobina', 'Bicarbonato'],
    questions: [
      { q: 'Quando prendemos a respiração, o que nos obriga a respirar: falta de O₂ ou excesso de CO₂?', a: 'O excesso de CO₂, detectado no bulbo.' },
      { q: 'Por que engasgar ao falar comendo?', a: 'A epiglote fica aberta ao falar e o alimento pode entrar na laringe.' },
    ],
    misconceptions: ['"Os pulmões se expandem e por isso o ar entra" — o tórax se expande pelos músculos e o ar entra pela diferença de pressão.'],
    refs: ['ap-22'],
  },
  {
    id: 'sistema-digestorio',
    laboratoryId: LAB,
    unit: 'Fisiologia humana',
    title: 'Sistema digestório',
    grade: '2º ano',
    minutes: 50,
    summary: 'O tubo digestório e as glândulas anexas, a digestão química de cada nutriente e a absorção no intestino.',
    objectives: [
      'Seguir o caminho do alimento da boca ao ânus e nomear cada órgão.',
      'Associar cada enzima ao órgão que a produz e ao nutriente que ela quebra.',
      'Explicar o papel do fígado, do pâncreas e da vesícula biliar.',
      'Descrever a absorção no intestino delgado e a função do intestino grosso.',
    ],
    sections: [
      {
        heading: 'Boca, faringe e esôfago',
        text:
          'Dentes trituram (digestão mecânica); a saliva das glândulas parótidas, submandibulares e sublinguais tem amilase, que começa a quebrar o amido. A língua forma o bolo e empurra para a faringe; o esôfago leva o bolo ao estômago por peristaltismo (ondas de contração), por isso dá para engolir de cabeça para baixo.',
        actions: [
          { label: 'Mostrar sistema digestório', group: 'digestorio' },
          { label: 'Dentes', structure: 'dentes' },
          { label: 'Glândulas salivares', structure: 'glandulas-salivares' },
          { label: 'Língua', structure: 'tongue' },
          { label: 'Esôfago', structure: 'oesophagus' },
        ],
      },
      {
        heading: 'Estômago',
        text:
          'Bolsa muscular que mistura o alimento com o suco gástrico: ácido clorídrico (pH ~2, mata microrganismos e ativa a pepsina) e pepsina (começa a digestão das proteínas). Muco protege a parede. O resultado é o quimo, liberado aos poucos pelo piloro. Úlceras e gastrite estão ligadas à bactéria H. pylori e ao uso de anti-inflamatórios.',
        actions: [
          { label: 'Estômago', structure: 'stomach' },
          { label: 'Mucosa gástrica', structure: 'mucosa-of-stomach' },
        ],
      },
      {
        heading: 'Fígado, vesícula e pâncreas',
        text:
          'O fígado produz a bile (armazenada na vesícula), que emulsifica gorduras; também armazena glicogênio, produz proteínas do sangue e desintoxica. O pâncreas lança no duodeno o suco pancreático, com bicarbonato (neutraliza o ácido) e enzimas para todos os nutrientes: amilase, lipase, tripsina. Também produz insulina e glucagon (função endócrina).',
        actions: [
          { label: 'Fígado', structure: 'liver' },
          { label: 'Vesícula biliar', structure: 'gallbladder' },
          { label: 'Pâncreas', structure: 'pancreas' },
          { label: 'Duodeno', structure: 'duodenum' },
        ],
      },
      {
        heading: 'Intestino delgado e grosso',
        text:
          'No delgado (duodeno, jejuno, íleo; ~6 m) a digestão termina e os nutrientes são absorvidos por vilosidades e microvilosidades, que multiplicam a área. Glicose e aminoácidos vão para o sangue (veia porta → fígado); gorduras vão para a linfa. O grosso (ceco, cólon, reto) absorve água e sais, abriga a microbiota (produz vitamina K) e forma as fezes.',
        actions: [
          { label: 'Intestino delgado', structure: 'intestino-delgado' },
          { label: 'Intestino grosso', structure: 'intestino-grosso' },
          { label: 'Apêndice', structure: 'vermiform-appendix' },
          { label: 'Veia porta', structure: 'hepatic-portal-vein' },
        ],
      },
    ],
    keyTerms: ['Amilase', 'Peristaltismo', 'Pepsina', 'Quimo', 'Bile', 'Suco pancreático', 'Vilosidade', 'Veia porta', 'Microbiota'],
    questions: [
      { q: 'Onde começa e onde termina a digestão do amido?', a: 'Começa na boca (amilase salivar) e termina no intestino delgado (amilase pancreática e enzimas da parede).' },
      { q: 'A bile é uma enzima?', a: 'Não; ela emulsifica a gordura (quebra em gotículas) para a lipase agir.' },
      { q: 'Por que o estômago não se digere?', a: 'O muco protege a parede e a pepsina é secretada inativa (pepsinogênio).' },
    ],
    refs: ['ap-23'],
  },
  {
    id: 'sistema-urinario',
    laboratoryId: LAB,
    unit: 'Fisiologia humana',
    title: 'Sistema urinário e excreção',
    grade: '2º ano',
    minutes: 40,
    summary: 'Rins, néfrons e a formação da urina; o controle da água e dos sais pelo ADH e pela aldosterona.',
    objectives: ['Identificar rins, ureteres, bexiga e uretra.', 'Descrever filtração, reabsorção e secreção no néfron.', 'Explicar como o ADH regula o volume de urina.'],
    sections: [
      {
        heading: 'Órgãos do sistema',
        text:
          'Os rins ficam na região lombar, atrás do peritônio, e recebem 20% do sangue bombeado pelo coração pelas artérias renais. A urina formada desce pelos ureteres até a bexiga, que a armazena (até ~500 mL), e sai pela uretra. Mostre os rins com as artérias e veias renais chegando ao hilo e os ureteres descendo até a bexiga.',
        actions: [
          { label: 'Mostrar sistema urinário', group: 'urinario' },
          { label: 'Rins', structure: 'rins' },
          { label: 'Artéria renal esquerda', structure: 'left-renal-artery' },
          { label: 'Ureter direito', structure: 'ureter-dir' },
          { label: 'Bexiga', structure: 'urinary-bladder' },
          { label: 'Uretra', structure: 'urethra' },
        ],
      },
      {
        heading: 'Por dentro do rim',
        text:
          'Use o botão "Corte do rim" (painel da esquerda) para abrir os dois rins num corte frontal. Por fora fica o córtex, mais claro; por dentro, a medula, formada por pirâmides escuras e estriadas cujas pontas (papilas) apontam para o centro. A urina pinga das papilas nos cálices, que se juntam na pelve renal, a origem do ureter.',
        bullets: ['Córtex: glomérulos e túbulos contorcidos (filtração e reabsorção).', 'Medula: alças de Henle e ductos coletores (concentração da urina).', 'Pelve renal: coleta a urina e a passa ao ureter.'],
        actions: [
          { label: 'Córtex renal', structure: 'cortex-renal-esq' },
          { label: 'Medula renal (pirâmides)', structure: 'medula-renal-esq' },
          { label: 'Pelve renal', structure: 'pelve-renal-esq' },
        ],
      },
      {
        heading: 'O néfron: filtrar, reabsorver, secretar',
        text:
          'Cada rim tem cerca de 1 milhão de néfrons. No glomérulo, a pressão do sangue filtra água e pequenas moléculas para a cápsula de Bowman (180 L por dia!). Ao longo dos túbulos quase tudo é reabsorvido: toda a glicose, a maior parte da água e dos sais. Ureia, excesso de íons e fármacos são secretados. Sobra ~1,5 L de urina por dia.',
        bullets: ['Glicose na urina indica diabetes: o túbulo não dá conta de reabsorver o excesso.', 'Ureia vem da degradação de aminoácidos no fígado; a amônia seria tóxica.'],
      },
      {
        heading: 'Controle hormonal',
        text:
          'ADH (hipófise): quando o sangue está concentrado, aumenta a reabsorção de água e a urina fica escassa e concentrada; álcool inibe o ADH. Aldosterona (suprarrenal): retém sódio e, com ele, água, elevando a pressão. Os rins também produzem eritropoetina (estimula hemácias) e ativam a vitamina D.',
        actions: [
          { label: 'Hipófise', structure: 'adenohypophysis' },
          { label: 'Glândula suprarrenal', structure: 'suprarenal-gland' },
        ],
      },
    ],
    keyTerms: ['Rim', 'Néfron', 'Glomérulo', 'Filtração', 'Reabsorção', 'Ureia', 'ADH', 'Aldosterona', 'Hemodiálise'],
    questions: [
      { q: 'Por que a urina fica mais escura quando bebemos pouca água?', a: 'O ADH aumenta a reabsorção de água e a urina sai mais concentrada.' },
      { q: 'O que a hemodiálise substitui?', a: 'A filtração do sangue pelos rins, retirando ureia e excesso de sais e água.' },
    ],
    refs: ['ap-25'],
  },
  {
    id: 'sistema-nervoso',
    laboratoryId: LAB,
    unit: 'Fisiologia humana',
    title: 'Sistema nervoso',
    grade: '2º ano',
    minutes: 50,
    summary: 'Neurônio e impulso nervoso, sinapse, sistema nervoso central e periférico, arco reflexo e sistema autônomo.',
    objectives: [
      'Descrever o neurônio e o sentido do impulso nervoso.',
      'Explicar a sinapse química e o papel dos neurotransmissores.',
      'Distinguir SNC (encéfalo e medula) de SNP (nervos e gânglios).',
      'Comparar os sistemas simpático e parassimpático.',
    ],
    sections: [
      {
        heading: 'Neurônio e impulso',
        text:
          'O neurônio tem dendritos (recebem), corpo celular e axônio (conduz), muitas vezes envolto por bainha de mielina, que acelera o impulso. O impulso é o potencial de ação: uma onda de entrada de Na⁺ e saída de K⁺ que percorre o axônio sempre no mesmo sentido. Na sinapse, o axônio libera neurotransmissores (acetilcolina, dopamina, serotonina) que excitam ou inibem a célula seguinte. Drogas e medicamentos agem aí.',
      },
      {
        heading: 'Sistema nervoso central',
        text:
          'Encéfalo (cérebro, cerebelo e tronco encefálico) e medula espinal, protegidos por crânio, coluna, meninges e líquor. O córtex cerebral comanda movimento voluntário, sensações, linguagem e memória; o cerebelo coordena e equilibra; o tronco (bulbo) controla respiração e batimentos; o hipotálamo regula temperatura, fome, sede e a hipófise. A medula conduz informações e faz reflexos.',
        actions: [
          { label: 'Encéfalo', structure: 'encefalo' },
          { label: 'Cerebelo', structure: 'cerebelo' },
          { label: 'Tronco encefálico', structure: 'tronco-encefalico' },
          { label: 'Crânio', structure: 'cranio' },
          { label: 'Coluna vertebral', structure: 'coluna-vertebral' },
          { label: 'Corno anterior da medula (motor)', structure: 'anterior-horn-of-spinal-cord' },
          { label: 'Corno posterior da medula (sensitivo)', structure: 'posterior-horn-of-spinal-cord' },
        ],
      },
      {
        heading: 'Lobos do cérebro e corte do encéfalo',
        text:
          'Cada hemisfério tem quatro lobos, separados por sulcos: frontal (planejamento, movimento voluntário, fala), parietal (tato, dor, temperatura, posição do corpo), temporal (audição, compreensão da linguagem, memória) e occipital (visão). No botão "Corte do encéfalo" o modelo é aberto no plano mediano: aparecem o corpo caloso, que une os hemisférios, o ventrículo lateral (cheio de líquor), o tálamo e o hipotálamo, além do cerebelo e do tronco encefálico.',
        bullets: ['Cada hemisfério controla o lado oposto do corpo: as fibras motoras se cruzam no bulbo.', 'O hipotálamo comanda a hipófise e liga o sistema nervoso ao endócrino.'],
        actions: [
          { label: 'Lobo frontal', structure: 'lobo-frontal-esq' },
          { label: 'Lobo parietal', structure: 'lobo-parietal-esq' },
          { label: 'Lobo temporal', structure: 'lobo-temporal-esq' },
          { label: 'Lobo occipital', structure: 'lobo-occipital-esq' },
          { label: 'Corpo caloso', structure: 'corpo-caloso' },
          { label: 'Hipotálamo', structure: 'hipotalamo' },
          { label: 'Bulbo', structure: 'bulbo' },
        ],
      },
      {
        heading: 'Sistema nervoso periférico',
        text:
          '12 pares de nervos cranianos e 31 pares de nervos espinais. Nervos sensitivos levam informação ao SNC; motores levam ordens aos músculos e glândulas. No arco reflexo (retirar a mão do fogo), o neurônio sensitivo faz sinapse na medula direto com o motor, sem esperar o cérebro.',
        actions: [
          { label: 'Mostrar sistema nervoso', group: 'nervoso' },
          { label: 'Nervo ciático (o maior do corpo)', structure: 'sciatic-nerve' },
          { label: 'Nervo ulnar ("choque" no cotovelo)', structure: 'ulnar-nerve' },
          { label: 'Nervo óptico', structure: 'optic-nerve-ii-dir' },
          { label: 'Nervo vago', structure: 'vagus-nerve-x' },
        ],
      },
      {
        heading: 'Sistema nervoso autônomo',
        text:
          'Controla órgãos internos sem consciência. Simpático: situações de luta ou fuga — acelera o coração, dilata pupilas e brônquios, freia a digestão (adrenalina e noradrenalina). Parassimpático (principalmente o nervo vago): repouso e digestão — desacelera o coração e ativa o digestório (acetilcolina).',
        actions: [{ label: 'Nervo vago (parassimpático)', structure: 'vagus-nerve-x' }],
      },
    ],
    keyTerms: ['Neurônio', 'Axônio', 'Mielina', 'Potencial de ação', 'Sinapse', 'Neurotransmissor', 'Encéfalo', 'Medula espinal', 'Arco reflexo', 'Simpático/parassimpático'],
    questions: [
      { q: 'Por que o reflexo é mais rápido que uma resposta voluntária?', a: 'O circuito fecha na medula, sem passar pelo cérebro.' },
      { q: 'O que faz a mielina?', a: 'Isola o axônio e acelera a condução (condução saltatória).' },
    ],
    misconceptions: ['"Usamos só 10% do cérebro" — mito; praticamente todas as regiões têm função conhecida.'],
    refs: ['ap-12', 'ap-13', 'ap-14'],
  },
  {
    id: 'sistema-endocrino',
    laboratoryId: LAB,
    unit: 'Fisiologia humana',
    title: 'Sistema endócrino',
    grade: '2º ano',
    minutes: 40,
    summary: 'Glândulas e hormônios, controle por feedback negativo e os principais eixos: hipófise, tireoide, suprarrenais, pâncreas e gônadas.',
    objectives: ['Definir hormônio e glândula endócrina.', 'Localizar as principais glândulas e associar seus hormônios.', 'Explicar o feedback negativo com o exemplo da glicemia.', 'Relacionar hormônios a diabetes, hipo/hipertireoidismo e estresse.'],
    sections: [
      {
        heading: 'Hipotálamo e hipófise',
        text:
          'O hipotálamo liga o sistema nervoso ao endócrino: comanda a hipófise, a "glândula mestra". A adeno-hipófise produz GH (crescimento), TSH (tireoide), ACTH (suprarrenais), FSH e LH (gônadas) e prolactina. A neuro-hipófise libera ADH (rim) e ocitocina (parto e amamentação). Excesso de GH na infância causa gigantismo; falta, nanismo hipofisário.',
        actions: [
          { label: 'Mostrar sistema endócrino', group: 'endocrino' },
          { label: 'Adeno-hipófise', structure: 'adenohypophysis' },
          { label: 'Neuro-hipófise', structure: 'neurohypophysis' },
          { label: 'Glândula pineal (melatonina)', structure: 'pineal-gland' },
        ],
      },
      {
        heading: 'Tireoide e paratireoides',
        text:
          'A tireoide, no pescoço, produz T3 e T4 (precisam de iodo) que aceleram o metabolismo, e calcitonina (abaixa o cálcio). Hipotireoidismo: cansaço, ganho de peso, frio; hipertireoidismo: agitação, perda de peso. Bócio é o aumento da glândula por falta de iodo (o sal é iodado por isso). As paratireoides produzem paratormônio, que eleva o cálcio no sangue.',
        actions: [
          { label: 'Tireoide', structure: 'thyroid-gland' },
          { label: 'Paratireoide', structure: 'superior-parathyroid-gland-dir' },
        ],
      },
      {
        heading: 'Suprarrenais e pâncreas',
        text:
          'Suprarrenais, sobre os rins: a medula produz adrenalina (resposta rápida ao estresse); o córtex produz cortisol (estresse prolongado, glicemia, anti-inflamatório) e aldosterona (sódio e pressão). O pâncreas, nas ilhotas de Langerhans, produz insulina (baixa a glicemia, leva glicose para dentro das células) e glucagon (sobe a glicemia liberando glicose do glicogênio).',
        bullets: ['Diabetes tipo 1: o pâncreas não produz insulina (autoimune). Tipo 2: as células resistem à insulina; ligado a obesidade e sedentarismo.', 'Feedback negativo: a glicemia alta estimula insulina → glicemia cai → insulina cai.'],
        actions: [
          { label: 'Glândula suprarrenal', structure: 'suprarenal-gland' },
          { label: 'Pâncreas', structure: 'pancreas' },
        ],
      },
      {
        heading: 'Gônadas',
        text: 'Testículos produzem testosterona; ovários produzem estrogênio e progesterona. Comandados por FSH e LH, controlam puberdade, caracteres sexuais secundários, espermatogênese e o ciclo menstrual (ver a aula do sistema reprodutor).',
        actions: [{ label: 'Testículo', structure: 'testis' }],
      },
    ],
    keyTerms: ['Hormônio', 'Hipófise', 'Hipotálamo', 'Tireoide', 'Insulina', 'Glucagon', 'Adrenalina', 'Cortisol', 'Feedback negativo'],
    questions: [
      { q: 'Por que o sal de cozinha é iodado?', a: 'Para evitar o bócio: a tireoide precisa de iodo para fazer T3 e T4.' },
      { q: 'Qual a diferença entre diabetes tipo 1 e tipo 2?', a: 'Tipo 1: falta insulina; tipo 2: há insulina, mas as células não respondem bem.' },
    ],
    refs: ['ap-17'],
  },
  {
    id: 'sistema-locomotor',
    laboratoryId: LAB,
    unit: 'Anatomia humana',
    title: 'Ossos, articulações e músculos',
    grade: '2º ano',
    minutes: 50,
    summary: 'O esqueleto e suas funções, tipos de ossos e articulações, o músculo esquelético e a contração por actina e miosina.',
    objectives: [
      'Nomear os principais ossos do esqueleto axial e apendicular.',
      'Explicar as funções do esqueleto (sustentação, proteção, movimento, reserva de cálcio, produção de sangue).',
      'Descrever a contração muscular pelo deslizamento de actina e miosina.',
      'Entender o par agonista/antagonista com bíceps e tríceps.',
    ],
    sections: [
      {
        heading: 'Esqueleto axial',
        text:
          'Cerca de 206 ossos. O axial protege o SNC e os órgãos do tórax: crânio (8 ossos da caixa craniana + 14 da face), coluna vertebral (7 cervicais, 12 torácicas, 5 lombares, sacro e cóccix, com discos intervertebrais de cartilagem) e caixa torácica (12 pares de costelas e esterno). A medula óssea vermelha produz as células do sangue.',
        actions: [
          { label: 'Mostrar o esqueleto', group: 'esqueletico' },
          { label: 'Crânio', structure: 'cranio' },
          { label: 'Mandíbula', structure: 'mandible' },
          { label: 'Coluna vertebral', structure: 'coluna-vertebral' },
          { label: 'Caixa torácica', structure: 'caixa-toracica' },
          { label: 'Esterno', structure: 'esterno' },
        ],
      },
      {
        heading: 'Esqueleto apendicular',
        text:
          'Membros e cinturas. Membro superior: clavícula e escápula (cintura escapular), úmero, rádio e ulna, carpo, metacarpo e falanges. Membro inferior: osso do quadril (cintura pélvica), fêmur (o maior osso), patela, tíbia e fíbula, tarso, metatarso e falanges. Articulações: fixas (suturas do crânio), semimóveis (vértebras) e móveis (sinoviais: joelho, ombro), com cartilagem, cápsula e ligamentos.',
        actions: [
          { label: 'Úmero', structure: 'humerus' },
          { label: 'Rádio', structure: 'radius' },
          { label: 'Ulna', structure: 'ulna' },
          { label: 'Fêmur', structure: 'femur' },
          { label: 'Tíbia', structure: 'tibia' },
          { label: 'Osso do quadril', structure: 'hip-bone' },
          { label: 'Mão direita', structure: 'mao-dir' },
        ],
      },
      {
        heading: 'Músculos esqueléticos',
        text:
          'Mais de 600 músculos voluntários, estriados, presos aos ossos por tendões. Cada fibra tem miofibrilas de sarcômeros; na contração, as cabeças de miosina puxam os filamentos de actina (gastando ATP e dependendo de cálcio), e o sarcômero encurta. Músculos só puxam, nunca empurram: por isso trabalham em pares antagonistas. Músculo liso (vísceras) e cardíaco são involuntários.',
        actions: [
          { label: 'Mostrar os músculos', group: 'muscular' },
          { label: 'Bíceps braquial (flexiona o antebraço)', structure: 'long-head-of-biceps-brachii' },
          { label: 'Tríceps braquial (estende)', structure: 'long-head-of-triceps-brachii' },
          { label: 'Glúteo máximo', structure: 'gluteus-maximus-muscle-dir' },
          { label: 'Gastrocnêmio (panturrilha)', structure: 'medial-head-of-gastrocnemius-dir' },
          { label: 'Tendão calcâneo (de Aquiles)', structure: 'calcaneal-tendon-dir' },
        ],
      },
      {
        heading: 'Saúde do sistema',
        text: 'Osteoporose (perda de massa óssea, prevenida por cálcio, vitamina D e exercício), fraturas, entorses (ligamentos), distensões (músculos), tendinites e a importância do alongamento e da postura.',
        actions: [{ label: 'Fáscias e ligamentos', group: 'fascias' }],
      },
    ],
    keyTerms: ['Esqueleto axial/apendicular', 'Medula óssea', 'Articulação sinovial', 'Ligamento', 'Tendão', 'Sarcômero', 'Actina e miosina', 'Antagonistas'],
    questions: [
      { q: 'O que acontece com o tríceps quando o bíceps contrai?', a: 'Ele relaxa (antagonista).' },
      { q: 'Onde são produzidas as hemácias?', a: 'Na medula óssea vermelha.' },
    ],
    refs: ['ap-7', 'ap-10'],
  },
  {
    id: 'sistema-imune-linfatico',
    laboratoryId: LAB,
    unit: 'Fisiologia humana',
    title: 'Sistema linfático e imunidade',
    grade: '2º ano',
    minutes: 50,
    summary: 'Linfa, linfonodos e órgãos linfoides; defesas inatas e adaptativas; anticorpos, vacinas e soros.',
    objectives: ['Descrever a circulação da linfa e a função dos linfonodos.', 'Diferenciar imunidade inata e adaptativa.', 'Explicar o papel dos linfócitos B e T e dos anticorpos.', 'Comparar vacina e soro.'],
    sections: [
      {
        heading: 'Sistema linfático',
        text:
          'Vasos linfáticos recolhem o líquido que escapa dos capilares (linfa) e o devolvem às veias perto do coração. No caminho a linfa passa por linfonodos ("ínguas"), cheios de linfócitos, que filtram e detectam invasores. Órgãos linfoides: medula óssea e timo (onde linfócitos nascem e amadurecem), baço (filtra o sangue), tonsilas (amígdalas) e placas do intestino.',
        actions: [
          { label: 'Mostrar sistema linfático', group: 'linfatico' },
          { label: 'Baço', structure: 'spleen' },
          { label: 'Timo', structure: 'left-lobe-of-thymus' },
          { label: 'Tonsila palatina', structure: 'palatine-tonsil-esq' },
          { label: 'Linfonodos axilares', structure: 'anterior-axillary-nodes-dir' },
        ],
      },
      {
        heading: 'Defesas inatas',
        text:
          'Barreiras: pele, muco, cílios, ácido do estômago, lágrimas (lisozima). Se o invasor entra: inflamação (calor, vermelhidão, inchaço e dor, para trazer mais sangue e leucócitos), fagócitos (neutrófilos e macrófagos), células NK, febre e interferons. É rápida e igual para qualquer invasor.',
        actions: [{ label: 'Pele', structure: 'pele' }],
      },
      {
        heading: 'Imunidade adaptativa',
        text:
          'Específica e com memória. Linfócitos B produzem anticorpos (imunidade humoral), que se ligam a antígenos e marcam o invasor. Linfócitos T auxiliares (CD4) coordenam a resposta; T citotóxicos (CD8) matam células infectadas e tumorais. Após o primeiro contato ficam células de memória: na segunda vez a resposta é mais rápida e forte. O HIV destrói justamente os T CD4.',
      },
      {
        heading: 'Vacinas, soros e alergias',
        text:
          'Vacina = imunização ativa: antígeno inofensivo que gera memória; prevenção, efeito lento e duradouro. Soro = imunização passiva: anticorpos prontos (antiofídico, antitetânico); tratamento, efeito imediato e curto. Alergia é resposta exagerada a algo inofensivo (histamina); doenças autoimunes atacam o próprio corpo (lúpus, diabetes tipo 1). Transplantes exigem compatibilidade e imunossupressores.',
      },
    ],
    keyTerms: ['Linfa', 'Linfonodo', 'Baço', 'Timo', 'Inflamação', 'Fagocitose', 'Antígeno', 'Anticorpo', 'Linfócito B e T', 'Memória imunológica', 'Vacina', 'Soro'],
    questions: [
      { q: 'Picada de cobra: vacina ou soro?', a: 'Soro: precisa de anticorpos prontos, agora.' },
      { q: 'Por que a segunda dose da vacina reforça?', a: 'Reativa as células de memória e eleva a quantidade e a qualidade dos anticorpos.' },
    ],
    refs: ['ap-21'],
  },
  {
    id: 'sistema-reprodutor',
    laboratoryId: LAB,
    unit: 'Fisiologia humana',
    title: 'Sistema reprodutor e desenvolvimento',
    grade: '2º ano',
    minutes: 50,
    summary: 'Órgãos reprodutores masculino e feminino, gametas, ciclo menstrual, fecundação, gestação e métodos contraceptivos.',
    objectives: ['Nomear os órgãos dos sistemas reprodutores e suas funções.', 'Descrever a espermatogênese e a ovogênese.', 'Explicar o ciclo menstrual e seus hormônios.', 'Discutir fecundação, gestação, contracepção e ISTs.'],
    sections: [
      {
        heading: 'Sistema reprodutor masculino',
        text:
          'Testículos (na bolsa escrotal, 2 °C abaixo do corpo) produzem espermatozoides nos túbulos seminíferos e testosterona. Os espermatozoides amadurecem no epidídimo, sobem pelo ducto deferente e recebem secreções das vesículas seminais e da próstata, formando o sêmen, que sai pela uretra. Use o botão "Ver sistema feminino" / "Ver sistema masculino" para alternar entre os dois.',
        actions: [
          { label: 'Mostrar sistema reprodutor', group: 'reprodutor' },
          { label: 'Testículo', structure: 'testis' },
          { label: 'Epidídimo', structure: 'epididymis' },
          { label: 'Ducto deferente', structure: 'ductus-deferens' },
          { label: 'Vesícula seminal', structure: 'seminal-gland' },
          { label: 'Próstata', structure: 'prostate' },
        ],
      },
      {
        heading: 'Sistema reprodutor feminino e ciclo menstrual',
        text:
          'Ovários produzem ovócitos (desde o nascimento, em folículos) e os hormônios estrogênio e progesterona. Tubas uterinas captam o ovócito e é nelas que ocorre a fecundação; o útero abriga o embrião; a vagina é o canal do parto. Ciclo de ~28 dias: FSH faz o folículo crescer e produzir estrogênio (espessa o endométrio); pico de LH causa a ovulação (~dia 14); o corpo lúteo produz progesterona; sem gravidez ele regride e o endométrio descama (menstruação).',
        bullets: ['No modelo, repare que o útero fica inclinado para a frente, sobre a bexiga, e que as fímbrias da tuba envolvem o ovário sem estar presas a ele.'],
        actions: [
          { label: 'Mostrar sistema feminino', group: 'reprodutor-feminino' },
          { label: 'Ovário', structure: 'ovario-esq' },
          { label: 'Tuba uterina', structure: 'tuba-uterina-esq' },
          { label: 'Útero', structure: 'utero' },
          { label: 'Colo do útero', structure: 'colo-do-utero' },
          { label: 'Vagina', structure: 'vagina' },
        ],
      },
      {
        heading: 'Fecundação e gestação',
        text:
          'Um espermatozoide atravessa a corona radiata e a zona pelúcida (acrossomo) e seus núcleos se unem: o zigoto (2n) começa a se dividir (clivagem), vira mórula e blastocisto e se implanta no endométrio por volta do 7º dia. A placenta troca gases e nutrientes entre mãe e feto sem misturar os sangues e produz hCG (detectado no teste de gravidez). Gestação: ~40 semanas; gêmeos monozigóticos vêm de um zigoto, dizigóticos de dois.',
      },
      {
        heading: 'Contracepção e ISTs',
        text:
          'Métodos: barreira (camisinha masculina e feminina: os únicos que previnem ISTs), hormonais (pílula, injeção, adesivo, DIU hormonal: inibem a ovulação), DIU de cobre, laqueadura e vasectomia (definitivos), tabelinha (pouco eficaz). ISTs: HIV/aids, sífilis, gonorreia, clamídia, HPV (vacina), herpes, hepatite B (vacina). Diagnóstico e tratamento gratuitos no SUS.',
      },
    ],
    keyTerms: ['Testículo', 'Epidídimo', 'Ovário', 'Tuba uterina', 'Útero', 'Endométrio', 'Ovulação', 'FSH e LH', 'Corpo lúteo', 'Zigoto', 'Placenta', 'IST'],
    questions: [
      { q: 'Em que dia do ciclo de 28 dias costuma ocorrer a ovulação?', a: 'Por volta do 14º dia, após o pico de LH.' },
      { q: 'Por que a pílula evita a gravidez?', a: 'Os hormônios bloqueiam o pico de FSH/LH e não há ovulação.' },
      { q: 'Qual método previne ISTs?', a: 'Somente os de barreira (preservativos).' },
    ],
    refs: ['ap-27', 'ap-28'],
  },
];
