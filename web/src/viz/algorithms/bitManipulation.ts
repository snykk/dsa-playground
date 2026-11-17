/**
 * Bit manipulation tracers, drawn with BitRows: each operation's operands as rows of bits, the
 * mask lining up under the value (its 1 gliding into place for 1 << i), and the result row;
 * shifts glide the bits, Kernighan's loop drops one set bit per round, and subset_generation
 * counts through the masks.
 *
 * Mirrors Problem_Patterns/Bit_Manipulation/Python/bit_manipulation.py: is_power_of_two,
 * count_set_bits (a negative n is masked to 64 bits first), get_bit, set_bit, clear_bit,
 * toggle_bit, lowest_set_bit, highest_set_bit, count_differing_bits, swap_without_temp,
 * is_even, next_power_of_two and subset_generation. Values are BigInt, so &, |, ^, ~, << and >>
 * behave like Python's unbounded ints (two's complement with infinitely many sign bits; >>
 * floors). Golden fixtures (__fixtures__/patternsMore.json, section "bits") pin every result,
 * every Kernighan round and every shift.
 *
 * Input: "count 13, get 13 2, set 8 1, clear 15 2, toggle 13 1, lowest 12, highest 13"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { BitCellView, BitRowView, BitRowsState } from '../renderers/BitRows';
import type { StripItem } from '../ui/molecules/Strip';

export type BitOpName = 'power' | 'count' | 'get' | 'set' | 'clear' | 'toggle' | 'lowest' | 'highest' | 'diff' | 'swap' | 'even' | 'next';

export interface BitOp {
  name: BitOpName;
  args: bigint[];
}

export const BIT_FUNCS: Record<BitOpName, string> = {
  power: 'is_power_of_two',
  count: 'count_set_bits',
  get: 'get_bit',
  set: 'set_bit',
  clear: 'clear_bit',
  toggle: 'toggle_bit',
  lowest: 'lowest_set_bit',
  highest: 'highest_set_bit',
  diff: 'count_differing_bits',
  swap: 'swap_without_temp',
  even: 'is_even',
  next: 'next_power_of_two',
};

const ALIASES: Record<string, BitOpName> = {
  ...Object.fromEntries(Object.entries(BIT_FUNCS).map(([k, v]) => [v, k as BitOpName])),
  ...Object.fromEntries(Object.keys(BIT_FUNCS).map((k) => [k, k as BitOpName])),
  pow2: 'power',
  popcount: 'count',
  flip: 'toggle',
  lsb: 'lowest',
  msb: 'highest',
  hamming: 'diff',
  xor_swap: 'swap',
};

const ARITY: Record<BitOpName, number> = { power: 1, count: 1, get: 2, set: 2, clear: 2, toggle: 2, lowest: 1, highest: 1, diff: 2, swap: 2, even: 1, next: 1 };
const HAS_POSITION = new Set<BitOpName>(['get', 'set', 'clear', 'toggle']);

/**
 * Values and positions are capped so every value an operation builds fits the 16-bit window
 * (values in [-2^16, 2^16) are drawn exactly, with their sign bits continuing to the left).
 * Only a negative count_set_bits / count_differing_bits needs 64 bits: the code masks it.
 */
export const BIT_LIMITS = { minValue: -999, maxValue: 9999, maxPosition: 15, maxOps: 12, window: 16, maxSubsetN: 5 };

export function formatBitOp(op: BitOp): string {
  return `${BIT_FUNCS[op.name]}(${op.args.join(', ')})`;
}

