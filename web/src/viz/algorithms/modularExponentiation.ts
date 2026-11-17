/**
 * Modular exponentiation tracers, drawn with PowerLadder: the exponent's bits in a row that
 * shifts right as the loop consumes them, beside a table that grows one row per bit (the base
 * squared again and again, the result multiplied on the 1 bits); the recursive version shows the
 * same bits and its call stack instead, filled with return values on the way back up.
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Number_Theory/Modular_Exponentiation/Python/modular_exponentiation.py:
 *   mod_pow(base, exponent, modulus)            negative exponent: mod_pow(mod_inverse(base), -exponent)
 *                                               (None without an inverse); 0 when modulus == 1; else
 *                                               result = 1, base %= modulus, and while exponent > 0:
 *                                               multiply on an odd exponent, exponent >>= 1, base squared
 *   mod_pow_recursive(base, exponent, modulus)  the same first two checks; 1 for exponent 0; an even
 *                                               exponent squares f(exponent // 2), an odd one returns
 *                                               (base * f(exponent - 1)) % modulus (base not reduced)
 *   mod_inverse(a, m)                           x % m from extended_gcd_inline(a, m) when the gcd is 1
 * Values are bigints: the modulus has up to 19 digits, so products reach 10^38, exact as in Python.
 * Golden fixtures (__fixtures__/numberTheory.json, section "modExp") pin the loop state at every
 * iteration, every recursive call with its return value and the inverse of a negative exponent.
 *
 * Input: "5^13 mod 11, 2^-3 mod 11"   (also "pow(5, 13, 11)" or "5 13 11")
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { absBig, callOf, egcdLevels, paren, parseBig, pyModBig, segments, type StripSlot } from './numberTheoryCommon';

export interface PowCall {
  base: bigint;
  exponent: bigint;
  modulus: bigint;
}

export interface PowInput {
  calls: PowCall[];
}

export const POW_LIMITS = { maxModulus: 10n ** 19n - 1n, maxBase: 10n ** 19n - 1n, maxExponent: 2n ** 20n - 1n, maxCalls: 4 };

export function parsePow(text: string): PowInput {
  const calls: PowCall[] = [];
  for (const segment of segments(text)) {
    let args: string[] | undefined;
    const caret = segment.match(/^\(?\s*([+-]?\d[\d_]*)\s*\)?\s*\^\s*\(?\s*([+-]?\d[\d_]*)\s*\)?\s*(?:mod|%)\s*([+-]?\d[\d_]*)$/i);
    if (caret) args = [caret[1], caret[2], caret[3]];
    else if (/^[+-]?\d[\d_]*(\s+[+-]?\d[\d_]*){2}$/.test(segment)) args = segment.split(/\s+/);
    else {
      const call = callOf(segment);
      if (call && ['pow', 'mod_pow', 'modpow', 'mod_pow_recursive', 'power'].includes(call.name)) args = call.args;
    }
    if (!args) throw new InputError(`Cannot read "${segment}". Write calls like "5^13 mod 11", "pow(5, 13, 11)" or "5 13 11", separated by commas.`);
    if (args.length !== 3) throw new InputError(`"${segment}": a call takes a base, an exponent and a modulus, as in "pow(5, 13, 11)".`);
    const base = parseBig(args[0], 'The base', -POW_LIMITS.maxBase, POW_LIMITS.maxBase, 'at most 19 digits long');
    const exponent = parseBig(args[1], 'The exponent', -POW_LIMITS.maxExponent, POW_LIMITS.maxExponent, 'between -1048575 and 1048575 (20 bits), so every bit fits on screen');
    const modulus = parseBig(args[2], 'The modulus', -POW_LIMITS.maxModulus, POW_LIMITS.maxModulus, 'at most 19 digits long');
    if (modulus <= 0n) {
      throw new InputError(
        `The modulus must be positive, as the docstring says (got ${args[2]}). With modulus 0, mod_pow raises ZeroDivisionError at base % modulus, and a negative modulus gives results in modulus+1..0.`,
      );
    }
    calls.push({ base, exponent, modulus });
  }
  if (calls.length === 0) throw new InputError('Add at least one call, for example "5^13 mod 11".');
  if (calls.length > POW_LIMITS.maxCalls) throw new InputError(`At most ${POW_LIMITS.maxCalls} calls, please (got ${calls.length}).`);
  return { calls };
}

export const formatPow = (c: PowCall, fn = 'mod_pow') => `${fn}(${c.base}, ${c.exponent}, ${c.modulus})`;

/* ---------- pseudocode ---------- */

