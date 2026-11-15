import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { DAG_CODE, dagBrute, dagLayout, dagTrace, formatDag, parseDag, type DagInput, type DagRun } from './graphDp';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedDp.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** The input the fixture describes: edges in order, then the bare keys, then the start. */
function inputOf(c: { edges: Array<[string, string]>; isolated: string[]; start: string }): DagInput {
  const text = [...c.edges.map(([a, b]) => `${a}->${b}`), ...c.isolated].join(', ');
  return parseDag(`${text}; start ${c.start}`);
}

function expectWellFormed(run: DagRun) {
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(DAG_CODE.length);
    }
    const ids = f.state.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of f.state.edges) expect(ids.includes(e.from) && ids.includes(e.to)).toBe(true);
    for (const n of f.state.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(20);
      expect(n.x).toBeLessThanOrEqual(580);
      expect(n.y).toBeGreaterThanOrEqual(20);
      expect(n.y).toBeLessThanOrEqual(360);
    }
  }
}

function randomGraph(rand: () => number): DagInput {
  const n = 1 + Math.floor(rand() * 9);
  const edges: string[] = [];
  const count = Math.floor(rand() * 15);
  for (let k = 0; k < count; k++) {
    let a = Math.floor(rand() * n);
    let b = Math.floor(rand() * n);
    if (a > b && rand() < 0.85) [a, b] = [b, a];
    if (a === b && rand() < 0.8) continue;
    edges.push(`${a}->${b}`);
  }
  return parseDag(`${edges.join(', ')}; start ${Math.floor(rand() * n)}`);
}

describe('dagTrace matches dag_longest_path (golden fixtures)', () => {
  it('calls and returns in the same order, and returns the same length or raises', () => {
    const cases = fixtures.dag as Array<{ edges: Array<[string, string]>; isolated: string[]; start: string; events: unknown[]; result?: number; error?: string }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = dagTrace(inputOf(c));
      const label = formatDag(inputOf(c));
      expect(run.events, label).toEqual(c.events);
      if (c.error !== undefined) {
        expect(run.result, label).toBeNull();
        expect(run.error).toBe(c.error);
      } else {
        expect(run.result, label).toBe(c.result);
      }
    }
  });
});

describe('dagTrace against brute force', () => {
  it('finds the longest path of every random graph, or the cycle a brute-force DFS finds', () => {
    const rand = rng(17);
    let cycles = 0;
    for (let t = 0; t < 200; t++) {
      const input = randomGraph(rand);
      const run = dagTrace(input);
      const want = dagBrute(input);
      expect(run.result, formatDag(input)).toBe(want);
      if (want === null) cycles++;
      expectWellFormed(run);
      // every node is expanded at most once: a call on a finished node is a memo hit
      const expanded = new Map<string, number>();
      const finished = new Set<string>();
      run.events.forEach((e, i) => {
        if (e[0] === 'ret') finished.add(e[1]);
        if (e[0] !== 'call' || finished.has(e[1])) return;
        const next = run.events[i + 1];
        if (next && next[0] === 'raise') return;
        expanded.set(e[1], (expanded.get(e[1]) ?? 0) + 1);
      });
      for (const [v, k] of expanded) expect(k, v).toBe(1);
      // the path read back at the end is a real path of that length
      if (run.result !== null) {
        const last = run.frames[run.frames.length - 1].state;
        const pathEdges = last.edges.filter((e) => e.role === 'done');
        expect(pathEdges).toHaveLength(run.result);
        expect(last.nodes.filter((n) => n.role === 'good')).toHaveLength(run.result + 1);
      }
    }
    expect(cycles).toBeGreaterThan(5);
  });
});

describe('dagTrace scenarios', () => {
  it('the article graph: 4 edges from 0, 2 from 3, 0 from 6', () => {
    const g = '0->1, 0->2, 0->3, 1->2, 1->4, 2->4, 2->5, 3->5, 4->6, 5->6';
    expect(dagTrace(parseDag(`${g}; start 0`)).result).toBe(4);
    expect(dagTrace(parseDag(`${g}; start 3`)).result).toBe(2);
    expect(dagTrace(parseDag(`${g}; start 6`)).result).toBe(0);
    const run = dagTrace(parseDag(`${g}; start 0`));
    expect(run.dp.map(([v]) => v)).toEqual(['6', '4', '5', '2', '1', '3', '0']);
    expect(run.frames.some((f) => f.line === 3 && /is finished/.test(f.caption))).toBe(true);
  });

  it('a cycle raises ValueError, a self-loop too, and an unreachable cycle is ignored', () => {
    const cyc = dagTrace(parseDag('0->1, 1->2, 2->0; start 0'));
    expect(cyc.result).toBeNull();
    expect(cyc.events[cyc.events.length - 1]).toEqual(['raise', '0']);
    const bad = cyc.frames.find((f) => f.line === 4)!;
    expect(bad.state.nodes.filter((n) => n.role === 'bad').map((n) => n.id)).toEqual(['0', '1', '2']);
    expect(dagTrace(parseDag('0->0; start 0')).error).toMatch(/cycle/);
    expect(dagTrace(parseDag('0->1, 5->6, 6->5; start 0')).result).toBe(1);
  });

  it('a start that is not a key is a sink: 0 edges', () => {
    const run = dagTrace(parseDag('; start 5'));
    expect(run.result).toBe(0);
    expect(run.frames[1].caption).toMatch(/not a key/);
  });

  it('lays a DAG out left to right: every edge points right', () => {
    const input = parseDag('0->1, 0->2, 0->3, 1->2, 1->4, 2->4, 2->5, 3->5, 4->6, 5->6; start 0');
    const pos = dagLayout(input);
    for (const [a, b] of input.edges) expect(pos.get(a)!.x).toBeLessThan(pos.get(b)!.x);
  });
});

describe('parseDag', () => {
  it('reads edges in order, bare keys and the start', () => {
    const g = parseDag('a->b, a->c, d; start a');
    expect(g.edges).toEqual([
      ['a', 'b'],
      ['a', 'c'],
    ]);
    expect(g.keys).toEqual(['a', 'd']);
    expect(g.nodes).toEqual(['a', 'b', 'c', 'd']);
    expect(parseDag('3->4').start).toBe('3');
    expect(parseDag('; start 5').nodes).toEqual(['5']);
  });

  it('gives friendly errors', () => {
    expect(() => parseDag('')).toThrow(InputError);
    expect(() => parseDag('0-1')).toThrow(/Cannot read/);
    expect(() => parseDag('0->1; begin 0')).toThrow(/start 0/);
    expect(() => parseDag(Array.from({ length: 11 }, (_, i) => `${i}->${i + 1}`).join(', '))).toThrow(/10 nodes/);
    expect(() => parseDag('abcd->b')).toThrow(/1 to 3/);
  });
});
