/**
 * String hashing tracer, drawn with StringHashingView (StringScan: aligned cell rows, a lookup
 * table and strips, in a box that scrolls sideways on a phone).
 *
 * Mirrors Algorithms/String_Algorithms/Advanced_String/String_Hashing/Python/string_hashing.py,
 * class PolynomialHash with one (base, mod) pair (a small modulus, so the numbers fit in the
 * cells; the repository's DoubleHash keeps two moduli near 10^9):
 *   __init__   prefix[0] = 0, power[0] = 1; for every character c (its code point):
 *              prefix[i + 1] = (prefix[i] * base + c) % mod, power[i + 1] = power[i] * base % mod.
 *   get(l, r)  (prefix[r] - prefix[l] * power[r - l]) % mod, never negative.
 *   equal(i, j, length)  get(i, i + length) == get(j, j + length).
 *   lcp(i, j)  _lcp(i, j, min(n - i, n - j)).
 *   _lcp(i, j, limit)  lo, hi = 0, limit; while lo < hi: mid = (lo + hi + 1) // 2; equal hashes
 *              of the two prefixes of length mid move lo to mid, else hi to mid - 1; return lo.
 *   compare(l1, r1, l2, r2)  k = _lcp(l1, l2, min(len1, len2)); a proper prefix is smaller,
 *              else the characters at offset k decide.
 *   count_distinct(length)  the size of the set of get(i, i + length) over every start i.
 * Golden fixtures (__fixtures__/advancedStrings.json, section hashing) pin the tables, every
 * get call of every query (its range and value, in order) and every result.
 *
 * Input: "mississippi; lcp 1 4, cmp 0 4 1 5; base 31, mod 97"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ScanCell, ScanRow, StringScanState } from '../renderers/StringScan';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

/* ---------- input ---------- */

export type HashOp =
  | { kind: 'hash'; l: number; r: number }
  | { kind: 'eq'; i: number; j: number; length: number }
  | { kind: 'lcp'; i: number; j: number }
  | { kind: 'cmp'; l1: number; r1: number; l2: number; r2: number }
  | { kind: 'distinct'; length: number };

export interface HashInput {
  text: string[];
  base: number;
  mod: number;
  ops: HashOp[];
}

export const HASH_LIMITS = { textLength: 12, maxOps: 4, maxMod: 997 };
export const HASH_DEFAULTS = { base: 31, mod: 97 };

const ARITY: Record<HashOp['kind'], number> = { hash: 2, eq: 3, lcp: 2, cmp: 4, distinct: 1 };
const USAGE: Record<HashOp['kind'], string> = {
  hash: '"hash l r" (the hash of s[l:r])',
  eq: '"eq i j length" (is s[i:i+length] equal to s[j:j+length]?)',
  lcp: '"lcp i j" (the common prefix of the suffixes at i and j)',
  cmp: '"cmp l1 r1 l2 r2" (the order of s[l1:r1] and s[l2:r2])',
  distinct: '"distinct length" (distinct substrings of that length)',
};
const EXAMPLE = '"mississippi; lcp 1 4; base 31, mod 97"';
const isEmptyToken = (t: string) => t === '""' || t === "''";