export const POW_CODE = [
  'mod_pow(base, exponent, modulus):',
  '  if exponent < 0: inv = mod_inverse(base, modulus)',
  '    if inv is None: return None',
  '    return mod_pow(inv, -exponent, modulus)',
  '  if modulus == 1: return 0',
  '  result = 1',
  '  base = base % modulus',
  '  while exponent > 0:',
  '    if exponent % 2 == 1:',
  '      result = (result * base) % modulus',
  '    exponent = exponent >> 1',
  '    base = (base * base) % modulus',
  '  return result',
];

export const POW_REC_CODE = [
  'mod_pow_recursive(base, exponent, modulus):',
  '  if exponent < 0: inv = mod_inverse(base, modulus)',
  '    if inv is None: return None',
  '    return mod_pow_recursive(inv, -exponent, modulus)',
  '  if modulus == 1: return 0',
  '  if exponent == 0: return 1',
  '  if exponent % 2 == 0:',
  '    temp = mod_pow_recursive(base, exponent // 2, modulus)',
  '    return (temp * temp) % modulus',
  '  else:',
  '    return (base * mod_pow_recursive(base, exponent - 1, modulus)) % modulus',
];

/* ---------- state ---------- */

/** One bit of the exponent. `slot` counts from the right edge of the field (0 = lowest bit position); a negative slot has been shifted out. */
export interface PowBit {
  id: string;
  v: 0 | 1;
  slot: number;
  role: Role;
}

export interface PowCell {
  text: string;
  role?: Role;
}

export interface PowState {
  /** Which call: shapes of another call never glide into these. */
  call: number;
  /** Bits of the current exponent (and up to three just shifted out, faded). */
  bits: PowBit[];
  bitsLabel: string;
  table: { columns: string[]; rows: PowCell[][] };
  strips: StripData[];
  /** Every strip of the run at its widest (stripSlots in a stabilize step), so the strips keep their room. */
  stripSlots?: StripSlot[];
  /** Same for every frame of a run (stabilizePower): bit slots, table rows, characters per column. */
  layout?: { slots: number; rows: number; cols: number[] };
}

/* ---------- shared pieces ---------- */

export interface PowStep {
  call: PowCall;
  result: bigint | null;
  /** _extended_gcd_nonneg calls behind a negative exponent: [a, b, g, x, y]. */
  egcd: Array<[bigint, bigint, bigint, bigint, bigint]>;
  /** mod_pow: [result, base, exponent] at the top of every loop iteration. */
  loop: Array<[bigint, bigint, bigint]>;
  /** mod_pow_recursive: every call [base, exponent, modulus, returned], in call order. */
  calls: Array<[bigint, bigint, bigint, bigint | null]>;
}

export interface PowRun {
  frames: Array<Frame<PowState>>;
  steps: PowStep[];
}

const bin = (e: bigint) => (e === 0n ? '0' : e.toString(2));
/** The label under the bits: the exponent and, from 2 on, its binary form. */
const expLabel = (e: bigint) => (e < 2n ? `exponent = ${e}` : `exponent = ${e} = ${bin(e)}`);

