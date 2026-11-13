import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { ChainState } from '../renderers/ChainView';
import { LFU_CODE, lfuTrace, LRU_CODE, lruTrace, parseCache, type CacheOp, type LfuStep, type LruStep } from './cache';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/hashing.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function randomOps(rand: () => number, keys: number, count: number): CacheOp[] {
  return Array.from({ length: count }, (): CacheOp => {
    const key = 1 + Math.floor(rand() * keys);
    return rand() < 0.55 ? { kind: 'put', key, value: Math.floor(rand() * 100) } : { kind: 'get', key };
  });
}

function expectWellFormed(frames: Array<Frame<ChainState>>, codeLines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
    const ids = f.state.nodes.map((n) => n.id);
    expect(new Set(ids).size, f.caption).toBe(ids.length);
    const drawn = new Set(ids);
    for (const l of f.state.links) {
      expect(drawn.has(l.from), f.caption).toBe(true);
      if (l.to !== null) expect(drawn.has(l.to), f.caption).toBe(true);
    }
    for (const p of f.state.pointers ?? []) if (p.target !== null) expect(drawn.has(p.target), f.caption).toBe(true);
  }
}

const toOps = (ops: Array<[string, number, number?]>): CacheOp[] => ops.map((op) => (op[0] === 'put' ? { kind: 'put', key: op[1], value: op[2]! } : { kind: 'get', key: op[1] }));

