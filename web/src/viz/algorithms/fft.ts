/**
 * Fast Fourier Transform tracers, drawn with FftView.
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Advanced_Math/Fast_Fourier_Transform/Python/fast_fourier_transform.py:
 *   'transform' fft(a, inverse): an empty list returns [], an inverse of a length that is not a
 *               power of two raises ValueError, a forward transform pads with zeros to the next
 *               power of two; _fft_recursive splits into the even and the odd positions, recurses,
 *               and combines with butterflies; the inverse then divides every value by n.
 *   'multiply'  multiply_polynomials(p, q): n is the smallest power of two >= len(p) + len(q) - 1,
 *               fft of both padded lists, a pointwise product, ifft, and round() of the real parts.
 * The arithmetic follows CPython step by step: a complex product is (ac - bd) + (ad + bc)j, the
 * twiddle cmath.exp(sign * 2j * cmath.pi * k / n) is (cos(theta), sin(theta)) with theta computed
 * as ((sign * 2) * pi * k) / n, dividing by n divides both parts, and round() rounds half to even.
 * cos and sin may differ from the platform's libm in the last bit, so the golden fixtures
 * (__fixtures__/mathAndProblemTypes.json) pin rounded values (9 significant digits) and the integer
 * coefficients of a product exactly.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

/** A complex number as [real, imaginary]. */
export type C = [number, number];
export type FftMode = 'transform' | 'multiply';

export interface FftInput {
  /** transform: the signal; multiply: unused. */
  a: C[];
  inverse: boolean;
  p: number[];
  q: number[];
}

export const FFT_LIMITS = { maxLength: 8, maxValue: 999, maxCoefficient: 99 };

/* ---------- CPython's complex arithmetic ---------- */

export const cmul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cadd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
export const csub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];

/** cmath.exp(sign * 2j * cmath.pi * k / n): the real part of the exponent is 0, so exp gives (cos, sin). */
export function twiddle(sign: number, k: number, n: number): C {
  const theta = (sign * 2 * Math.PI * k) / n;
  return [Math.cos(theta), Math.sin(theta)];
}

/** Python's round(x) for a float: the nearest integer, ties to the even one. */
export function pyRound(x: number): number {
  const f = Math.floor(x);
  const diff = x - f;
  const r = diff < 0.5 ? f : diff > 0.5 ? f + 1 : f % 2 === 0 ? f : f + 1;
  return r + 0; // no negative zero
}

export const isPow2 = (n: number) => n > 0 && (n & (n - 1)) === 0;

/** The fixtures' rounding: 9 significant digits, at most 9 decimals, no negative zero. */
export function round9(x: number): number {
  const ax = Math.abs(x);
  const digits = ax >= 1 ? Math.trunc(ax).toString().length : 0;
  const v = Number(x.toFixed(Math.max(0, 9 - digits)));
  return v === 0 ? 0 : v;
}

/** A number for the picture: 2 decimals, fewer for large values, "0" for rounding noise. */
export function fmtNum(x: number): string {
  const ax = Math.abs(x);
  if (ax < 0.005) return '0';
  const d = ax >= 1000 ? 0 : ax >= 100 ? 1 : 2;
  const s = x.toFixed(d).replace(/\.?0+$/, '');
  return s === '-0' ? '0' : s;
}

/** "-2+2i", "0.71-0.71i", "10", "2i": a complex number on one line, as the article writes it. */
export function cstr(c: C): string {
  const re = fmtNum(c[0]);
  const im = fmtNum(c[1]);
  if (im === '0') return re;
  const imPart = im === '1' ? 'i' : im === '-1' ? '-i' : `${im}i`;
  if (re === '0') return imPart;
  return `${re}${imPart.startsWith('-') ? '' : '+'}${imPart}`;
}

const list = (xs: C[]) => `[${xs.map(cstr).join(', ')}]`;

/* ---------- input ---------- */