/** mod_inverse(a, m) the way the module computes it, with its _extended_gcd_nonneg calls. */
function inverseOf(a: bigint, m: bigint) {
  const levels = egcdLevels(absBig(a), m);
  const g = levels[0].g;
  const x = a < 0n ? 0n - levels[0].x : levels[0].x;
  return {
    inv: g === 1n ? pyModBig(x, m) : null,
    g,
    x,
    y: levels[0].y,
    egcd: levels.map((lv): [bigint, bigint, bigint, bigint, bigint] => [lv.a, lv.b, lv.g, lv.x, lv.y]),
  };
}

/** The bit cells of exponent e, the lowest at slot 0; `dropped` earlier bits sit at slots -1, -2, ... (faded). */
function bitCells(call: number, e: bigint, consumed: number, roles: Record<number, Role> = {}, dropped: Array<0 | 1> = []): PowBit[] {
  const out: PowBit[] = [];
  const s = e.toString(2);
  if (e > 0n) {
    for (let k = 0; k < s.length; k++) {
      const pos = s.length - 1 - k; // bit position in the current exponent
      out.push({ id: `c${call}-b${pos + consumed}`, v: s[k] === '1' ? 1 : 0, slot: pos, role: roles[pos] ?? 'idle' });
    }
  }
  dropped.slice(-3).forEach((v, k, arr) => {
    const age = arr.length - k; // 1 = just dropped
    out.push({ id: `c${call}-b${consumed - age}`, v, slot: -age, role: 'muted' });
  });
  return out;
}

/* ---------- mod_pow ---------- */

