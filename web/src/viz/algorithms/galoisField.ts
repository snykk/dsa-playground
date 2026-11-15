/**
 * GF(2^8) tracer, drawn with FieldBits: bytes as rows of bits (addition is XOR, multiplication
 * shifts and reduces) beside the ring of the 255 powers of the generator 3 (the log / exp tables).
 *
 * Mirrors Algorithms/Coding_Theory/Galois_Field/Python/galois_field.py, the module singleton GF:
 *   GF256.__init__: acc = 1; for i in range(255): exp_table[i] = acc; log_table[acc] = i;
 *     acc = _slow_multiply(acc, 3, 0x11B); then exp_table[i] = exp_table[i - 255] up to index 511;
 *   add / sub: a ^ b;
 *   mul: 0 if a == 0 or b == 0, else exp_table[log_table[a] + log_table[b]];
 *   div: ZeroDivisionError if b == 0, 0 if a == 0, else exp_table[(log a - log b) % 255];
 *   inv: ZeroDivisionError if b == 0, else exp_table[255 - log_table[b]];
 *   pow: ValueError for 0^0, 0 for 0^n, else exp_table[(log_table[a] * n) % 255];
 *   _slow_multiply (shown after each mul, as the routine that built the tables):
 *     while a and b: if b & 1: result ^= a; b >>= 1; a <<= 1; if a & 0x100: a ^= 0x11B.
 * Python's % is never negative, so a negative difference or exponent wraps into 0..254.
 * Golden fixtures (__fixtures__/greedyAndField.json) pin both tables, _slow_multiply and the
 * result or exception of every operation.
 *
 * Input: "mul 0x53 0xCA, add 0x53 0xCA, inv 0x53, div 1 0x53, pow 3 8" (also "0x53 * 0xCA",
 * "mul(83, 202)"); values are bytes 0..255 in decimal or hex.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { BitRowView, FieldState, RingArc, RingMark } from '../renderers/FieldBits';

export const PRIMITIVE_POLY = 0x11b;
export const GENERATOR = 0x03;
export const FIELD_ORDER = 255;

/** _slow_multiply(a, b, poly): shift-and-add with reduction. */
export function slowMultiply(a: number, b: number, poly = PRIMITIVE_POLY): number {
  let result = 0;
  while (a && b) {
    if (b & 1) result ^= a;
    b >>= 1;
    a <<= 1;
    if (a & 0x100) a ^= poly;
  }
  return result;
}

/** GF256.__init__ with the defaults: exp_table has 512 entries (doubled), log_table 256. */
export const EXP_TABLE: number[] = new Array(512).fill(0);
export const LOG_TABLE: number[] = new Array(256).fill(0);
{
  let acc = 1;
  for (let i = 0; i < FIELD_ORDER; i++) {
    EXP_TABLE[i] = acc;
    LOG_TABLE[acc] = i;
    acc = slowMultiply(acc, GENERATOR);
  }
  for (let i = FIELD_ORDER; i < EXP_TABLE.length; i++) EXP_TABLE[i] = EXP_TABLE[i - FIELD_ORDER];
}

/** Python's a % m for m > 0. */
const pyMod = (a: number, m: number) => ((a % m) + m) % m;

/* ---------- input ---------- */

export type FieldOp =
  | { kind: 'add'; a: number; b: number }
  | { kind: 'sub'; a: number; b: number }
  | { kind: 'mul'; a: number; b: number }
  | { kind: 'div'; a: number; b: number }
  | { kind: 'inv'; b: number }
  | { kind: 'pow'; a: number; n: number };

export interface FieldInput {
  ops: FieldOp[];
}

export const FIELD_LIMITS = { maxOps: 12, maxExponent: 999 };

const NAMES: Record<string, FieldOp['kind']> = {
  add: 'add',
  plus: 'add',
  sub: 'sub',
  minus: 'sub',
  mul: 'mul',
  times: 'mul',
  div: 'div',
  inv: 'inv',
  inverse: 'inv',
  pow: 'pow',
  power: 'pow',
};
const INFIX: Record<string, FieldOp['kind']> = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'div', '**': 'pow' };

