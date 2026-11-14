import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { BPLUS_CODE, BPLUS_LIMITS, bPlusTrace, parseBPlusTree, type BPDump, type BPOp } from './bPlusTree';
import { expectWellFormed, rng } from './multiwayTreesTestKit';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/multiwayTrees.json', import.meta.url), 'utf8'));

/**
 * Fill bounds, strictly increasing keys, separators that bound their subtrees (left < sep <= right),
 * k + 1 children, equal leaf depth. Returns the leaves left to right.
 */
function checkInvariants(tree: BPDump, t: number): Array<Array<[number, string]>> {
  const leaves: Array<Array<[number, string]>> = [];
  const walk = (node: BPDump, isRoot: boolean, lo: number | null, hi: number | null): number => {
    const keys = node[0] === 'L' ? node[1].map((p) => p[0]) : node[1];
    expect(keys.length).toBeLessThanOrEqual(2 * t - 1);
    if (!isRoot) expect(keys.length).toBeGreaterThanOrEqual(t - 1);
    else if (node[0] === 'I') expect(keys.length).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < keys.length; i++) expect(keys[i - 1]).toBeLessThan(keys[i]);
    for (const k of keys) {
      if (lo !== null) expect(k).toBeGreaterThanOrEqual(lo);
      if (hi !== null) expect(k).toBeLessThan(hi);
    }
    if (node[0] === 'L') {
      leaves.push(node[1]);
      return 0;
    }
    const children = node[2];
    expect(children.length).toBe(keys.length + 1);
    const depths = new Set(children.map((c, i) => walk(c, false, i === 0 ? lo : keys[i - 1], i === keys.length ? hi : keys[i])));
    expect(depths.size).toBe(1);
    return [...depths][0] + 1;
  };
  walk(tree, true, null, null);
  return leaves;
}

function randomOps(rand: () => number, count: number): BPOp[] {
  const pool = Array.from({ length: 6 + Math.floor(rand() * 30) }, () => Math.floor(rand() * 100));
  const live = new Set<number>();
  const ops: BPOp[] = [];
  for (let i = 0; i < count; i++) {
    const key = pool[Math.floor(rand() * pool.length)];
    const r = rand();
    if (r < 0.6 && (live.has(key) || live.size < BPLUS_LIMITS.maxKeys)) {
      ops.push({ kind: 'insert', key, value: 'abcdefghij'[i % 10] });
      live.add(key);
    } else if (r < 0.75) ops.push({ kind: 'search', key });
    else if (r < 0.95) {
      const lo = Math.floor(rand() * 110) - 5;
      ops.push({ kind: 'range', lo: Math.max(0, lo), hi: Math.max(0, lo + Math.floor(rand() * 60) - 10) });
    } else ops.push({ kind: 'traverse' });
  }
  return ops;
}

describe('bPlusTrace against a sorted map', () => {
  it('keeps the same pairs, the leaf chain and every B+ tree invariant after each operation', () => {
    const rand = rng(77);
    for (let trial = 0; trial < 150; trial++) {
      const t = 2 + Math.floor(rand() * 4);
      const ops = randomOps(rand, 1 + Math.floor(rand() * BPLUS_LIMITS.maxOps));
      const run = bPlusTrace({ t, ops });
      const model = new Map<number, string>();
      const sorted = () => [...model].sort((a, b) => a[0] - b[0]);
      ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'insert') model.set(op.key, op.value);
        else if (op.kind === 'search') expect(step.result).toBe(model.get(op.key) ?? null);
        else if (op.kind === 'range') expect(step.result).toEqual(sorted().filter(([k]) => op.lo <= k && k <= op.hi));
        else expect(step.result).toEqual(sorted());
        const leaves = checkInvariants(step.tree, t);
        expect(leaves.flat()).toEqual(sorted());
        // The `next` chain visits the leaves in tree order.
        expect(step.chain).toEqual(leaves.map((l) => l.map((p) => p[0])));
      });
      expectWellFormed(run.frames, BPLUS_CODE.length);
      for (const f of run.frames) expect(f.state.chain?.length).toBeGreaterThan(0);
    }
  });
});

