/**
 * Growth charts for the three asymptotic bounds, shared by bigONotation.ts, bigOmega.ts and
 * bigTheta.ts. Each of those files ports the example functions of its topic with a counter on
 * the basic operation; this module steps n through a range, measures f(n) = the count of one
 * example (on the input of the chosen case), draws c * g(n) (or c1 * g(n) and c2 * g(n)) on a
 * log scale and finds n0, the first n from which every plotted point keeps the bound.
 *
 *   Big-O      f(n) <= c * g(n)                for all n >= n0
 *   Big-Omega  c * g(n) <= f(n)                for all n >= n0
 *   Big-Theta  c1 * g(n) <= f(n) <= c2 * g(n)  for all n >= n0
 *
 * A run can only check the plotted range; the closing caption adds what the growth rates say
 * about every larger n (a smaller class loses to a larger one for every constant; in the same
 * class f(n)/g(n) tends to a limit L, and the constant must be on the right side of L).
 *
 * Input: "exponential, g 2^n, c 0.1, n 20"   (f, g, c / c1 c2, n and case, in any order)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GrowthCurve, GrowthPoint, GrowthState } from '../renderers/GrowthChart';

/* ---------- bound functions g(n) ---------- */

export type BoundId = '1' | 'log n' | 'n' | 'n log n' | 'n^2' | 'n^3' | '2^n' | 'n!' | 'n n!';

/** log2(n), exact on powers of two. */
export function log2(n: number): number {
  return Number.isInteger(n) && n > 0 && n < 2 ** 31 && (n & (n - 1)) === 0 ? 31 - Math.clz32(n) : Math.log2(n);
}

export function factorial(n: number): number {
  let p = 1;
  for (let k = 2; k <= n; k++) p *= k;
  return p;
}

interface BoundDef {
  /** Growth class order: 1 < log n < n < n log n < n^2 < n^3 < (phi^n = 6) < 2^n < n! < n n!. */
  rank: number;
  value: (n: number) => number;
  /** g at a given n, for captions: "2^5", "5 log2(5)". */
  at: (n: number) => string;
}

export const BOUNDS: Record<BoundId, BoundDef> = {
  '1': { rank: 0, value: () => 1, at: () => '1' },
  'log n': { rank: 1, value: (n) => log2(n), at: (n) => `log2(${n})` },
  n: { rank: 2, value: (n) => n, at: (n) => `${n}` },
  'n log n': { rank: 3, value: (n) => n * log2(n), at: (n) => `${n} log2(${n})` },
  'n^2': { rank: 4, value: (n) => n * n, at: (n) => `${n}^2` },
  'n^3': { rank: 5, value: (n) => n * n * n, at: (n) => `${n}^3` },
  '2^n': { rank: 7, value: (n) => 2 ** n, at: (n) => `2^${n}` },
  'n!': { rank: 8, value: (n) => factorial(n), at: (n) => `${n}!` },
  'n n!': { rank: 9, value: (n) => n * factorial(n), at: (n) => `${n} * ${n}!` },
};

export const BOUND_IDS = Object.keys(BOUNDS) as BoundId[];

/** The class of the Fibonacci call count, phi^n: between n^3 and 2^n. */
export const PHI_RANK = 6;

const BOUND_SPELLINGS: Record<string, BoundId> = {
  '1': '1',
  logn: 'log n',
  n: 'n',
  nlogn: 'n log n',
  'n^2': 'n^2',
  n2: 'n^2',
  nn: 'n^2',
  'n^3': 'n^3',
  n3: 'n^3',
  nnn: 'n^3',
  '2^n': '2^n',
  'n!': 'n!',
  'nn!': 'n n!',
};

/** "n^2", "n log n", "n*log2(n)", "2**n", "n*n!" -> a bound id. */
export function parseBound(text: string): BoundId | undefined {
  const t = text
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\*\*/g, '^')
    .replace(/\*/g, '')
    .replace(/(?:log2|log|lg)\(n\)/g, 'logn')
    .replace(/log2|lg/g, 'log')
    .replace(/[()]/g, '');
  return BOUND_SPELLINGS[t];
}

/* ---------- the example functions ---------- */