/** One complex token: 3, -2.5, 2j, -j, 1+2j, 1-0.5i (no spaces inside). */
export function parseComplex(token: string): C {
  const t = token.trim().replace(/i$/i, 'j');
  const NUM = '(?:\\d+(?:\\.\\d*)?|\\.\\d+)';
  let re = 0;
  let im = 0;
  let m: RegExpMatchArray | null;
  if ((m = t.match(new RegExp(`^([+-]?${NUM})$`)))) re = Number(m[1]);
  else if ((m = t.match(new RegExp(`^([+-]?)(${NUM})?j$`)))) im = (m[1] === '-' ? -1 : 1) * (m[2] ? Number(m[2]) : 1);
  else if ((m = t.match(new RegExp(`^([+-]?${NUM})([+-])(${NUM})?j$`)))) {
    re = Number(m[1]);
    im = (m[2] === '-' ? -1 : 1) * (m[3] ? Number(m[3]) : 1);
  } else {
    throw new InputError(`"${token}" is not a number. Write reals like 3 or -2.5 and complex values without spaces, like 1+2j or -0.5j.`);
  }
  if (/\.\d{3,}/.test(t)) throw new InputError(`"${token}": use at most 2 decimals, so every value stays readable.`);
  for (const v of [re, im]) {
    if (Math.abs(v) > FFT_LIMITS.maxValue) throw new InputError(`"${token}": real and imaginary parts go from -${FFT_LIMITS.maxValue} to ${FFT_LIMITS.maxValue} here.`);
  }
  return [re + 0, im + 0];
}

function tokens(text: string): string[] {
  return text
    .replace(/[[\]()]/g, ' ')
    .split(/[\s,;]+/)
    .filter(Boolean);
}

/** "1 2 3 4", "inverse 10, -2+2j, -2, -2-2j" (or "ifft ...") or "[]" for the empty list. */
export function parseFftSignal(text: string): FftInput {
  let body = text.trim();
  let inverse = false;
  const m = body.match(/^(inverse|ifft|inv|fft)\s*[:=]?\s*/i);
  if (m) {
    inverse = m[1].toLowerCase() !== 'fft';
    body = body.slice(m[0].length);
  }
  const empty = /^\[\s*\]$/.test(body) || /^\(\s*\)$/.test(body);
  const toks = empty ? [] : tokens(body);
  if (!empty && toks.length === 0) throw new InputError('Enter the values, e.g. "1 2 3 4", or "[]" for the empty list. Start with "inverse" for ifft.');
  if (toks.length > FFT_LIMITS.maxLength) throw new InputError(`At most ${FFT_LIMITS.maxLength} values here, so every level of the recursion fits on screen (got ${toks.length}).`);
  return { a: toks.map(parseComplex), inverse, p: [], q: [] };
}

function parsePoly(text: string, name: string): number[] {
  const toks = tokens(text);
  if (toks.length === 0) throw new InputError(`${name} needs at least one coefficient (the constant term first): an empty list is not a polynomial here.`);
  return toks.map((t) => {
    if (!/^-?\d+$/.test(t)) throw new InputError(`${name}: "${t}" is not a whole number. multiply_polynomials rounds its result to integers, so the coefficients are integers here.`);
    const v = Number(t) + 0;
    if (Math.abs(v) > FFT_LIMITS.maxCoefficient) throw new InputError(`${name}: coefficients go from -${FFT_LIMITS.maxCoefficient} to ${FFT_LIMITS.maxCoefficient} here (got ${t}).`);
    return v;
  });
}

/** "p = 1 2 3; q = 4 5", "[1, 2, 3] * [4, 5]" or "1 2 3 | 4 5": coefficients, constant term first. */
export function parseFftMultiply(text: string): FftInput {
  const named = text.match(/^\s*p\s*[:=]\s*(.*?)\s*[;\n]\s*q\s*[:=]\s*(.*?)\s*$/i);
  let parts: string[];
  if (named) parts = [named[1], named[2]];
  else {
    parts = text.split(/\s*(?:\*|\||;|\bx\b|\btimes\b)\s*/i).filter((s) => s.trim().length > 0);
    if (parts.length !== 2) throw new InputError('Give two polynomials by their coefficients, constant term first: "p = 1 2 3; q = 4 5" or "[1, 2, 3] * [4, 5]".');
  }
  const p = parsePoly(parts[0], 'p');
  const q = parsePoly(parts[1], 'q');
  if (p.length + q.length - 1 > FFT_LIMITS.maxLength) {
    throw new InputError(`The product has ${p.length + q.length - 1} coefficients, so the transforms would need size 16: here len(p) + len(q) - 1 may be at most ${FFT_LIMITS.maxLength}.`);
  }
  return { a: [], inverse: false, p, q };
}

/* ---------- pseudocode ---------- */

