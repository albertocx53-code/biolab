/**
 * Catalog entries for the organs that BioLab 3D models procedurally
 * (laboratories/human/organs.ts). Kept free of three.js so the catalog index
 * can import it cheaply. `EXTRA_BOUNDS` is measured from the generated
 * geometry (a unit test keeps it in sync).
 */

export const EXTRA_MODEL_ID = 'complementar';
export const FEMALE_GROUP = 'reprodutor-feminino';

export interface ExtraMesh {
  id: string;
  /** Anatomical system group (layers panel). */
  g: string;
  /** Material class. */
  c: string;
  n: string;
  la: string | null;
  en: string;
}

export interface ExtraComposite {
  id: string;
  n: string;
  la: string | null;
  g: string;
  members: string[];
}

const both = (id: string, g: string, c: string, n: string, la: string | null, en: string): ExtraMesh[] => [
  { id: `${id}-esq`, g, c, n: `${n} (lado esquerdo)`, la, en: `${en}.l` },
  { id: `${id}-dir`, g, c, n: `${n} (lado direito)`, la, en: `${en}.r` },
];

/** Meshes this module builds, with the names shown in the interface. */
export const EXTRA_MESHES: ExtraMesh[] = [
  // kidneys
  ...both('cortex-renal', 'urinario', 'cortex-renal', 'Córtex renal', 'Cortex renalis', 'Renal cortex'),
  ...both('medula-renal', 'urinario', 'medula-renal', 'Medula renal (pirâmides)', 'Medulla renalis', 'Renal medulla'),
  ...both('pelve-renal', 'urinario', 'pelve-renal', 'Pelve renal e cálices', 'Pelvis renalis', 'Renal pelvis'),
  // brain
  ...both('lobo-frontal', 'nervoso', 'lobo-frontal', 'Lobo frontal', 'Lobus frontalis', 'Frontal lobe'),
  ...both('lobo-parietal', 'nervoso', 'lobo-parietal', 'Lobo parietal', 'Lobus parietalis', 'Parietal lobe'),
  ...both('lobo-temporal', 'nervoso', 'lobo-temporal', 'Lobo temporal', 'Lobus temporalis', 'Temporal lobe'),
  ...both('lobo-occipital', 'nervoso', 'lobo-occipital', 'Lobo occipital', 'Lobus occipitalis', 'Occipital lobe'),
  { id: 'cerebelo', g: 'nervoso', c: 'cerebelo', n: 'Cerebelo', la: 'Cerebellum', en: 'Cerebellum' },
  { id: 'mesencefalo', g: 'nervoso', c: 'tronco-encefalico', n: 'Mesencéfalo', la: 'Mesencephalon', en: 'Midbrain' },
  { id: 'ponte', g: 'nervoso', c: 'tronco-encefalico', n: 'Ponte', la: 'Pons', en: 'Pons' },
  { id: 'bulbo', g: 'nervoso', c: 'tronco-encefalico', n: 'Bulbo (medula oblonga)', la: 'Medulla oblongata', en: 'Medulla oblongata' },
  { id: 'corpo-caloso', g: 'nervoso', c: 'substancia-branca', n: 'Corpo caloso', la: 'Corpus callosum', en: 'Corpus callosum' },
  ...both('talamo', 'nervoso', 'talamo', 'Tálamo', 'Thalamus', 'Thalamus'),
  { id: 'hipotalamo', g: 'nervoso', c: 'hipotalamo', n: 'Hipotálamo', la: 'Hypothalamus', en: 'Hypothalamus' },
  ...both('ventriculo-lateral', 'nervoso', 'ventriculo', 'Ventrículo lateral', 'Ventriculus lateralis', 'Lateral ventricle'),
  // female reproductive system
  { id: 'utero', g: FEMALE_GROUP, c: 'utero', n: 'Útero', la: 'Uterus', en: 'Uterus' },
  { id: 'colo-do-utero', g: FEMALE_GROUP, c: 'colo-do-utero', n: 'Colo do útero (cérvix)', la: 'Cervix uteri', en: 'Cervix' },
  ...both('tuba-uterina', FEMALE_GROUP, 'tuba-uterina', 'Tuba uterina', 'Tuba uterina', 'Uterine tube'),
  ...both('ovario', FEMALE_GROUP, 'ovario', 'Ovário', 'Ovarium', 'Ovary'),
  { id: 'vagina', g: FEMALE_GROUP, c: 'vagina', n: 'Vagina', la: 'Vagina', en: 'Vagina' },
  { id: 'vulva', g: FEMALE_GROUP, c: 'vulva', n: 'Vulva: pequenos lábios e clitóris', la: 'Vulva', en: 'Vulva' },
  ...both('glandula-mamaria', FEMALE_GROUP, 'glandula-mamaria', 'Glândula mamária', 'Glandula mammaria', 'Mammary gland'),
  // female skin (only in the female body)
  { id: 'pele-vulva', g: 'tegumentar', c: 'pele-genital', n: 'Monte do púbis e grandes lábios', la: 'Mons pubis; labia majora', en: 'Mons pubis and labia majora' },
  ...both('pele-mama', 'tegumentar', 'pele', 'Mama', 'Mamma', 'Breast'),
  ...both('areola', 'tegumentar', 'areola', 'Aréola e papila mamária', 'Areola mammae; papilla mammaria', 'Areola and nipple'),
];