export function powTrace(input: PowInput): PowRun {
  const frames: Array<Frame<PowState>> = [];
  const steps: PowStep[] = [];
  const { calls } = input;
  let current = -1;
  const results: Array<bigint | null | undefined> = calls.map(() => undefined);
  const callStrip = (): StripData => ({
    label: 'Calls',
    items: calls.map((c, i): StripItem => {
      const r = results[i];
      return { text: r === undefined || i === current ? formatPow(c) : `${formatPow(c)} = ${r === null ? 'None' : r}`, role: i === current ? 'active' : i < current ? 'muted' : undefined };
    }),
  });

  calls.forEach((call, ci) => {
    current = ci;
    const step: PowStep = { call, result: null, egcd: [], loop: [], calls: [] };
    const m = call.modulus;
    const rows: PowCell[][] = [];
    const columns = ['i', 'bit', 'base = b^(2^i)', 'result'];
    const snap = (line: number | undefined, caption: string, bits: PowBit[], bitsLabel: string, vars: Array<[string, string | number]> = []) => {
      frames.push({
        line,
        caption,
        vars: [['call', formatPow(call)], ...vars],
        state: { call: ci, bits, bitsLabel, table: { columns, rows: rows.map((r) => r.map((c) => ({ ...c }))) }, strips: [callStrip()] },
      });
    };

    let base = call.base;
    let e = call.exponent;
    snap(0, `${formatPow(call)}: ${e < 0n ? 'the exponent is negative, so the code needs the inverse of the base first.' : `the exponent ${e} is ${bin(e)} in binary; the loop reads it from the lowest bit up.`}`, bitCells(ci, absBig(e), 0), `exponent = ${e}`);
    let done = false;
    if (e < 0n) {
      const inv = inverseOf(base, m);
      step.egcd = inv.egcd;
      if (inv.inv === null) {
        snap(2, `mod_inverse(${base}, ${m}): extended_gcd_inline gives gcd ${inv.g}, not 1, so ${base} has no inverse modulo ${m}. inv is None, and mod_pow returns None.`, bitCells(ci, -e, 0), `exponent = ${e}`, [['returns', 'None']]);
        done = true;
      } else {
        snap(
          3,
          `mod_inverse(${base}, ${m}) = ${inv.inv}: extended_gcd_inline gives ${base}*${paren(inv.x)} + ${m}*${paren(inv.y)} = 1, and ${inv.x} % ${m} = ${inv.inv}. So base^(${e}) = ${inv.inv}^${-e}: return mod_pow(${inv.inv}, ${-e}, ${m}).`,
          bitCells(ci, -e, 0),
          `exponent = ${-e}`,
          [['inverse', String(inv.inv)]],
        );
        base = inv.inv;
        e = -e;
      }
    }
    if (!done && m === 1n) {
      snap(4, 'modulus == 1: every integer is 0 modulo 1, so mod_pow returns 0 without looping.', bitCells(ci, e, 0), `exponent = ${e}`, [['returns', 0]]);
      step.result = 0n;
      done = true;
    }
    if (!done) {
      let result = 1n;
      const b0 = base;
      base = pyModBig(base, m);
      rows.push([{ text: '0' }, { text: '' }, { text: String(base), role: 'active' }, { text: '1' }]);
      snap(6, `result = 1 and base = ${b0} % ${m} = ${base}${b0 < 0n ? ' (Python reduces a negative base into 0..modulus-1)' : ''}. Invariant from here on: result * base^exponent is the answer.`, bitCells(ci, e, 0), expLabel(e), [
        ['result', String(result)],
        ['base', String(base)],
        ['exponent', String(e)],
      ]);
      let i = 0;
      const dropped: Array<0 | 1> = [];
      while (e > 0n) {
        step.loop.push([result, base, e]);
        const odd = e % 2n === 1n;
        const before = result;
        const row = rows[i];
        row[1] = { text: odd ? '1' : '0', role: 'compare' };
        row[2] = { text: String(base), role: odd ? 'compare' : undefined };
        if (odd) {
          result = (result * base) % m;
          row[3] = { text: String(result), role: 'active' };
          snap(9, `exponent = ${e} is odd (its lowest bit is 1): multiply base^(2^${i}) into the answer. result = (${before} * ${base}) % ${m} = ${result}.`, bitCells(ci, e, i, { 0: 'active' }, dropped), expLabel(e), [
            ['result', String(result)],
            ['base', String(base)],
            ['exponent', String(e)],
          ]);
        } else {
          row[3] = { text: String(result), role: 'muted' };
          snap(8, `exponent = ${e} is even (its lowest bit is 0): base^(2^${i}) is not part of the answer, so result stays ${result}.`, bitCells(ci, e, i, { 0: 'compare' }, dropped), expLabel(e), [
            ['result', String(result)],
            ['base', String(base)],
            ['exponent', String(e)],
          ]);
        }
        row[1] = { text: odd ? '1' : '0', role: 'done' };
        row[2] = { text: String(base), role: undefined };
        row[3] = { text: String(result), role: odd ? 'done' : undefined };
        dropped.push(odd ? 1 : 0);
        const eNext = e >> 1n;
        const sq = (base * base) % m;
        rows.push([{ text: String(i + 1) }, { text: '' }, { text: String(sq), role: 'active' }, { text: '' }]);
        snap(
          11,
          `exponent >>= 1 drops the bit just used (${e} becomes ${eNext}), and base = (${base} * ${base}) % ${m} = ${sq}: squaring base^(2^${i}) gives base^(2^${i + 1}).${eNext === 0n ? ' The exponent is now 0, so this last square is never used.' : ''}`,
          bitCells(ci, eNext, i + 1, {}, dropped),
          expLabel(eNext),
          [
            ['result', String(result)],
            ['base', String(sq)],
            ['exponent', String(eNext)],
          ],
        );
        rows[i + 1][2] = { text: String(sq), role: eNext === 0n ? 'muted' : undefined };
        e = eNext;
        base = sq;
        i += 1;
      }
      const last = rows.length - 1;
      rows[last][2] = { text: rows[last][2].text, role: 'muted' };
      for (let k = 0; k < last; k++) rows[k][3] = { text: rows[k][3].text, role: k === last - 1 ? 'good' : undefined };
      snap(12, `exponent is 0, so the loop ends after ${i} round${i === 1 ? '' : 's'} (${i} squarings, ${step.loop.filter((s) => s[2] % 2n === 1n).length} multiplications): mod_pow returns ${result}.`, bitCells(ci, 0n, i, {}, dropped), 'exponent = 0', [['returns', String(result)]]);
      step.result = result;
    }
    results[ci] = step.result;
    steps.push(step);
  });
  current = calls.length;
  return { frames, steps };
}