/** What one run of an example measured: the count of the basic operation, and a sentence about it. */
export interface Measured {
  ops: number;
  /** Why the count is what it is, for the caption: "three nested loops of 5 run count += 1 125 times." */
  detail: string;
  /** What the Python function returned (as the fixture pins it). */
  result: unknown;
  /** The return value as the state panel shows it, when pyRepr(result) would not read like Python. */
  shown?: string;
}

export interface GrowthClass {
  rank: number;
  /** The closed form of f(n), or how it grows: "n(n - 1)/2", "2F(n + 1) - 1". */
  form: string;
  /** lim f(n) / g(n) for the bound g of the same rank (absent when no bound shares the rank). */
  limit?: number;
}

export interface GrowthExample {
  key: string;
  /** Other names the parser accepts (the Python name among them). */
  aliases: string[];
  /** The Python function: "cubic_time_example". */
  python: string;
  /** What f(n) counts: "calls", "comparisons". */
  counts: string;
  /** The cases a reader may pick (best / worst...), absent when every input of size n costs the same. */
  cases?: Record<string, string>;
  defaultCase?: string;
  /** Largest n, and why (a full sentence for the InputError). */
  maxN: number;
  capReason?: string;
  defaults: { g: BoundId; c: number[]; to: number; from?: number };
  /** Another bound and constants for a case whose growth differs ("bubble worst": n^2). */
  caseDefaults?: Record<string, { g: BoundId; c: number[] }>;
  /** Pseudocode line of the example. */
  line: number;
  growth(kase: string | null): GrowthClass;
  run(n: number, kase: string | null): Measured;
}

/** Python's repr of a returned value, cut short for long lists. */
export function pyRepr(v: unknown, max = 8): string {
  if (Array.isArray(v)) {
    const parts = v.slice(0, max).map((x) => pyRepr(x, 4));
    return `[${parts.join(', ')}${v.length > max ? `, ... (${v.length} items)` : ''}]`;
  }
  return String(v);
}

/* ---------- input ---------- */

export type BoundKind = 'O' | 'Omega' | 'Theta';

export interface GrowthInput {
  kind: BoundKind;
  example: string;
  kase: string | null;
  g: BoundId;
  /** [c] for Big-O and Big-Omega, [c1, c2] for Big-Theta. */
  c: number[];
  from: number;
  to: number;
}

export const GROWTH_LIMITS = { maxPoints: 40, maxC: 1000 };

/** "0.5", ".25", "1/4", "3" -> a positive number. */
export function parseConstant(token: string, name: string): number {
  const m = token.match(/^(\d+(?:\.\d*)?|\.\d+)(?:\/(\d+(?:\.\d*)?))?$/);
  if (!m) throw new InputError(`${name} must be a positive number such as 2, 0.5 or 1/4 (got "${token}").`);
  const v = m[2] === undefined ? Number(m[1]) : Number(m[1]) / Number(m[2]);
  if (!(v > 0) || !Number.isFinite(v)) throw new InputError(`${name} must be positive (got "${token}"): the definition asks for a constant greater than 0.`);
  if (v > GROWTH_LIMITS.maxC) throw new InputError(`${name} goes up to ${GROWTH_LIMITS.maxC} here (got ${token}).`);
  return v;
}

const SEP = String.raw`(?:\s*=\s*|\s+)`;
const RE_C = new RegExp(`^(c1|c2|c)${SEP}(\\S+)$`);
const RE_G = new RegExp(`^g(?:\\(n\\))?${SEP}(.+)$`);
const RE_N = new RegExp(`^n${SEP}(\\d+)(?:\\s*(?:\\.\\.|-|to)\\s*(\\d+))?$`);
const RE_CASE = new RegExp(`^case${SEP}(\\S+)$`);

/**
 * Parse "exponential, g 2^n, c 0.1, n 20". The example comes first (or after "f"); a case word
 * ("best", "worst", ...) may follow it or come as "case worst". n is "n 20" (1 to 20) or "n 5..20".
 */