/** Parse "mississippi; lcp 1 4, cmp 0 4 1 5; base 31, mod 97". */
export function parseStringHashing(input: string): HashInput {
  const semi = input.indexOf(';');
  const head = (semi === -1 ? input : input.slice(0, semi)).trim();
  const rest = semi === -1 ? '' : input.slice(semi + 1);
  if (!head) throw new InputError(`Start with the string, then a ";" and the queries, for example ${EXAMPLE}. Write "" for the empty string.`);
  if (/\s/.test(head) && !isEmptyToken(head)) throw new InputError('The string is one word without spaces.');
  const text = isEmptyToken(head) ? [] : Array.from(head);
  if (text.length > HASH_LIMITS.textLength) throw new InputError(`Keep the string to ${HASH_LIMITS.textLength} characters, so the tables fit on screen (got ${text.length}).`);
  for (const c of text) {
    const code = c.codePointAt(0)!;
    if (code < 33 || code > 126) throw new InputError(`Use printable ASCII characters here, so every code fits in a cell ("${c}" has code ${code}).`);
  }
  const n = text.length;
  const tokens = rest.split(/[\s,;]+/).filter(Boolean);
  const ops: HashOp[] = [];
  let base = HASH_DEFAULTS.base;
  let mod = HASH_DEFAULTS.mod;
  let baseGiven = false;
  const num = (tok: string | undefined, what: string): number => {
    if (tok === undefined || !/^\d+$/.test(tok)) throw new InputError(`${what} needs a whole number (got ${tok === undefined ? 'nothing' : `"${tok}"`}).`);
    return Number(tok);
  };
  for (let k = 0; k < tokens.length; k++) {
    const low = tokens[k].toLowerCase();
    if (low === 'base' || low === 'mod') {
      const v = num(tokens[k + 1], `"${low}"`);
      if (low === 'base') {
        base = v;
        baseGiven = true;
      } else {
        mod = v;
      }
      k += 1;
      continue;
    }
    if (!(low in ARITY)) {
      throw new InputError(`Unknown query "${tokens[k]}". Use ${Object.values(USAGE).join(', ')}, and optionally "base B" and "mod M".`);
    }
    const kind = low as HashOp['kind'];
    const args: number[] = [];
    for (let a = 1; a <= ARITY[kind]; a++) {
      const tok = tokens[k + a];
      if (tok === undefined || !/^\d+$/.test(tok)) throw new InputError(`Write ${USAGE[kind]}.`);
      args.push(Number(tok));
    }
    k += ARITY[kind];
    const range = (l: number, r: number) => {
      if (l > r || r > n) throw new InputError(`[${l}, ${r}) is not a range of the string: it needs 0 <= l <= r <= ${n}.`);
    };
    if (kind === 'hash') {
      range(args[0], args[1]);
      ops.push({ kind, l: args[0], r: args[1] });
    } else if (kind === 'eq') {
      range(args[0], args[0] + args[2]);
      range(args[1], args[1] + args[2]);
      ops.push({ kind, i: args[0], j: args[1], length: args[2] });
    } else if (kind === 'lcp') {
      if (args[0] > n || args[1] > n) throw new InputError(`lcp takes start positions from 0 to ${n} (got ${args[0]} and ${args[1]}).`);
      ops.push({ kind, i: args[0], j: args[1] });
    } else if (kind === 'cmp') {
      range(args[0], args[1]);
      range(args[2], args[3]);
      ops.push({ kind, l1: args[0], r1: args[1], l2: args[2], r2: args[3] });
    } else {
      if (args[0] < 1 || args[0] > n) throw new InputError(n ? `distinct takes a length from 1 to ${n} here (got ${args[0]}).` : 'distinct needs a non-empty string.');
      ops.push({ kind, length: args[0] });
    }
  }
  if (mod < 2 || mod > HASH_LIMITS.maxMod) throw new InputError(`Pick a modulus from 2 to ${HASH_LIMITS.maxMod}, so every value fits in a cell (got ${mod}).`);
  if (!baseGiven && base >= mod) base = mod - 1;
  if (base < 1 || base >= mod) throw new InputError(`The base must be from 1 to mod - 1 = ${mod - 1} (got ${base}).`);
  if (ops.length > HASH_LIMITS.maxOps) throw new InputError(`At most ${HASH_LIMITS.maxOps} queries, please (got ${ops.length}).`);
  return { text, base, mod, ops };
}

/* ---------- pseudocode ---------- */

