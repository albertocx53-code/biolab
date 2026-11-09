#!/usr/bin/env node
/**
 * Builds the Human Anatomy runtime catalog from the Blender export manifest
 * (tools/blender/export_z_anatomy.py) and the Z-Anatomy translation table.
 *
 *   node scripts/build-human-catalog.mjs <exportDir> <translations.txt>
 *
 * Output (CC BY-SA 4.0, derived from Z-Anatomy / BodyParts3D):
 *   public/models/human/v1/*.glb            (copied)
 *   public/models/human/v1/catalog.json     (meshes, groups, composites, regions)
 */
import fs from 'node:fs';
import path from 'node:path';

const [, , exportDir, translationsFile] = process.argv;
if (!exportDir || !translationsFile) {
  console.error('uso: build-human-catalog.mjs <exportDir> <translations.txt>');
  process.exit(1);
}
const OUT = path.resolve('public/models/human/v1');
fs.mkdirSync(OUT, { recursive: true });

// ---------- translations (English;Latin;Français;Español;Portugues)
const tr = new Map();
for (const line of fs.readFileSync(translationsFile, 'utf8').split('\n')) {
  const p = line.replace(/\r$/, '').split(';');
  if (p.length >= 5 && p[0].trim()) tr.set(p[0].trim().toLowerCase(), { la: p[1].trim(), pt: p[4].trim() });
}
// pt-BR corrections for terms where the source translation is pt-PT or missing
const PT_OVERRIDES = {
  testis: 'Testículo',
  'ductus deferens': 'Ducto deferente',
  'abdominal part of pectoralis major muscle': 'Parte abdominal do músculo peitoral maior',
  'atlas (c1)': 'Atlas (C1)',
  'axis (c2)': 'Áxis (C2)',
  'seminal gland': 'Glândula seminal (vesícula seminal)',
  oesophagus: 'Esôfago',
  'vermiform appendix': 'Apêndice vermiforme',
  'thyroid gland': 'Glândula tireoide',
  'suprarenal gland': 'Glândula suprarrenal',
};
/** Source translations are partly pre-2009 / pt-PT orthography; normalise to pt-BR. */
function toPtBR(s) {
  return s
    .replace(/éia\b/g, 'eia')
    .replace(/óide\b/g, 'oide')
    .replace(/óides\b/g, 'oides')
    .replace(/\bNódulos?\b/g, (m) => (m.endsWith('s') ? 'Linfonodos' : 'Linfonodo'))
    .replace(/\s{2,}/g, ' ')
    .replace(/^Ductus deferens$/, 'Ducto deferente');
}
function baseName(za) {
  let n = za.replace(/\.(l|r)$/, '').trim();
  if (n.startsWith('(') && n.endsWith(')')) n = n.slice(1, -1);
  return n;
}
function names(za) {
  const side = za.endsWith('.l') ? 'esquerdo' : za.endsWith('.r') ? 'direito' : null;
  const b = baseName(za);
  const t = tr.get(b.toLowerCase());
  let pt = PT_OVERRIDES[b.toLowerCase()] ?? t?.pt ?? null;
  if (pt && /[A-Za-z]/.test(pt) && t && pt === b && !PT_OVERRIDES[b.toLowerCase()]) pt = null; // untranslated
  const label = pt ? toPtBR(pt) : b; // fall back to the English TA name
  return {
    pt: side ? `${label} (lado ${side})` : label,
    ptTranslated: !!pt,
    la: t?.la && t.la !== b ? t.la : null,
    en: za,
  };
}

// ---------- manifests
const manifest = {};
for (const f of fs.readdirSync(exportDir).filter((f) => f.startsWith('manifest') && f.endsWith('.json')).sort((a, b) => (a === 'manifest.json' ? -1 : b === 'manifest.json' ? 1 : a.localeCompare(b)))) {
  // manifest.json is the full export; partial re-exports (manifest-*.json) override it
  Object.assign(manifest, JSON.parse(fs.readFileSync(path.join(exportDir, f), 'utf8')));
}
delete manifest.cardiovascular; // superseded by coracao + vasos

const MODELS = {
  tegumentar: 'Pele',
  esqueletico: 'Esqueleto',
  muscular: 'Músculos',
  coracao: 'Coração',
  vasos: 'Vasos sanguíneos',
  nervoso: 'Nervos e órgãos dos sentidos',
  visceral: 'Órgãos (vísceras)',
  linfatico: 'Sistema linfático',
};

