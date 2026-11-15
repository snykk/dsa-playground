import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { SegmentTreeState } from '../renderers/SegmentTreeView';
import { parseSqrt, SQRT_CODE, sqrtTrace, type SqrtOp, type SqrtRead } from './sqrtDecomposition';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/specializedTechniques.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function expectWellFormed(frames: Array<Frame<SegmentTreeState>>) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(SQRT_CODE.length);
    }
    const ids = f.state.blocks.map((b) => b.id);
    expect(new Set(ids).size, f.caption).toBe(ids.length);
    for (const b of f.state.blocks) {
      expect(b.row).toBeLessThan(f.state.rows);
      expect(b.lo).toBeLessThanOrEqual(b.hi);
      expect(b.hi).toBeLessThan(f.state.columns);
    }
    for (const m of f.state.markers ?? []) expect(m.row).toBeLessThan(f.state.rows);
  }
}

const toOp = (op: [string, number, number]): SqrtOp => (op[0] === 'query' ? { kind: 'query', left: op[1], right: op[2] } : { kind: 'update', index: op[1], value: op[2] });

describe('sqrtTrace matches square_root_decomposition.py (golden fixtures)', () => {
  const cases = fixtures.sqrtDecomposition as Array<{
    arr: number[];
    ops: Array<[string, number, number]>;
    blockSize: number;
    blockCount: number;
    blocks: number[];
    steps: Array<{ result?: number | null; error?: string; arr: number[]; blocks: number[]; reads?: SqrtRead[] }>;
  }>;

  it('has enough cases, including the empty array and reads past the end', () => {
    expect(cases.length).toBeGreaterThanOrEqual(40);
    expect(cases.some((c) => c.arr.length === 0)).toBe(true);
    expect(cases.some((c) => c.steps.some((s) => s.error === 'IndexError'))).toBe(true);
  });

  it('block size, block sums, every result or IndexError, the state after it and the reads of a query', () => {
    for (const c of cases) {
      const run = sqrtTrace({ arr: c.arr, ops: c.ops.map(toOp) });
      expect(run.blockSize, JSON.stringify(c.arr)).toBe(c.blockSize);
      expect(run.blockCount).toBe(c.blockCount);
      expect(run.build).toEqual(c.blocks);
      expect(run.steps.length).toBe(c.steps.length);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `${JSON.stringify(c.arr)} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        if (want.error) expect(got.error, where).toBe(want.error);
        else expect(got.result, where).toEqual(want.result);
        expect(got.arr, where).toEqual(want.arr);
        expect(got.blocks, where).toEqual(want.blocks);
        if (want.reads) expect(got.reads, where).toEqual(want.reads);
      });
    }
  });
});

describe('sqrtTrace against a plain array', () => {
  it('agrees with brute force on random scripts, and the blocks always hold their sums', () => {
    const rand = rng(41);
    for (let t = 0; t < 200; t++) {
      const n = Math.floor(rand() * 21);
      const arr = Array.from({ length: n }, () => Math.floor(rand() * 60) - 20);
      const ops: SqrtOp[] = [];
      for (let k = 0; k < 1 + Math.floor(rand() * 10); k++) {
        const r = rand();
        const span = n + 3;
        if (r < 0.55) {
          const left = Math.floor(rand() * span);
          ops.push({ kind: 'query', left, right: left + Math.floor(rand() * (span - left)) });
        } else ops.push({ kind: 'update', index: Math.floor(rand() * span), value: Math.floor(rand() * 60) - 20 });
      }
      const run = sqrtTrace({ arr, ops });
      const model = [...arr];
      const B = Math.max(1, Math.ceil(Math.sqrt(n)));
      ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'update') {
          if (op.index >= n) expect(step.error).toBe('IndexError');
          else {
            model[op.index] = op.value;
            expect(step.result).toBeNull();
          }
        } else if (op.right >= n) {
          expect(step.error).toBe('IndexError');
        } else {
          expect(step.result).toBe(model.slice(op.left, op.right + 1).reduce((s, v) => s + v, 0));
          // The reads cover [left, right] exactly once: cells one by one, blocks whole.
          const covered: number[] = [];
          for (const [kind, x] of step.reads!) {
            if (kind === 'a') covered.push(x);
            else for (let j = x * B; j < Math.min(n, (x + 1) * B); j++) covered.push(j);
          }
          expect(covered).toEqual(Array.from({ length: op.right - op.left + 1 }, (_, j) => op.left + j));
          // At most two partial blocks of fewer than B cells each, plus the whole blocks.
          const cells = step.reads!.filter((r) => r[0] === 'a').length;
          if (Math.floor(op.left / B) !== Math.floor(op.right / B)) expect(cells).toBeLessThanOrEqual(2 * B);
        }
        expect(step.arr).toEqual(model);
        expect(step.blocks).toEqual(Array.from({ length: Math.ceil(n / B) }, (_, b) => model.slice(b * B, (b + 1) * B).reduce((s, v) => s + v, 0)));
      });
      expectWellFormed(run.frames);
    }
  });

  it('keeps one picture size for the whole run', () => {
    const run = sqrtTrace(parseSqrt('[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; query 2 7, update 5 20, query 0 12, update 11 3'));
    expect(new Set(run.frames.map((f) => `${f.state.columns}x${f.state.rows}`)).size).toBe(1);
  });
});

describe('sqrtTrace scenarios', () => {
  it('the Python demo: block size 4, sums [10, 26, 19], 33 then 47', () => {
    const run = sqrtTrace(parseSqrt('[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; query 2 7, update 5 20, query 2 7'));
    expect(run.blockSize).toBe(4);
    expect(run.build).toEqual([10, 26, 19]);
    expect(run.steps.map((s) => s.result)).toEqual([33, null, 47]);
    expect(run.steps[1].blocks).toEqual([10, 40, 19]);
  });

  it('an update sends its change from the cell up to the block: the pill glides', () => {
    const run = sqrtTrace(parseSqrt('[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; update 5 20'));
    const flying = run.frames.filter((f) => f.state.markers?.some((m) => m.name === '+14'));
    expect(flying.map((f) => [f.state.markers![0].name, f.state.markers![0].row, f.state.markers![0].lo, f.state.markers![0].hi])).toEqual([
      ['+14', 1, 5, 5],
      ['+14', 0, 4, 7],
    ]);
  });

  it('a query uses whole blocks between two partial ones', () => {
    const run = sqrtTrace(parseSqrt('[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3]; query 1 14'));
    expect(run.steps[0].reads).toEqual([['a', 1], ['a', 2], ['a', 3], ['b', 1], ['b', 2], ['a', 12], ['a', 13], ['a', 14]]);
    expect(run.steps[0].result).toBe(74); // 80 in total, minus arr[0] = 3 and arr[15] = 3
    const blockFrames = run.frames.filter((f) => f.line === 10);
    expect(blockFrames.map((f) => f.state.markers![0].lo)).toEqual([4, 8]);
  });

  it('an empty array gets block size 1, and reading past the end raises IndexError without writing', () => {
    const run = sqrtTrace(parseSqrt('[]; query 0 0, update 0 5'));
    expect([run.blockSize, run.blockCount]).toEqual([1, 0]);
    expect(run.steps.map((s) => s.error)).toEqual(['IndexError', 'IndexError']);
    const run2 = sqrtTrace(parseSqrt('[1, 2, 3, 4, 5]; query 2 5, update 7 1, update 5 0, query 0 4'));
    expect(run2.steps.map((s) => s.error ?? s.result)).toEqual(['IndexError', 'IndexError', 'IndexError', 15]);
    expect(run2.steps[0].reads).toEqual([['a', 2], ['a', 3], ['a', 4], ['a', 5]]);
    expect(run2.frames.filter((f) => f.caption.includes('IndexError')).length).toBe(3);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const arr = Array.from({ length: 20 }, (_, i) => i - 5);
    const ops = Array.from({ length: 12 }, (_, i) => (i % 2 ? 'update 19 7' : 'query 0 19'));
    const run = sqrtTrace(parseSqrt(`[${arr.join(', ')}]; ${ops.join(', ')}`));
    expect(run.frames.length).toBeLessThan(400);
  });
});

describe('parseSqrt', () => {
  it('reads the array, the operations and their short forms', () => {
    expect(parseSqrt('[1, 2, 3]; q 0 2, u 1 5, sum 1 1')).toEqual({
      arr: [1, 2, 3],
      ops: [
        { kind: 'query', left: 0, right: 2 },
        { kind: 'update', index: 1, value: 5 },
        { kind: 'query', left: 1, right: 1 },
      ],
    });
    expect(parseSqrt('[]').arr).toEqual([]);
  });

  it('gives friendly errors', () => {
    expect(() => parseSqrt('[1, 2]; query 1')).toThrow(InputError);
    expect(() => parseSqrt('[1, 2]; query 1 0')).toThrow(/greater than right/);
    expect(() => parseSqrt('[1, 2]; update -1 4')).toThrow(/start at 0/);
    expect(() => parseSqrt('[1, 2]; delete 1')).toThrow(/Unknown operation/);
    expect(() => parseSqrt(`[${Array.from({ length: 21 }, () => 1).join(', ')}]`)).toThrow(/At most 20/);
    expect(() => parseSqrt(`[1]; ${Array.from({ length: 13 }, () => 'query 0 0').join(', ')}`)).toThrow(/At most 12/);
  });
});
