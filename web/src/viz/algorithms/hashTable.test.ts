import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { ChainState } from '../renderers/ChainView';
import { CHAIN_CODE, chainTrace, hashText, keyId, parseChain, pyHash, pyMod, type ChainMode, type ChainOp, type ChainStep, type HKey, type HVal } from './hashTable';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/hashing.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Every frame: a caption, a line in range, unique node ids, links and references that point at drawn nodes. */
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
    for (const p of f.state.pointers ?? []) if (p.target !== null) expect(drawn.has(p.target)).toBe(true);
  }
}

const WORDS = ['cat', 'dog', 'owl', 'abcd', 'cdab', '5', 'ab', 'ba'];

function randomOps(rand: () => number, mode: ChainMode, capacity: number, count: number): ChainOp[] {
  const pool: HKey[] = [];
  for (let i = 0; i < 6; i++) pool.push(Math.floor(rand() * 61) - 20);
  for (let i = 0; i < 4; i++) pool.push(capacity * Math.floor(rand() * 6));
  pool.push(WORDS[Math.floor(rand() * WORDS.length)], WORDS[Math.floor(rand() * WORDS.length)]);
  const ops: ChainOp[] = [];
  for (let i = 0; i < count; i++) {
    const key = pool[Math.floor(rand() * pool.length)];
    const r = rand();
    if (mode === 'set') ops.push(r < 0.5 ? { kind: 'add', key } : r < 0.75 ? { kind: 'remove', key } : { kind: 'contains', key });
    else if (r < 0.45) ops.push({ kind: 'put', key, value: Math.floor(rand() * 100) });
    else if (r < 0.65) ops.push({ kind: 'get', key });
    else if (r < 0.85 || mode === 'fixed') ops.push({ kind: 'remove', key });
    else ops.push({ kind: 'contains', key });
  }
  return ops;
}

/** Reference model: a Map for the contents and the doubling rule replayed on the size. */
function checkAgainstModel(mode: ChainMode, capacity: number, ops: ChainOp[]) {
  const run = chainTrace({ mode, capacity, ops });
  const model = new Map<string, HVal>();
  let cap = capacity;
  expect(run.steps.length).toBe(ops.length);
  ops.forEach((op, i) => {
    const step = run.steps[i];
    const id = keyId(op.key);
    if (op.kind === 'put') {
      expect(step.result).toBeNull();
      const fresh = !model.has(id);
      model.set(id, op.value);
      if (fresh && mode === 'table' && model.size / cap > 0.75) cap *= 2;
    } else if (op.kind === 'add') {
      expect(step.result).toBe(!model.has(id));
      if (!model.has(id)) {
        model.set(id, 0);
        if (model.size / cap > 0.75) cap *= 2;
      }
    } else if (op.kind === 'get') {
      expect(step.result).toBe(model.has(id) ? model.get(id)! : null);
    } else if (op.kind === 'contains') {
      expect(step.result).toBe(model.has(id));
    } else {
      expect(step.result).toBe(model.delete(id));
    }
    expect(step.size).toBe(model.size);
    expect(step.capacity).toBe(cap);
    expect(step.buckets.length).toBe(cap);
    // Every key sits in bucket _hash(key), once, with the model's value.
    const seen = new Map<string, HVal>();
    step.buckets.forEach((bucket, b) => {
      for (const entry of bucket as Array<HKey | [HKey, HVal]>) {
        const [key, value] = mode === 'set' ? [entry as HKey, 0] : (entry as [HKey, HVal]);
        expect(pyHash(key, cap)).toBe(b);
        expect(seen.has(keyId(key))).toBe(false);
        seen.set(keyId(key), value);
      }
    });
    expect(seen).toEqual(model);
  });
  return run;
}

describe('pyHash (the repository _hash)', () => {
  it('uses Python modulo for ints: never negative', () => {
    expect(pyMod(-1, 4)).toBe(3);
    expect(pyMod(-8, 8)).toBe(0);
    expect(pyHash(-5, 4)).toBe(3);
    expect(pyHash(13, 8)).toBe(5);
  });

  it('runs h = (h * 31 + ord(c)) % capacity over a string', () => {
    // c = 99: 99 % 8 = 3; a = 97: (3*31 + 97) % 8 = 6; t = 116: (6*31 + 116) % 8 = 6
    expect(pyHash('cat', 8)).toBe(6);
    expect(hashText('cat', 8)).toContain('c 3, a 6, t 6');
    // 31 = -1 (mod 32): swapping the halves of a 4-letter string gives the same bucket
    expect(pyHash('abcd', 32)).toBe(pyHash('cdab', 32));
    // '5' the string is not 5 the int
    expect(pyHash('5', 16)).toBe(53 % 16);
    expect(keyId('5')).not.toBe(keyId(5));
  });
});

