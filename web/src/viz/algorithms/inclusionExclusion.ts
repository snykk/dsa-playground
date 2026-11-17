/**
 * Inclusion-exclusion tracers, drawn with VennView: a Venn diagram of up to three sets whose
 * intersections are filled term by term (added for an odd subset, subtracted for an even one),
 * every region showing how many times its elements are counted so far, beside the table of
 * terms and the running total.
 *
 * Mirrors Problem_Patterns/Inclusion_Exclusion_Principle/Python/inclusion_exclusion.py:
 *   count_divisible(n, divisors): masks 1..2^k - 1 in increasing order; the lcm grows one
 *     divisor at a time as lcm * d // gcd(lcm, d); odd subsets add n // lcm, even ones subtract
 *     it; n < 1 returns 0 at once (1..n is empty);
 *   count_union_sets(sets): the same masks; each intersection starts from the FIRST set in the
 *     subset (set(sets[j])) and is narrowed with &; odd sizes add, even sizes subtract.
 * Golden fixtures (__fixtures__/patternsMore.json, sections "divisible" and "union") pin every
 * term's subset size and lcm or intersection size, and the result.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { VennAtomView, VennElementView, VennState, VennTableRow } from '../renderers/VennView';

export const IE_LIMITS = { maxSets: 3, maxDivisor: 999, minN: -999, maxN: 1e9, maxElement: 99, maxSetSize: 6 };

const NAMES = ['A', 'B', 'C'];

/* ---------- input ---------- */

export interface DivisibleInput {
  n: number;
  divisors: number[];
}

