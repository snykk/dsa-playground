/**
 * Modular arithmetic tracer, drawn with ResidueClock: the m residues on a clock face, each
 * operand a token that walks around it, a product as a walk that wraps several times, the
 * inverse found by the extended Euclid in a small table beside the clock.
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Number_Theory/Modular_Arithmetic/Python/modular_arithmetic.py:
 *   mod_add(a, b, m)       ((a % m) + (b % m)) % m
 *   mod_subtract(a, b, m)  result = ((a % m) - (b % m)) % m; return (result + m) % m
 *   mod_multiply(a, b, m)  ((a % m) * (b % m)) % m
 *   mod_divide(a, b, m)    inv = mod_inverse(b, m); None if inv is None, else mod_multiply(a, inv, m)
 *   mod_inverse(a, m)      gcd_val, x, _ = extended_gcd(a, m); None if gcd_val != 1, else x % m
 *   mod_power(b, e, m)     e < 0: mod_power(mod_inverse(b, m), -e, m) (None without an inverse);
 *                          0 when m == 1; else the square-and-multiply loop on base = b % m
 * Python's % takes the sign of the modulus, so every residue lands in 0..m-1, also for a
 * negative operand. Golden fixtures (__fixtures__/numberTheory.json, section "modArith") pin
 * every result, every _extended_gcd_nonneg call and the loop state of mod_power.
 *
 * Input: "m 11; add 7 5, sub 3 5, mul 7 5, inv 3, div 7 5, pow 2 5"   (m defaults to 11)
 * The modulus goes from 1 to 60 (every residue on the clock), operands and exponents from
 * -9999 to 9999, so every product stays below 2^53.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { callOf, egcdLevels, pyMod, segments, type StripSlot } from './numberTheoryCommon';

export type ModOpKind = 'add' | 'sub' | 'mul' | 'div' | 'inv' | 'pow';

export interface ModOp {
  kind: ModOpKind;
  a: number;
  b?: number;
}

export interface ModInput {
  m: number;
  ops: ModOp[];
}

export const MOD_LIMITS = { maxModulus: 60, maxValue: 9999, maxOps: 10 };

const OP_NAMES: Record<string, ModOpKind> = {
  add: 'add',
  mod_add: 'add',
  plus: 'add',
  sub: 'sub',
  subtract: 'sub',
  mod_subtract: 'sub',
  minus: 'sub',
  mul: 'mul',
  multiply: 'mul',
  mod_multiply: 'mul',
  times: 'mul',
  div: 'div',
  divide: 'div',
  mod_divide: 'div',
  inv: 'inv',
  inverse: 'inv',
  mod_inverse: 'inv',
  pow: 'pow',
  power: 'pow',
  mod_power: 'pow',
};

const FUNC: Record<ModOpKind, string> = {
  add: 'mod_add',
  sub: 'mod_subtract',
  mul: 'mod_multiply',
  div: 'mod_divide',
  inv: 'mod_inverse',
  pow: 'mod_power',
};

export function parseModular(text: string): ModInput {
  let m: number | undefined;
  const ops: ModOp[] = [];
  const value = (t: string, what = 'Operands') => {
    if (!/^[+-]?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number.`);
    const v = Number(t) || 0;
    if (Math.abs(v) > MOD_LIMITS.maxValue) throw new InputError(`${what} go from -${MOD_LIMITS.maxValue} to ${MOD_LIMITS.maxValue} (got ${t}), so every product stays exact.`);
    return v;
  };
  for (const segment of segments(text)) {
    const mm = segment.match(/^(?:m|mod|modulus)\s*[:=]?\s*([+-]?\d+)$/i);
    if (mm) {
      if (m !== undefined) throw new InputError('Give the modulus ("m 11") only once.');
      const v = Number(mm[1]);
      if (v <= 0) {
        throw new InputError(
          `The modulus must be positive, as the docstrings say (got ${mm[1]}). With m = 0 every function raises ZeroDivisionError at a % m, and a negative m gives residues in m+1..0 instead of a clock 0..m-1.`,
        );
      }
      if (v > MOD_LIMITS.maxModulus) throw new InputError(`The clock has room for a modulus up to ${MOD_LIMITS.maxModulus} (got ${mm[1]}).`);
      m = v;
      continue;
    }
    const call = callOf(segment);
    const kind = call ? OP_NAMES[call.name] : undefined;
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write "m 11" and operations like "add 7 5", "sub 3 5", "mul 7 5", "div 7 5", "inv 3" or "pow 2 5".`);
    const want = kind === 'inv' ? 1 : 2;
    if (call.args.length !== want) throw new InputError(kind === 'inv' ? `"${segment}": inv takes one number, as in "inv 3".` : `"${segment}": ${kind} takes two numbers, as in "${kind} 7 5".`);
    ops.push(kind === 'inv' ? { kind, a: value(call.args[0]) } : { kind, a: value(call.args[0]), b: value(call.args[1], kind === 'pow' ? 'Exponents' : 'Operands') });
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, for example "m 11; add 7 5".');
  if (ops.length > MOD_LIMITS.maxOps) throw new InputError(`At most ${MOD_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  return { m: m ?? 11, ops };
}

export function formatModOp(op: ModOp, m: number): string {
  return op.kind === 'inv' ? `mod_inverse(${op.a}, ${m})` : `${FUNC[op.kind]}(${op.a}, ${op.b}, ${m})`;
}

/* ---------- pseudocode ---------- */