export const FFT_CODE: Record<FftMode, string[]> = {
  transform: [
    'def fft(a, inverse=False):',
    '    n = len(a)',
    '    if n == 0: return []',
    '    if inverse and n is not a power of two: raise ValueError(...)',
    '    if n == 1: return list(a)',
    '    if n is not a power of two: a = a + [0] * (next_power - n)',
    '    result = _fft_recursive(a, inverse)',
    '    if inverse: result = [x / n for x in result]',
    '    return result',
    'def _fft_recursive(a, inverse):',
    '    if len(a) == 1: return a',
    '    even = _fft_recursive(a[0::2], inverse)    # positions 0, 2, 4, ...',
    '    odd = _fft_recursive(a[1::2], inverse)     # positions 1, 3, 5, ...',
    '    sign = 1 if inverse else -1',
    '    for k in range(n // 2):',
    '        t = cmath.exp(sign * 2j * cmath.pi * k / n) * odd[k]',
    '        result[k] = even[k] + t',
    '        result[k + n // 2] = even[k] - t',
    '    return result',
  ],
  multiply: [
    'def multiply_polynomials(p, q):',
    '    n = 1',
    '    while n < len(p) + len(q) - 1: n <<= 1',
    '    p_complex = [complex(x, 0) for x in p + [0] * (n - len(p))]',
    '    q_complex = [complex(x, 0) for x in q + [0] * (n - len(q))]',
    '    p_fft = fft(p_complex)',
    '    q_fft = fft(q_complex)',
    '    product_fft = [p_fft[i] * q_fft[i] for i in range(n)]',
    '    product = ifft(product_fft)          # fft(..., inverse=True): / n',
    '    return [round(x.real) for x in product[:len(p) + len(q) - 1]]',
    'def _fft_recursive(a, inverse):         # inside every fft above',
    '    if len(a) == 1: return a',
    '    even, odd = rec(a[0::2]), rec(a[1::2])',
    '    for k in range(n // 2):              # sign = +1 for ifft, else -1',
    '        t = cmath.exp(sign * 2j * cmath.pi * k / n) * odd[k]',
    '        result[k], result[k + n // 2] = even[k] + t, even[k] - t',
  ],
};

/** Pseudocode lines of the recursion, per tab. */
const REC_LINES: Record<FftMode, { base: number; split: number; twiddle: number; write: number; sign?: number }> = {
  transform: { base: 10, split: 11, twiddle: 15, write: 16, sign: 13 },
  multiply: { base: 11, split: 12, twiddle: 14, write: 15 },
};

/* ---------- frames ---------- */

export interface FftCell {
  re: string;
  im: string | null;
  role: Role;
  /** A slot of `result` not yet written: drawn empty and dashed. */
  pending?: boolean;
}

export interface FftRow {
  label: string;
  cells: Array<FftCell | null>;
}

export interface FftBlockView {
  depth: number;
  start: number;
  size: number;
  role: Role;
}

export interface FftState {
  title: string;
  /** "grid": one row per recursion depth; "table": labelled vectors (pointwise product, rounding). */
  kind: 'grid' | 'table';
  rows: FftRow[];
  blocks: FftBlockView[];
  /** The butterfly being drawn: child row depth + 1 into row depth, at positions a and b = a + size / 2. */
  butterfly?: { depth: number; a: number; b: number };
  /** The roots of unity of the block being combined, with w^k highlighted. */
  circle?: { m: number; sign: number; k: number | null; caption: string[] };
  strips: StripData[];
  /** The run's longest strips (withStripGhosts): the stage keeps one height. */
  ghosts?: StripData[];
  /** One geometry for the whole run (stabilizeFft): the widest row and the most rows. */
  layout?: { cols: number; rows: number };
}

export interface FftCall {
  input: C[];
  output: C[];
}

export interface FftRun {
  frames: Array<Frame<FftState>>;
  /** Every _fft_recursive call in call order (pre-order), with its input and output. */
  calls: FftCall[];
  /** Every twiddle factor in the order the code computes them. */
  roots: C[];
  /** Every fft(...) call (multiply): input, inverse flag, output. */
  ffts: Array<{ input: C[]; inverse: boolean; output: C[] }>;
  /** transform: the returned list; multiply: the integer coefficients. */
  result: C[] | number[] | null;
  /** multiply: the pointwise product and the inverse transform before rounding. */
  product?: C[];
  inverse?: C[];
  error: string | null;
}