describe.each(['table', 'set', 'fixed'] as const)('chainTrace (%s)', (mode) => {
  it('agrees with a Map reference on random operation scripts', () => {
    const rand = rng(mode === 'table' ? 11 : mode === 'set' ? 12 : 13);
    for (let t = 0; t < 150; t++) {
      const capacity = [1, 2, 3, 4, 8, 16][Math.floor(rand() * 6)];
      const ops = randomOps(rand, mode, capacity, 1 + Math.floor(rand() * 24));
      const run = checkAgainstModel(mode, capacity, ops);
      expectWellFormed(run.frames, CHAIN_CODE[mode].lines.length);
      for (const f of run.frames) expect(f.state.lanes?.length).toBe(f.state.nodes.filter((n) => n.shape === 'slot').length);
    }
  });

  it('draws every live key once, in its bucket row, in chain order (outside the transient frames)', () => {
    const ops = randomOps(rng(5), mode, 4, 20);
    const run = chainTrace({ mode, capacity: 4, ops });
    const last = run.frames[run.frames.length - 1].state;
    const final = run.steps[run.steps.length - 1];
    final.buckets.forEach((bucket, b) => {
      const row = last.nodes.filter((n) => n.row === b && n.shape !== 'slot').sort((x, y) => x.col - y.col);
      expect(row.map((n) => n.id)).toEqual((bucket as Array<HKey | [HKey, HVal]>).map((e) => `k:${keyId(mode === 'set' ? (e as HKey) : (e as [HKey, HVal])[0])}`));
      expect(row.every((n) => !n.ghost && n.role === 'idle')).toBe(true);
    });
  });
});

describe('chainTrace matches the Python classes (golden fixtures)', () => {
  const toOp = (op: [string, HKey, HVal?]): ChainOp => (op[0] === 'put' ? { kind: 'put', key: op[1], value: op[2]! } : ({ kind: op[0], key: op[1] } as ChainOp));
  const cases: Array<[string, ChainMode]> = [
    ['hashTable', 'table'],
    ['hashSet', 'set'],
    ['chaining', 'fixed'],
  ];
  it.each(cases)('%s: result, capacity, size and buckets after every operation', (section, mode) => {
    const list = fixtures[section] as Array<{ capacity: number; ops: Array<[string, HKey, HVal?]>; steps: Array<Partial<ChainStep>> }>;
    expect(list.length).toBeGreaterThanOrEqual(40);
    for (const c of list) {
      const run = chainTrace({ mode, capacity: c.capacity, ops: c.ops.map(toOp) });
      expect(run.steps.length).toBe(c.steps.length);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        expect(got.result, `${section} ${JSON.stringify(c.ops.slice(0, i + 1))}`).toEqual(want.result);
        expect(got.size).toBe(want.size);
        if (want.capacity !== undefined) expect(got.capacity).toBe(want.capacity);
        expect(got.buckets).toEqual(want.buckets);
      });
    }
  });
});

