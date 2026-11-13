import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { DynamicArrayState } from '../renderers/DynamicArrayView';
import { dynamicArray } from '../specs/dynamicArray';
import fixtures from './__fixtures__/lists.json';
import { formatArrayOp, parseArrayOps, traceDynamicArray, type ArrayOp } from './dynamicArray';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function randomScript(rand: () => number): ArrayOp[] {
  const ops: ArrayOp[] = [];
  let n = 0;
  for (let k = 0, len = 1 + Math.floor(rand() * 30); k < len; k++) {
    const r = rand();
    if (r < 0.55 && n < 16) {
      ops.push({ kind: 'append', value: Math.floor(rand() * 1099) - 99 });
      n++;
    } else if (r < 0.85) {
      ops.push({ kind: 'pop' });
      n = Math.max(0, n - 1);
    } else ops.push({ kind: 'get', index: Math.floor(rand() * (n + 5)) - 2 });
  }
  return ops;
}

function expectWellFormed(frames: Array<Frame<DynamicArrayState>>) {
  // Plain checks first, one assertion per run: thousands of frames make per-item expects slow.
  const problems: string[] = [];
  frames.forEach((f, k) => {
    if (f.caption.length <= 5) problems.push(`${k}: short caption`);
    if (f.line !== undefined && (f.line < 0 || f.line >= dynamicArray.pseudocode.length)) problems.push(`${k}: line ${f.line}`);
    const ids = f.state.values.map((v) => String(v.id));
    if (new Set(ids).size !== ids.length) problems.push(`${k}: duplicate value ids`);
    const blocks = f.state.blocks.map((b) => b.id);
    if (new Set(blocks).size !== blocks.length) problems.push(`${k}: duplicate block ids`);
    // Every value sits in a slot of a block on its row, or is lifted above the first row.
    for (const v of f.state.values) {
      if (v.row < 0) continue;
      const block = f.state.blocks.find((b) => b.row === v.row);
      if (!block || v.col >= block.capacity) problems.push(`${k}: value ${v.id} outside its block`);
    }
  });
  expect(problems).toEqual([]);
}