export const HASH_CODE = [
  'PolynomialHash(s, base, mod): prefix[0] = 0; power[0] = 1',
  '  for i, c in enumerate(codes):            # c = code point of s[i]',
  '    prefix[i + 1] = (prefix[i] * base + c) % mod',
  '    power[i + 1] = power[i] * base % mod',
  'get(l, r): return (prefix[r] - prefix[l] * power[r - l]) % mod',
  'equal(i, j, length): return get(i, i + length) == get(j, j + length)',
  'lcp(i, j): return _lcp(i, j, min(n - i, n - j))',
  '_lcp(i, j, limit): lo, hi = 0, limit',
  '  while lo < hi: mid = (lo + hi + 1) // 2',
  '    if get(i, i + mid) == get(j, j + mid): lo = mid',
  '    else: hi = mid - 1',
  '  return lo',
  'compare(l1, r1, l2, r2): k = _lcp(l1, l2, min(len1, len2))',
  '  if k == min(len1, len2): return sign(len1 - len2)   # a prefix is smaller',
  '  return -1 if codes[l1 + k] < codes[l2 + k] else 1',
  'count_distinct(length): return len({get(i, i + length) for i in range(n - length + 1)})',
];

const L = {
  init: 0,
  prefix: 2,
  power: 3,
  get: 4,
  equal: 5,
  lcp: 6,
  lcpInit: 7,
  probe: 9,
  probeMiss: 10,
  lcpReturn: 11,
  cmp: 12,
  cmpPrefix: 13,
  cmpChar: 14,
  distinct: 15,
};

/* ---------- tracer ---------- */

/** One get call: [l, r, value]. */
export type GetCall = [number, number, number];

export interface HashOpRun {
  op: HashOp;
  calls: GetCall[];
  result: number | boolean;
}

export interface HashRun {
  frames: Array<Frame<StringScanState>>;
  prefix: number[];
  power: number[];
  ops: HashOpRun[];
}

type Vars = Array<[string, string | number]>;

interface View {
  /** Roles of the characters of s (and of their codes), by index. */
  text?: Record<number, Role>;
  prefix?: Record<number, Role>;
  power?: Record<number, Role>;
  /** Extra rows under the tables (two substrings, window hashes). */
  extra?: ScanRow[];
  table?: StringScanState['table'];
  hashes?: StripItem[];
  vars?: Vars;
}

const mathMod = (x: number, m: number) => ((x % m) + m) % m;
const quote = (cs: string[]) => `'${cs.join('')}'`;
const opText = (op: HashOp): string => {
  switch (op.kind) {
    case 'hash':
      return `get(${op.l}, ${op.r})`;
    case 'eq':
      return `equal(${op.i}, ${op.j}, ${op.length})`;
    case 'lcp':
      return `lcp(${op.i}, ${op.j})`;
    case 'cmp':
      return `compare(${op.l1}, ${op.r1}, ${op.l2}, ${op.r2})`;
    default:
      return `count_distinct(${op.length})`;
  }
};

