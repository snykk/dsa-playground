/**
 * LRU and LFU cache tracers, drawn with ChainView.
 *
 * LRU mirrors Data_Structures/Advanced_Structures/LRU_Cache/Python/lru_cache.py (LRUCache.get / put,
 * _remove, _add_to_front): a dict from key to node plus a doubly linked list between a head and a
 * tail sentinel, most recently used first. get and put move the node right after head; a put that
 * makes len(cache) > capacity removes tail.prev. Capacity 0 (or less) stores nothing: the new
 * node is inserted and evicted at once.
 *
 * LFU mirrors Data_Structures/Advanced_Structures/LFU_Cache/Python/lfu_cache.py (LFUCache.get / put /
 * _promote): key_to_val[key] = (value, freq), one OrderedDict per frequency (LRU first, MRU last)
 * and min_freq. A use moves the key to the MRU end of bucket freq + 1 and deletes an emptied
 * bucket; a full cache evicts popitem(last=False) of bucket min_freq, so on a tie the least
 * recently used key of the lowest frequency leaves. Capacity 0 makes get and put no-ops.
 *
 * Golden fixtures (__fixtures__/hashing.json) pin the get results, the eviction order and the
 * list / bucket contents after every operation.
 *
 * Input: "cap 2; put 1 10, put 2 20, get 1, put 3 30"   (p and g are short forms)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ChainLinkView, ChainNodeView, ChainPointerView, ChainState } from '../renderers/ChainView';
import type { StripItem } from '../ui/molecules/Strip';
import { parseCall, parseCapacity, scriptSegments } from './hashTable';

export type CacheOp = { kind: 'put'; key: number; value: number } | { kind: 'get'; key: number };

export interface CacheInput {
  capacity: number;
  ops: CacheOp[];
}

export type CachePolicy = 'lru' | 'lfu';

/** LFU draws one row per use count, and the player draws a picture at most 440px tall: 4 rows fit. */
export const CACHE_LIMITS = { lru: 4, lfu: 4, maxOps: 30 };

function int(token: string, lo: number, hi: number, what: string): number {
  if (!/^-?\d+$/.test(token)) throw new InputError(`"${token}" is not an integer: ${what} are integers.`);
  const v = Number(token) || 0;
  if (v < lo || v > hi) throw new InputError(`${what[0].toUpperCase()}${what.slice(1)} go from ${lo} to ${hi} (got ${token}).`);
  return v;
}