// group id -> [name, model, color, visible, opacity, order]
const GROUPS = [
  ['tegumentar', 'Sistema tegumentar (pele)', 'tegumentar', '#D9A98F', true, 0.2],
  ['esqueletico', 'Sistema esquelético', 'esqueletico', '#E8DCC4', true, 1],
  ['muscular', 'Sistema muscular', 'muscular', '#B4473F', false, 1],
  ['fascias', 'Fáscias, ligamentos e bolsas', 'muscular', '#D9C7B3', false, 1],
  ['coracao', 'Coração', 'coracao', '#C0392B', true, 1],
  ['vasos', 'Vasos sanguíneos', 'vasos', '#D64545', false, 1],
  ['nervoso', 'Sistema nervoso (nervos)', 'nervoso', '#E8C547', false, 1],
  ['respiratorio', 'Sistema respiratório', 'visceral', '#E39A9A', true, 1],
  ['digestorio', 'Sistema digestório', 'visceral', '#D69A7E', true, 1],
  ['urinario', 'Sistema urinário', 'visceral', '#D8B26A', true, 1],
  ['reprodutor', 'Sistema reprodutor (masculino)', 'visceral', '#D88C9A', true, 1],
  ['endocrino', 'Sistema endócrino', 'visceral', '#B98CE0', true, 1],
  ['linfatico', 'Sistema linfático', 'linfatico', '#6CC79A', false, 1],
];

function materialClass(group, e) {
  const n = e.za;
  const m = e.mat || '';
  switch (group) {
    case 'tegumentar':
      return 'pele';
    case 'esqueletico':
      return m === 'Teeth' ? 'dente' : m === 'Cartilage' ? 'cartilagem' : 'osso';
    case 'muscular':
      if (/Bursa/.test(m)) return 'bursa';
      if (/Fascia/.test(m)) return 'fascia';
      if (/Ligament|capsule/.test(m)) return 'ligamento';
      if (/Tendon/.test(m) || /tendon|sheath/i.test(n)) return 'tendao';
      if (m === 'Cartilage') return 'cartilagem';
      return 'musculo';
    case 'coracao':
      return /leaflet/i.test(n) ? 'valva' : 'miocardio';
    case 'vasos':
      return m === 'Vein' || m === 'Pulmonary artery' || /vein|sinus|plexus/i.test(n) ? 'veia' : 'arteria';
    case 'nervoso':
      if (/^Nerve/.test(m) || /nerve|plexus|ganglion|root|ramus|branch/i.test(n)) return 'nervo';
      if (/Eye|Cornea|Iris|lens|retina|sclera|vitreous|zonular|eyeball/i.test(m + ' ' + n)) return 'olho';
      if (/Gland/.test(m)) return 'glandula';
      if (/Mucosa/.test(m)) return 'mucosa';
      if (/Cartilage|Ligament|Fascia|Bone/.test(m)) return 'tecido-conjuntivo';
      return 'medula';
    case 'respiratorio':
      return /lobe of .* lung/i.test(n) ? 'pulmao' : /Pleura/.test(n) ? 'membrana' : 'via-aerea';
    case 'digestorio':
      if (/Liver/.test(n)) return 'figado';
      if (/gland|Pancreas/i.test(n)) return 'glandula';
      if (/duct|Bile/i.test(n)) return 'ducto';
      if (/colon|taenia|appendix|Jejunum|Duodenum|Ileum|Caecum|Rectum/i.test(n)) return 'intestino';
      if (/Gingiva|Tongue|palate|pharynx|Mucosa/i.test(n)) return 'mucosa';
      return 'orgao-digestorio';
    case 'urinario':
      return 'urinario';
    case 'reprodutor':
      return 'reprodutor';
    case 'endocrino':
      return 'glandula-endocrina';
    case 'linfatico':
      return /thymus|Spleen|tonsil/i.test(n) ? 'orgao-linfoide' : 'linfonodo';
  }
  return 'default';
}

function fixGroup(model, e) {
  if (model !== 'visceral') return model === 'tegumentar' ? 'tegumentar' : model;
  if (/Gallbladder/.test(e.za)) return 'digestorio';
  if (/Ejaculatory/.test(e.za)) return 'reprodutor';
  return e.group;
}

const round = (a) => a.map((x) => Math.round(x * 1000) / 1000);
const meshes = [];
const models = [];
let untranslated = 0;
for (const [model, entries] of Object.entries(manifest)) {
  const src = path.join(exportDir, `${model}.glb`);
  fs.copyFileSync(src, path.join(OUT, `${model}.glb`));
  models.push({ id: model, url: `/models/human/v1/${model}.glb`, bytes: fs.statSync(src).size, label: MODELS[model] });
  for (const e of entries) {
    if (!/^[a-z0-9-]+$/.test(e.id)) {
      console.warn(`ignorando objeto sem nome válido: ${JSON.stringify(e.za)}`);
      continue;
    }
    let g = fixGroup(model, e);
    // Connective-tissue sheets would hide the muscles they wrap: own layer, off by default.
    if (g === 'muscular' && ['fascia', 'bursa', 'ligamento'].includes(materialClass(g, e))) g = 'fascias';
    const nm = e.id === 'pele' ? { pt: 'Pele', la: 'Cutis', en: 'Skin', ptTranslated: true } : names(e.za);
    if (!nm.ptTranslated) untranslated++;
    meshes.push({ id: e.id, m: model, g, c: materialClass(g === 'fascias' ? 'muscular' : g, e), n: nm.pt, la: nm.la, en: nm.en, ctr: round(e.c), sz: round(e.s) });
  }
}
const ids = new Set(meshes.map((m) => m.id));
if (ids.size !== meshes.length) throw new Error('ids duplicados entre modelos');