function scriptSegments(text: string): string[] {
  return text
    .split(/[;\n]|,(?![^(]*\))/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function parseBitOps(text: string): BitOp[] {
  const ops: BitOp[] = [];
  for (const segment of scriptSegments(text)) {
    const m = segment.match(/^([A-Za-z_0-9]+)\s*(?:\(([^()]*)\)|\s+(.*))?$/);
    const name = m ? ALIASES[m[1].toLowerCase()] : undefined;
    if (!m || !name) {
      throw new InputError(`Cannot read "${segment}". Write operations like "count 13", "get 13 2", "set 8 1", "lowest 12" or "swap 3 7", separated by commas.`);
    }
    const rest = (m[2] ?? m[3] ?? '').trim();
    const tokens = rest ? rest.split(/[\s,]+/).filter(Boolean) : [];
    if (tokens.length !== ARITY[name]) {
      const how = HAS_POSITION.has(name) ? `a value and a bit position, as in "${name} 13 2"` : ARITY[name] === 2 ? `two values, as in "${name} 3 7"` : `one value, as in "${name} 13"`;
      throw new InputError(`"${segment}": ${BIT_FUNCS[name]} takes ${how}.`);
    }
    const args = tokens.map((t, k) => {
      if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number.`);
      const v = Number(t) || 0;
      if (HAS_POSITION.has(name) && k === 1) {
        if (v < 0) throw new InputError(`"${segment}": a negative bit position makes Python raise ValueError (negative shift count), so positions go from 0 to ${BIT_LIMITS.maxPosition}.`);
        if (v > BIT_LIMITS.maxPosition) throw new InputError(`Bit positions go from 0 to ${BIT_LIMITS.maxPosition} here, so every row fits the 16-bit window (got ${t}).`);
      } else if (v < BIT_LIMITS.minValue || v > BIT_LIMITS.maxValue) {
        throw new InputError(`Values go from ${BIT_LIMITS.minValue} to ${BIT_LIMITS.maxValue} here, so every row fits a 16-bit window (got ${t}).`);
      }
      return BigInt(v);
    });
    ops.push({ name, args });
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, for example "count 13".');
  if (ops.length > BIT_LIMITS.maxOps) throw new InputError(`At most ${BIT_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  return ops;
}

/* ---------- the Python functions, in BigInt ---------- */

const MASK64 = (1n << 64n) - 1n;

export type BitResult = bigint | boolean | [bigint, bigint];

export interface BitStepRecord {
  op: BitOp;
  result: BitResult;
  /** n before every `n &= (n - 1)` of count_set_bits (also inside count_differing_bits). */
  kernighan?: bigint[];
  /** n before every `n >>= 1` of highest_set_bit. */
  shift?: bigint[];
  /** power before every `power <<= 1` of next_power_of_two. */
  double?: bigint[];
}

/** The reference: each function computed directly, recording the loops as the fixture does. */
export function runBitOp(op: BitOp): BitStepRecord {
  const rec: BitStepRecord = { op, result: 0n };
  const [a, b] = op.args;
  const popcount = (v: bigint) => {
    let n = v < 0n ? v & MASK64 : v;
    let count = 0n;
    while (n) {
      (rec.kernighan ??= []).push(n);
      n &= n - 1n;
      count += 1n;
    }
    return count;
  };
  const isPow2 = (n: bigint) => n > 0n && (n & (n - 1n)) === 0n;
  switch (op.name) {
    case 'power':
      rec.result = isPow2(a);
      break;
    case 'count':
      rec.result = popcount(a);
      break;
    case 'get':
      rec.result = (a >> b) & 1n;
      break;
    case 'set':
      rec.result = a | (1n << b);
      break;
    case 'clear':
      rec.result = a & ~(1n << b);
      break;
    case 'toggle':
      rec.result = a ^ (1n << b);
      break;
    case 'lowest':
      rec.result = a === 0n ? 0n : a & -a;
      break;
    case 'highest': {
      if (a <= 0n) {
        rec.result = -1n;
        break;
      }
      let n = a;
      let position = 0n;
      while (n > 1n) {
        (rec.shift ??= []).push(n);
        n >>= 1n;
        position += 1n;
      }
      rec.result = position;
      break;
    }
    case 'diff':
      rec.result = popcount(a ^ b);
      break;
    case 'swap': {
      if (a === b) {
        rec.result = [a, b];
        break;
      }
      let x = a;
      let y = b;
      x ^= y;
      y ^= x;
      x ^= y;
      rec.result = [x, y];
      break;
    }
    case 'even':
      rec.result = (a & 1n) === 0n;
      break;
    case 'next': {
      if (a <= 1n) {
        rec.result = 1n;
        break;
      }
      if (isPow2(a)) {
        rec.result = a;
        break;
      }
      let power = 1n;
      while (power < a) {
        (rec.double ??= []).push(power);
        power <<= 1n;
      }
      rec.result = power;
      break;
    }
  }
  return rec;
}

export function formatBitResult(r: BitResult): string {
  if (typeof r === 'boolean') return r ? 'True' : 'False';
  if (Array.isArray(r)) return `(${r[0]}, ${r[1]})`;
  return String(r);
}

/* ---------- pseudocode ---------- */

export const BIT_CODE = [
  'is_power_of_two(n): return n > 0 and (n & (n - 1)) == 0',
  'count_set_bits(n): if n < 0: n &= (1 << 64) - 1   # 64-bit two\'s complement',
  '  count = 0; while n: n &= (n - 1); count += 1   # drop the lowest set bit',
  'get_bit(n, i): return (n >> i) & 1',
  'set_bit(n, i): return n | (1 << i)',
  'clear_bit(n, i): return n & ~(1 << i)',
  'toggle_bit(n, i): return n ^ (1 << i)',
  'lowest_set_bit(n): if n == 0: return 0; return n & (-n)',
  'highest_set_bit(n): if n <= 0: return -1',
  '  position = 0; while n > 1: n >>= 1; position += 1',
  'count_differing_bits(a, b): return count_set_bits(a ^ b)',
  'swap_without_temp(a, b): if a == b: return a, b',
  '  a ^= b; b ^= a; a ^= b; return a, b',
  'is_even(n): return (n & 1) == 0',
  'next_power_of_two(n): if n <= 1: return 1; if is_power_of_two(n): return n',
  '  power = 1; while power < n: power <<= 1; return power',
];

const L = {
  power: 0,
  countMask: 1,
  countLoop: 2,
  get: 3,
  set: 4,
  clear: 5,
  toggle: 6,
  lowest: 7,
  highestCheck: 8,
  highestLoop: 9,
  diff: 10,
  swapCheck: 11,
  swapLoop: 12,
  even: 13,
  nextCheck: 14,
  nextLoop: 15,
} as const;

/* ---------- rows of bits ---------- */

interface RowOpts {
  op?: string;
  /** Bit ids are `${ids}:${pos}`: a row that reuses another row's ids makes its bits glide there. */
  ids?: string;
  /** Shift the ids: the bit at position p takes the id of position p + from (n >> s) or p - s (<<). */
  idShift?: number;
  roles?: Record<number, Role>;
  role?: Role;
  rule?: boolean;
  muted?: boolean;
  wide?: boolean;
}

function bitRow(key: string, label: string, value: bigint, o: RowOpts = {}): BitRowView {
  const width = o.wide ? 64 : BIT_LIMITS.window;
  const ids = o.ids ?? key;
  const bits: BitCellView[] = [];
  for (let pos = 0; pos < width; pos++) {
    const from = pos + (o.idShift ?? 0);
    const v = Number((value >> BigInt(pos)) & 1n) as 0 | 1;
    bits.push({ id: from >= 0 && from < width ? `${ids}:${from}` : `${ids}:in${pos}`, pos, v, role: o.roles?.[pos] });
  }
  return { key, label, op: o.op, bits, sign: value < 0n ? 1 : 0, value: String(value), role: o.role, rule: o.rule, muted: o.muted, wide: o.wide };
}

/** Positions where two values differ inside the window. */
function diffPositions(x: bigint, y: bigint, width: number): number[] {
  const out: number[] = [];
  for (let p = 0; p < width; p++) if (((x >> BigInt(p)) & 1n) !== ((y >> BigInt(p)) & 1n)) out.push(p);
  return out;
}

const onesOf = (x: bigint, width: number) => Array.from({ length: width }, (_, p) => p).filter((p) => ((x >> BigInt(p)) & 1n) === 1n);
const rolesAt = (positions: number[], role: Role): Record<number, Role> => Object.fromEntries(positions.map((p) => [p, role]));
const lowestPos = (x: bigint) => {
  let p = 0;
  while (((x >> BigInt(p)) & 1n) === 0n) p++;
  return p;
};

export interface BitRun {
  frames: Array<Frame<BitRowsState>>;
  steps: BitStepRecord[];
}

export function bitTrace(ops: BitOp[]): BitRun {
  const frames: Array<Frame<BitRowsState>> = [];
  const steps: BitStepRecord[] = [];
  let current = -1;
  const results: string[] = [];
  /** The rows of the last finished operation: the Done frame keeps them on screen. */
  let lastRows: BitRowView[] = [];

  const opStrip = (): { label: string; items: StripItem[] } => ({
    label: 'Operations',
    items: ops.map((op, i) => ({
      text: i < results.length ? `${op.name}(${op.args.join(', ')}) = ${results[i]}` : `${op.name}(${op.args.join(', ')})`,
      role: i === current ? 'active' : i < current ? 'muted' : undefined,
    })),
  });

  const snap = (line: number | undefined, caption: string, rows: BitRowView[], o: { column?: { pos: number; role: Role; wide?: boolean }; vars?: Array<[string, string | number]> } = {}) => {
    frames.push({
      line,
      caption,
      vars: [['op', ops[current] ? formatBitOp(ops[current]) : '-'], ...(o.vars ?? [])],
      state: {
        label: rows.map((r) => `${r.label} = ${r.value}`).join(', '),
        width: rows.some((r) => r.wide) ? 64 : BIT_LIMITS.window,
        rows,
        column: o.column,
        strips: [opStrip()],
      },
    });
  };

  /** Kernighan's loop on n (already masked if it was negative), one frame per round. */
  const kernighan = (start: bigint, wide: boolean, baseVars: Array<[string, string | number]>) => {
    let n = start;
    let count = 0;
    let gen = 0;
    const width = wide ? 64 : BIT_LIMITS.window;
    while (n) {
      const p = lowestPos(n);
      const below = n - 1n;
      const next = n & below;
      count += 1;
      snap(
        L.countLoop,
        (p === 0
          ? `Round ${count}: the lowest set bit is bit 0, so n - 1 only clears that bit and leaves everything above it. `
          : `Round ${count}: n - 1 turns the lowest set bit (bit ${p}) into 0 and the ${p} zero${p === 1 ? '' : 's'} below it into 1s; everything above bit ${p} is unchanged. `) +
          `n & (n - 1) therefore clears exactly bit ${p}: n = ${next}, count = ${count}.`,
        [
          bitRow('n', 'n', n, { ids: `g${gen}`, wide, roles: { [p]: 'compare' } }),
          bitRow('m', 'n - 1', below, { ids: `m${gen}`, op: '&', wide, roles: rolesAt(diffPositions(n, below, width), 'active') }),
          bitRow('r', 'n & (n - 1)', next, { ids: `g${gen + 1}`, wide, rule: true, roles: { [p]: 'active' } }),
        ],
        { column: { pos: p, role: 'compare', wide }, vars: [...baseVars, ['n', String(n)], ['count', count]] },
      );
      n = next;
      gen += 1;
    }
    return { count, gen };
  };

  snap(L.power, `${ops.length} operation${ops.length === 1 ? '' : 's'}. Each row is a Python int in binary: bit 0 on the right, and the "...0" or "...1" on the left stands for the sign bits, which go on forever (Python ints have no fixed width).`, []);

  ops.forEach((op, i) => {
    current = i;
    const rec = runBitOp(op);
    const [a, b] = op.args;
    const f = BIT_FUNCS[op.name];
    const finish = (line: number, caption: string, rows: BitRowView[], o: Parameters<typeof snap>[3] = {}) => {
      results.push(formatBitResult(rec.result));
      lastRows = rows;
      snap(line, caption, rows, { ...o, vars: [...(o.vars ?? []), ['returns', formatBitResult(rec.result)]] });
    };

    switch (op.name) {
      case 'power': {
        snap(L.power, `${f}(${a}): a power of two has exactly one set bit. The check needs n > 0 first.`, [bitRow('n', 'n', a)]);
        if (a <= 0n) {
          finish(L.power, `n = ${a} is not > 0, so the and short-circuits and the function returns False: 0 and the negatives are never powers of two.`, [bitRow('n', 'n', a, { role: 'bad' })]);
          break;
        }
        const below = a - 1n;
        snap(L.power, `n > 0. n - 1 = ${below}: the lowest set bit becomes 0 and the zeros below it become 1s.`, [
          bitRow('n', 'n', a, { roles: { [lowestPos(a)]: 'compare' } }),
          bitRow('m', 'n - 1', below, { op: '&', roles: rolesAt(diffPositions(a, below, 16), 'active') }),
        ]);
        const res = a & below;
        const ones = onesOf(res, 16);
        finish(
          L.power,
          res === 0n
            ? `n & (n - 1) = 0: clearing the lowest set bit left nothing, so ${a} had exactly one set bit. Returns True.`
            : `n & (n - 1) = ${res} != 0: bit${ones.length === 1 ? '' : 's'} ${ones.join(', ')} survive${ones.length === 1 ? 's' : ''} above the lowest one, so ${a} has more than one set bit. Returns False.`,
          [
            bitRow('n', 'n', a),
            bitRow('m', 'n - 1', below, { op: '&' }),
            bitRow('r', 'n & (n - 1)', res, { rule: true, role: res === 0n ? 'good' : 'bad', roles: rolesAt(ones, 'bad') }),
          ],
        );
        break;
      }
      case 'count':
      case 'diff': {
        let start = a;
        let wideVars: Array<[string, string | number]> = [];
        if (op.name === 'diff') {
          const x = a ^ b;
          const differ = diffPositions(a, b, 16);
          snap(L.diff, `${f}(${a}, ${b}): XOR sets a bit exactly where a and b differ, so the answer is the number of set bits of a ^ b.`, [
            bitRow('a', 'a', a, { roles: rolesAt(differ, 'compare') }),
            bitRow('b', 'b', b, { op: '^', roles: rolesAt(differ, 'compare') }),
            bitRow('x', 'a ^ b', x, { rule: true, roles: rolesAt(differ, 'active'), ids: 'g0' }),
          ], { vars: [['a ^ b', String(x)]] });
          start = x;
          wideVars = [['a ^ b', String(x)]];
        } else {
          snap(L.countMask, `${f}(${a}): count the 1 bits with Brian Kernighan's trick, one round per set bit.`, [bitRow('n', 'n', a, { ids: 'g0' })]);
        }
        let wide = false;
        if (start < 0n) {
          const masked = start & MASK64;
          wide = true;
          snap(
            L.countMask,
            `n = ${start} is negative. A Python int has infinitely many sign bits, so while n would never reach 0; the code takes n &= (1 << 64) - 1, ` +
              `the 64-bit two's complement value ${masked}, as the C++ and Go versions do.`,
            [
              bitRow('n', 'n', start, { ids: 'neg', wide: true }),
              bitRow('k', '(1 << 64) - 1', MASK64, { op: '&', wide: true }),
              bitRow('r', 'n (64 bits)', masked, { wide: true, rule: true, ids: 'g0', role: 'active' }),
            ],
            { vars: [...wideVars, ['n', String(masked)]] },
          );
          start = masked;
        }
        const { count, gen } = kernighan(start, wide, wideVars);
        finish(
          L.countLoop,
          count === 0 ? `n is 0, so the loop never runs: no set bits, count = 0.` : `n is now 0: the loop ran once per set bit, so count = ${count}.`,
          [bitRow('n', 'n', 0n, { ids: `g${gen}`, wide, role: 'done' })],
          { vars: [...wideVars, ['count', count]] },
        );
        break;
      }
      case 'get': {
        const pos = Number(b);
        snap(L.get, `${f}(${a}, ${b}): shift bit ${b} down to position 0, then mask everything else off.`, [bitRow('n', 'n', a, { roles: { [pos]: 'compare' } })], {
          column: { pos, role: 'compare' },
        });
        const shifted = a >> b;
        snap(L.get, `n >> ${b} = ${shifted}: every bit moves ${b} place${pos === 1 ? '' : 's'} right (the low ${b} fall off, sign bits fill in on the left), so bit ${b} now sits at position 0.`, [
          bitRow('n', `n >> ${b}`, shifted, { idShift: pos, ids: 'n', roles: { 0: 'compare' } }),
        ], { column: { pos: 0, role: 'compare' } });
        const res = shifted & 1n;
        finish(L.get, `(n >> ${b}) & 1 keeps only bit 0: bit ${b} of ${a} is ${res}.`, [
          bitRow('n', `n >> ${b}`, shifted, { idShift: pos, ids: 'n', roles: { 0: 'compare' } }),
          bitRow('one', '1', 1n, { op: '&' }),
          bitRow('r', 'result', res, { rule: true, role: 'done', roles: { 0: 'active' } }),
        ], { column: { pos: 0, role: 'compare' } });
        break;
      }
      case 'set':
      case 'clear':
      case 'toggle': {
        const pos = Number(b);
        const what = op.name === 'set' ? 'turn bit on' : op.name === 'clear' ? 'turn bit off' : 'flip bit';
        snap(L[op.name], `${f}(${a}, ${b}): ${what} ${b} with a mask that has only bit ${b} set. The mask starts as 1.`, [bitRow('n', 'n', a, { roles: { [pos]: 'compare' } }), bitRow('k', 'mask = 1', 1n, { ids: 'one' })], {
          column: { pos, role: 'compare' },
        });
        const mask = 1n << b;
        snap(L[op.name], `1 << ${b} = ${mask}: the 1 slides ${b} place${pos === 1 ? '' : 's'} left, under bit ${b} of n.`, [bitRow('n', 'n', a, { roles: { [pos]: 'compare' } }), bitRow('k', `1 << ${b}`, mask, { ids: 'one', idShift: -pos, roles: { [pos]: 'active' } })], {
          column: { pos, role: 'compare' },
        });
        let maskRow = bitRow('k', `1 << ${b}`, mask, { ids: 'one', idShift: -pos, op: op.name === 'set' ? '|' : '^' });
        if (op.name === 'clear') {
          const inv = ~mask;
          snap(L.clear, `~(1 << ${b}) = ${inv}: every bit flips, so the mask now has every bit except bit ${b}, including all the sign bits.`, [
            bitRow('n', 'n', a, { roles: { [pos]: 'compare' } }),
            bitRow('k', `~(1 << ${b})`, inv, { ids: 'one', idShift: -pos, roles: { [pos]: 'compare' } }),
          ], { column: { pos, role: 'compare' } });
          maskRow = bitRow('k', `~(1 << ${b})`, inv, { ids: 'one', idShift: -pos, op: '&' });
        }
        const res = rec.result as bigint;
        const before = (a >> b) & 1n;
        const after = (res >> b) & 1n;
        const change = before === after ? `bit ${b} was already ${after}, so the value does not change` : `bit ${b} goes from ${before} to ${after}`;
        const how = op.name === 'set' ? 'OR keeps every bit of n and adds the mask bit' : op.name === 'clear' ? 'AND keeps every bit of n except the one the mask leaves out' : 'XOR flips exactly the bits where the mask is 1';
        finish(L[op.name], `${how}: ${change}. Returns ${res}.`, [
          bitRow('n', 'n', a),
          maskRow,
          bitRow('r', 'result', res, { rule: true, role: 'done', roles: { [pos]: before === after ? 'compare' : 'active' } }),
        ], { column: { pos, role: 'compare' } });
        break;
      }
      case 'lowest': {
        snap(L.lowest, `${f}(${a}): -n in two's complement is ~n + 1, and n & -n keeps only the lowest set bit.`, [bitRow('n', 'n', a)]);
        if (a === 0n) {
          finish(L.lowest, 'n == 0 has no set bit, so the function returns 0 before computing n & -n.', [bitRow('n', 'n', a, { role: 'done' })]);
          break;
        }
        const p = lowestPos(a);
        const inv = ~a;
        snap(L.lowest, `~n = ${inv}: every bit of n flips, the sign bits too.`, [bitRow('n', 'n', a), bitRow('v', '~n', inv, { roles: rolesAt(diffPositions(a, inv, 16), 'compare') })]);
        const neg = -a;
        snap(L.lowest, `-n = ~n + 1 = ${neg}: the + 1 carries through the trailing 1s of ~n and stops at bit ${p}, which turns back into the 1 that n has there. Above bit ${p}, -n is still the flip of n.`, [
          bitRow('n', 'n', a, { roles: { [p]: 'compare' } }),
          bitRow('v', '-n', neg, { op: '&', roles: { [p]: 'active' } }),
        ], { column: { pos: p, role: 'compare' } });
        const res = a & neg;
        finish(L.lowest, `n & -n = ${res}: above bit ${p} the two values are opposites and below it both are 0, so only bit ${p} survives.`, [
          bitRow('n', 'n', a),
          bitRow('v', '-n', neg, { op: '&' }),
          bitRow('r', 'n & -n', res, { rule: true, role: 'done', roles: { [p]: 'active' } }),
        ], { column: { pos: p, role: 'compare' } });
        break;
      }
      case 'highest': {
        snap(L.highestCheck, `${f}(${a}): shift n right until only the top bit is left; the number of shifts is its position.`, [bitRow('n', 'n', a)]);
        if (a <= 0n) {
          finish(L.highestCheck, `n = ${a} <= 0: a negative int has infinitely many set sign bits and 0 has none, so the function returns -1.`, [bitRow('n', 'n', a, { role: 'bad' })]);
          break;
        }
        let n = a;
        let position = 0;
        let shift = 0;
        while (n > 1n) {
          const prev = n;
          n >>= 1n;
          position += 1;
          shift += 1;
          snap(L.highestLoop, `n = ${prev} > 1, so n >>= 1: the bits glide one place right and bit 0 falls off. n = ${n}, position = ${position}.`, [
            bitRow('n', 'n', n, { ids: 'n', idShift: shift }),
          ], { vars: [['position', position]] });
        }
        finish(L.highestLoop, `n = 1: the highest set bit of ${a} has reached position 0 after ${position} shift${position === 1 ? '' : 's'}, so it was bit ${position}. Returns ${position}.`, [
          bitRow('n', 'n', n, { ids: 'n', idShift: shift, role: 'done', roles: { 0: 'active' } }),
        ], { vars: [['position', position]] });
        break;
      }
      case 'swap': {
        snap(L.swapCheck, `${f}(${a}, ${b}): swap with three XORs and no temporary, using x ^ x = 0 and x ^ 0 = x.`, [bitRow('a', 'a', a), bitRow('b', 'b', b)]);
        if (a === b) {
          finish(L.swapCheck, 'a == b, so there is nothing to swap: the function returns (a, b) at once. (With one variable for both names, XOR would zero it.)', [bitRow('a', 'a', a, { role: 'done' }), bitRow('b', 'b', b, { role: 'done' })]);
          break;
        }
        const x1 = a ^ b;
        snap(L.swapLoop, `a ^= b: a = ${x1} now holds the difference of the two values (a 1 wherever they differ).`, [bitRow('a', 'a', x1, { role: 'active', roles: rolesAt(diffPositions(a, x1, 16), 'active') }), bitRow('b', 'b', b, { op: '^' })]);
        const y1 = b ^ x1;
        snap(L.swapLoop, `b ^= a: b ^ (a ^ b) = a, so b = ${y1}, the original a.`, [bitRow('a', 'a', x1, { op: '^' }), bitRow('b', 'b', y1, { role: 'active', roles: rolesAt(diffPositions(b, y1, 16), 'active') })]);
        const x2 = x1 ^ y1;
        finish(L.swapLoop, `a ^= b: (a ^ b) ^ a = b, so a = ${x2}, the original b. Returns (${x2}, ${y1}).`, [
          bitRow('a', 'a', x2, { role: 'done', roles: rolesAt(diffPositions(x1, x2, 16), 'active') }),
          bitRow('b', 'b', y1, { role: 'done' }),
        ]);
        break;
      }
      case 'even': {
        const res = a & 1n;
        snap(L.even, `${f}(${a}): bit 0 is the only odd place value (2^0 = 1), so it alone decides parity.`, [bitRow('n', 'n', a, { roles: { 0: 'compare' } })], { column: { pos: 0, role: 'compare' } });
        finish(L.even, `n & 1 = ${res}, so ${a} is ${res === 0n ? 'even: returns True' : 'odd: returns False'}. Negative numbers work too: their bit 0 still says odd or even.`, [
          bitRow('n', 'n', a),
          bitRow('one', '1', 1n, { op: '&' }),
          bitRow('r', 'n & 1', res, { rule: true, role: res === 0n ? 'good' : 'bad', roles: { 0: 'active' } }),
        ], { column: { pos: 0, role: 'compare' } });
        break;
      }
      case 'next': {
        snap(L.nextCheck, `${f}(${a}): the smallest power of two that is >= n.`, [bitRow('n', 'n', a)]);
        if (a <= 1n) {
          finish(L.nextCheck, `n = ${a} <= 1, so the answer is 2^0 = 1.`, [bitRow('n', 'n', a), bitRow('p', 'power', 1n, { role: 'done' })]);
          break;
        }
        if ((a & (a - 1n)) === 0n) {
          finish(L.nextCheck, `is_power_of_two(${a}) is True (n & (n - 1) = 0), so n itself is the answer.`, [
            bitRow('n', 'n', a, { role: 'done' }),
            bitRow('m', 'n - 1', a - 1n, { op: '&' }),
            bitRow('r', 'n & (n - 1)', 0n, { rule: true, role: 'good' }),
          ]);
          break;
        }
        let power = 1n;
        let k = 0;
        snap(L.nextLoop, `${a} is not a power of two (n & (n - 1) = ${a & (a - 1n)} != 0). Start from power = 1 and double it until it reaches n.`, [bitRow('n', 'n', a), bitRow('p', 'power', power, { ids: 'pw' })], {
          vars: [['power', 1]],
        });
        while (power < a) {
          const before = power;
          power <<= 1n;
          k += 1;
          snap(L.nextLoop, `power = ${before} < ${a}, so power <<= 1: the single 1 slides one place left, power = ${power}.`, [bitRow('n', 'n', a), bitRow('p', 'power', power, { ids: 'pw', idShift: -k, roles: { [k]: 'active' } })], {
            vars: [['power', String(power)]],
          });
        }
        finish(L.nextLoop, `power = ${power} >= ${a}: the loop stops. Returns ${power}, one place above the highest set bit of ${a}.`, [
          bitRow('n', 'n', a),
          bitRow('p', 'power', power, { ids: 'pw', idShift: -k, role: 'done' }),
        ]);
        break;
      }
    }
    steps.push(rec);
  });

  current = ops.length;
  snap(undefined, `Done: ${ops.length} operation${ops.length === 1 ? '' : 's'}: ${ops.map((op, i) => `${op.name} = ${results[i]}`).join(', ')}. The rows of the last one stay on screen.`, lastRows);
  return { frames, steps };
}

/* ---------- subset_generation ---------- */

export const SUBSET_CODE = [
  'subset_generation(n):',
  '  subsets = []',
  '  for mask in range(1 << n):        # 0, 1, ..., 2^n - 1: a binary counter',
  '    subset = []',
  '    for i in range(n):',
  '      if mask & (1 << i): subset.append(i)   # bit i set: element i is in',
  '    subsets.append(subset)',
  '  return subsets',
];

export function parseSubsetN(text: string): number {
  const m = text.trim().match(/^(?:n\s*[:=]?\s*)?(-?\d+)$/i);
  if (!m) throw new InputError('Enter n, the number of elements, for example "3".');
  const n = Number(m[1]);
  if (n < 0) throw new InputError(`n = ${n}: range(1 << n) raises ValueError (negative shift count) in Python, so n starts at 0.`);
  if (n > BIT_LIMITS.maxSubsetN) throw new InputError(`n goes up to ${BIT_LIMITS.maxSubsetN} here (2^${BIT_LIMITS.maxSubsetN} = ${2 ** BIT_LIMITS.maxSubsetN} subsets).`);
  return n;
}

export function subsetGeneration(n: number): number[][] {
  const subsets: number[][] = [];
  for (let mask = 0; mask < 1 << n; mask++) {
    const subset: number[] = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) subset.push(i);
    subsets.push(subset);
  }
  return subsets;
}

export interface SubsetRun {
  frames: Array<Frame<BitRowsState>>;
  result: number[][];
}

export function subsetTrace(n: number): SubsetRun {
  const frames: Array<Frame<BitRowsState>> = [];
  const subsets: number[][] = [];
  const width = n;
  const text = (s: number[]) => `[${s.join(', ')}]`;
  const row = (key: string, label: string, value: number, o: { ids?: string; idShift?: number; roles?: Record<number, Role>; role?: Role; op?: string; rule?: boolean } = {}): BitRowView => {
    const ids = o.ids ?? key;
    const bits: BitCellView[] = Array.from({ length: width }, (_, pos) => {
      const from = pos + (o.idShift ?? 0);
      return { id: from >= 0 && from < width ? `${ids}:${from}` : `${ids}:in${pos}`, pos, v: ((value >> pos) & 1) as 0 | 1, role: o.roles?.[pos] };
    });
    return { key, label, op: o.op, bits, sign: 0, value: String(value), role: o.role, rule: o.rule };
  };
  const snap = (line: number, caption: string, rows: BitRowView[], subset: number[] | null, o: { column?: { pos: number; role: Role }; vars?: Array<[string, string | number]> } = {}) => {
    frames.push({
      line,
      caption,
      vars: o.vars,
      state: {
        label: rows.map((r) => `${r.label} = ${r.value}`).join(', '),
        width,
        rows,
        column: o.column,
        strips: [
          { label: 'subset', items: subset === null ? [{ text: '-' }] : [{ text: text(subset), role: 'active' }] },
          { label: `subsets (${subsets.length} of ${2 ** n})`, items: subsets.length ? subsets.map((s, k) => ({ text: text(s), role: k === subsets.length - 1 ? 'done' : undefined })) : [{ text: '[]' }] },
        ],
      },
    });
  };

  snap(
    1,
    n === 0
      ? 'subset_generation(0): range(1 << 0) holds only the mask 0, so the result is [[]]: the empty set has one subset, itself.'
      : `subset_generation(${n}): element i is in a subset exactly when bit i of its mask is 1, so the ${2 ** n} masks 0..${2 ** n - 1} list every subset of {${Array.from({ length: n }, (_, i) => i).join(', ')}}.`,
    [],
    null,
  );
  for (let mask = 0; mask < 1 << n; mask++) {
    const prev = mask - 1;
    const flipped = mask === 0 ? [] : Array.from({ length: width }, (_, p) => p).filter((p) => ((mask >> p) & 1) !== ((prev >> p) & 1));
    snap(
      3,
      mask === 0
        ? `mask = 0: no bit is set, so this is the empty subset.`
        : `mask = ${mask}: counting up by one flips the trailing 1s to 0 and the next 0 to 1 (bit${flipped.length === 1 ? '' : 's'} ${flipped.join(', ')}). subset starts empty.`,
      [row('mask', 'mask', mask, { roles: rolesAt(flipped, 'active') })],
      [],
      { vars: [['mask', mask]] },
    );
    const subset: number[] = [];
    for (let i = 0; i < n; i++) {
      const hit = (mask & (1 << i)) !== 0;
      if (hit) subset.push(i);
      snap(
        5,
        hit ? `mask & (1 << ${i}) = ${1 << i} is not 0: bit ${i} is set, so element ${i} joins the subset.` : `mask & (1 << ${i}) = 0: bit ${i} is clear, so element ${i} stays out.`,
        [
          row('mask', 'mask', mask, { roles: { [i]: hit ? 'good' : 'compare' } }),
          row('k', `1 << ${i}`, 1 << i, { ids: 'one', idShift: -i, op: '&', roles: { [i]: 'active' } }),
          row('r', 'mask & (1 << i)', mask & (1 << i), { rule: true, role: hit ? 'good' : 'muted' }),
        ],
        [...subset],
        { column: { pos: i, role: hit ? 'good' : 'compare' }, vars: [['mask', mask], ['i', i]] },
      );
    }
    subsets.push(subset);
    snap(6, `subsets.append(${text(subset)}): subset ${subsets.length} of ${2 ** n}.`, [row('mask', 'mask', mask, { role: 'done' })], subset, { vars: [['mask', mask]] });
  }
  snap(7, `Done: ${subsets.length} subsets, each read off one mask. The work is n bit tests for each of the 2^n masks, O(n * 2^n), which is also the size of the output.`, [], null);
  return { frames, result: subsets };
}