export function parseGrowth(text: string, kind: BoundKind, examples: GrowthExample[]): GrowthInput {
  let ex: GrowthExample | undefined;
  let kase: string | null = null;
  let g: BoundId | undefined;
  const c: Array<number | undefined> = [undefined, undefined];
  let from: number | undefined;
  let to: number | undefined;
  const names = examples.map((e) => e.key).join(', ');
  const findExample = (name: string) => examples.find((e) => e.key === name || e.aliases.includes(name));
  const constants = kind === 'Theta' ? '"c1 1, c2 2"' : '"c 2"';

  const segments = text
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const seg of segments) {
    const lower = seg.toLowerCase();
    let m: RegExpMatchArray | null;
    if ((m = lower.match(RE_C))) {
      const which = m[1];
      if (kind === 'Theta' && which === 'c') throw new InputError('Big-Theta takes two constants: write "c1 1, c2 2".');
      if (kind !== 'Theta' && which !== 'c') throw new InputError(`Big-${kind} takes one constant: write "c 2".`);
      const at = which === 'c2' ? 1 : 0;
      if (c[at] !== undefined) throw new InputError(`Give ${which} only once.`);
      c[at] = parseConstant(m[2], which);
      continue;
    }
    if ((m = lower.match(RE_G))) {
      const b = parseBound(m[1]);
      if (!b) throw new InputError(`Unknown bound "${m[1].trim()}". Use one of: ${BOUND_IDS.join(', ')}.`);
      if (g) throw new InputError('Give the bound g only once.');
      g = b;
      continue;
    }
    if ((m = lower.match(RE_N))) {
      if (to !== undefined) throw new InputError('Give the range of n only once.');
      from = m[2] === undefined ? 1 : Number(m[1]);
      to = Number(m[2] ?? m[1]);
      continue;
    }
    if ((m = lower.match(RE_CASE))) {
      kase = m[1];
      continue;
    }
    const words = lower
      .replace(/^f(?:\s*=\s*|\s+)/, '')
      .replace(/\(.*\)$/, '')
      .trim()
      .split(/[\s_]+/)
      .filter(Boolean);
    // The longest prefix of the words that names an example; one more word may name the case.
    let found: GrowthExample | undefined;
    let used = 0;
    for (let k = words.length; k > 0 && !found; k--) {
      found = findExample(words.slice(0, k).join(' ')) ?? findExample(words.slice(0, k).join('_'));
      if (found) used = k;
    }
    if (found) {
      if (ex) throw new InputError('Name one example function per run.');
      ex = found;
      if (used + 1 === words.length) kase = words[used];
      else if (used < words.length) throw new InputError(`Cannot read "${seg}". Name the example, then an optional case, as in "bubble best".`);
      continue;
    }
    if (words.length === 1 && examples.some((e) => e.cases && words[0] in e.cases)) {
      kase = words[0];
      continue;
    }
    throw new InputError(`Cannot read "${seg}". Start with an example (${names}), then "g n^2", ${constants} and "n 16".`);
  }
  if (!ex) throw new InputError(`Name an example function first: ${names}.`);
  if (kase !== null) {
    if (!ex.cases) throw new InputError(`${ex.python} costs the same on every input of size n, so it has no cases to pick.`);
    if (!(kase in ex.cases)) throw new InputError(`${ex.python} has the cases ${Object.keys(ex.cases).join(' and ')} (got "${kase}").`);
  } else if (ex.cases) {
    kase = ex.defaultCase ?? Object.keys(ex.cases)[0];
  }
  const preset = (kase !== null && ex.caseDefaults?.[kase]) || ex.defaults;
  const cs = kind === 'Theta' ? [c[0] ?? preset.c[0], c[1] ?? preset.c[1] ?? preset.c[0]] : [c[0] ?? preset.c[0]];
  if (kind === 'Theta' && cs[0] > cs[1]) throw new InputError(`c1 = ${fmtC(cs[0])} is above c2 = ${fmtC(cs[1])}: the band from c1 * g(n) to c2 * g(n) would be empty.`);
  const lo = from ?? ex.defaults.from ?? 1;
  const hi = to ?? ex.defaults.to;
  if (lo < 1) throw new InputError('n starts at 1 or more (log n and the bounds need n >= 1).');
  if (hi <= lo) throw new InputError(`The range of n needs at least two values (got ${lo} to ${hi}).`);
  if (hi > ex.maxN) throw new InputError(`${ex.capReason ?? `n goes up to ${ex.maxN} for ${ex.python}.`} (Got n = ${hi}.)`);
  if (hi - lo + 1 > GROWTH_LIMITS.maxPoints) throw new InputError(`At most ${GROWTH_LIMITS.maxPoints} values of n per chart, so the points stay apart (got ${hi - lo + 1}).`);
  return { kind, example: ex.key, kase, g: g ?? preset.g, c: cs, from: lo, to: hi };
}

