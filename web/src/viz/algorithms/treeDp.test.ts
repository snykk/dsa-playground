import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { flatten, formatTree, misBrute, parseTree, pathBrute, TREE_CODE, treeDpTrace, type TreeDpMode, type TreeRun, type TreeSpec } from './treeDp';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedDp.json', import.meta.url), 'utf8'));
const num = (v: number | string) => (v === '-inf' ? -Infinity : v === 'inf' ? Infinity : (v as number));

type Nested = [number, Nested[]] | null;
const fromNested = (n: Nested): TreeSpec | null => (n === null ? null : { val: n[0], children: n[1].map((c) => fromNested(c)!) });

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function randomTree(rand: () => number): TreeSpec {
  const size = 1 + Math.floor(rand() * 14);
  const nodes: TreeSpec[] = [{ val: Math.floor(rand() * 41) - 15, children: [] }];
  for (let i = 1; i < size; i++) {
    const parent = nodes[Math.floor(rand() * nodes.length)];
    const child = { val: Math.floor(rand() * 41) - 15, children: [] };
    parent.children.push(child);
    nodes.push(child);
  }
  return nodes[0];
}

function expectWellFormed(run: TreeRun, mode: TreeDpMode) {
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(TREE_CODE[mode].length);
    }
    const ids = f.state.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const n of f.state.nodes) for (const c of n.children) expect(ids).toContain(c);
    for (const e of Object.keys(f.state.edges ?? {})) expect(ids).toContain(e);
  }
}

describe.each(['mis', 'path'] as const)('treeDpTrace (%s)', (mode) => {
  it('returns from dfs with the same values, in the same order, as tree_dp.py (golden fixtures)', () => {
    const cases = fixtures[mode === 'mis' ? 'treeMis' : 'treePath'] as Array<{ tree: Nested; calls: Array<Array<number | string | null>>; result: number | string }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = treeDpTrace({ root: fromNested(c.tree) }, mode);
      const label = formatTree(fromNested(c.tree));
      expect(
        run.calls.map((k) => [k.id, ...k.values]),
        label,
      ).toEqual(c.calls.map(([id, ...v]) => [id, ...v.map((x) => num(x as number | string))]));
      expect(run.result, label).toBe(num(c.result));
    }
  });

  it('agrees with brute force over every subset or every path on random trees', () => {
    const rand = rng(mode === 'mis' ? 3 : 4);
    for (let t = 0; t < 150; t++) {
      const root = randomTree(rand);
      const run = treeDpTrace({ root }, mode);
      expect(run.result, formatTree(root)).toBe(mode === 'mis' ? misBrute(root) : pathBrute(root));
      expectWellFormed(run, mode);
      // The answer read back at the end is a real independent set or path with that sum.
      const nodes = flatten(root);
      const last = run.frames[run.frames.length - 1].state;
      const chosen = last.nodes.filter((n) => n.role === 'good').map((n) => Number(n.id.slice(1)));
      const sum = chosen.reduce((s, id) => s + nodes[id].val, 0);
      if (mode === 'mis') {
        for (const id of chosen) expect(chosen.includes(nodes[id].parent ?? -1)).toBe(false);
        expect(sum).toBe(run.result);
      } else {
        expect(sum).toBe(run.result);
        // a path: connected, and no node has three chosen neighbours
        const deg = (id: number) => chosen.filter((o) => nodes[o].parent === id || nodes[id].parent === o).length;
        const tops = chosen.filter((id) => !chosen.includes(nodes[id].parent ?? -1));
        expect(tops).toHaveLength(1);
        for (const id of chosen) expect(deg(id)).toBeLessThanOrEqual(2);
      }
      // dfs runs once per node: post-order, every node once.
      expect(run.calls.map((c) => c.id).sort((a, b) => a! - b!)).toEqual(nodes.map((n) => n.id));
    }
  });
});

describe('treeDpTrace scenarios', () => {
  it('maximum independent set: the article tree gives 12 with (include, exclude) per node', () => {
    const run = treeDpTrace(parseTree('1(2(4, 5), 3)'), 'mis');
    expect(run.result).toBe(12);
    expect(run.calls).toEqual([
      { id: 2, values: [4, 0] },
      { id: 3, values: [5, 0] },
      { id: 1, values: [2, 9] },
      { id: 4, values: [3, 0] },
      { id: 0, values: [10, 12] },
    ]);
    const end = run.frames[run.frames.length - 1].state;
    expect(end.nodes.filter((n) => n.role === 'good').map((n) => n.tag)).toEqual(['C', 'D', 'E']);
  });

  it('maximum path sum uses at most two children (the audit bug) and drops negative chains', () => {
    expect(treeDpTrace(parseTree('1(2, 3, 4)'), 'path').result).toBe(8);
    expect(treeDpTrace(parseTree('1(-6, 2, 3)'), 'path').result).toBe(6);
    expect(treeDpTrace(parseTree('-3(-1, -2)'), 'path').result).toBe(-1);
    const spine = treeDpTrace(parseTree('10(20, 30(40))'), 'path');
    expect(spine.result).toBe(100);
    const root = spine.frames.filter((f) => f.line === 9).pop()!;
    expect(root.caption).toContain('10 + 70 + 20 = 100');
  });

  it('an empty tree gives 0 and -inf, as the Python code does', () => {
    expect(treeDpTrace(parseTree('None'), 'mis').result).toBe(0);
    expect(treeDpTrace(parseTree('None'), 'path').result).toBe(-Infinity);
  });

  it('a strictly larger gain moves best1 into best2; an equal one only fills best2', () => {
    const run = treeDpTrace(parseTree('0(5, 5, 7)'), 'path');
    expect(run.calls[3].values).toEqual([7, 7, 5, 12]); // chain 0 + 7, path 0 + 7 + 5
    const caps = run.frames.filter((f) => f.caption.startsWith('Back in A')).map((f) => f.caption);
    expect(caps[1]).toMatch(/best2 = 5/);
    expect(caps[2]).toMatch(/best1, best2 = 7, 5/);
  });
});

describe('parseTree', () => {
  it('reads nested values and the empty tree', () => {
    expect(formatTree(parseTree(' 1 ( 2 (4,5) , 3 ) ').root)).toBe('1(2(4, 5), 3)');
    expect(parseTree('None').root).toBeNull();
    expect(parseTree('7()').root).toEqual({ val: 7, children: [] });
    expect(parseTree('-3(-1)').root).toEqual({ val: -3, children: [{ val: -1, children: [] }] });
  });

  it('gives friendly errors', () => {
    expect(() => parseTree('')).toThrow(InputError);
    expect(() => parseTree('1(2')).toThrow(/"," or "\)"/);
    expect(() => parseTree('1(2) 3')).toThrow(/one root/);
    expect(() => parseTree('1(x)')).toThrow(/node value/);
    expect(() => parseTree('100')).toThrow(/-99 to 99/);
    expect(() => parseTree(`1(${Array.from({ length: 10 }, () => '1').join(', ')})`)).toThrow(/9 leaves/);
    expect(() => parseTree('1(1(1(1(1(1(1))))))')).toThrow(/6 levels/);
    expect(() => parseTree(`1(${Array.from({ length: 4 }, () => '1(1, 1, 1)').join(', ')})`)).toThrow(/15 nodes/);
  });
});