describe('bPlusTrace matches b_plus_tree.py (golden fixtures)', () => {
  it('tree, leaf chain, results and every split after each operation', () => {
    const cases = fixtures.bPlusTree as Array<{ t: number; ops: unknown[][]; steps: Array<{ result: unknown; tree: BPDump; chain: number[][]; events: unknown[] }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(30);
    for (const c of cases) {
      const ops = c.ops.map((o): BPOp => {
        if (o[0] === 'insert') return { kind: 'insert', key: o[1] as number, value: o[2] as string };
        if (o[0] === 'search') return { kind: 'search', key: o[1] as number };
        if (o[0] === 'range') return { kind: 'range', lo: o[1] as number, hi: o[2] as number };
        return { kind: 'traverse' };
      });
      const run = bPlusTrace({ t: c.t, ops });
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `t=${c.t} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        expect(got.tree, where).toEqual(want.tree);
        expect(got.chain, where).toEqual(want.chain);
        expect(got.result, where).toEqual(want.result);
        expect(got.events, where).toEqual(want.events);
      });
    }
  });
});

describe('bPlusTrace scenarios', () => {
  it('a leaf split copies the first key of the new leaf up: it hovers, then joins the parent, and stays in the leaf', () => {
    const run = bPlusTrace(parseBPlusTree('1 2 3 4 5 6'));
    expect(run.steps[5].tree).toEqual([
      'I',
      [3],
      [
        ['L', [[1, 'a'], [2, 'b']]],
        ['L', [[3, 'c'], [4, 'd'], [5, 'e'], [6, 'f']]],
      ],
    ]);
    const hover = run.frames.findIndex((f) => (f.state.floating ?? []).some((fl) => fl.tag === 'copy'));
    const copy = run.frames[hover].state.floating!.find((fl) => fl.tag === 'copy')!;
    expect(copy.cell.label).toBe('3');
    const next = run.frames[hover + 1].state;
    const owner = next.nodes.find((n) => (n.keys ?? []).some((k) => k.id === copy.cell.id))!;
    expect(owner.id).toBe(next.root);
    // The leaf keeps its own 3, with its value.
    expect(next.nodes.some((n) => n.id !== next.root && (n.keys ?? []).some((k) => k.label === '3' && k.sub === 'c'))).toBe(true);
  });

  it('an internal split pushes the median up (the article example: 10..90 with t = 2, then 25..65)', () => {
    const run = bPlusTrace(parseBPlusTree('t 2; 10 20 30 40 50 60 70 80 90 25..65 ?50 ?55'));
    expect(run.steps[8].tree[0]).toBe('I');
    expect((run.steps[8].tree as ['I', number[], BPDump[]])[1]).toEqual([30, 50]);
    expect(run.steps[9].result).toEqual([
      [30, 'c'],
      [40, 'd'],
      [50, 'e'],
      [60, 'f'],
    ]);
    expect(run.steps.flatMap((s) => s.events).filter((e) => e[0] === 'innerSplit').length).toBeGreaterThan(0);
    expect(run.steps[10].result).toBe('e');
    expect(run.steps[11].result).toBeNull();
  });

  it('a duplicate key overwrites its value and leaves the shape alone', () => {
    const run = bPlusTrace(parseBPlusTree('t 2; 5 1 9 5=x 5=y ?5 5..5'));
    expect(run.steps[4].chain).toEqual(run.steps[2].chain);
    expect(run.steps[4].tree).toEqual(['L', [[1, 'b'], [5, 'y'], [9, 'c']]]);
    expect(run.steps[5].result).toBe('y');
    expect(run.steps[6].result).toEqual([[5, 'y']]);
  });

  it('stays under 2000 frames on the largest input', () => {
    for (const t of [2, 3, 5]) {
      const keys = Array.from({ length: BPLUS_LIMITS.maxKeys }, (_, i) => (i * 41) % 100);
      const text = `t ${t}; ${keys.join(' ')} 0..99 traverse ?41 ?40 3..70 traverse`;
      const run = bPlusTrace(parseBPlusTree(text));
      expect(run.steps.length).toBe(30);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });
});

describe('parseBPlusTree', () => {
  it('reads values, automatic values, ranges and words', () => {
    expect(parseBPlusTree('t 4; 5 7=zz +9 ?7 3..8 range 1 2 search 5 insert 6=q insert 8 traverse')).toEqual({
      t: 4,
      ops: [
        { kind: 'insert', key: 5, value: 'a' },
        { kind: 'insert', key: 7, value: 'zz' },
        { kind: 'insert', key: 9, value: 'c' },
        { kind: 'search', key: 7 },
        { kind: 'range', lo: 3, hi: 8 },
        { kind: 'range', lo: 1, hi: 2 },
        { kind: 'search', key: 5 },
        { kind: 'insert', key: 6, value: 'q' },
        { kind: 'insert', key: 8, value: 'e' },
        { kind: 'traverse' },
      ],
    });
    expect(parseBPlusTree('1').t).toBe(3);
  });

  it('gives friendly errors', () => {
    expect(() => parseBPlusTree('')).toThrow(InputError);
    expect(() => parseBPlusTree('-5')).toThrow(/no delete/);
    expect(() => parseBPlusTree('5=toolong')).toThrow(/1 to 3/);
    expect(() => parseBPlusTree('range 5')).toThrow(/two keys/);
    expect(() => parseBPlusTree('t 9; 1')).toThrow(/up to 5/);
    expect(() => parseBPlusTree(Array.from({ length: 25 }, (_, i) => String(i)).join(' '))).toThrow(/24 different keys/);
  });
});
