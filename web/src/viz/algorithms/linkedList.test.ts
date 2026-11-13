import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { ChainState } from '../renderers/ChainView';
import { circularLinkedList, doublyLinkedList, singlyLinkedList } from '../specs/linkedList';
import fixtures from './__fixtures__/lists.json';
import { formatListOp, parseListOps, traceLinkedList, type ListKind, type ListOp, type ListStep } from './linkedList';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const SPECS = { singly: singlyLinkedList, doubly: doublyLinkedList, circular: circularLinkedList };
const KINDS: ListKind[] = ['singly', 'doubly', 'circular'];

/** A random script over a few values, so duplicates and missing keys are common. */
function randomScript(rand: () => number, kind: ListKind): ListOp[] {
  const ops: ListOp[] = [];
  let size = 0;
  for (let k = 0, n = 1 + Math.floor(rand() * 16); k < n; k++) {
    const value = Math.floor(rand() * 6);
    const r = rand();
    if (r < 0.28 && size < 10) {
      ops.push({ kind: 'head', value });
      size++;
    } else if (r < 0.56 && size < 10) {
      ops.push({ kind: 'tail', value });
      size++;
    } else if (r < 0.84) {
      ops.push({ kind: 'delete', value });
      size = Math.max(0, size - 1); // an upper bound is enough to respect the node cap
    } else if (kind === 'doubly' && r < 0.92) ops.push({ kind: 'backward' });
    else ops.push(kind === 'circular' && r < 0.92 ? { kind: 'traverse', limit: 1 + Math.floor(rand() * 5) } : { kind: 'traverse' });
  }
  return ops;
}

/** What the Python method returns or prints, computed on a plain array. */
function modelResult(kind: ListKind, op: ListOp, list: number[]): ListStep['result'] {
  const printed = (vals: number[]) => `${vals.map((v) => `${v} -> `).join('')}None`;
  if (op.kind === 'traverse') {
    if (kind === 'doubly') return printed(list);
    if (kind === 'circular' && op.limit !== undefined) return list.slice(0, op.limit);
    return [...list];
  }
  if (op.kind === 'backward') return printed([...list].reverse());
  return null;
}

function applyModel(op: ListOp, list: number[]): boolean | null {
  if (op.kind === 'head') list.unshift(op.value);
  else if (op.kind === 'tail') list.push(op.value);
  else if (op.kind === 'delete') {
    const at = list.indexOf(op.value);
    if (at >= 0) list.splice(at, 1);
    return at >= 0;
  }
  return null;
}

/** Ids unique, links and references point at nodes of the frame, lines in range, captions present. */
function expectWellFormed(frames: Array<Frame<ChainState>>, pseudocodeLength: number) {
  // Plain checks first, one assertion per run: thousands of frames make per-item expects slow.
  const problems: string[] = [];
  frames.forEach((f, k) => {
    if (f.caption.length <= 10) problems.push(`${k}: short caption`);
    if (f.line !== undefined && (f.line < 0 || f.line >= pseudocodeLength)) problems.push(`${k}: line ${f.line}`);
    const ids = f.state.nodes.map((n) => n.id);
    const has = new Set(ids);
    if (has.size !== ids.length) problems.push(`${k}: duplicate node ids`);
    for (const l of f.state.links) if (!has.has(l.from) || (l.to !== null && !has.has(l.to))) problems.push(`${k}: link ${l.from} -> ${l.to}`);
    for (const p of f.state.pointers ?? []) if (p.target !== null && !has.has(p.target)) problems.push(`${k}: pointer ${p.name}`);
    const names = (f.state.pointers ?? []).map((p) => p.name);
    if (new Set(names).size !== names.length) problems.push(`${k}: duplicate pointer names`);
  });
  expect(problems).toEqual([]);
}

/** The values on the row of a frame, left to right (ghosts and lifted nodes excluded). */
function rowValues(f: Frame<ChainState>): number[] {
  return f.state.nodes
    .filter((n) => !n.ghost && (n.row ?? 0) === 0)
    .sort((a, b) => a.col - b.col)
    .map((n) => Number(n.label));
}

