/**
 * Number Theoretic Transform tracers, drawn with NttView (FftView with nine-digit residues).
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Advanced_Math/Number_Theoretic_Transform/Python/number_theoretic_transform.py:
 *   'transform' ntt(a, inverse): [] for [], ValueError for an inverse of a length that is not a power
 *               of two; otherwise the entries reduced modulo MOD, a forward transform padded with zeros
 *               to a power of two, and ntt_in_place on that copy.
 *   'multiply'  multiply_polynomials(p, q): n is the smallest power of two >= len(p) + len(q) - 1, both
 *               lists reduced and padded, ntt_in_place on each, the pointwise products modulo MOD,
 *               ntt_in_place(product, inverse=True), and the first len(p) + len(q) - 1 values.
 * ntt_in_place: bit_reverse_permute (the swaps a[i] <-> a[j] for i < j = rev(i), in the code's order),
 * then for length = 2, 4, ..., n one root_of_unity(length, inverse) and, block by block, the calls
 * _butterfly(a, start + k, start + k + length / 2, w) with w = w_length^k; the inverse then multiplies
 * every entry by pow(n, MOD - 2, MOD).
 *
 * The grid is FftView's: one row per stage, the bit-reversed list at the bottom and the stage of length
 * n on top, so a block of `length` cells is one call of the FFT's recursion. Residues are below 2^30, so a
 * product reaches 2^60 and is taken in BigInt; every value is an exact integer, and the golden fixtures
 * (__fixtures__/mathAndProblemTypes.json, sections ntt and nttMultiply) pin all of them exactly.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { stabilizeFft, type FftBlockView, type FftCell, type FftRow, type FftState } from './fft';

export const MOD = 998244353;
const MOD_BIG = BigInt(MOD);
export type NttMode = 'transform' | 'multiply';

export interface NttInput {
  /** transform: the sequence; multiply: unused. */
  a: number[];
  inverse: boolean;
  p: number[];
  q: number[];
}

/** At most 8 values (a transform of size 8 fits on screen); entries of at most 9 characters. */
export const NTT_LIMITS = { maxLength: 8, minValue: -99999999, maxValue: 999999999 };

/* ---------- arithmetic modulo MOD ---------- */

export const mulMod = (a: number, b: number): number => Number((BigInt(a) * BigInt(b)) % MOD_BIG);
export const reduce = (x: number): number => ((x % MOD) + MOD) % MOD;

export function powMod(base: number, exp: number): number {
  let result = 1n;
  let b = BigInt(reduce(base));
  let e = BigInt(exp);
  while (e > 0n) {
    if (e & 1n) result = (result * b) % MOD_BIG;
    b = (b * b) % MOD_BIG;
    e >>= 1n;
  }
  return Number(result);
}

export const isPow2 = (n: number) => n > 0 && (n & (n - 1)) === 0;

/** root_of_unity(n, inverse): 3^((MOD - 1) / n), or its inverse w^(MOD - 2). */
export function rootOfUnity(n: number, inverse: boolean): number {
  const w = powMod(3, (MOD - 1) / n);
  return inverse ? powMod(w, MOD - 2) : w;
}

/** rev(i) for log2(n) bits. */
export function bitReverse(i: number, n: number): number {
  let r = 0;
  for (let bit = 1, out = n >> 1; bit < n; bit <<= 1, out >>= 1) if (i & bit) r |= out;
  return r;
}

const list = (xs: number[]) => `[${xs.join(', ')}]`;
const bits = (i: number, n: number) => (n <= 1 ? '' : i.toString(2).padStart(Math.log2(n), '0'));

/* ---------- input ---------- */

function tokens(text: string): string[] {
  return text
    .replace(/[[\]()]/g, ' ')
    .split(/[\s,;]+/)
    .filter(Boolean);
}

function parseInt9(token: string, what: string): number {
  if (!/^[+-]?\d+$/.test(token)) throw new InputError(`${what}"${token}" is not a whole number. The NTT works with integers modulo p = 998244353.`);
  const v = Number(token) + 0;
  if (v < NTT_LIMITS.minValue || v > NTT_LIMITS.maxValue) {
    throw new InputError(`${what}"${token}": values go from ${NTT_LIMITS.minValue} to ${NTT_LIMITS.maxValue} here, so each one fits in a cell (p - 1 = 998244352 does).`);
  }
  return v;
}