/** Parse "cap 2; put 1 10, get 1". Keys and values are integers, as in the repository's API. */
export function parseCache(text: string, policy: CachePolicy): CacheInput {
  let capacity: number | undefined;
  const ops: CacheOp[] = [];
  const maxCap = CACHE_LIMITS[policy];
  for (const segment of scriptSegments(text)) {
    const cap = parseCapacity(segment);
    if (cap !== undefined) {
      if (capacity !== undefined) throw new InputError('Give the capacity ("cap 2") only once.');
      if (cap < 0) {
        throw new InputError(
          policy === 'lfu'
            ? `LFUCache(${cap}) raises ValueError: capacity must be non-negative.`
            : `Use a capacity from 0 to ${maxCap}. (LRUCache(${cap}) is accepted by the code and behaves like capacity 0: it stores nothing.)`,
        );
      }
      if (cap > maxCap) throw new InputError(`Capacity goes up to ${maxCap} here, so the whole cache fits on screen (got ${cap}).`);
      capacity = cap;
      continue;
    }
    const call = parseCall(segment);
    const kind = call && ({ put: 'put', p: 'put', get: 'get', g: 'get' } as const)[call.name as 'put'];
    if (!call || !kind) throw new InputError(`Cannot read "${segment}". Write operations like "put 1 10" or "get 1", separated by commas.`);
    if (kind === 'put') {
      if (call.args.length !== 2) throw new InputError(`"${segment}": put takes a key and a value, as in "put 1 10".`);
      ops.push({ kind, key: int(call.args[0], -99, 999, 'keys'), value: int(call.args[1], -999, 9999, 'values') });
    } else {
      if (call.args.length !== 1) throw new InputError(`"${segment}": get takes one key, as in "get 1".`);
      ops.push({ kind, key: int(call.args[0], -99, 999, 'keys') });
    }
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, for example "cap 2; put 1 10, get 1".');
  if (ops.length > CACHE_LIMITS.maxOps) throw new InputError(`At most ${CACHE_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  return { capacity: capacity ?? 2, ops };
}

export function formatCacheOp(op: CacheOp): string {
  return op.kind === 'put' ? `put(${op.key}, ${op.value})` : `get(${op.key})`;
}

const nodeId = (key: number) => `k${key}`;

function opStripOf(ops: CacheOp[], current: number) {
  return {
    label: 'Operations',
    items: ops.map((op, i): StripItem => ({ text: formatCacheOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  };
}

/* ---------- LRU ---------- */

export const LRU_CODE = [
  'get(key):',
  '  if key not in cache: return -1',
  '  node = cache[key]                     # the dict points at the node',
  '  _remove(node); _add_to_front(node); return node.value',
  'put(key, value):',
  '  if key in cache: node = cache[key]; node.value = value',
  '    _remove(node); _add_to_front(node); return',
  '  node = Node(key, value); cache[key] = node',
  '  _add_to_front(node)',
  '  if len(cache) > capacity:',
  '    lru = tail.prev                     # least recently used',
  '    _remove(lru); del cache[lru.key]',
  '_remove(node): node.prev.next = node.next; node.next.prev = node.prev',
  '_add_to_front(node): node.prev = head; node.next = head.next',
  '  head.next.prev = node; head.next = node',
];

const LRU = { miss: 1, lookup: 2, update: 5, create: 7, check: 9, victim: 10, evict: 11, unlink: 12, front: 13 };

export interface LruStep {
  op: CacheOp;
  /** get: the value or -1; put: null. */
  result: number | null;
  /** [key, value] from the most to the least recently used. */
  order: Array<[number, number]>;
  /** The dict's keys in insertion order. */
  dict: number[];
  evicted: number | null;
}

export interface CacheRun<S> {
  frames: Array<Frame<ChainState>>;
  steps: S[];
}

interface LruSnap {
  roles?: Record<string, Role>;
  /** List positions >= gapAt are drawn one column further right: the hole an unlinked node left. */
  gapAt?: number;
  /** A node off the list: lifted below its column (unlinked, new, or being evicted). */
  lifted?: { key: number; col: number; role: Role; ghost?: boolean; prev?: string | null; next?: string | null };
  pointers?: ChainPointerView[];
  dictRoles?: Record<number, Role>;
  /** A key looked up but absent, shown at the end of the dict strip. */
  missing?: number;
  vars?: Array<[string, string | number]>;
}

export function lruTrace({ capacity, ops }: CacheInput): CacheRun<LruStep> {
  /** The list between the sentinels, most recently used first. */
  let list: number[] = [];
  const values = new Map<number, number>();
  /** The dict: its keys in insertion order (a Map keeps that order, like a Python dict). */
  const dict = new Map<number, true>();
  let current = -1;
  let hits = 0;
  let misses = 0;
  const frames: Array<Frame<ChainState>> = [];
  const steps: LruStep[] = [];

  const snap = (line: number | undefined, caption: string, o: LruSnap = {}) => {
    const gap = (i: number) => (o.gapAt !== undefined && i >= o.gapAt ? 1 : 0);
    const nodes: ChainNodeView[] = [{ id: 'head', label: 'head', col: 0, sentinel: true }];
    list.forEach((key, i) => nodes.push({ id: nodeId(key), label: `${key}:${values.get(key)}`, col: i + 1 + gap(i), role: o.roles?.[nodeId(key)] ?? 'idle' }));
    nodes.push({ id: 'tail', label: 'tail', col: list.length + 1 + gap(list.length), sentinel: true });
    const links: ChainLinkView[] = [];
    for (let i = 0; i + 1 < nodes.length; i++) {
      links.push({ from: nodes[i].id, to: nodes[i + 1].id });
      links.push({ from: nodes[i + 1].id, to: nodes[i].id, kind: 'prev' });
    }
    if (o.lifted) {
      const { key, col, role, ghost, prev, next } = o.lifted;
      const id = nodeId(key);
      nodes.push({ id, label: `${key}:${values.get(key)}`, col, row: 0.8, role, ghost });
      if (next) links.push({ from: id, to: next, role: 'muted' });
      if (prev) links.push({ from: id, to: prev, kind: 'prev', role: 'muted' });
    }
    const size = dict.size;
    frames.push({
      line,
      caption,
      vars: [
        ...(o.vars ?? []),
        ['len(cache)', size],
        ['hits / misses', `${hits} / ${misses}`],
        ['capacity', capacity],
        ['MRU (head.next)', list.length ? list[0] : 'tail'],
        ['LRU (tail.prev)', list.length ? list[list.length - 1] : 'head'],
      ],
      state: {
        nodes,
        links,
        pointers: o.pointers,
        note: 'Most recently used next to head, least recently used next to tail.',
        strips: [
          {
            label: 'cache (dict)',
            items: [
              ...[...dict.keys()].map((k): StripItem => ({ text: o.dictRoles?.[k] === 'bad' ? `${k} evicted` : `${k}`, role: o.dictRoles?.[k] })),
              ...(o.missing !== undefined ? [{ text: `${o.missing} missing`, role: 'bad' as Role }] : []),
            ],
          },
          opStripOf(ops, current),
        ],
      },
    });
  };

  /** _remove then _add_to_front, one frame each. */
  const moveToFront = (key: number, why: string, opVars: Array<[string, string | number]>, ret: string) => {
    const at = list.indexOf(key);
    const prev = at === 0 ? 'head' : nodeId(list[at - 1]);
    const next = at === list.length - 1 ? 'tail' : nodeId(list[at + 1]);
    list.splice(at, 1);
    snap(
      LRU.unlink,
      `_remove(node): node.prev.next = node.next and node.next.prev = node.prev unlink ${key} in O(1), with no search. ` +
        `It still points at its old neighbours, but nothing points at it.${at === 0 ? ' (It was already first; the code moves it anyway.)' : ''}`,
      { gapAt: at, lifted: { key, col: at + 1, role: 'active', prev, next }, pointers: [{ name: 'node', target: nodeId(key), role: 'active', side: 'below' }], vars: opVars },
    );
    list.unshift(key);
    snap(LRU.front, `_add_to_front(node): ${key} goes right after the head sentinel, ${why}. The others keep their order.${ret}`, {
      roles: { [nodeId(key)]: 'active' },
      pointers: [{ name: 'node', target: nodeId(key), role: 'active' }],
      dictRoles: { [key]: 'compare' },
      vars: opVars,
    });
  };

  snap(
    undefined,
    `LRUCache(${capacity}): an empty dict and an empty list between two sentinel nodes, head and tail. ` +
      (capacity > 0 ? `It holds at most ${capacity} key${capacity === 1 ? '' : 's'}; a put that goes over evicts the least recently used one.` : 'With capacity 0 every new key is evicted as soon as it is inserted.'),
  );

  ops.forEach((op, n) => {
    current = n;
    const name = formatCacheOp(op);
    const opVars: Array<[string, string | number]> = [['op', name]];
    const { key } = op;
    let result: number | null = null;
    let evicted: number | null = null;
    if (op.kind === 'get') {
      if (!dict.has(key)) {
        result = -1;
        misses += 1;
        snap(LRU.miss, `${name}: ${key} is not a key of the dict, so get returns -1. A miss changes nothing.`, { missing: key, vars: opVars });
      } else {
        result = values.get(key)!;
        hits += 1;
        snap(LRU.lookup, `${name}: the dict maps ${key} straight to its node, wherever it sits in the list: no walk. Reading it is a use, so it moves to the front.`, {
          roles: { [nodeId(key)]: 'compare' },
          pointers: [{ name: 'node', target: nodeId(key), role: 'compare' }],
          dictRoles: { [key]: 'compare' },
          vars: opVars,
        });
        moveToFront(key, 'the most recently used end', opVars, ` get returns ${result}.`);
      }
    } else if (dict.has(key)) {
      const before = values.get(key)!;
      values.set(key, op.value);
      snap(LRU.update, `${name}: ${key} is cached, so update the value in its node (${before} becomes ${op.value}) without adding a node. An update is a use: move it to the front.`, {
        roles: { [nodeId(key)]: 'active' },
        pointers: [{ name: 'node', target: nodeId(key), role: 'active' }],
        dictRoles: { [key]: 'compare' },
        vars: opVars,
      });
      moveToFront(key, 'the most recently used end', opVars, ' size is unchanged.');
    } else {
      values.set(key, op.value);
      dict.set(key, true);
      snap(LRU.create, `${name}: ${key} is new. Create a node for it and register it in the dict, cache[${key}] = node.`, {
        lifted: { key, col: 1, role: 'active', prev: null, next: null },
        pointers: [{ name: 'node', target: nodeId(key), role: 'active', side: 'below' }],
        dictRoles: { [key]: 'active' },
        vars: opVars,
      });
      list.unshift(key);
      const over = dict.size > capacity;
      snap(
        LRU.front,
        `_add_to_front(node): ${key} goes right after head, the most recently used end. len(cache) = ${dict.size}` +
          (over ? `, more than the capacity ${capacity}: one key must go.` : `, within the capacity ${capacity}.`),
        { roles: { [nodeId(key)]: 'active' }, pointers: [{ name: 'node', target: nodeId(key), role: 'active' }], vars: opVars },
      );
      if (over) {
        const victim = list[list.length - 1];
        snap(
          LRU.victim,
          `len(cache) = ${dict.size} > capacity ${capacity}: evict tail.prev, the node just before the tail sentinel. That is ${victim}, ` +
            (victim === key ? 'the node just added: a cache of capacity 0 keeps nothing.' : 'the least recently used key.'),
          { roles: { [nodeId(victim)]: 'bad' }, pointers: [{ name: 'lru', target: nodeId(victim), role: 'bad' }], dictRoles: { [victim]: 'bad' }, vars: opVars },
        );
        const at = list.length - 1;
        const prev = at === 0 ? 'head' : nodeId(list[at - 1]);
        list.pop();
        dict.delete(victim);
        evicted = victim;
        snap(
          LRU.evict,
          `_remove(lru) unlinks ${victim}, and del cache[lru.key] drops its dict entry. The node stores its key exactly so that eviction can find the dict entry to delete. len(cache) = ${dict.size}.`,
          { lifted: { key: victim, col: at + 1, role: 'bad', ghost: true, prev, next: 'tail' }, vars: opVars },
        );
        values.delete(victim);
      }
    }
    steps.push({ op, result, order: list.map((k): [number, number] => [k, values.get(k)!]), dict: [...dict.keys()], evicted });
  });

  current = ops.length;
  snap(
    undefined,
    list.length
      ? `Done: ${list.length} key${list.length === 1 ? '' : 's'} cached, from most to least recently used: ${list.join(', ')}. ` +
          (list.length >= capacity ? `The next new key would evict ${list[list.length - 1]}.` : `There is room for ${capacity - list.length} more.`)
      : 'Done: the cache is empty.',
  );
  return { frames, steps };
}

/* ---------- LFU ---------- */

export const LFU_CODE = [
  'get(key):',
  '  if capacity == 0 or key not in key_to_val: return -1',
  '  _promote(key); return key_to_val[key][0]',
  'put(key, value):',
  '  if capacity == 0: return',
  '  if key in key_to_val: key_to_val[key] = (value, freq); _promote(key); return',
  '  if size >= capacity:',
  '    evict_key, _ = freq_to_keys[min_freq].popitem(last=False)   # LRU end',
  '    del key_to_val[evict_key]; drop the bucket if empty; size -= 1',
  '  key_to_val[key] = (value, 1); freq_to_keys[1][key] = value',
  '  min_freq = 1; size += 1',
  '_promote(key): value, freq = key_to_val[key]',
  '  del freq_to_keys[freq][key]',
  '  if not freq_to_keys[freq]: del freq_to_keys[freq]; if min_freq == freq: min_freq += 1',
  '  freq_to_keys[freq + 1][key] = value      # MRU end',
  '  key_to_val[key] = (value, freq + 1)',
];

const LFU = { miss: 1, hit: 2, zero: 4, update: 5, victim: 7, evict: 8, insert: 9, take: 12, drop: 13, land: 14 };

export interface LfuStep {
  op: CacheOp;
  result: number | null;
  /** [freq, [[key, value], ...] from the least to the most recently used], by increasing freq. */
  buckets: Array<[number, Array<[number, number]>]>;
  /** key_to_val in insertion order: [key, value, freq]. */
  keyToVal: Array<[number, number, number]>;
  minFreq: number;
  size: number;
  evicted: number | null;
}

interface LfuSnap {
  roles?: Record<string, Role>;
  /** A key between two rows: leaving one bucket for the next, or evicted (then its value is passed in). */
  lifted?: { key: number; row: number; col: number; role: Role; ghost?: boolean; value?: number };
  pointers?: ChainPointerView[];
  dictRoles?: Record<number, Role>;
  missing?: number;
  vars?: Array<[string, string | number]>;
}

export function lfuTrace({ capacity, ops }: CacheInput): CacheRun<LfuStep> {
  const keyToVal = new Map<number, { value: number; freq: number }>();
  /** freq -> keys, least recently used first (the OrderedDict's order). */
  const freqToKeys = new Map<number, number[]>();
  let minFreq = 0;
  let size = 0;
  let current = -1;
  let hits = 0;
  let misses = 0;
  const frames: Array<Frame<ChainState>> = [];
  const steps: LfuStep[] = [];

  const freqs = () => [...freqToKeys.keys()].sort((a, b) => a - b);
  const rowOf = (f: number) => freqs().filter((g) => g < f).length;

  const snap = (line: number | undefined, caption: string, o: LfuSnap = {}) => {
    const nodes: ChainNodeView[] = [];
    const links: ChainLinkView[] = [];
    const lanes = freqs().map((f, row) => {
      const keys = freqToKeys.get(f)!;
      keys.forEach((key, col) => {
        nodes.push({ id: nodeId(key), label: `${key}:${keyToVal.get(key)!.value}`, col, row, role: o.roles?.[nodeId(key)] ?? 'idle' });
        if (col > 0) links.push({ from: nodeId(keys[col - 1]), to: nodeId(key) });
      });
      return { row, label: f === minFreq ? `freq ${f} min` : `freq ${f}`, role: (f === minFreq ? 'done' : undefined) as Role | undefined };
    });
    if (o.lifted) {
      const { key, row, col, role, ghost, value } = o.lifted;
      nodes.push({ id: nodeId(key), label: `${key}:${value ?? keyToVal.get(key)!.value}`, col, row, role, ghost });
    }
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['size', size], ['capacity', capacity], ['min_freq', minFreq], ['hits / misses', `${hits} / ${misses}`]],
      state: {
        nodes,
        links,
        lanes,
        pointers: o.pointers,
        note: 'One row (an OrderedDict) per use count, least recently used on the left; min marks min_freq.',
        strips: [
          {
            label: 'key_to_val',
            items: [
              ...[...keyToVal].map(([k, e]): StripItem => ({ text: `${k}: (${e.value}, ${e.freq})${o.dictRoles?.[k] === 'bad' ? ' evicted' : ''}`, role: o.dictRoles?.[k] })),
              ...(o.missing !== undefined ? [{ text: `${o.missing} missing`, role: 'bad' as Role }] : []),
            ],
          },
          opStripOf(ops, current),
        ],
      },
    });
  };

  /** _promote(key): out of bucket freq, into the MRU end of bucket freq + 1. */
  const promote = (key: number, opVars: Array<[string, string | number]>, ret: string) => {
    const entry = keyToVal.get(key)!;
    const freq = entry.freq;
    const bucket = freqToKeys.get(freq)!;
    const col = bucket.indexOf(key);
    bucket.splice(col, 1);
    let caption = `_promote(${key}): its count goes from ${freq} to ${freq + 1}. Take it out of bucket ${freq}`;
    let line = LFU.take;
    if (bucket.length === 0) {
      freqToKeys.delete(freq);
      line = LFU.drop;
      caption += `, which is now empty and is deleted`;
      if (minFreq === freq) {
        minFreq = freq + 1;
        caption += `. min_freq was ${freq}, so it becomes ${freq + 1}: the key just moved there, so bucket ${freq + 1} cannot be empty`;
      }
    }
    caption += '.';
    const row = rowOf(freq) + (freqToKeys.has(freq) ? 0.5 : -0.5);
    snap(line, caption, { lifted: { key, row, col, role: 'active' }, dictRoles: { [key]: 'compare' }, vars: opVars });
    const next = freqToKeys.get(freq + 1) ?? [];
    const created = next.length === 0;
    next.push(key);
    freqToKeys.set(freq + 1, next);
    entry.freq = freq + 1;
    snap(
      LFU.land,
      `It joins bucket ${freq + 1} at the MRU end (right)` +
        (created ? `, a new bucket` : `, behind ${next.length - 1} key${next.length > 2 ? 's' : ''} that reached ${freq + 1} uses earlier`) +
        `, and key_to_val[${key}] = (${entry.value}, ${freq + 1}).${ret}`,
      { roles: { [nodeId(key)]: 'active' }, dictRoles: { [key]: 'compare' }, vars: opVars },
    );
  };

  snap(
    undefined,
    `LFUCache(${capacity}): no keys yet, min_freq = 0. ` +
      (capacity > 0
        ? `When it holds ${capacity} key${capacity === 1 ? '' : 's'}, a new key evicts the least used one; on a tie, the least recently used of them.`
        : 'With capacity 0, get and put do nothing.'),
  );

  ops.forEach((op, n) => {
    current = n;
    const name = formatCacheOp(op);
    const opVars: Array<[string, string | number]> = [['op', name]];
    const { key } = op;
    let result: number | null = null;
    let evicted: number | null = null;
    if (op.kind === 'get') {
      const entry = keyToVal.get(key);
      if (capacity === 0 || !entry) {
        result = -1;
        misses += 1;
        snap(LFU.miss, capacity === 0 ? `${name}: the capacity is 0, so get returns -1 at once.` : `${name}: ${key} is not in key_to_val, so get returns -1. A miss changes no count.`, {
          missing: capacity === 0 ? undefined : key,
          vars: opVars,
        });
      } else {
        result = entry.value;
        hits += 1;
        snap(LFU.hit, `${name}: key_to_val[${key}] = (${entry.value}, ${entry.freq}): a hit. Reading it is a use, so _promote moves it to the next count.`, {
          roles: { [nodeId(key)]: 'compare' },
          dictRoles: { [key]: 'compare' },
          vars: opVars,
        });
        promote(key, opVars, ` get returns ${entry.value}.`);
      }
    } else if (capacity === 0) {
      snap(LFU.zero, `${name}: the capacity is 0, so put returns at once and stores nothing.`, { vars: opVars });
    } else if (keyToVal.has(key)) {
      const entry = keyToVal.get(key)!;
      const before = entry.value;
      entry.value = op.value;
      snap(LFU.update, `${name}: ${key} is cached. Store the new value with the same count, key_to_val[${key}] = (${op.value}, ${entry.freq}) (it was ${before}); an update is a use, so promote it too. Nothing is evicted.`, {
        roles: { [nodeId(key)]: 'active' },
        dictRoles: { [key]: 'active' },
        vars: opVars,
      });
      promote(key, opVars, '');
    } else {
      if (size >= capacity) {
        const bucket = freqToKeys.get(minFreq)!;
        const victim = bucket[0];
        const tie = bucket.length > 1;
        snap(
          LFU.victim,
          `${name}: the cache is full (size ${size} = capacity ${capacity}), so a key must go. The fewest uses are min_freq = ${minFreq}, ` +
            (tie
              ? `shared by ${bucket.length} keys: popitem(last=False) takes the least recently used of them, ${victim}.`
              : `and only ${victim} has that count: popitem(last=False) takes it.`),
          { roles: { [nodeId(victim)]: 'bad' }, pointers: [{ name: 'evict', target: nodeId(victim), role: 'bad' }], dictRoles: { [victim]: 'bad' }, vars: opVars },
        );
        const row = rowOf(minFreq);
        bucket.shift();
        let caption = `del key_to_val[${victim}]`;
        if (bucket.length === 0) {
          freqToKeys.delete(minFreq);
          caption += `, and bucket ${minFreq} is now empty, so it is deleted`;
        }
        size -= 1;
        evicted = victim;
        const gone = keyToVal.get(victim)!;
        keyToVal.delete(victim);
        snap(LFU.evict, `${caption}. size = ${size}. (${victim} had value ${gone.value} and ${gone.freq} use${gone.freq === 1 ? '' : 's'}.)`, {
          lifted: { key: victim, row: row - 0.5, col: 0, role: 'bad', ghost: true, value: gone.value },
          vars: opVars,
        });
      }
      keyToVal.set(key, { value: op.value, freq: 1 });
      const ones = freqToKeys.get(1) ?? [];
      ones.push(key);
      freqToKeys.set(1, ones);
      const before = minFreq;
      minFreq = 1;
      size += 1;
      snap(
        LFU.insert,
        `${evicted === null ? `${name}: ${key} is new and there is room. ` : ''}Insert ${key} with count 1 at the MRU end of bucket 1, and set min_freq = 1${before === 1 ? '' : ` (it was ${before})`}: a new key has the smallest count there can be. size = ${size}.`,
        { roles: { [nodeId(key)]: 'active' }, dictRoles: { [key]: 'active' }, vars: opVars },
      );
    }
    steps.push({
      op,
      result,
      buckets: freqs().map((f): [number, Array<[number, number]>] => [f, freqToKeys.get(f)!.map((k): [number, number] => [k, keyToVal.get(k)!.value])]),
      keyToVal: [...keyToVal].map(([k, e]): [number, number, number] => [k, e.value, e.freq]),
      minFreq,
      size,
      evicted,
    });
  });

  current = ops.length;
  const next = size >= capacity && size > 0 ? freqToKeys.get(minFreq)![0] : undefined;
  snap(
    undefined,
    size
      ? `Done: ${size} key${size === 1 ? '' : 's'} cached, min_freq = ${minFreq}.` + (next !== undefined ? ` A new key would evict ${next}, the least recently used key with ${minFreq} use${minFreq === 1 ? '' : 's'}.` : '')
      : 'Done: the cache is empty.',
  );
  return { frames, steps };
}
