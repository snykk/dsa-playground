import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { SegmentTreeState } from '../renderers/SegmentTreeView';
import { parseArrayScript, parseSegment, SEG_CODE, segSpan, segTrace, type SegOp } from './segmentTree';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/rangeQueries.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Every frame: a caption, a line in range, unique block ids inside the picture, unique markers (one assertion per frame). */
function expectWellFormedSeg(frames: Array<Frame<SegmentTreeState>>, codeLines: number) {
  for (const f of frames) {
    const s = f.state;
    const problems: string[] = [];
    if (f.caption.length <= 10) problems.push('short caption');
    if (f.line !== undefined && !(f.line >= 0 && f.line < codeLines)) problems.push(`line ${f.line}`);
    if (new Set(s.blocks.map((b) => b.id)).size !== s.blocks.length) problems.push('duplicate block ids');
    for (const b of s.blocks) if (!(b.lo >= 0 && b.hi < s.columns && b.lo <= b.hi && b.row >= 0 && b.row < s.rows)) problems.push(`block ${b.id} outside the picture`);
    const names = (s.markers ?? []).map((m) => m.name);
    if (new Set(names).size !== names.length) problems.push('duplicate markers');
    for (const m of s.markers ?? []) if (m.row >= s.rows) problems.push(`marker ${m.name} below the tree`);
    const flyers = (s.flyers ?? []).map((m) => m.id);
    if (new Set(flyers).size !== flyers.length) problems.push('duplicate flyers');
    expect(problems, f.caption).toEqual([]);
  }
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function randomOps(rand: () => number, n: number, count: number): SegOp[] {
  const ops: SegOp[] = [];
  const idx = () => (rand() < 0.1 ? [-1, n, -3][Math.floor(rand() * 3)] : Math.floor(rand() * Math.max(n, 1)));
  for (let k = 0; k < count; k++) {
    const r = rand();
    if (r < 0.45) {
      const a = idx();
      const b = rand() < 0.1 ? a - 1 : idx();
      ops.push({ kind: 'query', left: rand() < 0.9 ? Math.min(a, b) : a, right: rand() < 0.9 ? Math.max(a, b) : b });
    } else if (r < 0.85) ops.push({ kind: 'update', index: idx(), value: Math.floor(rand() * 199) - 99 });
    else ops.push({ kind: 'get', index: idx() });
  }
  return ops;
}

describe('segTrace (bottom-up segment tree)', () => {
  it('agrees with a plain array on random scripts, and every parent is the sum of its children', { timeout: 30000 }, () => {
    const rand = rng(17);
    for (let t = 0; t < 160; t++) {
      const n = Math.floor(rand() * 17);
      const arr = Array.from({ length: n }, () => Math.floor(rand() * 199) - 99);
      const ops = randomOps(rand, n, 1 + Math.floor(rand() * 12));
      const run = segTrace({ arr, ops });
      const model = [...arr];
      const size = run.size;
      expect(size).toBeGreaterThanOrEqual(Math.max(n, 1));
      expect(size & (size - 1)).toBe(0);
      ops.forEach((op, i) => {
        const step = run.steps[i];
        const valid = (j: number) => j >= 0 && j < n;
        if (op.kind === 'get') {
          if (!valid(op.index)) expect(step.error).toBe('IndexError');
          else expect(step.result).toBe(model[op.index]);
        } else if (op.kind === 'update') {
          if (!valid(op.index)) expect(step.error).toBe('IndexError');
          else {
            model[op.index] = op.value;
            expect(step.result).toBeNull();
          }
        } else if (!valid(op.left) || !valid(op.right) || op.left > op.right) {
          expect(step.error).toBe('IndexError');
        } else {
          expect(step.result).toBe(sum(model.slice(op.left, op.right + 1)));
          // At most two blocks per level, and the blocks taken tile the range exactly.
          expect(step.reads!.length).toBeLessThanOrEqual(2 * Math.log2(size) + 2);
          const cols = step.reads!.flatMap((p) => {
            const s = segSpan(p, size);
            return Array.from({ length: s.hi - s.lo + 1 }, (_, c) => s.lo + c);
          });
          expect(cols.sort((a, b) => a - b)).toEqual(Array.from({ length: op.right - op.left + 1 }, (_, c) => op.left + c));
        }
        const tree = step.tree;
        expect(tree.length).toBe(2 * size);
        expect(tree.slice(size)).toEqual(Array.from({ length: size }, (_, j) => (j < n ? model[j] : 0)));
        expect(Array.from({ length: size - 1 }, (_, p) => tree[p + 1] - tree[2 * p + 2] - tree[2 * p + 3]).every((d) => d === 0)).toBe(true);
      });
      expectWellFormedSeg(run.frames, SEG_CODE.length);
    }
  });

  it('matches the Python SegmentTree (golden fixtures)', () => {
    const cases = fixtures.segmentTree as Array<{ arr: number[]; size: number; build: number[]; ops: Array<[string, number, number?]>; steps: Array<{ result?: number | null; error?: string; tree: number[]; reads?: number[] }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const ops = c.ops.map((o): SegOp => (o[0] === 'query' ? { kind: 'query', left: o[1], right: o[2]! } : o[0] === 'update' ? { kind: 'update', index: o[1], value: o[2]! } : { kind: 'get', index: o[1] }));
      const run = segTrace({ arr: c.arr, ops });
      expect(run.size).toBe(c.size);
      expect(run.build).toEqual(c.build);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `${JSON.stringify(c.arr)} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        if (want.error) expect(got.error, where).toBe(want.error);
        else {
          expect(got.error, where).toBeUndefined();
          expect(got.result, where).toBe(want.result);
        }
        expect(got.tree, where).toEqual(want.tree);
        if (want.reads) expect(got.reads, where).toEqual(want.reads);
      });
    }
  });

  it('query(1, 4) on [1, 3, 5, 7, 9, 11] adds leaf 9, leaf 12 and node 5 (the README trace)', () => {
    const run = segTrace(parseSegment('[1, 3, 5, 7, 9, 11]; query 1 4, update 2 10'));
    expect(run.size).toBe(8);
    expect(run.build.slice(1, 8)).toEqual([36, 16, 20, 4, 12, 20, 0]);
    expect(run.steps[0]).toMatchObject({ result: 24, reads: [9, 12, 5] });
    expect(run.steps[1].tree.slice(1, 8)).toEqual([41, 21, 20, 4, 17, 20, 0]);
    // The pointers glide: l starts on leaf 9 and is on node 5 one level up.
    const start = run.frames.findIndex((f) => f.caption.startsWith('query(1, 4): both'));
    const l0 = run.frames[start].state.markers!.find((m) => m.name === 'l')!;
    expect([l0.row, l0.lo, l0.hi]).toEqual([3, 1, 1]);
    const up = run.frames.slice(start).find((f) => f.caption.startsWith('left //= 2 -> 5'))!;
    const l1 = up.state.markers!.find((m) => m.name === 'l')!;
    expect([l1.row, l1.lo, l1.hi]).toEqual([2, 2, 3]);
    // The update climbs 10, 5, 2, 1.
    const climb = run.frames.filter((f) => f.line === 6 && f.caption.startsWith('index //= 2 ->') && !f.caption.includes('-> 0'));
    expect(climb.map((f) => f.state.markers![0].lo)).toEqual([2, 0, 0]);
  });

  it('raises IndexError on bad indices and on left > right, in a frame of its own', () => {
    const run = segTrace(parseSegment('[1, 3, 5, 7, 9, 11]; get -1, query 0 6, query 3 2, update 6 1, query 2 3'));
    expect(run.steps.map((s) => s.error ?? s.result)).toEqual(['IndexError', 'IndexError', 'IndexError', 'IndexError', 12]);
    const errors = run.frames.filter((f) => f.caption.includes('raises IndexError'));
    expect(errors).toHaveLength(4);
    expect(errors[0].caption).toContain('tree[7] would read an internal node');
    expect(segTrace(parseSegment('[]; query 0 0')).steps[0].error).toBe('IndexError');
  });

  it('stays well under 2000 frames on the largest input', () => {
    const arr = Array.from({ length: 16 }, (_, i) => i - 8).join(' ');
    const ops = Array.from({ length: 12 }, (_, i) => (i % 2 ? `query 0 15` : `update ${i} 7`)).join(', ');
    expect(segTrace(parseSegment(`${arr}; ${ops}`)).frames.length).toBeLessThan(400);
  });
});

describe('parseSegment and parseArrayScript', () => {
  it('reads the array, the operations and their short forms', () => {
    expect(parseSegment('arr = [1, -2, 3]; q 0 2, u 1 5, set(2, 9), g 1, query(0, 1)')).toEqual({
      arr: [1, -2, 3],
      ops: [
        { kind: 'query', left: 0, right: 2 },
        { kind: 'update', index: 1, value: 5 },
        { kind: 'update', index: 2, value: 9 },
        { kind: 'get', index: 1 },
        { kind: 'query', left: 0, right: 1 },
      ],
    });
    expect(parseSegment('4 5 6').ops).toEqual([]);
    expect(parseArrayScript('[]\nquery 0 0', { maxLen: 4, lo: 0, hi: 9, example: 'x' })).toEqual({ values: [], calls: [{ name: 'query', args: [0, 0], text: 'query 0 0' }] });
  });

  it('gives friendly errors', () => {
    expect(() => parseSegment('1 2 x')).toThrow(InputError);
    expect(() => parseSegment(Array.from({ length: 17 }, () => '1').join(' '))).toThrow(/16 array values/);
    expect(() => parseSegment('1 2 300')).toThrow(/-99 to 99/);
    expect(() => parseSegment('1 2; add 1 2')).toThrow(/Unknown operation/);
    expect(() => parseSegment('1 2; query 1')).toThrow(/two indices/);
    expect(() => parseSegment('1 2; update 1 500')).toThrow(/-99 to 99/);
    expect(() => parseSegment(`1 2; ${Array.from({ length: 13 }, () => 'get 0').join(', ')}`)).toThrow(/12 operations/);
  });
});