/** Skin pieces that exist only in the female body. */
export const FEMALE_SKIN = ['pele-vulva', 'pele-mama-esq', 'pele-mama-dir', 'areola-esq', 'areola-dir'];


const lr = (id: string) => [`${id}-esq`, `${id}-dir`];
const lobes = (side: 'esq' | 'dir') => ['lobo-frontal', 'lobo-parietal', 'lobo-temporal', 'lobo-occipital'].map((l) => `${l}-${side}`);

export const EXTRA_ORGAN_COMPOSITES: ExtraComposite[] = [
  { id: 'rim-esq', n: 'Rim (lado esquerdo)', la: 'Ren sinister', g: 'urinario', members: ['cortex-renal-esq', 'medula-renal-esq', 'pelve-renal-esq'] },
  { id: 'rim-dir', n: 'Rim (lado direito)', la: 'Ren dexter', g: 'urinario', members: ['cortex-renal-dir', 'medula-renal-dir', 'pelve-renal-dir'] },
  { id: 'rins', n: 'Rins', la: 'Renes', g: 'urinario', members: [...lr('cortex-renal'), ...lr('medula-renal'), ...lr('pelve-renal')] },
  { id: 'hemisferio-cerebral-esq', n: 'Hemisfério cerebral esquerdo', la: 'Hemispherium cerebri sinistrum', g: 'nervoso', members: lobes('esq') },
  { id: 'hemisferio-cerebral-dir', n: 'Hemisfério cerebral direito', la: 'Hemispherium cerebri dextrum', g: 'nervoso', members: lobes('dir') },
  { id: 'cerebro', n: 'Cérebro (telencéfalo)', la: 'Telencephalon', g: 'nervoso', members: [...lobes('esq'), ...lobes('dir'), 'corpo-caloso', ...lr('ventriculo-lateral')] },
  { id: 'tronco-encefalico', n: 'Tronco encefálico', la: 'Truncus encephali', g: 'nervoso', members: ['mesencefalo', 'ponte', 'bulbo'] },
  { id: 'diencefalo', n: 'Diencéfalo', la: 'Diencephalon', g: 'nervoso', members: [...lr('talamo'), 'hipotalamo'] },
  {
    id: 'encefalo',
    n: 'Encéfalo',
    la: 'Encephalon',
    g: 'nervoso',
    members: [...lobes('esq'), ...lobes('dir'), 'corpo-caloso', ...lr('ventriculo-lateral'), ...lr('talamo'), 'hipotalamo', 'cerebelo', 'mesencefalo', 'ponte', 'bulbo'],
  },
  { id: 'sistema-reprodutor-feminino', n: 'Sistema reprodutor feminino', la: 'Organa genitalia feminina', g: FEMALE_GROUP, members: ['utero', 'colo-do-utero', ...lr('tuba-uterina'), ...lr('ovario'), 'vagina', 'vulva'] },
  { id: 'mama-esq', n: 'Mama (lado esquerdo)', la: 'Mamma sinistra', g: FEMALE_GROUP, members: ['pele-mama-esq', 'areola-esq', 'glandula-mamaria-esq'] },
  { id: 'mama-dir', n: 'Mama (lado direito)', la: 'Mamma dextra', g: FEMALE_GROUP, members: ['pele-mama-dir', 'areola-dir', 'glandula-mamaria-dir'] },
];

