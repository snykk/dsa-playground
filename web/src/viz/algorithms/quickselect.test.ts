import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { parseQuickselect, QS_CODE, quickselectTrace, stabilizeQuickselect, type QsInput, type QsOp, type QuickselectState } from './quickselect';
import { Draws, PyRandom } from './randomizedDraws';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/divideAndRandomized.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function expectWellFormed(frames: Array<Frame<QuickselectState>>) {
  const problems: string[] = [];
  for (const f of frames) {
    const n = f.state.items.length;
    if (f.caption.length <= 20) problems.push(`short caption: ${f.caption}`);
    if (f.line !== undefined && (f.line < 0 || f.line >= QS_CODE.length)) problems.push(`line ${f.line}`);
    const ids = f.state.items.map((it) => it.id);
    if (new Set(ids).size !== n) problems.push(`duplicate ids: ${f.caption}`);
    if (f.state.roles.length !== n || f.state.marks.length !== n) problems.push('roles / marks length');
    for (const p of f.state.pointers) if (p.index < 0 || p.index > n) problems.push(`pointer ${p.name} at ${p.index}`);
    if (f.state.range && (f.state.range.lo < 0 || f.state.range.hi >= n || f.state.range.lo > f.state.range.hi)) problems.push(`range ${JSON.stringify(f.state.range)}`);
    if (f.state.pivotId !== null && !ids.includes(f.state.pivotId)) problems.push('pivot id');
  }
  expect(problems).toEqual([]);
}

function randomScript(rand: () => number): QsInput {
  const n = Math.floor(rand() * 17);
  const pools = [[-5, 0, 5, 9], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [7], [0, 1], [-99, 99, 0, 42, -1]];
  const pool = pools[Math.floor(rand() * pools.length)];
  const values = Array.from({ length: n }, () => pool[Math.floor(rand() * pool.length)]);
  const ops: QsOp[] = Array.from({ length: 1 + Math.floor(rand() * 4) }, () => {
    const k = rand() < 0.15 ? Math.floor(rand() * (n + 3)) - 1 : Math.floor(rand() * Math.max(1, n));
    return rand() < 0.75 ? { kind: 'select', k } : { kind: 'top', k };
  });
  return { values, ops, seed: Math.floor(rand() * 2 ** 32), pivots: [] };
}

/** Reference model: the sorted list answers every rank; top-k is the k smallest as a multiset. */
function checkAgainstModel(input: QsInput) {
  const run = quickselectTrace(input);
  const sorted = [...input.values].sort((a, b) => a - b);
  const multiset = (xs: number[]) => [...xs].sort((a, b) => a - b);
  let arr = [...input.values];
  expect(run.steps.length).toBe(input.ops.length);
  input.ops.forEach((op, s) => {
    const step = run.steps[s];
    const n = arr.length;
    if (op.kind === 'select') {
      if (n === 0) expect(step.error).toBe('ValueError: arr must be non-empty');
      else if (op.k < 0 || op.k >= n) expect(step.error).toBe(`IndexError: k=${op.k} out of range [0, ${n})`);
      else {
        expect(step.error).toBeNull();
        expect(step.result).toBe(sorted[op.k]);
        // After the call: everything left of k is <= arr[k] <= everything right of it.
        expect(step.arr[op.k]).toBe(sorted[op.k]);
        expect(step.arr.slice(0, op.k).every((v) => v <= sorted[op.k])).toBe(true);
        expect(step.arr.slice(op.k + 1).every((v) => v >= sorted[op.k])).toBe(true);
        arr = step.arr;
      }
    } else {
      expect(step.error).toBeNull();
      const want = op.k <= 0 ? [] : sorted.slice(0, Math.min(op.k, n));
      expect(multiset(step.result as number[])).toEqual(want);
      expect(step.arr).toEqual(arr); // top_k_smallest works on a copy
    }
    expect(multiset(step.arr)).toEqual(sorted);
    // Every draw lies in its range, and every partition leaves < | == | > around the pivot.
    expect(step.draws.length).toBe(step.partitions.length);
    step.partitions.forEach((p, t) => {
      const [lo, hi, idx] = step.draws[t];
      expect([p.lo, p.hi, p.pivotIndex]).toEqual([lo, hi, idx]);
      expect(idx >= lo && idx <= hi).toBe(true);
      const pivot = p.arr[p.lt];
      for (let x = p.lo; x <= p.hi; x++) {
        if (x < p.lt) expect(p.arr[x]).toBeLessThan(pivot);
        else if (x <= p.gt) expect(p.arr[x]).toBe(pivot);
        else expect(p.arr[x]).toBeGreaterThan(pivot);
      }
    });
  });
  return run;
}