// ---------- composites (anatomical structures made of several meshes)
const byRe = (re, group) => meshes.filter((m) => (!group || m.g === group) && re.test(m.en)).map((m) => m.id);
const sided = (side) => (re) => new RegExp(`(${re.source})\\.${side}$`, 'i');
const COMPOSITES = [
  ['coracao', 'Coração', 'Cor', 'coracao', meshes.filter((m) => m.g === 'coracao').map((m) => m.id)],
  ['pulmao-direito', 'Pulmão direito', 'Pulmo dexter', 'respiratorio', byRe(/lobe of right lung$/i)],
  ['pulmao-esquerdo', 'Pulmão esquerdo', 'Pulmo sinister', 'respiratorio', byRe(/lobe of left lung$/i)],
  ['arvore-bronquica', 'Árvore brônquica', 'Arbor bronchialis', 'respiratorio', byRe(/bronch/i, 'respiratorio')],
  ['intestino-grosso', 'Intestino grosso', 'Intestinum crassum', 'digestorio', byRe(/colon$|taenia|appendix|Caecum|Rectum/i, 'digestorio')],
  ['intestino-delgado', 'Intestino delgado', 'Intestinum tenue', 'digestorio', byRe(/^(Duodenum|Jejunum|Ileum)$/i, 'digestorio')],
  ['glandulas-salivares', 'Glândulas salivares maiores', 'Glandulae salivariae majores', 'digestorio', byRe(/(Parotid|Sublingual|Submandibular) gland/i, 'digestorio')],
  ['cranio', 'Crânio', 'Cranium', 'esqueletico', byRe(/^(Parietal bone|Frontal bone|Occipital bone|Sphenoid bone|Temporal bone|Ethmoid bone|Inferior nasal concha bone|Lacrimal bone|Nasal bone|Maxilla|Palatine bone|Zygomatic bone|Mandible|Vomer|Sinus of|.*cells of ethmoid)/i, 'esqueletico')],
  ['coluna-vertebral', 'Coluna vertebral', 'Columna vertebralis', 'esqueletico', byRe(/^(Vertebra|Atlas|Axis|Sacrum|Coccyx)/i, 'esqueletico')],
  ['caixa-toracica', 'Caixa torácica', 'Cavea thoracis', 'esqueletico', byRe(/rib|sternum|Xiphoid/i, 'esqueletico')],
  ['esterno', 'Esterno', 'Sternum', 'esqueletico', byRe(/sternum|Xiphoid/i, 'esqueletico')],
  ['dentes', 'Dentes', 'Dentes', 'esqueletico', byRe(/incisor|canine|premolar|molar/i, 'esqueletico')],
  ['ossiculos-auditivos', 'Ossículos da audição', 'Ossicula auditus', 'esqueletico', byRe(/^(Malleus|Incus|Stapes)/i, 'esqueletico')],
  ...['r', 'l'].flatMap((s) => {
    const sd = s === 'r' ? 'direito' : 'esquerdo';
    const sdF = s === 'r' ? 'direita' : 'esquerda';
    const S = s === 'r' ? 'dir' : 'esq';
    const re = sided(s);
    return [
      [`mao-${S}`, `Ossos da mão ${sdF}`, 'Ossa manus', 'esqueletico', byRe(re(/finger of hand|metacarpal|Capitate|Hamate|Lunate|Pisiform|Scaphoid|Trapezium|Trapezoid|Triquetrum/), 'esqueletico')],
      [`pe-${S}`, `Ossos do pé ${sd}`, 'Ossa pedis', 'esqueletico', byRe(re(/finger of foot|metatarsal|Talus|Calcaneus|Navicular|Cuboid|cuneiform|Sesamoid bones of foot/), 'esqueletico')],
      [`testiculo-${S}-conjunto`, `Testículo e epidídimo (lado ${sd})`, null, 'reprodutor', byRe(re(/Testis|Epididymis/), 'reprodutor')],
    ];
  }),
]
  .map(([id, n, la, g, members]) => ({ id, n, la, g, members }))
  .filter((c) => c.members.length > 0);

