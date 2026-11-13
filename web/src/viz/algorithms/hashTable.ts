/**
 * Separate chaining tracers, drawn with ChainView: one row per bucket (a slot), the bucket's
 * list as a chain of nodes to its right.
 *
 * Mirrors three Python classes:
 *   'table' Data_Structures/Hashing/Hash_Table/Python/hash_table.py: HashTable.put / _resize / get / remove / contains
 *   'set'   Data_Structures/Hashing/Hash_Set/Python/hash_set.py: HashSet.add / _resize / remove / contains
 *   'fixed' Data_Structures/Hashing/Collision_Handling/Python/collision_handling.py: HashTableChaining.put / get / remove
 * _hash: an int key is key % capacity (Python's % is never negative for a positive capacity);
 * a str key runs h = (h * 31 + ord(c)) % capacity over its characters. A put / add that makes
 * size / capacity > 0.75 doubles the capacity and puts every pair again, bucket by bucket and
 * in chain order ('table' and 'set'; 'fixed' never resizes). Removing pops the pair out of its
 * list, so the pairs after it shift left.
 * Golden fixtures (__fixtures__/hashing.json) pin the buckets and the result of every operation.
 *
 * Input: "cap 4; put 5 a, put 9 b, get 9, remove 5"   (p, g, rm, has are short forms)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ChainLinkView, ChainNodeView, ChainState } from '../renderers/ChainView';
import type { StripItem } from '../ui/molecules/Strip';

export type HKey = number | string;
export type HVal = number | string;

/* ---------- keys, Python's _hash and the shared script syntax ---------- */

/** Python's a % m for m > 0: the result takes the sign of the divisor, so it is never negative. */
export function pyMod(a: number, m: number): number {
  return ((a % m) + m) % m;
}

/** The repository's _hash(key) for int and str keys (identical in every Python hashing class). */
export function pyHash(key: HKey, capacity: number): number {
  if (typeof key === 'number') return pyMod(key, capacity);
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.codePointAt(0)!) % capacity;
  return h;
}

/** A key as Python prints it inside a structure: a string that looks like a number keeps its quotes. */
export function fmtKey(key: HKey): string {
  return typeof key === 'string' && /^-?\d+$/.test(key) ? `'${key}'` : String(key);
}

/** A key as the code sees it in a sentence: strings in quotes, so 'cat' and 5 read differently. */
export function quoteKey(key: HKey): string {
  return typeof key === 'string' ? `'${key}'` : String(key);
}

/** Stable identity of a key: the int 5 and the string '5' are different keys. */
export function keyId(key: HKey): string {
  return typeof key === 'number' ? `n${key}` : `s${key}`;
}

/** The arithmetic of _hash(key), for captions: "13 % 8 = 5" or "h = (h*31 + ord(c)) % 8: c 3, a 6, t 6". */
export function hashText(key: HKey, capacity: number): string {
  if (typeof key === 'number') {
    const r = pyMod(key, capacity);
    return key < 0 ? `${key} % ${capacity} = ${r} (Python's % is never negative)` : `${key} % ${capacity} = ${r}`;
  }
  let h = 0;
  const parts: string[] = [];
  for (const ch of key) {
    h = (h * 31 + ch.codePointAt(0)!) % capacity;
    parts.push(`${ch} ${h}`);
  }
  return `h = (h*31 + ord(c)) % ${capacity} per character: ${parts.join(', ')}`;
}

