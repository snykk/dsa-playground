import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeTree } from '../renderers/TreeView';
import { frameProblems } from './binaryTreesCommon';
import { INTERVAL_CODE, intervalTrace, parseInterval, type IntervalOp, type IvNested } from './intervalTree';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/binaryTrees.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const toOp = (op: [string, number, number?]): IntervalOp => (op[0] === 'point' ? { kind: 'point', point: op[1] } : { kind: op[0] as 'insert', low: op[1], high: op[2]! });
const inorder = (t: IvNested): Array<[number, number]> => (t ? [...inorder(t[3]), [t[0], t[1]], ...inorder(t[4])] : []);

/** BST on low (equal lows only on the right) and every max equal to the largest high below. */
function augmented(t: IvNested, lo = -Infinity, hi = Infinity): number {
  if (!t) return -Infinity;
  const [l, h, max, left, right] = t;
  expect(l >= lo && l < hi).toBe(true);
  const m = Math.max(h, augmented(left, lo, l), augmented(right, l, hi));
  expect(max).toBe(m);
  return m;
}

const key = (x: [number, number]) => `${x[0]},${x[1]}`;
const sortPairs = (xs: Array<[number, number]>) => [...xs].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

describe('intervalTrace', () => {
  it('agrees with a brute-force list on random scripts and keeps max correct after every operation', () => {
    const rand = rng(71);
    for (let t = 0; t < 200; t++) {
      const ops: IntervalOp[] = [];
      const live: Array<[number, number]> = [];
      for (let i = 0, n = 1 + Math.floor(rand() * 23); i < n; i++) {
        const low = Math.floor(rand() * 40);
        const high = Math.min(99, Math.max(0, low + Math.floor(rand() * 28) - 3));
        const r = rand();
        if (r < 0.45 && live.length < 10) {
          ops.push({ kind: 'insert', low, high });
          if (low <= high) live.push([low, high]);
        } else if (r < 0.6 && live.length) {
          const [a, b] = live[Math.floor(rand() * live.length)];
          ops.push({ kind: 'delete', low: a, high: b });
          live.splice(live.findIndex((x) => x[0] === a && x[1] === b), 1);
        } else if (r < 0.75) ops.push({ kind: 'overlap', low, high });
        else if (r < 0.9) ops.push({ kind: 'contained', low, high });
        else ops.push({ kind: 'point', point: low });
      }
      const run = intervalTrace(ops);
      expect(frameProblems(run.frames, INTERVAL_CODE.length)).toEqual([]);
      const model: Array<[number, number]> = [];
      ops.forEach((op, i) => {
        const step = run.steps[i];
        const lo = op.kind === 'point' ? op.point : op.low;
        const hi = op.kind === 'point' ? op.point : op.high;
        if (lo > hi) {
          expect(step.error).toBe('ValueError');
          return;
        }
        expect(step.error).toBeNull();
        if (op.kind === 'insert') model.push([lo, hi]);
        else if (op.kind === 'delete') {
          const at = model.findIndex((x) => x[0] === lo && x[1] === hi);
          if (at >= 0) model.splice(at, 1);
        } else {
          const want = model.filter(([a, b]) => (op.kind === 'contained' ? lo <= a && b <= hi : !(b < lo || hi < a)));
          expect(sortPairs(step.result!).map(key)).toEqual(sortPairs(want).map(key));
        }
        expect(sortPairs(inorder(step.tree)).map(key)).toEqual(sortPairs(model).map(key));
        augmented(step.tree);
      });
    }
  });

  it('matches the Python IntervalTree: every max, result order and ValueError (golden fixtures)', () => {
    const cases = fixtures.interval as Array<{ ops: Array<[string, number, number?]>; steps: Array<{ result: Array<[number, number]> | null; error: string | null; tree: IvNested }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = intervalTrace(c.ops.map(toOp));
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = JSON.stringify(c.ops.slice(0, i + 1));
        expect(got.result, where).toEqual(want.result);
        expect(got.error, where).toBe(want.error);
        expect(got.tree, where).toEqual(want.tree);
      });
    }
  });

  it('prunes the subtree whose max is below the query (the article example)', () => {
    const run = intervalTrace(parseInterval('insert 15 20, 10 30, 17 19, 5 20, 12 15, 30 40; overlap 22 26'));
    expect(run.steps[6].result).toEqual([[10, 30]]);
    const last = run.frames.filter((f) => f.caption.startsWith('Done: 1 interval'))[0];
    const muted = last.state.nodes.filter((n) => n.role === 'muted').map((n) => n.label);
    expect(muted).toEqual(['5,20']);
    expect(run.frames.some((f) => f.caption.includes('left.max 20 < 22'))).toBe(true);
  });

  it('a reversed interval raises ValueError in its own frame, and the script goes on', () => {
    const run = intervalTrace(parseInterval('insert 5 9, insert 9 3, overlap 6 7'));
    expect(run.steps.map((s) => s.error)).toEqual([null, 'ValueError', null]);
    const bad = run.frames.find((f) => f.caption.includes('raises ValueError'))!;
    expect(bad.state.nodes.some((n) => n.role === 'bad')).toBe(true);
    expect(run.steps[2].result).toEqual([[5, 9]]);
  });

  it('a two-child delete copies the successor up and recomputes max on the way back', () => {
    const run = intervalTrace(parseInterval('insert 15 20, 10 30, 17 19, 5 20, 12 15, 30 40; delete 10 30'));
    expect(run.steps[6].tree).toEqual([15, 20, 40, [12, 15, 20, [5, 20, 20, null, null], null], [17, 19, 40, null, [30, 40, 40, null, null]]]);
  });

  it('keeps one picture size and stays under 2000 frames on the largest input', () => {
    const ins = Array.from({ length: 10 }, (_, i) => `${i * 5} ${i * 5 + 30}`).join(', ');
    const text = `insert ${ins}; overlap 0 99, inside 0 99, point 30, overlap 40 45, delete 0 30, 5 35, 10 40, 15 45, 20 50, 25 55, 30 60, 35 65, 40 70, 45 75`;
    const frames = stabilizeTree(intervalTrace(parseInterval(text)).frames);
    expect(frames.length).toBeLessThan(2000);
    expect(new Set(frames.map((f) => JSON.stringify(f.state.extent))).size).toBe(1);
  });
});

describe('parseInterval', () => {
  it('reads verbs, pairs, brackets and repeated verbs', () => {
    expect(parseInterval('insert [15,20], 10 30; overlap 1 2, point 3 4; inside (0, 9); delete 10 30')).toEqual([
      { kind: 'insert', low: 15, high: 20 },
      { kind: 'insert', low: 10, high: 30 },
      { kind: 'overlap', low: 1, high: 2 },
      { kind: 'point', point: 3 },
      { kind: 'point', point: 4 },
      { kind: 'contained', low: 0, high: 9 },
      { kind: 'delete', low: 10, high: 30 },
    ]);
    expect(parseInterval('insert 9 3')).toEqual([{ kind: 'insert', low: 9, high: 3 }]);
  });
  it.each(['', 'insert 1', 'move 1 2', 'insert 1 200', 'insert a b', Array.from({ length: 11 }, (_, i) => `insert ${i} ${i}`).join(', ')])('rejects %j', (bad) =>
    expect(() => parseInterval(bad)).toThrow(InputError),
  );
});