function parseByte(token: string): number {
  const t = token.trim();
  const v = /^0x[0-9a-f]+$/i.test(t) ? parseInt(t, 16) : /^\d+$/.test(t) ? Number(t) : NaN;
  if (Number.isNaN(v)) throw new InputError(`"${token}" is not a byte: write it in decimal (83) or hex (0x53).`);
  if (v > 255) throw new InputError(`${token} is not a field element: GF(2^8) has the bytes 0 to 255 (0x00 to 0xFF).`);
  return v;
}

function parseExponent(token: string): number {
  if (!/^-?\d+$/.test(token.trim())) throw new InputError(`The exponent "${token}" is not a whole number.`);
  const n = Number(token) || 0;
  if (Math.abs(n) > FIELD_LIMITS.maxExponent) throw new InputError(`Exponents go from -${FIELD_LIMITS.maxExponent} to ${FIELD_LIMITS.maxExponent} here (got ${token}).`);
  return n;
}

function makeOp(kind: FieldOp['kind'], args: string[], segment: string): FieldOp {
  if (kind === 'inv') {
    if (args.length !== 1) throw new InputError(`"${segment}": inv takes one byte, as in "inv 0x53".`);
    return { kind, b: parseByte(args[0]) };
  }
  if (args.length !== 2) throw new InputError(`"${segment}": ${kind} takes two values, as in "${kind} 0x53 ${kind === 'pow' ? '4' : '0xCA'}".`);
  if (kind === 'pow') return { kind, a: parseByte(args[0]), n: parseExponent(args[1]) };
  return { kind, a: parseByte(args[0]), b: parseByte(args[1]) };
}

