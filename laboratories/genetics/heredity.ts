/**
 * Mendelian crosses for the Punnett-square tool: gene presets (complete and
 * incomplete dominance, codominance and multiple alleles in the ABO system,
 * X-linked inheritance), gametes, offspring and the genotypic and phenotypic
 * proportions. Pure functions, shared by the tool and the unit tests.
 */

export interface Phenotype {
  label: string;
  color: string;
}

export interface GenePreset {
  id: string;
  label: string;
  /** What the example shows (inheritance pattern). */
  pattern: string;
  note: string;
  /** Genotypes offered for each parent (two alleles each). */
  mother: string[][];
  father: string[][];
  /** Allele order used to write genotypes (dominant first). */
  order: string[];
  phenotype(g: string[]): Phenotype;
  /** Labels of the two parents (e.g. mãe/pai, planta 1/planta 2). */
  parents: [string, string];
}

const has = (g: string[], a: string) => g.includes(a);

export const GENE_PRESETS: GenePreset[] = [
  {
    id: 'ervilha-cor',
    label: 'Ervilha: cor da semente',
    pattern: 'Dominância completa (1ª lei de Mendel)',
    note: 'A (amarela) domina a (verde). Cruze Aa × Aa para ver a proporção 3 : 1 de Mendel.',
    mother: [['A', 'A'], ['A', 'a'], ['a', 'a']],
    father: [['A', 'A'], ['A', 'a'], ['a', 'a']],
    order: ['A', 'a'],
    phenotype: (g) => (has(g, 'A') ? { label: 'Amarela', color: '#EAB308' } : { label: 'Verde', color: '#22C55E' }),
    parents: ['Planta 1', 'Planta 2'],
  },
  {
    id: 'ervilha-textura',
    label: 'Ervilha: textura da semente',
    pattern: 'Dominância completa (1ª lei de Mendel)',
    note: 'B (lisa) domina b (rugosa).',
    mother: [['B', 'B'], ['B', 'b'], ['b', 'b']],
    father: [['B', 'B'], ['B', 'b'], ['b', 'b']],
    order: ['B', 'b'],
    phenotype: (g) => (has(g, 'B') ? { label: 'Lisa', color: '#A3E635' } : { label: 'Rugosa', color: '#65A30D' }),
    parents: ['Planta 1', 'Planta 2'],
  },
  {
    id: 'maravilha',
    label: 'Maravilha: cor da flor',
    pattern: 'Dominância incompleta',
    note: 'V (vermelha) e B (branca) não dominam um ao outro: o heterozigoto VB é rosa. Proporção 1 : 2 : 1 para fenótipos e genótipos.',
    mother: [['V', 'V'], ['V', 'B'], ['B', 'B']],
    father: [['V', 'V'], ['V', 'B'], ['B', 'B']],
    order: ['V', 'B'],
    phenotype: (g) => {
      const v = g.filter((a) => a === 'V').length;
      return v === 2 ? { label: 'Vermelha', color: '#DC2626' } : v === 1 ? { label: 'Rosa', color: '#F472B6' } : { label: 'Branca', color: '#F1F5F9' };
    },
    parents: ['Planta 1', 'Planta 2'],
  },
  {
    id: 'abo',
    label: 'Sistema ABO (tipo sanguíneo)',
    pattern: 'Alelos múltiplos e codominância',
    note: 'Iᴬ e Iᴮ são codominantes e ambos dominam i. Pais Iᴬi × Iᴮi podem ter filhos dos quatro tipos.',
    mother: [['Iᴬ', 'Iᴬ'], ['Iᴬ', 'i'], ['Iᴮ', 'Iᴮ'], ['Iᴮ', 'i'], ['Iᴬ', 'Iᴮ'], ['i', 'i']],
    father: [['Iᴬ', 'Iᴬ'], ['Iᴬ', 'i'], ['Iᴮ', 'Iᴮ'], ['Iᴮ', 'i'], ['Iᴬ', 'Iᴮ'], ['i', 'i']],
    order: ['Iᴬ', 'Iᴮ', 'i'],
    phenotype: (g) => {
      const a = has(g, 'Iᴬ');
      const b = has(g, 'Iᴮ');
      if (a && b) return { label: 'Tipo AB', color: '#A855F7' };
      if (a) return { label: 'Tipo A', color: '#EF4444' };
      if (b) return { label: 'Tipo B', color: '#3B82F6' };
      return { label: 'Tipo O', color: '#94A3B8' };
    },
    parents: ['Mãe', 'Pai'],
  },
  {
    id: 'daltonismo',
    label: 'Daltonismo',
    pattern: 'Herança ligada ao cromossomo X (recessiva)',
    note: 'O alelo Xᵈ é recessivo e fica no cromossomo X. Homens (XY) têm um só X, por isso são afetados com mais frequência. Mulheres Xᴰ Xᵈ são portadoras.',
    mother: [['Xᴰ', 'Xᴰ'], ['Xᴰ', 'Xᵈ'], ['Xᵈ', 'Xᵈ']],
    father: [['Xᴰ', 'Y'], ['Xᵈ', 'Y']],
    order: ['Xᴰ', 'Xᵈ', 'Y'],
    phenotype: (g) => {
      if (has(g, 'Y')) return has(g, 'Xᴰ') ? { label: 'Menino com visão normal', color: '#38BDF8' } : { label: 'Menino daltônico', color: '#1D4ED8' };
      const d = g.filter((a) => a === 'Xᵈ').length;
      return d === 0 ? { label: 'Menina com visão normal', color: '#F9A8D4' } : d === 1 ? { label: 'Menina portadora (visão normal)', color: '#F472B6' } : { label: 'Menina daltônica', color: '#BE185D' };
    },
    parents: ['Mãe', 'Pai'],
  },
];