describe('PyRandom is random.Random (golden fixtures)', () => {
  it('getrandbits(32), randrange and randint of many seeds', () => {
    const list = fixtures.draws as Array<{ seed: number; skip?: number; bits: number[]; randrange: Array<[number, number]>; randint: Array<[number, number, number]> }>;
    expect(list.length).toBeGreaterThanOrEqual(10);
    for (const c of list) {
      const r = new PyRandom(c.seed);
      for (let s = 0; s < (c.skip ?? 0); s++) r.getrandbits(32);
      expect(c.bits.map(() => r.getrandbits(32))).toEqual(c.bits);
      expect(c.randrange.map(([n]) => [n, r.randrange(n)])).toEqual(c.randrange);
      expect(c.randint.map(([a, b]) => [a, b, r.randint(a, b)])).toEqual(c.randint);
    }
  });

  it('fixed draws come first, then the seeded generator from its start', () => {
    const d = new Draws(1, [3]);
    expect(d.randint(0, 6).value).toBe(3);
    expect(d.randint(0, 6).value).toBe(new PyRandom(1).randint(0, 6));
    expect(d.log.map((x) => x.fixed)).toEqual([true, false]);
    expect(() => new Draws(1, [9]).randint(0, 6)).toThrow(RangeError);
  });
});