/* ---------- mod_pow_recursive ---------- */

/** The calls mod_pow_recursive makes for exponent e >= 0 (modulus > 1), outermost first. */
function recursionChain(e: bigint): bigint[] {
  const chain = [e];
  while (e > 0n) {
    e = e % 2n === 0n ? e / 2n : e - 1n;
    chain.push(e);
  }
  return chain;
}

export function powRecTrace(input: PowInput): PowRun {
  const frames: Array<Frame<PowState>> = [];
  const steps: PowStep[] = [];
  const { calls } = input;
  let current = -1;
  const results: Array<bigint | null | undefined> = calls.map(() => undefined);
  const FN = 'mod_pow_recursive';
  const callStrip = (): StripData => ({
    label: 'Calls',
    items: calls.map((c, i): StripItem => {
      const r = results[i];
      return { text: r === undefined || i === current ? formatPow(c, FN) : `${formatPow(c, FN)} = ${r === null ? 'None' : r}`, role: i === current ? 'active' : i < current ? 'muted' : undefined };
    }),
  });

  calls.forEach((call, ci) => {
    current = ci;
    const step: PowStep = { call, result: null, egcd: [], loop: [], calls: [] };
    const m = call.modulus;
    const columns = ['call', 'exponent', 'case', 'returns'];
    let rows: PowCell[][] = [];
    const snap = (line: number | undefined, caption: string, e: bigint, roles: Record<number, Role> = {}, vars: Array<[string, string | number]> = []) => {
      frames.push({
        line,
        caption,
        vars: [['call', formatPow(call, FN)], ...vars],
        state: { call: ci, bits: bitCells(ci, e, 0, roles), bitsLabel: expLabel(e), table: { columns, rows: rows.map((r) => r.map((c) => ({ ...c }))) }, strips: [callStrip()] },
      });
    };

    let base = call.base;
    let e = call.exponent;
    snap(0, `${formatPow(call, FN)}: each call either halves an even exponent or peels one factor off an odd one, so the calls nest about two per bit of the exponent.`, absBig(e));
    if (e < 0n) {
      const inv = inverseOf(base, m);
      step.egcd = inv.egcd;
      if (inv.inv === null) {
        step.calls.push([base, e, m, null]);
        snap(2, `mod_inverse(${base}, ${m}): the gcd is ${inv.g}, not 1, so there is no inverse and ${FN} returns None.`, -e, {}, [['returns', 'None']]);
        results[ci] = null;
        steps.push(step);
        return;
      }
      snap(3, `mod_inverse(${base}, ${m}) = ${inv.inv} (from ${base}*${paren(inv.x)} + ${m}*${paren(inv.y)} = 1), so the call returns ${FN}(${inv.inv}, ${-e}, ${m}).`, -e, {}, [['inverse', String(inv.inv)]]);
      step.calls.push([base, e, m, null]); // filled in below with the inner result
      base = inv.inv;
      e = -e;
    }
    const outer = step.calls.length ? step.calls[0] : null;
    if (m === 1n) {
      step.calls.push([base, e, m, 0n]);
      rows = [[{ text: `f(${e})`, role: 'good' }, { text: String(e) }, { text: 'modulus == 1' }, { text: '0', role: 'good' }]];
      snap(4, 'modulus == 1: every integer is 0 modulo 1, so the call returns 0 before looking at the exponent.', e, {}, [['returns', 0]]);
      if (outer) outer[3] = 0n;
      step.result = 0n;
      results[ci] = 0n;
      steps.push(step);
      return;
    }

    const chain = recursionChain(e);
    const depth = chain.length;
    const caseOf = (x: bigint) => (x === 0n ? 'exponent == 0' : x % 2n === 0n ? `even: f(${x / 2n})^2` : `odd: b * f(${x - 1n})`);
    // Descent: one frame per call.
    const firstCall = step.calls.length;
    chain.forEach((x, k) => {
      step.calls.push([base, x, m, null]);
      rows.push([{ text: `f(${x})` }, { text: String(x) }, { text: caseOf(x) }, { text: '' }]);
      rows.forEach((r, j) => {
        r[0] = { text: r[0].text, role: j === k ? 'active' : undefined };
      });
      if (x === 0n) {
        rows[k][3] = { text: '1', role: 'good' };
        snap(5, `f(0): exponent == 0, so it returns 1 (b^0 = 1) without another call. The stack is ${depth} calls deep, and the answers now flow back up.`, x, {}, [['returns', 1]]);
      } else if (x % 2n === 0n) {
        snap(7, `f(${x}): the exponent is even (lowest bit 0), so b^${x} = (b^${x / 2n})^2: call f(${x / 2n}) and square what it returns. Halving shifts the bits right.`, x, { 0: 'compare' }, [['depth', k + 1]]);
      } else {
        snap(10, `f(${x}): the exponent is odd (lowest bit 1), so b^${x} = b * b^${x - 1n}: call f(${x - 1n}) and multiply by base. Subtracting 1 clears the lowest bit.`, x, { 0: 'active' }, [['depth', k + 1]]);
      }
    });
    // Unwinding: the returns, innermost first.
    let value = 1n;
    step.calls[firstCall + depth - 1][3] = 1n;
    for (let k = depth - 2; k >= 0; k--) {
      const x = chain[k];
      const below = value;
      rows.forEach((r, j) => {
        r[0] = { text: r[0].text, role: j === k ? 'active' : j > k ? 'done' : undefined };
      });
      if (x % 2n === 0n) {
        value = (below * below) % m;
        rows[k][3] = { text: String(value), role: 'active' };
        rows[k + 1][3] = { text: rows[k + 1][3].text, role: 'compare' };
        snap(8, `f(${x}) gets temp = f(${x / 2n}) = ${below} and returns (temp * temp) % ${m} = (${below} * ${below}) % ${m} = ${value}.`, x, { 0: 'compare' }, [['returns', String(value)]]);
      } else {
        value = pyModBig(base * below, m);
        rows[k][3] = { text: String(value), role: 'active' };
        rows[k + 1][3] = { text: rows[k + 1][3].text, role: 'compare' };
        snap(10, `f(${x}) gets f(${x - 1n}) = ${below} and returns (base * ${below}) % ${m} = (${base} * ${below}) % ${m} = ${value}${base < 0n || base >= m ? ' (base is used as given; the % brings the product back into 0..modulus-1)' : ''}.`, x, { 0: 'active' }, [['returns', String(value)]]);
      }
      rows[k + 1][3] = { text: rows[k + 1][3].text, role: 'done' };
      rows[k][3] = { text: rows[k][3].text, role: 'done' };
      step.calls[firstCall + k][3] = value;
    }
    if (outer) outer[3] = value;
    rows.forEach((r) => {
      r[0] = { text: r[0].text, role: 'done' };
    });
    rows[0][3] = { text: rows[0][3].text, role: 'good' };
    snap(depth > 1 ? (chain[0] % 2n === 0n ? 8 : 10) : 5, `The outermost call returns ${value}: ${formatPow(call, FN)} = ${value}, the same answer as the loop, built from the highest bit down.`, chain[0], {}, [['returns', String(value)]]);
    step.result = value;
    results[ci] = value;
    steps.push(step);
  });
  current = calls.length;
  return { frames, steps };
}