describe('chainTrace scenarios', () => {
  it('resizes at load > 0.75 and puts every pair again in bucket order (the article example)', () => {
    const run = chainTrace(parseChain('cap 4; put 5 a, put 9 b, put 13 c, put 2 d, put 7 e, put 12 f', 'table'));
    expect(run.steps[2].buckets[1]).toEqual([
      [5, 'a'],
      [9, 'b'],
      [13, 'c'],
    ]);
    expect(run.steps[2].capacity).toBe(4); // 3/4 = 0.75 is not above the threshold
    const after = run.steps[3];
    expect(after.resized).toBe(true);
    expect(after.capacity).toBe(8);
    expect(after.buckets[1]).toEqual([[9, 'b']]);
    expect(after.buckets[2]).toEqual([[2, 'd']]);
    expect(after.buckets[5]).toEqual([
      [5, 'a'],
      [13, 'c'],
    ]);
    // The pairs glide: while the resize runs, a waiting pair keeps its old place, muted.
    const start = run.frames.findIndex((f) => f.caption.startsWith('Resize:'));
    const waiting = run.frames[start].state.nodes.filter((n) => n.role === 'muted');
    expect(waiting.map((n) => [n.id, n.row, n.col])).toEqual([
      ['k:n5', 1, 1],
      ['k:n9', 1, 2],
      ['k:n13', 1, 3],
      ['k:n2', 2, 1],
    ]);
    const moved = run.frames[start + 1].state.nodes.find((n) => n.id === 'k:n5')!;
    expect([moved.row, moved.col, moved.role]).toEqual([5, 1, 'active']);
    expect(run.steps[5].capacity).toBe(8); // 6/8 = 0.75
  });

  it('removing from a chain leaves a ghost, then shifts the later pairs left', () => {
    const run = chainTrace(parseChain('cap 8; put 1 a, put 9 b, put 17 c, put 25 d, remove 9', 'table'));
    const pop = run.frames.findIndex((f) => f.caption.startsWith('bucket.pop(1)'));
    const ghost = run.frames[pop].state.nodes.find((n) => n.id === 'k:n9')!;
    expect([ghost.ghost, ghost.col]).toEqual([true, 2]);
    expect(run.frames[pop].state.nodes.find((n) => n.id === 'k:n17')!.col).toBe(3);
    const shifted = run.frames[pop + 1].state.nodes;
    expect(shifted.find((n) => n.id === 'k:n9')).toBeUndefined();
    expect(shifted.find((n) => n.id === 'k:n17')!.col).toBe(2);
    expect(run.steps[4].buckets[1]).toEqual([
      [1, 'a'],
      [17, 'c'],
      [25, 'd'],
    ]);
  });

  it('a fixed-capacity chaining table never resizes', () => {
    const ops: ChainOp[] = Array.from({ length: 12 }, (_, i) => ({ kind: 'put', key: i * 4, value: i }));
    const run = chainTrace({ mode: 'fixed', capacity: 4, ops });
    expect(run.steps[11].capacity).toBe(4);
    expect(run.steps[11].buckets[0].length).toBe(12);
  });

  it('put updates in place, and the int 5 and the string 5 are different keys', () => {
    const run = chainTrace(parseChain("cap 8; put 5 a, put '5' b, put 5 c, get '5', get 5", 'table'));
    expect(run.steps.map((s) => s.result)).toEqual([null, null, null, 'b', 'c']);
    expect(run.steps[4].size).toBe(2);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const keys = Array.from({ length: 6 }, (_, i) => i * 8);
    const text = `cap 8; ${[...keys.map((k) => `put ${k} a`), ...keys.map((k) => `get ${k}`), ...keys.map((k) => `contains ${k}`), ...keys.map((k) => `put ${k} b`)].join(', ')}, get 48, get 56, remove 40, remove 0, get 99, get 23`;
    const run = chainTrace(parseChain(text, 'table'));
    expect(run.steps.length).toBe(30);
    expect(run.frames.length).toBeLessThan(2000);
  });
});

describe('parseChain', () => {
  it('reads the capacity, the operations and their short forms', () => {
    const input = parseChain("cap 4; p 5 a, g 5, rm 5, has cat, put(-3, 7), get 'x1'", 'table');
    expect(input.capacity).toBe(4);
    expect(input.ops).toEqual([
      { kind: 'put', key: 5, value: 'a' },
      { kind: 'get', key: 5 },
      { kind: 'remove', key: 5 },
      { kind: 'contains', key: 'cat' },
      { kind: 'put', key: -3, value: 7 },
      { kind: 'get', key: 'x1' },
    ]);
    expect(parseChain('add 1, a 2, contains 1', 'set').ops.map((o) => o.kind)).toEqual(['add', 'add', 'contains']);
    expect(parseChain('put 1 a', 'table').capacity, 'the Python default').toBe(16);
  });

  it('gives friendly errors', () => {
    expect(() => parseChain('', 'table')).toThrow(InputError);
    expect(() => parseChain('cap 0; put 1 a', 'table')).toThrow(/ValueError/);
    expect(() => parseChain('cap 17; put 1 a', 'table')).toThrow(/up to 16/);
    expect(() => parseChain('put 1', 'table')).toThrow(/key and a value/);
    expect(() => parseChain('add 1', 'table')).toThrow(/Cannot read/);
    expect(() => parseChain('contains 1', 'fixed')).toThrow(/Cannot read/);
    expect(() => parseChain('put 5000 a', 'table')).toThrow(/-99 to 999/);
    expect(() => parseChain('put abcde a', 'table')).toThrow(/1 to 4/);
    expect(() => parseChain('put 1 abcd', 'table')).toThrow(/up to 3/);
    expect(() => parseChain(Array.from({ length: 13 }, (_, i) => `put ${i} a`).join(', '), 'fixed')).toThrow(/12 keys/);
    expect(() => parseChain(`cap 3; ${Array.from({ length: 10 }, (_, i) => `add ${i}`).join(', ')}`, 'set')).toThrow(/24 buckets/);
    expect(() => parseChain(Array.from({ length: 13 }, (_, i) => `put ${i} a`).join(', '), 'table')).toThrow(/12 keys/);
  });
});