/** "1 2 3 4", "inverse 10 173167434 998244351 825076915" (or "intt ...") or "[]" for the empty list. */
export function parseNttSequence(text: string): NttInput {
  let body = text.trim();
  let inverse = false;
  const m = body.match(/^(inverse|intt|inv|ntt)\s*[:=]?\s*/i);
  if (m) {
    inverse = m[1].toLowerCase() !== 'ntt';
    body = body.slice(m[0].length);
  }
  const empty = /^\[\s*\]$/.test(body) || /^\(\s*\)$/.test(body);
  const toks = empty ? [] : tokens(body);
  if (!empty && toks.length === 0) throw new InputError('Enter the values, e.g. "1 2 3 4", or "[]" for the empty list. Start with "inverse" for intt.');
  if (toks.length > NTT_LIMITS.maxLength) throw new InputError(`At most ${NTT_LIMITS.maxLength} values here, so every stage fits on screen (got ${toks.length}).`);
  return { a: toks.map((t) => parseInt9(t, '')), inverse, p: [], q: [] };
}

function parsePoly(text: string, name: string): number[] {
  const toks = tokens(text);
  if (toks.length === 0) throw new InputError(`${name} needs at least one coefficient (the constant term first): an empty list is not a polynomial here.`);
  return toks.map((t) => parseInt9(t, `${name}: `));
}

/** "p = 1 2 3; q = 4 5", "[1, 2, 3] * [4, 5]" or "1 2 3 | 4 5": coefficients, constant term first. */
export function parseNttMultiply(text: string): NttInput {
  const named = text.match(/^\s*p\s*[:=]\s*(.*?)\s*[;\n]\s*q\s*[:=]\s*(.*?)\s*$/i);
  let parts: string[];
  if (named) parts = [named[1], named[2]];
  else {
    parts = text.split(/\s*(?:\*|\||;|\bx\b|\btimes\b)\s*/i).filter((s) => s.trim().length > 0);
    if (parts.length !== 2) throw new InputError('Give two polynomials by their coefficients, constant term first: "p = 1 2 3; q = 4 5" or "[1, 2, 3] * [4, 5]".');
  }
  const p = parsePoly(parts[0], 'p');
  const q = parsePoly(parts[1], 'q');
  if (p.length + q.length - 1 > NTT_LIMITS.maxLength) {
    throw new InputError(`The product has ${p.length + q.length - 1} coefficients, so the transforms would need size 16: here len(p) + len(q) - 1 may be at most ${NTT_LIMITS.maxLength}.`);
  }
  return { a: [], inverse: false, p, q };
}

/* ---------- pseudocode ---------- */

export const NTT_CODE: Record<NttMode, string[]> = {
  transform: [
    'def ntt(a, inverse=False):',
    '    n = len(a)',
    '    if n == 0: return []',
    '    if inverse and n is not a power of two: raise ValueError(...)',
    '    values = [x % MOD for x in a] + [0] * (size - n)   # size: a power of two',
    '    ntt_in_place(values, inverse)',
    '    return values',
    'def ntt_in_place(a, inverse):',
    '    bit_reverse_permute(a)                # swap a[i], a[rev(i)] for i < rev(i)',
    '    length = 2',
    '    while length <= n:',
    '        w_length = root_of_unity(length, inverse)   # 3^((MOD - 1) / length)',
    '        for start in range(0, n, length):  # a block = one recursive FFT call',
    '            w = 1',
    '            for k in range(length // 2):',
    '                u, t = a[start + k], a[start + k + length // 2] * w % MOD',
    '                a[start + k], a[start + k + length // 2] = (u + t) % MOD, (u - t) % MOD',
    '                w = w * w_length % MOD',
    '        length <<= 1',
    '    if inverse: multiply every a[i] by pow(n, MOD - 2, MOD)   # n^-1',
  ],
  multiply: [
    'def multiply_polynomials(p, q):',
    '    need = len(p) + len(q) - 1             # ValueError above 2^23',
    '    n = 1',
    '    while n < need: n <<= 1',
    '    fp = [x % MOD for x in p] + [0] * (n - len(p))',
    '    fq = [x % MOD for x in q] + [0] * (n - len(q))',
    '    ntt_in_place(fp)',
    '    ntt_in_place(fq)',
    '    product = [fp[i] * fq[i] % MOD for i in range(n)]',
    '    ntt_in_place(product, inverse=True)',
    '    return product[:need]',
    'def ntt_in_place(a, inverse):              # inside each call above',
    '    bit_reverse_permute(a)',
    '    for length in 2, 4, ..., n: w_length = root_of_unity(length, inverse)',
    '        for each block start, w = 1, then for k in range(length // 2):',
    '            u, t = a[start + k], a[start + k + length // 2] * w % MOD',
    '            a[start + k], a[start + k + length // 2] = (u + t) % MOD, (u - t) % MOD',
    '    if inverse: multiply every a[i] by pow(n, MOD - 2, MOD)',
  ],
};