describe('lruTrace', () => {
  it('agrees with a recency-list reference on random scripts (capacity 0 included)', () => {
    const rand = rng(41);
    for (let t = 0; t < 200; t++) {
      const capacity = Math.floor(rand() * 6);
      const ops = randomOps(rand, capacity + 2, 1 + Math.floor(rand() * 30));
      const run = lruTrace({ capacity, ops });
      let order: Array<[number, number]> = []; // most recent first
      ops.forEach((op, i) => {
        const at = order.findIndex(([k]) => k === op.key);
        let result: number | null = null;
        let evicted: number | null = null;
        if (op.kind === 'get') {
          if (at < 0) result = -1;
          else {
            const [entry] = order.splice(at, 1);
            order = [entry, ...order];
            result = entry[1];
          }
        } else {
          if (at >= 0) order.splice(at, 1);
          order = [[op.key, op.value], ...order];
          if (order.length > capacity) evicted = order.pop()![0];
        }
        const step = run.steps[i];
        expect(step.result).toBe(result);
        expect(step.evicted).toBe(evicted);
        expect(step.order).toEqual(order);
        expect(step.order.length).toBeLessThanOrEqual(Math.max(capacity, 0));
      });
      expectWellFormed(run.frames, LRU_CODE.length);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('matches the Python LRUCache (golden fixtures): results, list order, dict order and evictions', () => {
    const cases = fixtures.lru as Array<{ capacity: number; ops: Array<[string, number, number?]>; steps: LruStep[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = lruTrace({ capacity: c.capacity, ops: toOps(c.ops) });
      c.steps.forEach((want, i) => {
        const where = `cap ${c.capacity} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        expect(run.steps[i].result, where).toBe(want.result);
        expect(run.steps[i].order, where).toEqual(want.order);
        expect(run.steps[i].dict, where).toEqual(want.dict);
        expect(run.steps[i].evicted, where).toBe(want.evicted);
      });
    }
  });

  it('draws the list between the sentinels and lifts a node while it moves', () => {
    const run = lruTrace(parseCache('cap 3; put 1 10, put 2 20, put 3 30, get 1, put 4 40', 'lru'));
    const unlink = run.frames.find((f) => f.line === 12)!;
    const lifted = unlink.state.nodes.find((n) => n.id === 'k1')!;
    expect(lifted.row).toBe(0.8);
    // The hole stays open until the node lands at the front.
    expect(unlink.state.nodes.find((n) => n.id === 'tail')!.col).toBe(4);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.nodes.filter((n) => !n.sentinel).sort((a, b) => a.col - b.col).map((n) => n.label)).toEqual(['4:40', '1:10', '3:30']);
    expect(run.steps[4].evicted).toBe(2);
  });

  it('capacity 0 inserts the node and evicts it at once', () => {
    const run = lruTrace(parseCache('cap 0; put 1 10, get 1', 'lru'));
    expect(run.steps.map((s) => [s.result, s.evicted, s.order.length])).toEqual([
      [null, 1, 0],
      [-1, null, 0],
    ]);
  });
});

/** Brute-force LFU: each key keeps (count, last use); the victim has the smallest pair. */
function lfuModel(capacity: number, ops: CacheOp[]) {
  const entries = new Map<number, { value: number; count: number; last: number }>();
  return ops.map((op, time) => {
    let result: number | null = null;
    let evicted: number | null = null;
    const e = entries.get(op.key);
    if (op.kind === 'get') {
      if (capacity === 0 || !e) result = -1;
      else {
        e.count += 1;
        e.last = time;
        result = e.value;
      }
    } else if (capacity > 0) {
      if (e) {
        e.value = op.value;
        e.count += 1;
        e.last = time;
      } else {
        if (entries.size >= capacity) {
          let victim: [number, { count: number; last: number }] | undefined;
          for (const entry of entries) if (!victim || entry[1].count < victim[1].count || (entry[1].count === victim[1].count && entry[1].last < victim[1].last)) victim = entry;
          evicted = victim![0];
          entries.delete(evicted);
        }
        entries.set(op.key, { value: op.value, count: 1, last: time });
      }
    }
    return { result, evicted, counts: new Map([...entries].map(([k, v]) => [k, [v.value, v.count]])) };
  });
}

describe('lfuTrace', () => {
  it('agrees with a brute-force (count, last use) reference on random scripts', () => {
    const rand = rng(51);
    for (let t = 0; t < 200; t++) {
      const capacity = Math.floor(rand() * 7);
      const ops = randomOps(rand, capacity + 2, 1 + Math.floor(rand() * 30));
      const run = lfuTrace({ capacity, ops });
      const model = lfuModel(capacity, ops);
      ops.forEach((_, i) => {
        const step = run.steps[i];
        expect(step.result).toBe(model[i].result);
        expect(step.evicted).toBe(model[i].evicted);
        expect(new Map(step.keyToVal.map(([k, v, f]) => [k, [v, f]]))).toEqual(model[i].counts);
        // Buckets: one per count, never empty, min_freq the smallest.
        for (const [f, keys] of step.buckets) {
          expect(keys.length).toBeGreaterThan(0);
          for (const [k] of keys) expect(model[i].counts.get(k)![1]).toBe(f);
        }
        if (step.size > 0) expect(step.minFreq).toBe(step.buckets[0][0]);
      });
      expectWellFormed(run.frames, LFU_CODE.length);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('matches the Python LFUCache (golden fixtures): results, buckets, key_to_val, min_freq and evictions', () => {
    const cases = fixtures.lfu as Array<{ capacity: number; ops: Array<[string, number, number?]>; steps: LfuStep[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = lfuTrace({ capacity: c.capacity, ops: toOps(c.ops) });
      c.steps.forEach((want, i) => {
        const where = `cap ${c.capacity} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        expect(run.steps[i].result, where).toBe(want.result);
        expect(run.steps[i].buckets, where).toEqual(want.buckets);
        expect(run.steps[i].keyToVal, where).toEqual(want.keyToVal);
        expect(run.steps[i].minFreq, where).toBe(want.minFreq);
        expect(run.steps[i].size).toBe(want.size);
        expect(run.steps[i].evicted, where).toBe(want.evicted);
      });
    }
  });

  it('on a tie evicts the least recently used key of the lowest count', () => {
    const run = lfuTrace(parseCache('cap 2; put 1 1, put 2 2, get 1, put 3 3, get 2, get 3, put 4 4, get 1, get 3, get 4', 'lfu'));
    expect(run.steps.map((s) => s.result)).toEqual([null, null, 1, null, -1, 3, null, -1, 3, 4]);
    expect(run.steps.map((s) => s.evicted).filter((e) => e !== null)).toEqual([2, 1]);
    // One row per count: the lanes follow the buckets.
    const last = run.frames[run.frames.length - 1].state;
    expect(last.lanes?.map((l) => l.label)).toEqual(['freq 2 min', 'freq 3']);
  });
});

describe('parseCache', () => {
  it('reads the capacity and both operations', () => {
    expect(parseCache('cap 2; put 1 10, p 2 20, get 1, g(2)', 'lru')).toEqual({
      capacity: 2,
      ops: [
        { kind: 'put', key: 1, value: 10 },
        { kind: 'put', key: 2, value: 20 },
        { kind: 'get', key: 1 },
        { kind: 'get', key: 2 },
      ],
    });
    expect(parseCache('get 1', 'lfu').capacity).toBe(2);
  });

  it('gives friendly errors', () => {
    expect(() => parseCache('', 'lru')).toThrow(InputError);
    expect(() => parseCache('cap -1; put 1 1', 'lfu')).toThrow(/ValueError/);
    expect(() => parseCache('cap -1; put 1 1', 'lru')).toThrow(/behaves like capacity 0/);
    expect(() => parseCache('cap 5; put 1 1', 'lru')).toThrow(/up to 4/);
    expect(() => parseCache('put cat 1', 'lru')).toThrow(/not an integer/);
    expect(() => parseCache('put 1', 'lru')).toThrow(/key and a value/);
    expect(() => parseCache('remove 1', 'lru')).toThrow(/Cannot read/);
  });
});

describe('cache captions and labels', () => {
  it('an evicted LFU key keeps its label while it leaves', () => {
    const run = lfuTrace(parseCache('cap 1; put 1 10, put 2 20', 'lfu'));
    const leaving = run.frames.find((f) => f.caption.startsWith('del key_to_val[1]'))!;
    const ghost = leaving.state.nodes.find((n) => n.id === 'k1')!;
    expect([ghost.label, ghost.ghost]).toEqual(['1:10', true]);
  });

  it('the LRU summary names the next victim only when the cache is full', () => {
    expect(lruTrace(parseCache('cap 3; put 1 1, put 2 2', 'lru')).frames.at(-1)!.caption).toMatch(/room for 1 more/);
    expect(lruTrace(parseCache('cap 2; put 1 1, put 2 2', 'lru')).frames.at(-1)!.caption).toMatch(/would evict 1/);
  });
});