export const EXTRA_BOUNDS: Record<string, { ctr: [number, number, number]; sz: [number, number, number] }> = {
  'cortex-renal-esq': { ctr: [0.064, 1.108, -0.021], sz: [0.048, 0.099, 0.04] },
  'cortex-renal-dir': { ctr: [-0.056, 1.094, -0.013], sz: [0.048, 0.099, 0.04] },
  'medula-renal-esq': { ctr: [0.071, 1.109, -0.026], sz: [0.033, 0.072, 0.032] },
  'medula-renal-dir': { ctr: [-0.063, 1.095, -0.018], sz: [0.033, 0.072, 0.032] },
  'pelve-renal-esq': { ctr: [0.055, 1.097, -0.013], sz: [0.029, 0.054, 0.028] },
  'pelve-renal-dir': { ctr: [-0.047, 1.083, -0.005], sz: [0.029, 0.054, 0.028] },
  'lobo-frontal-esq': { ctr: [0.033, 1.66, 0.024], sz: [0.059, 0.081, 0.092] },
  'lobo-parietal-esq': { ctr: [0.034, 1.657, -0.033], sz: [0.059, 0.088, 0.079] },
  'lobo-occipital-esq': { ctr: [0.031, 1.653, -0.078], sz: [0.048, 0.072, 0.032] },
  'lobo-temporal-esq': { ctr: [0.037, 1.629, -0.012], sz: [0.052, 0.042, 0.102] },
  'lobo-frontal-dir': { ctr: [-0.033, 1.66, 0.024], sz: [0.059, 0.081, 0.092] },
  'lobo-parietal-dir': { ctr: [-0.034, 1.657, -0.033], sz: [0.059, 0.088, 0.078] },
  'lobo-occipital-dir': { ctr: [-0.031, 1.653, -0.078], sz: [0.048, 0.072, 0.032] },
  'lobo-temporal-dir': { ctr: [-0.037, 1.629, -0.012], sz: [0.051, 0.042, 0.103] },
  'cerebelo': { ctr: [0, 1.593, -0.059], sz: [0.1, 0.048, 0.059] },
  'mesencefalo': { ctr: [0, 1.624, -0.022], sz: [0.025, 0.04, 0.032] },
  'ponte': { ctr: [0, 1.59, -0.023], sz: [0.032, 0.032, 0.038] },
  'bulbo': { ctr: [0, 1.559, -0.033], sz: [0.023, 0.034, 0.037] },
  'corpo-caloso': { ctr: [0, 1.656, -0.015], sz: [0.031, 0.026, 0.075] },
  'talamo-esq': { ctr: [0.009, 1.637, -0.022], sz: [0.015, 0.016, 0.026] },
  'talamo-dir': { ctr: [-0.009, 1.637, -0.022], sz: [0.015, 0.016, 0.026] },
  'hipotalamo': { ctr: [0, 1.623, -0.006], sz: [0.012, 0.011, 0.016] },
  'ventriculo-lateral-esq': { ctr: [0.015, 1.638, -0.013], sz: [0.025, 0.043, 0.063] },
  'ventriculo-lateral-dir': { ctr: [-0.015, 1.638, -0.013], sz: [0.025, 0.043, 0.063] },
  'utero': { ctr: [0, 0.9, -0.022], sz: [0.044, 0.044, 0.056] },
  'colo-do-utero': { ctr: [0, 0.878, -0.052], sz: [0.017, 0.027, 0.028] },
  'vagina': { ctr: [0, 0.812, -0.019], sz: [0.02, 0.133, 0.102] },
  'ovario-esq': { ctr: [0.048, 0.892, -0.036], sz: [0.021, 0.03, 0.019] },
  'ovario-dir': { ctr: [-0.048, 0.892, -0.036], sz: [0.021, 0.03, 0.019] },
  'tuba-uterina-esq': { ctr: [0.045, 0.896, -0.03], sz: [0.047, 0.046, 0.059] },
  'tuba-uterina-dir': { ctr: [-0.045, 0.896, -0.03], sz: [0.047, 0.046, 0.059] },
  'vulva': { ctr: [0, 0.768, 0.056], sz: [0.015, 0.083, 0.059] },
  'pele-vulva': { ctr: [0, 0.768, 0.037], sz: [0.104, 0.16, 0.098] },
  'pele-mama-esq': { ctr: [0.095, 1.266, 0.1], sz: [0.128, 0.137, 0.112] },
  'pele-mama-dir': { ctr: [-0.095, 1.266, 0.1], sz: [0.128, 0.137, 0.112] },
  'areola-esq': { ctr: [0.106, 1.243, 0.157], sz: [0.022, 0.024, 0.012] },
  'areola-dir': { ctr: [-0.106, 1.243, 0.157], sz: [0.022, 0.024, 0.012] },
  'glandula-mamaria-esq': { ctr: [0.094, 1.244, 0.126], sz: [0.092, 0.091, 0.063] },
  'glandula-mamaria-dir': { ctr: [-0.094, 1.244, 0.126], sz: [0.092, 0.091, 0.063] },
};