export function stringHashingTrace({ text, base, mod, ops }: HashInput): HashRun {
  const n = text.length;
  const codes = text.map((c) => c.codePointAt(0)!);
  const prefix: Array<number | null> = Array.from({ length: n + 1 }, (_, k) => (k === 0 ? 0 : null));
  const power: Array<number | null> = Array.from({ length: n + 1 }, (_, k) => (k === 0 ? 1 : null));
  const frames: Array<Frame<StringScanState>> = [];
  const runs: HashOpRun[] = [];
  let current = -1;
  const results: StripItem[] = [];
  const times = SYM.times;

  const cellOf = (value: ScanCell['value'], role?: Role): ScanCell => ({ value, role });
  const strips = (v: View): StripData[] => {
    const out: StripData[] = [];
    if (v.hashes?.length) out.push({ label: 'Hashes', items: v.hashes });
    out.push({
      label: 'Queries',
      items: ops.length
        ? ops.map((op, k): StripItem => ({ text: k < results.length ? `${opText(op)} = ${results[k].text}` : opText(op), role: k === current ? 'active' : undefined }))
        : [{ text: 'none' }],
    });
    return out;
  };

  const snap = (line: number | undefined, caption: string, v: View = {}) => {
    const rows: ScanRow[] = [
      { kind: 'index', label: 'i', count: n + 1 },
      { kind: 'cells', label: 's', offset: 1, cells: text.map((c, k) => cellOf(c, v.text?.[k])) },
      { kind: 'cells', label: 'code', offset: 1, cells: codes.map((c, k) => cellOf(c, v.text?.[k])) },
      { kind: 'gap' },
      { kind: 'cells', label: 'prefix', cells: prefix.map((x, k) => cellOf(x, v.prefix?.[k])) },
      { kind: 'cells', label: 'power', cells: power.map((x, k) => cellOf(x, v.power?.[k])) },
    ];
    if (v.extra?.length) rows.push({ kind: 'gap' }, ...v.extra);
    frames.push({
      line,
      caption,
      vars: [['base', base], ['mod', mod], ...(v.vars ?? [])],
      state: {
        label: `String hashing of '${text.join('')}' with base ${base} and modulus ${mod}: the prefix hashes and the powers of the base${current >= 0 && current < ops.length ? `, answering ${opText(ops[current])}` : ''}`,
        rows,
        table: v.table,
        strips: strips(v),
      },
    });
  };

  /* ---------- build ---------- */
  snap(
    L.init,
    n
      ? `PolynomialHash('${text.join('')}', ${base}, ${mod}): prefix[0] = 0 is the hash of the empty prefix, and power[0] = ${base}^0 = 1. Each next column adds one character.`
      : `PolynomialHash('', ${base}, ${mod}): the string is empty, so the tables are just prefix[0] = 0 and power[0] = 1.`,
  );
  for (let i = 0; i < n; i++) {
    const p = prefix[i]!;
    prefix[i + 1] = (p * base + codes[i]) % mod;
    snap(
      L.prefix,
      `prefix[${i + 1}] = (prefix[${i}] ${times} ${base} + code('${text[i]}')) mod ${mod} = (${p} ${times} ${base} + ${codes[i]}) mod ${mod} = ${prefix[i + 1]}: shift the hash of ${quote(text.slice(0, i))} one digit left and add '${text[i]}'.`,
      { text: { [i]: 'active' }, prefix: { [i]: 'compare', [i + 1]: 'active' }, vars: [['i', i], ['c', codes[i]]] },
    );
    const q = power[i]!;
    power[i + 1] = (q * base) % mod;
    snap(
      L.power,
      `power[${i + 1}] = power[${i}] ${times} ${base} mod ${mod} = ${q} ${times} ${base} mod ${mod} = ${power[i + 1]}, which is ${base}^${i + 1} mod ${mod}: the weight that shifts a hash by ${i + 1} digit${i ? 's' : ''}.`,
      { power: { [i]: 'compare', [i + 1]: 'active' }, vars: [['i', i]] },
    );
  }
  const P = prefix as number[];
  const W = power as number[];
  if (n) snap(undefined, `Both tables are built in one pass of ${n} steps: O(n). From now on the hash of any substring s[l:r] costs one multiplication, one subtraction and one remainder.`, {});

  /* ---------- queries ---------- */
  let calls: GetCall[] = [];
  /** The true common prefix of s[i:] and s[j:], character by character (for the captions only). */
  const naiveLcp = (i: number, j: number) => {
    let k = 0;
    while (i + k < n && j + k < n && text[i + k] === text[j + k]) k++;
    return k;
  };
  const get = (l: number, r: number): number => {
    const v = mathMod(P[r] - P[l] * W[r - l], mod);
    calls.push([l, r, v]);
    return v;
  };
  const formula = (l: number, r: number, v: number) =>
    `get(${l}, ${r}) = (prefix[${r}] - prefix[${l}] ${times} power[${r - l}]) mod ${mod} = (${P[r]} - ${P[l]} ${times} ${W[r - l]}) mod ${mod} = ${v}`;
  /** Roles of the cells two get calls read: the two ranges of s, four prefix cells, one power. */
  const readRoles = (ranges: Array<[number, number]>) => {
    const t: Record<number, Role> = {};
    const p: Record<number, Role> = {};
    const w: Record<number, Role> = {};
    for (const [l, r] of ranges) {
      for (let k = l; k < r; k++) t[k] = 'compare';
      p[l] = 'compare';
      p[r] = 'compare';
      w[r - l] = 'active';
    }
    return { text: t, prefix: p, power: w };
  };
  /**
   * Two substrings stacked from the same column, so their k-th characters line up. The first
   * `compared` characters are being compared (compare), or are known to agree (done, `agreed`).
   */
  const pairRows = (a: number, b: number, lenA: number, lenB: number, compared: number, agreed = false, decide?: number): ScanRow[] => {
    const row = (start: number, len: number): ScanRow => ({
      kind: 'cells',
      label: `s[${start}:${start + len}]`,
      offset: 1,
      cells: text.slice(start, start + len).map((c, k) => {
        let role: Role | undefined;
        if (decide !== undefined && k === decide) role = 'active';
        else if (k < compared) role = agreed ? 'done' : 'compare';
        return cellOf(c, role);
      }),
    });
    return [row(a, lenA), row(b, lenB)];
  };
  /** The two hashes just compared, with a check or a cross. */
  const hashRow = (x: number, y: number): ScanRow => ({
    kind: 'cells',
    label: 'hashes',
    offset: 1,
    cells: [cellOf(x, x === y ? 'good' : 'bad'), cellOf(y, x === y ? 'good' : 'bad')],
  });
  const searchTable = (limit: number, lo: number, hi: number, mid?: number): StringScanState['table'] => ({
    title: 'Binary search on the length',
    rows: [
      { kind: 'index', label: 'length', count: limit + 1 },
      {
        kind: 'cells',
        label: 'state',
        cells: Array.from({ length: limit + 1 }, (_, k) => {
          if (k === mid) return cellOf('?', 'active');
          if (k <= lo) return cellOf('=', 'done');
          if (k <= hi) return cellOf('?');
          return cellOf('');
        }),
      },
    ],
  });

  /** _lcp with frames; returns lo. `name` is the caller (lcp or compare). */
  const boundedLcp = (i: number, j: number, limit: number, lenA: number, lenB: number, opLine: number, intro: string): number => {
    let lo = 0;
    let hi = limit;
    snap(opLine, intro, { extra: pairRows(i, j, lenA, lenB, 0), table: searchTable(limit, lo, hi), vars: [['lo', lo], ['hi', hi]] });
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2);
      const a = get(i, i + mid);
      const b = get(j, j + mid);
      const same = a === b;
      const roles = readRoles([
        [i, i + mid],
        [j, j + mid],
      ]);
      const before = `lo = ${lo}, hi = ${hi}, so mid = (${lo} + ${hi} + 1) // 2 = ${mid}. ${formula(i, i + mid, a)}; ${formula(j, j + mid, b)}.`;
      const truly = text.slice(i, i + mid).join('') === text.slice(j, j + mid).join('');
      const after = same
        ? truly
          ? ` Equal: the first ${mid} characters agree, so lo = ${mid}.`
          : ` Equal, so lo = ${mid}, but ${quote(text.slice(i, i + mid))} and ${quote(text.slice(j, j + mid))} differ: a collision, and the binary search trusts it.`
        : ` Different: the prefixes of length ${mid} differ (a hash mismatch is a proof), so hi = ${mid - 1}.`;
      if (same) lo = mid;
      else hi = mid - 1;
      snap(same ? L.probe : L.probeMiss, before + after, {
        ...roles,
        extra: [...pairRows(i, j, lenA, lenB, mid), hashRow(a, b)],
        table: searchTable(limit, lo, hi, mid),
        vars: [['lo', lo], ['hi', hi], ['mid', mid]],
      });
    }
    return lo;
  };

  ops.forEach((op, index) => {
    current = index;
    calls = [];
    let result: number | boolean;
    if (op.kind === 'hash') {
      const v = get(op.l, op.r);
      result = v;
      results.push({ text: String(v) });
      snap(
        L.get,
        `${formula(op.l, op.r, v)}. prefix[${op.r}] holds the digits of s[0:${op.r}]; those of s[0:${op.l}] sit in it ${op.r - op.l} places to the left, so subtracting prefix[${op.l}] ${times} ${base}^${op.r - op.l} leaves ${quote(text.slice(op.l, op.r))} alone.`,
        { ...readRoles([[op.l, op.r]]), hashes: [{ text: `s[${op.l}:${op.r}] ${SYM.rightArrow} ${v}`, role: 'done' }] },
      );
    } else if (op.kind === 'eq') {
      const { i, j, length } = op;
      const a = get(i, i + length);
      const b = get(j, j + length);
      result = a === b;
      results.push({ text: result ? 'True' : 'False' });
      const truly = text.slice(i, i + length).join('') === text.slice(j, j + length).join('');
      snap(
        L.equal,
        `${formula(i, i + length, a)}; ${formula(j, j + length, b)}. ` +
          (result
            ? truly
              ? `Equal hashes: True. Equal strings always give equal hashes, and different ones rarely do.`
              : `Equal hashes, so True, but ${quote(text.slice(i, i + length))} and ${quote(text.slice(j, j + length))} differ: a collision of this small modulus.`
            : 'Different hashes: False, and that answer is certain.'),
        {
          ...readRoles([
            [i, i + length],
            [j, j + length],
          ]),
          extra: [...pairRows(i, j, length, length, length), hashRow(a, b)],
        },
      );
    } else if (op.kind === 'lcp') {
      const { i, j } = op;
      const limit = Math.min(n - i, n - j);
      const k = boundedLcp(
        i,
        j,
        limit,
        n - i,
        n - j,
        L.lcp,
        `lcp(${i}, ${j}): the suffixes ${quote(text.slice(i))} and ${quote(text.slice(j))}, stacked so their characters line up. The common prefix is at most min(${n - i}, ${n - j}) = ${limit} long; binary search on the length with lo = 0 (always agrees) and hi = ${limit}.`,
      );
      result = k;
      results.push({ text: String(k) });
      const bound = 2 * Math.ceil(Math.log2(limit + 1));
      const real = naiveLcp(i, j);
      const said =
        real === k
          ? `the suffixes share their first ${k} character${k === 1 ? '' : 's'}${k ? ` (${quote(text.slice(i, i + k))})` : ''}`
          : `lcp returns ${k}, but the suffixes really share ${real} character${real === 1 ? '' : 's'}: a collision fooled the search, which never tried the shorter lengths`;
      snap(L.lcpReturn, `lo = hi = ${k}: ${said}. The search made ${calls.length} get call${calls.length === 1 ? '' : 's'}, at most 2 ${SYM.times} ceil(log2(${limit + 1})) = ${bound}, where a scan compares up to ${limit} pairs of characters.`, {
        extra: pairRows(i, j, n - i, n - j, k, true),
        table: searchTable(limit, k, k),
        vars: [['lo', k], ['hi', k]],
      });
    } else if (op.kind === 'cmp') {
      const { l1, r1, l2, r2 } = op;
      const len1 = r1 - l1;
      const len2 = r2 - l2;
      const shorter = Math.min(len1, len2);
      const k = boundedLcp(
        l1,
        l2,
        shorter,
        len1,
        len2,
        L.cmp,
        `compare(${l1}, ${r1}, ${l2}, ${r2}): ${quote(text.slice(l1, r1))} against ${quote(text.slice(l2, r2))}. First their common prefix, by the same binary search, limited to the shorter length ${shorter}.`,
      );
      if (k === shorter) {
        result = Math.sign(len1 - len2);
        snap(
          L.cmpPrefix,
          `${naiveLcp(l1, l2) >= k ? `The first ${k} characters agree` : `The hashes say the first ${k} characters agree (a collision: they do not)`}, and that is all of the shorter one: ${len1 === len2 ? `both have length ${len1}, so they are equal: 0` : `${len1 < len2 ? 'the first' : 'the second'} is a prefix of the other, and a prefix comes first: ${result}`}.`,
          { extra: pairRows(l1, l2, len1, len2, k, true), table: searchTable(shorter, k, k), vars: [['k', k]] },
        );
      } else {
        const a = codes[l1 + k];
        const b = codes[l2 + k];
        result = a < b ? -1 : 1;
        snap(
          L.cmpChar,
          `${Math.min(naiveLcp(l1, l2), shorter) === k ? `The common prefix has length ${k}` : `The hashes put the common prefix at ${k} (a collision: it is really ${Math.min(naiveLcp(l1, l2), shorter)})`}, so the characters at offset ${k} decide: '${text[l1 + k]}' (${a}) ${a < b ? '<' : a > b ? '>' : '='} '${text[l2 + k]}' (${b}), and compare returns ${result}${a === b ? ', since only a smaller character gives -1' : ''}.`,
          { text: { [l1 + k]: 'active', [l2 + k]: 'active' }, extra: pairRows(l1, l2, len1, len2, k, true, k), table: searchTable(shorter, k, k), vars: [['k', k]] },
        );
      }
      results.push({ text: String(result) });
    } else {
      const { length } = op;
      const seen: number[] = [];
      const windows: Array<number | null> = Array.from({ length: n + 1 }, () => null);
      const windowRow = (at?: number, fresh?: boolean): ScanRow => ({
        kind: 'cells',
        label: `hash of ${length}`,
        offset: 1,
        cells: windows.slice(0, n - length + 1).map((x, k) => cellOf(x, k === at ? (fresh ? 'active' : 'compare') : undefined)),
      });
      for (let i = 0; i + length <= n; i++) {
        const v = get(i, i + length);
        windows[i] = v;
        const fresh = !seen.includes(v);
        if (fresh) seen.push(v);
        const twin = fresh ? -1 : windows.findIndex((x) => x === v);
        const twinNote =
          twin >= 0
            ? text.slice(twin, twin + length).join('') === text.slice(i, i + length).join('')
              ? ` Already in the set: ${quote(text.slice(i, i + length))} also starts at ${twin}.`
              : ` Already in the set from ${quote(text.slice(twin, twin + length))} at ${twin}, a different string: a collision, so the count will come out too small.`
            : ' A new value: the set grows.';
        snap(L.distinct, `Window ${i}: ${formula(i, i + length, v)}.${twinNote}`, {
          ...readRoles([[i, i + length]]),
          extra: [windowRow(i, fresh)],
          hashes: seen.map((x) => ({ text: String(x), role: x === v ? 'active' : undefined })),
          vars: [['i', i], ['set size', seen.length]],
        });
      }
      result = seen.length;
      results.push({ text: String(result) });
      const truth = new Set(Array.from({ length: n - length + 1 }, (_, i) => text.slice(i, i + length).join(''))).size;
      snap(
        L.distinct,
        `count_distinct(${length}) = ${result}: the set holds ${result} different hash${result === 1 ? '' : 'es'} for ${n - length + 1} window${n - length ? 's' : ''}.${truth !== result ? ` The true count is ${truth}: a collision merged two different substrings.` : ''}`,
        { extra: [windowRow()], hashes: seen.map((x) => ({ text: String(x) })), vars: [['set size', seen.length]] },
      );
    }
    runs.push({ op, calls, result });
  });

  current = ops.length;
  snap(undefined, ops.length ? `Done. Every query read only the two tables: get is O(1), and lcp and compare make O(log n) get calls.` : 'Done: the tables are built. Add queries such as "lcp 1 4" to use them.', {});
  return { frames, prefix: P, power: W, ops: runs };
}
