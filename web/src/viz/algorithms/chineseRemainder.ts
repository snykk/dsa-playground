/**
 * Chinese remainder theorem tracer, drawn with CongruenceCombs: each congruence x = r (mod m) is a
 * comb of points r, r + m, r + 2m, ... on a number line, and the running solution x (mod lcm) is
 * one more comb that thins out at every merge until only the points every comb shares are left.
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Number_Theory/Chinese_Remainder_Theorem/Python/chinese_remainder_theorem.py:
 *   chinese_remainder_theorem(remainders, moduli)  None when the lengths differ or a modulus is
 *       not positive; x, lcm = 0, 1; for each (r, m): merged = _merge(x, lcm, r % m, m), None if
 *       a merge fails; return x (0 for an empty system)
 *   _merge(r1, m1, r2, m2)  g, p, _ = extended_gcd(m1, m2); None if (r2 - r1) % g != 0; else
 *       t = ((r2 - r1) // g * p) % (m2 // g), lcm = m1 // g * m2, return ((r1 + m1 * t) % lcm, lcm)
 * Values are bigints: the combined modulus is a product of up to six moduli of up to 10^12.
 * Golden fixtures (__fixtures__/numberTheory.json, section "crt") pin every merge, every
 * extended_gcd call and the answer.
 *
 * Input: "2 mod 3, 3 mod 5, 2 mod 7"   or the two lists "r 2 3 2; m 3 5 7"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData } from '../ui/molecules/Strip';
import { abbreviate, absBig, egcdLevels, paren, parseBig, pyDivBig, pyModBig, segments } from './numberTheoryCommon';

export interface CrtInput {
  remainders: bigint[];
  moduli: bigint[];
}

export const CRT_LIMITS = { maxValue: 10n ** 12n, maxCongruences: 6, maxWindow: 120 };

/** Parse "2 mod 3, x = 3 (mod 5)" or "r 2 3 2; m 3 5 7" (the lists may differ in length, as Python allows). */
export function parseCrt(text: string): CrtInput {
  const remainders: bigint[] = [];
  const moduli: bigint[] = [];
  let lists = false;
  let pairs = false;
  const num = (t: string, what: string) => parseBig(t, what, -CRT_LIMITS.maxValue, CRT_LIMITS.maxValue, 'between -10^12 and 10^12');
  // The list form ("r 2, 3, 2; m 3, 5, 7") is split on semicolons and new lines only, so commas stay inside a list.
  const listForm = /^\s*(?:remainders|moduli|r|m)(?=[\s:=[]|$)/im.test(text);
  const parts = listForm ? text.split(/[;\n]/).map((t) => t.trim()).filter(Boolean) : segments(text);
  for (const segment of parts) {
    const list = segment.match(/^(remainders|moduli|r|m)(?=[\s:=[]|$)\s*[:=]?\s*\[?([^\]]*)\]?$/i);
    if (list) {
      lists = true;
      const target = /^r/i.test(list[1]) ? remainders : moduli;
      if (target.length) throw new InputError(`Give the ${/^r/i.test(list[1]) ? 'remainders' : 'moduli'} only once.`);
      for (const t of list[2].split(/[\s,]+/).filter(Boolean)) target.push(num(t, /^r/i.test(list[1]) ? 'A remainder' : 'A modulus'));
      continue;
    }
    const pair = segment.match(/^(?:x\s*=\s*)?([+-]?\d[\d_]*)\s*\(?\s*mod\s+([+-]?\d[\d_]*)\s*\)?$/i);
    if (pair) {
      pairs = true;
      remainders.push(num(pair[1], 'A remainder'));
      moduli.push(num(pair[2], 'A modulus'));
      continue;
    }
    throw new InputError(`Cannot read "${segment}". Write congruences like "2 mod 3, 3 mod 5", or the lists "r 2 3 2; m 3 5 7".`);
  }
  if (lists && pairs) throw new InputError('Use either congruences ("2 mod 3, 3 mod 5") or the two lists ("r 2 3; m 3 5"), not both.');
  if (!lists && remainders.length === 0) throw new InputError('Add a congruence, for example "2 mod 3, 3 mod 5, 2 mod 7". (An empty system is "r; m".)');
  if (Math.max(remainders.length, moduli.length) > CRT_LIMITS.maxCongruences) throw new InputError(`At most ${CRT_LIMITS.maxCongruences} congruences, please.`);
  return { remainders, moduli };
}

export const formatCrtCall = (input: CrtInput) => `chinese_remainder_theorem([${input.remainders.join(', ')}], [${input.moduli.join(', ')}])`;

/* ---------- pseudocode ---------- */

export const CRT_CODE = [
  'chinese_remainder_theorem(remainders, moduli):',
  '  if len(remainders) != len(moduli): return None',
  '  if any(m <= 0 for m in moduli): return None',
  '  x, lcm = 0, 1                      # x = 0 (mod 1): every integer',
  '  for r, m in zip(remainders, moduli):',
  '    merged = _merge(x, lcm, r % m, m)',
  '    if merged is None: return None',
  '    x, lcm = merged',
  '  return x',
  '_merge(r1, m1, r2, m2):',
  '  g, p, _ = extended_gcd(m1, m2)     # m1*p + m2*q = g',
  '  if (r2 - r1) % g != 0: return None',
  '  t = ((r2 - r1) // g * p) % (m2 // g)',
  '  lcm = m1 // g * m2',
  '  return ((r1 + m1 * t) % lcm, lcm)',
];

/* ---------- state ---------- */

export interface CombPoint {
  at: number;
  role?: Role;
  /** A small label under the point (t = 2). */
  tag?: string;
}

export interface CombRow {
  key: string;
  label: string;
  points: CombPoint[];
  role?: Role;
}

export interface CrtState {
  /** The number line shows 0..window-1. */
  window: number;
  rows: CombRow[];
  merged: CombRow;
  work: string[];
  /** The answer checked against each congruence; the renderer packs them into the work lines left. */
  checks?: string[];
  verdict?: { text: string; role: Role };
  strips: StripData[];
  /** Same for every frame of a run (stabilizeCombs): the longest label, the number of rows, and room for a verdict. */
  layout?: { chars: number; rows: number; verdict: boolean };
}

export interface CrtStep {
  /** Every _merge call: [r1, m1, r2, m2, [x, lcm] or null]. */
  merges: Array<[bigint, bigint, bigint, bigint, [bigint, bigint] | null]>;
  /** Every extended_gcd(m1, m2) call: [a, b, g, x, y]. */
  egcd: Array<[bigint, bigint, bigint, bigint, bigint]>;
  result: bigint | null;
}

export interface CrtRun {
  frames: Array<Frame<CrtState>>;
  step: CrtStep;
}

/* ---------- tracer ---------- */

/** A number as the picture shows it: long values shortened (the caption keeps every digit). */
const ab = (v: bigint | number | string) => abbreviate(String(v), 13);

/** Every 3rd, 15th, 21st... point; a modulus of 1 keeps every point. */
const everyNth = (L: bigint): string => {
  if (L === 1n) return 'every point';
  const s = String(L);
  const two = Number(s.slice(-2));
  const suffix = two >= 11 && two <= 13 ? 'th' : ({ '1': 'st', '2': 'nd', '3': 'rd' } as Record<string, string>)[s.slice(-1)] ?? 'th';
  return `every ${s}${suffix} point`;
};

const gcdBig = (a: bigint, b: bigint): bigint => {
  let x = absBig(a);
  let y = absBig(b);
  while (y) [x, y] = [y, x % y];
  return x;
};

/** Points k in 0..window-1 with k = r (mod m), for m > 0. */
function comb(r: bigint, m: bigint, window: number): number[] {
  if (m <= 0n) return [];
  const out: number[] = [];
  for (let k = pyModBig(r, m); k < BigInt(window); k += m) out.push(Number(k));
  return out;
}

export function crtTrace(input: CrtInput): CrtRun {
  const { remainders, moduli } = input;
  const frames: Array<Frame<CrtState>> = [];
  const step: CrtStep = { merges: [], egcd: [], result: null };
  const n = remainders.length;
  const rowsCount = Math.max(n, moduli.length);
  // The window: two periods of the combined modulus, between 20 and 120.
  let total = 1n;
  for (const m of moduli) if (m > 0n) total = (total / gcdBig(total, m)) * m;
  const window = Number(total * 2n > BigInt(CRT_LIMITS.maxWindow) ? BigInt(CRT_LIMITS.maxWindow) : total * 2n < 20n ? 20n : total * 2n);

  const label = (i: number) => {
    const r = remainders[i];
    const m = moduli[i];
    if (r === undefined) return `(no remainder) mod ${ab(m)}`;
    if (m === undefined) return `x = ${ab(r)} (no modulus)`;
    return `x = ${ab(r)} (mod ${ab(m)})`;
  };
  const congruenceRow = (i: number, role?: Role, pointRole?: Role, pick?: number): CombRow => {
    const r = remainders[i];
    const m = moduli[i];
    const pts = r !== undefined && m !== undefined ? comb(r, m, window) : [];
    return { key: `c${i}`, label: label(i), role, points: pts.map((at) => ({ at, role: at === pick ? 'good' : pointRole })) };
  };
  let x = 0n;
  let L = 1n;
  const mergedRow = (role?: Role, roles: Record<number, Role> = {}, tags: Record<number, string> = {}): CombRow => ({
    key: 'merged',
    label: `x = ${ab(x)} (mod ${ab(L)})`,
    role,
    points: comb(x, L, window).map((at) => ({ at, role: roles[at], tag: tags[at] })),
  });
  const states: Array<Role | undefined> = Array.from({ length: rowsCount }, () => undefined);

  const snap = (line: number | undefined, caption: string, o: { rows?: CombRow[]; merged?: CombRow; work?: string[]; checks?: string[]; verdict?: CrtState['verdict']; vars?: Array<[string, string | number]> } = {}) => {
    frames.push({
      line,
      caption,
      vars: [['x', String(x)], ['lcm', String(L)], ...(o.vars ?? [])],
      state: {
        window,
        rows: o.rows ?? Array.from({ length: rowsCount }, (_, i) => congruenceRow(i, states[i] === 'done' ? 'done' : undefined, states[i] === 'done' ? 'done' : 'muted')),
        merged: o.merged ?? mergedRow(),
        work: o.work ?? [],
        checks: o.checks,
        verdict: o.verdict,
        strips: [],
      },
    });
  };

  snap(0, `${formatCrtCall(input)}: find x with every remainder. Each congruence is a comb of points spaced m apart; a solution is a point that every comb shares.`, { work: [`${n} congruence${n === 1 ? '' : 's'}`] });
  if (n !== moduli.length) {
    snap(1, `len(remainders) = ${n} but len(moduli) = ${moduli.length}: the lists do not pair up, so the function returns None.`, { verdict: { text: 'None: the lists differ in length', role: 'bad' }, work: [`${n} remainders, ${ab(moduli.length)} moduli`] });
    return { frames, step };
  }
  const bad = moduli.findIndex((m) => m <= 0n);
  if (bad >= 0) {
    states[bad] = 'bad';
    snap(2, `Modulus ${moduli[bad]} is not positive: "x = r (mod ${moduli[bad]})" is not a congruence this code accepts, so it returns None before merging anything.`, {
      verdict: { text: `None: modulus ${ab(moduli[bad])} <= 0`, role: 'bad' },
      work: [`moduli: ${moduli.map(ab).join(', ')}`],
    });
    return { frames, step };
  }
  snap(3, 'x, lcm = 0, 1: "x = 0 (mod 1)" holds for every integer, so the merged comb starts with every point. Each merge keeps only the points the next comb shares.', {
    merged: mergedRow('active'),
    work: ['x = 0 (mod 1)'],
  });

  for (let i = 0; i < n; i++) {
    const r = remainders[i];
    const m = moduli[i];
    const r2 = pyModBig(r, m);
    states[i] = 'active';
    const others = (pick?: number) =>
      Array.from({ length: n }, (_, j) => (j === i ? congruenceRow(j, 'active', 'active', pick) : congruenceRow(j, states[j] === 'done' ? 'done' : undefined, states[j] === 'done' ? 'done' : 'muted')));
    const reduce = r2 !== r ? `r % m = ${r} % ${m} = ${r2}, so the comb starts at ${r2}. ` : '';
    // extended_gcd(L, m): L, m > 0, so no sign fix.
    const levels = egcdLevels(L, m);
    const g = levels[0].g;
    const p = levels[0].x;
    const q = levels[0].y;
    step.egcd.push([L, m, g, p, q]);
    const eq = `${L}*${paren(p)} + ${m}*${paren(q)} = ${g}`;
    const eqShort = `${ab(L)}*${ab(paren(p))} + ${ab(m)}*${ab(paren(q))} = ${ab(g)}`;
    snap(5, `${reduce}Merge x = ${x} (mod ${L}) with x = ${r2} (mod ${m}). extended_gcd(${L}, ${m}) gives g = ${g} and p = ${p}: ${eq}.`, {
      rows: others(),
      merged: mergedRow('compare', Object.fromEntries(comb(x, L, window).map((at) => [at, 'compare' as Role]))),
      work: [`x = ${ab(x)} (mod ${ab(L)})  and  x = ${ab(r2)} (mod ${ab(m)})`, `g = ${ab(g)}:  ${eqShort}`],
      vars: [
        ['r % m', String(r2)],
        ['g', String(g)],
        ['p', String(p)],
      ],
    });
    const diff = r2 - x;
    if (pyModBig(diff, g) !== 0n) {
      step.merges.push([x, L, r2, m, null]);
      states[i] = 'bad';
      snap(11, `(r2 - r1) % g = (${r2} - ${x}) % ${g} = ${pyModBig(diff, g)}, not 0. Every point of the merged comb is ${pyModBig(x, g)} modulo ${g} and every point of the new one is ${pyModBig(r2, g)} modulo ${g}, so no point is on both: _merge returns None, and so does the function.`, {
        rows: others(),
        merged: mergedRow('bad', Object.fromEntries(comb(x, L, window).map((at) => [at, 'bad' as Role]))),
        work: [`(${ab(r2)} - ${ab(x)}) % ${ab(g)} = ${ab(pyModBig(diff, g))} != 0`, `x = ${ab(pyModBig(x, g))} (mod ${ab(g)}) but r = ${ab(pyModBig(r2, g))} (mod ${ab(g)})`],
        verdict: { text: 'None: the congruences contradict each other', role: 'bad' },
      });
      return { frames, step };
    }
    const mg = m / g;
    const t = pyModBig(pyDivBig(diff, g) * p, mg);
    const newL = (L / g) * m;
    const newX = pyModBig(x + L * t, newL);
    step.merges.push([x, L, r2, m, [newX, newL]]);
    // Candidates x + L*t for t = 0..m/g-1: one per residue the merged comb can take below the new lcm.
    const cand: Record<number, Role> = {};
    const tags: Record<number, string> = {};
    for (let k = 0n; k < mg && x + L * k < BigInt(window); k++) {
      const at = Number(x + L * k);
      cand[at] = k === t ? 'good' : 'compare';
      if (mg <= 12n || k === t) tags[at] = `t=${k}`;
    }
    snap(12, `(${r2} - ${x}) % ${g} = 0, so a solution exists. The candidates below the new lcm are x + ${L}*t for t = 0..${mg - 1n}; the formula picks t = ((${r2} - ${x}) // ${g} * ${paren(p)}) % ${mg} = ${t}, because ${L}*${t} = ${diff} (mod ${m}).`, {
      rows: others(newX < BigInt(window) ? Number(newX) : undefined),
      merged: mergedRow('compare', cand, tags),
      work: [`t = ((${ab(r2)} - ${ab(x)}) // ${ab(g)} * ${ab(paren(p))}) % ${ab(mg)} = ${ab(t)}`, `x + lcm*t = ${ab(x)} + ${ab(L)}*${ab(t)} = ${ab(x + L * t)}`],
      vars: [
        ['t', String(t)],
        ['m // g', String(mg)],
      ],
    });
    const oldX = x;
    const oldL = L;
    x = newX;
    L = newL;
    states[i] = 'done';
    snap(14, `lcm = ${oldL} // ${g} * ${m} = ${L}, and x = (${oldX} + ${oldL}*${t}) % ${L} = ${x}. The merged comb now keeps ${everyNth(L)}: ${i ? `those satisfy the first ${i + 1} congruences at once` : 'those satisfy the first congruence'}.`, {
      merged: mergedRow('active', Object.fromEntries(comb(x, L, window).map((at) => [at, 'good' as Role]))),
      work: [`lcm = ${ab(oldL)} // ${ab(g)} * ${ab(m)} = ${ab(L)}`, `x = ${ab(x)} (mod ${ab(L)})`],
      vars: [['merged', `${x} (mod ${L})`]],
    });
  }
  step.result = x;
  const inWindow = x < BigInt(window);
  snap(8, n === 0 ? 'No congruences: the loop never runs and the function returns 0, the solution modulo 1.' : `return x = ${x}: it satisfies all ${n} congruence${n === 1 ? '' : 's'}, and every solution is ${x} plus a multiple of ${L}.${inWindow ? '' : ` (It lies beyond the window 0..${window - 1}.)`}`, {
    rows: Array.from({ length: n }, (_, j) => congruenceRow(j, 'done', 'muted', inWindow ? Number(x) : undefined)),
    merged: mergedRow('done', Object.fromEntries(comb(x, L, window).map((at) => [at, 'good' as Role]))),
    work: n === 0 ? ['x = 0 (mod 1)'] : [],
    checks: remainders.map((r, j) => `${ab(x)} = ${ab(r)} (mod ${ab(moduli[j])})`),
    verdict: { text: `x = ${ab(x)}`, role: 'good' },
  });
  return { frames, step };
}