export const MOD_CODE = [
  'mod_add(a, b, m): return ((a % m) + (b % m)) % m',
  'mod_subtract(a, b, m): result = ((a % m) - (b % m)) % m',
  '  return (result + m) % m',
  'mod_multiply(a, b, m): return ((a % m) * (b % m)) % m',
  'mod_divide(a, b, m): inv = mod_inverse(b, m)',
  '  if inv is None: return None',
  '  return mod_multiply(a, inv, m)',
  'mod_inverse(a, m): gcd_val, x, _ = extended_gcd(a, m)',
  '  if gcd_val != 1: return None',
  '  return x % m',
  'extended_gcd(a, b): (g, x, y) = _extended_gcd_nonneg(abs(a), abs(b))',
  '  return (g, -x if a < 0 else x, -y if b < 0 else y)',
  'mod_power(base, exponent, m):',
  '  if exponent < 0: inv = mod_inverse(base, m)',
  '    if inv is None: return None',
  '    return mod_power(inv, -exponent, m)',
  '  if m == 1: return 0',
  '  result = 1; base = base % m',
  '  while exponent > 0:',
  '    if exponent % 2 == 1: result = (result * base) % m',
  '    exponent = exponent >> 1; base = (base * base) % m',
  '  return result',
];

const L = {
  add: 0,
  sub: 1,
  subFix: 2,
  mul: 3,
  div: 4,
  divNone: 5,
  divMul: 6,
  inv: 7,
  invNone: 8,
  invRet: 9,
  egcd: 10,
  egcdSigns: 11,
  pow: 12,
  powNeg: 13,
  powNegNone: 14,
  powNegCall: 15,
  powM1: 16,
  powInit: 17,
  powLoop: 18,
  powOdd: 19,
  powShift: 20,
  powRet: 21,
};

/* ---------- state ---------- */

/** A named marker on the clock. `pos` is unwrapped (pos % m is the residue), so a walk that wraps glides the right way round. */
export interface ClockToken {
  id: string;
  label: string;
  pos: number;
  role: Role;
  /** 0 = on the ring; 1, 2 = inner lanes, so tokens never cover each other. */
  lane: number;
}

/** A walk of `len` steps from residue `from` (negative = counterclockwise), drawn on a token's lane. */
export interface ClockArc {
  from: number;
  len: number;
  lane: number;
  role: Role;
}

export interface ClockTableCell {
  text: string;
  role?: Role;
}

