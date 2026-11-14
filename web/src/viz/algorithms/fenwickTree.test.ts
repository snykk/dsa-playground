import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Frame } from '../core/types';
import type { SegmentTreeState } from '../renderers/SegmentTreeView';
import { FEN_CODE, fenwickTrace, lowbit, parseFenwick, type FenOp } from './fenwickTree';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/rangeQueries.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Every frame: a caption, a line in range, cells inside the picture, the pointer on a cell (one assertion per frame). */
function expectWellFormed(frames: Array<Frame<SegmentTreeState>>) {
  for (const f of frames) {
    const s = f.state;
    const problems: string[] = [];
    if (f.caption.length <= 10) problems.push('short caption');
    if (f.line !== undefined && !(f.line >= 0 && f.line < FEN_CODE.length)) problems.push(`line ${f.line}`);
    if (new Set(s.blocks.map((b) => b.id)).size !== s.blocks.length) problems.push('duplicate block ids');
    for (const b of s.blocks) if (!(b.lo >= 0 && b.hi < s.columns && b.row < s.rows)) problems.push(`block ${b.id} outside the picture`);
    // The pointer i always sits under a cell; a bad index is pointed at in red under its column.
    for (const m of s.markers ?? []) {
      if (m.name === 'i' ? !s.blocks.some((b) => b.row === m.row && b.lo === m.lo && b.hi === m.hi) : m.role !== 'bad' || m.row !== s.rows - 1) problems.push(`marker ${m.name}`);
    }
    expect(problems, f.caption).toEqual([]);
  }
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function randomOps(rand: () => number, n: number, count: number): FenOp[] {
  const idx = () => (rand() < 0.1 ? [-1, n, -2][Math.floor(rand() * 3)] : Math.floor(rand() * Math.max(n, 1)));
  return Array.from({ length: count }, (): FenOp => {
    const r = rand();
    if (r < 0.35) return { kind: 'update', index: idx(), delta: Math.floor(rand() * 101) - 50 };
    if (r < 0.6) return { kind: 'prefix', index: idx() };
    if (r < 0.85) {
      const a = idx();
      const b = idx();
      return rand() < 0.9 ? { kind: 'query', left: Math.min(a, b), right: Math.max(a, b) } : { kind: 'query', left: a, right: b };
    }
    return { kind: 'get', index: idx() };
  });
}

describe('fenwickTrace', () => {
  it('agrees with a plain array on random scripts, and every cell holds the sum of its block', { timeout: 30000 }, () => {
    const rand = rng(29);
    for (let t = 0; t < 160; t++) {
      const n = Math.floor(rand() * 17);
      const arr = Array.from({ length: n }, () => Math.floor(rand() * 199) - 99);
      const ops = randomOps(rand, n, 1 + Math.floor(rand() * 12));
      const run = fenwickTrace({ arr, ops });
      const model = [...arr];
      const valid = (i: number) => i >= 0 && i < n;
      ops.forEach((op, k) => {
        const step = run.steps[k];
        if (op.kind === 'update') {
          if (!valid(op.index)) expect(step.error).toBe('IndexError');
          else {
            model[op.index] += op.delta;
            // The climb touches exactly the cells whose block contains the position.
            const want = Array.from({ length: n }, (_, c) => c + 1).filter((i) => i - lowbit(i) <= op.index && op.index <= i - 1);
            expect(step.touched).toEqual(want);
          }
        } else if (op.kind === 'prefix') {
          if (!valid(op.index)) expect(step.error).toBe('IndexError');
          else expect(step.result).toBe(sum(model.slice(0, op.index + 1)));
        } else {
          const [l, r] = op.kind === 'get' ? [op.index, op.index] : [op.left, op.right];
          if (!valid(l) || !valid(r) || l > r) expect(step.error).toBe('IndexError');
          else expect(step.result).toBe(sum(model.slice(l, r + 1)));
        }
        expect(step.tree).toEqual([0, ...Array.from({ length: n }, (_, c) => sum(model.slice(c + 1 - lowbit(c + 1), c + 1)))]);
      });
      expectWellFormed(run.frames);
    }
  });

  it('matches the Python FenwickTree (golden fixtures)', () => {
    type Case = { arr: number[]; build: number[]; ops: Array<[string, number, number?]>; steps: Array<{ result?: number | null; error?: string; tree: number[]; touched: number[] }> };
    const cases = fixtures.fenwick as Case[];
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const ops = c.ops.map(
        (o): FenOp => (o[0] === 'update' ? { kind: 'update', index: o[1], delta: o[2]! } : o[0] === 'query' ? { kind: 'query', left: o[1], right: o[2]! } : { kind: o[0] as 'prefix' | 'get', index: o[1] }),
      );
      const run = fenwickTrace({ arr: c.arr, ops });
      expect(run.build).toEqual(c.build);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `${JSON.stringify(c.arr)} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        if (want.error) expect(got.error, where).toBe(want.error);
        else expect(got.result, where).toBe(want.result);
        expect(got.tree, where).toEqual(want.tree);
        expect(got.touched, where).toEqual(want.touched);
      });
    }
  });

  it('descends 5 -> 4 for prefix_sum(4) and climbs 3 -> 4 for update(2, 5) (the README trace)', () => {
    const run = fenwickTrace(parseFenwick('[1, 3, 5, 7, 9, 11]; prefix 4, update 2 5, prefix 4'));
    expect(run.build).toEqual([0, 1, 4, 5, 16, 9, 20]);
    expect(run.steps[0]).toMatchObject({ result: 25, touched: [5, 4] });
    expect(run.steps[1]).toMatchObject({ touched: [3, 4], tree: [0, 1, 4, 10, 21, 9, 20] });
    expect(run.steps[2].result).toBe(30);
    // The marker glides from cell 3 (a one-element block) up to cell 4 (four elements).
    const steps = run.frames.filter((f) => f.caption.startsWith('tree[3] += 5: 5 -> 10') || f.caption.startsWith('tree[4] += 5: 16 -> 21'));
    expect(steps.map((f) => f.state.markers![0])).toEqual([
      { name: 'i', row: 2, lo: 2, hi: 2, role: 'active' },
      { name: 'i', row: 0, lo: 0, hi: 3, role: 'active' },
    ]);
    // Binary column labels underline the lowest set bit: 6 = 1[1]0.
    expect(run.frames[0].state.colLabels![5].bits).toEqual([{ text: '1' }, { text: '1', strong: true }, { text: '0' }]);
  });

  it('rejects index -1 (it used to loop forever) and left > right with IndexError', () => {
    const run = fenwickTrace(parseFenwick('[1, 3, 5]; update -1 5, prefix 3, query 2 1, get -1, query 0 2'));
    expect(run.steps.map((s) => s.error ?? s.result)).toEqual(['IndexError', 'IndexError', 'IndexError', 'IndexError', 9]);
    expect(run.frames.find((f) => f.caption.startsWith('update(-1, 5) raises'))!.caption).toContain('loop forever');
  });

  it('stays well under 2000 frames on the largest input', () => {
    const arr = Array.from({ length: 16 }, (_, i) => i * 3 - 20).join(' ');
    const ops = Array.from({ length: 12 }, (_, i) => (i % 2 ? `query 1 15` : `update 0 7`)).join(', ');
    expect(fenwickTrace(parseFenwick(`${arr}; ${ops}`)).frames.length).toBeLessThan(600);
  });

  it('parses names and gives friendly errors', () => {
    expect(parseFenwick('1 2; add 0 3, prefix_sum(1), p 0, q 0 1, g 1').ops.map((o) => o.kind)).toEqual(['update', 'prefix', 'prefix', 'query', 'get']);
    expect(() => parseFenwick('1 2; update 0')).toThrow(/index and a delta/);
    expect(() => parseFenwick('1 2; update 0 60')).toThrow(/-50 to 50/);
    expect(() => parseFenwick('1 2; set 0 1')).toThrow(/Unknown operation/);
  });
});