/* ---------- numbers in captions ---------- */

/** 125 -> "125", 242785 -> "242,785", 3.2 -> "3.2", 11.6096 -> "11.6", 2.4e18 -> "2.43e18". */
export function fmt(v: number): string {
  if (v === 0) return '0';
  if (Math.abs(v) >= 1e9) return v.toExponential(2).replace('e+', 'e');
  if (Number.isInteger(v)) return v.toLocaleString('en-US');
  if (Math.abs(v) >= 100) return v.toFixed(1);
  return String(Number(v.toPrecision(3)));
}

/** A constant as typed: 0.25, 3. */
export function fmtC(c: number): string {
  return String(Number(c.toPrecision(6)));
}

/* ---------- the tracer ---------- */

export interface GrowthStep {
  n: number;
  ops: number;
  /** c * g(n), or [c1 * g(n), c2 * g(n)] for Big-Theta. */
  bounds: number[];
  holds: boolean;
  result: unknown;
}

export interface GrowthRun {
  frames: Array<Frame<GrowthState>>;
  steps: GrowthStep[];
  /** The smallest n0 of the plotted range, or null when the last point breaks the bound. */
  n0: number | null;
}

export interface GrowthCode {
  /** The pseudocode line of the check. */
  check: number;
  /** The line of the verdict, after the last n. */
  verdict: number;
}

/** Does the bound hold at one n? */
export function holdsAt(kind: BoundKind, f: number, bounds: number[]): boolean {
  if (kind === 'O') return f <= bounds[0];
  if (kind === 'Omega') return bounds[0] <= f;
  return bounds[0] <= f && f <= bounds[1];
}

/** The smallest n0 such that every n from n0 to the end holds, or null. */
export function smallestN0(steps: Array<{ n: number; holds: boolean }>): number | null {
  let n0: number | null = null;
  for (let k = steps.length - 1; k >= 0 && steps[k].holds; k--) n0 = steps[k].n;
  return n0;
}

/** What the growth rates say about every n past the plotted range. */
export function asymptotics(kind: BoundKind, g: BoundId, cls: GrowthClass, last: { n: number; ops: number }): string {
  const bound = BOUNDS[g];
  const f = `f(n) = ${cls.form}`;
  const not = `f(n) is not ${kind === 'O' ? 'O' : kind === 'Omega' ? 'Omega' : 'Theta'}(${g})`;
  if (cls.rank === bound.rank) {
    const ratio = last.ops / bound.value(last.n);
    const L = cls.limit === undefined ? undefined : fmtC(cls.limit);
    const same = `f and g grow at the same rate (${f}), so the constant decides: f(n)/g(n) is ${Number.isFinite(ratio) ? fmt(ratio) : 'undefined'} at n = ${last.n}${L === undefined ? '' : ` and tends to ${L}`}.`;
    if (L === undefined) return same;
    if (kind === 'O') return `${same} Every c > ${L} holds from some n0 on and no c < ${L} does, so f(n) = O(${g}).`;
    if (kind === 'Omega') return `${same} Every c < ${L} holds from some n0 on and no c > ${L} does, so f(n) = Omega(${g}).`;
    return `${same} Any c1 < ${L} < c2 holds from some n0 on, so f(n) = Theta(${g}).`;
  }
  const slower = cls.rank < bound.rank;
  const rel = slower ? `grows more slowly than g(n) = ${g}, so f(n)/g(n) shrinks toward 0` : `grows faster than g(n) = ${g}, so f(n)/g(n) grows without bound`;
  if (kind === 'O') return slower ? `${f} ${rel}: every c > 0 holds from some n0 on, so f(n) = O(${g}), a true but loose bound.` : `${f} ${rel}: no constant c holds for every large n, so ${not}.`;
  if (kind === 'Omega') return slower ? `${f} ${rel}: no constant c > 0 holds for every large n, so ${not}.` : `${f} ${rel}: every c > 0 holds from some n0 on, so f(n) = Omega(${g}), a true but loose bound.`;
  return slower ? `${f} ${rel}: every lower bound c1 * g(n) overtakes f, so ${not}.` : `${f} ${rel}: f overtakes every upper bound c2 * g(n), so ${not}.`;
}