export interface ClockState {
  m: number;
  /** Which operation: tokens of another operation never glide into these. */
  op: number;
  tokens: ClockToken[];
  arcs: ClockArc[];
  /** Residues to highlight on the face (the multiples of a gcd, the target 1). */
  ticks: Record<number, Role>;
  /** The arithmetic of this step, shown beside the clock. */
  work: string[];
  /** The extended Euclid behind an inverse: its calls, then the coefficients. */
  table?: { title: string; columns: string[]; rows: ClockTableCell[][] };
  strips: StripData[];
  /** Every strip of the run at its widest (stripSlots in a stabilize step), so the strips keep their room. */
  stripSlots?: StripSlot[];
  /** Same for every frame of a run (stabilizeClock): the most table rows, 0 without a table. */
  tableRows?: number;
}

/* ---------- tracer ---------- */

export interface ModStep {
  op: ModOp;
  result: number | null;
  /** Every _extended_gcd_nonneg call behind an inverse: [a, b, g, x, y]. */
  egcd: Array<[number, number, number, number, number]>;
  /** mod_power: [result, base, exponent] at the top of every loop iteration. */
  loop: Array<[number, number, number]>;
}

export interface ModRun {
  frames: Array<Frame<ClockState>>;
  steps: ModStep[];
}

/** An unwrapped position for a walk of `u` steps from 0 that lands on u % m: at most three full turns are drawn. */
export function walkPos(u: number, m: number): number {
  const r = pyMod(u, m);
  if (u >= 0) return r + Math.min(3, Math.floor(u / m)) * m;
  const extra = Math.floor((-u - (m - r)) / m);
  return r - m - Math.min(3, Math.max(0, extra)) * m;
}

const turnsText = (u: number, m: number) => {
  const t = Math.floor(Math.abs(u) / m);
  return t === 0 ? '' : t === 1 ? 'one full turn' : `${t} full turns`;
};