export function parseDivisible(text: string): DivisibleInput {
  const m = text.match(/^\s*(?:n\s*[:=]?\s*)?(-?\d+)\s*[;|]\s*(?:divisors?\s*[:=]?\s*)?(.*)$/i);
  if (!m) throw new InputError('Write n, then the divisors: "n 100; divisors 2, 3, 5".');
  const n = Number(m[1]);
  if (n < IE_LIMITS.minN || n > IE_LIMITS.maxN) throw new InputError(`n goes from ${IE_LIMITS.minN} to 10^9 here (got ${m[1]}).`);
  const tokens = m[2].split(/[\s,]+/).filter(Boolean);
  if (tokens.length === 0) throw new InputError('Give at least one divisor, as in "n 100; divisors 2, 3".');
  if (tokens.length > IE_LIMITS.maxSets) throw new InputError(`At most ${IE_LIMITS.maxSets} divisors: the Venn diagram draws three sets (7 terms) clearly.`);
  const divisors = tokens.map((t) => {
    if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number.`);
    const d = Number(t);
    if (d === 0) throw new InputError('A divisor of 0 makes the lcm 0, and for n >= 1 the term n // 0 raises ZeroDivisionError in Python. Divisors start at 1.');
    if (d < 1 || d > IE_LIMITS.maxDivisor) throw new InputError(`Divisors go from 1 to ${IE_LIMITS.maxDivisor} here (got ${t}); the C++ and Go versions require divisors >= 1 too.`);
    return d;
  });
  return { n, divisors };
}

export function parseUnionSets(text: string): number[][] {
  const parts = text.split('|');
  if (parts.length > IE_LIMITS.maxSets) throw new InputError(`At most ${IE_LIMITS.maxSets} sets, separated by "|": the Venn diagram draws three sets clearly.`);
  return parts.map((p) => {
    const tokens = p.split(/[\s,]+/).filter(Boolean);
    if (tokens.length > IE_LIMITS.maxSetSize) throw new InputError(`At most ${IE_LIMITS.maxSetSize} elements per set, so every region has room for them (got ${tokens.length}).`);
    return tokens.map((t) => {
      if (!/^\d+$/.test(t)) throw new InputError(`"${t}": elements are whole numbers from 0 to ${IE_LIMITS.maxElement}.`);
      const v = Number(t);
      if (v > IE_LIMITS.maxElement) throw new InputError(`Elements go from 0 to ${IE_LIMITS.maxElement} here (got ${t}).`);
      return v;
    });
  });
}

/* ---------- arithmetic, as in the Python ---------- */

export function gcd(a: number, b: number): number {
  while (b) [a, b] = [b, a % b];
  return a;
}

const popcount = (x: number) => x.toString(2).split('').filter((c) => c === '1').length;
const bitsOf = (mask: number, k: number) => Array.from({ length: k }, (_, j) => j).filter((j) => mask & (1 << j));

/** lcm of the divisors whose bit is set, built in j order like the code. */
function lcmOf(mask: number, divisors: number[]): number {
  let lcm = 1;
  for (const j of bitsOf(mask, divisors.length)) lcm = (lcm * divisors[j]) / gcd(lcm, divisors[j]);
  return lcm;
}

/** Numbers in 1..n divisible by exactly the divisors of mask (a Venn region), by inclusion-exclusion over supersets. */
function exactly(n: number, divisors: number[], mask: number): number {
  const k = divisors.length;
  let total = 0;
  for (let t = 1; t < 1 << k; t++) {
    if ((t & mask) !== mask) continue;
    const sign = (popcount(t) - popcount(mask)) % 2 === 0 ? 1 : -1;
    total += sign * Math.floor(n / lcmOf(t, divisors));
  }
  return Math.max(0, total);
}

/* ---------- shared frame building ---------- */

/** How many times the elements of region `atom` are counted after the terms in `applied`. */
function coverage(atom: number, applied: number[]): number {
  return applied.reduce((s, t) => ((t & atom) === t ? s + (popcount(t) % 2 === 1 ? 1 : -1) : s), 0);
}

const covRole = (c: number): Role | undefined => (c === 1 ? 'good' : c >= 2 ? 'bad' : undefined);
const timesText = (c: number) => (c === 0 ? 'not counted' : c === 1 ? 'counted 1x' : `counted ${c}x`);

const subsetText = (mask: number, labels: string[]) => `{${bitsOf(mask, labels.length).map((j) => labels[j]).join(', ')}}`;
const maskText = (mask: number, k: number) => mask.toString(2).padStart(k, '0');

/* ---------- count_divisible ---------- */

export const DIVISIBLE_CODE = [
  'count_divisible(n, divisors):',
  '  if n < 1: return 0                  # 1..n is empty',
  '  result = 0; k = len(divisors)',
  '  for i in range(1, 2**k):            # every non-empty subset, as a bitmask',
  '    count = 0; lcm = 1',
  '    for j in range(k):',
  '      if i & (1 << j): count += 1; lcm = lcm * divisors[j] // gcd(lcm, divisors[j])',
  '    if count % 2 == 1: result += n // lcm   # odd subset: add',
  '    else: result -= n // lcm                # even subset: subtract',
  '  return result',
  'gcd(a, b): while b: a, b = b, a % b; return a',
];

/** [mask, subset size, lcm] for every term, as the fixture records them. */
export type DivisibleTerm = [number, number, number];

export interface DivisibleRun {
  frames: Array<Frame<VennState>>;
  terms: DivisibleTerm[];
  result: number;
}

export function divisibleTrace({ n, divisors }: DivisibleInput): DivisibleRun {
  const frames: Array<Frame<VennState>> = [];
  const k = divisors.length;
  const labels = divisors.map(String);
  const applied: number[] = [];
  const rows: VennTableRow[] = [];
  const terms: DivisibleTerm[] = [];
  let result = 0;
  const atomsShown = n >= 1;

  const snap = (line: number | undefined, caption: string, o: { focus?: VennState['focus']; vars?: Array<[string, string | number]>; resultRole?: Role; final?: boolean } = {}) => {
    const atoms: VennAtomView[] = [];
    for (let mask = 1; mask < 1 << k; mask++) {
      const c = coverage(mask, applied);
      atoms.push({ mask, main: atomsShown ? String(exactly(n, divisors, mask)) : '0', sub: timesText(c), role: covRole(c) });
    }
    frames.push({
      line,
      caption,
      vars: o.vars,
      state: {
        label: `Multiples of ${labels.join(', ')} among 1..${n}`,
        sets: divisors.map((d, j) => ({ label: `${NAMES[j]}: ${d}`, sub: atomsShown ? `${Math.floor(n / d)} multiples` : '' })),
        focus: o.focus,
        atoms,
        universe: n >= 1 ? `1..${n}` : 'empty: n < 1',
        outside: o.final && atomsShown ? `in no set: ${n - result}` : undefined,
        columns: ['mask', 'subset', 'lcm', 'n // lcm', 'sign', 'result'],
        rows: rows.map((r, i) => ({ ...r, role: i === rows.length - 1 && !o.final ? r.role : undefined })),
        total: { label: 'result', value: String(result), role: o.resultRole },
      },
    });
  };

  snap(
    0,
    `count_divisible(${n}, [${divisors.join(', ')}]): the numbers in 1..${n} divisible by at least one divisor form the union of ${k === 1 ? 'one set' : `${k} sets`} of multiples. ` +
      'Each region shows how many numbers lie in exactly those sets.',
  );
  if (n < 1) {
    snap(1, `n = ${n} < 1, so 1..n is empty and the function returns 0. (Without this check, n // lcm would floor to a negative count.)`, { vars: [['result', 0]], final: true });
    return { frames, terms, result: 0 };
  }
  snap(2, `result = 0. There are 2^${k} - 1 = ${2 ** k - 1} non-empty subsets of the divisors, one term each.`, { vars: [['k', k]] });

  for (let i = 1; i < 1 << k; i++) {
    let lcm = 1;
    let count = 0;
    for (const j of bitsOf(i, k)) {
      count += 1;
      const g = gcd(lcm, divisors[j]);
      const before = lcm;
      lcm = (lcm * divisors[j]) / g;
      const sofar = bitsOf(i, k).filter((x) => x <= j).reduce((m, x) => m | (1 << x), 0);
      snap(
        6,
        `mask ${maskText(i, k)}: bit ${j} is set, so ${divisors[j]} is in the subset. lcm = ${before} * ${divisors[j]} // gcd(${before}, ${divisors[j]}) = ${before * divisors[j]} // ${g} = ${lcm}: ` +
          `a number is in all of these sets exactly when it is a multiple of ${lcm}.`,
        { focus: { mask: sofar, role: 'compare' }, vars: [['i', i], ['j', j], ['count', count], ['lcm', lcm]] },
      );
    }
    const add = count % 2 === 1;
    const amount = Math.floor(n / lcm);
    result += add ? amount : -amount;
    applied.push(i);
    terms.push([i, count, lcm]);
    rows.push({ cells: [maskText(i, k), subsetText(i, labels), String(lcm), String(amount), add ? '+' : '-', String(result)], role: add ? 'active' : 'compare' });
    const over = add ? '' : ' Those numbers were counted once too often by the smaller subsets.';
    snap(
      add ? 7 : 8,
      `${count} divisor${count === 1 ? '' : 's'} (${add ? 'odd' : 'even'}): ${add ? 'add' : 'subtract'} n // ${lcm} = ${n} // ${lcm} = ${amount}, the multiples of ${lcm}. result = ${result}.${over}`,
      { focus: { mask: i, role: add ? 'active' : 'compare', sign: add ? '+' : '-' }, vars: [['i', i], ['count', count], ['lcm', lcm], ['n // lcm', amount], ['result', result]], resultRole: 'active' },
    );
  }
  snap(9, `Done: return ${result}. After all ${2 ** k - 1} terms every region is counted exactly once (each check), which is the inclusion-exclusion identity. ${n - result} numbers in 1..${n} are divisible by none.`, {
    vars: [['result', result]],
    resultRole: 'done',
    final: true,
  });
  return { frames, terms, result };
}

/* ---------- count_union_sets ---------- */

export const UNION_CODE = [
  'count_union_sets(sets):',
  '  n = len(sets); result = 0',
  '  for i in range(1, 2**n):',
  '    intersection = None; count = 0',
  '    for j in range(n):',
  '      if i & (1 << j):',
  '        count += 1',
  '        if intersection is None: intersection = set(sets[j])   # the first set in the subset',
  '        else: intersection = intersection & set(sets[j])',
  '    if count % 2 == 1: result += len(intersection)',
  '    else: result -= len(intersection)',
  '  return result',
];

/** [mask, subset size, intersection size] for every term, as the fixture records them. */
export type UnionTerm = [number, number, number];

export interface UnionRun {
  frames: Array<Frame<VennState>>;
  terms: UnionTerm[];
  result: number;
}

export function unionTrace(sets: number[][]): UnionRun {
  const frames: Array<Frame<VennState>> = [];
  const k = sets.length;
  const asSets = sets.map((s) => new Set(s));
  const elements = [...new Set(sets.flat())].sort((a, b) => a - b);
  const atomOf = new Map(elements.map((e) => [e, asSets.reduce((m, s, j) => (s.has(e) ? m | (1 << j) : m), 0)]));
  const applied: number[] = [];
  const rows: VennTableRow[] = [];
  const terms: UnionTerm[] = [];
  let result = 0;
  const setText = (s: Set<number>) => `{${[...s].sort((a, b) => a - b).join(', ')}}`;

  const snap = (line: number | undefined, caption: string, o: { focus?: VennState['focus']; lit?: Set<number>; vars?: Array<[string, string | number]>; resultRole?: Role; final?: boolean } = {}) => {
    const atoms: VennAtomView[] = [];
    for (let mask = 1; mask < 1 << k; mask++) atoms.push({ mask, main: '', sub: '' });
    const els: VennElementView[] = elements.map((e) => {
      const c = coverage(atomOf.get(e)!, applied);
      return { id: `e${e}`, mask: atomOf.get(e)!, label: String(e), count: c, role: o.lit?.has(e) ? 'active' : covRole(c) };
    });
    frames.push({
      line,
      caption,
      vars: o.vars,
      state: {
        label: `Sets ${sets.map((s, j) => `${NAMES[j]} = {${s.join(', ')}}`).join(', ')}`,
        sets: sets.map((_, j) => ({ label: NAMES[j], sub: `${asSets[j].size} element${asSets[j].size === 1 ? '' : 's'}` })),
        focus: o.focus,
        atoms,
        elements: els,
        universe: 'the elements of the sets',
        columns: ['mask', 'subset', 'intersection', 'size', 'sign', 'result'],
        rows: rows.map((r, i) => ({ ...r, role: i === rows.length - 1 && !o.final ? r.role : undefined })),
        total: { label: 'result', value: String(result), role: o.resultRole },
      },
    });
  };

  snap(0, `count_union_sets with ${k} set${k === 1 ? '' : 's'}: ${sets.map((_, j) => `${NAMES[j]} = ${setText(asSets[j])}`).join(', ')}. Each dot is one element, placed in the region of the sets that contain it; its mark says how often it is counted.`);
  snap(1, `result = 0. ${2 ** k - 1} non-empty subsets of the ${k} set${k === 1 ? '' : 's'}, one term each.`, { vars: [['n', k]] });
  for (let i = 1; i < 1 << k; i++) {
    let inter: Set<number> | null = null;
    let count = 0;
    let sofar = 0;
    for (const j of bitsOf(i, k)) {
      count += 1;
      sofar |= 1 << j;
      if (inter === null) {
        inter = new Set(asSets[j]);
        snap(7, `mask ${maskText(i, k)}: ${NAMES[j]} is the first set in this subset, so intersection = set(sets[${j}]) = ${setText(inter)}. (Starting from sets[0] for every subset was the old bug.)`, {
          focus: { mask: sofar, role: 'compare' },
          lit: inter,
          vars: [['i', i], ['j', j], ['count', count]],
        });
      } else {
        const prev: Set<number> = inter;
        inter = new Set([...prev].filter((e) => asSets[j].has(e)));
        snap(8, `${NAMES[j]} is in the subset too: intersection & set(sets[${j}]) = ${setText(prev)} & ${setText(asSets[j])} = ${setText(inter)}.`, {
          focus: { mask: sofar, role: 'compare' },
          lit: inter,
          vars: [['i', i], ['j', j], ['count', count]],
        });
      }
    }
    const size = inter!.size;
    const add = count % 2 === 1;
    result += add ? size : -size;
    applied.push(i);
    terms.push([i, count, size]);
    rows.push({ cells: [maskText(i, k), subsetText(i, NAMES.slice(0, k)), setText(inter!), String(size), add ? '+' : '-', String(result)], role: add ? 'active' : 'compare' });
    snap(
      add ? 9 : 10,
      `${count} set${count === 1 ? '' : 's'} (${add ? 'odd' : 'even'}): ${add ? 'add' : 'subtract'} len(intersection) = ${size}. result = ${result}.` +
        (size ? ` Every element of ${setText(inter!)} is now counted ${add ? 'once more' : 'once less'}.` : ' The intersection is empty, so nothing changes.'),
      { focus: { mask: i, role: add ? 'active' : 'compare', sign: add ? '+' : '-' }, vars: [['i', i], ['count', count], ['size', size], ['result', result]], resultRole: 'active' },
    );
  }
  snap(11, `Done: return ${result}. Every element is counted exactly once (each dot shows a check): the union has ${elements.length} distinct element${elements.length === 1 ? '' : 's'}.`, {
    vars: [['result', result]],
    resultRole: 'done',
    final: true,
  });
  return { frames, terms, result };
}