/** Dihybrid cross of pea colour and texture (2nd law: independent assortment). */
export const DIHYBRID = {
  genes: [GENE_PRESETS[0], GENE_PRESETS[1]] as const,
  note: 'Os dois genes estão em cromossomos diferentes e se separam de forma independente (2ª lei de Mendel). AaBb × AaBb dá a proporção 9 : 3 : 3 : 1.',
};

export const sortGenotype = (g: string[], order: string[]) => [...g].sort((a, b) => order.indexOf(a) - order.indexOf(b));

/** Distinct gametes of a parent (each equally likely). For two genes, every combination of one allele from each. */
export function gametes(genotypes: string[][]): string[][] {
  let out: string[][] = [[]];
  for (const g of genotypes) {
    const alleles = [...new Set(g)];
    out = out.flatMap((prefix) => alleles.map((a) => [...prefix, a]));
  }
  return out;
}

export interface Cross {
  rows: string[][];
  cols: string[][];
  /** cells[r][c]: the child's genotype per gene (each sorted). */
  cells: string[][][][];
  genotypes: { key: string; count: number }[];
  phenotypes: { label: string; color: string; count: number }[];
  total: number;
}

/** Punnett square of mother × father for one or two genes. */
export function cross(presets: GenePreset[], mother: string[][], father: string[][]): Cross {
  const rows = gametes(mother);
  const cols = gametes(father);
  const cells = rows.map((r) => cols.map((c) => presets.map((p, k) => sortGenotype([r[k], c[k]], p.order))));
  const gen = new Map<string, number>();
  const phen = new Map<string, { label: string; color: string; count: number }>();
  for (const row of cells)
    for (const cell of row) {
      const key = cell.map((g) => g.join('')).join(' ');
      gen.set(key, (gen.get(key) ?? 0) + 1);
      const ph = cell.map((g, k) => presets[k].phenotype(g));
      const label = ph.map((p) => p.label).join(' e ');
      const prev = phen.get(label);
      phen.set(label, { label, color: ph[0].color, count: (prev?.count ?? 0) + 1 });
    }
  const total = rows.length * cols.length;
  return {
    rows,
    cols,
    cells,
    genotypes: [...gen.entries()].map(([key, count]) => ({ key, count })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key)),
    phenotypes: [...phen.values()].sort((a, b) => b.count - a.count),
    total,
  };
}

/** Smallest whole-number ratio of counts (e.g. [2, 1, 1] → "2 : 1 : 1"). */
export function ratio(counts: number[]) {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = counts.reduce((a, b) => gcd(a, b));
  return counts.map((c) => c / g).join(' : ');
}