describe.each(KINDS)('%s linked list', (kind) => {
  const spec = SPECS[kind];

  it('agrees with an array model after every operation on random scripts', () => {
    const rand = rng(kind.length * 101 + 7);
    for (let t = 0; t < 150; t++) {
      const ops = randomScript(rand, kind);
      const run = traceLinkedList(kind, ops);
      const list: number[] = [];
      expect(run.steps.length).toBe(ops.length);
      ops.forEach((op, i) => {
        const want = modelResult(kind, op, list);
        const removed = applyModel(op, list);
        const step = run.steps[i];
        expect(step.values).toEqual(list);
        if (kind === 'doubly') {
          expect(step.backward).toEqual([...list].reverse());
          expect(step.result).toEqual(op.kind === 'delete' ? removed : want);
        } else {
          expect(step.result).toEqual(want);
        }
        if (kind === 'circular') expect(step.closed).toBe(true);
      });
      expectWellFormed(run.frames, spec.pseudocode.length);
      expect(run.frames.length).toBeLessThan(2000);
      // The last frame shows the final list, settled on the row.
      expect(rowValues(run.frames[run.frames.length - 1])).toEqual(list);
    }
  });

  it('runs every example, and the largest allowed script stays under 2000 frames', () => {
    for (const ex of spec.examples) {
      const frames = spec.trace(spec.parse(ex.value));
      expectWellFormed(frames, spec.pseudocode.length);
    }
    const big = `tail 1 2 3 4 5 6 7 8 9 10, ${Array.from({ length: 20 }, (_, i) => (i % 2 ? `tail ${50 + i}` : `delete ${10 - (i >> 1)}`)).join(', ')}`;
    const ops = parseListOps(big, kind);
    expect(ops.length).toBe(30);
    expect(traceLinkedList(kind, ops).frames.length).toBeLessThan(2000);
  });

  it('keeps the picture one size for the whole run', () => {
    const frames = spec.trace(spec.parse('head 1, tail 2, delete 1, delete 2'));
    const extents = frames.map((f) => JSON.stringify(f.state.extent));
    expect(new Set(extents).size).toBe(1);
  });

  it('lifts a new node off the row, then lets it settle', () => {
    const run = traceLinkedList(kind, parseListOps('tail 1, head 2', kind));
    const lifted = run.frames.filter((f) => f.state.nodes.some((n) => (n.row ?? 0) > 0 && !n.ghost));
    expect(lifted.length).toBeGreaterThan(2);
    const last = run.frames[run.frames.length - 1];
    expect(last.state.nodes.every((n) => (n.row ?? 0) === 0)).toBe(true);
  });

  it('lets a deleted node leave as a ghost', () => {
    const run = traceLinkedList(kind, parseListOps('tail 1 2 3, delete 2', kind));
    const ghosts = run.frames.filter((f) => f.state.nodes.some((n) => n.ghost));
    expect(ghosts.length).toBe(1);
    expect(ghosts[0].state.nodes.find((n) => n.ghost)?.label).toBe(2);
    expect(rowValues(ghosts[0])).toEqual([1, 3]);
  });
});

describe('circular linked list edge cases', () => {
  it('deleting the only node empties the list (the v0.2.0 bug)', () => {
    const run = traceLinkedList('circular', parseListOps('head 42, delete 42, tail 7', 'circular'));
    expect(run.steps[1].values).toEqual([]);
    expect(run.steps[2].values).toEqual([7]);
    const emptied = run.frames.find((f) => f.caption.startsWith('self.head = None'));
    expect(emptied?.state.pointers?.find((p) => p.name === 'head')?.target).toBeNull();
  });

  it('a single node points to itself, and a missing key leaves it', () => {
    const run = traceLinkedList('circular', parseListOps('head 5, delete 9', 'circular'));
    const last = run.frames[run.frames.length - 1];
    expect(last.state.links).toEqual([expect.objectContaining({ from: last.state.nodes[0].id, to: last.state.nodes[0].id })]);
    expect(run.steps[1].values).toEqual([5]);
  });

  it('traverse(limit) stops early, traverse() does one lap', () => {
    const run = traceLinkedList('circular', parseListOps('tail 1 2 3 4, traverse 2, traverse', 'circular'));
    expect(run.steps[4].result).toEqual([1, 2]);
    expect(run.steps[5].result).toEqual([1, 2, 3, 4]);
  });
});