describe('quickselectTrace', () => {
  it('agrees with a sorted-list reference on random scripts', () => {
    const rand = rng(29);
    for (let t = 0; t < 200; t++) {
      const input = randomScript(rand);
      const run = checkAgainstModel(input);
      expectWellFormed(run.frames);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('matches the Python module (golden fixtures): every draw, partition, result and the list', () => {
    const list = fixtures.quickselect as Array<{ values: number[]; ops: Array<[string, number]>; seed: number; pivots: number[]; steps: Array<{ result: unknown; error: string | null; draws: number[][]; partitions: unknown[][]; arr: number[] }> }>;
    expect(list.length).toBeGreaterThanOrEqual(80);
    for (const c of list) {
      const ops = c.ops.map(([kind, k]) => ({ kind, k }) as QsOp);
      const run = quickselectTrace({ values: c.values, ops, seed: c.seed, pivots: c.pivots });
      const label = JSON.stringify([c.values, c.ops, c.seed]);
      expect(run.steps.length).toBe(c.steps.length);
      c.steps.forEach((want, s) => {
        const got = run.steps[s];
        expect(got.result, label).toEqual(want.result);
        expect(got.error, label).toEqual(want.error);
        expect(got.draws, label).toEqual(want.draws);
        expect(got.partitions.map((p) => [p.lo, p.hi, p.pivotIndex, p.lt, p.gt, p.arr]), label).toEqual(want.partitions);
        expect(got.arr, label).toEqual(want.arr);
      });
    }
  });

  it('the article example: seed 1 draws pivot index 1, then 3', () => {
    const run = quickselectTrace(parseQuickselect('[7, 2, 9, 2, 5, 2, 8]; k 3'));
    const step = run.steps[0];
    expect(step.draws).toEqual([
      [0, 6, 1],
      [3, 6, 3],
    ]);
    expect(step.partitions.map((p) => [p.lt, p.gt, p.arr])).toEqual([
      [0, 2, [2, 2, 2, 5, 9, 8, 7]],
      [3, 3, [2, 2, 2, 5, 8, 7, 9]],
    ]);
    expect(step.result).toBe(5);
    expect(run.frames.some((f) => f.caption.includes('rng.randint(0, 6) = 1 (random.Random(1), draw 1)'))).toBe(true);
  });

  it('all-equal input settles in one partition, whatever the pivot', () => {
    const run = quickselectTrace(parseQuickselect('[5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]; seed 3; k 6'));
    expect(run.steps[0].partitions.length).toBe(1);
    expect(run.steps[0].partitions[0]).toMatchObject({ lt: 0, gt: 11 });
    const partitionFrames = run.frames.filter((f) => f.line !== undefined && f.line >= 13 && f.line <= 15);
    expect(partitionFrames.length).toBe(12);
  });

  it('fixed pivots can force the worst case: every round drops one key', () => {
    const run = quickselectTrace(parseQuickselect('[1, 2, 3, 4, 5, 6, 7, 8]; pivots 0 7 7 5 6 5 7; k 7'));
    // The pivot is always the smallest key left: the equal band is just lo, and lo moves by one.
    expect(run.steps[0].partitions.map((p) => [p.lo, p.lt, p.gt])).toEqual(Array.from({ length: 7 }, (_, r) => [r, r, r]));
    expect(run.steps[0].partitions.map((p) => p.arr[p.lt])).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(run.steps[0].result).toBe(8);
  });

  it('swapped bars keep their identity, so they glide', () => {
    const run = quickselectTrace(parseQuickselect('[3, 1, 2]; pivots 1; k 0'));
    const ids = run.frames.map((f) => f.state.items.map((it) => it.id).join(','));
    expect(new Set(ids).size).toBeGreaterThan(1);
    for (const f of run.frames) expect([...f.state.items.map((it) => it.id)].sort()).toEqual([0, 1, 2]);
  });

  it('top_k_smallest works on a copy and puts the bars back', () => {
    const run = quickselectTrace(parseQuickselect('[9, 1, 8, 2, 7, 3]; seed 5; top 3'));
    expect([...(run.steps[0].result as number[])].sort()).toEqual([1, 2, 3]);
    expect(run.steps[0].arr).toEqual([9, 1, 8, 2, 7, 3]);
    const last = run.frames[run.frames.length - 1];
    expect(last.state.items.map((it) => it.value)).toEqual([9, 1, 8, 2, 7, 3]);
    expect(run.frames.some((f) => f.state.copy)).toBe(true);
  });

  it('a raising call gets its own bad frame and the script goes on', () => {
    const run = quickselectTrace(parseQuickselect('[3, 1, 2]; k 3, k -1, k 1'));
    expect(run.steps.map((s) => s.error)).toEqual(['IndexError: k=3 out of range [0, 3)', 'IndexError: k=-1 out of range [0, 3)', null]);
    expect(run.steps[2].result).toBe(2);
    const bad = run.frames.filter((f) => f.line === 2);
    expect(bad.length).toBe(2);
    expect(bad[0].state.roles.every((r) => r === 'bad')).toBe(true);
    const empty = quickselectTrace(parseQuickselect('[]; k 0, top 2'));
    expect(empty.steps.map((s) => [s.result, s.error])).toEqual([
      [null, 'ValueError: arr must be non-empty'],
      [[], null],
    ]);
  });

  it('stabilizes one bar scale per run', () => {
    const frames = stabilizeQuickselect(quickselectTrace(parseQuickselect('[-5, 9, 3]; k 1')).frames);
    expect(new Set(frames.map((f) => JSON.stringify(f.state.scale))).size).toBe(1);
    expect(frames[0].state.scale).toEqual({ min: -5, max: 9 });
  });

  it('stays under 2000 frames on the largest input', () => {
    let most = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const text = `[${Array.from({ length: 16 }, (_, i) => 16 - i).join(', ')}]; seed ${seed}; k 15, k 0, k 7, top 8, k 15, k 3`;
      most = Math.max(most, quickselectTrace(parseQuickselect(text)).frames.length);
    }
    expect(most).toBeLessThan(2000);
  });
});

describe('parseQuickselect', () => {
  it('reads the array, the seed, fixed pivots and the operations', () => {
    expect(parseQuickselect('[7, 2, 9]; seed 42; pivots 1; select 1, top 2, kth 0')).toEqual({
      values: [7, 2, 9],
      seed: 42,
      pivots: [1],
      ops: [
        { kind: 'select', k: 1 },
        { kind: 'top', k: 2 },
        { kind: 'select', k: 0 },
      ],
    });
    expect(parseQuickselect('7 2 9; k=2')).toMatchObject({ values: [7, 2, 9], seed: 1, ops: [{ kind: 'select', k: 2 }] });
  });

  it('gives friendly errors', () => {
    expect(() => parseQuickselect('')).toThrow(InputError);
    expect(() => parseQuickselect('[1, 2]')).toThrow(/rank/);
    expect(() => parseQuickselect('k 1')).toThrow(/brackets/);
    expect(() => parseQuickselect('[1, x]; k 0')).toThrow(/whole number/);
    expect(() => parseQuickselect('[100]; k 0')).toThrow(/-99 to 99/);
    expect(() => parseQuickselect(`[${Array(17).fill(1).join(', ')}]; k 0`)).toThrow(/16 values/);
    expect(() => parseQuickselect('[1, 2, 3]; pivots 5; k 1')).toThrow(/outside its range/);
    expect(() => parseQuickselect('[1, 2, 3]; pivots 0 0 0 0; k 0')).toThrow(/were fixed/);
    expect(() => parseQuickselect('[1, 2]; hello 3')).toThrow(/Cannot read/);
    expect(() => parseQuickselect('[1, 2]; seed 1; seed 2; k 0')).toThrow(/only once/);
  });
});