/** Operations are separated by commas, semicolons or new lines; a comma inside "put(5, a)" is not a separator. */
export function scriptSegments(text: string): string[] {
  return text
    .split(/[;\n]|,(?![^(]*\))/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** "put 5 a" or "put(5, a)" -> { name: 'put', args: ['5', 'a'] }. */
export function parseCall(segment: string): { name: string; args: string[] } | null {
  const m = segment.match(/^([A-Za-z_]+)\s*(?:\(([^()]*)\)|\s+(.*))?$/);
  if (!m) return null;
  const rest = (m[2] ?? m[3] ?? '').trim();
  return { name: m[1].toLowerCase(), args: rest ? rest.split(/[\s,]+/).filter(Boolean) : [] };
}

/** "cap 8", "capacity = 8": the capacity, or undefined if the segment is something else. */
export function parseCapacity(segment: string): number | undefined {
  const m = segment.match(/^cap(?:acity)?\s*[:=]?\s*(-?\d+)$/i);
  return m ? Number(m[1]) : undefined;
}

/** An int key (-99..999), a word of letters / digits, or a quoted word ('5' is the string, 5 the int). */
export function parseKey(token: string, maxLen: number): HKey {
  const quoted = token.match(/^(['"])([A-Za-z0-9_]*)\1$/);
  const word = quoted ? quoted[2] : /^[A-Za-z_][A-Za-z0-9_]*$/.test(token) ? token : undefined;
  if (word !== undefined) {
    if (word.length === 0 || word.length > maxLen) throw new InputError(`Word keys have 1 to ${maxLen} letters or digits (got "${token}").`);
    // A string that looks like a number is drawn with its quotes, so it must leave room for them.
    if (fmtKey(word).length > maxLen) throw new InputError(`A string key made of digits is shown in quotes, so it may have at most ${maxLen - 2} digits (got "${token}").`);
    return word;
  }
  if (/^-?\d+$/.test(token)) {
    const v = Number(token) || 0; // "-0" is the int 0
    if (v < -99 || v > 999) throw new InputError(`Integer keys go from -99 to 999 (got ${token}).`);
    return v;
  }
  throw new InputError(`"${token}" is not a key: use an integer such as 17 or a short word such as cat.`);
}

/** A value: an integer (-99..999), or a word of up to 3 characters (stored as a str). */
export function parseValue(token: string): HVal {
  if (/^-?\d+$/.test(token)) {
    const v = Number(token) || 0;
    if (v < -99 || v > 999) throw new InputError(`Integer values go from -99 to 999 (got ${token}).`);
    return v;
  }
  if (/^[A-Za-z0-9_]{1,3}$/.test(token)) return token;
  throw new InputError(`"${token}" is not a value: use an integer or a word of up to 3 letters.`);
}

/** Python's repr of a stored value, for captions: 'a' or 10. */
export function reprValue(v: HVal | null): string {
  return v === null ? 'None' : typeof v === 'string' ? `'${v}'` : String(v);
}

/* ---------- input ---------- */

export type ChainMode = 'table' | 'set' | 'fixed';

export type ChainOp =
  | { kind: 'put'; key: HKey; value: HVal }
  | { kind: 'add'; key: HKey }
  | { kind: 'get'; key: HKey }
  | { kind: 'remove'; key: HKey }
  | { kind: 'contains'; key: HKey };

export interface ChainInput {
  mode: ChainMode;
  capacity: number;
  ops: ChainOp[];
}

const NAMES: Record<ChainMode, Record<string, ChainOp['kind']>> = {
  table: { put: 'put', p: 'put', set: 'put', get: 'get', g: 'get', remove: 'remove', rm: 'remove', del: 'remove', delete: 'remove', contains: 'contains', has: 'contains', in: 'contains' },
  set: { add: 'add', a: 'add', remove: 'remove', rm: 'remove', del: 'remove', delete: 'remove', discard: 'remove', contains: 'contains', has: 'contains', in: 'contains' },
  fixed: { put: 'put', p: 'put', set: 'put', get: 'get', g: 'get', remove: 'remove', rm: 'remove', del: 'remove', delete: 'remove' },
};

const EXAMPLE: Record<ChainMode, string> = {
  table: '"put 5 a", "get 5", "remove 5" or "contains 5"',
  set: '"add 5", "remove 5" or "contains 5"',
  fixed: '"put 5 a", "get 5" or "remove 5"',
};

/**
 * One bucket is one row of the picture. ChainView packs labelled rows tightly, so the player's
 * stage holds 16 buckets, the Python default: a table may have up to 16 buckets, and a
 * resizing table therefore holds at most 12 keys (the 13th would double it to 32).
 */
export const CHAIN_LIMITS = { maxCapacity: 16, maxOps: 30, maxKeys: 12, keyLength: 4 };

/** The capacity HashTable, HashSet and the collision-handling tables get when none is given. */
export const PYTHON_DEFAULT_CAPACITY = 16;

/**
 * Parse "cap 4; put 5 a, get 5". Without a capacity the table gets the Python default of 16
 * buckets. A resizing script may not grow past 16 buckets.
 */
export function parseChain(text: string, mode: ChainMode): ChainInput {
  let capacity: number | undefined;
  const ops: ChainOp[] = [];
  for (const segment of scriptSegments(text)) {
    const cap = parseCapacity(segment);
    if (cap !== undefined) {
      if (capacity !== undefined) throw new InputError('Give the capacity ("cap 8") only once.');
      if (cap <= 0) throw new InputError(`The constructor raises ValueError for capacity ${cap}: the capacity must be positive.`);
      if (cap > CHAIN_LIMITS.maxCapacity) throw new InputError(`Capacity goes up to ${CHAIN_LIMITS.maxCapacity} here, so every bucket fits on screen (got ${cap}).`);
      capacity = cap;
      continue;
    }
    const call = parseCall(segment);
    const kind = call && NAMES[mode][call.name];
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write operations like ${EXAMPLE[mode]}, separated by commas.`);
    const want = kind === 'put' ? 2 : 1;
    if (call.args.length !== want) {
      throw new InputError(kind === 'put' ? `"${segment}": put takes a key and a value, as in "put 5 a".` : `"${segment}": ${kind} takes one key, as in "${kind} 5".`);
    }
    const key = parseKey(call.args[0], CHAIN_LIMITS.keyLength);
    ops.push(kind === 'put' ? { kind, key, value: parseValue(call.args[1]) } : ({ kind, key } as ChainOp));
  }
  if (ops.length === 0) throw new InputError(`Add at least one operation, for example ${EXAMPLE[mode]}.`);
  if (ops.length > CHAIN_LIMITS.maxOps) throw new InputError(`At most ${CHAIN_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  const input: ChainInput = { mode, capacity: capacity ?? PYTHON_DEFAULT_CAPACITY, ops };
  // Replay the size and capacity rules on a plain set, so the picture stays a readable size.
  const live = new Set<string>();
  let cap = input.capacity;
  for (const op of ops) {
    if (op.kind === 'put' || op.kind === 'add') {
      if (live.has(keyId(op.key))) continue;
      live.add(keyId(op.key));
      if (live.size > CHAIN_LIMITS.maxKeys) throw new InputError(`At most ${CHAIN_LIMITS.maxKeys} keys in the table at once, so every chain fits on screen.`);
      if (mode !== 'fixed' && live.size / cap > 0.75) cap *= 2;
      if (cap > CHAIN_LIMITS.maxCapacity) {
        throw new InputError(
          `This script grows the table to ${cap} buckets, more than the ${CHAIN_LIMITS.maxCapacity} that fit on screen: keep at most ${Math.floor(0.75 * CHAIN_LIMITS.maxCapacity)} keys in it at once.`,
        );
      }
    } else if (op.kind === 'remove') {
      live.delete(keyId(op.key));
    }
  }
  return input;
}

export function formatChainOp(op: ChainOp): string {
  return op.kind === 'put' ? `put(${quoteKey(op.key)}, ${reprValue(op.value)})` : `${op.kind}(${quoteKey(op.key)})`;
}

/* ---------- pseudocode (one listing per Python class) ---------- */

interface ChainLines {
  hash: Partial<Record<ChainOp['kind'], number>>;
  compare: Partial<Record<ChainOp['kind'], number>>;
  hit: Partial<Record<ChainOp['kind'], number>>;
  miss: Partial<Record<ChainOp['kind'], number>>;
  append: number;
  check?: number;
  resize?: number;
  reput?: number;
  /** Back in put / add once _resize() has returned. */
  afterResize?: number;
}

export const CHAIN_CODE: Record<ChainMode, { lines: string[]; at: ChainLines }> = {
  table: {
    lines: [
      'put(key, value):',
      '  bucket = buckets[_hash(key)]       # int: key % capacity; str: h = (h*31 + ord(c)) % capacity',
      '  for i, (k, v) in enumerate(bucket):',
      '    if k == key: bucket[i] = (key, value); return   # update in place',
      '  bucket.append((key, value)); size += 1',
      '  if size / capacity > 0.75: _resize()',
      '_resize(): old_buckets = buckets; capacity *= 2',
      '  buckets = [[] for _ in range(capacity)]; size = 0',
      '  for bucket in old_buckets: for (k, v) in bucket: put(k, v)',
      'get(key, default=None) / contains(key):',
      '  for (k, v) in buckets[_hash(key)]:',
      '    if k == key: return v              # contains: True',
      '  return default                       # contains: False',
      'remove(key): bucket = buckets[_hash(key)]',
      '  for i, (k, v) in enumerate(bucket):',
      '    if k == key: bucket.pop(i); size -= 1; return True',
      '  return False',
    ],
    at: {
      hash: { put: 1, get: 10, contains: 10, remove: 13 },
      compare: { put: 3, get: 11, contains: 11, remove: 15 },
      hit: { put: 3, get: 11, contains: 11, remove: 15 },
      miss: { get: 12, contains: 12, remove: 16 },
      append: 4,
      check: 5,
      resize: 7,
      reput: 8,
      afterResize: 5,
    },
  },
  set: {
    lines: [
      'add(key):',
      '  bucket = buckets[_hash(key)]       # int: key % capacity; str: h = (h*31 + ord(c)) % capacity',
      '  if key in bucket: return False      # scans the chain',
      '  bucket.append(key); size += 1',
      '  if size / capacity > 0.75: _resize()',
      '  return True',
      '_resize(): old_buckets = buckets; capacity *= 2',
      '  buckets = [[] for _ in range(capacity)]; size = 0',
      '  for bucket in old_buckets: for key in bucket: add(key)',
      'remove(key): bucket = buckets[_hash(key)]',
      '  try: bucket.remove(key); size -= 1; return True',
      '  except ValueError: return False',
      'contains(key): return key in buckets[_hash(key)]',
    ],
    at: {
      hash: { add: 1, remove: 9, contains: 12 },
      compare: { add: 2, remove: 10, contains: 12 },
      hit: { add: 2, remove: 10, contains: 12 },
      miss: { remove: 11, contains: 12 },
      append: 3,
      check: 4,
      resize: 7,
      reput: 8,
      afterResize: 5,
    },
  },
  fixed: {
    lines: [
      'put(key, value):',
      '  bucket = buckets[_hash(key)]       # int: key % capacity; str: h = (h*31 + ord(c)) % capacity',
      '  for i, (k, v) in enumerate(bucket):',
      '    if k == key: bucket[i] = (key, value); return',
      '  bucket.append((key, value)); size += 1   # never resizes',
      'get(key):',
      '  for (k, v) in buckets[_hash(key)]:',
      '    if k == key: return v',
      '  return None',
      'remove(key): bucket = buckets[_hash(key)]',
      '  for i, (k, v) in enumerate(bucket):',
      '    if k == key: bucket.pop(i); size -= 1; return True',
      '  return False',
    ],
    at: {
      hash: { put: 1, get: 6, remove: 9 },
      compare: { put: 3, get: 7, remove: 11 },
      hit: { put: 3, get: 7, remove: 11 },
      miss: { get: 8, remove: 12 },
      append: 4,
    },
  },
};

/* ---------- tracer ---------- */

interface Pair {
  key: HKey;
  value: HVal;
}

export type ChainResult = HVal | boolean | null;

export interface ChainStep {
  op: ChainOp;
  /** put: null (None); get: the value or null; remove / contains / add: a boolean. */
  result: ChainResult;
  capacity: number;
  size: number;
  /** Bucket contents after the operation: [key, value] pairs ('table', 'fixed') or keys ('set'). */
  buckets: Array<Array<[HKey, HVal]>> | HKey[][];
  resized: boolean;
}

export interface ChainRun {
  frames: Array<Frame<ChainState>>;
  steps: ChainStep[];
}

/** A removed or not-yet-moved pair drawn outside the live buckets. */
interface Loose {
  pair: Pair;
  row: number;
  col: number;
  role: Role;
  ghost?: boolean;
  /** Draw a link from the previous loose node of the same row (an old chain during a resize). */
  linked?: boolean;
}

interface SnapOpts {
  nodes?: Record<string, Role>;
  slots?: Record<number, Role>;
  lanes?: Record<number, Role>;
  links?: Record<string, Role>;
  /** Pairs at index >= from of this bucket are drawn `by` columns further right (a gap before a shift). */
  gap?: { bucket: number; from: number; by: number };
  loose?: Loose[];
  vars?: Array<[string, string | number]>;
}

const slotId = (b: number) => `b${b}`;
const pairId = (key: HKey) => `k:${keyId(key)}`;

export function chainTrace(input: ChainInput): ChainRun {
  const { mode, ops } = input;
  const at = CHAIN_CODE[mode].at;
  const isSet = mode === 'set';
  let capacity = input.capacity;
  let size = 0;
  let buckets: Pair[][] = Array.from({ length: capacity }, () => []);
  let current = -1;
  /** Work so far: every key comparison, and every pair a resize put again (the amortized cost). */
  let compares = 0;
  let rehashed = 0;
  const frames: Array<Frame<ChainState>> = [];
  const steps: ChainStep[] = [];
  const label = (p: Pair) => (isSet ? fmtKey(p.key) : `${fmtKey(p.key)}:${p.value}`);
  const pairText = (p: Pair) => (isSet ? quoteKey(p.key) : `(${quoteKey(p.key)}, ${reprValue(p.value)})`);
  const load = () => `${size}/${capacity} = ${(size / capacity).toFixed(2)}`;

  const opStrip = () => ({
    label: 'Operations',
    items: ops.map((op, i): StripItem => ({ text: formatChainOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  });

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const nodes: ChainNodeView[] = [];
    const links: ChainLinkView[] = [];
    for (let b = 0; b < capacity; b++) {
      const sid = slotId(b);
      nodes.push({ id: sid, label: '', col: 0, row: b, shape: 'slot', role: o.slots?.[b] ?? 'idle' });
      let prev = sid;
      buckets[b].forEach((p, j) => {
        const id = pairId(p.key);
        const shift = o.gap && o.gap.bucket === b && j >= o.gap.from ? o.gap.by : 0;
        nodes.push({ id, label: label(p), col: j + 1 + shift, row: b, role: o.nodes?.[id] ?? 'idle' });
        links.push({ from: prev, to: id, role: o.links?.[id] });
        prev = id;
      });
    }
    let prevLoose: Loose | undefined;
    for (const l of o.loose ?? []) {
      const id = pairId(l.pair.key);
      nodes.push({ id, label: label(l.pair), col: l.col, row: l.row, role: l.role, ghost: l.ghost });
      if (l.linked && prevLoose && prevLoose.row === l.row) links.push({ from: pairId(prevLoose.pair.key), to: id, role: 'muted' });
      prevLoose = l;
    }
    frames.push({
      line,
      caption,
      vars: [
        ...(o.vars ?? []),
        ['size', size],
        ['capacity', capacity],
        ['load factor', load()],
        ['key compares so far', compares],
        ...(mode === 'fixed' ? [] : [['moved by resizes', rehashed] as [string, number]]),
      ],
      state: {
        nodes,
        links,
        lanes: Array.from({ length: capacity }, (_, b) => ({ row: b, label: `bucket ${b}`, role: o.lanes?.[b] })),
        strips: [opStrip()],
      },
    });
  };

  const dump = (): ChainStep['buckets'] =>
    isSet ? buckets.map((bk) => bk.map((p) => p.key)) : buckets.map((bk) => bk.map((p): [HKey, HVal] => [p.key, p.value]));

  /** Roles for walking a chain up to position j: links into nodes before j are compare. */
  const walked = (b: number, j: number, role: Role) => {
    const nodes: Record<string, Role> = {};
    const links: Record<string, Role> = {};
    for (let t = 0; t <= j; t++) links[pairId(buckets[b][t].key)] = 'compare';
    nodes[pairId(buckets[b][j].key)] = role;
    return { nodes, links };
  };

  /** _resize(): double the capacity and put every pair again, old bucket by old bucket. */
  const resize = (opVars: Array<[string, string | number]>) => {
    const old = buckets;
    const oldCap = capacity;
    capacity *= 2;
    buckets = Array.from({ length: capacity }, () => []);
    size = 0;
    const total = old.reduce((s, bk) => s + bk.length, 0);
    const pending = (fromBucket: number, fromIndex: number): Loose[] =>
      old.flatMap((bk, b) =>
        bk.flatMap((p, j): Loose[] => (b > fromBucket || (b === fromBucket && j >= fromIndex) ? [{ pair: p, row: b, col: j + 1, role: 'muted', linked: true }] : [])),
      );
    snap(
      at.resize,
      `Resize: old_buckets keeps the ${oldCap} old chains, the capacity doubles to ${capacity} and buckets becomes ${capacity} empty lists (size 0). ` +
        `Every ${isSet ? 'key' : 'pair'} must be ${isSet ? 'added' : 'put'} again, because its hash is now taken % ${capacity} instead of % ${oldCap}.`,
      { loose: pending(0, 0), vars: opVars },
    );
    let moved = 0;
    old.forEach((bk, b) => {
      bk.forEach((p, j) => {
        const nb = pyHash(p.key, capacity);
        // put(k, v) / add(key) walks bucket nb; no key there can match, because keys are unique.
        compares += buckets[nb].length;
        buckets[nb].push(p);
        size += 1;
        moved += 1;
        rehashed += 1;
        const id = pairId(p.key);
        const where = nb === b ? `stays in bucket ${b}` : `moves from bucket ${b} to bucket ${nb}`;
        snap(
          at.reput,
          `${isSet ? `add(${quoteKey(p.key)})` : `put${pairText(p)}`} again (${moved} of ${total}): ${hashText(p.key, capacity)}, so it ${where}` +
            (buckets[nb].length > 1 ? `, appended after ${buckets[nb].length - 1} ${isSet ? 'key' : 'pair'}${buckets[nb].length > 2 ? 's' : ''} already there.` : '.'),
          { nodes: { [id]: 'active' }, links: { [id]: 'active' }, slots: { [nb]: 'compare' }, lanes: { [nb]: 'compare' }, loose: pending(b, j + 1), vars: [...opVars, ['rehash', `${fmtKey(p.key)} -> bucket ${nb}`]] },
        );
      });
    });
    const longest = Math.max(...buckets.map((bk) => bk.length));
    snap(
      at.afterResize,
      `Resize done: ${size} ${isSet ? 'keys' : 'pairs'} in ${capacity} buckets, load ${load()}. The longest chain now has ${longest}, so a lookup compares at most ${longest} key${longest === 1 ? '' : 's'}.`,
      { vars: opVars },
    );
  };

  snap(
    undefined,
    `${mode === 'table' ? 'HashTable' : mode === 'set' ? 'HashSet' : 'HashTableChaining'}(${capacity}): ${capacity} empty buckets. ` +
      `A key lives in bucket _hash(key), and keys that collide share that bucket's chain (separate chaining).` +
      (mode === 'fixed' ? ' This table never resizes, so chains just grow.' : ' When size / capacity passes 0.75 the table doubles.'),
  );

  ops.forEach((op, i) => {
    current = i;
    const name = formatChainOp(op);
    const b = pyHash(op.key, capacity);
    const bucket = buckets[b];
    const opVars: Array<[string, string | number]> = [['op', name]];
    const hv: Array<[string, string | number]> = [...opVars, ['_hash(key)', b]];
    const k = quoteKey(op.key);
    let result: ChainResult = null;
    let resized = false;

    snap(
      at.hash[op.kind],
      `${name}: ${hashText(op.key, capacity)}, so ${k} belongs in bucket ${b}. ` +
        (bucket.length === 0 ? 'That bucket is empty: there is no key to compare.' : `Walk its chain of ${bucket.length} and compare keys.`),
      { slots: { [b]: 'compare' }, lanes: { [b]: 'compare' }, vars: hv },
    );

    // Walk the chain: Python compares each stored key with == until one matches.
    let found = -1;
    for (let j = 0; j < bucket.length; j++) {
      const p = bucket[j];
      compares += 1;
      if (p.key === op.key) {
        found = j;
        break;
      }
      snap(at.compare[op.kind], `Compare ${quoteKey(p.key)} with ${k}: different keys, so move to the next ${isSet ? 'key' : 'pair'} in the chain.`, {
        ...walked(b, j, 'compare'),
        slots: { [b]: 'compare' },
        lanes: { [b]: 'compare' },
        vars: [...hv, ['position', j]],
      });
    }
    const hitVars: Array<[string, string | number]> = [...hv, ['position', found]];

    if (op.kind === 'put' || op.kind === 'add') {
      if (found >= 0) {
        const p = bucket[found];
        if (op.kind === 'put') {
          const before = p.value;
          p.value = op.value;
          snap(
            at.hit.put,
            `${k} matches the key at position ${found}: replace its value ${reprValue(before)} with ${reprValue(op.value)}. A key is stored once, so size stays ${size} and put returns before the resize check.`,
            { ...walked(b, found, 'good'), slots: { [b]: 'compare' }, lanes: { [b]: 'compare' }, vars: hitVars },
          );
          result = null;
        } else {
          snap(at.hit.add, `${k} matches the key at position ${found}: it is already in the set, so add returns False and nothing changes.`, {
            ...walked(b, found, 'good'),
            slots: { [b]: 'compare' },
            lanes: { [b]: 'compare' },
            vars: hitVars,
          });
          result = false;
        }
      } else {
        const p: Pair = { key: op.key, value: op.kind === 'put' ? op.value : 0 };
        bucket.push(p);
        size += 1;
        const grow = mode !== 'fixed' && size / capacity > 0.75;
        const tail =
          mode === 'fixed'
            ? ` size = ${size}. This table never resizes, so the chain just grows.`
            : grow
              ? ` size = ${size}, and ${load()} > 0.75, so the table must resize.`
              : ` size = ${size}, and ${load()} is not above 0.75, so no resize.`;
        snap(
          grow ? at.check : at.append,
          `${k} is not in bucket ${b}: append ${pairText(p)} at the end of its chain${bucket.length > 1 ? `, after ${bucket.length - 1} colliding ${isSet ? 'key' : 'pair'}${bucket.length > 2 ? 's' : ''}` : ''}.${tail}`,
          { nodes: { [pairId(p.key)]: 'active' }, links: { [pairId(p.key)]: 'active' }, slots: { [b]: 'compare' }, lanes: { [b]: 'compare' }, vars: hv },
        );
        if (grow) {
          resize(opVars);
          resized = true;
        }
        result = op.kind === 'put' ? null : true;
      }
    } else if (op.kind === 'get' || op.kind === 'contains') {
      if (found >= 0) {
        const p = bucket[found];
        result = op.kind === 'get' ? p.value : true;
        snap(
          at.hit[op.kind],
          op.kind === 'get'
            ? `${k} matches the key at position ${found}: get returns its value ${reprValue(p.value)}. Only bucket ${b} was searched.`
            : `${k} matches the key at position ${found}: contains returns True. Only bucket ${b} was searched.`,
          { ...walked(b, found, 'good'), slots: { [b]: 'compare' }, lanes: { [b]: 'compare' }, vars: hitVars },
        );
      } else {
        result = op.kind === 'get' ? null : false;
        snap(
          at.miss[op.kind],
          `${bucket.length === 0 ? `Bucket ${b} is empty` : `The chain of bucket ${b} ended`} without ${k}. ` +
            (op.kind === 'get' ? 'get returns None (the default).' : 'contains returns False.') +
            ` No other bucket can hold ${k}, so the search stops here.`,
          { slots: { [b]: 'bad' }, lanes: { [b]: 'bad' }, vars: hv },
        );
      }
    } else {
      // remove
      if (found >= 0) {
        const p = bucket[found];
        snap(at.hit.remove, `${k} matches the key at position ${found}: this is the ${isSet ? 'element' : 'pair'} to remove.`, {
          ...walked(b, found, 'good'),
          slots: { [b]: 'compare' },
          lanes: { [b]: 'compare' },
          vars: hitVars,
        });
        bucket.splice(found, 1);
        size -= 1;
        const after = bucket.length - found;
        snap(
          at.hit.remove,
          `${isSet ? 'bucket.remove(key)' : `bucket.pop(${found})`} takes it out of the chain: size = ${size}, and remove returns True.` +
            (after > 0 ? ` The ${after} ${isSet ? 'key' : 'pair'}${after > 1 ? 's' : ''} after it still have to close the gap.` : ''),
          {
            gap: { bucket: b, from: found, by: 1 },
            loose: [{ pair: p, row: b, col: found + 1, role: 'bad', ghost: true }],
            slots: { [b]: 'compare' },
            lanes: { [b]: 'compare' },
            links: after > 0 ? { [pairId(bucket[found].key)]: 'active' } : {},
            vars: hitVars,
          },
        );
        if (after > 0) {
          const moved: Record<string, Role> = {};
          for (let t = found; t < bucket.length; t++) moved[pairId(bucket[t].key)] = 'active';
          snap(
            at.hit.remove,
            `Removing from a Python list shifts every later element one place to the left: ${after} ${isSet ? 'key' : 'pair'}${after > 1 ? 's' : ''} move. The chain is one shorter.`,
            { nodes: moved, slots: { [b]: 'compare' }, lanes: { [b]: 'compare' }, vars: hitVars },
          );
        }
        result = true;
      } else {
        result = false;
        snap(
          at.miss.remove,
          isSet
            ? `bucket.remove(${k}) raises ValueError, because ${k} is not in bucket ${b}. remove catches it and returns False.`
            : `${bucket.length === 0 ? `Bucket ${b} is empty` : `The chain of bucket ${b} ended`} without ${k}: remove returns False.`,
          { slots: { [b]: 'bad' }, lanes: { [b]: 'bad' }, vars: hv },
        );
      }
    }
    steps.push({ op, result, capacity, size, buckets: dump(), resized });
  });

  current = ops.length;
  const longest = Math.max(0, ...buckets.map((bk) => bk.length));
  const used = buckets.filter((bk) => bk.length > 0).length;
  snap(
    undefined,
    `Done: ${size} ${isSet ? 'key' : 'pair'}${size === 1 ? '' : 's'} in ${capacity} buckets (load ${(size / capacity).toFixed(2)}), ${used} bucket${used === 1 ? '' : 's'} in use. ` +
      `The longest chain has ${longest}, so the slowest lookup compares ${longest} key${longest === 1 ? '' : 's'}.`,
  );
  return { frames, steps };
}