describe('output strips', () => {
  it('fill one value per step instead of showing the final output on every frame', () => {
    const run = traceLinkedList('singly', parseListOps('tail 1 2 3, display', 'singly'));
    const sizes = run.frames.map((f) => f.state.strips?.find((s) => s.label === 'elems')?.items.length ?? -1).filter((n) => n >= 0);
    expect(sizes).toEqual([0, 1, 2, 3, 3]);
  });
});

describe('doubly linked list edge cases', () => {
  it('delete_value returns True or False and keeps both directions', () => {
    const run = traceLinkedList('doubly', parseListOps('tail 1 2 3 4, delete 2, delete 9, delete 1, delete 4, backward', 'doubly'));
    expect(run.steps.map((s) => s.result)).toEqual([null, null, null, null, true, false, true, true, '3 -> None']);
    expect(run.steps[4].backward).toEqual([4, 3, 1]);
  });
});

describe('parseListOps', () => {
  it('reads short forms, Python names and several values', () => {
    const ops = parseListOps('h 1, insert_at_tail(2), t 3 4, d 3, display', 'singly');
    expect(ops.map((op) => formatListOp('singly', op))).toEqual([
      'insert_at_head(1)',
      'insert_at_tail(2)',
      'insert_at_tail(3)',
      'insert_at_tail(4)',
      'delete(3)',
      'display()',
    ]);
    expect(parseListOps('forward, backward', 'doubly').map((op) => formatListOp('doubly', op))).toEqual(['traverse_forward()', 'traverse_backward()']);
    expect(parseListOps('traverse 3; traverse', 'circular').map((op) => formatListOp('circular', op))).toEqual(['traverse(3)', 'traverse()']);
  });

  it('gives friendly errors', () => {
    expect(() => parseListOps('', 'singly')).toThrow(InputError);
    expect(() => parseListOps('push 3', 'singly')).toThrow(/Cannot read/);
    expect(() => parseListOps('head', 'singly')).toThrow(/needs a value/);
    expect(() => parseListOps('head x', 'singly')).toThrow(/whole number/);
    expect(() => parseListOps('backward', 'singly')).toThrow(/only the doubly/);
    expect(() => parseListOps('display 3', 'singly')).toThrow(/takes no value/);
    expect(() => parseListOps('tail 1 2 3 4 5 6 7 8 9 10 11', 'singly')).toThrow(/At most 10 nodes/);
    expect(() => parseListOps('tail 1 2 3 4 5 6 7 8 9 10, delete 1, tail 11', 'singly')).not.toThrow();
  });
});

interface ListCase {
  ops: Array<[string, number?]>;
  steps: Array<{ values: number[]; backward?: number[]; closed?: boolean; result: number[] | boolean | string | null }>;
}

const toOp = ([name, arg]: [string, number?]): ListOp => {
  if (name === 'head' || name === 'tail' || name === 'delete') return { kind: name, value: arg as number };
  if (name === 'backward') return { kind: 'backward' };
  return arg === undefined ? { kind: 'traverse' } : { kind: 'traverse', limit: arg };
};

describe.each(KINDS)('golden fixtures: the Python %s list', (kind) => {
  it('matches the list, the walks and the return value after every operation', () => {
    const cases = (fixtures as unknown as Record<string, ListCase[]>)[kind];
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = traceLinkedList(kind, c.ops.map(toOp));
      expect(run.steps.length).toBe(c.steps.length);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        expect(got.values).toEqual(want.values);
        expect(got.result).toEqual(want.result);
        if (kind === 'doubly') expect(got.backward).toEqual(want.backward);
        if (kind === 'circular') expect(got.closed).toBe(want.closed);
      });
    }
  });
});