// parent relation for leaf meshes (first composite that contains it, most specific first)
const parentOf = {};
for (const c of [...COMPOSITES].sort((a, b) => a.members.length - b.members.length)) {
  for (const id of c.members) parentOf[id] ??= c.id;
}

// ---------- body regions (for "click the arm" exploration), from bone bounds
function boxOf(memberIds, pad) {
  const ms = memberIds.map((id) => meshes.find((m) => m.id === id)).filter(Boolean);
  if (!ms.length) return null;
  const mn = [Infinity, Infinity, Infinity];
  const mx = [-Infinity, -Infinity, -Infinity];
  for (const m of ms)
    for (let i = 0; i < 3; i++) {
      mn[i] = Math.min(mn[i], m.ctr[i] - m.sz[i] / 2);
      mx[i] = Math.max(mx[i], m.ctr[i] + m.sz[i] / 2);
    }
  return { min: round(mn.map((v, i) => v - pad[i])), max: round(mx.map((v, i) => v + pad[i])) };
}
const bone = (re) => byRe(re, 'esqueletico');
const REGIONS = [
  ['cabeca', 'Cabeça', bone(/^(Parietal bone|Frontal bone|Occipital bone|Temporal bone|Maxilla|Mandible|Zygomatic bone|Nasal bone)/), [0.03, 0.03, 0.03]],
  ['pescoco', 'Pescoço', bone(/^(Vertebra C|Atlas|Axis|Hyoid)/), [0.06, 0.0, 0.07]],
  ['torax', 'Tórax', bone(/rib|sternum|Xiphoid|Vertebra T/), [0.03, 0.0, 0.04]],
  ['abdome', 'Abdome', bone(/^Vertebra L/), [0.15, 0.0, 0.16]],
  ['pelve', 'Pelve', bone(/^(Hip bone|Sacrum|Coccyx)/), [0.03, 0.0, 0.05]],
  ...['r', 'l'].flatMap((s) => {
    const sd = s === 'r' ? 'direito' : 'esquerdo';
    const sdF = s === 'r' ? 'direita' : 'esquerda';
    const S = s === 'r' ? 'dir' : 'esq';
    const re = sided(s);
    return [
      [`ombro-${S}`, `Ombro ${sd}`, bone(re(/^(Scapula|Clavicle)/)), [0.04, 0.03, 0.04]],
      [`braco-${S}`, `Braço ${sd}`, bone(re(/^Humerus/)), [0.035, -0.03, 0.04]],
      [`antebraco-${S}`, `Antebraço ${sd}`, bone(re(/^(Radius|Ulna)/)), [0.04, -0.01, 0.04]],
      [`mao-${S}-regiao`, `Mão ${sdF}`, bone(re(/finger of hand|metacarpal|Capitate|Hamate|Lunate|Pisiform|Scaphoid|Trapezium|Trapezoid|Triquetrum/)), [0.03, 0.02, 0.03]],
      [`coxa-${S}`, `Coxa ${sdF}`, bone(re(/^Femur/)), [0.08, -0.03, 0.08]],
      [`perna-${S}`, `Perna ${sdF}`, bone(re(/^(Tibia|Fibula|Patella)/)), [0.06, -0.01, 0.06]],
      [`pe-${S}-regiao`, `Pé ${sd}`, bone(re(/finger of foot|metatarsal|Talus|Calcaneus|Navicular|Cuboid|cuneiform/)), [0.03, 0.03, 0.03]],
    ];
  }),
]
  .map(([id, n, members, pad]) => ({ id, n, ...boxOf(members, pad) }))
  .filter((r) => r.min);

const catalog = {
  version: 1,
  attribution: [
    'BodyParts3D - The Database Center for Life Science - CC-BY-SA 2.1 Japan',
    'Z-Anatomy - The open source atlas of anatomy - CC-BY-SA 4.0',
  ],
  license: 'CC BY-SA 4.0',
  models,
  groups: GROUPS.map(([id, name, modelId, color, defaultVisible, defaultOpacity], order) => ({ id, name, modelId, color, defaultVisible, defaultOpacity, order })),
  meshes,
  parents: parentOf,
  composites: COMPOSITES,
  regions: REGIONS,
};
fs.writeFileSync(path.join(OUT, 'catalog.json'), JSON.stringify(catalog));
const total = models.reduce((a, m) => a + m.bytes, 0);
console.log(`modelos: ${models.length} (${(total / 1e6).toFixed(1)} MB) · malhas: ${meshes.length} · compostos: ${COMPOSITES.length} · regiões: ${REGIONS.length} · sem tradução pt: ${untranslated}`);
console.log('catalog.json', (fs.statSync(path.join(OUT, 'catalog.json')).size / 1e3).toFixed(0), 'kB');