/** Pseudocode lines of ntt_in_place, per tab. */
const IN_PLACE_LINES: Record<NttMode, { permute: number; root: number; twiddle: number; write: number; scale: number }> = {
  transform: { permute: 8, root: 11, twiddle: 15, write: 16, scale: 19 },
  multiply: { permute: 12, root: 13, twiddle: 15, write: 16, scale: 17 },
};

/* ---------- frames ---------- */

/** One _butterfly call: positions i < j, the twiddle w, the values read and the values written. */
export type Butterfly = [i: number, j: number, w: number, u: number, v: number, outI: number, outJ: number];

export interface NttTransformLog {
  input: number[];
  inverse: boolean;
  output: number[];
  count: number;
}

export interface NttRun {
  frames: Array<Frame<FftState>>;
  /** Every _butterfly call in order. */
  butterflies: Butterfly[];
  /** Every root_of_unity call: [length, inverse, root]. */
  roots: Array<[number, boolean, number]>;
  /** Every bit_reverse_permute call: [before, after]. */
  permutations: Array<[number[], number[]]>;
  /** Every ntt_in_place call: its input, inverse flag, output and returned butterfly count. */
  transforms: NttTransformLog[];
  /** The returned list, or null after ValueError. */
  result: number[] | null;
  /** multiply: the pointwise products. */
  product?: number[];
  error: string | null;
}

const cell = (v: number | string, role: Role = 'idle'): FftCell => ({ re: String(v), im: null, role });