/** "mul 0x53 0xCA, mul(83, 202); 0x53 * 0xCA" -> operations. */
export function parseField(text: string): FieldInput {
  const ops: FieldOp[] = [];
  for (const segment of text.split(/[;\n]|,(?![^(]*\))/).map((s) => s.trim()).filter(Boolean)) {
    const infix = segment.match(/^(\S+?)\s*(\*\*|[-+*/])\s*(\S+)$/);
    if (infix) {
      ops.push(makeOp(INFIX[infix[2]], [infix[1], infix[3]], segment));
      continue;
    }
    const call = segment.match(/^([A-Za-z]+)\s*(?:\(([^()]*)\)|\s+(.*))?$/);
    const kind = call ? NAMES[call[1].toLowerCase()] : undefined;
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write operations like "mul 0x53 0xCA", "add 5 3", "div 1 0x53", "inv 0x53" or "pow 3 8".`);
    const rest = (call[2] ?? call[3] ?? '').trim();
    ops.push(makeOp(kind, rest ? rest.split(/[\s,]+/).filter(Boolean) : [], segment));
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, for example "mul 0x53 0xCA".');
  if (ops.length > FIELD_LIMITS.maxOps) throw new InputError(`At most ${FIELD_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  return { ops };
}

/** 0x53 as the Python demo prints it. */
export const hex = (v: number) => `0x${v.toString(16).toUpperCase().padStart(2, '0')}`;
const both = (v: number) => `${hex(v)} (${v})`;

/** The byte as a polynomial in x: 0x53 = x^6 + x^4 + x + 1. */
export function polyText(v: number): string {
  if (v === 0) return '0';
  const terms: string[] = [];
  for (let p = 8; p >= 0; p--) if ((v >> p) & 1) terms.push(p === 0 ? '1' : p === 1 ? 'x' : `x^${p}`);
  return terms.join(' + ');
}

export function formatFieldOp(op: FieldOp): string {
  if (op.kind === 'inv') return `inv(${hex(op.b)})`;
  if (op.kind === 'pow') return `pow(${hex(op.a)}, ${op.n})`;
  return `${op.kind}(${hex(op.a)}, ${hex(op.b)})`;
}

/* ---------- pseudocode ---------- */

export const FIELD_CODE = [
  'add(a, b): return a ^ b                     # sub = add',
  'mul(a, b): if a == 0 or b == 0: return 0',
  '  return exp_table[log_table[a] + log_table[b]]   # table doubled: no % 255',
  'div(a, b): if b == 0: raise ZeroDivisionError; if a == 0: return 0',
  '  return exp_table[(log_table[a] - log_table[b]) % FIELD_ORDER]',
  'inv(b): if b == 0: raise ZeroDivisionError',
  '  return exp_table[FIELD_ORDER - log_table[b]]',
  'pow(a, n): if a == 0: raise ValueError if n == 0, else return 0',
  '  return exp_table[(log_table[a] * n) % FIELD_ORDER]',
  '_slow_multiply(a, b, poly=0x11B): result = 0   # built the tables',
  '  while a and b:',
  '    if b & 1: result ^= a                 # add (XOR) the shifted a',
  '    b >>= 1; a <<= 1                        # next bit of b; a = a * x',
  '    if a & 0x100: a ^= poly                 # bit 8 set: reduce mod 0x11B',
  '  return result',
];

const L = { add: 0, mulZero: 1, mul: 2, divZero: 3, div: 4, invZero: 5, inv: 6, powZero: 7, pow: 8, slow: 9, loop: 10, test: 11, shift: 12, reduce: 13, slowDone: 14 };

/* ---------- tracer ---------- */

export type FieldResult = number | 'ZeroDivisionError' | 'ValueError';

export interface FieldStep {
  op: FieldOp;
  result: FieldResult;
  /** mul only: (a, b, result) of _slow_multiply after every pass of its loop. */
  slow?: Array<[number, number, number]>;
}

export interface FieldRun {
  frames: Array<Frame<FieldState>>;
  steps: FieldStep[];
}

interface RowSpec {
  key: 'a' | 'b' | 'r' | 'p';
  label: string;
  value: number;
  width?: 8 | 9;
  /** Shift count, so bits keep their identity (and glide) when the row shifts. */
  shift?: number;
  dir?: 'left' | 'right';
  roles?: Record<number, Role>;
  muted?: boolean;
  note?: string;
}

export function fieldTrace(input: FieldInput): FieldRun {
  const frames: Array<Frame<FieldState>> = [];
  const steps: FieldStep[] = [];
  let current = -1;
  let rows: RowSpec[] = [];
  let marks: RingMark[] = [];
  let arcs: RingArc[] = [];
  let center: string[] = ['3^i', 'i = 0..254'];
  let lookups: Array<{ text: string; role?: Role }> = [];

  const toRow = (r: RowSpec): BitRowView => {
    const width = r.width ?? 8;
    const k = r.shift ?? 0;
    return {
      key: r.key,
      label: r.label,
      width,
      muted: r.muted,
      value: r.note ?? both(r.value),
      bits: Array.from({ length: width }, (_, p) => ({
        id: `${current}${r.key}${r.dir === 'right' ? p + k : p - k}`,
        pos: p,
        v: ((r.value >> p) & 1) as 0 | 1,
        role: r.roles?.[p],
      })),
    };
  };
  const snap = (line: number | undefined, caption: string, vars: Array<[string, string | number]> = []) => {
    frames.push({
      line,
      caption,
      vars: [['op', current >= 0 && current < input.ops.length ? formatFieldOp(input.ops[current]) : '-'], ...vars],
      state: {
        rows: rows.map(toRow),
        ring: { marks: [...marks], arcs: [...arcs], center: [...center] },
        lookups: lookups.map((l) => ({ ...l })),
        ops: input.ops.map((op, i) => ({ text: formatFieldOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
      },
    });
  };
  const look = (text: string) => {
    lookups = [...lookups.map((l) => ({ text: l.text })), { text, role: 'active' as Role }];
  };
  const bitsOf = (v: number, role: Role, width = 9) => {
    const out: Record<number, Role> = {};
    for (let p = 0; p < width; p++) if ((v >> p) & 1) out[p] = role;
    return out;
  };

  snap(
    undefined,
    'GF(2^8): every byte is a polynomial with bits as coefficients (0x53 = x^6 + x^4 + x + 1). The ring shows the 255 nonzero bytes as the powers 3^0 ... 3^254 of the generator 3: log_table gives the position of a byte, exp_table the byte at a position.',
  );

  /** _slow_multiply(a, b): frames for every pass; returns the passes as (a, b, result). */
  const slow = (a0: number, b0: number, product: number): Array<[number, number, number]> => {
    const passes: Array<[number, number, number]> = [];
    let a = a0;
    let b = b0;
    let result = 0;
    let k = 0;
    const show = (o: { a?: Record<number, Role>; b?: Record<number, Role>; r?: Record<number, Role>; poly?: boolean; aw?: 8 | 9 } = {}) => {
      rows = [
        { key: 'a', label: 'a', value: a, width: 9, shift: k, dir: 'left', roles: o.a },
        { key: 'b', label: 'b', value: b, shift: k, dir: 'right', roles: o.b },
        { key: 'r', label: 'result', value: result, roles: o.r },
        { key: 'p', label: 'poly', value: PRIMITIVE_POLY, width: 9, muted: !o.poly, note: '0x11B', roles: o.poly ? bitsOf(PRIMITIVE_POLY, 'compare') : undefined },
      ];
    };
    show();
    snap(
      L.slow,
      `The same product without tables: _slow_multiply(${hex(a0)}, ${hex(b0)}), the routine GF256.__init__ used to build them. ` +
        'It reads b from its lowest bit; each set bit adds (XORs) the current a into result, and a is multiplied by x (shifted left) after every bit.',
      [['result', hex(result)]],
    );
    let pass = 0;
    while (a && b) {
      pass += 1;
      if (b & 1) {
        const before = result;
        result ^= a;
        show({ b: { 0: 'compare' }, r: bitsOf(before ^ result, 'active', 8), a: bitsOf(a, 'compare') });
        snap(L.test, `Pass ${pass}: b & 1 = 1, so this power of x is in b: result ^= a, ${hex(before)} ^ ${hex(a)} = ${hex(result)}. The orange bits flipped.`, [
          ['a', hex(a)],
          ['b', hex(b)],
          ['result', hex(result)],
        ]);
      } else {
        show({ b: { 0: 'compare' } });
        snap(L.test, `Pass ${pass}: b & 1 = 0, so nothing is added this time.`, [
          ['a', hex(a)],
          ['b', hex(b)],
          ['result', hex(result)],
        ]);
      }
      b >>= 1;
      a <<= 1;
      k += 1;
      const over = (a & 0x100) !== 0;
      show({ a: over ? { 8: 'active' } : undefined });
      snap(
        L.shift,
        `b >>= 1 drops the bit just used (b = ${hex(b)}); a <<= 1 multiplies a by x (a = ${a > 255 ? `0x${a.toString(16).toUpperCase()}` : hex(a)}).` +
          (over ? ' Bit 8 is now set: a no longer fits in a byte.' : ' Bit 8 is clear, so a is still a byte.'),
        [
          ['a', a > 255 ? `0x${a.toString(16).toUpperCase()}` : hex(a)],
          ['b', hex(b)],
          ['result', hex(result)],
        ],
      );
      if (over) {
        const before = a;
        a ^= PRIMITIVE_POLY;
        show({ a: bitsOf(before ^ a, 'active'), poly: true });
        snap(
          L.reduce,
          `a & 0x100: XOR with the field polynomial 0x11B (x^8 = x^4 + x^3 + x + 1 here) clears bit 8: 0x${before.toString(16).toUpperCase()} ^ 0x11B = ${hex(a)}. That is a * x reduced mod 0x11B.`,
          [
            ['a', hex(a)],
            ['b', hex(b)],
            ['result', hex(result)],
          ],
        );
      }
      passes.push([a, b, result]);
    }
    show({ r: bitsOf(result, 'good', 8) });
    snap(
      L.slowDone,
      (pass === 0
        ? `${a0 === 0 ? 'a' : 'b'} is 0, so while a and b stops before the first pass.`
        : `b is 0: no bits are left, so the loop ends after ${pass} pass${pass === 1 ? '' : 'es'}.`) +
        ` result = ${hex(result)}, the same byte as ${product === 0 && pass === 0 ? 'mul returned' : 'the table lookup'}.`,
      [['result', hex(result)]],
    );
    return passes;
  };

  input.ops.forEach((op, i) => {
    current = i;
    marks = [];
    arcs = [];
    lookups = [];
    const name = formatFieldOp(op);
    let result: FieldResult;
    let passes: Array<[number, number, number]> | undefined;

    if (op.kind === 'add' || op.kind === 'sub') {
      const { a, b } = op;
      const r = a ^ b;
      const both1 = a & b;
      center = ['no table', 'needed'];
      rows = [
        { key: 'a', label: 'a', value: a, roles: bitsOf(a, 'compare', 8) },
        { key: 'b', label: 'b', value: b, roles: bitsOf(b, 'compare', 8) },
      ];
      snap(
        L.add,
        `${name}: ${op.kind === 'sub' ? 'sub is the same function as add (sub = add): in characteristic 2, -b = b. ' : ''}Adding polynomials adds matching coefficients mod 2, which is XOR bit by bit, with no carry.`,
        [['a', both(a)], ['b', both(b)]],
      );
      rows = [
        { key: 'a', label: 'a', value: a, roles: bitsOf(both1, 'active', 8) },
        { key: 'b', label: 'b', value: b, roles: bitsOf(both1, 'active', 8) },
        { key: 'r', label: 'a ^ b', value: r, roles: bitsOf(r, 'good', 8) },
      ];
      snap(
        L.add,
        `${hex(a)} ^ ${hex(b)} = ${hex(r)}.` +
          (both1 ? ` Where both bytes have a 1 (orange), 1 + 1 = 0 and nothing carries; so the integer sum ${a + b} is not the answer.` : ' No bit is 1 in both, so here XOR happens to equal the integer sum.'),
        [['result', both(r)]],
      );
      result = r;
    } else if (op.kind === 'mul') {
      const { a, b } = op;
      center = ['mul: add', 'exponents'];
      rows = [
        { key: 'a', label: 'a', value: a, roles: bitsOf(a, 'compare', 8) },
        { key: 'b', label: 'b', value: b, roles: bitsOf(b, 'compare', 8) },
      ];
      if (a === 0 || b === 0) {
        result = 0;
        rows.push({ key: 'r', label: 'result', value: 0 });
        snap(L.mulZero, `${name}: ${a === 0 ? 'a' : 'b'} is 0, which has no logarithm (0 is not a power of 3), so mul returns 0 before touching the tables.`, [['result', both(0)]]);
      } else {
        const la = LOG_TABLE[a];
        const lb = LOG_TABLE[b];
        const idx = la + lb;
        const r = EXP_TABLE[idx];
        snap(L.mul, `${name}: ${hex(a)} = ${polyText(a)} and ${hex(b)} = ${polyText(b)}. Multiplying them by hand is long; the tables turn it into one addition of exponents.`);
        marks = [{ at: la, label: hex(a), role: 'compare' }];
        arcs = [{ from: 0, len: la, role: 'compare', ring: 0 }];
        look(`log[${hex(a)}] = ${la}`);
        snap(L.mul, `log_table[${hex(a)}] = ${la}: ${hex(a)} = 3^${la}, ${la} steps around the ring from 3^0 = 1.`, [['log a', la]]);
        marks = [...marks, { at: lb, label: hex(b), role: 'compare' }];
        arcs = [...arcs, { from: la, len: lb, role: 'active', ring: 1 }];
        look(`log[${hex(b)}] = ${lb}`);
        snap(L.mul, `log_table[${hex(b)}] = ${lb}: walk ${lb} more steps. 3^${la} x 3^${lb} = 3^(${la} + ${lb}) = 3^${idx}.`, [
          ['log a', la],
          ['log b', lb],
          ['index', idx],
        ]);
        marks = [...marks, { at: idx % FIELD_ORDER, label: hex(r), role: 'good' }];
        look(`exp[${idx}] = ${hex(r)}`);
        rows = [...rows, { key: 'r', label: 'result', value: r, roles: bitsOf(r, 'good', 8) }];
        snap(
          L.mul,
          `exp_table[${idx}] = ${hex(r)}.` +
            (idx >= FIELD_ORDER
              ? ` The index passed 254: the table is stored twice (exp_table[${idx}] = exp_table[${idx - FIELD_ORDER}]), so no % 255 is needed; 3^255 = 1 closes the ring.`
              : ' The index is below 255, inside the first copy of the table.'),
          [
            ['index', idx],
            ['result', both(r)],
          ],
        );
        result = r;
      }
      passes = slow(a, b, result as number);
    } else if (op.kind === 'div') {
      const { a, b } = op;
      center = ['div: subtract', 'exponents'];
      rows = [
        { key: 'a', label: 'a', value: a, roles: bitsOf(a, 'compare', 8) },
        { key: 'b', label: 'b', value: b, roles: bitsOf(b, b === 0 ? 'bad' : 'compare', 8) },
      ];
      if (b === 0) {
        result = 'ZeroDivisionError';
        rows = [rows[0], { key: 'b', label: 'b', value: 0, roles: Object.fromEntries(Array.from({ length: 8 }, (_, p) => [p, 'bad' as Role])) }];
        snap(L.divZero, `${name}: b == 0, so div raises ZeroDivisionError("division by zero in GF(2^8)"). 0 has no logarithm and no inverse. The run goes on with the next operation.`, [['result', 'ZeroDivisionError']]);
      } else if (a === 0) {
        result = 0;
        rows.push({ key: 'r', label: 'result', value: 0 });
        snap(L.divZero, `${name}: a == 0, so the quotient is 0 (0 / b = 0 for any nonzero b) and the tables are not used.`, [['result', both(0)]]);
      } else {
        const la = LOG_TABLE[a];
        const lb = LOG_TABLE[b];
        const diff = la - lb;
        const idx = pyMod(diff, FIELD_ORDER);
        const r = EXP_TABLE[idx];
        marks = [{ at: la, label: hex(a), role: 'compare' }];
        arcs = [{ from: 0, len: la, role: 'compare', ring: 0 }];
        look(`log[${hex(a)}] = ${la}`);
        snap(L.div, `${name}: log_table[${hex(a)}] = ${la}, so ${hex(a)} = 3^${la}.`, [['log a', la]]);
        marks = [...marks, { at: lb, label: hex(b), role: 'compare' }];
        arcs = [...arcs, { from: la, len: -lb, role: 'active', ring: 1 }];
        look(`log[${hex(b)}] = ${lb}`);
        snap(
          L.div,
          `log_table[${hex(b)}] = ${lb}: dividing walks back ${lb} steps, ${la} - ${lb} = ${diff}.` +
            (diff < 0 ? ` That is negative, and Python's % makes it ${diff} % 255 = ${idx}: past 3^0 the ring goes on from 3^254.` : ` ${diff} % 255 = ${idx}.`),
          [
            ['log a', la],
            ['log b', lb],
            ['index', idx],
          ],
        );
        marks = [...marks, { at: idx, label: hex(r), role: 'good' }];
        look(`exp[${idx}] = ${hex(r)}`);
        rows = [...rows, { key: 'r', label: 'a / b', value: r, roles: bitsOf(r, 'good', 8) }];
        snap(L.div, `exp_table[${idx}] = ${hex(r)}, so ${hex(a)} / ${hex(b)} = ${hex(r)}: multiplying it by ${hex(b)} gives ${hex(a)} back.`, [['result', both(r)]]);
        result = r;
      }
    } else if (op.kind === 'inv') {
      const { b } = op;
      center = ['inv: 255 - log'];
      rows = [{ key: 'b', label: 'b', value: b, roles: bitsOf(b, b === 0 ? 'bad' : 'compare', 8) }];
      if (b === 0) {
        result = 'ZeroDivisionError';
        rows = [{ key: 'b', label: 'b', value: 0, roles: Object.fromEntries(Array.from({ length: 8 }, (_, p) => [p, 'bad' as Role])) }];
        snap(L.invZero, `${name}: b == 0, so inv raises ZeroDivisionError("0 has no multiplicative inverse"): no byte times 0 gives 1. The run goes on with the next operation.`, [['result', 'ZeroDivisionError']]);
      } else {
        const lb = LOG_TABLE[b];
        const idx = FIELD_ORDER - lb;
        const r = EXP_TABLE[idx];
        marks = [{ at: lb, label: hex(b), role: 'compare' }];
        arcs = [{ from: 0, len: lb, role: 'compare', ring: 0 }];
        look(`log[${hex(b)}] = ${lb}`);
        snap(L.inv, `${name}: log_table[${hex(b)}] = ${lb}, so ${hex(b)} = 3^${lb}. Its inverse must bring the exponent to 255, a full turn, because 3^255 = 1.`, [['log b', lb]]);
        arcs = [...arcs, { from: lb, len: idx, role: 'active', ring: 1 }];
        marks = [...marks, { at: idx % FIELD_ORDER, label: hex(r), role: 'good' }];
        look(`exp[${idx}] = ${hex(r)}`);
        rows = [...rows, { key: 'r', label: 'inv(b)', value: r, roles: bitsOf(r, 'good', 8) }];
        snap(
          L.inv,
          `255 - ${lb} = ${idx}, and exp_table[${idx}] = ${hex(r)}${idx === FIELD_ORDER ? ' (the second copy: exp_table[255] = exp_table[0])' : ''}. Check: 3^${lb} x 3^${idx} = 3^255 = 1, so ${hex(b)} x ${hex(r)} = 0x01.`,
          [['result', both(r)]],
        );
        result = r;
      }
    } else {
      const { a, n } = op;
      center = ['pow: multiply', 'the exponent'];
      rows = [{ key: 'a', label: 'a', value: a, roles: bitsOf(a, 'compare', 8) }];
      if (a === 0) {
        if (n === 0) {
          result = 'ValueError';
          rows = [{ key: 'a', label: 'a', value: 0, roles: Object.fromEntries(Array.from({ length: 8 }, (_, p) => [p, 'bad' as Role])) }];
          snap(L.powZero, `${name}: a == 0 and n == 0, so pow raises ValueError("0^0 is undefined"). The run goes on with the next operation.`, [['result', 'ValueError']]);
        } else {
          result = 0;
          rows.push({ key: 'r', label: 'result', value: 0 });
          snap(
            L.powZero,
            `${name}: a == 0, so pow returns 0 for any n other than 0${n < 0 ? `, even the negative ${n}: the code does not compute inv(0), which would raise` : ''}.`,
            [['result', both(0)]],
          );
        }
      } else {
        const la = LOG_TABLE[a];
        const prod = la * n;
        const idx = pyMod(prod, FIELD_ORDER);
        const r = EXP_TABLE[idx];
        marks = [{ at: la, label: hex(a), role: 'compare' }];
        arcs = [{ from: 0, len: la, role: 'compare', ring: 0 }];
        look(`log[${hex(a)}] = ${la}`);
        snap(L.pow, `${name}: log_table[${hex(a)}] = ${la}, so ${hex(a)}^${n} = 3^(${la} x ${n}).`, [['log a', la]]);
        arcs = [{ from: 0, len: idx, role: 'active', ring: 1 }, ...arcs];
        marks = [...marks, { at: idx, label: hex(r), role: 'good' }];
        look(`exp[${idx}] = ${hex(r)}`);
        rows = [...rows, { key: 'r', label: 'a^n', value: r, roles: bitsOf(r, 'good', 8) }];
        snap(
          L.pow,
          `${la} x ${n} = ${prod}, and (${prod}) % 255 = ${idx}` +
            (prod < 0 ? " (Python's % is never negative, so a negative n works like a power of the inverse)" : prod >= FIELD_ORDER ? ` (the ring is turned ${Math.floor(prod / FIELD_ORDER)} full time${Math.floor(prod / FIELD_ORDER) === 1 ? '' : 's'} first)` : '') +
            `: exp_table[${idx}] = ${hex(r)}.`,
          [
            ['exponent', `${prod} % 255 = ${idx}`],
            ['result', both(r)],
          ],
        );
        result = r;
      }
    }
    steps.push({ op, result, ...(passes ? { slow: passes } : {}) });
  });

  current = input.ops.length;
  const summary = steps.map((s) => `${formatFieldOp(s.op)} = ${typeof s.result === 'number' ? hex(s.result) : s.result}`).join('; ');
  snap(undefined, `Done: ${summary}.`);
  return { frames, steps };
}