export function modTrace(input: ModInput): ModRun {
  const { m, ops } = input;
  const frames: Array<Frame<ClockState>> = [];
  const steps: ModStep[] = [];
  let current = -1;
  const results: Array<number | null | undefined> = ops.map(() => undefined);

  const opStrip = (): StripData => ({
    label: 'Operations',
    items: ops.map((op, i): StripItem => {
      const r = results[i];
      return { text: r === undefined || i === current ? formatModOp(op, m) : `${formatModOp(op, m)} = ${r === null ? 'None' : r}`, role: i === current ? 'active' : i < current ? 'muted' : undefined };
    }),
  });

  interface Snap {
    tokens?: ClockToken[];
    arcs?: ClockArc[];
    ticks?: Record<number, Role>;
    work?: string[];
    table?: ClockState['table'];
    vars?: Array<[string, string | number]>;
  }
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    frames.push({
      line,
      caption,
      vars: [['m', m], ...(current >= 0 && current < ops.length ? [['call', formatModOp(ops[current], m)] as [string, string]] : []), ...(o.vars ?? [])],
      state: { m, op: current, tokens: o.tokens ?? [], arcs: o.arcs ?? [], ticks: o.ticks ?? {}, work: o.work ?? [], table: o.table, strips: [opStrip()] },
    });
  };

  const tok = (id: string, label: string, pos: number, role: Role, lane: number): ClockToken => ({ id: `${current}-${id}`, label, pos, role, lane });

  /** Reduce v into 0..m-1 as a walk of v steps from 0; the token glides from 0 in the previous frame. */
  const reduceText = (name: string, v: number): string => {
    const r = pyMod(v, m);
    if (v >= 0 && v < m) return `${name} % m = ${v} % ${m} = ${r}: already a residue, so it stays.`;
    if (v >= 0) return `${name} % m = ${v} % ${m} = ${r}: walking ${v} steps from 0 makes ${turnsText(v, m)} and lands on ${r}.`;
    return `${name} % m = ${v} % ${m} = ${r}: a negative number walks backwards, ${-v} steps counterclockwise from 0${Math.floor(-v / m) ? `, ${turnsText(v, m)},` : ''} and lands on ${r} (Python's % is never negative for m > 0).`;
  };

  /** The extended Euclid table of mod_inverse(a, m), with the coefficients filled when `filled`. */
  const egcdTable = (a: number, filled: boolean, activeRow?: number): ClockState['table'] => {
    const levels = egcdLevels(BigInt(Math.abs(a)), BigInt(m));
    return {
      title: `_extended_gcd_nonneg(${Math.abs(a)}, ${m})`,
      columns: ['a', 'b', 'a//b', 'x', 'y'],
      rows: levels.map((lv, k) => {
        const role: Role | undefined = k === activeRow ? 'active' : filled ? 'done' : undefined;
        return [
          { text: String(lv.a), role },
          { text: String(lv.b), role },
          { text: lv.q === null ? '' : String(lv.q), role },
          { text: filled ? String(lv.x) : '', role },
          { text: filled ? String(lv.y) : '', role },
        ];
      }),
    };
  };

  /** mod_inverse(a, m) as frames; returns the inverse or null, and the _extended_gcd_nonneg calls. */
  const inverse = (a: number, keep: ClockToken[], label: string): { inv: number | null; egcd: ModStep['egcd'] } => {
    const levels = egcdLevels(BigInt(Math.abs(a)), BigInt(m));
    const egcd = levels.map((lv): [number, number, number, number, number] => [Number(lv.a), Number(lv.b), Number(lv.g), Number(lv.x), Number(lv.y)]);
    const g = Number(levels[0].g);
    const x0 = Number(levels[0].x);
    const x = a < 0 ? 0 - x0 : x0;
    const y0 = Number(levels[0].y);
    const chain = levels.map((lv) => String(lv.a)).join(', ');
    snap(L.inv, `mod_inverse(${a}, ${m}) asks extended_gcd(${a}, ${m}) for x with ${a}*x + ${m}*y = gcd. It runs Euclid on |${a}| = ${Math.abs(a)} and ${m}: the remainders go ${chain}, 0, so the gcd is ${g}.`, {
      tokens: keep,
      table: egcdTable(a, false, levels.length - 1),
      work: [`gcd(${Math.abs(a)}, ${m}) = ${g}`],
      vars: [['gcd', g]],
    });
    snap(
      a < 0 ? L.egcdSigns : L.egcd,
      `Back-substitution fills x and y from the bottom row up (x = y1, y = x1 - (a // b) * y1), so ${Math.abs(a)}*${x0 < 0 ? `(${x0})` : x0} + ${m}*${y0 < 0 ? `(${y0})` : y0} = ${g}.` +
        (a < 0 ? ` a = ${a} is negative, so extended_gcd flips x to ${x}: ${a}*${x < 0 ? `(${x})` : x} + ${m}*${y0 < 0 ? `(${y0})` : y0} = ${g}.` : ''),
      { tokens: keep, table: egcdTable(a, true), work: [`${a}*x + ${m}*y = ${g}`, `x = ${x}`], vars: [['gcd', g], ['x', x]] },
    );
    if (g !== 1) {
      const ticks: Record<number, Role> = {};
      for (let t = 0; t < m; t += g) ticks[t] = 'compare';
      if (m > 1) ticks[1] = 'bad';
      snap(
        L.invNone,
        `gcd_val = ${g} is not 1, so mod_inverse returns None. Every multiple of ${a} is a multiple of ${g}, and so is every residue it can reach (the marked ticks ${Array.from({ length: Math.min(6, m / g) }, (_, k) => k * g).join(', ')}${m / g > 6 ? ', ...' : ''}). 1 is not among them, so no ${label} * x can be 1 (mod ${m}).`,
        { tokens: keep, table: egcdTable(a, true), ticks, work: [`gcd = ${g} != 1`, 'no inverse: None'], vars: [['returns', 'None']] },
      );
      return { inv: null, egcd };
    }
    const inv = pyMod(x, m);
    const check = pyMod(a * inv, m);
    snap(
      L.invRet,
      `gcd_val = 1, so x % m = ${x} % ${m} = ${inv} is the inverse${x !== inv ? ` (${x} walks to ${inv})` : ''}. Check: ${a} * ${inv} = ${a * inv}, and ${a * inv} % ${m} = ${check}.`,
      {
        tokens: [...keep, tok('x', 'x', walkPos(x, m), 'good', 2)],
        arcs: x !== inv ? [{ from: 0, len: x, lane: 2, role: 'active' }] : [],
        table: egcdTable(a, true),
        ticks: m > 1 ? { 1: 'good' } : {},
        work: [`x % ${m} = ${inv}`, `${label} * ${inv} = ${check} (mod ${m})`],
        vars: [['inverse', inv]],
      },
    );
    return { inv, egcd };
  };

  /** ((x % m) * (y % m)) % m: the reductions, then the product as a walk of x*y steps from 0. */
  const multiply = (x: number, y: number, line: number, intro: string, names: [string, string]): number => {
    const rx = pyMod(x, m);
    const ry = pyMod(y, m);
    snap(line, `${intro}Reduce both factors first.`, { tokens: [tok('a', names[0], 0, 'compare', 0), tok('b', names[1], 0, 'compare', 1)], work: [`${x} * ${y} (mod ${m})`] });
    snap(line, reduceText(names[0], x), { tokens: [tok('a', names[0], walkPos(x, m), 'compare', 0), tok('b', names[1], 0, 'compare', 1)], arcs: [{ from: 0, len: x, lane: 0, role: 'compare' }], work: [`${names[0]} % ${m} = ${rx}`] });
    snap(line, reduceText(names[1], y), {
      tokens: [tok('a', names[0], walkPos(x, m), 'compare', 0), tok('b', names[1], walkPos(y, m), 'compare', 1), tok('r', 'r', 0, 'active', 2)],
      arcs: [{ from: 0, len: y, lane: 1, role: 'compare' }],
      work: [`${names[0]} % ${m} = ${rx}`, `${names[1]} % ${m} = ${ry}`],
    });
    const prod = rx * ry;
    const res = pyMod(prod, m);
    snap(
      line,
      `(${rx} * ${ry}) % ${m}: the product ${prod} is ${ry} hops of ${rx} from 0${prod >= m ? `, ${turnsText(prod, m)} round the clock` : ''}, landing on ${prod} % ${m} = ${res}.`,
      {
        tokens: [tok('a', names[0], walkPos(x, m), 'compare', 0), tok('b', names[1], walkPos(y, m), 'compare', 1), tok('r', 'r', walkPos(prod, m), 'good', 2)],
        arcs: [{ from: 0, len: prod, lane: 2, role: 'active' }],
        work: [`${rx} * ${ry} = ${prod}`, `${prod} % ${m} = ${res}`],
        vars: [['returns', res]],
      },
    );
    return res;
  };

  snap(undefined, `The clock has ${m} residue${m === 1 ? '' : 's'}, 0 to ${m - 1}. Every result is reduced into this range, so numbers wrap around after ${m - 1}, like hours on a clock.`);

  ops.forEach((op, i) => {
    current = i;
    const name = formatModOp(op, m);
    const step: ModStep = { op, result: null, egcd: [], loop: [] };
    if (op.kind === 'add' || op.kind === 'sub') {
      const b = op.b!;
      const ra = pyMod(op.a, m);
      const rb = pyMod(b, m);
      const line = op.kind === 'add' ? L.add : L.sub;
      snap(line, `${name}: reduce both operands into 0..${m - 1} first, then walk.`, { tokens: [tok('a', 'a', 0, 'compare', 0), tok('b', 'b', 0, 'compare', 1)], work: [`${op.a} ${op.kind === 'add' ? '+' : '-'} ${b} (mod ${m})`] });
      snap(line, reduceText('a', op.a), { tokens: [tok('a', 'a', walkPos(op.a, m), 'compare', 0), tok('b', 'b', 0, 'compare', 1)], arcs: [{ from: 0, len: op.a, lane: 0, role: 'compare' }], work: [`a % ${m} = ${ra}`] });
      snap(line, reduceText('b', b), {
        tokens: [tok('a', 'a', walkPos(op.a, m), 'compare', 0), tok('b', 'b', walkPos(b, m), 'compare', 1), tok('r', 'r', ra, 'active', 2)],
        arcs: [{ from: 0, len: b, lane: 1, role: 'compare' }],
        work: [`a % ${m} = ${ra}`, `b % ${m} = ${rb}`],
      });
      const raw = op.kind === 'add' ? ra + rb : ra - rb;
      const res = pyMod(raw, m);
      const walk = op.kind === 'add' ? rb : -rb;
      const wraps = op.kind === 'add' ? raw >= m : raw < 0;
      snap(
        line,
        op.kind === 'add'
          ? `(${ra} + ${rb}) % ${m}: start at ${ra} and walk ${rb} steps forward. ${wraps ? `${ra} + ${rb} = ${raw} passes ${m - 1}, so it wraps through 0: ${raw} % ${m} = ${res}.` : `${raw} is below ${m}, so there is no wrap: ${res}.`}`
          : `(${ra} - ${rb}) % ${m}: start at ${ra} and walk ${rb} steps backward. ${wraps ? `${ra} - ${rb} = ${raw} is negative, so it wraps backwards through 0: ${raw} % ${m} = ${res}.` : `${raw} is not negative, so there is no wrap: ${res}.`}`,
        {
          tokens: [tok('a', 'a', walkPos(op.a, m), 'compare', 0), tok('b', 'b', walkPos(b, m), 'compare', 1), tok('r', 'r', ra + walk, op.kind === 'add' ? 'good' : 'active', 2)],
          arcs: [{ from: ra, len: walk, lane: 2, role: 'active' }],
          work: [`${ra} ${op.kind === 'add' ? '+' : '-'} ${rb} = ${raw}`, `${raw} % ${m} = ${res}`],
          vars: op.kind === 'add' ? [['returns', res]] : [['result', res]],
        },
      );
      if (op.kind === 'sub') {
        snap(
          L.subFix,
          `return (result + m) % m = (${res} + ${m}) % ${m} = ${res}. In Python result is already in 0..${m - 1}, so this extra step changes nothing; it guards languages whose % can be negative.`,
          {
            tokens: [tok('a', 'a', walkPos(op.a, m), 'compare', 0), tok('b', 'b', walkPos(b, m), 'compare', 1), tok('r', 'r', ra + walk, 'good', 2)],
            work: [`(${res} + ${m}) % ${m} = ${res}`],
            vars: [['returns', res]],
          },
        );
      }
      step.result = res;
    } else if (op.kind === 'mul') {
      step.result = multiply(op.a, op.b!, L.mul, `${name}: `, ['a', 'b']);
    } else if (op.kind === 'inv') {
      const { inv, egcd } = inverse(op.a, [tok('a', 'a', pyMod(op.a, m), 'compare', 0)], `${op.a}`);
      step.result = inv;
      step.egcd = egcd;
    } else if (op.kind === 'div') {
      const b = op.b!;
      snap(L.div, `${name}: dividing by ${b} means multiplying by its inverse, so mod_divide first calls mod_inverse(${b}, ${m}).`, { tokens: [tok('b', 'b', pyMod(b, m), 'compare', 1)], work: [`${op.a} / ${b} (mod ${m})`] });
      const { inv, egcd } = inverse(b, [tok('b', 'b', pyMod(b, m), 'compare', 1)], `${b}`);
      step.egcd = egcd;
      if (inv === null) {
        snap(L.divNone, `inv is None: ${b} has no inverse modulo ${m}, so mod_divide returns None. There is no unique q with q * ${b} = ${op.a} (mod ${m}) to divide out.`, {
          tokens: [tok('b', 'b', pyMod(b, m), 'bad', 1)],
          work: ['no inverse', 'returns None'],
          vars: [['returns', 'None']],
        });
        step.result = null;
      } else {
        step.result = multiply(op.a, inv, L.divMul, `mod_multiply(${op.a}, ${inv}, ${m}): ${op.a} / ${b} is ${op.a} times the inverse ${inv}. `, ['a', 'inv']);
      }
    } else {
      // mod_power
      let base = op.a;
      let e = op.b!;
      snap(L.pow, `${name}: square and multiply. ${e < 0 ? 'The exponent is negative, so the code first needs the inverse of the base.' : `The loop reads the exponent ${e} bit by bit.`}`, {
        tokens: [tok('a', 'base', pyMod(base, m), 'compare', 0)],
        work: [`${base}^${e} (mod ${m})`],
      });
      let ok = true;
      if (e < 0) {
        const { inv, egcd } = inverse(base, [tok('a', 'base', pyMod(base, m), 'compare', 0)], `${base}`);
        step.egcd = egcd;
        if (inv === null) {
          snap(L.powNegNone, `inv is None: ${base} has no inverse modulo ${m}, so base^${e} does not exist and mod_power returns None.`, {
            tokens: [tok('a', 'base', pyMod(base, m), 'bad', 0)],
            work: ['no inverse', 'returns None'],
            vars: [['returns', 'None']],
          });
          step.result = null;
          ok = false;
        } else {
          snap(L.powNegCall, `base^(${e}) = (base^-1)^${-e}: return mod_power(${inv}, ${-e}, ${m}), a recursive call with a positive exponent.`, {
            tokens: [tok('a2', 'base', inv, 'compare', 0)],
            work: [`${inv}^${-e} (mod ${m})`],
          });
          base = inv;
          e = -e;
        }
      }
      if (ok && m === 1) {
        snap(L.powM1, 'm == 1: every integer is 0 modulo 1, so mod_power returns 0 at once.', { tokens: [tok('r', 'result', 0, 'good', 2)], work: ['m == 1', 'returns 0'], vars: [['returns', 0]] });
        step.result = 0;
        ok = false;
      }
      if (ok) {
        let result = 1;
        const b0 = base;
        base = pyMod(base, m);
        const bid = op.a !== b0 ? 'a2' : 'a';
        snap(L.powInit, `result = 1 and base = ${b0} % ${m} = ${base}. Invariant: result * base^exponent stays equal to the answer.`, {
          tokens: [tok(bid, 'base', walkPos(b0, m), 'compare', 0), tok('r', 'result', 1, 'active', 2)],
          work: [`result = 1, base = ${base}`, `exponent = ${e}`],
          vars: [['result', 1], ['base', base], ['exponent', e]],
        });
        while (e > 0) {
          step.loop.push([result, base, e]);
          const bits = e.toString(2);
          const odd = e % 2 === 1;
          const before = result;
          if (odd) result = pyMod(result * base, m);
          snap(
            odd ? L.powOdd : L.powLoop,
            odd
              ? `exponent = ${e} (binary ${bits}) is odd: multiply this power in. result = (${before} * ${base}) % ${m} = ${result}.`
              : `exponent = ${e} (binary ${bits}) is even: this power is skipped, result stays ${result}.`,
            {
              tokens: [tok(bid, 'base', base, 'compare', 0), tok('r', 'result', result, 'active', 2)],
              work: [`exponent = ${bits} (${e})`, odd ? `result = ${before} * ${base} = ${result}` : `result = ${result}`],
              vars: [['result', result], ['base', base], ['exponent', e]],
            },
          );
          const sq = pyMod(base * base, m);
          snap(L.powShift, `exponent >>= 1 drops the bit just used (${e} becomes ${e >> 1}), and base = (${base} * ${base}) % ${m} = ${sq} is the next power, base^2.`, {
            tokens: [tok(bid, 'base', sq, 'active', 0), tok('r', 'result', result, 'compare', 2)],
            work: [`exponent = ${e >> 1 ? (e >> 1).toString(2) : '0'} (${e >> 1})`, `base = ${base}^2 = ${sq}`],
            vars: [['result', result], ['base', sq], ['exponent', e >> 1]],
          });
          e >>= 1;
          base = sq;
        }
        snap(L.powRet, `exponent is 0, so the loop ends: mod_power returns ${result}.`, {
          tokens: [tok(bid, 'base', base, 'compare', 0), tok('r', 'result', result, 'good', 2)],
          work: [`returns ${result}`],
          vars: [['returns', result]],
        });
        step.result = result;
      }
    }
    results[i] = step.result;
    steps.push(step);
  });

  current = ops.length;
  snap(undefined, `Done: ${ops.length} operation${ops.length === 1 ? '' : 's'} modulo ${m}. Every answer is a residue in 0..${m - 1}, or None where an inverse was needed and did not exist.`);
  return { frames, steps };
}