export function nttTrace(input: NttInput, mode: NttMode): NttRun {
  const frames: Array<Frame<FftState>> = [];
  const butterflies: Butterfly[] = [];
  const roots: NttRun['roots'] = [];
  const permutations: NttRun['permutations'] = [];
  const transforms: NttTransformLog[] = [];
  const L = IN_PLACE_LINES[mode];
  let title = '';
  let cols = 1;
  let count = 0;
  let stageLength = 0;
  /** -1 for a forward transform, +1 for an inverse: the direction FftView's circle turns. */
  let sign = -1;
  /** The stage strip: the bit reversal, then each stage length, then the scaling of an inverse. */
  let stages: Array<{ text: string; role: Role }> = [];
  /** Grid rows by depth (0 = the stage of length n): values, pending flags, and the row's state. */
  let levels: Array<{ values: number[]; pending: boolean[]; state: 'building' | 'done' | 'used' } | null> = [];

  const gridState = (hl: Record<string, Role>): { rows: FftRow[]; blocks: FftBlockView[] } => {
    const depth = Math.round(Math.log2(cols));
    const rows: FftRow[] = [];
    const blocks: FftBlockView[] = [];
    for (let d = 0; d <= depth; d++) {
      const size = cols >> d;
      const level = levels[d];
      const cells: Array<FftCell | null> = Array(cols).fill(null);
      if (level) {
        const base: Role = level.state === 'done' ? 'done' : 'idle';
        level.values.forEach((v, pos) => {
          const role = hl[`${d}:${pos}`] ?? base;
          cells[pos] = level.pending[pos] ? { re: '', im: null, role, pending: true } : cell(v, role);
        });
        for (let start = 0; start < cols; start += size) {
          blocks.push({ depth: d, start, size, role: level.state === 'done' ? 'done' : level.state === 'used' ? 'muted' : 'idle' });
        }
      }
      rows.push({ label: d === depth ? 'bit-reversed' : `length ${size}`, cells });
    }
    return { rows, blocks };
  };

  const snap = (line: number | undefined, caption: string, o: { hl?: Record<string, Role>; butterfly?: FftState['butterfly']; circle?: FftState['circle']; table?: FftRow[]; blockRoles?: Record<string, Role> } = {}) => {
    const strips: StripData[] = [{ label: 'Stages', items: stages.length ? stages.map((s) => ({ text: s.text, role: s.role })) : [{ text: SYM.emptySet, role: 'idle' }] }];
    let rows: FftRow[];
    let blocks: FftBlockView[] = [];
    if (o.table) rows = o.table;
    else {
      ({ rows, blocks } = gridState(o.hl ?? {}));
      if (o.blockRoles) blocks = blocks.map((b) => ({ ...b, role: o.blockRoles![`${b.depth}:${b.start}`] ?? b.role }));
    }
    frames.push({
      line,
      caption,
      vars: [
        ['transform', title || '-'],
        ['n', cols],
        ['stage length', stageLength || '-'],
        ['butterflies', count],
      ],
      state: {
        title,
        kind: o.table ? 'table' : 'grid',
        rows,
        blocks,
        butterfly: o.butterfly,
        circle: o.table ? undefined : (o.circle ?? { m: Math.max(stageLength, 1), sign, k: null, caption: ['powers of w mod p', `p = ${MOD}`] }),
        strips,
      },
    });
  };

  const setStage = (text: string) => {
    stages = stages.map((s) => (s.role === 'active' ? { ...s, role: 'done' } : s));
    const s = stages.find((x) => x.text === text);
    if (s) s.role = 'active';
  };

  /** ntt_in_place(a, inverse) of the code, on a copy of a; returns the transformed list. */
  const inPlace = (start: number[], inverse: boolean, name: string): number[] => {
    const a = [...start];
    const n = a.length;
    title = name;
    cols = n;
    count = 0;
    stageLength = 0;
    const depth = Math.round(Math.log2(n));
    stages = [{ text: 'bit reversal', role: 'idle' }];
    for (let len = 2; len <= n; len <<= 1) stages.push({ text: `length ${len}`, role: 'idle' });
    if (inverse) stages.push({ text: `${SYM.times} n^-1`, role: 'idle' });
    levels = Array(depth + 1).fill(null);
    sign = inverse ? 1 : -1;

    /* bit_reverse_permute */
    setStage('bit reversal');
    const before = [...a];
    const reduced = (label: string): FftRow => ({ label, cells: before.map((v) => cell(v)) });
    let swaps = 0;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j |= bit;
      if (i < j) {
        [a[i], a[j]] = [a[j], a[i]];
        swaps += 1;
        snap(
          L.permute,
          `Bit reversal: i = ${i} is ${bits(i, n)} in binary, reversed ${bits(j, n)} = ${j}, so a[${i}] and a[${j}] swap: ${a[j]} and ${a[i]} trade places. ` +
            `Positions with i = rev(i) stay, and a pair is swapped once, when i < rev(i).`,
          { table: [reduced('before'), { label: 'a', cells: a.map((v, p) => cell(v, p === i || p === j ? 'active' : 'idle')) }] },
        );
      }
    }
    permutations.push([before, [...a]]);
    levels[depth] = { values: [...a], pending: Array(n).fill(false), state: 'done' };
    snap(
      L.permute,
      n === 1
        ? `One value: the bit reversal changes nothing, and there are no stages: a list of one value is its own transform.`
        : `The list is in bit-reversed order, ${list(a)}, after ${swaps} swap${swaps === 1 ? '' : 's'}: the order in which the FFT's recursion, splitting into even and odd positions, reaches its single values. ` +
            `Each value is a transform of size 1; the stages combine them, bottom row up.`,
    );

    /* the stages */
    for (let length = 2; length <= n; length <<= 1) {
      const d = depth - Math.round(Math.log2(length));
      const below = levels[d + 1]!;
      const w_length = rootOfUnity(length, inverse);
      roots.push([length, inverse, w_length]);
      stageLength = length;
      setStage(`length ${length}`);
      const level: NonNullable<(typeof levels)[number]> = { values: [...a], pending: Array(n).fill(true), state: 'building' };
      levels[d] = level;
      const half = length / 2;
      const rootName = inverse ? `the inverse root 3^(-(p-1)/${length})` : `3^((p-1)/${length})`;
      snap(
        L.root,
        `Stage of length ${length}: w_length = root_of_unity(${length}${inverse ? ', inverse=True' : ''}) = ${rootName} = ${w_length}. ` +
          (length === 2
            ? `For length 2 the root is p - 1, that is -1, and each butterfly uses w^0 = 1: plain sums and differences. `
            : `w^${half} = p - 1, that is -1, just as the FFT's root has w^(n/2) = -1. `) +
          (n === length ? `One block of ${length}: the top call of the recursive FFT.` : `${n / length} blocks of ${length}, each one call of the recursive FFT.`),
        { circle: { m: length, sign, k: null, caption: [`w = ${w_length}`, `w^${half} = p - 1 = -1`] } },
      );
      for (let start = 0; start < n; start += length) {
        let w = 1;
        for (let k = 0; k < half; k++) {
          const i = start + k;
          const j = start + k + half;
          const u = a[i];
          const v = a[j];
          const t = mulMod(v, w);
          const childHl: Record<string, Role> = { [`${d + 1}:${i}`]: 'compare', [`${d + 1}:${j}`]: 'compare' };
          snap(
            L.twiddle,
            `Block at ${start}, k = ${k}: w = w_length^${k} = ${w}. t = w ${SYM.times} a[${j}] = ${w} ${SYM.times} ${v} mod p = ${t}` +
              (k === 0 ? ` (w^0 = 1, so t is a[${j}] itself).` : `.`),
            { hl: childHl, butterfly: { depth: d, a: i, b: j }, circle: { m: length, sign, k, caption: [`w^${k} = ${w}`, `t = ${t}`] } },
          );
          a[i] = (u + t) % MOD;
          a[j] = (((u - t) % MOD) + MOD) % MOD;
          count += 1;
          butterflies.push([i, j, w, u, v, a[i], a[j]]);
          level.values[i] = a[i];
          level.values[j] = a[j];
          level.pending[i] = false;
          level.pending[j] = false;
          const plus = u + t >= MOD ? `${u + t} - p = ${a[i]}` : `${a[i]}`;
          const minus = u - t < 0 ? `${u - t} + p = ${a[j]}` : `${a[j]}`;
          snap(
            L.write,
            `Butterfly: a[${i}] = u + t = ${u} + ${t} = ${plus} and a[${j}] = u - t = ${u} - ${t} = ${minus}, modulo p. ` +
              `w^(k + ${half}) = -w^k, so one product serves both.`,
            {
              hl: { ...childHl, [`${d}:${i}`]: 'active', [`${d}:${j}`]: 'active' },
              butterfly: { depth: d, a: i, b: j },
              circle: { m: length, sign, k, caption: [`w^${k} = ${w}`, `t = ${t}`] },
            },
          );
          w = mulMod(w, w_length);
        }
      }
      level.state = 'done';
      below.state = 'used';
    }
    if (inverse && n > 1) {
      setStage(`${SYM.times} n^-1`);
      const nInverse = powMod(n, MOD - 2);
      const unscaled = [...a];
      for (let i = 0; i < n; i++) a[i] = mulMod(a[i], nInverse);
      levels[0]!.values = [...a];
      const hl: Record<string, Role> = {};
      for (let i = 0; i < n; i++) hl[`0:${i}`] = 'active';
      snap(
        L.scale,
        `The inverse stages leave every value n times too large: multiply each by n^-1 = pow(${n}, p - 2, p) = ${nInverse} (${n} ${SYM.times} ${nInverse} = 1 mod p). ` +
          `${list(unscaled)} becomes ${list(a)}.`,
        { hl },
      );
    } else if (inverse) {
      setStage(`${SYM.times} n^-1`);
    }
    stages = stages.map((s) => (s.role === 'active' ? { ...s, role: 'done' } : s));
    transforms.push({ input: [...start], inverse, output: [...a], count });
    return a;
  };

  const goodTop = (r: number[]): Record<string, Role> => Object.fromEntries(r.map((_, i) => [`0:${i}`, 'good' as Role]));

  if (mode === 'transform') {
    const n = input.a.length;
    const fn = input.inverse ? 'intt' : 'ntt';
    title = `${fn}(${list(input.a)})`;
    if (n === 0) {
      snap(2, `The list is empty, so ${fn} returns [] at once, as the FFT topic's fft does. An empty input gives an empty result in all three languages.`, { table: [{ label: 'result', cells: [] }] });
      return { frames, butterflies, roots, permutations, transforms, result: [], error: null };
    }
    if (input.inverse && !isPow2(n)) {
      cols = n;
      snap(
        3,
        `n = ${n} is not a power of two, so the inverse raises ValueError. Padding a spectrum with zeros does not give the spectrum of a shorter sequence, so there is no meaningful answer.`,
        { table: [{ label: 'a', cells: input.a.map((v) => cell(v, 'bad')) }] },
      );
      return {
        frames,
        butterflies,
        roots,
        permutations,
        transforms,
        result: null,
        error: `ValueError: inverse NTT needs a power-of-two length; got ${n} (a zero-padded spectrum is not the spectrum of the original sequence)`,
      };
    }
    let size = 1;
    while (size < n) size <<= 1;
    cols = size;
    const values = [...input.a.map(reduce), ...Array(size - n).fill(0)];
    const changed = input.a.filter((x) => reduce(x) !== x);
    const padHl = (i: number): Role => (i >= n ? 'active' : reduce(input.a[i]) !== input.a[i] ? 'compare' : 'idle');
    snap(
      4,
      `Copy a and reduce every entry modulo p = ${MOD}` +
        (changed.length ? ` (${changed.map((x) => `${x} becomes ${reduce(x)}`).join(', ')})` : ': every entry is already a residue') +
        (size > n ? `; a forward transform pads with ${size - n} zero${size - n === 1 ? '' : 's'} to n = ${size}, a power of two.` : `; n = ${size} is a power of two already.`),
      { table: [{ label: 'a', cells: input.a.map((v) => cell(v)) }, { label: 'values', cells: values.map((v, i) => cell(v, padHl(i))) }] },
    );
    const out = inPlace(values, input.inverse, title);
    const r = out;
    const work =
      size === 1
        ? `no butterflies: one value is its own transform. `
        : `${count} butterfl${count === 1 ? 'y' : 'ies'}, (n/2) log2(n) = ${size / 2} ${SYM.times} ${Math.log2(size)}, against n^2 = ${size * size} terms for the direct sum. `;
    snap(
      6,
      `${fn} returns ${list(r)}: ${work}` +
        (input.inverse ? `Every value is exact, with no rounding, where the FFT would round.` : `X[0] = ${r[0]} is the sum of the entries modulo p, as the FFT's X[0] is their sum.`),
      { hl: goodTop(r), blockRoles: { '0:0': 'good' } },
    );
    return { frames, butterflies, roots, permutations, transforms, result: r, error: null };
  }

  /* multiply_polynomials(p, q) */
  const { p, q } = input;
  const need = p.length + q.length - 1;
  let n = 1;
  const doubling: number[] = [1];
  while (n < need) {
    n <<= 1;
    doubling.push(n);
  }
  cols = n;
  title = 'multiply_polynomials';
  snap(
    3,
    `The product of a degree-${p.length - 1} and a degree-${q.length - 1} polynomial has ${need} coefficient${need > 1 ? 's' : ''}, so the transforms need n >= ${need} points. ` +
      `n doubles from 1 until it is big enough: ${doubling.join(', ')}. With fewer points the product would wrap around.`,
    { table: [{ label: 'p', cells: p.map((v) => cell(v)) }, { label: 'q', cells: q.map((v) => cell(v)) }] },
  );
  const pad = (xs: number[]) => [...xs.map(reduce), ...Array(n - xs.length).fill(0)];
  const fp = pad(p);
  const fq = pad(q);
  const hlPad = (xs: number[]) => (i: number): Role => (i >= xs.length ? 'active' : reduce(xs[i]) !== xs[i] ? 'compare' : 'idle');
  const negatives = [...p, ...q].filter((x) => x < 0);
  snap(
    5,
    `Reduce the coefficients modulo p and pad with zeros to length ${n}: ${n - p.length} zero${n - p.length === 1 ? '' : 's'} for p, ${n - q.length} for q.` +
      (negatives.length ? ` A negative coefficient becomes p minus its size: ${negatives[0]} becomes ${reduce(negatives[0])}.` : ' A zero coefficient does not change a polynomial.'),
    { table: [{ label: 'fp', cells: fp.map((v, i) => cell(v, hlPad(p)(i))) }, { label: 'fq', cells: fq.map((v, i) => cell(v, hlPad(q)(i))) }] },
  );
  const P = inPlace(fp, false, 'ntt_in_place(fp)');
  snap(6, `fp now holds p at the ${n} points w^0 .. w^${n - 1} modulo p: ${list(P)}. ${count} butterfl${count === 1 ? 'y' : 'ies'}.`, { hl: goodTop(P), blockRoles: { '0:0': 'good' } });
  const Q = inPlace(fq, false, 'ntt_in_place(fq)');
  snap(7, `fq holds q at the same ${n} points: ${list(Q)}. Both polynomials are in value form now.`, { hl: goodTop(Q), blockRoles: { '0:0': 'good' } });
  title = 'pointwise product';
  stages = [];
  stageLength = 0;
  count = 0;
  const R: number[] = [];
  for (let i = 0; i < n; i++) {
    R.push(mulMod(P[i], Q[i]));
    snap(
      8,
      `Point ${i}: (p ${SYM.times} q)(w^${i}) = fp[${i}] ${SYM.times} fq[${i}] = ${P[i]} ${SYM.times} ${Q[i]} mod p = ${R[i]}. ` + `In value form, multiplying the polynomials is ${n} multiplications.`,
      {
        table: [
          { label: 'fp', cells: P.map((v, j) => cell(v, j === i ? 'compare' : 'idle')) },
          { label: 'fq', cells: Q.map((v, j) => cell(v, j === i ? 'compare' : 'idle')) },
          { label: 'product', cells: [...R.map((v, j) => cell(v, j === i ? 'active' : 'done')), ...Array(n - R.length).fill(null)] },
        ],
      },
    );
  }
  const back = inPlace(R, true, 'ntt_in_place(product, inverse=True)');
  title = 'product[:need]';
  stages = [];
  stageLength = 0;
  const result = back.slice(0, need);
  // The true coefficients, for the caption only: exact in BigInt.
  const exact = Array.from({ length: need }, (_, k) => {
    let sum = 0n;
    for (let i = 0; i < p.length; i++) if (k - i >= 0 && k - i < q.length) sum += BigInt(p[i]) * BigInt(q[k - i]);
    return sum;
  });
  const off = exact.findIndex((c) => c < 0n || c >= MOD_BIG);
  let note = `, and here each one is the true coefficient itself: all lie in 0 .. p - 1.`;
  if (off >= 0) {
    const c = exact[off];
    note =
      c >= MOD_BIG
        ? `: the true coefficient of x^${off} is ${c}, above p, so it shows reduced, as ${result[off]}.`
        : -c < MOD_BIG
          ? `: the true coefficient of x^${off} is ${c}, negative, so it shows as p - ${-c} = ${result[off]}.`
          : `: the true coefficient of x^${off} is ${c}, negative, so it shows as its residue modulo p, ${result[off]}.`;
  }
  snap(
    10,
    `Keep the first ${need} value${need === 1 ? '' : 's'}: ${list(result)}. No rounding: every value is the true coefficient modulo p` + note,
    {
      table: [
        { label: 'product', cells: back.map((v, i) => cell(v, i < need ? 'compare' : 'idle')) },
        { label: 'result', cells: [...result.map((v) => cell(v, 'good')), ...Array(n - need).fill(null)] },
      ],
    },
  );
  return { frames, butterflies, roots, permutations, transforms, result, product: R, error: null };
}

/** One picture size for a whole run: FftView's rule, the widest grid and the most rows. */
export const stabilizeNtt = stabilizeFft;