/** Decades of the log axis: every f value and the bound up to 4 decades above f, at least 2 decades tall. */
export function decadesFor(fs: number[], bs: number[]): [number, number] {
  const fMax = Math.max(1, ...fs);
  const bMax = Math.max(0, ...bs.filter((v) => Number.isFinite(v)));
  const top = Math.max(fMax, Math.min(bMax, fMax * 1e4));
  let hi = Math.ceil(Math.log10(top) - 1e-9);
  const positives = [...fs, ...bs].filter((v) => v > 0 && v <= 10 ** hi);
  const lo = Math.max(-2, Math.floor(Math.log10(Math.min(1, ...positives)) + 1e-9));
  if (hi - lo < 2) hi = lo + 2;
  return [lo, hi];
}

export function traceGrowth(input: GrowthInput, ex: GrowthExample, code: GrowthCode): GrowthRun {
  const { kind, g, c, from, to } = input;
  const bound = BOUNDS[g];
  const cls = ex.growth(input.kase);
  const caseText = input.kase && ex.cases ? ` (${ex.cases[input.kase]})` : '';
  const ns = Array.from({ length: to - from + 1 }, (_, k) => from + k);
  const measured = ns.map((n) => ex.run(n, input.kase));
  const steps: GrowthStep[] = ns.map((n, k) => {
    const gv = bound.value(n);
    const bounds = c.map((cv) => cv * gv);
    return { n, ops: measured[k].ops, bounds, holds: holdsAt(kind, measured[k].ops, bounds), result: measured[k].result };
  });
  const n0 = smallestN0(steps);
  const decades = decadesFor(
    steps.map((s) => s.ops),
    steps.flatMap((s) => s.bounds),
  );
  const cText = c.map((cv) => `${fmtC(cv)} * ${g}`);
  const statement = kind === 'O' ? `f(n) <= ${cText[0]}` : kind === 'Omega' ? `${cText[0]} <= f(n)` : `${cText[0]} <= f(n) <= ${cText[1]}`;
  const frames: Array<Frame<GrowthState>> = [];

  /** A snapshot once `upto` values are measured and `checked` of them compared with the bound. */
  const snap = (upto: number, checked: number, line: number | undefined, caption: string, vars: Array<[string, string | number]>, final = false) => {
    const points: GrowthPoint[] = steps.slice(0, upto).map((s, k) => ({
      n: s.n,
      value: s.ops,
      role: k >= checked ? 'active' : s.holds ? 'good' : 'bad',
      label: k === upto - 1 && !final ? fmt(s.ops) : undefined,
    }));
    // The next point waits at the bottom, hidden, so it rises when it is measured.
    if (upto < steps.length) points.push({ n: steps[upto].n, value: 0, role: 'active', hidden: true });
    const curves: GrowthCurve[] = c.map((_, at) => ({
      id: at === 0 ? 'lo' : 'hi',
      label: cText[at],
      role: 'compare' as Role,
      dashed: kind === 'Theta' && at === 0,
      points: steps.slice(0, upto).map((s): [number, number] => [s.n, s.bounds[at]]),
    }));
    // n0 so far: one past the last checked point that broke the bound.
    let candidate: number | null = checked > 0 ? steps[0].n : null;
    for (let k = 0; k < checked; k++) if (!steps[k].holds) candidate = k + 1 < steps.length ? steps[k + 1].n : null;
    const lastChecked = checked > 0 ? steps[checked - 1].n : -Infinity;
    const shown = final ? n0 : candidate !== null && candidate <= lastChecked ? candidate : null;
    const cur = checked === upto && upto > 0 && !final ? steps[upto - 1] : undefined;
    const probeValues = cur ? [cur.ops, ...cur.bounds] : [];
    frames.push({
      line,
      caption,
      vars,
      state: {
        label: `Growth chart of ${ex.python}${caseText}: ${upto} of ${steps.length} values of n measured against ${statement}.`,
        fLabel: `f(n) = ${ex.counts} of ${ex.python}${caseText}`,
        x: [from, to],
        decades,
        points,
        curves,
        band: kind === 'Theta' ? ['lo', 'hi'] : undefined,
        n0: shown === null ? undefined : { n: shown, label: `n0 = ${shown}`, final },
        probe: cur ? { n: cur.n, lo: Math.min(...probeValues), hi: Math.max(...probeValues), role: cur.holds ? 'good' : 'bad' } : undefined,
      },
    });
  };

  const constants = kind === 'Theta' ? `c1 = ${fmtC(c[0])}, c2 = ${fmtC(c[1])}` : `c = ${fmtC(c[0])}`;
  snap(
    0,
    0,
    undefined,
    `f(n) counts the ${ex.counts} of ${ex.python}${caseText}. Big-${kind} needs ${kind === 'Theta' ? 'constants c1, c2' : 'a constant c'} and an n0 with ${statement} for every n >= n0. ` +
      `Here g(n) = ${g} and ${constants}: n runs from ${from} to ${to}, and each f(n) is measured by running the code.`,
    [
      ['g(n)', g],
      [kind === 'Theta' ? 'c1, c2' : 'c', c.map(fmtC).join(', ')],
      ['n', `${from} to ${to}`],
    ],
  );

  steps.forEach((s, k) => {
    const bText = (at: number) => `${fmtC(c[at])} * ${bound.at(s.n)} = ${fmt(s.bounds[at])}`;
    const vars: Array<[string, string | number]> = [
      ['n', s.n],
      ['f(n)', fmt(s.ops)],
      ...(kind === 'Theta'
        ? ([
            ['c1 * g(n)', fmt(s.bounds[0])],
            ['c2 * g(n)', fmt(s.bounds[1])],
          ] as Array<[string, string]>)
        : ([['c * g(n)', fmt(s.bounds[0])]] as Array<[string, string]>)),
      ['returned', measured[k].shown ?? pyRepr(s.result)],
    ];
    snap(k + 1, k, ex.line, `n = ${s.n}: ${measured[k].detail} So f(${s.n}) = ${fmt(s.ops)}.`, vars);
    let verdict: string;
    if (kind === 'O') {
      verdict = s.holds
        ? `f(${s.n}) = ${fmt(s.ops)} <= c * g(${s.n}) = ${bText(0)}: the point is on or under the bound, so it holds at n = ${s.n}.`
        : `f(${s.n}) = ${fmt(s.ops)} > c * g(${s.n}) = ${bText(0)}: the point is above the bound, so n0 must be larger than ${s.n}.`;
    } else if (kind === 'Omega') {
      verdict = s.holds
        ? `f(${s.n}) = ${fmt(s.ops)} >= c * g(${s.n}) = ${bText(0)}: the point is on or over the lower bound, so it holds at n = ${s.n}.`
        : `f(${s.n}) = ${fmt(s.ops)} < c * g(${s.n}) = ${bText(0)}: the point is under the lower bound, so n0 must be larger than ${s.n}.`;
    } else if (s.holds) {
      verdict = `c1 * g(${s.n}) = ${fmt(s.bounds[0])} <= f(${s.n}) = ${fmt(s.ops)} <= c2 * g(${s.n}) = ${fmt(s.bounds[1])}: the point is inside the band, so both bounds hold at n = ${s.n}.`;
    } else if (s.ops < s.bounds[0]) {
      verdict = `f(${s.n}) = ${fmt(s.ops)} < c1 * g(${s.n}) = ${bText(0)}: the point is under the band, so n0 must be larger than ${s.n}.`;
    } else {
      verdict = `f(${s.n}) = ${fmt(s.ops)} > c2 * g(${s.n}) = ${bText(1)}: the point is over the band, so n0 must be larger than ${s.n}.`;
    }
    snap(k + 1, k + 1, code.check, verdict, vars);
  });

  const last = steps[steps.length - 1];
  const range =
    n0 === null
      ? `Done: the bound still fails at n = ${last.n}, the last point plotted, so no n0 works on this range.`
      : n0 === from
        ? `Done: every point from n = ${from} to ${to} keeps ${statement}, so n0 = ${n0} works on this range.`
        : `Done: from n0 = ${n0} to n = ${to} every point keeps ${statement} (the shaded part). Points before n0 may break it: the definition allows that.`;
  snap(steps.length, steps.length, code.verdict, `${range} ${asymptotics(kind, g, cls, last)}`, [
    ['n0', n0 === null ? 'none in range' : n0],
    ['points kept', `${steps.filter((s) => s.holds).length} of ${steps.length}`],
    ['f(n)', cls.form],
  ], true);
  return { frames, steps, n0 };
}