describe('traceDynamicArray', () => {
  it('agrees with a list model and the doubling / quarter rule on random scripts', () => {
    const rand = rng(2026);
    for (let t = 0; t < 200; t++) {
      const ops = randomScript(rand);
      const run = traceDynamicArray(ops);
      const model: number[] = [];
      let capacity = 1;
      expect(run.steps.length).toBe(ops.length);
      ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'append') {
          if (model.length === capacity) capacity *= 2;
          model.push(op.value);
          expect(step.error).toBeNull();
        } else if (op.kind === 'pop') {
          if (model.length === 0) expect(step.error).toBe('IndexError: Pop from empty array');
          else {
            expect(step.result).toBe(model.pop());
            if (model.length > 0 && model.length <= Math.floor(capacity / 4)) capacity /= 2;
          }
        } else if (op.index >= 0 && op.index < model.length) {
          expect(step.result).toBe(model[op.index]);
        } else {
          expect(step.error).toBe('IndexError: Index out of range');
        }
        expect(step.n).toBe(model.length);
        expect(step.capacity).toBe(capacity);
        // The live elements first, then cleared slots: nothing is kept alive past n.
        expect(step.slots).toEqual([...model, ...new Array<null>(capacity - model.length).fill(null)]);
        expect(model.length === 0 || 4 * model.length > capacity).toBe(true);
      });
      expectWellFormed(run.frames);
      expect(run.frames.length).toBeLessThan(2000);
      // The last frame shows exactly the final array in block A.
      const last = run.frames[run.frames.length - 1].state;
      expect(last.blocks).toEqual([expect.objectContaining({ label: 'A', capacity })]);
      const shown = last.values.filter((v) => v.row === 0 && !v.ghost).sort((a, b) => a.col - b.col);
      expect(shown.map((v) => v.value)).toEqual(model);
      expect(shown.map((v) => v.col)).toEqual(model.map((_, i) => i));
    }
  });

  it('matches the Python DynamicArray (golden fixtures): n, capacity, every slot and every result', () => {
    const cases = (fixtures as unknown as { dynamic_array: Array<{ ops: Array<[string, number?]>; steps: unknown[] }> }).dynamic_array;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const ops = c.ops.map(([kind, arg]): ArrayOp => (kind === 'append' ? { kind, value: arg! } : kind === 'pop' ? { kind: 'pop' } : { kind: 'get', index: arg! }));
      const run = traceDynamicArray(ops);
      expect(run.steps.map(({ n, capacity, slots, result, error }) => ({ n, capacity, slots, result, error }))).toEqual(c.steps);
    }
  });

  it('copies every element on a resize, gliding into the new block', () => {
    const run = traceDynamicArray(parseArrayOps('append 1 2 3, append 4, append 5'));
    const copies = run.frames.filter((f) => f.line === 14);
    expect(copies.length).toBe(1 + 2 + 4);
    // During a copy the moved value sits in row 1 (block B) and a faded stale copy stays in A.
    const third = copies[copies.length - 1].state;
    expect(third.blocks.map((b) => [b.label, b.capacity])).toEqual([
      ['A', 4],
      ['B', 8],
    ]);
    expect(third.values.filter((v) => v.row === 1).map((v) => v.value)).toEqual([1, 2, 3, 4]);
    expect(third.values.filter((v) => v.row === 0 && v.role === 'muted').length).toBe(4);
    expect(run.steps[4]).toMatchObject({ n: 5, capacity: 8 });
  });

  it('shows each return value from its own step on, not before', () => {
    const run = traceDynamicArray(parseArrayOps('append 1 2, pop, pop, pop'));
    const returned = run.frames.map((f) => f.state.strips?.find((s) => s.label === 'Returned')?.items.map((i) => i.text) ?? []);
    const firstPop = run.frames.findIndex((f) => f.line === 6);
    expect(returned[firstPop]).toEqual([]);
    expect(returned[returned.length - 1]).toEqual(['2', '1', 'IndexError']);
    for (let i = 1; i < returned.length; i++) expect(returned[i].length).toBeGreaterThanOrEqual(returned[i - 1].length);
  });

  it('runs every example and keeps one extent per run', () => {
    for (const ex of dynamicArray.examples) {
      const frames = dynamicArray.trace(dynamicArray.parse(ex.value));
      expectWellFormed(frames);
      expect(new Set(frames.map((f) => JSON.stringify(f.state.extent))).size).toBe(1);
    }
    const big = dynamicArray.parse(`append ${Array.from({ length: 16 }, (_, i) => i).join(' ')}, pop x16, append 1 2 3 4 5 6 7 8`);
    expect(big.length).toBe(40);
    expect(traceDynamicArray(big).frames.length).toBeLessThan(2000);
  });
});

describe('parseArrayOps', () => {
  it('reads appends of several values, repeated pops and both index forms', () => {
    const ops = parseArrayOps('append 1 2, a 3, pop x2, p, get 0, a[1], [-1], pop()');
    expect(ops.map(formatArrayOp)).toEqual(['append(1)', 'append(2)', 'append(3)', 'pop()', 'pop()', 'pop()', 'a[0]', 'a[1]', 'a[-1]', 'pop()']);
  });

  it('gives friendly errors', () => {
    expect(() => parseArrayOps('')).toThrow(InputError);
    expect(() => parseArrayOps('append')).toThrow(/needs a value/);
    expect(() => parseArrayOps('append x')).toThrow(/whole number/);
    expect(() => parseArrayOps('pop 3')).toThrow(/pop x3/);
    expect(() => parseArrayOps('insert 1 5')).toThrow(/Cannot read/);
    expect(() => parseArrayOps(`append ${Array.from({ length: 17 }, (_, i) => i).join(' ')}`)).toThrow(/At most 16 elements/);
  });
});