const cell = (c: C, role: Role = 'idle'): FftCell => {
  const re = fmtNum(c[0]);
  const im = fmtNum(c[1]);
  return { re: im !== '0' && re === '0' ? '' : re, im: im === '0' ? null : `${im.startsWith('-') ? '' : '+'}${im}i`, role };
};

export function fftTrace(input: FftInput, mode: FftMode): FftRun {
  const frames: Array<Frame<FftState>> = [];
  const calls: FftCall[] = [];
  const roots: C[] = [];
  const ffts: FftRun['ffts'] = [];
  const L = REC_LINES[mode];
  let title = '';
  let cols = 1;
  /** The sign of the transform in progress: -1 forward, +1 inverse. */
  let sign = -1;
  let mults = 0;
  /** Recursion blocks of the transform in progress, keyed "depth:start". */
  let blocks = new Map<string, { depth: number; start: number; size: number; values: C[]; done: boolean; pending: boolean[]; spent?: boolean }>();
  const stack: StripItem[] = [];

  const gridRows = (hl: Record<string, Role>): FftRow[] => {
    const depth = Math.max(0, Math.round(Math.log2(cols)));
    const rows: FftRow[] = [];
    for (let d = 0; d <= depth; d++) {
      const cells: Array<FftCell | null> = Array(cols).fill(null);
      for (const b of blocks.values()) {
        if (b.depth !== d) continue;
        b.values.forEach((v, i) => {
          const pos = b.start + i;
          const role = hl[`${d}:${pos}`] ?? (b.spent ? 'muted' : b.done ? 'done' : 'idle');
          cells[pos] = b.pending[i] ? { re: '', im: null, role, pending: true } : cell(v, role);
        });
      }
      const size = cols >> d;
      rows.push({ label: size === 1 ? 'size 1' : `size ${size}`, cells });
    }
    return rows;
  };

  const snap = (
    line: number | undefined,
    caption: string,
    o: { hl?: Record<string, Role>; butterfly?: FftState['butterfly']; circle?: FftState['circle']; table?: FftRow[]; blockRoles?: Record<string, Role> } = {},
  ) => {
    // One strip that is always there, so the stage keeps its height.
    const strips: StripData[] = [
      { label: 'Calls', items: stack.length ? stack.map((s, i) => ({ text: s.text, role: i === stack.length - 1 ? 'active' : 'compare' })) : [{ text: SYM.emptySet, role: 'muted' }] },
    ];
    frames.push({
      line,
      caption,
      vars: [
        ['transform', title || '-'],
        ['n', cols],
        ['complex products', mults],
        ['open calls', stack.length],
      ],
      state: {
        title,
        kind: o.table ? 'table' : 'grid',
        rows: o.table ?? gridRows(o.hl ?? {}),
        blocks: o.table
          ? []
          : [...blocks.values()].map((b) => ({ depth: b.depth, start: b.start, size: b.size, role: o.blockRoles?.[`${b.depth}:${b.start}`] ?? (b.spent ? 'muted' : b.done ? 'done' : 'idle') })),
        butterfly: o.butterfly,
        circle: o.table ? undefined : (o.circle ?? { m: cols, sign: sign, k: null, caption: cols > 1 ? ['X[k] = A(w^k)', `w = e^(${sign < 0 ? '-' : ''}2${SYM.middot}pi${SYM.middot}i/${cols})`] : ['one point: w = 1'] }),
        strips,
      },
    });
  };


  /** _fft_recursive(a, inverse) on the block at (depth, start); returns its transform. */
  const rec = (a: C[], inverse: boolean, depth: number, start: number, path: string): C[] => {
    const call: FftCall = { input: a.map((v) => [...v] as C), output: [] };
    calls.push(call);
    const n = a.length;
    const key = `${depth}:${start}`;
    blocks.set(key, { depth, start, size: n, values: a, done: false, pending: Array(n).fill(false) });
    stack.push({ text: `size ${n}${path ? ` (${path})` : ''}` });
    if (n === 1) {
      blocks.get(key)!.done = true;
      snap(L.base, `A list of one value is its own transform (the DFT of one point is that point): ${cstr(a[0])} comes back unchanged.`, { hl: { [`${depth}:${start}`]: 'active' } });
      call.output = a;
      stack.pop();
      return a;
    }
    const evenIn = a.filter((_, i) => i % 2 === 0);
    const oddIn = a.filter((_, i) => i % 2 === 1);
    // Show both halves at once: the split puts positions 0, 2, 4, ... left and 1, 3, 5, ... right.
    blocks.set(`${depth + 1}:${start}`, { depth: depth + 1, start, size: n / 2, values: evenIn, done: false, pending: Array(n / 2).fill(false) });
    blocks.set(`${depth + 1}:${start + n / 2}`, { depth: depth + 1, start: start + n / 2, size: n / 2, values: oddIn, done: false, pending: Array(n / 2).fill(false) });
    const hl: Record<string, Role> = {};
    for (let i = 0; i < n; i++) hl[`${depth}:${start + i}`] = 'compare';
    for (let i = 0; i < n / 2; i++) {
      hl[`${depth + 1}:${start + i}`] = 'active';
      hl[`${depth + 1}:${start + n / 2 + i}`] = 'active';
    }
    snap(
      L.split,
      `Split the ${n} values ${list(a)}: the even positions ${list(evenIn)} form one half and the odd positions ${list(oddIn)} the other. ` +
        `A(x) = E(x^2) + x O(x^2), so two transforms of size ${n / 2} give this one.`,
      { hl },
    );
    const even = rec(evenIn, inverse, depth + 1, start, path ? `${path}, even` : 'even');
    const odd = rec(oddIn, inverse, depth + 1, start + n / 2, path ? `${path}, odd` : 'odd');
    const block = blocks.get(key)!;
    // result = [0] * n: the slots are written by the butterflies below.
    block.values = Array.from({ length: n }, () => [0, 0] as C);
    block.pending = Array(n).fill(true);
    const result: C[] = block.values;
    const wName = `e^(${sign < 0 ? '-' : ''}2${SYM.middot}pi${SYM.middot}i${SYM.middot}k/${n})`;
    for (let k = 0; k < n / 2; k++) {
      const w = twiddle(sign, k, n);
      roots.push(w);
      const t = cmul(w, odd[k]);
      mults += 1;
      const posE = start + k;
      const posO = start + n / 2 + k;
      const childHl: Record<string, Role> = { [`${depth + 1}:${posE}`]: 'compare', [`${depth + 1}:${posO}`]: 'compare' };
      snap(
        L.twiddle,
        `k = ${k}: the twiddle w^${k} = ${wName} = ${cstr(w)} sits ${k === 0 ? 'at 1 on the unit circle' : `${k}/${n} of a turn ${sign < 0 ? 'clockwise' : 'counterclockwise'} from 1`}. ` +
          `t = w^${k} ${SYM.times} odd[${k}] = ${cstr(w)} ${SYM.times} ${cstr(odd[k])} = ${cstr(t)}.`,
        { hl: childHl, butterfly: { depth, a: posE, b: posO }, circle: { m: n, sign, k, caption: [`w^${k} = ${cstr(w)}`, `t = ${cstr(t)}`] } },
      );
      result[k] = cadd(even[k], t);
      result[k + n / 2] = csub(even[k], t);
      block.pending[k] = false;
      block.pending[k + n / 2] = false;
      snap(
        L.write,
        `Butterfly: result[${k}] = even[${k}] + t = ${cstr(even[k])} + ${cstr(t)} = ${cstr(result[k])}, and result[${k + n / 2}] = even[${k}] - t = ${cstr(result[k + n / 2])}. ` +
          `w^${k + n / 2} = -w^${k}, so one product serves both outputs.`,
        {
          hl: { ...childHl, [`${depth}:${posE}`]: 'active', [`${depth}:${posO}`]: 'active' },
          butterfly: { depth, a: posE, b: posO },
          circle: { m: n, sign, k, caption: [`w^${k} = ${cstr(w)}`, `t = ${cstr(t)}`] },
        },
      );
    }
    block.done = true;
    // The halves are spent: they stay in the picture, faded, so the finished run shows every level.
    for (const b of blocks.values()) if (b.depth > depth && b.start >= start && b.start < start + n) b.spent = true;
    call.output = result;
    stack.pop();
    return result;
  };

  /** fft(a, inverse) of the code; null after ValueError. */
  const fft = (a: C[], inverse: boolean, name: string): C[] | null => {
    title = name;
    sign = inverse ? 1 : -1;
    let n = a.length;
    blocks = new Map();
    cols = Math.max(1, n);
    const fnName = inverse ? 'ifft' : 'fft';
    if (n === 0) {
      cols = 1;
      snap(2, `${name}: the list is empty, so ${fnName} returns [] at once. An empty input gives an empty result in all three languages.`, { table: [{ label: 'result', cells: [] }] });
      ffts.push({ input: [], inverse, output: [] });
      return [];
    }
    if (inverse && !isPow2(n)) {
      blocks.set('0:0', { depth: 0, start: 0, size: n, values: a, done: false, pending: Array(n).fill(false) });
      const hl: Record<string, Role> = {};
      for (let i = 0; i < n; i++) hl[`0:${i}`] = 'bad';
      snap(
        3,
        `${name}: n = ${n} is not a power of two, so the inverse raises ValueError. Padding a spectrum with zeros does not give the spectrum of a shorter signal, so there is no meaningful answer.`,
        { hl },
      );
      return null;
    }
    if (n === 1) {
      blocks.set('0:0', { depth: 0, start: 0, size: 1, values: a, done: true, pending: [false] });
      snap(4, `${name}: n = 1, so ${fnName} returns a copy of the list: one value is its own transform${inverse ? ', and dividing by n = 1 would change nothing' : ''}.`, { hl: { '0:0': 'good' } });
      ffts.push({ input: a, inverse, output: [...a] });
      return [...a];
    }
    let data = a;
    if (!isPow2(n)) {
      let next = 1;
      while (next < n) next <<= 1;
      data = [...a, ...Array.from({ length: next - n }, () => [0, 0] as C)];
      cols = next;
      blocks.set('0:0', { depth: 0, start: 0, size: next, values: data, done: false, pending: Array(next).fill(false) });
      const hl: Record<string, Role> = {};
      for (let i = n; i < next; i++) hl[`0:${i}`] = 'active';
      snap(5, `${name}: n = ${n} is not a power of two, so a forward transform pads with ${next - n} zero${next - n > 1 ? 's' : ''} to n = ${next}. The result is the DFT of the padded signal and has ${next} values.`, { hl });
      n = next;
    }
    const out = rec(data, inverse, 0, 0, '');
    let result = out;
    if (inverse) {
      result = out.map((x) => [x[0] / n, x[1] / n] as C);
      const b = blocks.get('0:0')!;
      b.values = result;
      const hl: Record<string, Role> = {};
      for (let i = 0; i < n; i++) hl[`0:${i}`] = 'active';
      snap(7, `The inverse uses the same recursion with sign +1, which leaves every value n times too large: divide each by n = ${n}. ${name} = ${list(result)}.`, { hl });
    }
    ffts.push({ input: a, inverse, output: result });
    return result;
  };

  const finishCaption = (r: C[]) => {
    const hl: Record<string, Role> = {};
    r.forEach((_, i) => (hl[`0:${i}`] = 'good'));
    return hl;
  };

  if (mode === 'transform') {
    const name = `${input.inverse ? 'ifft' : 'fft'}(${list(input.a)})`;
    const r = fft(input.a, input.inverse, name);
    if (r === null) {
      const n = input.a.length;
      return { frames, calls, roots, ffts, result: null, error: `ValueError: inverse FFT needs a power-of-two length; got ${n} (a zero-padded spectrum is not the spectrum of the original signal)` };
    }
    if (r.length > 0) {
      snap(
        8,
        `${input.inverse ? 'ifft' : 'fft'} returns ${list(r)}: ${calls.length} calls and ${mults} butterfl${mults === 1 ? 'y' : 'ies'} (n/2 = ${r.length / 2} on each of the log2(n) = ${Math.log2(r.length)} level${r.length === 2 ? '' : 's'}), against n^2 = ${r.length * r.length} terms for the direct DFT.` +
          (!input.inverse ? ` X[0] = ${cstr(r[0])} is the sum of the input values.` : ''),
        { hl: finishCaption(r), blockRoles: { '0:0': 'good' } },
      );
    }
    return { frames, calls, roots, ffts, result: r, error: null };
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
  const pad = (xs: number[]): C[] => [...xs, ...Array(Math.max(0, n - xs.length)).fill(0)].map((x) => [x, 0] as C);
  const pc = pad(p);
  const qc = pad(q);
  const vec = (label: string, xs: C[], role: Role = 'idle', hl: Record<number, Role> = {}): FftRow => ({ label, cells: xs.map((x, i) => cell(x, hl[i] ?? role)) });
  title = 'multiply_polynomials';
  snap(
    2,
    `The product of a degree-${p.length - 1} and a degree-${q.length - 1} polynomial has ${need} coefficient${need > 1 ? 's' : ''}, so the transforms need n >= ${need} points. ` +
      `n doubles from 1 until it is big enough: ${doubling.join(', ')}. With fewer points the product would wrap around (a cyclic convolution).`,
    { table: [vec('p', p.map((x) => [x, 0] as C)), vec('q', q.map((x) => [x, 0] as C))] },
  );
  const padHl = (xs: number[]): Record<number, Role> => Object.fromEntries(Array.from({ length: n - xs.length }, (_, i) => [xs.length + i, 'active' as Role]));
  snap(
    3,
    `Pad both coefficient lists with zeros to length ${n} and make them complex: ${n - p.length} zero${n - p.length === 1 ? '' : 's'} for p, ${n - q.length} for q. A zero coefficient does not change a polynomial.`,
    { table: [vec('p_complex', pc, 'idle', padHl(p)), vec('q_complex', qc, 'idle', padHl(q))] },
  );
  const P = fft(pc, false, 'p_fft = fft(p)')!;
  snap(5, `p_fft holds p evaluated at the ${n} points w^0..w^${n - 1} (the ${n}-th roots of unity): ${list(P)}.`, { hl: finishCaption(P), blockRoles: { '0:0': 'done' } });
  const Q = fft(qc, false, 'q_fft = fft(q)')!;
  snap(6, `q_fft holds q at the same ${n} points: ${list(Q)}. Both polynomials are now in value form.`, { hl: finishCaption(Q), blockRoles: { '0:0': 'done' } });
  title = 'pointwise product';
  const R: C[] = [];
  for (let i = 0; i < n; i++) {
    R.push(cmul(P[i], Q[i]));
    mults += 1;
    const rows = [vec('p_fft', P, 'idle', { [i]: 'compare' }), vec('q_fft', Q, 'idle', { [i]: 'compare' }), { label: 'product_fft', cells: [...R.map((x, j) => cell(x, j === i ? 'active' : 'done')), ...Array(n - R.length).fill(null)] }];
    snap(
      7,
      `Point ${i}: (p ${SYM.times} q)(w^${i}) = p(w^${i}) ${SYM.times} q(w^${i}) = ${cstr(P[i])} ${SYM.times} ${cstr(Q[i])} = ${cstr(R[i])}` +
        ` (a complex product: (ac - bd) + (ad + bc)i). In value form, multiplying polynomials is ${n} multiplications.`,
      { table: rows },
    );
  }
  const r = fft(R, true, 'product = ifft(product_fft)')!;
  title = 'round';
  const keep = r.slice(0, need);
  const coeffs = keep.map((x) => pyRound(x[0]));
  const err = Math.max(...keep.map((x, i) => Math.abs(x[0] - coeffs[i])));
  snap(
    9,
    `Keep the first ${need} values (len(p) + len(q) - 1) and round their real parts: ${coeffs.join(', ')}. ` +
      `The largest rounding correction is ${err < 1e-12 ? 'below 10^-12' : err.toExponential(1)}: double precision stays exact while the coefficients are far below 2^53.`,
    {
      table: [
        vec('product', r, 'idle', Object.fromEntries(keep.map((_, i) => [i, 'compare' as Role]))),
        { label: 'round(x.real)', cells: [...coeffs.map((c) => ({ re: String(c), im: null, role: 'good' as Role })), ...Array(n - need).fill(null)] },
      ],
    },
  );
  return { frames, calls, roots, ffts, result: coeffs, product: R, inverse: r, error: null };
}

/** One picture size for a whole run: the widest grid and the most rows. */
export function stabilizeFft(frames: Array<Frame<FftState>>): Array<Frame<FftState>> {
  let cols = 1;
  let rows = 1;
  for (const f of frames) {
    for (const r of f.state.rows) cols = Math.max(cols, r.cells.length);
    rows = Math.max(rows, f.state.rows.length);
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, layout: { cols, rows } } }));
}
